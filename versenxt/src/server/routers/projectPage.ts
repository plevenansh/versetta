 // src/server/routers/projectPage.ts



 import { router, protectedProcedure } from '../trpc';
 import { z } from 'zod';
 import prisma from '../../lib/prisma';
 import { TRPCError } from '@trpc/server';
 
 export const projectPageRouter = router({
  getProjectDetails: protectedProcedure
  .input(z.number())
  .query(async ({ input, ctx }) => {
    const project = await prisma.project.findUnique({
      where: { id: input },
      include: {
        team: { select: { id: true, name: true } },
        creator: { select: { id: true, user: { select: { id: true, name: true } } } },
      }
    });

    if (!project) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
    }

    const isMember = await prisma.teamMember.findFirst({
      where: { userId: ctx.user.id, teamId: project.team.id }
    });

    if (!isMember) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this project' });
    }

    // Fetch main stages separately
    const mainStages = await prisma.mainStage.findMany({
      where: { projectId: input },
      include: { subStages: { select: { id: true, name: true, enabled: true, starred: true } } }
    });

    // Fetch tasks separately
    const tasks = await prisma.task.findMany({
      where: { projectId: input },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        assignee: { select: { id: true, user: { select: { id: true, name: true } } } },
        creator: { select: { id: true, user: { select: { id: true, name: true } } } }
      }
    });

    return { ...project, mainStages, tasks };
  }),
 
   updateMainStage: protectedProcedure
     .input(z.object({
       id: z.number(),
       name: z.string().optional(),
       starred: z.boolean().optional(),
     }))
     .mutation(async ({ input, ctx }) => {
       const mainStage = await prisma.mainStage.findUnique({
         where: { id: input.id },
         include: { project: { include: { team: { include: { members: true } } } } }
       });
 
       if (!mainStage) {
         throw new TRPCError({ code: 'NOT_FOUND', message: 'Main stage not found' });
       }
 
       const isMember = mainStage.project.team.members.some(member => member.userId === ctx.user.id);
       if (!isMember) {
         throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update this main stage' });
       }
 
       const updatedMainStage = await prisma.mainStage.update({
         where: { id: input.id },
         data: {
           name: input.name,
           starred: input.starred,
         },
         include: {
           subStages: true
         }
       });
 
       return updatedMainStage;
     }),
 
   updateSubStage: protectedProcedure
     .input(z.object({
       id: z.number(),
       name: z.string().optional(),
       enabled: z.boolean().optional(),
       starred: z.boolean().optional(),
       content: z.any().optional(),
     }))
     .mutation(async ({ input, ctx }) => {
       const subStage = await prisma.subStage.findUnique({
         where: { id: input.id },
         include: { project: { include: { team: { include: { members: true } } } } }
       });
 
       if (!subStage) {
         throw new TRPCError({ code: 'NOT_FOUND', message: 'Sub-stage not found' });
       }
 
       const isMember = subStage.project.team.members.some(member => member.userId === ctx.user.id);
       if (!isMember) {
         throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update this sub-stage' });
       }
 
       const updatedSubStage = await prisma.subStage.update({
         where: { id: input.id },
         data: {
           name: input.name,
           enabled: input.enabled,
           starred: input.starred,
           content: input.content,
         }
       });
 
       return updatedSubStage;
     }),

     getMainStages: protectedProcedure
     .input(z.number())
     .query(async ({ input }) => {
       const mainStages = await prisma.mainStage.findMany({
         where: { projectId: input },
         include: {
           subStages: {
             select: { id: true, name: true }
           }
         }
       });
       return mainStages;
     }),
   
   getSubStages: protectedProcedure
     .input(z.number())
     .query(async ({ input }) => {
       const subStages = await prisma.subStage.findMany({
         where: { projectId: input },
         select: { id: true, name: true }
       });
       return subStages;
     }),    
 
   // Add other project page specific procedures here
 });
 


 
 export default projectPageRouter;


