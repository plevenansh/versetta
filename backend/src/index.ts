import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { publicProcedure, router } from './trpc';
import { projectRouter } from './routes/projects';
import { taskRouter } from './routes/tasks';
//import { dashboardRouter } from './routes/dashboard';

console.log('Initializing tRPC server...');

export const appRouter = router({
  projects: projectRouter,
  tasks: taskRouter,
//   calendar: calendarRouter,
//   dashboard: dashboardRouter
});

const server = createHTTPServer({
  router: appRouter,
});

const port = 3000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Available routes:');
  console.log('- /trpc/projects');
  console.log('- /trpc/tasks');
});

console.log('Server setup complete. Waiting for connections...');

export type AppRouter = typeof appRouter;
