// src/server/routers/storage.ts

import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import prisma from '../../lib/prisma';
import { containerClient } from '../../lib/azureStorage';
import { BlobSASPermissions } from '@azure/storage-blob';
import { Prisma} from '@prisma/client';

const StorageTypeEnum = z.enum([
  'THUMBNAIL',
  'RAW_FOOTAGE',
  'FINISHED_VIDEO',
  'INSPIRATION',
  'STORYBOARD',
  'PROJECT_ASSET',
  'TEAM_ASSET',
  'CUSTOM'
]);


export const storageRouter = router({
 // Folder Management
 createFolder: protectedProcedure
 .input(z.object({
   name: z.string(),
   teamId: z.number(),
   parentPath: z.string().optional(),
 }))
 .mutation(async ({ input, ctx }) => {
   const teamMember = await prisma.teamMember.findFirst({
     where: { userId: ctx.user.id, teamId: input.teamId },
   });

   if (!teamMember) {
     throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a team member' });
   }

   const path = input.parentPath 
     ? `${input.parentPath}/${input.name}` 
     : `teams/${input.teamId}/${input.name}`;

   return prisma.folder.create({
     data: {
       name: input.name,
       path,
       parentPath: input.parentPath,
       teamId: input.teamId,
       creatorId: teamMember.id,
     },
   });
 }),

getFolderStructure: protectedProcedure
 .input(z.object({
   teamId: z.number(),
   parentPath: z.string().optional(),
 }))
 .query(async ({ input, ctx }) => {
   const teamMember = await prisma.teamMember.findFirst({
     where: { userId: ctx.user.id, teamId: input.teamId },
   });

   if (!teamMember) {
     throw new TRPCError({ code: 'FORBIDDEN' });
   }

   const folders = await prisma.folder.findMany({
     where: {
       teamId: input.teamId,
       parentPath: input.parentPath || null,
     },
     include: {
       creator: {
         include: { user: true }
       },
       files: {
         select: {
           id: true,
           name: true,
           type: true,
           size: true,
           createdAt: true,
         }
       }
     },
   });

   return folders;
 }),

// File Upload
getUploadUrl: protectedProcedure
 .input(z.object({
   fileName: z.string(),
   contentType: z.string(),
   teamId: z.number(),
   projectId: z.number().optional(),
   subStageId: z.number().optional(),
   folderId: z.number().optional(),
   type: StorageTypeEnum,
   tags: z.array(z.string()).optional(),
   metadata: z.record(z.any()).optional(),
 }))
 .mutation(async ({ input, ctx }) => {
   const teamMember = await prisma.teamMember.findFirst({
     where: { userId: ctx.user.id, teamId: input.teamId },
   });

   if (!teamMember) {
     throw new TRPCError({ code: 'FORBIDDEN' });
   }

   // Construct blob path based on context
   let blobPath = `teams/${input.teamId}`;
   
   if (input.projectId) {
     blobPath += `/projects/${input.projectId}`;
     if (input.subStageId) {
       blobPath += `/substages/${input.subStageId}`;
     }
   }

   // Add type-specific directory
   switch (input.type) {
     case 'THUMBNAIL':
       blobPath += '/thumbnails';
       break;
     case 'RAW_FOOTAGE':
       blobPath += '/raw-footage';
       break;
     case 'FINISHED_VIDEO':
       blobPath += '/finished-videos';
       break;
     case 'INSPIRATION':
       blobPath += '/inspiration';
       break;
     case 'STORYBOARD':
       blobPath += '/storyboard';
       break;
   }

   const blobName = `${blobPath}/${Date.now()}-${input.fileName}`;
   const blockBlobClient = containerClient.getBlockBlobClient(blobName);

   const sasUrl = await blockBlobClient.generateSasUrl({
     permissions: BlobSASPermissions.parse("rcw"),
     expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
   });

   const storage = await prisma.storage.create({
     data: {
       name: input.fileName,
       type: input.type,
       url: blockBlobClient.url,
       blobName,
       path: blobPath,
       contentType: input.contentType,
       teamId: input.teamId,
       projectId: input.projectId,
       subStageId: input.subStageId,
       folderId: input.folderId,
       creatorId: teamMember.id,
       tags: input.tags || [],
       metadata: input.metadata || {},
       starred: false,
     },
   });

   return { sasUrl, storageId: storage.id };
 }),

 toggleStarred: protectedProcedure
  .input(z.object({
    fileId: z.number(),
    starred: z.boolean(),
  }))
  .mutation(async ({ input, ctx }) => {
    const file = await prisma.storage.findUnique({
      where: { id: input.fileId },
      include: { team: { include: { members: true } } },
    });

    if (!file) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    const isMember = file.team.members.some(member => member.userId === ctx.user.id);
    if (!isMember) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    return prisma.storage.update({
      where: { id: input.fileId },
      data: { starred: input.starred },
    });
  }),

// File Management
listFiles: protectedProcedure
  .input(z.object({
    teamId: z.number(),
    projectId: z.number().optional(),
    subStageId: z.number().optional(),
    folderId: z.number().optional(),
    type: StorageTypeEnum.optional(),
    tags: z.array(z.string()).optional(),
    search: z.string().optional(),
        sortBy: z.enum(['name', 'createdAt', 'size', 'type', 'starred']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.number().optional(),
    pageSize: z.number().optional(),
  }))
  .query(async ({ input, ctx }) => {
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: ctx.user.id, teamId: input.teamId },
    });

    if (!teamMember) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    // Construct the where clause
    const where: Prisma.StorageWhereInput = {
      teamId: input.teamId,
      ...(input.projectId && { projectId: input.projectId }),
      ...(input.subStageId && { subStageId: input.subStageId }),
      ...(input.folderId && { folderId: input.folderId }),
      ...(input.type && { type: input.type }),
      ...(input.tags?.length && { tags: { hasEvery: input.tags } }),
      ...(input.search && {
        name: {
          contains: input.search,
          mode: 'insensitive' as Prisma.QueryMode
        }
      })
    };

    const [files, total] = await Promise.all([
      prisma.storage.findMany({
        where,
        include: {
          creator: { include: { user: true } },
          project: true,
          subStage: true,
          folder: true,
        },
        orderBy: input.sortBy ? {
          [input.sortBy]: input.sortOrder || 'desc'
        } : undefined,
        skip: input.page ? (input.page - 1) * (input.pageSize || 10) : undefined,
        take: input.pageSize,
      }),
      prisma.storage.count({ where })
    ]);

    // Generate SAS URLs for each file
    const filesWithUrls = await Promise.all(files.map(async (file) => {
      const blockBlobClient = containerClient.getBlockBlobClient(file.blobName);
      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions: BlobSASPermissions.parse("r"),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
      });
      return { ...file, sasUrl };
    }));

    return {
      files: filesWithUrls,
      total,
      page: input.page || 1,
      pageSize: input.pageSize || 10,
      totalPages: Math.ceil(total / (input.pageSize || 10)),
    };
  }),

