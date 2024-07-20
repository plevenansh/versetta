// src/routes/tasks.ts
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';

export const taskRouter = router({
  getAll: publicProcedure
    .input(z.object({
      projectId: z.number().optional(),
      teamId: z.number().optional(),
      userId: z.number().optional()
    }))
    .query(async ({ input }) => {
      try {
        const tasks = await prisma.task.findMany({
          where: {
            projectId: input.projectId,
            teamId: input.teamId,
            userId: input.userId
          },
          include: {
            project: true,
            team: true,
            user: true
          }
        });
        console.log(`Retrieved ${tasks.length} tasks`);
        return tasks;
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw new Error('Failed to fetch tasks');
      }
    }),

  create: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      status: z.enum(['pending', 'completed']).default('pending'),
      dueDate: z.string().optional().nullable(),
      projectId: z.number().optional(),
      teamId: z.number().optional(),
      userId: z.number()
    }))
    .mutation(async ({ input }) => {
      try {
        const data: Prisma.TaskCreateInput = {
          title: input.title,
          description: input.description,
          status: input.status,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          user: { connect: { id: input.userId } },
          ...(input.projectId && { project: { connect: { id: input.projectId } } }),
          ...(input.teamId && { team: { connect: { id: input.teamId } } })
        };
        console.log('Creating task with data:', data);
        const newTask = await prisma.task.create({ data });
        console.log('Created task:', newTask);
        return newTask;
      } catch (error) {
        console.error('Error creating task:', error);
        throw new Error('Failed to create task');
      }
    }),

    update: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(['pending', 'completed']).optional(),
      dueDate: z.string().optional().nullable(),
      userId: z.number(),
      projectId: z.number().optional().nullable(),
      teamId: z.number().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      try {
        console.log("Input received for task update:", input);
  
        const existingTask = await prisma.task.findUnique({
          where: { id: input.id },
          include: { project: true, team: true, user: true }
        });
  
        if (!existingTask) {
          throw new Error(`Task with id ${input.id} not found`);
        }
  
        const data: Prisma.TaskUpdateInput = {
          title: input.title,
          description: input.description,
          status: input.status,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        };
  
  
        if (input.projectId !== undefined) {
          data.project = input.projectId === null ? { disconnect: true } : { connect: { id: input.projectId } };
        }
  
        if (input.teamId !== undefined) {
          data.team = input.teamId === null ? { disconnect: true } : { connect: { id: input.teamId } };
        }
  
        console.log('Updating task:', input.id, 'with data:', data);
  
        const updatedTask = await prisma.task.update({
          where: { id: input.id },
          data: data,
          include: {
            project: true,
            team: true,
            user: true
          }
        });
  
        console.log('Updated task:', updatedTask);
        return updatedTask;
      } catch (error) {
        console.error('Error updating  your task backen task:', error);
        throw new Error('Failed to update task: ' + (error as Error).message);
      }
    }),
  

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      try {
        const deletedTask = await prisma.task.delete({ where: { id: input } });
        console.log('Deleted task:', deletedTask);
        return deletedTask;
      } catch (error) {
        console.error('Error deleting task:', error);
        throw new Error('Failed to delete task');
      }
    })
});
