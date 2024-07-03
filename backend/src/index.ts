import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './trpc'; // Import the router from trpc.ts

const app = express();
app.use(cors());

app.use('/trpc', createExpressMiddleware({
  router: appRouter,
  createContext: () => ({}),
}));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export type AppRouter = typeof appRouter;