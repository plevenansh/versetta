"use client"

import React from 'react';
import VideoPage from '@/components/Videos/VideoPage';
import { useParams } from 'next/navigation';

export default function Video() {
    const params = useParams();
    const id = params.id;
    console.log('Raw id from params:', id);
    
    const projectId = id ? parseInt(id as string, 10) : null;
    console.log('Parsed projectId:', projectId);

    if (projectId === null || isNaN(projectId)) {
        return <div>Invalid project ID</div>;
    }

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Current Project</h1>
        <VideoPage projectId={projectId} />
      </div>
    );
}