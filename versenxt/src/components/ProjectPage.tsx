// components/ProjectPage.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { trpc } from '../trpc/client';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { CheckCircle, Circle, Calendar, Users, User } from 'lucide-react';

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
  status: 'pending' | 'completed';
  description: string | undefined;
  dueDate: string | null;
  projectId: number | null;
  teamId: number| undefined;
  creatorId: number;
  assigneeId: number | null;
}

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
  tasks?: Task[];
  completed?: boolean;
}

interface ProjectPageProps {
  projectId: number;
}

const ProjectPage: React.FC<ProjectPageProps> = ({ projectId }) => {
  const { data: project, isLoading, refetch } = trpc.projects.getById.useQuery(projectId);
  const [projectStages, setProjectStages] = useState<ProjectStage[]>([]);
  const [percentageDone, setPercentageDone] = useState(0);

  const updateProjectStageMutation = trpc.projects.updateProjectStage.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (project?.stages) {
      const sortedStages = [...project.stages].sort((a, b) => {
        if (a.completed === b.completed) {
          return a.order - b.order;
        }
        return a.completed ? -1 : 1;
      });
      setProjectStages(sortedStages);
    }
  }, [project]);

  useEffect(() => {
    const completedStages = projectStages.filter(stage => stage.completed).length;
    const percentage = (completedStages / projectStages.length) * 100;
    setPercentageDone(Math.round(percentage));
  }, [projectStages]);

  const toggleStage = (stageId: number) => {
    const updatedStages = projectStages.map(s => {
      if (s.id === stageId) {
        return { ...s, completed: !s.completed };
      }
      return s;
    });
    setProjectStages(updatedStages);

    const stage = updatedStages.find(s => s.id === stageId);
    if (stage) {
      updateProjectStageMutation.mutate({
        projectId: projectId,
        stage: stage.stage,
        completed: stage.completed,
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{project.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Status:</strong> {project.status}</p>
              <p><strong>Start Date:</strong> {formatDate(project.startDate)}</p>
              <p><strong>End Date:</strong> {formatDate(project.endDate)}</p>
            </div>
            <div>
              <p><strong>Project ID:</strong> {project.id}</p>
              <p><strong>Team ID:</strong> {project.teamId}</p>
              <p><strong>Creator ID:</strong> {project.creatorId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* <Card className="mb-6">
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={percentageDone} className="w-full" />
          <p className="text-center mt-2">{percentageDone}% Complete</p>
        </CardContent>
      </Card> */}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Production Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {projectStages.map((stage, index) => (
              <div key={stage.id} className="flex items-center">
                <div
                  onClick={() => toggleStage(stage.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer ${
                    stage.completed ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stage.completed ? <CheckCircle /> : <Circle />}
                </div>
                <span className="ml-2">{stage.stage}</span>
                {index < projectStages.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-300 mx-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {project.tasks && project.tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {project.tasks.map((task) => (
                <li key={task.id} className="mb-2">
                  <div className="flex justify-between items-center">
                    <span>{task.title} - {task.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectPage;
