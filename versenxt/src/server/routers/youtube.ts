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
//           take: 10 // Limit to the last 10 analyses
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

        // Save the analysis to the database
        await prisma.commentAnalysis.create({
          data: {
            youtubeUrl: input.url,
            prompt: input.prompt,
            generalAnalysis: analysis.general,
            topComments: analysis.topComments,
            contentIdeas: analysis.contentIdeas,
            metrics: analysis.metrics,
            userId: ctx.user.id
          }
        });

        return analysis;
      } catch (error) {
        console.error('Error in analyzeComments procedure:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to analyze comments' });
      }
    }),

  getAnalysisHistory: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const history = await prisma.commentAnalysis.findMany({
          where: { userId: ctx.user.id },
          orderBy: { createdAt: 'desc' },
        });
        return history;
      } catch (error) {
        console.error('Error fetching analysis history:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch analysis history' });
      }
    })
});
