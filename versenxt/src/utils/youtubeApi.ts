import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

export async function fetchYouTubeComments(url: string) {
  const videoId = extractVideoId(url);
  const response = await youtube.commentThreads.list({
    part: ['snippet'],
    videoId: videoId,
    maxResults: 200 // Adjust as needed
  });

  return response.data.items.map(item => item.snippet.topLevelComment.snippet.textDisplay);
}

function extractVideoId(url: string) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
