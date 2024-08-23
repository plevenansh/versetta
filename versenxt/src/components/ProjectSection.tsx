//ProjectSection.tsx
"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ProjectCard from './ProjectCard';
import { trpc } from '@/trpc/client';
import { Plus, X } from 'lucide-react';


interface Project {
  id: number;
  title: string;
  description: string | null;
  status: 'active' | 'completed';
  startDate: string | null;
  endDate: string | null;
  creatorId: number;
  teamId: number;
  stages: ProjectStage[];
  //tasks?: Task[];
  isopen?: boolean;
  completed?: boolean;
  createdAt: string;
  updatedAt: string;
  team: {
    name: string;
    id: number;
    createdAt: string;
    updatedAt: string;
    description: string | null;
    creatorId: number;
  };
  creationOrder: number;
}

interface NewProject {
  title: string;
  description: string;
  endDate: string;
  teamId: number;
  creatorId: number;
}

interface ProjectStage {
  id: number;
  projectId: number;
  stage: string;
  completed: boolean;
  order: number;
}

export default function ProjectSection() {
 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [availableStages, setAvailableStages] = useState(['Ideation', 'Scripting', 'Shooting', 'Editing', 'Subtitles', 'Thumbnail', 'Tags', 'Description']);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [newStage, setNewStage] = useState('');
   
  const [projects, setProjects] = useState<Project[]>([]);
  
  // TODO: Replace these with actual values from authentication when implemented
  const HARDCODED_TEAM_ID = 4;
  const HARDCODED_CREATOR_ID = 1;

  const [newProject, setNewProject] = useState<NewProject>({
    title: '',
    description: '',
    endDate: '',
    teamId: HARDCODED_TEAM_ID,
    creatorId: HARDCODED_CREATOR_ID
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
      const sortedProjects = [...fetchedProjects].sort((a, b) => {
       
        if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
       
        if (a.endDate && b.endDate) {
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        } else if (a.endDate) {
          return -1;
        } else if (b.endDate) {
          return 1;
        } else {
          return a.creationOrder - b.creationOrder;
        }
      }) as Project[];
      setProjects(sortedProjects);
    }
  }, [fetchedProjects]);


  const handleAddProject = () => {
    setIsAddModalOpen(true);
  };

  const handleCreateProject = () => {
    createProjectMutation.mutate({
      ...newProject,
      teamId: HARDCODED_TEAM_ID,
      creatorId: HARDCODED_CREATOR_ID,
      startDate: new Date().toISOString(),
      stages: selectedStages,   
    });
  };

  const handleStageSelect = (stage: string) => {
    setSelectedStages(prev => prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]);
  };

  const handleAddNewStage = () => {
    if (newStage && !availableStages.includes(newStage)) {
      setAvailableStages(prev => [...prev, newStage]);
      setSelectedStages(prev => [...prev, newStage]);
      setNewStage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        handleCreateProject();
      }
    } else if (e.ctrlKey && e.key === 'Enter') {
      handleCreateProject();
    }
  };


  return (
    <Card className="w-full bg-[#F0F8FF] rounded-2xl shadow-sm">
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-2xl pl-1 font-bold">Projects</CardTitle>
    <Button onClick={handleAddProject} size="sm" className="bg-pink-100 text-pink-600 hover:bg-pink-200">
      <Plus className="h-4 w-4 mr-2" />
      Add New Project
    </Button>
  </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No projects exist. CreAdd New Project
          is it the first project
          ￼Edit
          ￼Publish
          ￼Delete
          ￼Expand
          ￼
          ae a new project to get started!</p>
        ) : (
           <div className="h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide hover:scrollbar-default focus-within:scrollbar-default">
          <div className="space-y-4">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                refetchProjects={refetch}
              />
            ))}
          </div>
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
                onKeyDown={(e) => handleKeyDown(e, 0)}
                ref={(el) => {inputRefs.current[0] = el}}
              />
             <Input
                placeholder="Project Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 1)}
                ref={(el) => {inputRefs.current[1] = el}}
              />
            
               <Input
                type="date"
                placeholder="End Date"
                value={newProject.endDate}
                onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                ref={(el) => {inputRefs.current[2] = el}}
              />
              <div>
              <h3 className="text-sm font-medium mb-2">Select Stages:</h3>
              <div className="flex flex-wrap gap-2">
                {availableStages.map(stage => (
                  <Button
                    key={stage}
                    variant={selectedStages.includes(stage) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStageSelect(stage)}
                  >
                    {stage}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add New Stage"
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
              />
              <Button onClick={handleAddNewStage}>Add</Button>
            </div>
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
