// app/api/user/route.ts

import { NextResponse } from 'next/server';
import { getUser } from '@workos-inc/authkit-nextjs';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const workOsData = await getUser();
    if (!workOsData || !workOsData.user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const workOsUser = workOsData.user;

    console.log('WorkOS User in API route:', workOsUser);

    if (!workOsUser.id) {
      return NextResponse.json({ error: 'Invalid WorkOS user data' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { workOsUserId: workOsUser.id },
      include: {
        teamMemberships: {
          include: {
            team: true
          }
        }
      }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          workOsUserId: workOsUser.id,
          email: workOsUser.email || '',
          name: `${workOsUser.firstName || ''} ${workOsUser.lastName || ''}`.trim() || 'Unknown',
        },
        include: {
          teamMemberships: {
            include: {
              team: true
            }
          }
        }
      });
    }

    const userWithTeams = {
      ...user,
      teams: user.teamMemberships.map(membership => membership.team)
    };

    return NextResponse.json(userWithTeams);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}