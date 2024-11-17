// components/gantt/GanttMilestone.tsx
import React from 'react';
import { Flag } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface GanttMilestoneProps {
  title: string;
  date: Date;
  left: number;
  type?: 'start' | 'end' | 'milestone';
  color?: string;
}

export function GanttMilestone({
  title,
  date,
  left,
  type = 'milestone',
  color = 'bg-blue-500'
}: GanttMilestoneProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${color}`}
          style={{ left: `${left}px` }}
        >
          <div className="w-4 h-4 transform rotate-45">
            {type === 'milestone' ? (
              <Flag className="h-4 w-4 text-white" />
            ) : (
              <div className={`w-3 h-3 ${color}`} />
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{title}</p>
        <p className="text-sm text-gray-500">
          {date.toLocaleDateString()}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}