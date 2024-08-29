import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { WorkOS } from '@workos-inc/node';
import { TRPCError } from '@trpc/server';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export const teamRouter = router({
  getTeam: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return prisma.team.findUnique({
        where: { id: input },
        include: {
          members: {
            include: { user: true },
          },
          projects: true,
          tasks: true,
        },
      });
    }),

  
  createTeam: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        workOsUserId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Find the user in the database using the WorkOS user ID
        const user = await prisma.user.findUnique({
          where: { workOsUserId: input.workOsUserId },
        });
 console.log('user', user);
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }
        

        // Create WorkOS organization
        const workOsOrg = await workos.organizations.createOrganization({
          name: input.name,
        });
 console.log('workOsOrg', workOsOrg);
        // Create WorkOS organization membership for the creator
        const workOsMembership = await workos.userManagement.createOrganizationMembership({
          organizationId: workOsOrg.id,
          userId: user.workOsUserId,
          roleSlug: 'member', // Use 'admin' instead of 'roleSlug'
        });
 console.log('workOsMembership', workOsMembership);
       

        // Create team in database
        const team = await prisma.team.create({
          data: {
            name: input.name,
            description: input.description,
            creatorId: user.id,
            workOsOrgId: workOsOrg.id,
            members: {
              create: {
                userId: user.id,
                role: 'admin',
                workOsMembershipId: workOsMembership.id,
              },
            },
          },
          include: {
            members: true,
          },
        });
console.log('team', team);
        return team;
      } catch (error) {
        console.error('Error creating team:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create team',
          cause: error,
        });
      }
    }),
  
  addTeamMember: publicProcedure
    .input(
      z.object({
        teamId: z.number(),
        email: z.string().email(),
        role: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const team = await prisma.team.findUnique({
        where: { id: input.teamId },
      });

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found. Make sure the user has signed up on VERSET.',
        });
      }

      // Check if the user is already a member of the team
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
          roleSlug: input.role,
        });

        const teamMember = await prisma.teamMember.create({
          data: {
            userId: user.id,
            teamId: input.teamId,
            role: input.role,
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

  removeTeamMember: publicProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
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

  updateTeamMemberRole: publicProcedure
    .input(
      z.object({
        teamMemberId: z.number(),
        newRole: z.string(),
      })
    )
    .mutation(async ({ input }) => {
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

      if (teamMember.workOsMembershipId) {
        await workos.userManagement.updateOrganizationMembership(
          teamMember.workOsMembershipId,
          {
            roleSlug: input.newRole,
          }
        );
      }

      const updatedTeamMember = await prisma.teamMember.update({
        where: { id: input.teamMemberId },
        data: { role: input.newRole },
      });

      return updatedTeamMember;
    }),

  listTeamMembers: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const teamMembers = await prisma.teamMember.findMany({
        where: { teamId: input },
        include: { user: true },
      });

      return teamMembers;
    }),

    getOrganizationMembership: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const organizationMembership = await workos.userManagement.getOrganizationMembership(input);
        return organizationMembership;
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization membership not found',
        });
      }
    }),

  listOrganizationMemberships: publicProcedure
    .input(z.object({
      userId: z.string().optional(),
      organizationId: z.string().optional(),
      statuses: z.array(z.enum(['active', 'inactive', 'pending'])).optional(),
      limit: z.number().min(1).max(100).optional(),
      before: z.string().optional(),
      after: z.string().optional(),
      order: z.enum(['asc', 'desc']).optional(),
    }))
    .query(async ({ input }) => {
      try {
        const organizationMemberships = await workos.userManagement.listOrganizationMemberships(input);
        return organizationMemberships;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list organization memberships',
        });
      }
    }),
    

});

