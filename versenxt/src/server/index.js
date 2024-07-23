"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const trpc_1 = require("./trpc");
const projects_1 = require("./routes/projects");
const tasks_1 = require("./routes/tasks");
const users_1 = require("./routes/users");
const teams_1 = require("./routes/teams");
exports.appRouter = (0, trpc_1.router)({
    users: users_1.userRouter,
    projects: projects_1.projectRouter,
    tasks: tasks_1.taskRouter,
    teams: teams_1.teamRouter,
    // calendar: calendarRouter,
    //  dashboard: dashboardRouter
    //   hello: publicProcedure
    //     .input(
    //       z.object({
    //         text: z.string(),
    //       }),
    //     )
    //     .query((opts) => {
    //       return {
    //         greeting: `hello ${opts.input.text}`,
    //       };
    //     }),
});
