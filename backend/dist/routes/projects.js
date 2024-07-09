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
        return await prisma_1.default.project.findMany();
    }),
    getById: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(async ({ input }) => {
        return await prisma_1.default.project.findUnique({
            where: { id: input },
            include: { tasks: true }
        });
    }),
    create: trpc_1.publicProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required'),
        description: zod_1.z.string().optional(),
        status: zod_1.z.string().default("active"),
        startDate: zod_1.z.string().transform((str) => new Date(str)).optional(),
        endDate: zod_1.z.string().transform((str) => new Date(str)).optional(),
        userId: zod_1.z.number()
    }))
        .mutation(async ({ input }) => {
        console.log("Input received:", input);
        const createdProject = await prisma_1.default.project.create({ data: input });
        console.log('Project created successfully:', createdProject);
        return createdProject;
    }),
    update: trpc_1.publicProcedure
        .input(zod_1.z.object({
        id: zod_1.z.number(),
        title: zod_1.z.string().min(1, 'Title is required').optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        startDate: zod_1.z.date().optional(),
        endDate: zod_1.z.date().optional(),
    }))
        .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await prisma_1.default.project.update({
            where: { id },
            data,
            include: { tasks: true }
        });
    }),
    delete: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .mutation(async ({ input }) => {
        return await prisma_1.default.project.delete({ where: { id: input } });
    }),
    getByUserId: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(async ({ input }) => {
        return await prisma_1.default.project.findMany({
            where: { userId: input },
            // include: { tasks: true }
        });
    }),
});
