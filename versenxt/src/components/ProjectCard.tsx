"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, Circle, ChevronDown, ChevronUp, Send, Edit, Trash2 } from 'lucide-react';
import { EditProjectModal } from './EditProjectModal';
import { trpc } from '@/trpc/client';
import Link from 'next/link';
import { slugify } from '@/utils/slugify';
interface ProjectStage {
  id: number;
  projectId: number;
  stage: string;
  completed: boolean;
  order: number;
}

interface Task {
  id: number;
  title: string;
  status: string;
}

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    startDate: string | null;
    endDate: string | null;
    creatorId: number;
    teamId: number;
    stages: ProjectStage[];
    tasks?: Task[];
    isopen?: boolean;
  };
  refetchProjects: () => void;
}

export default function ProjectCard({ project, refetchProjects }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [projectStages, setProjectStages] = useState<ProjectStage[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [percentageDone, setPercentageDone] = useState(0);

  const { data: projectWithTasks, refetch } = trpc.projects.getById.useQuery(project.id);
  const deleteProjectMutation = trpc.projects.delete.useMutation();
  const updateProjectStageMutation = trpc.projects.updateProjectStage.useMutation({
    onSuccess: () => {
      refetch();
      refetchProjects();
    },
  });

  useEffect(() => {
    if (project.stages) {
      const sortedStages = [...project.stages].sort((a, b) => {
        if (a.completed === b.completed) {
          return a.order - b.order;
        }
        return a.completed ? -1 : 1;
      });
      setProjectStages(sortedStages);
    }
  }, [project.stages]);

  const updatePercentage = useCallback(() => {
    const completedStages = projectStages.filter(stage => stage.completed).length;
    const percentage = (completedStages / projectStages.length) * 100;
    setPercentageDone(Math.round(percentage));
  }, [projectStages]);

  useEffect(() => {
    updatePercentage();
  }, [projectStages, updatePercentage]);

  const toggleStage = (stage: string) => {
    const updatedStages = projectStages.map(s => {
      if (s.stage === stage) {
        return { ...s, completed: !s.completed };
      }
      return s;
    });

const sortedStages = updatedStages.sort((a, b) => {
  if (a.completed === b.completed) {
    return a.order - b.order;
  }
  return a.completed ? -1 : 1;
});

    setProjectStages(updatedStages);
    updateProjectStageMutation.mutate({
      projectId: project.id,
      stage,
      completed: !projectStages.find(s => s.stage === stage)?.completed,
    });
  };

  const toggleProjectCompletion = trpc.projects.toggleProjectCompletion.useMutation({
    onSuccess: () => {
      refetchProjects();
    },
  });

const getCompletedWidth = (): string => {
  const completedStages = projectStages.filter(stage => stage.completed).length;
  return `${(completedStages / projectStages.length) * 100}%`;
};

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleDelete = async () => {
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
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-2xl font-bold">{project.title}</CardTitle>
        <div className="flex space-x-2">
          <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="text-blue-600">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" className="text-green-600">
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
          <Button onClick={handleDelete} variant="outline" className="text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Link href={`/projects/${project.id}/${slugify(project.title)}`}>
        <Button variant="outline" className="w-full justify-between mb-4">
          Expand
        </Button>
      </Link>
        </div>
      </CardHeader>
      <CardContent>
        

      <div className="flex items-center space-x-2 mt-2">
  <Switch
    checked={project.completed}
    onCheckedChange={(checked) => {
      toggleProjectCompletion.mutate({ id: project.id, completed: checked });
    }}
  />
  <span>{project.completed ? "Completed" : "In Progress"}</span>
</div>


        <div className="mb-4">
          <p>Project ID: {project.id}</p>
          <p>Team ID: {project.teamId}</p>
          <p>Creator ID: {project.creatorId}</p>
        </div>
        <Button 
          onClick={() => setExpanded(!expanded)} 
          variant="outline" 
          className="w-full justify-between mb-4"
        >
          <span>Details</span>
          {expanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>
        <div className="space-y-2">
          <p>Current: {project.status}</p>
          <Progress value={percentageDone} className="w-full" />
          <p className="text-right">{percentageDone}% Complete</p>
          <p>Expected Publish: {formatDate(project.endDate)}</p>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <h3 className="font-bold mb-2">Production Stages</h3>
              <div className="flex items-center space-x-2">
                {projectStages.map((stage, index) => (
                  <React.Fragment key={stage.id}>
                    <Button
                      onClick={() => toggleStage(stage.stage)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        stage.completed ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {stage.completed ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </Button>
                    {index < projectStages.length - 1 && (
                      <div className="flex-grow h-1 bg-blue-300"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {projectStages.map((stage) => (
                  <span key={stage.id} className="text-xs">{stage.stage}</span>
                ))}
              </div>
              {project.tasks && project.tasks.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-bold mb-2">Tasks</h3>
                  <ul className="list-disc pl-5">
                    {project.tasks.map((task) => (
                      <li key={task.id}>{task.title} - {task.status}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      {isEditModalOpen && (
  <EditProjectModal
    project={{...project, stages: projectStages}}
    isOpen={isEditModalOpen}
    onClose={() => setIsEditModalOpen(false)}
    onUpdate={() => {
      refetch();
      refetchProjects();
    }}
  />
)}
    </Card>
  );
}