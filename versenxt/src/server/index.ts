import { z } from 'zod';
import { publicProcedure, router } from './trpc';
import { projectRouter } from './routes/projects';
import { taskRouter } from './routes/tasks';
import {userRouter} from './routes/users';
import {teamRouter} from './routes/teams';
import { youtubeRouter } from './routes/youtube';

export const appRouter = router({

    users: userRouter,
    projects: projectRouter,
    tasks: taskRouter,
    teams: teamRouter,
    youtube: youtubeRouter,


   // calendar: calendarRouter,
   //  dashboard: dashboardRouter



});

// export type definition of API
export type AppRouter = typeof appRouter;