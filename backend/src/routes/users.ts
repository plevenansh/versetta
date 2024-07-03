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
      return await prisma.user.create({ data: input });
    }),
  // Add more user-related procedures as needed
});
