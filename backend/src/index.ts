import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';

import { publicProcedure,router } from './trpc';
import { projectRouter } from './routes/projects';
import { taskRouter } from './routes/tasks';
//import { dashboardRouter } from './routes/dashboard';



export const appRouter = router({
  projects: projectRouter,
  tasks: taskRouter,
//   calendar: calendarRouter,
//   dashboard: dashboardRouter
});



// const app = express();
// app.use(cors());

// app.use('/trpc', createExpressMiddleware({
//   router: appRouter,
//   createContext: () => ({}),
// }));
//
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

export type AppRouter = typeof appRouter;
