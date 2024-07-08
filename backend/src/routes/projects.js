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
const prisma_1 = __importDefault(require("../lib/prisma"));
exports.projectRouter = (0, trpc_1.router)({
    getAll: trpc_1.publicProcedure.query(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield prisma_1.default.project.findMany();
        }
        catch (error) {
            throw new Error('Failed to fetch projects');
        }
    })),
    getById: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .query(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield prisma_1.default.project.findUnique({ where: { id: input } });
        }
        catch (error) {
            throw new Error('Failed to fetch project');
        }
    })),
    create: trpc_1.publicProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required'),
        description: zod_1.z.string().optional(),
        userId: zod_1.z.number()
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("hithere");
            console.log("Input received:", input); // Log the input
            const createdProject = yield prisma_1.default.project.create({ data: input });
            console.log('Project created successfully:', createdProject);
            return createdProject;
        }
        catch (error) {
            console.error('Error creating project:', error); // Log the full error
            throw new Error(`Failed to create project: `);
        }
    })),
    update: trpc_1.publicProcedure
        .input(zod_1.z.object({
        id: zod_1.z.number(),
        title: zod_1.z.string().min(1, 'Title is required').optional(),
        description: zod_1.z.string().optional(),
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = input, data = __rest(input, ["id"]);
            return yield prisma_1.default.project.update({ where: { id }, data });
        }
        catch (error) {
            throw new Error('Failed to update project');
        }
    })),
    delete: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield prisma_1.default.project.delete({ where: { id: input } });
        }
        catch (error) {
            throw new Error('Failed to delete project');
        }
    })),
});
