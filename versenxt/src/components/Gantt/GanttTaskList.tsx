// components/gantt/GanttTaskList.tsx
import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { TaskStatus, TaskPriority } from '@prisma/client';

interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: {
    user: {
      name: string;
      profilePictureUrl?: string;
    };
  };
}

interface GanttTaskListProps {
  tasks: Task[];
  rowHeight?: number;
  onTaskClick?: (taskId: number) => void;
}

export function GanttTaskList({
  tasks,
  rowHeight = 40,
  onTaskClick
}: GanttTaskListProps) {
  return (
    <ScrollArea className="border-r">
      <div style={{ width: '250px' }}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center px-4 border-b hover:bg-gray-50 cursor-pointer"
            style={{ height: rowHeight }}
            onClick={() => onTaskClick?.(task.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{task.title}</p>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {task.status.toLowerCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {task.priority.toLowerCase()}
                </Badge>
              </div>
            </div>
            {task.assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={task.assignee.user.profilePictureUrl}
                  alt={task.assignee.user.name}
                />
                <AvatarFallback>
                  {task.assignee.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}