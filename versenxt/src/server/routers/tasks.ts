import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import { TRPCError } from '@trpc/server';

const taskInputSchema = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional().nullable(),
  projectId: z.number().nullable(),
  mainStageId: z.number().optional().nullable(),
  subStageId: z.number().optional().nullable(),
  teamId: z.number(),
  assigneeId: z.number().optional().nullable(),
});

export const taskRouter = router({
  getAll: protectedProcedure
  .input(z.object({
    projectId: z.number().nullable().optional(),
    mainStageId: z.number().optional(),
    subStageId: z.number().optional(),
    teamId: z.number().optional(),
    creatorId: z.number().optional(),
    assigneeId: z.number().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  }))
  .query(async ({ input, ctx }) => {
    try {
      const tasks = await prisma.task.findMany({
        where: {
          projectId: input.projectId,
          mainStageId: input.mainStageId,
          subStageId: input.subStageId,
          teamId: input.teamId,
          creatorId: input.creatorId,
          assigneeId: input.assigneeId,
          status: input.status,
          priority: input.priority,
          team: {
            members: {
              some: { userId: ctx.user.id }
            }
          }
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          project: { select: { id: true, title: true } },
          mainStage: { select: { id: true, name: true } },
          subStage: { select: { id: true, name: true } },
          team: { select: { id: true, name: true } },
          creator: { select: { id: true, user: { select: { id: true, name: true } } } },
          assignee: { select: { id: true, user: { select: { id: true, name: true } } } }
        },
        orderBy: [
          { priority: 'desc' },
          { status: 'asc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ]
      });
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch tasks' });
    }
  }),


  // create: protectedProcedure
  //   .input(taskInputSchema)
  //   .mutation(async ({ input, ctx }) => {
  //     try {
  //       const creatorTeamMember = await prisma.teamMember.findFirst({
  //         where: {
  //           userId: ctx.user.id,
  //           teamId: input.teamId,
  //         },
  //       });

  //       if (!creatorTeamMember) {
  //         throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not a member of this team' });
  //       }

  //       const data: Prisma.TaskCreateInput = {
  //         title: input.title,
  //         description: input.description,
  //         status: input.status,
  //         priority: input.priority,
  //         dueDate: input.dueDate ? new Date(input.dueDate) : null,
  //         team: { connect: { id: input.teamId } },
  //         creator: { connect: { id: creatorTeamMember.id } },
  //         project: { connect: { id: input.projectId } },
  //         ...(input.mainStageId && { mainStage: { connect: { id: input.mainStageId } } }),
  //         ...(input.subStageId && { subStage: { connect: { id: input.subStageId } } }),
  //         ...(input.assigneeId && { assignee: { connect: { id: input.assigneeId } } }),
  //       };

  //       const newTask = await prisma.task.create({
  //         data,
  //         include: {
  //           project: true,
  //           mainStage: true,
  //           subStage: true,
  //           team: true,
  //           creator: { include: { user: true } },
  //           assignee: { include: { user: true } }
  //         }
  //       });

  //       return newTask;
  //     } catch (error) {
  //       console.error('Error creating task:', error);
  //       if (error instanceof TRPCError) throw error;
  //       throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create task' });
  //     }
  //   }),


  // server/routers/tasks.ts

  create: protectedProcedure
  .input(taskInputSchema.extend({
    projectId: z.number().nullable().optional(),
    mainStageId: z.number().optional(),
    subStageId: z.number().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      const creatorTeamMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: input.teamId,
        },
      });

      if (!creatorTeamMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not a member of this team' });
      }

      const data: Prisma.TaskCreateInput = {
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        team: { connect: { id: input.teamId } },
        creator: { connect: { id: creatorTeamMember.id } },
        ...(input.projectId && { project: { connect: { id: input.projectId } } }),
        ...(input.mainStageId && { mainStage: { connect: { id: input.mainStageId } } }),
        ...(input.subStageId && { subStage: { connect: { id: input.subStageId } } }),
        ...(input.assigneeId && { assignee: { connect: { id: input.assigneeId } } }),
      };

      const newTask = await prisma.task.create({
        data,
        include: {
          project: true,
          mainStage: true,
          subStage: true,
          team: true,
          creator: { include: { user: true } },
          assignee: { include: { user: true } }
        }
      });

      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create task' });
    }
  }),

    update: protectedProcedure
    .input(taskInputSchema.extend({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const existingTask = await prisma.task.findUnique({
          where: { id: input.id },
          include: { team: true }
        });
  
        if (!existingTask) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
        }
  
        const isMember = await prisma.teamMember.findFirst({
          where: {
            userId: ctx.user.id,
            teamId: existingTask.teamId
          }
        });
  
        if (!isMember) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update this task' });
        }
  
        const { id, ...updateData } = input;
  
        const updatedTask = await prisma.task.update({
          where: { id },
          data: {
            title: updateData.title,
            description: updateData.description,
            status: updateData.status,
            priority: updateData.priority,
            dueDate: updateData.dueDate ? new Date(updateData.dueDate) : null,
            project: updateData.projectId 
            ?{ connect: { id: updateData.projectId } }
            : { disconnect: true },
            mainStage: updateData.mainStageId 
              ? { connect: { id: updateData.mainStageId } } 
              : { disconnect: true },
            subStage: updateData.subStageId 
              ? { connect: { id: updateData.subStageId } } 
              : { disconnect: true },
            assignee: updateData.assigneeId 
              ? { connect: { id: updateData.assigneeId } } 
              : { disconnect: true },
            team: { connect: { id: updateData.teamId } },
          },
          include: {
            project: true,
            mainStage: true,
            subStage: true,
            team: true,
            creator: { include: { user: true } },
            assignee: { include: { user: true } }
          }
        });
  
        return updatedTask;
      } catch (error) {
        console.error('Error updating task:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: 'Failed to update task',
          cause: error
        });
      }
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id, ctx }) => {
      try {
        const task = await prisma.task.findUnique({
          where: { id },
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

        await prisma.task.delete({ where: { id } });
        return { success: true };
      } catch (error) {
        console.error('Error deleting task:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete task' });
      }
    }),

  getTasksForUser: protectedProcedure
    .input(z.object({
      filter: z.enum(['all', 'assigned', 'created', 'pending', 'completed']),
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

        switch (input.filter) {
          case 'assigned':
            whereClause.assignee = { userId: ctx.user.id };
            break;
          case 'created':
            whereClause.creator = { userId: ctx.user.id };
            break;
          case 'pending':
            whereClause.status = { in: ['PENDING', 'IN_PROGRESS'] };
            whereClause.OR = [
              { assignee: { userId: ctx.user.id } },
              { creator: { userId: ctx.user.id } }
            ];
            break;
          case 'completed':
            whereClause.status = 'COMPLETED';
            whereClause.OR = [
              { assignee: { userId: ctx.user.id } },
              { creator: { userId: ctx.user.id } }
            ];
            break;
        }

        const tasks = await prisma.task.findMany({
          where: whereClause,
          include: {
            project: true,
            mainStage: true,
            subStage: true,
            team: true,
            creator: { include: { user: true } },
            assignee: { include: { user: true } }
          },
          orderBy: [
            { priority: 'desc' },
            { status: 'asc' },
            { dueDate: 'asc' },
            { createdAt: 'desc' }
          ]
        });

        return tasks;
      } catch (error) {
        console.error('Error fetching tasks for user:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch tasks for user' });
      }
    }),
});