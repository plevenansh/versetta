import { Prisma } from '@prisma/client';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      console.log("Getting all users");
      const users = await prisma.user.findMany({
        include: {
          teamMemberships: true,
        }
      });
      console.log(`Retrieved ${users.length} users`);
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Failed to fetch users" });
    }
  }),

  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: input },
          include: {
            teamMemberships: true,
          }
        });
        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: `User with id ${input} not found` });
        }
        // Check if the requesting user has permission to view this user's details
        if (ctx.user.id !== user.id) {
          // You might want to add additional checks here, e.g., if the user is an admin
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to view this user' });
        }
        return user;
      } catch (error) {
        console.error(`Error fetching user with id ${input}:`, error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch user' });
      }
    }),

  getByWorkOsId: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { workOsUserId: input },
          include: {
            teamMemberships: true,
          }
        });
        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: `User with workos user id ${input} not found` });
        }
        // Check if the requesting user has permission to view this user's details
        if (ctx.user.workOsUserId !== input) {
          // You might want to add additional checks here, e.g., if the user is an admin
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to view this user' });
        }
        return user;
      } catch (error) {
        console.error(`Error fetching user with workOsUserid ${input}:`, error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch user with workos id' });
      }
    }),

    getOrCreateUser: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        let user = await prisma.user.findUnique({
          where: { id: ctx.user.id },
          include: {
            teamMemberships: {
              include: {
                team: true
              }
            }
          }
        });
  
        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }
  
        return user;
      } catch (error) {
        console.error('Error fetching or creating user:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch or create user' });
      }
    }),

  create: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string(),
      workOsUserId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { email, name, workOsUserId } = input;

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          // User exists, update WorkOS user ID
          const updatedUser = await prisma.user.update({
            where: { email },
            data: { workOsUserId },
          });
          console.log(`User updated: ${updatedUser.id}`);
          return updatedUser;
        } else {
          // User doesn't exist, create new user
          const newUser = await prisma.user.create({
            data: {
              email,
              name,
              workOsUserId,
            },
          });
          console.log(`New user created: ${newUser.id}`);
          return newUser;
        }
      } catch (error) {
        console.error('Error in user creation/update:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create or update user' });
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      gender: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...data } = input;
        
        // Check if the user is updating their own profile
        if (ctx.user.id !== id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only update your own profile' });
        }

        const updatedUser = await prisma.user.update({
          where: { id },
          data,
          include: {
            teamMemberships: true,
          }
        });
        console.log('User updated successfully:', updatedUser);
        return updatedUser;
      } catch (error) {
        console.error(`Error updating user with id ${input.id}:`, error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update user' });
      }
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if the user is deleting their own account
        if (ctx.user.id !== input) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own account' });
        }

        const deletedUser = await prisma.user.delete({
          where: { id: input },
          include: {
            teamMemberships: true,
          }
        });
        console.log('User deleted successfully:', deletedUser);
        return deletedUser;
      } catch (error) {
        console.error(`Error deleting user with id ${input}:`, error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete user' });
      }
    }),

  // In users.ts router

getUserTeams: protectedProcedure
.query(async ({ ctx }) => {
  try {
    const userWithTeams = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        teamMemberships: {
          include: {
            team: true
          }
        }
      }
    });
    if (!userWithTeams) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }
    return userWithTeams.teamMemberships.map(membership => membership.team);
  } catch (error) {
    console.error(`Error fetching teams for user:`, error);
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch user teams' });
  }
}),

    getUser: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: ctx.user.id },
          include: {
            teamMemberships: {
              include: {
                team: true
              }
            }
          }
        });

        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }

        return user;
      } catch (error) {
        console.error('Error fetching user:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch user' });
      }
    }),
});