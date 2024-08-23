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
        creatorId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const creator = await prisma.user.findUnique({
        where: { id: input.creatorId },
      });

      if (!creator) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Creator not found',
        });
      }

      // Create WorkOS organization
      const workOsOrg = await workos.organizations.createOrganization({
        name: input.name,
      });

      // Create WorkOS organization membership for the creator
      const workOsMembership = await workos.userManagement.createOrganizationMembership({
        organizationId: workOsOrg.id,
        userId: creator.workOsUserId,
        roleSlug: 'admin',
      });

      // Create team in database
      const team = await prisma.team.create({
        data: {
          name: input.name,
          description: input.description,
          creatorId: input.creatorId,
          workOsOrgId: workOsOrg.id,
          members: {
            create: {
              userId: input.creatorId,
              role: 'admin',
              workOsMembershipId: workOsMembership.id,
            },
          },
        },
        include: {
          members: true,
        },
      });

      return team;
    }),

  addTeamMember: publicProcedure
    .input(
      z.object({
        teamId: z.number(),
        userId: z.number(),
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
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const workOsMembership = await workos.userManagement.createOrganizationMembership({
        organizationId: team.workOsOrgId,
        userId: user.workOsUserId,
        roleSlug: input.role,
      });

      const teamMember = await prisma.teamMember.create({
        data: {
          userId: input.userId,
          teamId: input.teamId,
          role: input.role,
          workOsMembershipId: workOsMembership.id,
        },
      });

      return teamMember;
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














// createTeam: publicProcedure
//   .input(
//     z.object({
//       name: z.string(),
//       description: z.string().optional(),
//       creatorId: z.number(),
//     })
//   )
//   .mutation(async ({ input }) => {
//     // Create WorkOS organization
//     const workOsOrg = await workos.organizations.createOrganization({
//       name: input.name,
//     });

//     // Create team in database
//     const team = await prisma.team.create({
//       data: {
//         name: input.name,
//         description: input.description,
//         creatorId: input.creatorId,
//         workOsOrgId: workOsOrg.id,
//       },
//     });

//     // Create TeamMember entry for the creator
//     await prisma.teamMember.create({
//       data: {
//         userId: input.creatorId,
//         teamId: team.id,
//         role: 'admin',
//       },
//     });

//     return team;
//   }),
