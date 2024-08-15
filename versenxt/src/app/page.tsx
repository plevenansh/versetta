import { getUser } from '@workos-inc/authkit-nextjs';
import Dashboard from '@/components/Dashboard';
import LandingPage from '@/components/LandingPage';

export default async function HomePage() {
  const { user, isLoading } = await getUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <LandingPage />;
  }

  return <Dashboard />;
}