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
exports.projectRouter = void 0;
const trpc_1 = require("../trpc");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../lib/prisma"));
exports.projectRouter = (0, trpc_1.router)({
    getAll: trpc_1.publicProcedure.query(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const projects = yield prisma_1.default.project.findMany({
                include: {
                    team: true,
                    user: true,
                    tasks: true
                }
            });
            console.log(`Retrieved ${projects.length} projects`);
            return projects;
        }
        catch (error) {
            console.error('Error fetching projects:', error);
            throw new Error('Failed to fetch projects');
        }
    })),
    getById: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const project = yield prisma_1.default.project.findUnique({
                where: { id: input },
                include: {
                    tasks: true,
                    team: true,
                    user: true
                }
            });
            if (!project) {
                throw new Error(`Project with id ${input} not found`);
            }
            return project;
        }
        catch (error) {
            console.error(`Error fetching project with id ${input}:`, error);
            throw new Error('Failed to fetch project');
        }
    })),
    create: trpc_1.publicProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.string().optional().default("active"),
        startDate: zod_1.z.string().optional().transform(str => str ? new Date(str) : undefined),
        endDate: zod_1.z.string().optional().transform(str => str ? new Date(str) : undefined),
        teamId: zod_1.z.number(),
        userId: zod_1.z.number()
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Input received for project creation:", input);
            const data = {
                title: input.title,
                description: input.description,
                status: input.status,
                startDate: input.startDate,
                endDate: input.endDate,
                team: { connect: { id: input.teamId } },
                user: { connect: { id: input.userId } }
            };
            const createdProject = yield prisma_1.default.project.create({
                data,
                include: {
                    team: true,
                    user: true
                }
            });
            console.log('Project created successfully:', createdProject);
            return createdProject;
        }
        catch (error) {
            console.error('Error creating project:', error);
            throw new Error('Failed to create project');
        }
    })),
    update: trpc_1.publicProcedure
        .input(zod_1.z.object({
        id: zod_1.z.number(),
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        startDate: zod_1.z.string().optional().transform(str => str ? new Date(str) : undefined),
        endDate: zod_1.z.string().optional().transform(str => str ? new Date(str) : undefined),
        teamId: zod_1.z.number().optional(),
        userId: zod_1.z.number().optional()
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = input, data = __rest(input, ["id"]);
            const updateData = Object.assign(Object.assign({}, data), { team: data.teamId ? { connect: { id: data.teamId } } : undefined, user: data.userId ? { connect: { id: data.userId } } : undefined });
            delete input.teamId;
            delete input.userId;
            const updatedProject = yield prisma_1.default.project.update({
                where: { id },
                data: updateData,
                include: {
                    tasks: true,
                    team: true,
                    user: true
                }
            });
            console.log('Project updated successfully:', updatedProject);
            return updatedProject;
        }
        catch (error) {
            console.error(`Error updating project with id ${input.id}:`, error);
            throw new Error('Failed to update project');
        }
    })),
    delete: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const deletedProject = yield prisma_1.default.project.delete({
                where: { id: input },
                include: {
                    tasks: true,
                    team: true,
                    user: true
                }
            });
            console.log('Project deleted successfully:', deletedProject);
            return deletedProject;
        }
        catch (error) {
            console.error(`Error deleting project with id ${input}:`, error);
            throw new Error('Failed to delete project');
        }
    })),
    getByUserId: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const projects = yield prisma_1.default.project.findMany({
                where: { userId: input },
                include: {
                    tasks: true,
                    team: true,
                    user: true
                }
            });
            console.log(`Retrieved ${projects.length} projects for user ${input}`);
            return projects;
        }
        catch (error) {
            console.error(`Error fetching projects for user ${input}:`, error);
            throw new Error('Failed to fetch projects for user');
        }
    })),
    getByTeamId: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const projects = yield prisma_1.default.project.findMany({
                where: { teamId: input },
                include: {
                    tasks: true,
                    team: true,
                    user: true
                }
            });
            console.log(`Retrieved ${projects.length} projects for team ${input}`);
            return projects;
        }
        catch (error) {
            console.error(`Error fetching projects for team ${input}:`, error);
            throw new Error('Failed to fetch projects for team');
        }
    })),
});
