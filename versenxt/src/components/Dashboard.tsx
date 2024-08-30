"use client"
import React, {useEffect,useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ProjectSection from './ProjectSection';
import TaskList from './TaskList';
import { trpc } from '@/trpc/client';


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
       // setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);
 console.log('user:', user);
 
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    console.log('user in dashboard:', user);
    return <div>No user data available</div>;
  }

  return (
    <div className="p-0 space-y-6 ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card className="bg-[#F0F8FF] rounded-2xl shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-2xl font-bold text-[#2f66dd]">Videos in Production</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">12</div>
      <p className="text-sm text-gray-500">+2 from last week</p>
    </CardContent>
  </Card>

  <Card className="bg-[#F0F8FF] rounded-2xl shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-2xl font-bold text-[#2f66dd]">Views on Last Video</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">54,231</div>
      <p className="text-sm text-gray-500">+20% from last video</p>
    </CardContent>
  </Card>

  <Card className="bg-[#F0F8FF] rounded-2xl shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-2xl font-bold text-[#2f66dd]">Next Project Progress</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">68%</div>
      <Progress value={68} className="mt-2 h-2 bg-gray-200 progress-pink"  />
    </CardContent>
  </Card>
</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <ProjectSection />
        </div>
        <div className="md:col-span-1">
          <TaskList />
        </div>
      </div>
    </div>
  );
}
