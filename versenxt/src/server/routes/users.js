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
exports.userRouter = void 0;
const client_1 = require("@prisma/client");
const trpc_1 = require("../trpc");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../lib/prisma"));
exports.userRouter = (0, trpc_1.router)({
    getAll: trpc_1.publicProcedure.query(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Getting all users");
            const users = yield prisma_1.default.user.findMany({
                include: {
                    teamMemberships: true,
                }
            });
            console.log(`Retrieved ${users.length} users`);
            return users;
        }
        catch (error) {
            console.error("Error fetching users:", error);
            throw new Error("Failed to fetch users");
        }
    })),
    getById: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield prisma_1.default.user.findUnique({
                where: { id: input },
                include: {
                    teamMemberships: true,
                }
            });
            if (!user) {
                throw new Error(`User with id ${input} not found`);
            }
            return user;
        }
        catch (error) {
            console.error(`Error fetching user with id ${input}:`, error);
            throw new Error('Failed to fetch user');
        }
    })),
    create: trpc_1.publicProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string().email(),
        gender: zod_1.z.string().optional()
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = {
                name: input.name,
                email: input.email,
                gender: input.gender,
            };
            const newUser = yield prisma_1.default.user.create({ data });
            console.log('User created successfully:', newUser);
            return newUser;
        }
        catch (error) {
            console.error('Error creating user:', error);
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new Error('A user with this email already exists');
                }
            }
            throw new Error(`Failed to create user: ${error.message}`);
        }
    })),
    update: trpc_1.publicProcedure
        .input(zod_1.z.object({
        id: zod_1.z.number(),
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        gender: zod_1.z.string().optional()
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = input, data = __rest(input, ["id"]);
            const updatedUser = yield prisma_1.default.user.update({
                where: { id },
                data,
                include: {
                    teamMemberships: true,
                }
            });
            console.log('User updated successfully:', updatedUser);
            return updatedUser;
        }
        catch (error) {
            console.error(`Error updating user with id ${input.id}:`, error);
            throw new Error('Failed to update user');
        }
    })),
    delete: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const deletedUser = yield prisma_1.default.user.delete({
                where: { id: input },
                include: {
                    teamMemberships: true,
                }
            });
            console.log('User deleted successfully:', deletedUser);
            return deletedUser;
        }
        catch (error) {
            console.error(`Error deleting user with id ${input}:`, error);
            throw new Error('Failed to delete user');
        }
    })),
    getUserTeams: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userWithTeams = yield prisma_1.default.user.findUnique({
                where: { id: input },
                include: {
                    teamMemberships: {
                        include: {
                            team: true
                        }
                    }
                }
            });
            if (!userWithTeams) {
                throw new Error(`User with id ${input} not found`);
            }
            return userWithTeams.teamMemberships.map(membership => membership.team);
        }
        catch (error) {
            console.error(`Error fetching teams for user with id ${input}:`, error);
            throw new Error('Failed to fetch user teams');
        }
    }))
});
