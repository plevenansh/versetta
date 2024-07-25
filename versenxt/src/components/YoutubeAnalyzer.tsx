'use client';
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from '@/trpc/client';

export default function YouTubeCommentAnalyzer() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const analyzeCommentsMutation = trpc.youtube.analyzeComments.useMutation({
    onSuccess: (data) => {
      setAnalysis(data);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error analyzing comments:', error);
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await analyzeCommentsMutation.mutateAsync({ url: youtubeUrl });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Input
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="Enter YouTube Video URL"
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Analyzing Comments...' : 'Analyze Comments'}
        </Button>
      </form>
      {analysis && (
        <div>
          <h2>Comment Analysis Result:</h2>
          <p>{analysis}</p>
        </div>
      )}
    </div>
  );
}
