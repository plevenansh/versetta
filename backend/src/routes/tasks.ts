import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../lib/prisma';

export const taskRouter = router({
  getAll: publicProcedure.query(async () => {
    return await prisma.task.findMany();
  }),
  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await prisma.task.findUnique({ where: { id: input } });
    }),
  create: publicProcedure
    .input(z.object({ 
      title: z.string(), 
      description: z.string().optional(),
      completed: z.boolean().optional(),
      projectId: z.number()
    }))
    .mutation(async ({ input }) => {
      return await prisma.task.create({ data: input });
    }),
  updateStatus: publicProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .mutation(async ({ input }) => {
      return await prisma.task.update({
        where: { id: input.id },
        data: { completed: input.completed }
      });
    }),
  // Add more task-related procedures as needed
});
