"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRouter = void 0;
const trpc_1 = require("../trpc");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
exports.taskRouter = (0, trpc_1.router)({
    getAll: trpc_1.publicProcedure.query(async () => {
        return await prisma_1.default.task.findMany();
    }),
    getById: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(async ({ input }) => {
        return await prisma_1.default.task.findUnique({ where: { id: input } });
    }),
    create: trpc_1.publicProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        completed: zod_1.z.boolean().optional(),
        projectId: zod_1.z.number()
    }))
        .mutation(async ({ input }) => {
        return await prisma_1.default.task.create({ data: input });
    }),
    updateStatus: trpc_1.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.number(), completed: zod_1.z.boolean() }))
        .mutation(async ({ input }) => {
        return await prisma_1.default.task.update({
            where: { id: input.id },
            data: { completed: input.completed }
        });
    }),
    // Add more task-related procedures as needed
});
