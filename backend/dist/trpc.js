"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = exports.publicProcedure = exports.router = void 0;
const server_1 = require("@trpc/server");
const projects_1 = require("./routes/projects");
const tasks_1 = require("./routes/tasks");
const users_1 = require("./routes/users");
const t = server_1.initTRPC.create();
exports.router = t.router;
exports.publicProcedure = t.procedure;
exports.appRouter = (0, exports.router)({
    users: users_1.userRouter,
    projects: projects_1.projectRouter,
    tasks: tasks_1.taskRouter,
});
