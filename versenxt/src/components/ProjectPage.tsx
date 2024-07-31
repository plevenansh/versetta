// ProjectPage.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { trpc } from '@/trpc/client';

interface ProjectPageProps {
  projectId: number;
}

export default function ProjectPage({ projectId }: ProjectPageProps) {
  //const router = useRouter();
  const { data: project, isLoading, error } = trpc.projects.getById.useQuery(projectId);
  const [percentageDone, setPercentageDone] = useState(0);

  useEffect(() => {
    if (project && project.stages) {
      const completedStages = project.stages.filter(stage => stage.completed).length;
      const percentage = (completedStages / project.stages.length) * 100;
      setPercentageDone(Math.round(percentage));
    }
  }, [project]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!project) return <div>Project not found</div>;

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Card className="w-full bg-white shadow-lg">
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <Button onClick={() => router.back()} variant="outline">Back to Projects</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Project Details</h3>
            <p>Status: {project.status}</p>
            <p>Progress: {percentageDone}% Complete</p>
            <Progress value={percentageDone} className="w-full" />
            <p>Start Date: {formatDate(project.startDate)}</p>
            <p>Expected Publish Date: {formatDate(project.endDate)}</p>
            <p>Team ID: {project.teamId}</p>
            <p>Creator ID: {project.creatorId}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Description</h3>
            <p>{project.description || 'No description available.'}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Idea</h3>
            <p>{project.idea || 'No idea description available.'}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Production Stages</h3>
            {project.stages.map((stage, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className={`w-4 h-4 rounded-full ${stage.completed ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span>{stage.stage}</span>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-semibold">Tasks</h3>
            {project.tasks && project.tasks.length > 0 ? (
              project.tasks.map((task, index) => (
                <div key={index}>
                  <p>{task.title} - {task.status}</p>
                </div>
              ))
            ) : (
              <p>No tasks available.</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold">Short Videos / Clips</h3>
            {/* Placeholder for video/clip content */}
            <p>Video content will be displayed here once implemented.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}