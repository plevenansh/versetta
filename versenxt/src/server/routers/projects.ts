import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';

export const projectRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const projects = await prisma.project.findMany({
        where: {
          team: {
            members: {
              some: { userId: ctx.user.id }
            }
          }
        },
        include: {
          team: true,
          tasks: true,
          mainStages: {
            include: {
              subStages: true
            }
          },
          creator: {
            include: {
              user: true
            }
          }
        },
        orderBy: [
          { completed: 'asc' },
          { endDate: 'asc' },
          { createdAt: 'asc' } // Replace creationOrder with createdAt
        ]
      });
      return projects;
    } catch (error) {
      console.error('Error fetching all projects:', error);
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch projects' });
    }
  }),
  
  getByTeamId: protectedProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        const isMember = await prisma.teamMember.findFirst({
          where: {
            userId: ctx.user.id,
            teamId: input
          }
        });
        if (!isMember) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this team\'s projects' });
        }
  
        const projects = await prisma.project.findMany({
          where: { teamId: input },
          include: {
            team: true,
            tasks: true,
            mainStages: {
              include: {
                subStages: true
              }
            },
            creator: {
              include: {
                user: true
              }
            }
          },
          orderBy: [
            { completed: 'asc' },
            { endDate: 'asc' },
            { createdAt: 'asc' } // Replace creationOrder with createdAt
          ]
        });
        return projects;
      } catch (error) {
        console.error('Error fetching projects by team ID:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch projects for team' });
      }
    }),
  
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        const project = await prisma.project.findUnique({
          where: { id: input },
          include: {
            team: {
              include: {
                members: {
                  include: {
                    user: true
                  }
                }
              }
            },
            creator: {
              include: {
                user: true
              }
            },
            mainStages: {
              include: {
                subStages: true,
                tasks: {
                  include: {
                    assignee: { include: { user: true } },
                    creator: { include: { user: true } }
                  }
                }
              }
            },
            tasks: {
              include: {
                assignee: { include: { user: true } },
                creator: { include: { user: true } }
              }
            }
          }
        });
  
        if (!project) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
        }
  
        const isMember = project.team.members.some(member => member.userId === ctx.user.id);
        if (!isMember) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this project' });
        }
  
        return project;
      } catch (error) {
        console.error('Error fetching project by ID:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch project details' });
      }
    }),

  create: protectedProcedure
  .input(z.object({
    title: z.string(),
    description: z.string().nullable().optional(),
    status: z.string().optional().default("active"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    duration: z.string(),
    teamId: z.number(),
    mainStages: z.array(z.object({
      name: z.string(),
      subStages: z.array(z.object({
        name: z.string(),
        enabled: z.boolean().optional(),
        starred: z.boolean().optional(),
        content: z.any().optional(),
      }))
    }))
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('Create project input:', JSON.stringify(input, null, 2));
    try {
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          userId: ctx.user.id,
          teamId: input.teamId,
        },
      });

      console.log('Team member:', teamMember);

      if (!teamMember) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not a member of this team' });
      }

      const project = await prisma.project.create({
        data: {
          title: input.title,
          description: input.description,
          status: input.status,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          duration: input.duration,
          creator: { connect: { id: teamMember.id } },
          team: { connect: { id: input.teamId } },
        },
      });

      for (const mainStage of input.mainStages) {
        const createdMainStage = await prisma.mainStage.create({
          data: {
            name: mainStage.name,
            project: { connect: { id: project.id } },
          },
        });

        for (const subStage of mainStage.subStages) {
          await prisma.subStage.create({
            data: {
              name: subStage.name,
              enabled: subStage.enabled ?? true,
              starred: subStage.starred ?? false,
              content: subStage.content,
              mainStage: { connect: { id: createdMainStage.id } },
              project: { connect: { id: project.id } },
            },
          });
        }
      }

      const createdProject = await prisma.project.findUnique({
        where: { id: project.id },
        include: {
          mainStages: {
            include: {
              subStages: true,
            },
          },
        },
      });

      console.log('Created project:', JSON.stringify(createdProject, null, 2));

      return createdProject;
    } catch (error) {
      console.error('Error in create project procedure:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error code:', error.code);
        console.error('Prisma error message:', error.message);
        console.error('Prisma error meta:', error.meta);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Database error: ${error.message}`,
          cause: error
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create project',
        cause: error
      });
    }
  }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().nullable().optional(),
      status: z.string().optional(),
      startDate: z.string().nullable().optional(),
      endDate: z.string().nullable().optional(),
      duration: z.string().optional(),
      teamId: z.number().optional(),
      mainStages: z.array(z.object({
        id: z.number().optional(),
        name: z.string(),
        starred: z.boolean().optional(),
        subStages: z.array(z.object({
          id: z.number().optional(),
          name: z.string(),
          enabled: z.boolean().optional(),
          starred: z.boolean().optional(),
          content: z.any().optional(),
        }))
      })).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const project = await prisma.project.findUnique({
          where: { id: input.id },
          include: { team: { include: { members: true } } }
        });

        if (!project) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
        }

        const isMember = project.team.members.some(member => member.userId === ctx.user.id);
        if (!isMember) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update this project' });
        }

        const updatedProject = await prisma.project.update({
          where: { id: input.id },
          data: {
            title: input.title,
            description: input.description,
            status: input.status,
            startDate: input.startDate ? new Date(input.startDate) : undefined,
            endDate: input.endDate ? new Date(input.endDate) : undefined,
            duration: input.duration,
            team: input.teamId ? { connect: { id: input.teamId } } : undefined,
          },
        });

        if (input.mainStages) {
          for (const mainStage of input.mainStages) {
            let updatedMainStage;
            if (mainStage.id) {
              updatedMainStage = await prisma.mainStage.update({
                where: { id: mainStage.id },
                data: {
                  name: mainStage.name,
                  starred: mainStage.starred,
                },
              });
            } else {
              updatedMainStage = await prisma.mainStage.create({
                data: {
                  name: mainStage.name,
                  starred: mainStage.starred ?? false,
                  project: { connect: { id: updatedProject.id } },
                },
              });
            }

            for (const subStage of mainStage.subStages) {
              if (subStage.id) {
                await prisma.subStage.update({
                  where: { id: subStage.id },
                  data: {
                    name: subStage.name,
                    enabled: subStage.enabled,
                    starred: subStage.starred,
                    content: subStage.content,
                  },
                });
              } else {
                await prisma.subStage.create({
                  data: {
                    name: subStage.name,
                    enabled: subStage.enabled ?? true,
                    starred: subStage.starred ?? false,
                    content: subStage.content,
                    mainStage: { connect: { id: updatedMainStage.id } },
                    project: { connect: { id: updatedProject.id } },
                  },
                });
              }
            }
          }
        }

        const finalUpdatedProject = await prisma.project.findUnique({
          where: { id: updatedProject.id },
          include: {
            mainStages: {
              include: {
                subStages: true
              }
            }
          }
        });

        return finalUpdatedProject;
      } catch (error) {
        console.error('Error updating project:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update project' });
      }
    }),



    addMainStage: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      name: z.string(),
      starred: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const project = await prisma.project.findUnique({
          where: { id: input.projectId },
          include: { team: { include: { members: true } } }
        });

        if (!project) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
        }

        const isMember = project.team.members.some(member => member.userId === ctx.user.id);
        if (!isMember) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to add stages to this project' });
        }

        const newMainStage = await prisma.mainStage.create({
          data: {
            name: input.name,
            starred: input.starred ?? false,
            project: { connect: { id: input.projectId } }
          }
        });

        return newMainStage;
      } catch (error) {
        console.error('Error adding main stage:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to add main stage' });
      }
    }),

  addSubStage: protectedProcedure
    .input(z.object({
      mainStageId: z.number(),
      name: z.string(),
      enabled: z.boolean().optional(),
      starred: z.boolean().optional(),
      content: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const mainStage = await prisma.mainStage.findUnique({
          where: { id: input.mainStageId },
          include: { project: { include: { team: { include: { members: true } } } } }
        });

        if (!mainStage) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Main stage not found' });
        }

        const isMember = mainStage.project.team.members.some(member => member.userId === ctx.user.id);
        if (!isMember) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to add sub-stages to this project' });
        }

        const newSubStage = await prisma.subStage.create({
          data: {
            name: input.name,
            enabled: input.enabled ?? true,
            starred: input.starred ?? false,
            content: input.content,
            mainStage: { connect: { id: input.mainStageId } },
            project: { connect: { id: mainStage.project.id } }
          }
        });

        return newSubStage;
      } catch (error) {
        console.error('Error adding sub-stage:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to add sub-stage' });
      }
    }),

  updateMainStage: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      starred: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
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
      } catch (error) {
        console.error('Error updating main stage:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update main stage' });
      }
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
      try {
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
      } catch (error) {
        console.error('Error updating sub-stage:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update sub-stage' });
      }
    }),

  deleteMainStage: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        const mainStage = await prisma.mainStage.findUnique({
          where: { id: input },
          include: { project: { include: { team: { include: { members: true } } } } }
        });

        if (!mainStage) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Main stage not found' });
        }

        const isMember = mainStage.project.team.members.some(member => member.userId === ctx.user.id);
        if (!isMember) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this main stage' });
        }

        await prisma.mainStage.delete({ where: { id: input } });

        return { success: true };
      } catch (error) {
        console.error('Error deleting main stage:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete main stage' });
      }
    }),

  deleteSubStage: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        const subStage = await prisma.subStage.findUnique({
          where: { id: input },
          include: { project: { include: { team: { include: { members: true } } } } }
        });

        if (!subStage) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Sub-stage not found' });
        }

        const isMember = subStage.project.team.members.some(member => member.userId === ctx.user.id);
        if (!isMember) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this sub-stage' });
        }

        await prisma.subStage.delete({ where: { id: input } });

        return { success: true };
      } catch (error) {
        console.error('Error deleting sub-stage:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete sub-stage' });
      }
    }),


toggleProjectCompletion: protectedProcedure
.input(z.object({
  id: z.number(),
  completed: z.boolean()
}))
.mutation(async ({ input, ctx }) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: input.id },
      include: { team: { include: { members: true } } }
    });

    if (!project) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
    }

    const isMember = project.team.members.some(member => member.userId === ctx.user.id);
    if (!isMember) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to toggle this project\'s completion status' });
    }

    const updatedProject = await prisma.project.update({
      where: { id: input.id },
      data: { completed: input.completed },
      include: {
        mainStages: {
          include: {
            subStages: true
          }
        }
      }
    });

    return updatedProject;
  } catch (error) {
    console.error('Error toggling project completion:', error);
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to toggle project completion' });
  }
}),

delete: protectedProcedure
.input(z.number())
.mutation(async ({ input, ctx }) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: input },
      include: { team: { include: { members: true } } }
    });

    if (!project) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
    }

    const isMember = project.team.members.some(member => member.userId === ctx.user.id);
    if (!isMember) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this project' });
    }

    await prisma.project.delete({ where: { id: input } });

    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete project' });
  }
}),

getProjectsForCalendar: protectedProcedure
.input(z.object({
  teamId: z.number(),
  startDate: z.date(),
  endDate: z.date()
}))
.query(async ({ input, ctx }) => {
  try {
    const isMember = await prisma.teamMember.findFirst({
      where: {
        userId: ctx.user.id,
        teamId: input.teamId
      }
    });
    if (!isMember) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this team\'s calendar' });
    }

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
        status: true,
        duration: true
      },
      orderBy: {
        endDate: 'asc'
      }
    });
    return projects;
  } catch (error) {
    console.error('Error fetching projects for calendar:', error);
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch projects for calendar' });
  }
}),

getProjectProgress: protectedProcedure
.input(z.number())
.query(async ({ input, ctx }) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: input },
      include: {
        mainStages: {
          include: {
            subStages: true
          }
        },
        team: { include: { members: true } }
      }
    });

    if (!project) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
    }

    const isMember = project.team.members.some(member => member.userId === ctx.user.id);
    if (!isMember) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this project' });
    }

    const totalStages = project.mainStages.length;
    const completedStages = project.mainStages.filter(stage => 
      stage.subStages.every(subStage => subStage.enabled)
    ).length;

    const progress = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

    return {
      totalStages,
      completedStages,
      progress: Math.round(progress)
    };
  } catch (error) {
    console.error('Error getting project progress:', error);
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get project progress' });
  }
}),

getActiveProjectsCount: protectedProcedure
.input(z.number())
.query(async ({ input: teamId, ctx }) => {
  try {
    const isMember = await prisma.teamMember.findFirst({
      where: {
        userId: ctx.user.id,
        teamId: teamId
      }
    });
    if (!isMember) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this team\'s project count' });
    }

    const count = await prisma.project.count({
      where: {
        teamId,
        status: 'active',
        completed: false
      }
    });
    return count;
  } catch (error) {
    console.error('Error fetching active projects count:', error);
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch active projects count' });
  }
}),

// You can add more procedures here as needed, such as:
// - updateProjectStatus
// - getProjectAnalytics
// - addProjectComment
// - getProjectComments
// etc.
});

export default projectRouter;