moveFile: protectedProcedure
 .input(z.object({
   fileId: z.number(),
   destinationFolderId: z.number().optional(),
   destinationPath: z.string(),
 }))
 .mutation(async ({ input, ctx }) => {
   const file = await prisma.storage.findUnique({
     where: { id: input.fileId },
     include: { team: { include: { members: true } } },
   });

   if (!file) {
     throw new TRPCError({ code: 'NOT_FOUND' });
   }

   const isMember = file.team.members.some(member => member.userId === ctx.user.id);
   if (!isMember) {
     throw new TRPCError({ code: 'FORBIDDEN' });
   }

   // Move the blob to new location
   const sourceBlob = containerClient.getBlockBlobClient(file.blobName);
   const newBlobName = `${input.destinationPath}/${file.name}`;
   const destinationBlob = containerClient.getBlockBlobClient(newBlobName);

   await destinationBlob.beginCopyFromURL(sourceBlob.url);
   await sourceBlob.delete();

   // Update database record
   return prisma.storage.update({
     where: { id: input.fileId },
     data: {
       blobName: newBlobName,
       path: input.destinationPath,
       folderId: input.destinationFolderId,
     },
   });
 }),

updateFileTags: protectedProcedure
 .input(z.object({
   fileId: z.number(),
   tags: z.array(z.string()),
 }))
 .mutation(async ({ input, ctx }) => {
   const file = await prisma.storage.findUnique({
     where: { id: input.fileId },
     include: { team: { include: { members: true } } },
   });

   if (!file) {
     throw new TRPCError({ code: 'NOT_FOUND' });
   }

   const isMember = file.team.members.some(member => member.userId === ctx.user.id);
   if (!isMember) {
     throw new TRPCError({ code: 'FORBIDDEN' });
   }

   return prisma.storage.update({
     where: { id: input.fileId },
     data: { tags: input.tags },
   });
 }),

