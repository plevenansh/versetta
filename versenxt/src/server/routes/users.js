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
exports.userRouter = void 0;
const trpc_1 = require("../trpc");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../lib/prisma"));
exports.userRouter = (0, trpc_1.router)({
    getAll: trpc_1.publicProcedure.query(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Getting all users");
            const users = yield prisma_1.default.user.findMany();
            console.log("Users fetched:", users);
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
        return yield prisma_1.default.user.findUnique({ where: { id: input } });
    })),
    create: trpc_1.publicProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string().email()
    }))
        .mutation(({ input }) => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            name: input.name,
            email: input.email
        };
        return yield prisma_1.default.user.create({ data });
    })),
    // create: publicProcedure
    // .input(z.object({
    //   name: z.string(),
    //   email: z.string().email(),
    //   password: z.string(),
    //   role: z.string()
    // }))
    // .mutation(async ({ input }) => {
    //   const hashedPassword = await bcrypt.hash(input.password, 10);
    //   const data: Prisma.UserCreateInput = {
    //     name: input.name,
    //     email: input.email,
    //     password: hashedPassword,
    //     role: input.role
    //   };
    //   return await prisma.user.create({ data });
    // }),
    // Add more user-related procedures as needed
});
