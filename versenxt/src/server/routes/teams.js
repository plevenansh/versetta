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
exports.teamRouter = void 0;
const trpc_1 = require("../trpc");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../lib/prisma"));
exports.teamRouter = (0, trpc_1.router)({
    getAll: trpc_1.publicProcedure.query(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const teams = yield prisma_1.default.team.findMany({
                include: {
                    members: {
                        include: {
                            user: true
                        }
                    },
                    projects: true,
                    tasks: true
                }
            });
            return teams;
        }
        catch (error) {
            console.error('Error fetching teams:', error);
            throw new Error('Failed to fetch teams');
        }
    })),
    getById: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const team = yield prisma_1.default.team.findUnique({
                where: { id: input },
                include: {
                    members: {
                        include: {
                            user: true
                        }
                    },
                    projects: true,
                    tasks: true
                }
            });
            if (!team) {
                throw new Error(`Team with id ${input} not found`);
            }
            return team;
        }
        catch (error) {
            console.error(`Error fetching team with id ${input}:`, error);
            throw new Error('Failed to fetch team');
        }
    })),
    create: trpc_1.publicProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        creatorId: zod_1.z.number()
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Creating team with input:', input);
        try {
            const newTeam = yield prisma_1.default.team.create({
                data: {
                    name: input.name,
                    description: input.description,
                    creator: {
                        connect: { id: input.creatorId }
                    },
                    members: {
                        create: {
                            userId: input.creatorId,
                            role: 'admin'
                        }
                    }
                },
                include: {
                    members: {
                        include: {
                            user: true
                        }
                    },
                    creator: true
                }
            });
            return newTeam;
        }
        catch (error) {
            console.error('Error creating team:', error);
            throw new Error('Failed to create team');
        }
    })),
    update: trpc_1.publicProcedure
        .input(zod_1.z.object({
        id: zod_1.z.number(),
        name: zod_1.z.string().optional(),
        description: zod_1.z.string().optional()
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const updatedTeam = yield prisma_1.default.team.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    description: input.description
                },
                include: {
                    members: {
                        include: {
                            user: true
                        }
                    }
                }
            });
            return updatedTeam;
        }
        catch (error) {
            console.error(`Error updating team with id ${input.id}:`, error);
            throw new Error('Failed to update team');
        }
    })),
    delete: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield prisma_1.default.team.delete({
                where: { id: input }
            });
            return { success: true, message: 'Team deleted successfully' };
        }
        catch (error) {
            console.error(`Error deleting team with id ${input}:`, error);
            throw new Error('Failed to delete team');
        }
    })),
    addMember: trpc_1.publicProcedure
        .input(zod_1.z.object({
        teamId: zod_1.z.number(),
        userId: zod_1.z.number(),
        role: zod_1.z.string()
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const newMember = yield prisma_1.default.teamMember.create({
                data: {
                    teamId: input.teamId,
                    userId: input.userId,
                    role: input.role
                },
                include: {
                    team: true,
                    user: true
                }
            });
            return newMember;
        }
        catch (error) {
            console.error('Error adding team member:', error);
            throw new Error('Failed to add team member');
        }
    })),
    removeMember: trpc_1.publicProcedure
        .input(zod_1.z.object({
        teamId: zod_1.z.number(),
        userId: zod_1.z.number()
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield prisma_1.default.teamMember.delete({
                where: {
                    userId_teamId: {
                        userId: input.userId,
                        teamId: input.teamId
                    }
                }
            });
            return { success: true, message: 'Team member removed successfully' };
        }
        catch (error) {
            console.error('Error removing team member:', error);
            throw new Error('Failed to remove team member');
        }
    })),
    updateMemberRole: trpc_1.publicProcedure
        .input(zod_1.z.object({
        teamId: zod_1.z.number(),
        userId: zod_1.z.number(),
        role: zod_1.z.string()
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const updatedMember = yield prisma_1.default.teamMember.update({
                where: {
                    userId_teamId: {
                        userId: input.userId,
                        teamId: input.teamId
                    }
                },
                data: {
                    role: input.role
                }
            });
            return updatedMember;
        }
        catch (error) {
            console.error('Error updating team member role:', error);
            throw new Error('Failed to update team member role');
        }
    })),
    getTeamMembers: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const members = yield prisma_1.default.teamMember.findMany({
                where: { teamId: input },
                include: { user: true }
            });
            return members;
        }
        catch (error) {
            console.error(`Error fetching members for team with id ${input}:`, error);
            throw new Error('Failed to fetch team members');
        }
    }))
});
