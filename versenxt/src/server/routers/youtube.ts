
// import { router, protectedProcedure } from '../trpc';
// import { z } from 'zod';
// import { fetchYouTubeComments } from '../../utils/youtubeApi';
// import { analyzeComments } from '../../utils/aiAnalysis';
// import { TRPCError } from '@trpc/server';
// import prisma from '../../lib/prisma';

// export const youtubeRouter = router({
//   analyzeComments: protectedProcedure
//     .input(z.object({
//       url: z.string().url(),
//       prompt: z.string()
//     }))
//     .mutation(async ({ input, ctx }) => {
//       try {
//         const comments = await fetchYouTubeComments(input.url);
//         const analysis = await analyzeComments(comments, input.prompt);

//         // Save the analysis to the database
//         await prisma.commentAnalysis.create({
//           data: {
//             youtubeUrl: input.url,
//             prompt: input.prompt,
//             generalAnalysis: analysis.general,
//             topComments: analysis.topComments,
//             contentIdeas: analysis.contentIdeas,
//             metrics: analysis.metrics,
//             userId: ctx.user.id
//           }
//         });

//         return analysis;
//       } catch (error) {
//         console.error('Error in analyzeComments procedure:', error);
//         throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to analyze comments' });
//       }
//     }),

//   getAnalysisHistory: protectedProcedure
//     .query(async ({ ctx }) => {
//       try {
//         const history = await prisma.commentAnalysis.findMany({
//           where: { userId: ctx.user.id },
//           orderBy: { createdAt: 'desc' },
//         });
//         return history;
//       } catch (error) {
//         console.error('Error fetching analysis history:', error);
//         throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch analysis history' });
//       }
//     })
// });



import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { fetchYouTubeComments } from '../../utils/youtubeApi';
import { analyzeComments } from '../../utils/aiAnalysis';
import { TRPCError } from '@trpc/server';
import prisma from '../../lib/prisma';

const metricsSchema = z.object({
  sentimentScore: z.number(),
  engagementLevel: z.string(),
  mainTopics: z.array(z.string())
});

const analysisSchema = z.object({
  general: z.string(),
  topComments: z.array(z.string()),
  contentIdeas: z.array(z.string()),
  metrics: metricsSchema
});

export const youtubeRouter = router({
  analyzeComments: protectedProcedure
    .input(z.object({
      url: z.string().url(),
      prompt: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const comments = await fetchYouTubeComments(input.url);
        const analysis = await analyzeComments(comments, input.prompt);

        // Validate analysis data
        const validatedAnalysis = analysisSchema.parse(analysis);

        // Save the analysis to the database
        await prisma.commentAnalysis.create({
          data: {
            youtubeUrl: input.url,
            prompt: input.prompt,
            generalAnalysis: validatedAnalysis.general,
            topComments: validatedAnalysis.topComments,
            contentIdeas: validatedAnalysis.contentIdeas,
            metrics: validatedAnalysis.metrics,
            userId: ctx.user.id
          }
        });

        return validatedAnalysis;
      } catch (error) {
        console.error('Error in analyzeComments procedure:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: error instanceof Error ? error.message : 'Failed to analyze comments'
        });
      }
    }),

  getAnalysisHistory: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const history = await prisma.commentAnalysis.findMany({
          where: { userId: ctx.user.id },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            youtubeUrl: true,
            prompt: true,
            generalAnalysis: true,
            topComments: true,
            contentIdeas: true,
            metrics: true,
            createdAt: true,
            userId: true
          }
        });
        return history;
      } catch (error) {
        console.error('Error fetching analysis history:', error);
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: 'Failed to fetch analysis history'
        });
      }
    })
});
