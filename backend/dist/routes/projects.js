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
    //   getAll: publicProcedure.query(async () => {
    //     return await prisma.project.findMany();
    //   }),
    getById: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(async ({ input }) => {
        return await prisma_1.default.project.findUnique({ where: { id: input } });
    }),
    create: trpc_1.publicProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        userId: zod_1.z.number()
    }))
        .mutation(async ({ input }) => {
        return await prisma_1.default.project.create({ data: input });
    }),
    // Add more project-related procedures as needed
});
