import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { publicProcedure, router } from './trpc';
import { projectRouter } from './routes/projects';
import { taskRouter } from './routes/tasks';
import {userRouter} from './routes/users';
//import { dashboardRouter } from './routes/dashboard';
import { z } from 'zod';

      console.log('Initializing xtra tRPC server...');

export const appRouter = router({



      hello: publicProcedure
      .input(
        z.object({
          text: z.string(),
        }),
      )
      .query(() => {
        return {
          greeting: `hello `,
        };
      }),




        users: userRouter,
        projects: projectRouter
        //tasks: taskRouter,
        //   calendar: calendarRouter,
        //   dashboard: dashboardRouter
});

     

const server = createHTTPServer({
      router: appRouter,
      createContext: () => ({}), // Add this line
    });
      server.listen(3000);

console.log('Server setup complete. Waiting for connections...');

 export type AppRouter = typeof appRouter;


 