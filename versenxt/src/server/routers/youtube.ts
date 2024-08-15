import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { fetchYouTubeComments } from '@/utils/youtubeApi';
import { analyzeComments } from '@/utils/aiAnalysis';

export const youtubeRouter = router({
  analyzeComments: publicProcedure
    .input(z.object({
      url: z.string().url()
    }))
    .mutation(async ({ input }) => {
      // 1. Fetch YouTube comments
      const comments = await fetchYouTubeComments(input.url);
      
      // 2. Analyze comments with AI
      const analysis = await analyzeComments(comments);
      
      return analysis;
    }),
});
