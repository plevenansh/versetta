// // components/gantt/GanttTooltip.tsx
// import { GanttTask } from '../../types/gantt';
// import { format } from 'date-fns';

// interface GanttTooltipProps {
//   task: GanttTask;
//   x: number;
//   y: number;
// }

// export function GanttTooltip({ task, x, y }: GanttTooltipProps) {
//   return (
//     <div
//       className="absolute z-50 p-4 bg-background border rounded-lg shadow-lg"
//       style={{
//         left: x,
//         top: y,
//         transform: 'translate(-50%, -100%)',
//         marginTop: -8,
//       }}
//     >
//       <h3 className="font-medium mb-2">{task.title}</h3>
//       {task.description && (
//         <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
//       )}
//       <div className="grid grid-cols-2 gap-2 text-sm">
//         <div>
//           <span className="text-muted-foreground">Status:</span>{' '}
//           <span className="font-medium">{task.status}</span>
//         </div>
//         <div>
//           <span className="text-muted-foreground">Priority:</span>{' '}
//           <span className="font-medium">{task.priority}</span>
//         </div>
//         {task.startDate && (
//           <div>
//             <span className="text-muted-foreground">Start:</span>{' '}
//             <span className="font-medium">
//               {format(task.startDate, 'MMM d, yyyy')}
//             </span>
//           </div>
//         )}
//         {task.dueDate && (
//           <div>
//             <span className="text-muted-foreground">Due:</span>{' '}
//             <span className="font-medium">
//               {format(task.dueDate, 'MMM d, yyyy')}
//             </span>
//           </div>
//         )}
//         {task.assignee && (
//           <div className="col-span-2">
//             <span className="text-muted-foreground">Assignee:</span>{' '}
//             <span className="font-medium">{task.assignee.user.name}</span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
