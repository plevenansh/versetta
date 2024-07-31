// src/components/ClientDashboard.tsx
'use client';

import { trpc } from '@/trpc/client';
import Dashboard from '@/components/Dashboard';
import { signOut } from '@/app/actions/auth';

export default function ClientDashboard({ user }) {
  const { data: projects, isLoading: projectsLoading } = trpc.projects.getAll.useQuery();

  if (projectsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
    
      <form action={signOut}>
        <p>Welcome back{user.firstName && `, ${user.firstName}`}</p>
        <button type="submit">Sign out</button>
      </form>
      <Dashboard />
    </>
  );
}
