import { z } from 'zod';
import { publicProcedure, router } from './trpc';
import { projectRouter } from './routers/projects';
import { taskRouter } from './routers/tasks';
import {userRouter} from './routers/users';
import {teamRouter} from './routers/teams';
import { youtubeRouter } from './routers/youtube';
//import { authRouter } from './routers/auth';

export const appRouter = router({

    users: userRouter,
    projects: projectRouter,
    tasks: taskRouter,
    teams: teamRouter,
    youtube: youtubeRouter,
   // auth: authRouter,

   // calendar: calendarRouter,
   //  dashboard: dashboardRouter



});

// export type definition of API
export type AppRouter = typeof appRouter;