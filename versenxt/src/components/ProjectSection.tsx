"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ProjectCard from './ProjectCard';
import { trpc } from '@/trpc/client';

export default function ProjectSection() {
  const [projects, setProjects] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    teamId: 1, // Default team ID, adjust as needed
    userId: 1, // Default user ID, adjust as needed
  });

  const { data: fetchedProjects, refetch } = trpc.projects.getAll.useQuery();
  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddModalOpen(false);
      setNewProject({ title: '', description: '', teamId: 1, userId: 1 });
    },
  });

  useEffect(() => {
    if (fetchedProjects) {
      setProjects(fetchedProjects);
    }
  }, [fetchedProjects]);

  const handleAddProject = () => {
    setIsAddModalOpen(true);
  };

  const handleCreateProject = () => {
    createProjectMutation.mutate(newProject);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
        <Button onClick={handleAddProject}>Add New Project</Button>
      </div>
      {projects.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No projects exist. Create a new project to get started!</p>
      ) : (
        <div className="space-y-6">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              refetchProjects={refetch}
            />
          ))}
        </div>
      )}

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Project Title"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            />
            <Input
              placeholder="Project Description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            />
            {/* Add more fields as needed */}
          </div>
          <DialogFooter>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
