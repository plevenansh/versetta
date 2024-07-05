// src/routes/tasks.ts
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export const taskRouter = router({
  getAll: publicProcedure
    .input(z.number().optional()) // optional project ID
    .query(async ({ input }) => {
      return await prisma.task.findMany({
        where: input ? { projectId: input } : undefined
      });
    }),
  create: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      status: z.string().optional(),
      dueDate: z.date().optional(),
      projectId: z.number()
    }))
    .mutation(async ({ input }) => {
      return await prisma.task.create({ data: input });
    }),
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      dueDate: z.date().optional(),
      completed: z.boolean().optional()
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await prisma.task.update({ where: { id }, data });
    }),
  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      return await prisma.task.delete({ where: { id: input } });
    })
});
