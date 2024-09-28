// src/server/routers/projectPage.ts

import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';

export const projectPageRouter = router({
  getProjectDetails: protectedProcedure
    .input(z.number())
    .query(async ({ input: projectId, ctx }) => {
      const project = await prisma.project.findUnique({
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
          team: true,
        },
      });

      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }

      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });

      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this project' });
      }

      return project;
    }),

  updateProjectDetails: protectedProcedure
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
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      const project = await prisma.project.findUnique({
        where: { id },
        include: { team: true },
      });

      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }

      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });

      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update this project' });
      }

      return prisma.project.update({
        where: { id },
        data: updateData,
      });
    }),

  addKeyPoint: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      content: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        include: { team: true },
      });

      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }

      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });

      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to add key points to this project' });
      }

      return prisma.keyPoint.create({
        data: input,
      });
    }),

  updateKeyPoint: protectedProcedure
    .input(z.object({
      id: z.number(),
      content: z.string().optional(),
      completed: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      const keyPoint = await prisma.keyPoint.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });

      if (!keyPoint) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Key point not found' });
      }

      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: keyPoint.project.teamId
        }
      });

      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update this key point' });
      }

      return prisma.keyPoint.update({
        where: { id },
        data: updateData,
      });
    }),

  deleteKeyPoint: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id, ctx }) => {
      const keyPoint = await prisma.keyPoint.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });

      if (!keyPoint) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Key point not found' });
      }

      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: keyPoint.project.teamId
        }
      });

      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this key point' });
      }

      return prisma.keyPoint.delete({
        where: { id },
      });
    }),

  addReference: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      title: z.string(),
      link: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        include: { team: true },
      });

      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }

      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });

      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to add references to this project' });
      }

      return prisma.reference.create({
        data: input,
      });
    }),

  deleteReference: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id, ctx }) => {
      const reference = await prisma.reference.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });

      if (!reference) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Reference not found' });
      }

      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: reference.project.teamId
        }
      });

      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this reference' });
      }

      return prisma.reference.delete({
        where: { id },
      });
    }),

  addInspiration: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      imageUrl: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        include: { team: true },
      });

      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }

      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });

      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to add inspirations to this project' });
      }

      return prisma.inspiration.create({
        data: input,
      });
    }),

  deleteInspiration: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id, ctx }) => {
      const inspiration = await prisma.inspiration.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });

      if (!inspiration) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Inspiration not found' });
      }

      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: inspiration.project.teamId
        }
      });

      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this inspiration' });
      }

      return prisma.inspiration.delete({
        where: { id },
      });
    }),

  addKeyword: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      word: z.string(),
      volume: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        include: { team: true },
      });

      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }

      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });

      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to add keywords to this project' });
      }

      return prisma.keyword.create({
        data: input,
      });
    }),

  deleteKeyword: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id, ctx }) => {
      const keyword = await prisma.keyword.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });

      if (!keyword) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Keyword not found' });
      }

      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: keyword.project.teamId
        }
      });

      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this keyword' });
      }

      return prisma.keyword.delete({
        where: { id },
      });
    }),

  addEquipment: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      name: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        include: { team: true },
      });

      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }

      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });

      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to add equipment to this project' });
      }

      return prisma.equipment.create({
        data: input,
      });
    }),

  updateEquipment: protectedProcedure
    .input(z.object({
      id: z.number(),
      checked: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      const equipment = await prisma.equipment.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });

      if (!equipment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Equipment not found' });
      }

      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: equipment.project.teamId
        }
      });

      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update this equipment' });
      }

      return prisma.equipment.update({
        where: { id },
        data: updateData,
      });
    }),

  deleteEquipment: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id, ctx }) => {
      const equipment = await prisma.equipment.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });

      if (!equipment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Equipment not found' });
      }

      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: equipment.project.teamId
        }
      });

      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this equipment' });
      }

      return prisma.equipment.delete({
        where: { id },
      });
    }),
    addStoryboardFrame: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      imageUrl: z.string(),
      scene: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        include: { team: true },
      });
  
      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to add storyboard frames to this project' });
      }
  
      return prisma.storyboardFrame.create({
        data: input,
      });
    }),
  
  deleteStoryboardFrame: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id, ctx }) => {
      const frame = await prisma.storyboardFrame.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });
  
      if (!frame) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Storyboard frame not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: frame.project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this storyboard frame' });
      }
  
      return prisma.storyboardFrame.delete({
        where: { id },
      });
    }),
  
  addFilmingSession: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      scene: z.string(),
      time: z.string(),
      location: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        include: { team: true },
      });
  
      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to add filming sessions to this project' });
      }
  
      return prisma.filmingSession.create({
        data: input,
      });
    }),
  
  deleteFilmingSession: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id, ctx }) => {
      const session = await prisma.filmingSession.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });
  
      if (!session) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Filming session not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: session.project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this filming session' });
      }
  
      return prisma.filmingSession.delete({
        where: { id },
      });
    }),
  
  addBRollIdea: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      idea: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        include: { team: true },
      });
  
      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to add B-roll ideas to this project' });
      }
  
      return prisma.bRollIdea.create({
        data: input,
      });
    }),
  
  deleteBRollIdea: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id, ctx }) => {
      const idea = await prisma.bRollIdea.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });
  
      if (!idea) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'B-roll idea not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: idea.project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this B-roll idea' });
      }
  
      return prisma.bRollIdea.delete({
        where: { id },
      });
    }),
  
  addShot: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      description: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        include: { team: true },
      });
  
      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to add shots to this project' });
      }
  
      return prisma.shot.create({
        data: input,
      });
    }),
  
  updateShot: protectedProcedure
    .input(z.object({
      id: z.number(),
      completed: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
      const shot = await prisma.shot.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });
  
      if (!shot) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Shot not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: shot.project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update this shot' });
      }
  
      return prisma.shot.update({
        where: { id },
        data: updateData,
      });
    }),
  
  deleteShot: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id, ctx }) => {
      const shot = await prisma.shot.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });
  
      if (!shot) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Shot not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: shot.project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this shot' });
      }
  
      return prisma.shot.delete({
        where: { id },
      });
    }),
  
  addVideoAsset: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      title: z.string(),
      url: z.string(),
      type: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        include: { team: true },
      });
  
      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to add video assets to this project' });
      }
  
      return prisma.videoAsset.create({
        data: input,
      });
    }),
  
  deleteVideoAsset: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id, ctx }) => {
      const asset = await prisma.videoAsset.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });
  
      if (!asset) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Video asset not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: asset.project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this video asset' });
      }
  
      return prisma.videoAsset.delete({
        where: { id },
      });
    }),
  
  addThumbnail: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      imageUrl: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        include: { team: true },
      });
  
      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to add thumbnails to this project' });
      }
  
      return prisma.thumbnail.create({
        data: input,
      });
    }),
  
  updateThumbnail: protectedProcedure
    .input(z.object({
      id: z.number(),
      selected: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
      const thumbnail = await prisma.thumbnail.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });
  
      if (!thumbnail) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Thumbnail not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: thumbnail.project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update this thumbnail' });
      }
  
      return prisma.thumbnail.update({
        where: { id },
        data: updateData,
      });
    }),
  
  deleteThumbnail: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id, ctx }) => {
      const thumbnail = await prisma.thumbnail.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });
  
      if (!thumbnail) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Thumbnail not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: thumbnail.project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this thumbnail' });
      }
  
      return prisma.thumbnail.delete({
        where: { id },
      });
    }),
  
  updatePublishDetails: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      publishDate: z.string().optional(),
      platform: z.string().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { projectId, ...updateData } = input;
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { team: true },
      });
  
      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update publish details for this project' });
      }
  
      return prisma.publishDetails.upsert({
        where: { projectId },
        update: updateData,
        create: { projectId, ...updateData },
      });
    }),
    getProjectAnalytics: protectedProcedure
    .input(z.number())
    .query(async ({ input: projectId, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { team: true },
      });
  
      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this project\'s analytics' });
      }
  
      // This is a placeholder. In a real application, you would
      // integrate with a video platform's API to get actual analytics.
      return {
        views: Math.floor(Math.random() * 10000),
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 500),
        averageWatchTime: Math.floor(Math.random() * 600), // in seconds
      };
    }),
  
  addTask: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      assigneeId: z.number().optional(),
      dueDate: z.string().optional(),
      teamId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { dueDate, ...restInput } = input;
  
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        include: { team: true },
      });
  
      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to add tasks to this project' });
      }
  
      const data: Prisma.TaskCreateInput = {
        ...restInput,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        project: { connect: { id: input.projectId } },
        team: { connect: { id: input.teamId } },
        creator: { connect: { id: isMember.id } },
        assignee: input.assigneeId ? { connect: { id: input.assigneeId } } : undefined,
      };
      return prisma.task.create({ data });
    }),
  
  // updateTask: protectedProcedure
  //   .input(z.object({
  //     id: z.number(),
  //     title: z.string().optional(),
  //     description: z.string().optional(),
  //     status: z.string().optional(),
  //     assigneeId: z.number().optional(),
  //     dueDate: z.string().optional(),
  //   }))
  //   .mutation(async ({ input, ctx }) => {
  //     const { id, dueDate, assigneeId, ...updateData } = input;
  
  //     const task = await prisma.task.findUnique({
  //       where: { id },
  //       include: { project: { include: { team: true } } },
  //     });
  
  //     if (!task) {
  //       throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
  //     }
  
  //     const isMember = await prisma.teamMember.findFirst({
  //       where: {
  //         userId: ctx.user.id,
  //         teamId: task.project.teamId
  //       }
  //     });
  
  //     if (!isMember) {
  //       throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update this task' });
  //     }
  
  //     const data: Prisma.TaskUpdateInput = {
  //       ...updateData,
  //       dueDate: dueDate ? new Date(dueDate) : undefined,
  //       assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
  //     };
  //     return prisma.task.update({
  //       where: { id },
  //       data,
  //     });
  //   }),
  
  // deleteTask: protectedProcedure
  //   .input(z.number())
  //   .mutation(async ({ input: id, ctx }) => {
  //     const task = await prisma.task.findUnique({
  //       where: { id },
  //       include: { project: { include: { team: true } } },
  //     });
  
  //     if (!task) {
  //       throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
  //     }
  
  //     const isMember = await prisma.teamMember.findFirst({
  //       where: {
  //         userId: ctx.user.id,
  //         teamId: task.project.teamId
  //       }
  //     });
  
  //     if (!isMember) {
  //       throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this task' });
  //     }
  
  //     return prisma.task.delete({
  //       where: { id },
  //     });
  //   }),
  
  updateProjectStage: protectedProcedure
    .input(z.object({
      id: z.number(),
      completed: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
  
      const projectStage = await prisma.projectStage.findUnique({
        where: { id },
        include: { project: { include: { team: true } } },
      });
  
      if (!projectStage) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project stage not found' });
      }
  
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: projectStage.project.teamId
        }
      });
  
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update this project stage' });
      }
  
      return prisma.projectStage.update({
        where: { id },
        data: updateData,
      });
    }),
  });