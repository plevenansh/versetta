import { z } from 'zod';
import { publicProcedure, router, protectedProcedure } from './trpc';
import { projectRouter } from './routers/projects';
import { taskRouter } from './routers/tasks';
import { userRouter } from './routers/users';
import { projectPageRouter } from './routers/projectPage';
import { teamRouter } from './routers/teams';
import { youtubeRouter } from './routers/youtube';
import { storageRouter } from './routers/storage';
import {commentRouter} from './routers/comments';

export const appRouter = router({
  users: userRouter,
  projects: projectRouter,
  tasks: taskRouter,
  teams: teamRouter,
  youtube: youtubeRouter,
  projectPage: projectPageRouter,
  storage: storageRouter,
  comments: commentRouter,

});

export type AppRouter = typeof appRouter;