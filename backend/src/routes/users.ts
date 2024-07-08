import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../lib/prisma';

export const userRouter = router({
  getAll: publicProcedure.query(async () => {
    return await prisma.user.findMany();
  }),
  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await prisma.user.findUnique({ where: { id: input } });
    }),
  create: publicProcedure
    .input(z.object({ email: z.string().email(), name: z.string().optional() }))
    .mutation(async ({ input }) => {
      try {
        const user = await prisma.user.create({
          data: input
        });
        console.log('User created successfully:', user);
        return user;
      } catch (error) {
        console.error('Error creating user:', error);
        throw new Error(`Failed to create user: `);
      } }),
  // Add more user-related procedures as needed
});
