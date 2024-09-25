// app/comments/page.tsx
import React from 'react';
import { getUser } from '@workos-inc/authkit-nextjs';
import YouTubeCommentAnalyzer from '../../components/YoutubeAnalyzer';

async function getAuthenticatedUser() {
  try {
    const workOsData = await getUser();
    if (!workOsData || !workOsData.user) {
      return null;
    }
    return workOsData.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export default async function CommentsPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">YouTube Comment Analyzer</h1>
      
      {user ? (
        <YouTubeCommentAnalyzer />
      ) : (
        <p>Please log in to access the YouTube Comment Analyzer.</p>
      )}
    </div>
  );
}