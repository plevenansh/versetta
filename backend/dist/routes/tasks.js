"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRouter = void 0;
// src/routes/tasks.ts
const trpc_1 = require("../trpc");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
exports.taskRouter = (0, trpc_1.router)({
    getAll: trpc_1.publicProcedure
        .input(zod_1.z.number().optional()) // optional project ID
        .query(async ({ input }) => {
        return await prisma_1.default.task.findMany({
            where: input ? { projectId: input } : undefined
        });
    }),
    create: trpc_1.publicProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        dueDate: zod_1.z.date().optional(),
        projectId: zod_1.z.number()
    }))
        .mutation(async ({ input }) => {
        return await prisma_1.default.task.create({ data: input });
    }),
    update: trpc_1.publicProcedure
        .input(zod_1.z.object({
        id: zod_1.z.number(),
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        dueDate: zod_1.z.date().optional(),
        completed: zod_1.z.boolean().optional()
    }))
        .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await prisma_1.default.task.update({ where: { id }, data });
    }),
    delete: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .mutation(async ({ input }) => {
        return await prisma_1.default.task.delete({ where: { id: input } });
    })
});
