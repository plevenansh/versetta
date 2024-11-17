// components/gantt/GanttHeader.tsx
import { GanttTimelineItem, GanttZoomLevel } from '../../types/gantt';

interface GanttHeaderProps {
  timeline: GanttTimelineItem[];
  zoom: GanttZoomLevel;
}

export function GanttHeader({ timeline, zoom }: GanttHeaderProps) {
  const cellWidth = zoom === 'day' ? 50 : zoom === 'week' ? 100 : 200;

  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="flex">
        <div className="w-64 shrink-0 p-4 border-r font-medium">Task</div>
        <div className="flex-1">
          <div className="flex">
            {timeline.map((item, index) => (
              <div
                key={index}
                className={`
                  flex-shrink-0 p-4 text-center border-r font-medium
                  ${item.isWeekend ? 'bg-muted/50' : ''}
                `}
                style={{ width: cellWidth }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}