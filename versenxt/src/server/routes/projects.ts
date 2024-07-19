import { Prisma } from '@prisma/client';
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../../lib/prisma';

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

  // create: publicProcedure
  //   .input(z.object({
  //     title: z.string().min(1, 'Title is required'),
  //     description: z.string().optional(),
  //     status: z.string().default("active"),
  //     // startDate: z.string().transform((str) => new Date(str)).optional(),
  //     // endDate: z.string().transform((str) => new Date(str)).optional(),
  //     startDate: z.date().optional(),
  //     endDate: z.date().optional(),
      
  //     userId: z.number()
  //   }))
  //   .mutation(async ({ input }) => {
  //     console.log("Input received:", input);
  //     const createdProject = await prisma.project.create({ data: input });
  //     console.log('Project created successfully:', createdProject);
  //     return createdProject;
  //   }),

  create: publicProcedure
  .input(z.object({
    title: z.string(),
    description: z.string().optional(),
    status: z.string().optional(),
   // startDate: z.date().optional(),
    //endDate: z.date().optional(),
    startDate: z.string().transform((str) => new Date(str)).optional(),
      endDate: z.string().transform((str) => new Date(str)).optional(),
    userId: z.number()
  }))
  .mutation(async ({ input }) => {
    console.log("Input received:", input);
    const data: Prisma.ProjectCreateInput = {
      title: input.title,
      description: input.description,
      status: input.status,
     startDate: input.startDate,
      endDate: input.endDate,
     // startDate: z.string().transform((str) => new Date(str)).optional(),
      //endDate: z.string().transform((str) => new Date(str)).optional(),
      //startDate: input.startDate ? new Date(input.startDate) : undefined,
     // endDate: input.endDate ? new Date(input.endDate) : undefined,
      user: { connect: { id: input.userId } }
    };
    
    return await prisma.project.create({ data });
  }),


  update: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1, 'Title is required').optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await prisma.project.update({ 
        where: { id }, 
        data,
        include: { tasks: true }
      });
    }),

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      return await prisma.project.delete({ where: { id: input } });
    }),

  getByUserId: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await prisma.project.findMany({
        where: { userId: input },
        // include: { tasks: true }
      });
    }),
});
