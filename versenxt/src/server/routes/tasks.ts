// src/routes/tasks.ts
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';

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
      status: z.enum(['pending', 'completed']).optional(),
      dueDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
      projectId: z.number(),
      userId: z.number()
    }))
    .mutation(async ({ input }) => {
      // Check if user exists
      const user = await prisma.user.findUnique({ where: { id: input.userId } });
      if (!user) {
        throw new Error(`User with id ${input.userId} not found`);
      }

      const data: Prisma.TaskCreateInput = {
        title: input.title,
        description: input.description,
        status: input.status || 'pending',
        dueDate: input.dueDate,
        projectId: input.projectId,
        userId: input.userId
      };
      console.log('Creating task with data:', data);
      return await prisma.task.create({ data });
    }),


update: publicProcedure
  .input(z.object({
    id: z.number(),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['pending', 'completed']).optional(),
    dueDate: z.string().transform((str) => new Date(str)).optional(),
    completed: z.boolean().optional(),
    userId: z.number().optional()
  }))
  .mutation(async ({ input }) => {
    console.log("Input received for task update:", input);

    const data: Prisma.TaskUpdateInput = {
      title: input.title,
      description: input.description,
      status: input.status,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    };

    // Handle the 'completed' to 'status' conversion
    if (input.completed !== undefined) {
      data.status = input.completed ? 'completed' : 'pending';
    }

    // Add user connection if userId is provided
    if (input.userId) {
      data.user = { connect: { id: input.userId } };
    }

    console.log('Updating task:', input.id, 'with data:', data);

    const updatedTask = await prisma.task.update({
      where: { id: input.id },
      data: data
    });

    console.log('Updated task:', updatedTask);

    return updatedTask;
  }),




    
  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      return await prisma.task.delete({ where: { id: input } });
    })
});
