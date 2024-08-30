import { NextResponse } from 'next/server';
import { getUser } from '@workos-inc/authkit-nextjs';
import prisma from '@/lib/prisma';

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
console.log('workod user id:', workOsUser.id);
    let user = await prisma.user.findUnique({
      where: { workOsUserId: workOsUser.id },
    });
  console.log('User in API route:', user);
    if (!user) {
      user = await prisma.user.create({
        data: {
          workOsUserId: workOsUser.id,
          email: workOsUser.email || '',
          name: `${workOsUser.firstName || ''} ${workOsUser.lastName || ''}`.trim() || 'Unknown',
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}