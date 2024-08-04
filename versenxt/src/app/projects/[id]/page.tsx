"use client"
import { useRouter } from 'next/router';
import { trpc } from '@/trpc/client';

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: project, isLoading } = trpc.projects.getById.useQuery(parseInt(id));

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