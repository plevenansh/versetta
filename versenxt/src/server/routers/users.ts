import { Prisma } from '@prisma/client';
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '@/components/lib/prisma';

export const userRouter = router({
  getAll: publicProcedure.query(async () => {
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
      throw new Error("Failed to fetch users");
    }
  }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: input },
          include: {
            teamMemberships: true,
           
          }
        });
        if (!user) {
          throw new Error(`User with id ${input} not found`);
        }
        return user;
      } catch (error) {
        console.error(`Error fetching user with id ${input}:`, error);
        throw new Error('Failed to fetch user');
      }
    }),

    getByWorkOsId: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { workOsUserId: input },
          include: {
            teamMemberships: true,
          }
        });
        if (!user) {
          throw new Error(`User with workos user id ${input} not found`);
        }
        return user;
      } catch (error) {
        console.error(`Error fetching user with workOsUserid ${input}:`, error);
        throw new Error('Failed to fetch user with workos id');
      }
    }),

    getOrCreateUser: publicProcedure
    .input(z.object({
      workOsUserId: z.string(),
      email: z.string().email(),
      name: z.string(),
    }))
    .query(async ({ input }) => {
      const { workOsUserId, email, name } = input;

      let user = await prisma.user.findUnique({
        where: { workOsUserId },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            workOsUserId,
            email,
            name,
          },
        });
      }

      return user;
    }),
 
    create: publicProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string(),
      workOsUserId: z.string(),
    }))
    .mutation(async ({ input }) => {
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
        throw new Error('Failed to create or update user');
      }
    }),
    

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      gender: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input;
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
        throw new Error('Failed to update user');
      }
    }),

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      try {
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
        throw new Error('Failed to delete user');
      }
    }),

  getUserTeams: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        const userWithTeams = await prisma.user.findUnique({
          where: { id: input },
          include: {
            teamMemberships: {
              include: {
                team: true
              }
            }
          }
        });
        if (!userWithTeams) {
          throw new Error(`User with id ${input} not found`);
        }
        return userWithTeams.teamMemberships.map(membership => membership.team);
      } catch (error) {
        console.error(`Error fetching teams for user with id ${input}:`, error);
        throw new Error('Failed to fetch user teams');
      }
    })
});

 

