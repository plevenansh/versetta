// ProjectSection.tsx
"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import ProjectCard from './ProjectCard';
import { trpc } from '../trpc/client';
import { Plus } from 'lucide-react';

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

interface Team {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  description: string | null;
  workOsOrgId: string;
  creatorId: number;
}
interface NewProject {
  title: string;
  description: string;
  endDate: string;
  teamId: number;
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
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  
  const [newProject, setNewProject] = useState<NewProject>({
    title: '',
    description: '',
    endDate: '',
    teamId: 0,
  });

  const { data: user, isLoading: isUserLoading, error: userError } = trpc.users.getUser.useQuery();
const { data: userTeams, isLoading: isTeamsLoading, error: teamsError } = trpc.users.getUserTeams.useQuery(undefined, { enabled: !!user });
  const { data: fetchedProjects, isLoading: isProjectsLoading, error: projectsError, refetch } = trpc.projects.getByTeamId.useQuery(
    selectedTeamId || -1,
    { enabled: !!selectedTeamId }
  );

  const createProjectMutation = trpc.projects.create.useMutation();

  useEffect(() => {
    if (userTeams && userTeams.length > 0) {
      setSelectedTeamId(userTeams[0].id);
    }
  }, [userTeams]);

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

  const handleCreateProject = async () => {
    if (!selectedTeamId) {
      alert('Please select a team.');
      return;
    }
    try {
      await createProjectMutation.mutateAsync({
        ...newProject,
        teamId: selectedTeamId,
        startDate: new Date().toISOString(),
        stages: selectedStages,   
      });
      refetch();
      setIsAddModalOpen(false);
      setNewProject({ title: '', description: '', teamId: 0, endDate: '' });
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
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

  const handleAddAllStages = () => {
    setSelectedStages([...new Set([...selectedStages, ...availableStages])]);
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

  if (isUserLoading || isTeamsLoading) {
    return <div>Loading...</div>;
  }

  if (userError || teamsError) {
    return <div>Error loading user data. Please try again.</div>;
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-2xl font-bold">Projects</CardTitle>
            <Select
              value={selectedTeamId?.toString() || ''}
              onValueChange={(value) => setSelectedTeamId(Number(value))}
            >
              <SelectTrigger className="w-[120px] h-[30px] ">
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                {userTeams?.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleAddProject} 
            size="sm" 
            className=""
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Project
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isProjectsLoading ? (
          <p className="text-gray-600 text-center py-4">Loading projects...</p>
        ) : projectsError ? (
          <p className="text-red-600 text-center py-4">Error loading projects. Please try again.</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No projects exist for this team. Create a new project to get started!</p>
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
              <Select
                value={selectedTeamId?.toString() || ''}
                onValueChange={(value) => setSelectedTeamId(Number(value))}
              >
                <SelectTrigger className="w-[465px] h-[42px] rounded-2xl">
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  {userTeams?.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Button onClick={handleAddAllStages}>Add All</Button>
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