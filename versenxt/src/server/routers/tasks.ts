// src/routes/tasks.ts
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import { TRPCError } from '@trpc/server';

export const taskRouter = router({
  getAll: protectedProcedure
    .input(z.object({
      projectId: z.number().optional(),
      teamId: z.number().optional(),
      creatorId: z.number().optional(),
      assigneeId: z.number().optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        const tasks = await prisma.task.findMany({
          where: {
            projectId: input.projectId,
            teamId: input.teamId,
            creatorId: input.creatorId,
            assigneeId: input.assigneeId,
            team: {
              members: {
                some: { userId: ctx.user.id }
              }
            }
          },
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
        console.log(`Retrieved ${tasks.length} tasks`);
        return tasks;
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch tasks' });
      }
    }),

  getTasksAssignedToTeamMember: protectedProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        if (input !== ctx.user.id) {
          const hasPermission = await prisma.teamMember.findFirst({
            where: {
              userId: ctx.user.id,
              team: {
                members: {
                  some: { userId: input }
                }
              }
            }
          });
          if (!hasPermission) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to view these tasks' });
          }
        }

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
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch tasks assigned to team member' });
      }
    }),

  getTasksCreatedByTeamMember: protectedProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        if (input !== ctx.user.id) {
          const hasPermission = await prisma.teamMember.findFirst({
            where: {
              userId: ctx.user.id,
              team: {
                members: {
                  some: { userId: input }
                }
              }
            }
          });
          if (!hasPermission) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to view these tasks' });
          }
        }

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
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch tasks created by team member' });
      }
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      status: z.enum(['pending', 'completed']).default('pending'),
      dueDate: z.string().optional().nullable(),
      projectId: z.number().optional(),
      teamId: z.number(),
      assigneeId: z.number().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const creatorTeamMember = await prisma.teamMember.findUnique({
          where: {
            userId_teamId: {
              userId: ctx.user.id,
              teamId: input.teamId,
            },
          },
        });

        if (!creatorTeamMember) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not a member of this team' });
        }

        let assigneeTeamMember = null;
        if (input.assigneeId) {
          assigneeTeamMember = await prisma.teamMember.findUnique({
            where: {
              userId_teamId: {
                userId: input.assigneeId,
                teamId: input.teamId,
              },
            },
          });
          if (!assigneeTeamMember) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Assignee is not a member of this team' });
          }
        }

        const data: Prisma.TaskCreateInput = {
          title: input.title,
          description: input.description,
          status: input.status,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          team: { connect: { id: input.teamId } },
          creator: { connect: { id: creatorTeamMember.id } },
          ...(input.projectId && { project: { connect: { id: input.projectId } } }),
          ...(assigneeTeamMember && { assignee: { connect: { id: assigneeTeamMember.id } } }),
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
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create task' });
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional().nullable(),
      status: z.enum(['pending', 'completed']).optional(),
      dueDate: z.string().optional().nullable(),
      projectId: z.number().optional().nullable(),
      teamId: z.number().optional(),
      assigneeId: z.number().optional().nullable()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        console.log("Input received for task update:", input);

        const existingTask = await prisma.task.findUnique({
          where: { id: input.id },
          include: { project: true, team: true, creator: { include: { user: true } }, assignee: { include: { user: true } } }
        });

        if (!existingTask) {
          throw new TRPCError({ code: 'NOT_FOUND', message: `Task with id ${input.id} not found` });
        }

        // Check if the user has permission to update this task
        const isMember = await prisma.teamMember.findFirst({
          where: {
            userId: ctx.user.id,
            teamId: existingTask.teamId
          }
        });

        if (!isMember) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update this task' });
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
        console.error('Error updating task:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update task' });
      }
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        const task = await prisma.task.findUnique({
          where: { id: input },
          include: { team: true }
        });

        if (!task) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
        }

        const isMember = await prisma.teamMember.findFirst({
          where: {
            userId: ctx.user.id,
            teamId: task.teamId
          }
        });

        if (!isMember) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this task' });
        }

        const deletedTask = await prisma.task.delete({ where: { id: input } });
        console.log('Deleted task:', deletedTask);
        return deletedTask;
      } catch (error) {
        console.error('Error deleting task:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete task' });
      }
    }),

  getFiltered: protectedProcedure
    .input(z.object({
      filter: z.enum(['all', 'pending', 'assigned']),
      teamMemberId: z.number(),
      projectId: z.number().optional(),
      teamId: z.number().optional(),
      creatorId: z.number().optional(),
      assigneeId: z.number().optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        let whereClause: Prisma.TaskWhereInput = {
          team: {
            members: {
              some: { userId: ctx.user.id }
            }
          }
        };

        if (input.teamId) {
          whereClause.teamId = input.teamId;
        }

        switch (input.filter) {
          case 'pending':
            whereClause.status = 'pending';
            break;
          case 'assigned':
            whereClause.assigneeId = input.teamMemberId;
            break;
          // 'all' doesn't need any additional filters
        }

        if (input.projectId) {
          whereClause.projectId = input.projectId;
        }

        if (input.creatorId) {
          whereClause.creatorId = input.creatorId;
        }

        if (input.assigneeId) {
          whereClause.assigneeId = input.assigneeId;
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
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch filtered tasks' });
      }
    }),
});