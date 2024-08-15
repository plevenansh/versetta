// src/routes/dashboard.ts
// import { router, publicProcedure } from '../trpc';
// import prisma from '../lib/prisma';

// export const dashboardRouter = router({
//   getOverview: publicProcedure.query(async () => {
//     const [activeProjects, upcomingTasks, overdueTasks] = await Promise.all([
//       prisma.project.count({ where: { status: 'active' } }),
//       prisma.task.findMany({
//         where: {
//           dueDate: { gte: new Date() },
//           completed: false
//         },
//         take: 5,
//         orderBy: { dueDate: 'asc' }
//       }),
//       prisma.task.findMany({
//         where: {
//           dueDate: { lt: new Date() },
//           completed: false
//         },
//         take: 5,
//         orderBy: { dueDate: 'desc' }
//       })
//     ]);

//     return { activeProjects, upcomingTasks, overdueTasks };
//   })
// });
