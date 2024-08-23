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
    creatorId: z.number().optional(),
    assigneeId: z.number().optional()
  }))
  .query(async ({ input }) => {
    try {
      const tasks = await prisma.task.findMany({
        where: {
          projectId: input.projectId,
          teamId: input.teamId,
          creatorId: input.creatorId,
          assigneeId: input.assigneeId
        },
        include: {
          project: true,
          team: true,
          creator: { include: { user: true } },
          assignee: { include: { user: true } }
        },
        orderBy: [
          { status: 'asc' }, // This will put 'completed' tasks at the bottom
          { dueDate: 'asc' },
         { createdAt: 'desc' }
        ]
      });
      console.log(`Retrieved ${tasks.length} tasks`);
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  }),

    getTasksAssignedToTeamMember: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        const tasks = await prisma.task.findMany({
          where: {
            assigneeId: input
          },
          include: {
            project: true,
            team: true,
            creator: { include: { user: true } },
            assignee: { include: { user: true } }
          }
        });
        console.log(`Retrieved ${tasks.length} tasks assigned to team member ${input}`);
        return tasks;
      } catch (error) {
        console.error(`Error fetching tasks assigned to team member ${input}:`, error);
        throw new Error('Failed to fetch tasks assigned to team member');
      }
    }),

  getTasksCreatedByTeamMember: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        const tasks = await prisma.task.findMany({
          where: {
            creatorId: input
          },
          include: {
            project: true,
            team: true,
            creator: { include: { user: true } },
            assignee: { include: { user: true } }
          }
        });
        console.log(`Retrieved ${tasks.length} tasks created by team member ${input}`);
        return tasks;
      } catch (error) {
        console.error(`Error fetching tasks created by team member ${input}:`, error);
        throw new Error('Failed to fetch tasks created by team member');
      }
    }),


    create: publicProcedure
  .input(z.object({
    title: z.string(),
    description: z.string().optional(),
    status: z.enum(['pending', 'completed']).default('pending'),
    dueDate: z.string().optional().nullable(),
    projectId: z.number().optional(),
    teamId: z.number(),
    creatorId: z.number(),
    assigneeId: z.number().optional()
  }))
  .mutation(async ({ input }) => {
    try {
      const data: Prisma.TaskCreateInput = {
        title: input.title,
        description: input.description,
        status: input.status,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        team: { connect: { id: input.teamId } },
        creator: { connect: { id: input.creatorId } },
        ...(input.projectId && { project: { connect: { id: input.projectId } } }),
        ...(input.assigneeId && { assignee: { connect: { id: input.assigneeId } } }),
      };

      console.log('Creating task with data:', data);
      const newTask = await prisma.task.create({
        data,
        include: {
          project: true,
          team: true,
          creator: { include: { user: true } },
          assignee: { include: { user: true } }
        }
      });

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
         projectId: z.number().optional().nullable(),
      teamId: z.number().optional(),
      assigneeId: z.number().optional().nullable()

    }))
    .mutation(async ({ input }) => {
      try {
        console.log("Input received for task update:", input);
  
        const existingTask = await prisma.task.findUnique({
          where: { id: input.id },
          include: { project: true, team: true, creator: { include: { user: true } }, assignee: { include: { user: true } } }
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
          data.team = { connect: { id: input.teamId } };
        }
  
        if (input.assigneeId !== undefined) {
          data.assignee = input.assigneeId === null ? { disconnect: true } : { connect: { id: input.assigneeId } };
        }


        console.log('Updating task:', input.id, 'with data:', data);
  
        const updatedTask = await prisma.task.update({
          where: { id: input.id },
          data: data,
          include: {
            project: true,
            team: true,
            creator: { include: { user: true } },
            assignee: { include: { user: true } }
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
    }),

    getFiltered: publicProcedure
    .input(z.object({
      filter: z.enum(['all', 'pending', 'assigned']),
      teamMemberId: z.number(),
      projectId: z.number().optional(),
      teamId: z.number().optional(),
      creatorId: z.number().optional(),
      assigneeId: z.number().optional()
    }))
    .query(async ({ input }) => {
      try {
        let whereClause: Prisma.TaskWhereInput = {};

        switch (input.filter) {
          case 'pending':
            whereClause.status = 'pending';
            break;
          case 'assigned':
            whereClause.assigneeId = input.teamMemberId;
            break;
          // 'all' doesn't need any additional filters
        }

        const tasks = await prisma.task.findMany({
          where: whereClause,
          include: {
            project: true,
            team: true,
            creator: { include: { user: true } },
            assignee: { include: { user: true } }
          },
          orderBy: [
            { status: 'asc' },
            { dueDate: 'asc' },
            { createdAt: 'desc' }
          ]
        });

        console.log(`Retrieved ${tasks.length} tasks for filter: ${input.filter}`);
        return tasks;
      } catch (error) {
        console.error('Error fetching filtered tasks:', error);
        throw new Error('Failed to fetch filtered tasks');
      }
    }),


});
