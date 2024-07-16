import { z } from 'zod';
import { publicProcedure, router } from './trpc';
import { projectRouter } from './routes/projects';
import { taskRouter } from './routes/tasks';
import {userRouter} from './routes/users';
import superjson from 'superjson';

export const appRouter = router({

    users: userRouter,
    projects: projectRouter,
    tasks: taskRouter,
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

// export type definition of API
export type AppRouter = typeof appRouter;