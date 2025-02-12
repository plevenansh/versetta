import axios from 'axios';

interface AnalysisResponse {
  general: string;
  topComments: string[];
  contentIdeas: string[];
  metrics: {
    sentimentScore: number;
    engagementLevel: string;
    mainTopics: string[];
  };
}

export async function analyzeComments(comments: string[] | undefined, prompt: string): Promise<AnalysisResponse> {
  // Input validation
  if (!comments || !Array.isArray(comments) || comments.length === 0) {
    return {
      general: "No comments to analyze or invalid comments data.",
      topComments: [],
      contentIdeas: [],
      metrics: {
        sentimentScore: 0,
        engagementLevel: "low",
        mainTopics: []
      }
    };
  }

  const fullPrompt = `${prompt}\n\nComments:\n${comments.slice(0, 100).join('\n')}

Analyze these comments and return ONLY a valid JSON object with no markdown formatting, no explanations, and no code blocks. The response must be a pure JSON object with this structure:
{
  "general": "A general analysis of the comments",
  "topComments": ["Comment 1", "Comment 2"],
  "contentIdeas": ["Idea 1", "Idea 2"],
  "metrics": {
    "sentimentScore": 0,
    "engagementLevel": "low/medium/high",
    "mainTopics": ["Topic 1", "Topic 2"]
  }
}`;

  try {
    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'sonar',
      messages: [{ role: 'user', content: fullPrompt }],
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Validate API response
    if (!response.data?.choices?.[0]?.message?.content) {
      console.error('Invalid API Response:', response.data);
      throw new Error('Unexpected API response structure');
    }

    const content = response.data.choices[0].message.content;
    
    // Enhanced content cleaning function
    const cleanContent = (rawContent: string): string => {
      // Remove markdown code blocks
      let cleaned = rawContent.replace(/``````/g, '');
      // Remove any non-JSON text before the first { and after the last }
      cleaned = cleaned.replace(/^[^{]*/, '').replace(/}[^}]*$/, '}');
      // Remove any whitespace or newlines at the start/end
      cleaned = cleaned.trim();
      return cleaned;
    };

    const cleanedContent = cleanContent(content);

    try {
      // Parse and validate the JSON structure
      const analysisData = JSON.parse(cleanedContent) as AnalysisResponse;
      
      // Validate required fields
      if (!analysisData.general || 
          !Array.isArray(analysisData.topComments) || 
          !Array.isArray(analysisData.contentIdeas) ||
          !analysisData.metrics ||
          typeof analysisData.metrics.sentimentScore !== 'number' ||
          !analysisData.metrics.engagementLevel ||
          !Array.isArray(analysisData.metrics.mainTopics)) {
        throw new Error('Invalid response structure');
      }

      return analysisData;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw content:', content);
      console.error('Cleaned content:', cleanedContent);
      throw new Error('Failed to parse API response as JSON');
    }
  } catch (error) {
    console.error('Error analyzing comments:', error);
    throw error;
  }
}

// YouTube API utility functions
import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

export async function fetchYouTubeComments(url: string): Promise<string[]> {
  const videoId = extractVideoId(url);
  
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  try {
    const response = await youtube.commentThreads.list({
      part: ['snippet'],
      videoId: videoId,
      maxResults: 100
    });

    if (!response.data.items) {
      return [];
    }

    return response.data.items
      .map(item => item.snippet?.topLevelComment?.snippet?.textDisplay || '')
      .filter(comment => comment !== '');
  } catch (error) {
    console.error('Error fetching YouTube comments:', error);
    throw new Error('Failed to fetch YouTube comments');
  }
}

function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
