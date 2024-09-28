// src/components/ClientDashboard.tsx
'use client';

import { trpc } from '../trpc/client';
import Dashboard from './Dashboard';
import { useRouter } from 'next/navigation';

export default function ClientDashboard() {
  const router = useRouter();
  const { data: projects, isLoading, error } = trpc.projects.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    if (error.data?.code === 'UNAUTHORIZED') {
      router.push('/login');
      return null;
    }
    return <div>Error: {error.message}</div>;
  }

  // Here, you can use the projects data as needed
  console.log('Projects:', projects);

  return (
    <>
      <Dashboard />
      {/* You can add additional components or logic here to display projects */}
    </>
  );
}