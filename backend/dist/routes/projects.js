"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRouter = void 0;
const trpc_1 = require("../trpc");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
exports.projectRouter = (0, trpc_1.router)({
    getAll: trpc_1.publicProcedure.query(async () => {
        try {
            return await prisma_1.default.project.findMany();
        }
        catch (error) {
            throw new Error('Failed to fetch projects');
        }
    }),
    getById: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(async ({ input }) => {
        try {
            return await prisma_1.default.project.findUnique({ where: { id: input } });
        }
        catch (error) {
            throw new Error('Failed to fetch project');
        }
    }),
    create: trpc_1.publicProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required'),
        description: zod_1.z.string().optional(),
        userId: zod_1.z.number()
    }))
        .mutation(async ({ input }) => {
        try {
            return await prisma_1.default.project.create({ data: input });
        }
        catch (error) {
            throw new Error('Failed to create project');
        }
    }),
    update: trpc_1.publicProcedure
        .input(zod_1.z.object({
        id: zod_1.z.number(),
        title: zod_1.z.string().min(1, 'Title is required').optional(),
        description: zod_1.z.string().optional(),
    }))
        .mutation(async ({ input }) => {
        try {
            const { id, ...data } = input;
            return await prisma_1.default.project.update({ where: { id }, data });
        }
        catch (error) {
            throw new Error('Failed to update project');
        }
    }),
    delete: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .mutation(async ({ input }) => {
        try {
            return await prisma_1.default.project.delete({ where: { id: input } });
        }
        catch (error) {
            throw new Error('Failed to delete project');
        }
    }),
});
