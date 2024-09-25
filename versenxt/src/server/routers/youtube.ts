// server/routers/youtube.ts
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { fetchYouTubeComments } from '../../utils/youtubeApi';
import { analyzeComments } from '../../utils/aiAnalysis';

export const youtubeRouter = router({
  analyzeComments: publicProcedure
    .input(z.object({
      url: z.string().url(),
      prompt: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const comments = await fetchYouTubeComments(input.url);
        const analysis = await analyzeComments(comments, input.prompt);
        return analysis;
      } catch (error) {
        console.error('Error in analyzeComments procedure:', error);
        throw new Error('Failed to analyze comments'
         );
      }
    }),
});