// src/server/routers/projectPage.ts

import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../../lib/prisma';

export const projectPageRouter = router({
  getProjectDetails: publicProcedure
    .input(z.number())
    .query(async ({ input: projectId }) => {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          team: true,
          creator: { include: { user: true } },
          stages: { orderBy: { order: 'asc' } },
          tasks: {
            include: {
              creator: { include: { user: true } },
              assignee: { include: { user: true } }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!project) {
        throw new Error('Project not found');
      }

      return project;
    }),

  updateProjectDetails: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      return prisma.project.update({
        where: { id },
        data: updateData,
      });
    }),

  addProjectStage: publicProcedure
    .input(z.object({
      projectId: z.number(),
      stage: z.string(),
      order: z.number(),
    }))
    .mutation(async ({ input }) => {
      return prisma.projectStage.create({
        data: input,
      });
    }),

  updateProjectStage: publicProcedure
    .input(z.object({
      id: z.number(),
      completed: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      return prisma.projectStage.update({
        where: { id: input.id },
        data: { completed: input.completed },
      });
    }),

  addTask: publicProcedure
    .input(z.object({
      projectId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      assigneeId: z.number().optional(),
      dueDate: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      return prisma.task.create({
        data: input,
      });
    }),

  updateTask: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      assigneeId: z.number().optional(),
      dueDate: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      return prisma.task.update({
        where: { id },
        data: updateData,
      });
    }),

  addComment: publicProcedure
    .input(z.object({
      projectId: z.number(),
      userId: z.number(),
      content: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Assuming you add a Comment model to your schema
      return prisma.comment.create({
        data: input,
      });
    }),

  getProjectComments: publicProcedure
    .input(z.number())
    .query(async ({ input: projectId }) => {
      // Assuming you add a Comment model to your schema
      return prisma.comment.findMany({
        where: { projectId },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    }),

  uploadFile: publicProcedure
    .input(z.object({
      projectId: z.number(),
      fileName: z.string(),
      fileUrl: z.string(),
      fileType: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Assuming you add a ProjectFile model to your schema
      return prisma.projectFile.create({
        data: input,
      });
    }),

  getProjectFiles: publicProcedure
    .input(z.number())
    .query(async ({ input: projectId }) => {
      // Assuming you add a ProjectFile model to your schema
      return prisma.projectFile.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });
    }),

  updateProjectAnalytics: publicProcedure
    .input(z.object({
      projectId: z.number(),
      views: z.number(),
      likes: z.number(),
      comments: z.number(),
    }))
    .mutation(async ({ input }) => {
      // Assuming you add a ProjectAnalytics model to your schema
      return prisma.projectAnalytics.upsert({
        where: { projectId: input.projectId },
        update: input,
        create: input,
      });
    }),

  getProjectAnalytics: publicProcedure
    .input(z.number())
    .query(async ({ input: projectId }) => {
      // Assuming you add a ProjectAnalytics model to your schema
      return prisma.projectAnalytics.findUnique({
        where: { projectId },
      });
    }),

  addSponsor: publicProcedure
    .input(z.object({
      projectId: z.number(),
      name: z.string(),
      amount: z.number(),
      status: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Assuming you add a ProjectSponsor model to your schema
      return prisma.projectSponsor.create({
        data: input,
      });
    }),

  getProjectSponsors: publicProcedure
    .input(z.number())
    .query(async ({ input: projectId }) => {
      // Assuming you add a ProjectSponsor model to your schema
      return prisma.projectSponsor.findMany({
        where: { projectId },
      });
    }),
});