import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export const teamRouter = router({
  createTeam: publicProcedure
  .input(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      creatorId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    // Create WorkOS organization
    const workOsOrg = await workos.organizations.createOrganization({
      name: input.name,
    });

    // Create team in database
    const team = await prisma.team.create({
      data: {
        name: input.name,
        description: input.description,
        creatorId: input.creatorId,
        workOsOrgId: workOsOrg.id,
      },
    });

    // Create TeamMember entry for the creator
    await prisma.teamMember.create({
      data: {
        userId: input.creatorId,
        teamId: team.id,
        role: 'admin',
      },
    });

    return team;
  }),

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
        throw new Error('Team not found'
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!team) {
        throw new Error('User not found'
        );
      }

      const workOsMembership = await workos.userManagement.createOrganizationMembership({
        organizationId: team.workOsOrgId,
      //  userId: user.email, // Assuming user's email is used as WorkOS user ID
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
        throw new Error('Team not found'
        );
      }

      await workos.userManagement.deleteOrganizationMembership(
        teamMember.workOsMembershipId
      );

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
        throw new Error('Team not found'
        );
      }
      await workos.userManagement.updateOrganizationMembership(
        teamMember.workOsMembershipId,
        {
          roleSlug: input.newRole,
        }
      );

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

});