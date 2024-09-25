// src/components/ClientDashboard.tsx
'use client';

import { trpc } from '../trpc/client';
import Dashboard from './Dashboard';
 
export default function ClientDashboard() {
  const { data: projects, isLoading: projectsLoading } = trpc.projects.getAll.useQuery();

  if (projectsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
    
     
      <Dashboard />
    </>
  );
}
