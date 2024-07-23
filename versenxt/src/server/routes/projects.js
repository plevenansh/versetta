"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRouter = void 0;
const trpc_1 = require("../trpc");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const defaultStages = ['Ideation', 'Scripting', 'Shooting', 'Editing', 'Subtitles', 'Thumbnail', 'Tags', 'Description'];
exports.projectRouter = (0, trpc_1.router)({
    getAll: trpc_1.publicProcedure.query(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const projects = yield prisma_1.default.project.findMany({
                include: {
                    team: true,
                    tasks: true,
                    stages: true,
                }
            });
            console.log(`Retrieved ${projects.length} projects`);
            return projects;
        }
        catch (error) {
            console.error('Error fetching projects:', error);
            throw new Error('Failed to fetch projects');
        }
    })),
    getById: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const project = yield prisma_1.default.project.findUnique({
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
        }
        catch (error) {
            console.error(`Error fetching project with id ${input}:`, error);
            throw new Error('Failed to fetch project');
        }
    })),
    create: trpc_1.publicProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.string().optional().default("active"),
        startDate: zod_1.z.string().optional().transform(str => str ? new Date(str) : undefined),
        endDate: zod_1.z.string().optional().transform(str => str ? new Date(str) : undefined),
        teamId: zod_1.z.number(),
        creatorId: zod_1.z.number(),
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Input received for project creation:", input);
        try {
            const stages = ['Ideation', 'Scripting', 'Shooting', 'Editing', 'Subtitles', 'Thumbnail', 'Tags', 'Description'];
            const data = {
                title: input.title,
                description: input.description,
                status: input.status,
                startDate: input.startDate,
                endDate: input.endDate,
                creator: { connect: { id: input.creatorId } },
                team: { connect: { id: input.teamId } },
                stages: {
                    create: stages.map(stage => ({ stage, completed: false }))
                }
            };
            const createdProject = yield prisma_1.default.project.create({
                data,
                include: {
                    team: true,
                    creator: true,
                    stages: true // Changed from ProjectStageStatus to stages
                }
            });
            console.log('Project created successfully:', createdProject);
            return createdProject;
        }
        catch (error) {
            console.error('Error creating project:', error);
            throw new Error('Failed to create project');
        }
    })),
    update: trpc_1.publicProcedure
        .input(zod_1.z.object({
        id: zod_1.z.number(),
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        teamId: zod_1.z.number().optional(),
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Input received for project update:", input);
        try {
            const { id, teamId } = input, data = __rest(input, ["id", "teamId"]);
            const updateData = Object.assign(Object.assign({}, data), { startDate: data.startDate === undefined ? undefined : data.startDate ? new Date(data.startDate) : null, endDate: data.endDate === undefined ? undefined : data.endDate ? new Date(data.endDate) : null, team: teamId ? { connect: { id: teamId } } : undefined });
            const updatedProject = yield prisma_1.default.project.update({
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
        }
        catch (error) {
            console.error(`Error updating project with id ${input.id}:`, error);
            throw new Error(`Failed to update project: ${error.message}`);
        }
    })),
    // In projectRouter.ts
    updateProjectStage: trpc_1.publicProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.number(),
        stage: zod_1.z.string(),
        completed: zod_1.z.boolean(),
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Input received for project stage update:", input);
        try {
            const updatedStage = yield prisma_1.default.projectStage.upsert({
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
        }
        catch (error) {
            console.error('Error updating project stage:', error);
            throw new Error('Failed to update project stage');
        }
    })),
    delete: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Attempting to delete project with ID:", input);
        try {
            // First, check if the project exists
            const project = yield prisma_1.default.project.findUnique({
                where: { id: input },
                include: { stages: true, tasks: true }
            });
            if (!project) {
                throw new Error(`Project with id ${input} not found`);
            }
            // Use a transaction to ensure all operations succeed or fail together
            const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
                // Delete related ProjectStage records
                console.log("Deleting ProjectStage records...");
                const deletedStages = yield prisma.projectStage.deleteMany({
                    where: { projectId: input },
                });
                console.log(`Deleted ${deletedStages.count} ProjectStage records`);
                // Delete related Task records
                console.log("Deleting Task records...");
                const deletedTasks = yield prisma.task.deleteMany({
                    where: { projectId: input },
                });
                console.log(`Deleted ${deletedTasks.count} Task records`);
                // Delete the project
                console.log("Deleting Project...");
                const deletedProject = yield prisma.project.delete({
                    where: { id: input },
                });
                console.log("Deleted Project:", deletedProject);
                return deletedProject;
            }));
            console.log('Project and related records deleted successfully');
            return { success: true, deletedProject: result };
        }
        catch (error) {
            console.error(`Error deleting project with id ${input}:`, error);
            throw new Error(`Failed to delete project: ${error.message}`);
        }
    })),
    getByTeamId: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const projects = yield prisma_1.default.project.findMany({
                where: { teamId: input },
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
            console.log(`Retrieved ${projects.length} projects for user ${input}`);
            return projects;
        }
        catch (error) {
            console.error(`Error fetching projects for user ${input}:`, error);
            throw new Error('Failed to fetch projects for user');
        }
    })),
    getByTeamMemberId: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const projects = yield prisma_1.default.project.findMany({
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
        }
        catch (error) {
            console.error(`Error fetching projects for team member ${input}:`, error);
            throw new Error('Failed to fetch projects for team member');
        }
    })),
});
