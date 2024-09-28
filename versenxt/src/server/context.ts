import { getUser } from '@workos-inc/authkit-nextjs';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function createContext({ req }: { req: NextRequest }) {
  const workOsData = await getUser();
  let user = null;

  if (workOsData && workOsData.user) {
    user = await prisma.user.findUnique({
      where: { workOsUserId: workOsData.user.id },
      include: {
        teamMemberships: {
          include: {
            team: true
          }
        }
      }
    });
  }

  return { user, prisma };
}

export type Context = Awaited<ReturnType<typeof createContext>>;