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
      maxResults: 200 // Adjust as needed
    });

    if (!response.data.items) {
      return [];
    }

    return response.data.items.map(item => 
      item.snippet?.topLevelComment?.snippet?.textDisplay || ''
    );
  } catch (error) {
    console.error('Error fetching YouTube comments:', error);
    throw error;
  }
}

function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}