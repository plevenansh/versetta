// components/gantt/GanttGrid.tsx
import React from 'react';

interface TimelineItem {
  date: Date;
  label: string;
  isWeekend: boolean;
}

interface GanttGridProps {
  timeline: TimelineItem[];
  rowCount: number;
  cellWidth?: number;
  rowHeight?: number;
}

export function GanttGrid({ 
  timeline, 
  rowCount, 
  cellWidth = 50, 
  rowHeight = 40 
}: GanttGridProps) {
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        height: rowCount * rowHeight,
        backgroundImage: `
          linear-gradient(to right, var(--border-color) 1px, transparent 1px),
          linear-gradient(to bottom, var(--border-color) 1px, transparent 1px)
        `,
        backgroundSize: `${cellWidth}px ${rowHeight}px`,
        '--border-color': 'rgba(0, 0, 0, 0.1)',
      } as React.CSSProperties}
    >
      {timeline.map((item, index) => (
        <div
          key={index}
          className={`absolute top-0 bottom-0 ${
            item.isWeekend ? 'bg-gray-50' : ''
          }`}
          style={{
            left: index * cellWidth,
            width: cellWidth,
          }}
        />
      ))}
    </div>
  );
}