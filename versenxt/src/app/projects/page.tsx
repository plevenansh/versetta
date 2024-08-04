// import React from 'react';
// import ProjectSection from '@/components/ProjectSection';


// export default function Project() {
//     return (
//       <div className="container mx-auto p-4">
//         <h1 className="text-2xl font-bold mb-4">Current Project</h1>
//         <ProjectSection />
//       </div>
//     );
//   }
  
"use client"
import { trpc } from '@/trpc/client';
import ProjectCard from '@/components/ProjectCard';

export default function AllProjectsPage() {
  const { data: projects, isLoading, refetch } = trpc.projects.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>All Projects</h1>
      <div className="space-y-4">
        {projects?.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            refetchProjects={refetch}
          />
        ))}
      </div>
    </div>
  );
}