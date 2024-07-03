import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../lib/prisma';

export const projectRouter = router({
  getAll: publicProcedure.query(async () => {
    return await prisma.project.findMany();
  }),
  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await prisma.project.findUnique({ where: { id: input } });
    }),
  create: publicProcedure
    .input(z.object({ 
      title: z.string(), 
      description: z.string().optional(),
      userId: z.number()
    }))
    .mutation(async ({ input }) => {
      return await prisma.project.create({ data: input });
    }),
  // Add more project-related procedures as needed
});
