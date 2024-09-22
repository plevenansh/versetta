import { z } from 'zod';
import { publicProcedure, router } from './trpc';
import { projectRouter } from './routers/projects';
import { taskRouter } from './routers/tasks';
import {userRouter} from './routers/users';
import { projectPageRouter } from './routers/projectPage';
import {teamRouter} from './routers/teams';
import { youtubeRouter } from './routers/youtube';

export const appRouter = router({

    users: userRouter,
    projects: projectRouter,
    tasks: taskRouter,
    teams: teamRouter,
    youtube: youtubeRouter,
    projectPage: projectPageRouter,

});

// export type definition of API
export type AppRouter = typeof appRouter;