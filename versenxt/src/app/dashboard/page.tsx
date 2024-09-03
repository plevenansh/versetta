import { getUser } from '@workos-inc/authkit-nextjs';
import Dashboard from '@/components/Dashboard';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    // If user is not authenticated, redirect to home page
    redirect('/');
  }

  return <Dashboard />;
}