import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/';
import { createContext } from '@/server/context';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({ req }),
  });

export { handler as GET, handler as POST };