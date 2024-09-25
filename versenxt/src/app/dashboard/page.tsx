import { getUser } from '@workos-inc/authkit-nextjs';
import Dashboard from '../../components/Dashboard';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect('/');
  }

  return <Dashboard />;
}