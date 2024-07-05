// src/routes/projects.ts
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export const projectRouter = router({
  getAll: publicProcedure.query(async () => {
    return await prisma.project.findMany();
  }),
  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await prisma.project.findUnique({ 
        where: { id: input },
        include: { tasks: true }
      });
    }),
  create: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      status: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      userId: z.number()
    }))
    .mutation(async ({ input }) => {
      return await prisma.project.create({ data: input });
    }),
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional()
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await prisma.project.update({ where: { id }, data });
    }),
  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      return await prisma.project.delete({ where: { id: input } });
    })
});
