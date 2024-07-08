"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const standalone_1 = require("@trpc/server/adapters/standalone");
const trpc_1 = require("./trpc");
const projects_1 = require("./routes/projects");
const tasks_1 = require("./routes/tasks");
//import { dashboardRouter } from './routes/dashboard';
console.log('Initializing tRPC server...');
exports.appRouter = (0, trpc_1.router)({
    projects: projects_1.projectRouter,
    tasks: tasks_1.taskRouter,
    //   calendar: calendarRouter,
    //   dashboard: dashboardRouter
});
const server = (0, standalone_1.createHTTPServer)({
    router: exports.appRouter,
});
const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Available routes:');
    console.log('- /trpc/projects');
    console.log('- /trpc/tasks');
});
console.log('Server setup complete. Waiting for connections...');
