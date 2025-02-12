import { getSignInUrl, getSignUpUrl, getUser, signOut } from '@workos-inc/authkit-nextjs';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
console.log('action', action)
  switch (action) {
    case 'getUser':
      const { user } = await getUser();
      return NextResponse.json({ user });
    case 'getSignInUrl':
      const signInUrl = await getSignInUrl();
      return NextResponse.json({ url: signInUrl });
    case 'getSignUpUrl':
      const signUpUrl = await getSignUpUrl();
      return NextResponse.json({ url: signUpUrl });
    case 'signOut':
      await signOut();
      return NextResponse.json({ success: true });
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'signOut') {
    try {
      await signOut();
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error during signOut:', error);
      return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
