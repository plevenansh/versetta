"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const trpc_1 = require("../trpc");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
exports.userRouter = (0, trpc_1.router)({
    getAll: trpc_1.publicProcedure.query(async () => {
        return await prisma_1.default.user.findMany();
    }),
    getById: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(async ({ input }) => {
        return await prisma_1.default.user.findUnique({ where: { id: input } });
    }),
    create: trpc_1.publicProcedure
        .input(zod_1.z.object({ email: zod_1.z.string().email(), name: zod_1.z.string().optional() }))
        .mutation(async ({ input }) => {
        try {
            const user = await prisma_1.default.user.create({
                data: input
            });
            console.log('User created successfully:', user);
            return user;
        }
        catch (error) {
            console.error('Error creating user:', error);
            throw new Error(`Failed to create user: `);
        }
    }),
    // Add more user-related procedures as needed
});