updateFileMetadata: protectedProcedure
 .input(z.object({
   fileId: z.number(),
   metadata: z.record(z.any()),
 }))
 .mutation(async ({ input, ctx }) => {
   const file = await prisma.storage.findUnique({
     where: { id: input.fileId },
     include: { team: { include: { members: true } } },
   });

   if (!file) {
     throw new TRPCError({ code: 'NOT_FOUND' });
   }

   const isMember = file.team.members.some(member => member.userId === ctx.user.id);
   if (!isMember) {
     throw new TRPCError({ code: 'FORBIDDEN' });
   }

   return prisma.storage.update({
     where: { id: input.fileId },
     data: { metadata: input.metadata },
   });
 }),

getFileDetails: protectedProcedure
 .input(z.number())
 .query(async ({ input, ctx }) => {
   const file = await prisma.storage.findUnique({
     where: { id: input },
     include: {
       creator: { include: { user: true } },
       project: true,
       subStage: true,
       folder: true,
       team: { include: { members: true } },
     },
   });

   if (!file) {
     throw new TRPCError({ code: 'NOT_FOUND' });
   }

   const isMember = file.team.members.some(member => member.userId === ctx.user.id);
   if (!isMember) {
     throw new TRPCError({ code: 'FORBIDDEN' });
   }

   const blockBlobClient = containerClient.getBlockBlobClient(file.blobName);
   const sasUrl = await blockBlobClient.generateSasUrl({
     permissions: BlobSASPermissions.parse("r"),
     expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
   });

   return { ...file, sasUrl };
 }),

deleteFile: protectedProcedure
 .input(z.number())
 .mutation(async ({ input, ctx }) => {
   const file = await prisma.storage.findUnique({
     where: { id: input },
     include: { team: { include: { members: true } } },
   });

   if (!file) {
     throw new TRPCError({ code: 'NOT_FOUND' });
   }

   const isMember = file.team.members.some(member => member.userId === ctx.user.id);
   if (!isMember) {
     throw new TRPCError({ code: 'FORBIDDEN' });
   }

   const blockBlobClient = containerClient.getBlockBlobClient(file.blobName);
   await blockBlobClient.delete();

   await prisma.storage.delete({ where: { id: input } });

   return { success: true };
 }),


 getViewUrl: protectedProcedure
  .input(z.number())
  .mutation(async ({ input: fileId, ctx }) => {
    const storage = await prisma.storage.findUnique({
      where: { id: fileId },
      include: { 
        team: { include: { members: true } },
        project: { select: { title: true } },
        subStage: { select: { name: true } },
        folder: { select: { name: true, path: true } },
        creator: { include: { user: { select: { name: true } } } }
      },
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

    // Get file metadata from Azure Blob Storage
    const properties = await blockBlobClient.getProperties();

    return { 
      sasUrl,
      fileDetails: {
        name: storage.name,
        contentType: storage.contentType,
        size: storage.size,
        type: storage.type,
        path: storage.path,
        project: storage.project?.title,
        subStage: storage.subStage?.name,
        folder: storage.folder?.name,
        creator: storage.creator.user.name,
        createdAt: storage.createdAt,
        updatedAt: storage.updatedAt,
        metadata: storage.metadata,
        tags: storage.tags,
        blobProperties: {
          lastModified: properties.lastModified,
          contentLength: properties.contentLength,
          contentType: properties.contentType,
          contentMD5: properties.contentMD5,
        }
      }
    };
  }),

getDownloadUrl: protectedProcedure
  .input(z.object({
    fileId: z.number(),
    disposition: z.enum(['inline', 'attachment']).default('attachment'),
  }))
  .mutation(async ({ input, ctx }) => {
    const storage = await prisma.storage.findUnique({
      where: { id: input.fileId },
      include: { 
        team: { include: { members: true } },
        project: { select: { title: true } },
        folder: { select: { path: true } }
      },
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

    // Generate a more descriptive filename
    let fileName = storage.name;
    if (storage.project) {
      fileName = `${storage.project.title}_${fileName}`;
    }
    if (storage.folder) {
      fileName = `${storage.folder.path.split('/').pop()}_${fileName}`;
    }

    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: sasPermissions,
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
      contentDisposition: `${input.disposition}; filename="${encodeURIComponent(fileName)}"`,
      contentType: storage.contentType || 'application/octet-stream',
    });

    return { 
      sasUrl, 
      fileName,
      fileDetails: {
        name: storage.name,
        size: storage.size,
        contentType: storage.contentType,
        type: storage.type,
        project: storage.project?.title,
        path: storage.path,
      }
    };
  }),

  getStarredFiles: protectedProcedure
  .input(z.object({
    teamId: z.number(),
    projectId: z.number().optional(),
    subStageId: z.number().optional(),
  }))
  .query(async ({ input, ctx }) => {
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: ctx.user.id, teamId: input.teamId },
    });

    if (!teamMember) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    const where: Prisma.StorageWhereInput = {
      teamId: input.teamId,
      starred: true,
      ...(input.projectId && { projectId: input.projectId }),
      ...(input.subStageId && { subStageId: input.subStageId }),
    };

    const starredFiles = await prisma.storage.findMany({
      where,
      include: {
        creator: { include: { user: true } },
        project: true,
        subStage: true,
        folder: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate SAS URLs for each file
    const filesWithUrls = await Promise.all(starredFiles.map(async (file) => {
      const blockBlobClient = containerClient.getBlockBlobClient(file.blobName);
      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions: BlobSASPermissions.parse("r"),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
      });
      return { ...file, sasUrl };
    }));

    return filesWithUrls;
  }),

  // Add these procedures to your storage router

