"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ProjectCard from './ProjectCard';
import { trpc } from '@/trpc/client';
import { Plus, X } from 'lucide-react';

export default function ProjectSection() {
  const [projects, setProjects] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    teamId: 1,
    creatorId: 1,
    endDate: '',
  });

  const { data: fetchedProjects, refetch } = trpc.projects.getAll.useQuery();
  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddModalOpen(false);
      setNewProject({ title: '', description: '', teamId: 1, creatorId: 1, endDate: '' });
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
    createProjectMutation.mutate({
      ...newProject,
      startDate: new Date().toISOString(), // Set current date as start date
    });
  };

  return (
    <Card className="w-full bg-white shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects</CardTitle>
        <Button onClick={handleAddProject} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add New Project
        </Button>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No projects exist. Create a new project to get started!</p>
        ) : (
          <div className="space-y-4">
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
              <Input
                placeholder="Team ID"
                type="number"
                value={newProject.teamId}
                onChange={(e) => setNewProject({ ...newProject, teamId: parseInt(e.target.value) })}
              />
              <Input
                placeholder="Creator ID"
                type="number"
                value={newProject.creatorId}
                onChange={(e) => setNewProject({ ...newProject, creatorId: parseInt(e.target.value) })}
              />
               <Input
                type="date"
                placeholder="End Date"
                value={newProject.endDate}
                onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
