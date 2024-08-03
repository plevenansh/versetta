import React from 'react';
import ProjectSection from '@/components/TaskList';
import TaskList from '@/components/TaskList';


export default function Project() {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Current Project</h1>
        <TaskList />
      </div>
    );
  }
