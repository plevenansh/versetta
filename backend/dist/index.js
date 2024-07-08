"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const standalone_1 = require("@trpc/server/adapters/standalone");
const trpc_1 = require("./trpc");
const projects_1 = require("./routes/projects");
const users_1 = require("./routes/users");
//import { dashboardRouter } from './routes/dashboard';
console.log('Initializing tRPC server...');
exports.appRouter = (0, trpc_1.router)({
    users: users_1.userRouter,
    projects: projects_1.projectRouter
    //tasks: taskRouter,
    //   calendar: calendarRouter,
    //   dashboard: dashboardRouter
});
const server = (0, standalone_1.createHTTPServer)({
    router: exports.appRouter,
});
server.listen(3000);
console.log('Server setup complete. Waiting for connections...');
