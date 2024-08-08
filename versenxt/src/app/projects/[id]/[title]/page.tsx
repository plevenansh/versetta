"use client"

import { useParams } from 'next/navigation';
import { trpc } from '@/trpc/client';

export default function ProjectPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { data: project, isLoading } = trpc.projects.getById.useQuery(id);

  if (isLoading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div>
      <h1>{project.title}</h1>
      <p>{project.description}</p>
      {/* Add more project details here */}
    </div>
  );
}