import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { projectRouter } from './routes/projects';
import { taskRouter } from './routes/tasks';
import { userRouter } from './routes/users';
const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  hello: publicProcedure
    .input(z.string().nullish())
    .query(({ input }) => {
      return `Hello ${input ?? 'World'}`;
    }),
});

export type AppRouter = typeof appRouter;
