// components/ProjectCard.tsx
"use client"

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Calendar,
  Clock,
  MoreVertical,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Star,
  Edit,
  Trash2,
} from 'lucide-react';
import { trpc } from '../utils/trpc';
import Link from 'next/link';
import { formatDistanceToNow, isAfter } from 'date-fns';
import { EditProjectModal } from './EditProjectModal';
import { slugify } from '../utils/slugify';

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
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignee?: {
    user: {
      name: string;
    }
  };
}

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

interface ProjectCardProps {
  project: Project;
  refetchProjects: () => void;
}

export function ProjectCard({ project, refetchProjects }: ProjectCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const deleteProjectMutation = trpc.projects.delete.useMutation();
  const toggleProjectCompletionMutation = trpc.projects.toggleProjectCompletion.useMutation();
  const { data: progress } = trpc.projects.getProjectProgress.useQuery(project.id);

  // Calculate project status and timeline
  const projectStatus = useMemo(() => {
    if (project.completed) return 'completed';
    if (!project.endDate) return 'ongoing';
    return isAfter(new Date(), new Date(project.endDate)) ? 'overdue' : 'on-track';
  }, [project.completed, project.endDate]);

  const statusConfig = {
    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    'on-track': { color: 'bg-blue-100 text-blue-800', icon: Clock },
    overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    ongoing: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  };

  // Calculate task statistics
  const taskStats = useMemo(() => {
    const total = project.tasks.length;
    const completed = project.tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgress = project.tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const pending = project.tasks.filter(t => t.status === 'PENDING').length;

    return { total, completed, inProgress, pending };
  }, [project.tasks]);

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProjectMutation.mutateAsync(project.id);
        refetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  return (
    <TooltipProvider>
      <Card className="group hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-xl">
                  {project.title}
                </CardTitle>
                {project.mainStages.some(stage => stage.starred) && (
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                )}
              </div>
              <Badge
                variant="secondary"
                className={`${statusConfig[projectStatus].color} flex items-center space-x-1`}
              >
                {React.createElement(statusConfig[projectStatus].icon, { className: "h-3 w-3 mr-1" })}
                <span className="capitalize">{projectStatus}</span>
              </Badge>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* <Link href={`/videos/${project.id}/${slugify(project.title)}`}>
                  <DropdownMenuItem>
                    <ChevronRight className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                </Link> */}
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={handleDeleteProject}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Project Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{progress?.progress || 0}%</span>
            </div>
            <Progress value={progress?.progress || 0} className="h-2" />
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Timeline</span>
              </div>
              <div className="font-medium">
                {project.startDate ? (
                  <>
                    {new Date(project.startDate).toLocaleDateString()} 
                    {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
                  </>
                ) : (
                  'No dates set'
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                <span>Team</span>
              </div>
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>
                    {project.team.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{project.team.name}</span>
              </div>
            </div>
          </div>

          {/* Task Statistics */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 rounded-lg bg-gray-50">
                  <div className="font-medium">{taskStats.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>Total Tasks</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 rounded-lg bg-green-50">
                  <div className="font-medium text-green-600">{taskStats.completed}</div>
                  <div className="text-xs text-green-600">Done</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>Completed Tasks</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 rounded-lg bg-blue-50">
                  <div className="font-medium text-blue-600">{taskStats.inProgress}</div>
                  <div className="text-xs text-blue-600">Active</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>In Progress Tasks</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 rounded-lg bg-yellow-50">
                  <div className="font-medium text-yellow-600">{taskStats.pending}</div>
                  <div className="text-xs text-yellow-600">Todo</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>Pending Tasks</TooltipContent>
            </Tooltip>
          </div>

          {/* Stages Preview */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Active Stages</span>
              <span>{project.mainStages.length} stages</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.mainStages.map((stage) => (
                <Badge
                  key={stage.id}
                  variant="outline"
                  className={stage.starred ? 'border-yellow-200 bg-yellow-50' : ''}
                >
                  {stage.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>

        <EditProjectModal
          project={project}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={async () => {
            try {
              await toggleProjectCompletionMutation.mutateAsync({
                id: project.id,
                completed: !project.completed,
              });
              refetchProjects();
            } catch (error) {
              console.error('Error updating project:', error);
            }
          }}
        />
      </Card>
    </TooltipProvider>
  );
}

export default ProjectCard;