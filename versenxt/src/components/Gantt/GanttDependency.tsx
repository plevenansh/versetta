// components/gantt/GanttDependency.tsx
import React from 'react';

interface GanttDependencyProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  type?: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
}

export function GanttDependency({
  startX,
  startY,
  endX,
  endY,
  type = 'finish-to-start'
}: GanttDependencyProps) {
  const path = `
    M ${startX},${startY}
    C ${startX + 20},${startY}
      ${endX - 20},${endY}
      ${endX},${endY}
  `;

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 2"
        className="text-gray-400"
      />
      <circle
        cx={endX}
        cy={endY}
        r="3"
        fill="currentColor"
        className="text-gray-400"
      />
    </svg>
  );
}