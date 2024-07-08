import { Prisma } from '@prisma/client';
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../lib/prisma';

export const projectRouter = router({
  getAll: publicProcedure.query(async () => {
    try {
      return await prisma.project.findMany();
    } catch (error) {
      throw new Error('Failed to fetch projects');
    }
  }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        return await prisma.project.findUnique({ where: { id: input } });
      } catch (error) {
        throw new Error('Failed to fetch project');
      }
    }),

  create: publicProcedure
    .input(z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().optional(),
      userId: z.number()
    }))
    .mutation(async ({ input }) => {
      try {
        return await prisma.project.create({ data: input });
      } catch (error) {
        throw new Error('Failed to create project');
      }
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1, 'Title is required').optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input;
        return await prisma.project.update({ where: { id }, data });
      } catch (error) {
        throw new Error('Failed to update project');
      }
    }),

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      try {
        return await prisma.project.delete({ where: { id: input } });
      } catch (error) {
        throw new Error('Failed to delete project');
      }
    }),

  
});