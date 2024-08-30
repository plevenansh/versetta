// components/YouTubeCommentAnalyzer.tsx
'use client';
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from '@/trpc/client';
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

    

  const analyzeCommentsMutation = trpc.youtube.analyzeComments.useMutation({
    onSuccess: (data) => {
      // Ensure the data matches AnalysisData interface
      const analysisData: AnalysisData = {
        general: data.general || "No general analysis provided",
        topComments: Array.isArray(data.topComments) ? data.topComments : [],
        contentIdeas: Array.isArray(data.contentIdeas) ? data.contentIdeas : []
      };
      setAnalysis(analysisData);
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
    await analyzeCommentsMutation.mutateAsync({ 
      url: youtubeUrl,
      prompt: customPrompt || suggestedPrompts[0]
    });
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
                <p className="mt-4 text-gray-700">{analysis.general}</p>
              </TabsContent>
              <TabsContent value="topComments">
                <ul className="mt-4 space-y-2">
                  {analysis.topComments.map((comment, index) => (
                    <li key={index} className="bg-gray-100 p-3 rounded-md">
                      {comment}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="contentIdeas">
                <ul className="mt-4 space-y-2">
                  {analysis.contentIdeas.map((idea, index) => (
                    <li key={index} className="bg-blue-100 p-3 rounded-md">
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