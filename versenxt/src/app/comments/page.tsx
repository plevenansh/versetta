import React from 'react';
import YouTubeCommentAnalyzer from '@/components/YoutubeAnalyzer';

export default function CommentsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">YouTube Comment Analyzer</h1>
      <YouTubeCommentAnalyzer />
      
    </div>
  );
}
