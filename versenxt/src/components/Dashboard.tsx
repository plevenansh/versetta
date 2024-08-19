"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ProjectSection from './ProjectSection';
import TaskList from './TaskList';

export default function Dashboard() {
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
