// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Input } from "./ui/input";
// import { Button } from "./ui/button";
// import { Textarea } from "./ui/textarea";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import { trpc } from '../trpc/client';
// import { useRouter } from 'next/navigation';
// import { TRPCClientError } from '@trpc/client';

// interface AnalysisData {
//   general: string;
//   topComments: string[];
//   contentIdeas: string[];
//   metrics: {
//     sentimentScore: number | null;
//     engagementLevel: string | null;
//     mainTopics: string[];
//   };
// }

// interface HistoryItem {
//   id: number;
//   youtubeUrl: string;
//   prompt: string;
//   createdAt: string;
// }

// const suggestedPrompts = [
//   "Analyze the sentiment and main topics of these comments",
//   "Identify the most engaging and controversial comments",
//   "Suggest content ideas based on these comments"
// ];

// export default function YouTubeCommentAnalyzer() {
//   const [youtubeUrl, setYoutubeUrl] = useState('');
//   const [customPrompt, setCustomPrompt] = useState('');
//   const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [history, setHistory] = useState<HistoryItem[]>([]);
//   const router = useRouter();

//   const analyzeCommentsMutation = trpc.youtube.analyzeComments.useMutation();
//   const { data: analysisHistory, refetch: refetchHistory } = trpc.youtube.getAnalysisHistory.useQuery();

//   useEffect(() => {
//     if (analysisHistory) {
//       setHistory(analysisHistory);
//     }
//   }, [analysisHistory]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);

//     try {
//       const result = await analyzeCommentsMutation.mutateAsync({ 
//         url: youtubeUrl,
//         prompt: customPrompt || suggestedPrompts[0]
//       });

//       setAnalysis(result as AnalysisData);
//       refetchHistory();
//     } catch (err) {
//       if (err instanceof TRPCClientError) {
//         if (err.data?.code === 'UNAUTHORIZED') {
//           router.push('/login');
//         } else {
//           setError(err.message);
//         }
//       } else {
//         setError('An unexpected error occurred');
//       }
//       console.error('Error analyzing comments:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadHistoryItem = (item: HistoryItem) => {
//     setYoutubeUrl(item.youtubeUrl);
//     setCustomPrompt(item.prompt);
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-8">
//       <Card>
//         <CardHeader>
//           <CardTitle>YouTube Comment Analyzer</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <Input
//               value={youtubeUrl}
//               onChange={(e) => setYoutubeUrl(e.target.value)}
//               placeholder="Enter YouTube Video URL"
//               required
//             />
//             <Textarea
//               value={customPrompt}
//               onChange={(e) => setCustomPrompt(e.target.value)}
//               placeholder="Enter custom prompt (optional)"
//             />
//             <div className="flex flex-wrap gap-2">
//               {suggestedPrompts.map((prompt, index) => (
//                 <Button
//                   key={index}
//                   type="button"
//                   variant="outline"
//                   onClick={() => setCustomPrompt(prompt)}
//                 >
//                   {prompt}
//                 </Button>
//               ))}
//             </div>
//             <Button type="submit" disabled={isLoading} className="w-full">
//               {isLoading ? 'Analyzing Comments...' : 'Analyze Comments'}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>

//       {error && (
//         <Card>
//           <CardContent>
//             <p className="text-red-500">{error}</p>
//           </CardContent>
//         </Card>
//       )}

//       {analysis && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Analysis Results</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="general">
//               <TabsList>
//                 <TabsTrigger value="general">General Analysis</TabsTrigger>
//                 <TabsTrigger value="topComments">Top Comments</TabsTrigger>
//                 <TabsTrigger value="contentIdeas">Content Ideas</TabsTrigger>
//                 <TabsTrigger value="metrics">Metrics</TabsTrigger>
//               </TabsList>
//               <TabsContent value="general">
//                 <p className="mt-4">{analysis.general}</p>
//               </TabsContent>
//               <TabsContent value="topComments">
//                 <ul className="mt-4 space-y-2">
//                   {analysis.topComments.map((comment, index) => (
//                     <li key={index} className="bg-blac p-3 rounded-md">
//                       {comment}
//                     </li>
//                   ))}
//                 </ul>
//               </TabsContent>
//               <TabsContent value="contentIdeas">
//                 <ol className="mt-4 space-y-2 list-decimal list-inside">
//                   {analysis.contentIdeas.map((idea, index) => (
//                     <li key={index} className="bg-blac p-3 rounded-md">
//                       {idea}
//                     </li>
//                   ))}
//                 </ol>
//               </TabsContent>
//               <TabsContent value="metrics">
//                 <div className="mt-4 space-y-2">
//                   <p><strong>Sentiment Score:</strong> {analysis.metrics.sentimentScore}</p>
//                   <p><strong>Engagement Level:</strong> {analysis.metrics.engagementLevel}</p>
//                   <p><strong>Main Topics:</strong> {analysis.metrics.mainTopics.join(', ')}</p>
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>
//       )}

