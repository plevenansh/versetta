// src/components/Dashboard.tsx
"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import ProjectSection from './ProjectSection';
import TaskList from './TaskList';
import { trpc } from '../utils/trpc';
import { Button } from "./ui/button";
import { useRouter } from 'next/navigation';
import CalendarComponent from './Calendar';

export default function ClientDashboard() {
  const router = useRouter();

 const { data: user, isLoading: userLoading, error: userError } = trpc.users.getOrCreateUser.useQuery();
  const { data: userTeams, isLoading: teamsLoading } = trpc.teams.getUserTeams.useQuery(undefined, {
    enabled: !!user
  });

  const teamId = userTeams && userTeams.length > 0 ? userTeams[0].id : undefined;

  const { data: activeProjectsCount, isLoading: projectsLoading } = trpc.projects.getActiveProjectsCount.useQuery(
    teamId || 0,
    { enabled: !!teamId }
  );

  // const { data: nextProjectProgress, isLoading: progressLoading } = trpc.projects.getNextProjectProgress.useQuery(
  //   teamId || 0,
  //   { enabled: !!teamId }
  // );

  const handleCreateTeam = () => {
    router.push('/teams');
  };

  // if (userLoading || teamsLoading || projectsLoading || progressLoading) {
  //   return <div>Loading...</div>;
  // }

  if (userError) {
    return <div>Error: {userError.message}</div>;
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  const showTeamPopup = userTeams && userTeams.length === 0;

  return (
    <div className="p-0 space-y-6">
      {showTeamPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <h2 className="text-xl text-black font-bold mb-4">Create Your First Team</h2>
            <p className="mb-4 text-gray-700">You don&#39;t have any teams yet. Create one to get started!</p>
            <div className="flex justify-between">
              <Button onClick={handleCreateTeam}>Create a Team</Button>
              <Button variant="outline" onClick={() => router.push('/')}>Maybe Later</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-[#2f66dd]">Videos in Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeProjectsCount || 0}</div>
            <p className="text-sm text-gray-500">Active projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-[#2f66dd]">Views on Last Video</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Add videos</div>
            <p className="text-sm text-gray-500">+x% from last video</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-[#2f66dd]">Next Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {/* <div className="text-3xl font-bold">{nextProjectProgress?.progress || 0}%</div>
            <Progress value={nextProjectProgress?.progress || 0} className="mt-2 h-2 bg-gray-200 progress-grey" />
            <p className="text-sm text-gray-500 mt-2">{nextProjectProgress?.title || 'No active projects'}</p> */}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-6">
          <ProjectSection />
        </div>
        <div className="md:col-span-1">
          <TaskList />
        </div>
      </div>
      {userTeams && userTeams.length > 0 && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent teamId={userTeams[0].id} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
