// components/YouTubeCommentAnalyzer.tsx
'use client';
import React, { useState } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { trpc } from '../trpc/client';
import { useRouter } from 'next/navigation';
import { TRPCClientError } from '@trpc/client';

interface AnalysisData {
  general: string;
  topComments: string[];
  contentIdeas: string[];
}

const suggestedPrompts = [
  "Analyze the sentiment and main topics of these comments",
  "Identify the most engaging and controversial comments",
  "Suggest content ideas based on these comments"
];

export default function YouTubeCommentAnalyzer() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const analyzeCommentsMutation = trpc.youtube.analyzeComments.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeCommentsMutation.mutateAsync({ 
        url: youtubeUrl,
        prompt: customPrompt || suggestedPrompts[0]
      });

      const analysisData: AnalysisData = {
        general: result.general || "No general analysis provided",
        topComments: Array.isArray(result.topComments) ? result.topComments : [],
        contentIdeas: Array.isArray(result.contentIdeas) ? result.contentIdeas : []
      };
      setAnalysis(analysisData);
    } catch (err) {
      if (err instanceof TRPCClientError) {
        if (err.data?.code === 'UNAUTHORIZED') {
          router.push('/login');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Error analyzing comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>YouTube Comment Analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Enter YouTube Video URL"
              required
            />
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter custom prompt (optional)"
            />
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  onClick={() => setCustomPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Analyzing Comments...' : 'Analyze Comments'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general">
              <TabsList>
                <TabsTrigger value="general">General Analysis</TabsTrigger>
                <TabsTrigger value="topComments">Top Comments</TabsTrigger>
                <TabsTrigger value="contentIdeas">Content Ideas</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
                <p className="mt-4">{analysis.general}</p>
              </TabsContent>
              <TabsContent value="topComments">
                <ul className="mt-4 space-y-2">
                  {analysis.topComments.map((comment, index) => (
                    <li key={index} className="bg-gray-100 text-black p-3 rounded-md">
                      {comment}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="contentIdeas">
                <ul className="mt-4 space-y-2">
                  {analysis.contentIdeas.map((idea, index) => (
                    <li key={index} className="bg-blue-100 p-3 text-black rounded-md">
                      {idea}
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}