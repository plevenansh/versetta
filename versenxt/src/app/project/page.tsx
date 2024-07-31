import React from 'react';
import ProjectPage from '@/components/ProjectPage';


export default function Project() {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Current Project</h1>
        <ProjectPage projectId={18} />
      </div>
    );
  }
  