//       <Card>
//         <CardHeader>
//           <CardTitle>Analysis History</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <ul className="space-y-2">
//             {history.map((item) => (
//               <li key={item.id} className="flex justify-between items-center">
//                 <span>{new Date(item.createdAt).toLocaleString()}: {item.youtubeUrl}</span>
//                 <Button onClick={() => loadHistoryItem(item)}>Load</Button>
//               </li>
//             ))}
//           </ul>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }



'use client';
import React, { useState, useEffect } from 'react';
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
  metrics: {
    sentimentScore: number;
    engagementLevel: string;
    mainTopics: string[];
  };
}

interface HistoryItem {
  id: number;
  userId: number;
  youtubeUrl: string;
  prompt: string;
  generalAnalysis: string;
  topComments: string[];
  contentIdeas: string[];
  metrics: {
    sentimentScore: number;
    engagementLevel: string;
    mainTopics: string[];
  };
  createdAt: string;
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
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const router = useRouter();

  const analyzeCommentsMutation = trpc.youtube.analyzeComments.useMutation();
  const { data: analysisHistory, refetch: refetchHistory } = trpc.youtube.getAnalysisHistory.useQuery();

  function isValidHistoryItem(item: any): item is HistoryItem {
    return (
      typeof item.id === 'number' &&
      typeof item.userId === 'number' &&
      typeof item.youtubeUrl === 'string' &&
      typeof item.prompt === 'string' &&
      typeof item.generalAnalysis === 'string' &&
      Array.isArray(item.topComments) &&
      Array.isArray(item.contentIdeas) &&
      typeof item.metrics === 'object' &&
      typeof item.metrics.sentimentScore === 'number' &&
      typeof item.metrics.engagementLevel === 'string' &&
      Array.isArray(item.metrics.mainTopics) &&
      typeof item.createdAt === 'string'
    );
  }
  
  useEffect(() => {
    if (analysisHistory) {
      const validHistory = (analysisHistory as any[]).filter(isValidHistoryItem);
      setHistory(validHistory);
    }
  }, [analysisHistory]);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeCommentsMutation.mutateAsync({ 
        url: youtubeUrl,
        prompt: customPrompt || suggestedPrompts[0]
      });

      setAnalysis(result as AnalysisData);
      refetchHistory();
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

  const loadHistoryItem = (item: HistoryItem) => {
    setYoutubeUrl(item.youtubeUrl);
    setCustomPrompt(item.prompt);
    setAnalysis({
      general: item.generalAnalysis,
      topComments: item.topComments as string[],
      contentIdeas: item.contentIdeas as string[],
      metrics: {
        sentimentScore: item.metrics.sentimentScore as number,
        engagementLevel: item.metrics.engagementLevel as string,
        mainTopics: item.metrics.mainTopics as string[],
      }
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
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
                <p className="mt-4">{analysis.general}</p>
              </TabsContent>
              <TabsContent value="topComments">
                <ul className="mt-4 space-y-2">
                  {analysis.topComments.map((comment, index) => (
                    <li key={index} className="bg-gray-10 p-3 rounded-md">
                      {comment}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="contentIdeas">
                <ul className="mt-4 space-y-2">
                  {analysis.contentIdeas.map((idea, index) => (
                    <li key={index} className="bg-blue-10 p-3 rounded-md">
                      {idea}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="metrics">
                <div className="mt-4 space-y-2">
                  <p><strong>Sentiment Score:</strong> {analysis.metrics.sentimentScore}</p>
                  <p><strong>Engagement Level:</strong> {analysis.metrics.engagementLevel}</p>
                  <p><strong>Main Topics:</strong> {analysis.metrics.mainTopics.join(', ')}</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

<Card>
  <CardHeader>
    <CardTitle>Analysis History</CardTitle>
  </CardHeader>
  <CardContent>
    <ul className="space-y-2">
        {history.map((item: HistoryItem) => (
      <li key={item.id} className="flex justify-between items-center">
        <span>{new Date(item.createdAt).toLocaleString()}: {item.youtubeUrl}</span>
        <Button onClick={() => loadHistoryItem(item)}>Load</Button>
      </li>
    ))}
    </ul>
  </CardContent>
</Card>
    </div>
  );
}