import { handleAuth } from '@workos-inc/authkit-nextjs';

export const runtime = 'nodejs';

// Redirect the user to `/` after successful sign in
// The redirect can be customized: `handleAuth({ returnPathname: '/foo' })`
export const GET = handleAuth({ returnPathname: '/dashboard' });
