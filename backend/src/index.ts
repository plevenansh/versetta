import express from 'express';
import cors from 'cors';
import * as trpc from '@trpc/server';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { z } from 'zod';

const app = express();
app.use(cors());

const appRouter = trpc.router()
  .query('hello', {
    input: z.string().nullish(),
    resolve({ input }) {
      return `Hello ${input ?? 'World'}`;
    },
  });

app.use('/trpc', createExpressMiddleware({
  router: appRouter,
  createContext: () => ({}),
}));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export type AppRouter = typeof appRouter;
