// components/gantt/GanttBar.tsx
import { cn } from '../../lib/utils';
import { GanttTaskBar, GanttZoomLevel } from '../../types/gantt';
import { TaskStatus } from '@prisma/client';

interface GanttBarProps {
  taskBar: GanttTaskBar;
  zoom: GanttZoomLevel;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  isSelected?: boolean;
}

export function GanttBar({
  taskBar,
  zoom,
  onMouseEnter,
  onMouseLeave,
  onClick,
  isSelected,
}: GanttBarProps) {
  if (!taskBar || !taskBar.task) {
    return null;
  }

  const cellWidth = zoom === 'day' ? 50 : zoom === 'week' ? 100 : 200;
  const rowHeight = 40;

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'PENDING':
      default:
        return 'bg-gray-500';
    }
  };

  const barWidth = Math.max(taskBar.width * cellWidth - 16, 24);
  const barLeft = taskBar.left * cellWidth + 8;

  return (
    <div
      className={cn(
        "absolute h-6 rounded-full cursor-pointer transition-all group",
        getStatusColor(taskBar.task.status),
        isSelected ? 'ring-2 ring-primary' : 'hover:brightness-110'
      )}
      style={{
        left: barLeft,
        width: barWidth,
        top: 8,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div className="px-2 py-1 text-xs text-white truncate">
        {taskBar.task.title}
      </div>
      
      {/* Progress indicator */}
      {taskBar.task.status === 'IN_PROGRESS' && (
        <div 
          className="absolute inset-y-0 left-0 bg-blue-600 rounded-l-full"
          style={{ width: '50%' }}
        />
      )}

      {/* Hover tooltip */}
      <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 bg-white p-2 rounded shadow-lg text-xs z-10 whitespace-nowrap">
        <div className="font-medium">{taskBar.task.title}</div>
        <div className="text-gray-500">
          {taskBar.task.startDate && (
            <span>
              {new Date(taskBar.task.startDate).toLocaleDateString()} - 
            </span>
          )}
          {taskBar.task.dueDate && (
            <span>
              {new Date(taskBar.task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        {taskBar.task.assignee && (
          <div className="text-gray-500">
            Assignee: {taskBar.task.assignee.user.name}
          </div>
        )}
        <div className="flex items-center mt-1">
          <span className={cn(
            "px-1.5 py-0.5 rounded text-white",
            getStatusColor(taskBar.task.status)
          )}>
            {taskBar.task.status}
          </span>
        </div>
      </div>
    </div>
  );
}