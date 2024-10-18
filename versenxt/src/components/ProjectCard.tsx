
// components/ProjectCard.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { trpc } from '../utils/trpc';
import { Trash2, Edit2, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { EditProjectModal } from './EditProjectModal';
import Link from 'next/link';
import { slugify } from '../utils/slugify';
interface Project {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  creatorId: number;
  teamId: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  team: {
    id: number;
    name: string;
  };
  duration: string;
  creator: {
    id: number;
    user: {
      id: number;
      name: string;
    }
  };
  mainStages: MainStage[];
  tasks: Task[];
}

interface MainStage {
  id: number;
  name: string;
  starred: boolean;
  subStages: SubStage[];
}

interface SubStage {
  id: number;
  name: string;
  enabled: boolean;
  starred: boolean;
  content: any;
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  assignee?: {
    id: number;
    user: {
      id: number;
      name: string;
    }
  };
  creator: {
    id: number;
    user: {
      id: number;
      name: string;
    }
  };
}

interface ProjectCardProps {
  project: Project;
  refetchProjects: () => void;
}
export default function ProjectCard({ project, refetchProjects }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const deleteProjectMutation = trpc.projects.delete.useMutation();
  const toggleProjectCompletionMutation = trpc.projects.toggleProjectCompletion.useMutation();
  const updateProjectMutation = trpc.projects.update.useMutation();

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProjectMutation.mutateAsync(project.id);
        refetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleToggleCompletion = async () => {
    try {
      await toggleProjectCompletionMutation.mutateAsync({
        id: project.id,
        completed: !project.completed
      });
      refetchProjects();
    } catch (error) {
      console.error('Error toggling project completion:', error);
      alert('Failed to update project status. Please try again.');
    }
  };

  const handleUpdateProject = async (updatedProject: Partial<Project>) => {
    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        ...updatedProject,
      });
      refetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  return (
    <Card className={`w-full ${project.completed ? 'bg-gray-100' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{project.title}</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </div>
          <Badge variant={project.completed ? "secondary" : "default"}>
            {project.completed ? 'Completed' : 'In Progress'}
          </Badge>
        </div>
        </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Created by:</strong> {project.creator.user.name}</p>
          <p><strong>Team:</strong> {project.team.name}</p>
          <p><strong>Duration:</strong> {project.duration}</p>
          <p><strong>Start Date:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</p>
          <p><strong>End Date:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</p>
          {isExpanded && (
            <div>
              <strong>Main Stages:</strong>
              <ul className="list-disc pl-5">
                {project.mainStages.map((stage) => (
                  <li key={stage.id}>
                    {stage.name} {stage.starred && '⭐'}
                    {stage.subStages.length > 0 && (
                      <ul className="list-circle pl-5">
                        {stage.subStages.map((subStage) => (
                          <li key={subStage.id}>
                            {subStage.name} {subStage.starred && '⭐'} {!subStage.enabled && '(Disabled)'}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleToggleCompletion}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {project.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
          </Button>
          <Button variant="destructive" onClick={handleDeleteProject}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Link href={`/videos/${project.id}/${slugify(project.title)}`}>
              <Button variant="outline" className="justify-between">
                Expand
              </Button>
            </Link>
        </div>
      </CardFooter>

      <EditProjectModal
        project={project}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdateProject}
      />
    </Card>
  );
}


