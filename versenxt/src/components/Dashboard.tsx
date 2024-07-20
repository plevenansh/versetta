"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ProjectSection from './ProjectSection';
import TaskList from './TaskList';

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-indigo-700">Videos in Production</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-indigo-500"
            >
              <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5" />
              <path d="M9 21h6" />
              <path d="M12 17v4" />
              <path d="M3 12h18" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-900">12</div>
            <p className="text-sm text-indigo-600">+2 from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-indigo-700">Views on Last Video</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-indigo-500"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-900">54,231</div>
            <p className="text-sm text-indigo-600">+20% from last video</p>
          </CardContent>
        </Card>

        <Card className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-indigo-700">Next Project Progress</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-indigo-500"
            >
              <path d="M12 2v20" />
              <path d="M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-900">68%</div>
            <Progress value={68} className="mt-2 bg-indigo-200" indicatorClassName="bg-indigo-600" />
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
