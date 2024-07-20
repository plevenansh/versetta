import { Prisma } from '@prisma/client';
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../../lib/prisma';

export const projectRouter = router({
  getAll: publicProcedure.query(async () => {
    try {
      const projects = await prisma.project.findMany({
        include: {
          team: true,
          user: true,
          tasks: true
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
            user: true
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
      try {
        console.log("Input received for project creation:", input);
        const data: Prisma.ProjectCreateInput = {
          title: input.title,
          description: input.description,
          status: input.status,
          startDate: input.startDate,
          endDate: input.endDate,
          team: { connect: { id: input.teamId } },
          user: { connect: { id: input.userId } }
        };
        const createdProject = await prisma.project.create({ 
          data,
          include: {
            team: true,
            user: true
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
      startDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
      endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
      teamId: z.number().optional(),
      userId: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input;
        const updateData: Prisma.ProjectUpdateInput = {
          ...data,
          team: data.teamId ? { connect: { id: data.teamId } } : undefined,
          user: data.userId ? { connect: { id: data.userId } } : undefined
        };
        delete input.teamId;
        delete input.userId;

        const updatedProject = await prisma.project.update({ 
          where: { id }, 
          data: updateData,
          include: { 
            tasks: true,
            team: true,
            user: true
          }
        });
        console.log('Project updated successfully:', updatedProject);
        return updatedProject;
      } catch (error) {
        console.error(`Error updating project with id ${input.id}:`, error);
        throw new Error('Failed to update project');
      }
    }),

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      try {
        const deletedProject = await prisma.project.delete({ 
          where: { id: input },
          include: {
            tasks: true,
            team: true,
            user: true
          }
        });
        console.log('Project deleted successfully:', deletedProject);
        return deletedProject;
      } catch (error) {
        console.error(`Error deleting project with id ${input}:`, error);
        throw new Error('Failed to delete project');
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
