// src/server/routers/comments.ts

import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import prisma from '../../lib/prisma';

export const commentRouter = router({
  create: protectedProcedure
    .input(z.object({
      content: z.string(),
      projectId: z.number(),
      mainStageId: z.number().optional(),
      subStageId: z.number().optional(),
      parentId: z.number().optional(),
      mentions: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const teamMember = await prisma.teamMember.findFirst({
        where: { userId: ctx.user.id, team: { projects: { some: { id: input.projectId } } } },
      });

      if (!teamMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not a member of this project team' });
      }

      const comment = await prisma.comment.create({
        data: {
          content: input.content,
          projectId: input.projectId,
          mainStageId: input.mainStageId,
          subStageId: input.subStageId,
          authorId: teamMember.id,
          parentId: input.parentId,
          mentions: {
            create: input.mentions?.map(teamMemberId => ({ teamMemberId })) || [],
          },
        },
        include: {
          author: { include: { user: true } },
          mentions: { include: { teamMember: { include: { user: true } } } },
        },
      });

      return comment;
    }),

    getByProject: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      mainStageId: z.number().optional().nullable(),
      subStageId: z.number().optional().nullable(),
    }))
    .query(async ({ input, ctx }) => {
      const teamMember = await prisma.teamMember.findFirst({
        where: { userId: ctx.user.id, team: { projects: { some: { id: input.projectId } } } },
      });
  
      if (!teamMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not a member of this project team' });
      }
  
      const fetchComments = async (parentId: number | null = null): Promise<any[]> => {
        const comments = await prisma.comment.findMany({
          where: {
            projectId: input.projectId,
            mainStageId: input.mainStageId || undefined,
            subStageId: input.subStageId || undefined,
            parentId: parentId,
          },
          include: {
            author: { include: { user: true } },
            mentions: { include: { teamMember: { include: { user: true } } } },
            replies: true, // Include replies
          },
          orderBy: { createdAt: 'desc' },
        });
  
        for (let comment of comments) {
          comment.replies = await fetchComments(comment.id);
        }
  
        return comments;
      };
  
      const comments = await fetchComments();
  
      return comments;
    }),

  getReplies: protectedProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      const comment = await prisma.comment.findUnique({
        where: { id: input },
        include: { project: { include: { team: { include: { members: true } } } } },
      });

      if (!comment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Comment not found' });
      }

      const isMember = comment.project.team.members.some(member => member.userId === ctx.user.id);
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this comment' });
      }

      const replies = await prisma.comment.findMany({
        where: { parentId: input },
        include: {
          author: { include: { user: true } },
          mentions: { include: { teamMember: { include: { user: true } } } },
        },
        orderBy: { createdAt: 'asc' },
      });

      return replies;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      content: z.string(),
      mentions: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const comment = await prisma.comment.findUnique({
        where: { id: input.id },
        include: { author: true },
      });

      if (!comment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Comment not found' });
      }

      if (comment.author.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own comments' });
      }

      const updatedComment = await prisma.comment.update({
        where: { id: input.id },
        data: {
          content: input.content,
          mentions: {
            deleteMany: {},
            create: input.mentions?.map(teamMemberId => ({ teamMemberId })) || [],
          },
        },
        include: {
          author: { include: { user: true } },
          mentions: { include: { teamMember: { include: { user: true } } } },
        },
      });

      return updatedComment;
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      const comment = await prisma.comment.findUnique({
        where: { id: input },
        include: { author: true },
      });

      if (!comment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Comment not found' });
      }

      if (comment.author.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own comments' });
      }

      await prisma.comment.delete({ where: { id: input } });

      return { success: true };
    }),

  getMentionableUsers: protectedProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input },
        include: { team: { include: { members: { include: { user: true } } } } },
      });

      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }

      const isMember = project.team.members.some(member => member.userId === ctx.user.id);
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this project' });
      }

      return project.team.members.map(member => ({
        id: member.id,
        name: member.user.name,
      }));
    }),
});

export default commentRouter;