//projects.ts
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
          tasks: true,
          stages: true,
        },
        orderBy: [
          { completed: 'asc' }, // This will put completed projects at the bottom
          { endDate: 'asc' },
          { creationOrder: 'asc' }
        ]
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
         
             tasks: {
              include: {
                creator: { include: { user: true } },
                assignee: { include: { user: true } }
              }
            },
            team: true,
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

        
      getByTeamId: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        try {
          const projects = await prisma.project.findMany({
            where: { teamId: input },
            include: {
              team: true,
              tasks: true,
              stages: true,
            },
            orderBy: [
              { completed: 'asc' },
              { endDate: 'asc' },
              { creationOrder: 'asc' }
            ]
          });
          console.log(`Retrieved ${projects.length} projects for team ${input}`);
          return projects;
        } catch (error) {
          console.error(`Error fetching projects for team ${input}:`, error);
          throw new Error('Failed to fetch projects for team');
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
    creatorId: z.number(),
    stages: z.array(z.string()),
  }))
  .mutation(async ({ input }) => {
    console.log("Input received for project creation:", input);
    try {
      // First, check if the TeamMember exists
      const teamMember = await prisma.teamMember.findUnique({
        where: {
          userId_teamId: {
            userId: input.creatorId,
            teamId: input.teamId,
          },
        },
      });

      if (!teamMember) {
        throw new Error(`TeamMember not found for creatorId: ${input.creatorId} and teamId: ${input.teamId}`);
      }

      const data: Prisma.ProjectCreateInput = {
        title: input.title,
        description: input.description,
        status: input.status,
        startDate: input.startDate,
        endDate: input.endDate,
        creator: { connect: { id: teamMember.id } }, // Connect using the TeamMember id
        team: { connect: { id: input.teamId } },
        stages: {
          create: input.stages.map((stage, index) => ({ 
            stage, 
            completed: false,
            order: index
          }))
        }
      };
      console.log("Data to be created:", data);
      const createdProject = await prisma.project.create({ 
        data,
        include: {
          team: true,
          creator: true,
          stages: true
        }
      });
      console.log('Project created successfully:', createdProject);
      return createdProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project: ' + (error as Error).message);
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
    // Add stages to the input if you want to allow stage updates
    stages: z.array(z.object({
      id: z.number(),
      stage: z.string(),
      completed: z.boolean(),
      order: z.number()
    })).optional()
  }))
  .mutation(async ({ input }) => {
    console.log("Input received for project update:", input);
    try {
      const { id, teamId, stages, ...data } = input;

      // Fetch existing project with stages
      const existingProject = await prisma.project.findUnique({
        where: { id },
        include: { stages: true }
      });

      if (!existingProject) {
        throw new Error(`Project with id ${id} not found`);
      }

      const updateData: Prisma.ProjectUpdateInput = {
        ...data,
        startDate: data.startDate === undefined ? undefined : data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate === undefined ? undefined : data.endDate ? new Date(data.endDate) : null,
        team: teamId ? { connect: { id: teamId } } : undefined,
      };

      // If stages are provided in the input, update them
      if (input.stages) {
        await prisma.projectStage.deleteMany({ where: { projectId: input.id } });
        await prisma.projectStage.createMany({
          data: input.stages.map(stage => ({
            projectId: input.id,
            stage: stage.stage,
            completed: stage.completed,
            order: stage.order
          }))
        });
      }else {
        // If stages are not provided, keep the existing stages
        updateData.stages = {
          updateMany: existingProject.stages.map(stage => ({
            where: { id: stage.id },
            data: {
              completed: stage.completed,
              order: stage.order
            }
          }))
        };
      }

      const updatedProject = await prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          tasks: {
            include: {
              creator: { include: { user: true } },
              assignee: { include: { user: true } }
            }
          },
          team: true,
          stages: true
        }
      });

      console.log('Project updated successfully:', updatedProject);
      return updatedProject;
    } catch (error) {
      console.error(`Error updating project with id ${input.id}:`, error);
      throw new Error(`Failed to update project: ${(error as Error).message}`);
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
      // First, get the current stages for the project
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        include: { stages: true },
      });

      if (!project) {
        throw new Error(`Project with id ${input.projectId} not found`);
      }

      // Find the index of the stage we're updating
      const stageIndex = project.stages.findIndex(s => s.stage === input.stage);

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
          order: stageIndex !== -1 ? stageIndex : project.stages.length, // Use existing index or add to end
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
      // First, check if the project exists
      const project = await prisma.project.findUnique({
        where: { id: input },
        include: { stages: true, tasks: true }
      });

      if (!project) {
        throw new Error(`Project with id ${input} not found`);
      }

      // Use a transaction to ensure all operations succeed or fail together
      const result = await prisma.$transaction(async (prisma) => {
        // Delete related ProjectStage records
        console.log("Deleting ProjectStage records...");
        const deletedStages = await prisma.projectStage.deleteMany({
          where: { projectId: input },
        });
        console.log(`Deleted ${deletedStages.count} ProjectStage records`);

        // Delete related Task records
        console.log("Deleting Task records...");
        const deletedTasks = await prisma.task.deleteMany({
          where: { projectId: input },
        });
        console.log(`Deleted ${deletedTasks.count} Task records`);

        // Delete the project
        console.log("Deleting Project...");
        const deletedProject = await prisma.project.delete({
          where: { id: input },
        });
        console.log("Deleted Project:", deletedProject);

        return deletedProject;
      });

      console.log('Project and related records deleted successfully');
      return { success: true, deletedProject: result };
    } catch (error) {
      console.error(`Error deleting project with id ${input}:`, error);
      throw new Error(`Failed to delete project: ${(error as Error).message}`);
    }
  }),


  toggleProjectCompletion: publicProcedure
  .input(z.object({
    id: z.number(),
    completed: z.boolean()
  }))
  .mutation(async ({ input }) => {
    try {
      const updatedProject = await prisma.project.update({
        where: { id: input.id },
        data: { completed: input.completed },
        include: {
          team: true,
          tasks: true,
          stages: true
        }
      });
      return updatedProject;
    } catch (error) {
      console.error('Error toggling project completion:', error);
      throw new Error('Failed to toggle project completion');
    }
  }),
  
  // getByTeamId: publicProcedure
  //   .input(z.number())
  //   .query(async ({ input }) => {
  //     try {
  //       const projects = await prisma.project.findMany({
  //         where: { teamId: input },
  //         include: { 
  //           tasks: {
  //             include: {
  //               creator: { include: { user: true } },
  //               assignee: { include: { user: true } }
  //             }
  //           },
  //           team: true,
  //           stages: true
  //         }
  //       });
  //       console.log(`Retrieved ${projects.length} projects for user ${input}`);
  //       return projects;
  //     } catch (error) {
  //       console.error(`Error fetching projects for user ${input}:`, error);
  //       throw new Error('Failed to fetch projects for user');
  //     }
  //   }),
   
    getByTeamMemberId: publicProcedure
  .input(z.number())
  .query(async ({ input }) => {
    try {
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { creatorId: input },
            { tasks: { some: { creatorId: input } } },
            { tasks: { some: { assigneeId: input } } }
          ]
        },
        include: { 
          tasks: {
            include: {
              creator: { include: { user: true } },
              assignee: { include: { user: true } }
            }
          },
          team: true,
          stages: true,
          creator: { include: { user: true } }
        }
      });
      console.log(`Retrieved ${projects.length} projects for team member ${input}`);
      return projects;
    } catch (error) {
      console.error(`Error fetching projects for team member ${input}:`, error);
      throw new Error('Failed to fetch projects for team member');
    }
  }),

  getProjectsForCalendar: publicProcedure
  .input(z.object({
    teamId: z.number(),
    startDate: z.date(),
    endDate: z.date()
  }))
  .query(async ({ input }) => {
    try {
      const projects = await prisma.project.findMany({
        where: {
          teamId: input.teamId,
          endDate: {
            gte: input.startDate,
            lte: input.endDate
          }
        },
        select: {
          id: true,
          title: true,
          description: true,
          endDate: true,
          status: true
        },
        orderBy: {
          endDate: 'asc'
        }
      });
      return projects;
    } catch (error) {
      console.error('Error fetching projects for calendar:', error);
      throw new Error('Failed to fetch projects for calendar');
    }
  }),
  
});
