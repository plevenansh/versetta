


import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { WorkOS } from '@workos-inc/node';
import { TRPCError } from '@trpc/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET_KEY!,
});

function verifyRazorpaySignature(paymentId: string, subscriptionId: string, razorpaySignature: string, keySecret: string): boolean {
  const payload = `${paymentId}|${subscriptionId}`;
  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(payload)
    .digest('hex');

  return generatedSignature === razorpaySignature;
}

export const teamRouter = router({
  getTeam: protectedProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      const team = await prisma.team.findUnique({
        where: { id: input },
        include: {
          members: {
            include: { user: true },
          },
          projects: true,
          tasks: true,
        },
      });

      if (!team) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' });
      }

      const isMember = team.members.some(member => member.userId === ctx.user.id);
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this team' });
      }

      return team;
    }),


  getUserTeams: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: {
          teamMemberships: {
            include: {
              team: {
                include: {
                  creator: true
                }
              }
            }
          }
        }
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      return user.teamMemberships.map(membership => membership.team);
    }),

  initiateTeamCreation: protectedProcedure
  .input(z.object({
    name: z.string(),
    description: z.string().optional(),
    subscriptionType: z.enum(['razorpay', 'polar', 'invite']),
  }))
  .mutation(async ({ input, ctx }) => {
    const user = ctx.user;
    console.log('user', user);

    const workOsOrg = await workos.organizations.createOrganization({
      name: input.name,
    });

    const team = await prisma.team.create({
      data: {
        name: input.name,
        description: input.description,
        creatorId: user.id,
        workOsOrgId: workOsOrg.id,
        subActive: input.subscriptionType === 'invite', // Set subActive based on subscription type
        members: {
          create: {
            userId: user.id,
            role: 'admin',
            access: 'ADMIN', // Add this line to set the access level
          },
        },
      },
    });

    if (input.subscriptionType === 'invite') {
      await prisma.subscription.create({
        data: {
          teamId: team.id,
          teamName: team.name,
          status: 'active',
          type: 'invite',
          creatorId: user.id,
          plan: 'free', // Add a plan field to your subscription creation
        },
      });
      return { teamId: team.id };
    } else {
      const subscription = await razorpay.subscriptions.create({
        plan_id: "plan_Otr2kSSAMC9lc2",
        customer_notify: 1,
        total_count: 60,
        notes: { team_id: team.id.toString() },
      });

      await prisma.subscription.create({
        data: {
          teamId: team.id,
          teamName: team.name,
          status: 'pending',
          type: 'paid',
          provider: input.subscriptionType,
          providerId: subscription.id,
   //       subActive: false,
          creatorId: user.id,
          plan: 'premium', // Add a plan field to your subscription creation
        },
      });

      return { teamId: team.id, subscriptionId: subscription.id };
    }
  }),

  completeTeamCreation: protectedProcedure
    .input(z.object({
      teamId: z.number(),
      razorpayPaymentId: z.string(),
      razorpaySignature: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const subscription = await prisma.subscription.findUnique({
        where: { teamId: input.teamId },
        include: { 
          team: {
            include: {
              creator: true
            }
          }
        },
      });

      if (!subscription) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Subscription not found',
        });
      }

      if (subscription.team.creatorId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to complete this team creation',
        });
      }

      // Verify Razorpay signature
      const isValid = verifyRazorpaySignature(
        input.razorpayPaymentId,
        subscription.providerId || '',
        input.razorpaySignature,
        process.env.RAZORPAY_SECRET_KEY as string
      );

      if (!isValid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid signature',
        });
      }

      // Update subscription status
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'active',
     //    subActive: true,
        },
      });

      if (!subscription.team.creator) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team creator not found',
        });
      }

      // Create WorkOS organization membership for the creator
      const workOsMembership = await workos.userManagement.createOrganizationMembership({
        organizationId: subscription.team.workOsOrgId,
        userId: subscription.team.creator.workOsUserId,
        roleSlug: 'admin',
      });

      // Update TeamMember with WorkOS membership ID
      await prisma.teamMember.update({
        where: {
          userId_teamId: {
            userId: subscription.team.creatorId,
            teamId: subscription.teamId,
          },
        },
        data: {
          workOsMembershipId: workOsMembership.id,
        },
      });

      return { success: true };
    }),

    addTeamMember: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        email: z.string().email(),
        role: z.string(),
        access: z.enum(['ADMIN', 'MANAGER', 'MEMBER']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const team = await prisma.team.findUnique({
        where: { id: input.teamId },
        include: { members: true },
      });
  
      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }
  
      const isAdmin = team.members.some(member => member.userId === ctx.user.id && member.access === 'ADMIN');
      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to add team members',
        });
      }
  
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });
  
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found. Please ask them to sign up on Versetta before adding them to the team.',
        });
      }
  
      const existingMember = await prisma.teamMember.findUnique({
        where: {
          userId_teamId: {
            userId: user.id,
            teamId: input.teamId,
          },
        },
      });
  
      if (existingMember) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is already a member of this team.',
        });
      }
  
      try {
        const workOsMembership = await workos.userManagement.createOrganizationMembership({
          organizationId: team.workOsOrgId,
          userId: user.workOsUserId,
          roleSlug: input.access === 'ADMIN' ? 'admin' : 'member',
        });
  
        const teamMember = await prisma.teamMember.create({
          data: {
            userId: user.id,
            teamId: input.teamId,
            role: input.role,
            access: input.access,
            workOsMembershipId: workOsMembership.id,
          },
        });
  
        return teamMember;
      } catch (error) {
        console.error('Error adding team member:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add team member. Please try again.',
        });
      }
    }),
  
  updateTeamMemberRole: protectedProcedure
    .input(
      z.object({
        teamMemberId: z.number(),
        newRole: z.string(),
        newAccess: z.enum(['ADMIN', 'MANAGER', 'MEMBER']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const teamMember = await prisma.teamMember.findUnique({
        where: { id: input.teamMemberId },
        include: { team: true },
      });
  
      if (!teamMember) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team member not found',
        });
      }
  
      const isAdmin = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: teamMember.teamId,
          access: 'ADMIN',
        },
      });
  
      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update team member roles',
        });
      }
  
      if (teamMember.workOsMembershipId) {
        await workos.userManagement.updateOrganizationMembership(
          teamMember.workOsMembershipId,
          {
            roleSlug: input.newAccess === 'ADMIN' ? 'admin' : 'member',
          }
        );
      }
  
      const updatedTeamMember = await prisma.teamMember.update({
        where: { id: input.teamMemberId },
        data: { 
          role: input.newRole,
          access: input.newAccess,
        },
      });
  
      return updatedTeamMember;
    }),

  removeTeamMember: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      const teamMember = await prisma.teamMember.findUnique({
        where: { id: input },
        include: { team: true },
      });

      if (!teamMember) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team member not found',
        });
      }

      const isAdmin = await prisma.teamMember.findFirst({
        where: {
          teamId: teamMember.teamId,
          userId: ctx.user.id,
          role: 'admin',
        },
      });

      if (!isAdmin && ctx.user.id !== teamMember.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to remove this team member',
        });
      }

      if (teamMember.workOsMembershipId) {
        await workos.userManagement.deleteOrganizationMembership(
          teamMember.workOsMembershipId
        );
      }

      await prisma.teamMember.delete({
        where: { id: input },
      });

      return { success: true };
    }),

   
  listTeamMembers: protectedProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      // Check if the user is a member of the team
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: input,
        },
      });
  
      if (!isMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this team',
        });
      }
  
      const teamMembers = await prisma.teamMember.findMany({
        where: { teamId: input },
        include: { user: true },
      });
  
      return teamMembers;
    }),
  
  getOrganizationMembership: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        const organizationMembership = await workos.userManagement.getOrganizationMembership(input);
        
        // Check if the user has permission to view this membership
        const isMember = await prisma.teamMember.findFirst({
          where: {
            userId: ctx.user.id,
            workOsMembershipId: input,
          },
        });
  
        if (!isMember) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to view this organization membership',
          });
        }
  
        return organizationMembership;
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization membership not found',
        });
      }
    }),
  
  listOrganizationMemberships: protectedProcedure
    .input(z.object({
      userId: z.string().optional(),
      organizationId: z.string().optional(),
      statuses: z.array(z.enum(['active', 'inactive', 'pending'])).optional(),
      limit: z.number().min(1).max(100).optional(),
      before: z.string().optional(),
      after: z.string().optional(),
      order: z.enum(['asc', 'desc']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Check if the user has permission to list organization memberships
        const isAdmin = await prisma.teamMember.findFirst({
          where: {
            userId: ctx.user.id,
            role: 'admin',
          },
        });
  
        if (!isAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to list organization memberships',
          });
        }
  
        const organizationMemberships = await workos.userManagement.listOrganizationMemberships(input);
        return organizationMemberships;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list organization memberships',
        });
      }
    }),
  
  deleteTeam: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        const team = await prisma.team.findUnique({
          where: { id: input },
          include: { members: true, subscription: true }
        });
  
        if (!team) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Team not found',
          });
        }
  
        // Check if the user is the team admin
        const isAdmin = team.members.some(member => member.userId === ctx.user.id && member.role === 'admin');
  
        if (!isAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this team',
          });
        }
  
        // Start a transaction
        await prisma.$transaction(async (prisma) => {
          // Delete associated subscription if it exists
          if (team.subscription) {
            await prisma.subscription.delete({
              where: { teamId: team.id }
            });
          }
  
          // Delete WorkOS organization
          await workos.organizations.deleteOrganization(team.workOsOrgId);
  
          // Delete team members
          await prisma.teamMember.deleteMany({
            where: { teamId: team.id }
          });
  
          // Delete associated projects
          await prisma.project.deleteMany({
            where: { teamId: team.id }
          });
  
          // Delete associated tasks
          await prisma.task.deleteMany({
            where: { teamId: team.id }
          });
  
          // Finally, delete the team
          await prisma.team.delete({
            where: { id: team.id }
          });
        });
  
        return { success: true };
      } catch (error) {
        console.error('Error deleting team:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete team',
          cause: error,
        });
      }
    }),
});





