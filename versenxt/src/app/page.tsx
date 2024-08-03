'use client';
import { ClerkProvider, OrganizationProfile,CreateOrganization, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Dashboard from '@/components/Dashboard';
import { trpc } from '@/trpc/client';
import '../styles/globals.css'

export default function HomePage() {
  const { data: projects, isLoading: projectsLoading } = trpc.projects.getAll.useQuery();
  //const { data: tasks, isLoading: tasksLoading } = trpc.tasks.getAll.useQuery();

  if (projectsLoading) {
    return <div>Loading...</div>;
  }

  return (
   
    <Dashboard />
  );
}