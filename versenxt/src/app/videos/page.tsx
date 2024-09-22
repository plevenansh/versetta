"use client"
import React from 'react';
import VideoPage from '@/components/Videos/VideoPage';

export default function Video() {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Current Project</h1>
        <VideoPage />
      </div>
    );
  }
  