// Get storage statistics
getStorageStats: protectedProcedure
.input(z.object({
  teamId: z.number(),
  projectId: z.number().optional(),
}))
.query(async ({ input, ctx }) => {
  const teamMember = await prisma.teamMember.findFirst({
    where: { userId: ctx.user.id, teamId: input.teamId },
  });

  if (!teamMember) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  const where = {
    teamId: input.teamId,
    ...(input.projectId && { projectId: input.projectId }),
  };

  const [totalFiles, totalSize, typeStats] = await Promise.all([
    prisma.storage.count({ where }),
    prisma.storage.aggregate({
      where,
      _sum: { size: true },
    }),
    prisma.storage.groupBy({
      by: ['type'],
      where,
      _count: true,
      _sum: { size: true },
    }),
  ]);

  return {
    totalFiles,
    totalSize: totalSize._sum.size || 0,
    typeStats: typeStats.map(stat => ({
      type: stat.type,
      count: stat._count,
      size: stat._sum.size || 0,
    })),
  };
}),

// Get recent activity
getRecentActivity: protectedProcedure
.input(z.object({
  teamId: z.number(),
  limit: z.number().default(10),
}))
.query(async ({ input, ctx }) => {
  const teamMember = await prisma.teamMember.findFirst({
    where: { userId: ctx.user.id, teamId: input.teamId },
  });

  if (!teamMember) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  const recentFiles = await prisma.storage.findMany({
    where: { teamId: input.teamId },
    orderBy: { createdAt: 'desc' },
    take: input.limit,
    include: {
      creator: { include: { user: true } },
      project: true,
    },
  });

  return recentFiles;
}),

// Get favorite files
getFavorites: protectedProcedure
.input(z.object({
  teamId: z.number(),
}))
.query(async ({ input, ctx }) => {
  // Implement favorites functionality
}),

// Toggle file favorite status
toggleFavorite: protectedProcedure
.input(z.object({
  fileId: z.number(),
}))
.mutation(async ({ input, ctx }) => {
  // Implement favorite toggling
}),

// Batch operations
batchOperation: protectedProcedure
.input(z.object({
  fileIds: z.array(z.number()),
  operation: z.enum(['move', 'delete', 'tag', 'star']), 
  destinationFolderId: z.number().optional(),
  tags: z.array(z.string()).optional(),
  starred: z.boolean().optional(), 
}))
.mutation(async ({ input, ctx }) => {
  // Implement batch operations
}),
  
});