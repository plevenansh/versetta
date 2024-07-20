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
        userId: zod_1.z.number().optional()
    }))
        .query(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tasks = yield prisma_1.default.task.findMany({
                where: {
                    projectId: input.projectId,
                    teamId: input.teamId,
                    userId: input.userId
                },
                include: {
                    project: true,
                    team: true,
                    user: true
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
    create: trpc_1.publicProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.enum(['pending', 'completed']).default('pending'),
        dueDate: zod_1.z.string().optional().nullable(),
        projectId: zod_1.z.number().optional(),
        teamId: zod_1.z.number().optional(),
        userId: zod_1.z.number()
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = Object.assign(Object.assign({ title: input.title, description: input.description, status: input.status, dueDate: input.dueDate ? new Date(input.dueDate) : null, user: { connect: { id: input.userId } } }, (input.projectId && { project: { connect: { id: input.projectId } } })), (input.teamId && { team: { connect: { id: input.teamId } } }));
            console.log('Creating task with data:', data);
            const newTask = yield prisma_1.default.task.create({ data });
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
        userId: zod_1.z.number(),
        projectId: zod_1.z.number().optional().nullable(),
        teamId: zod_1.z.number().optional().nullable()
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Input received for task update:", input);
            const existingTask = yield prisma_1.default.task.findUnique({
                where: { id: input.id },
                include: { project: true, team: true, user: true }
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
            if (input.projectId !== undefined) {
                data.project = input.projectId === null ? { disconnect: true } : { connect: { id: input.projectId } };
            }
            if (input.teamId !== undefined) {
                data.team = input.teamId === null ? { disconnect: true } : { connect: { id: input.teamId } };
            }
            console.log('Updating task:', input.id, 'with data:', data);
            const updatedTask = yield prisma_1.default.task.update({
                where: { id: input.id },
                data: data,
                include: {
                    project: true,
                    team: true,
                    user: true
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
