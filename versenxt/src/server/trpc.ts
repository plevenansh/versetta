// src/trpc.ts

import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

const t = initTRPC.create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
// You can add more procedures here, like:
// export const protectedProcedure = t.procedure.use(/* some auth middleware */);
