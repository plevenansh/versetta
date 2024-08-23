import { getUser } from '@workos-inc/authkit-nextjs';
import Dashboard from '@/components/Dashboard';
import LandingPage from '@/components/LandingPage';

export default async function HomePage() {
  const user = await getUser();

  if (user) {
    // User is authenticated
    return <Dashboard />;
  } else {
    // User is not authenticated
    return <LandingPage />;
  }
}