import React from 'react';
import ProjectSection from '@/components/TaskList';
import TaskList from '@/components/TaskList';


export default function Project() {
    return (
      <div className="w-full max-w-full p-2 sm:p-4 md:p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Current Project</h1>
        <TaskList />
      </div>
      
    );
  }
