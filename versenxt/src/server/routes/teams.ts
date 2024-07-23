import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';

export const teamRouter = router({
  getAll: publicProcedure.query(async () => {
    try {
      const teams = await prisma.team.findMany({
        include: {
          members: {
            include: {
              user: true
            }
          },
          projects: true,
          tasks: true
        }
      });
      return teams;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw new Error('Failed to fetch teams');
    }
  }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        const team = await prisma.team.findUnique({
          where: { id: input },
          include: {
            members: {
              include: {
                user: true
              }
            },
            projects: true,
            tasks: true
          }
        });
        if (!team) {
          throw new Error(`Team with id ${input} not found`);
        }
        return team;
      } catch (error) {
        console.error(`Error fetching team with id ${input}:`, error);
        throw new Error('Failed to fetch team');
      }
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      creatorId: z.number()
    }))
    .mutation(async ({ input }) => {
      console.log('Creating team with input:', input);
      try {
        const newTeam = await prisma.team.create({
          data: {
            name: input.name,
            description: input.description,
            creator: {
              connect: { id: input.creatorId }
            },
            members: {
              create: {
                userId: input.creatorId,
                role: 'admin'
              }
            }
          },
          include: {
            members: {
              include: {
                user: true
              }
            },
            creator:true
          }
        });
        return newTeam;
      } catch (error) {
        console.error('Error creating team:', error);
        throw new Error('Failed to create team');
      }
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      try {
        const updatedTeam = await prisma.team.update({
          where: { id: input.id },
          data: {
            name: input.name,
            description: input.description
          },
          include: {
            members: {
              include: {
                user: true
              }
            }
          }
        });
        return updatedTeam;
      } catch (error) {
        console.error(`Error updating team with id ${input.id}:`, error);
        throw new Error('Failed to update team');
      }
    }),

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      try {
        await prisma.team.delete({
          where: { id: input }
        });
        return { success: true, message: 'Team deleted successfully' };
      } catch (error) {
        console.error(`Error deleting team with id ${input}:`, error);
        throw new Error('Failed to delete team');
      }
    }),

  addMember: publicProcedure
    .input(z.object({
      teamId: z.number(),
      userId: z.number(),
      role: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const newMember = await prisma.teamMember.create({
          data: {
            teamId: input.teamId,
            userId: input.userId,
            role: input.role
          },
          include: {
            team: true,
            user: true
          }
        });
        return newMember;
      } catch (error) {
        console.error('Error adding team member:', error);
        throw new Error('Failed to add team member');
      }
    }),

  removeMember: publicProcedure
    .input(z.object({
      teamId: z.number(),
      userId: z.number()
    }))
    .mutation(async ({ input }) => {
      try {
        await prisma.teamMember.delete({
          where: {
            userId_teamId: {
              userId: input.userId,
              teamId: input.teamId
            }
          }
        });
        return { success: true, message: 'Team member removed successfully' };
      } catch (error) {
        console.error('Error removing team member:', error);
        throw new Error('Failed to remove team member');
      }
    }),

  updateMemberRole: publicProcedure
    .input(z.object({
      teamId: z.number(),
      userId: z.number(),
      role: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const updatedMember = await prisma.teamMember.update({
          where: {
            userId_teamId: {
              userId: input.userId,
              teamId: input.teamId
            }
          },
          data: {
            role: input.role
          }
        });
        return updatedMember;
      } catch (error) {
        console.error('Error updating team member role:', error);
        throw new Error('Failed to update team member role');
      }
    }),

  getTeamMembers: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        const members = await prisma.teamMember.findMany({
          where: { teamId: input },
          include: { user: true }
        });
        return members;
      } catch (error) {
        console.error(`Error fetching members for team with id ${input}:`, error);
        throw new Error('Failed to fetch team members');
      }
    })
});