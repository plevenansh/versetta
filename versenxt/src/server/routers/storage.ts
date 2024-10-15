// src/server/routers/storage.ts

import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import prisma from '../../lib/prisma';
import { containerClient } from '../../lib/azureStorage';
import { BlobSASPermissions } from '@azure/storage-blob';

export const storageRouter = router({
  getUploadUrl: protectedProcedure
  .input(z.object({
    fileName: z.string(),
    contentType: z.string(),
    teamId: z.number(),
    projectId: z.number().optional(),
    subStageId: z.number().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('getUploadUrl input:', JSON.stringify(input, null, 2));
    try {
      // Verify team membership
      const teamMember = await prisma.teamMember.findFirst({
        where: { userId: ctx.user.id, teamId: input.teamId },
      });
      if (!teamMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not a member of this team' });
      }

      const blobName = `${input.teamId}/${input.projectId || 'team'}/${input.subStageId || 'project'}/${Date.now()}-${input.fileName}`;
      console.log('Generated blobName:', blobName);

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      console.log('BlockBlobClient created');

      const sasPermissions = new BlobSASPermissions();
      sasPermissions.read = true;
      sasPermissions.create = true;
      sasPermissions.write = true;
      
      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions: sasPermissions,
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
      });
      console.log('SAS URL generated');

      const storage = await prisma.storage.create({
        data: {
          name: input.fileName,
          type: 'OTHER',
          url: blockBlobClient.url,
          blobName,
          contentType: input.contentType,
          size: 0,
          teamId: input.teamId,
          projectId: input.projectId,
          subStageId: input.subStageId,
          creatorId: teamMember.id,
        },
      });
      console.log('Storage entry created:', storage.id);

      return { sasUrl, storageId: storage.id };
    } catch (error) {
      console.error('Error in getUploadUrl:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate upload URL',
        cause: error,
      });
    }
  }),

  getViewUrl: protectedProcedure
  .input(z.number())
  .mutation(async ({ input: fileId, ctx }) => {
    const storage = await prisma.storage.findUnique({
      where: { id: fileId },
      include: { team: { include: { members: true } } },
    });

    if (!storage) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' });
    }

    const isMember = storage.team.members.some(member => member.userId === ctx.user.id);
    if (!isMember) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this file' });
    }

    const blockBlobClient = containerClient.getBlockBlobClient(storage.blobName);
    const sasPermissions = new BlobSASPermissions();
    sasPermissions.read = true;

    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: sasPermissions,
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
    });

    return { sasUrl, contentType: storage.contentType };
  }),

getDownloadUrl: protectedProcedure
  .input(z.number())
  .mutation(async ({ input: fileId, ctx }) => {
    const storage = await prisma.storage.findUnique({
      where: { id: fileId },
      include: { team: { include: { members: true } } },
    });

    if (!storage) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' });
    }

    const isMember = storage.team.members.some(member => member.userId === ctx.user.id);
    if (!isMember) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this file' });
    }

    const blockBlobClient = containerClient.getBlockBlobClient(storage.blobName);
    const sasPermissions = new BlobSASPermissions();
    sasPermissions.read = true;

    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: sasPermissions,
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
      contentDisposition: `attachment; filename="${storage.name}"`,
    });

    return { sasUrl, fileName: storage.name };
  }),

  deleteFile: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      const storage = await prisma.storage.findUnique({
        where: { id: input },
        include: { team: { include: { members: true } } },
      });

      if (!storage) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' });
      }

      const isMember = storage.team.members.some(member => member.userId === ctx.user.id);
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this file' });
      }

      const blockBlobClient = containerClient.getBlockBlobClient(storage.blobName);
      await blockBlobClient.delete();

      await prisma.storage.delete({ where: { id: input } });

      return { success: true };
    }),

  listFiles: protectedProcedure
    .input(z.object({
      teamId: z.number(),
      projectId: z.number().optional(),
      subStageId: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const isMember = await prisma.teamMember.findFirst({
        where: { userId: ctx.user.id, teamId: input.teamId },
      });

      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this team' });
      }

      const files = await prisma.storage.findMany({
        where: {
          teamId: input.teamId,
          projectId: input.projectId,
          subStageId: input.subStageId,
        },
        include: {
          creator: { include: { user: true } },
        },
      });

      return files;
    }),
});