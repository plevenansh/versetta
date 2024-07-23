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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRouter = void 0;
// src/routes/tasks.ts
const trpc_1 = require("../trpc");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../lib/prisma"));
exports.taskRouter = (0, trpc_1.router)({
    getAll: trpc_1.publicProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.number().optional(),
        teamId: zod_1.z.number().optional(),
        //  userId: z.number().optional()
        creatorId: zod_1.z.number().optional(),
        assigneeId: zod_1.z.number().optional()
    }))
        .query(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tasks = yield prisma_1.default.task.findMany({
                where: {
                    projectId: input.projectId,
                    teamId: input.teamId,
                    creatorId: input.creatorId,
                    assigneeId: input.assigneeId
                    // userId: input.userId
                },
                include: {
                    project: true,
                    team: true,
                    creator: { include: { user: true } },
                    assignee: { include: { user: true } }
                    // user: true
                }
            });
            console.log(`Retrieved ${tasks.length} tasks`);
            return tasks;
        }
        catch (error) {
            console.error('Error fetching tasks:', error);
            throw new Error('Failed to fetch tasks');
        }
    })),
    getTasksAssignedToTeamMember: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tasks = yield prisma_1.default.task.findMany({
                where: {
                    assigneeId: input
                },
                include: {
                    project: true,
                    team: true,
                    creator: { include: { user: true } },
                    assignee: { include: { user: true } }
                }
            });
            console.log(`Retrieved ${tasks.length} tasks assigned to team member ${input}`);
            return tasks;
        }
        catch (error) {
            console.error(`Error fetching tasks assigned to team member ${input}:`, error);
            throw new Error('Failed to fetch tasks assigned to team member');
        }
    })),
    getTasksCreatedByTeamMember: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tasks = yield prisma_1.default.task.findMany({
                where: {
                    creatorId: input
                },
                include: {
                    project: true,
                    team: true,
                    creator: { include: { user: true } },
                    assignee: { include: { user: true } }
                }
            });
            console.log(`Retrieved ${tasks.length} tasks created by team member ${input}`);
            return tasks;
        }
        catch (error) {
            console.error(`Error fetching tasks created by team member ${input}:`, error);
            throw new Error('Failed to fetch tasks created by team member');
        }
    })),
    create: trpc_1.publicProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.enum(['pending', 'completed']).default('pending'),
        dueDate: zod_1.z.string().optional().nullable(),
        projectId: zod_1.z.number().optional(),
        teamId: zod_1.z.number().optional(),
        creatorId: zod_1.z.number()
        //userId: z.number()
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = Object.assign(Object.assign({ title: input.title, description: input.description, status: input.status, dueDate: input.dueDate ? new Date(input.dueDate) : null, team: { connect: { id: input.teamId } }, creator: { connect: { id: input.creatorId } } }, (input.projectId && { project: { connect: { id: input.projectId } } })), (input.teamId && { team: { connect: { id: input.teamId } } }));
            console.log('Creating task with data:', data);
            // const newTask = await prisma.task.create({ data });
            // console.log('Created task:', newTask);
            const newTask = yield prisma_1.default.task.create({
                data,
                include: {
                    project: true,
                    team: true,
                    creator: { include: { user: true } },
                    assignee: { include: { user: true } }
                }
            });
            console.log('Created task:', newTask);
            return newTask;
        }
        catch (error) {
            console.error('Error creating task:', error);
            throw new Error('Failed to create task');
        }
    })),
    update: trpc_1.publicProcedure
        .input(zod_1.z.object({
        id: zod_1.z.number(),
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.enum(['pending', 'completed']).optional(),
        dueDate: zod_1.z.string().optional().nullable(),
        //  userId: z.number(),
        projectId: zod_1.z.number().optional().nullable(),
        teamId: zod_1.z.number().optional(),
        assigneeId: zod_1.z.number().optional().nullable()
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Input received for task update:", input);
            // const existingTask = await prisma.task.findUnique({
            //   where: { id: input.id },
            //   include: { project: true, team: true, user: true }
            // });
            const existingTask = yield prisma_1.default.task.findUnique({
                where: { id: input.id },
                include: { project: true, team: true, creator: { include: { user: true } }, assignee: { include: { user: true } } }
            });
            if (!existingTask) {
                throw new Error(`Task with id ${input.id} not found`);
            }
            const data = {
                title: input.title,
                description: input.description,
                status: input.status,
                dueDate: input.dueDate ? new Date(input.dueDate) : null,
            };
            // if (input.projectId !== undefined) {
            //   data.project = input.projectId === null ? { disconnect: true } : { connect: { id: input.projectId } };
            // }
            // if (input.teamId !== undefined) {
            //   data.team = input.teamId === null ? { disconnect: true } : { connect: { id: input.teamId } };
            // }
            // if (input.assigneeId !== undefined) {
            //   data.assignee = input.assigneeId === null ? { disconnect: true } : { connect: { id: input.assigneeId } };
            // }
            if (input.projectId !== undefined) {
                data.project = input.projectId === null ? { disconnect: true } : { connect: { id: input.projectId } };
            }
            if (input.teamId !== undefined) {
                data.team = { connect: { id: input.teamId } };
            }
            if (input.assigneeId !== undefined) {
                data.assignee = input.assigneeId === null ? { disconnect: true } : { connect: { id: input.assigneeId } };
            }
            console.log('Updating task:', input.id, 'with data:', data);
            const updatedTask = yield prisma_1.default.task.update({
                where: { id: input.id },
                data: data,
                include: {
                    project: true,
                    team: true,
                    creator: { include: { user: true } },
                    assignee: { include: { user: true } }
                    // user: true
                }
            });
            console.log('Updated task:', updatedTask);
            return updatedTask;
        }
        catch (error) {
            console.error('Error updating  your task backen task:', error);
            throw new Error('Failed to update task: ' + error.message);
        }
    })),
    delete: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const deletedTask = yield prisma_1.default.task.delete({ where: { id: input } });
            console.log('Deleted task:', deletedTask);
            return deletedTask;
        }
        catch (error) {
            console.error('Error deleting task:', error);
            throw new Error('Failed to delete task');
        }
    }))
});
