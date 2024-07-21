import { Prisma } from '@prisma/client';
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../../lib/prisma';

const defaultStages = ['Ideation', 'Scripting', 'Shooting', 'Editing', 'Subtitles', 'Thumbnail', 'Tags', 'Description'];

export const projectRouter = router({
  getAll: publicProcedure.query(async () => {
    try {
      const projects = await prisma.project.findMany({
        include: {
          team: true,
          user: true,
          tasks: true,
          stages: true,
        }
      });
      console.log(`Retrieved ${projects.length} projects`);
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        const project = await prisma.project.findUnique({ 
          where: { id: input },
          include: { 
            tasks: true,
            team: true,
            user: true,
            stages: true
          }
        });
        if (!project) {
          throw new Error(`Project with id ${input} not found`);
        }
        return project;
      } catch (error) {
        console.error(`Error fetching project with id ${input}:`, error);
        throw new Error('Failed to fetch project');
      }
    }),

    create: publicProcedure
  .input(z.object({
    title: z.string(),
    description: z.string().optional(),
    status: z.string().optional().default("active"),
    startDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
    endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
    teamId: z.number(),
    userId: z.number()
  }))
  .mutation(async ({ input }) => {
    console.log("Input received for project creation:", input);
    try {
      const stages = ['Ideation', 'Scripting', 'Shooting', 'Editing', 'Subtitles', 'Thumbnail', 'Tags', 'Description'];
      const data: Prisma.ProjectCreateInput = {
        title: input.title,
        description: input.description,
        status: input.status,
        startDate: input.startDate,
        endDate: input.endDate,
        team: { connect: { id: input.teamId } },
        user: { connect: { id: input.userId } },
        stages: {
          create: stages.map(stage => ({ stage, completed: false }))
        }
      };
      const createdProject = await prisma.project.create({ 
        data,
        include: {
          team: true,
          user: true,
          stages: true // Changed from ProjectStageStatus to stages
        }
      });
      console.log('Project created successfully:', createdProject);
      return createdProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }),
  update: publicProcedure
  .input(z.object({
    id: z.number(),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    teamId: z.number().optional(),
    userId: z.number().optional()
  }))
  .mutation(async ({ input }) => {
    console.log("Input received for project update:", input);
    try {
      const { id, teamId, userId, ...data } = input;
      const updateData: Prisma.ProjectUpdateInput = {
        ...data,
        startDate: data.startDate === undefined ? undefined : data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate === undefined ? undefined : data.endDate ? new Date(data.endDate) : null,
        team: teamId ? { connect: { id: teamId } } : undefined,
        user: userId ? { connect: { id: userId } } : undefined
      };

      const updatedProject = await prisma.project.update({ 
        where: { id }, 
        data: updateData,
        include: { 
          tasks: true,
          team: true,
          user: true,
          stages: true
        }
      });
      console.log('Project updated successfully:', updatedProject);
      return updatedProject;
    } catch (error) {
      console.error(`Error updating project with id ${input.id}:`, error);
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }),
 // In projectRouter.ts

 updateProjectStage: publicProcedure
 .input(z.object({
   projectId: z.number(),
   stage: z.string(),
   completed: z.boolean(),
 }))
 .mutation(async ({ input }) => {
   console.log("Input received for project stage update:", input);
   try {
     const updatedStage = await prisma.projectStage.upsert({
       where: {
         projectId_stage: {
           projectId: input.projectId,
           stage: input.stage,
         },
       },
       update: { completed: input.completed },
       create: {
         projectId: input.projectId,
         stage: input.stage,
         completed: input.completed,
       },
     });
     return updatedStage;
   } catch (error) {
     console.error('Error updating project stage:', error);
     throw new Error('Failed to update project stage');
   }
 }),
 delete: publicProcedure
  .input(z.number())
  .mutation(async ({ input }) => {
    console.log("Attempting to delete project with ID:", input);
    try {
      // Use a transaction to ensure all operations succeed or fail together
      await prisma.$transaction(async (prisma) => {
        // First, delete related ProjectStage records
        console.log("Deleting ProjectStage records...");
        const deletedStages = await prisma.projectStage.deleteMany({
          where: { projectId: input },
        });
        console.log(`Deleted ${deletedStages.count} ProjectStage records`);

        // Then, delete related Task records (if they exist)
        console.log("Deleting Task records...");
        const deletedTasks = await prisma.task.deleteMany({
          where: { projectId: input },
        });
        console.log(`Deleted ${deletedTasks.count} Task records`);

        // Finally, delete the project
        console.log("Deleting Project...");
        const deletedProject = await prisma.project.delete({
          where: { id: input },
        });
        console.log("Deleted Project:", deletedProject);
      });

      console.log('Project and related records deleted successfully');
      return { success: true };
    } catch (error) {
      console.error(`Error deleting project with id ${input}:`, error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }),


  getByUserId: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        const projects = await prisma.project.findMany({
          where: { userId: input },
          include: { 
            tasks: true,
            team: true,
            user: true
          }
        });
        console.log(`Retrieved ${projects.length} projects for user ${input}`);
        return projects;
      } catch (error) {
        console.error(`Error fetching projects for user ${input}:`, error);
        throw new Error('Failed to fetch projects for user');
      }
    }),

  getByTeamId: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        const projects = await prisma.project.findMany({
          where: { teamId: input },
          include: { 
            tasks: true,
            team: true,
            user: true
          }
        });
        console.log(`Retrieved ${projects.length} projects for team ${input}`);
        return projects;
      } catch (error) {
        console.error(`Error fetching projects for team ${input}:`, error);
        throw new Error('Failed to fetch projects for team');
      }
    }),
});
