import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from '@/trpc/client'

interface AnalysisData {
  general: string;
  topComments: string[];
  contentIdeas: string[];
}

interface Project {
  id: number;
  title: string;
  videoUrl?: string;
  // Add other project properties as needed
}

const suggestedPrompts = [
  "Analyze the sentiment and main topics of these comments",
  "Identify the most engaging and controversial comments",
  "Suggest content ideas based on these comments"
];

export default function Analytics({ project }: { project: Project }) {
  const [customPrompt, setCustomPrompt] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const analyzeCommentsMutation = trpc.youtube.analyzeComments.useMutation({
    onSuccess: (data: any) => {
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

  const handleAnalyzeComments = async () => {
    if (!project.videoUrl) {
      console.error('No video URL provided');
      return;
    }
    setIsLoading(true);
    await analyzeCommentsMutation.mutateAsync({ 
      url: project.videoUrl,
      prompt: customPrompt || suggestedPrompts[0]
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for video analytics */}
          <p>Video analytics will be displayed here.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comment Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={customPrompt}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomPrompt(e.target.value)}
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
          <Button onClick={handleAnalyzeComments} disabled={isLoading} className="w-full">
            {isLoading ? 'Analyzing Comments...' : 'Analyze Comments'}
          </Button>

          {analysis && (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}