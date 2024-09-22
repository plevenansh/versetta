// src/server/routers/projectPage.ts

import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../../lib/prisma';

export const projectPageRouter = router({
  getProjectDetails: publicProcedure
    .input(z.number())
    .query(async ({ input: projectId }) => {
      return prisma.project.findUnique({
        where: { id: projectId },
        include: {
          stages: true,
          tasks: true,
          keyPoints: true,
          references: true,
          inspirations: true,
          keywords: true,
          equipment: true,
          storyboard: true,
          filmingSchedule: true,
          bRollIdeas: true,
          shotList: true,
          videoAssets: true,
          thumbnails: true,
          publishDetails: true,
        },
      });
    }),

  updateProjectDetails: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      concept: z.string().optional(),
      script: z.string().optional(),
      productionNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      return prisma.project.update({
        where: { id },
        data: updateData,
      });
    }),

  addKeyPoint: publicProcedure
    .input(z.object({
      projectId: z.number(),
      content: z.string(),
    }))
    .mutation(async ({ input }) => {
      return prisma.keyPoint.create({
        data: input,
      });
    }),

  updateKeyPoint: publicProcedure
    .input(z.object({
      id: z.number(),
      content: z.string().optional(),
      completed: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      return prisma.keyPoint.update({
        where: { id },
        data: updateData,
      });
    }),

  deleteKeyPoint: publicProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      return prisma.keyPoint.delete({
        where: { id },
      });
    }),

  addReference: publicProcedure
    .input(z.object({
      projectId: z.number(),
      title: z.string(),
      link: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return prisma.reference.create({
        data: input,
      });
    }),

  deleteReference: publicProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      return prisma.reference.delete({
        where: { id },
      });
    }),

  addInspiration: publicProcedure
    .input(z.object({
      projectId: z.number(),
      imageUrl: z.string(),
    }))
    .mutation(async ({ input }) => {
      return prisma.inspiration.create({
        data: input,
      });
    }),

  deleteInspiration: publicProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      return prisma.inspiration.delete({
        where: { id },
      });
    }),

  addKeyword: publicProcedure
    .input(z.object({
      projectId: z.number(),
      word: z.string(),
      volume: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return prisma.keyword.create({
        data: input,
      });
    }),

  deleteKeyword: publicProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      return prisma.keyword.delete({
        where: { id },
      });
    }),

  addEquipment: publicProcedure
    .input(z.object({
      projectId: z.number(),
      name: z.string(),
    }))
    .mutation(async ({ input }) => {
      return prisma.equipment.create({
        data: input,
      });
    }),

  updateEquipment: publicProcedure
    .input(z.object({
      id: z.number(),
      checked: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      return prisma.equipment.update({
        where: { id },
        data: updateData,
      });
    }),

  deleteEquipment: publicProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      return prisma.equipment.delete({
        where: { id },
      });
    }),

  addStoryboardFrame: publicProcedure
    .input(z.object({
      projectId: z.number(),
      imageUrl: z.string(),
      scene: z.number(),
    }))
    .mutation(async ({ input }) => {
      return prisma.storyboardFrame.create({
        data: input,
      });
    }),

  deleteStoryboardFrame: publicProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      return prisma.storyboardFrame.delete({
        where: { id },
      });
    }),

  addFilmingSession: publicProcedure
    .input(z.object({
      projectId: z.number(),
      scene: z.string(),
      time: z.string(),
      location: z.string(),
    }))
    .mutation(async ({ input }) => {
      return prisma.filmingSession.create({
        data: input,
      });
    }),

  deleteFilmingSession: publicProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      return prisma.filmingSession.delete({
        where: { id },
      });
    }),

  addBRollIdea: publicProcedure
    .input(z.object({
      projectId: z.number(),
      idea: z.string(),
    }))
    .mutation(async ({ input }) => {
      return prisma.bRollIdea.create({
        data: input,
      });
    }),

  deleteBRollIdea: publicProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      return prisma.bRollIdea.delete({
        where: { id },
      });
    }),

  addShot: publicProcedure
    .input(z.object({
      projectId: z.number(),
      description: z.string(),
    }))
    .mutation(async ({ input }) => {
      return prisma.shot.create({
        data: input,
      });
    }),

  updateShot: publicProcedure
    .input(z.object({
      id: z.number(),
      completed: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      return prisma.shot.update({
        where: { id },
        data: updateData,
      });
    }),

  deleteShot: publicProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      return prisma.shot.delete({
        where: { id },
      });
    }),

  addVideoAsset: publicProcedure
    .input(z.object({
      projectId: z.number(),
      title: z.string(),
      url: z.string(),
      type: z.string(),
    }))
    .mutation(async ({ input }) => {
      return prisma.videoAsset.create({
        data: input,
      });
    }),

  deleteVideoAsset: publicProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      return prisma.videoAsset.delete({
        where: { id },
      });
    }),

  addThumbnail: publicProcedure
    .input(z.object({
      projectId: z.number(),
      imageUrl: z.string(),
    }))
    .mutation(async ({ input }) => {
      return prisma.thumbnail.create({
        data: input,
      });
    }),
    updateThumbnail: publicProcedure
    .input(z.object({
      id: z.number(),
      selected: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      return prisma.thumbnail.update({
        where: { id },
        data: updateData,
      });
    }),

  deleteThumbnail: publicProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      return prisma.thumbnail.delete({
        where: { id },
      });
    }),

  updatePublishDetails: publicProcedure
    .input(z.object({
      projectId: z.number(),
      publishDate: z.string().optional(),
      platform: z.string().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { projectId, ...updateData } = input;
      return prisma.publishDetails.upsert({
        where: { projectId },
        update: updateData,
        create: { projectId, ...updateData },
      });
    }),

  getProjectAnalytics: publicProcedure
    .input(z.number())
    .query(async ({ input: projectId }) => {
      // This is a placeholder. In a real application, you would
      // integrate with a video platform's API to get actual analytics.
      return {
        views: Math.floor(Math.random() * 10000),
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 500),
        averageWatchTime: Math.floor(Math.random() * 600), // in seconds
      };
    }),

  addTask: publicProcedure
    .input(z.object({
      projectId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      assigneeId: z.number().optional(),
      dueDate: z.string().optional(),
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
      dueDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      return prisma.task.update({
        where: { id },
        data: updateData,
      });
    }),

  deleteTask: publicProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      return prisma.task.delete({
        where: { id },
      });
    }),

  updateProjectStage: publicProcedure
    .input(z.object({
      id: z.number(),
      completed: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      return prisma.projectStage.update({
        where: { id },
        data: updateData,
      });
    }),
});