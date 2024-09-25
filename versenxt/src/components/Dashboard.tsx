"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Cross } from 'lucide-react';
import ProjectSection from './ProjectSection';
import TaskList from './TaskList';
import { trpc } from '../trpc/client';
import { Button } from "./ui/button";
import { useRouter } from 'next/navigation';
import CalendarComponent from './Calendar';

interface User {
  id: number;
  workOsUserId: string;
  teams: any[];
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTeamPopup, setShowTeamPopup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();
        console.log('Fetched user data:', userData);
        setUser(userData);
        if (userData.teams && userData.teams.length === 0) {
          setShowTeamPopup(true);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const { data: userTeams } = trpc.teams.getUserTeams.useQuery({ workOsUserId: user?.workOsUserId || '' });
  
  const teamId = userTeams && userTeams.length > 0 ? userTeams[0].id : undefined;

  const { data: activeProjectsCount } = trpc.projects.getActiveProjectsCount.useQuery(teamId || 0, {
    enabled: !!teamId
  });

  const { data: nextProjectProgress } = trpc.projects.getNextProjectProgress.useQuery(teamId || 0, {
    enabled: !!teamId
  });

  const handleCreateTeam = () => {
    router.push('/teams');
  };

  const handleClosePopup = () => {
    setShowTeamPopup(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div className="p-0 space-y-6">
      {showTeamPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <h2 className="text-xl font-bold mb-4">Create Your First Team</h2>
            <p className="mb-4">You don&#39;t have any teams yet. Create one to get started!</p>
            <div className="flex justify-between">
              <Button onClick={handleCreateTeam}>Create a Team</Button>
              <Button variant="outline" onClick={handleClosePopup}>Maybe Later</Button>
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
            <div className="text-3xl font-bold">54,231</div>
            <p className="text-sm text-gray-500">+20% from last video</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-[#2f66dd]">Next Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{nextProjectProgress?.progress || 0}%</div>
            <Progress value={nextProjectProgress?.progress || 0} className="mt-2 h-2 bg-gray-200 progress-grey" />
            <p className="text-sm text-gray-500 mt-2">{nextProjectProgress?.title || 'No active projects'}</p>
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




// return (
//   <div className="p-0 space-y-6">
//     {showTeamPopup && (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white p-6 rounded-lg shadow-lg relative">
//           <h2 className="text-xl font-bold mb-4">Create Your First Team</h2>
//           <p className="mb-4">You don&#39;t have any teams yet. Create one to get started!</p>
//           <div className="flex justify-between">
//             <Button onClick={handleCreateTeam}>Create a Team</Button>
//             <Button variant="outline" onClick={handleClosePopup}>Maybe Later</Button>
//           </div>
//         </div>
//       </div>
//     )}

//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//       <Card className="bg-[#F0F8FF] rounded-2xl shadow-sm">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-2xl font-bold text-[#2f66dd]">Videos in Production</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-3xl font-bold">{activeProjectsCount || 0}</div>
//           <p className="text-sm text-gray-500">Active projects</p>
//         </CardContent>
//       </Card>
//       <Card className="bg-[#F0F8FF] rounded-2xl shadow-sm">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-2xl font-bold text-[#2f66dd]">Views on Last Video</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-3xl font-bold">54,231</div>
//           <p className="text-sm text-gray-500">+20% from last video</p>
//         </CardContent>
//       </Card>
//       <Card className="bg-[#F0F8FF] rounded-2xl shadow-sm">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-2xl font-bold text-[#2f66dd]">Next Project Progress</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-3xl font-bold">{nextProjectProgress?.progress || 0}%</div>
//           <Progress value={nextProjectProgress?.progress || 0} className="mt-2 h-2 bg-gray-200 progress-pink" />
//           <p className="text-sm text-gray-500 mt-2">{nextProjectProgress?.title || 'No active projects'}</p>
//         </CardContent>
//       </Card>
//     </div>

//     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//       <div className="md:col-span-2 space-y-6">
//         <ProjectSection />
//       </div>
//       <div className="md:col-span-1">
//         <TaskList />
//       </div>
//     </div>
//     {userTeams && userTeams.length > 0 && (
//       <div className="mt-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Content Calendar</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <CalendarComponent teamId={userTeams[0].id} />
//           </CardContent>
//         </Card>
//       </div>
//     )}
//   </div>
// );
// }