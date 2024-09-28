// server/routers/youtube.ts
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { fetchYouTubeComments } from '../../utils/youtubeApi';
import { analyzeComments } from '../../utils/aiAnalysis';
import { TRPCError } from '@trpc/server';

export const youtubeRouter = router({
  analyzeComments: protectedProcedure
    .input(z.object({
      url: z.string().url(),
      prompt: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // You can add additional authorization checks here if needed
        // For example, checking if the user has permission to use this feature

        const comments = await fetchYouTubeComments(input.url);
        const analysis = await analyzeComments(comments, input.prompt);
        return analysis;
      } catch (error) {
        console.error('Error in analyzeComments procedure:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze comments',
        });
      }
    }),
});