// components/gantt/GanttChart.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { addDays, differenceInDays, startOfDay, format } from 'date-fns';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { GanttHeader } from './GanttHeader';
import { GanttGrid } from './GanttGrid';
import { GanttBar } from './GanttBar';
import { GanttTooltip } from './GanttTooltip';
import { GanttControls } from './GanttControls';
import { trpc } from '../../utils/trpc';
import { GanttTask, GanttTimelineItem, GanttZoomLevel } from '../../types/gantt';

interface GanttChartProps {
  projectId?: number;
  teamId: number;
  startDate?: Date;
  endDate?: Date;
}

export function GanttChart({ 
  projectId, 
  teamId, 
  startDate: propStartDate, 
  endDate: propEndDate 
}: GanttChartProps) {
  const [zoom, setZoom] = useState<GanttZoomLevel>('week');
  const [startDate, setStartDate] = useState(propStartDate || new Date());
  const [endDate, setEndDate] = useState(propEndDate || addDays(new Date(), 30));
  const [hoveredTask, setHoveredTask] = useState<GanttTask | null>(null);
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);

  // Queries
  const { data: tasks } = trpc.tasks.getAll.useQuery({
    projectId: projectId || null,
    teamId,
  });

  const { data: project } = trpc.projects.getById.useQuery(
    projectId || -1,
    { enabled: !!projectId }
  );

  // Calculate timeline
  const timeline = useMemo<GanttTimelineItem[]>(() => {
    const days = differenceInDays(endDate, startDate) + 1;
    const timelineArray: GanttTimelineItem[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = addDays(startDate, i);
      timelineArray.push({
        date,
        label: format(date, zoom === 'day' ? 'MMM d' : zoom === 'week' ? 'MMM d' : 'MMM'),
        isWeekend: [0, 6].includes(date.getDay()),
      });
    }
    
    return timelineArray;
  }, [startDate, endDate, zoom]);

  // Calculate task positions
  const taskBars = useMemo(() => {
    if (!tasks) return [];

    return tasks.map(task => {
      const taskStart = task.dueDate ? startOfDay(new Date(task.dueDate)) : startDate;
      const taskEnd = task.dueDate ? startOfDay(new Date(task.dueDate)) : addDays(taskStart, 1);
      
      const left = Math.max(0, differenceInDays(taskStart, startDate));
      const width = Math.min(
        differenceInDays(endDate, taskStart),
        differenceInDays(taskEnd, taskStart) + 1
      );

      return {
        task: task as GanttTask, // Type assertion here
        left,
        width,
      };
    });
  }, [tasks, startDate, endDate]);

  return (
    <Card className="w-full overflow-hidden">
      <GanttControls
        zoom={zoom}
        onZoomChange={setZoom}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />
      
      <ScrollArea className="h-[600px]">
        <div className="relative">
          <GanttHeader
            timeline={timeline}
            zoom={zoom}
          />
          
          <GanttGrid
            timeline={timeline}
            rowCount={taskBars.length}
          />
          
          <div className="relative">
            {taskBars.map(({ task, left, width }, index) => (
              <GanttBar
                key={task.id}
                task={task}
                left={left}
                width={width}
                index={index}
                onMouseEnter={() => setHoveredTask(task)}
                onMouseLeave={() => setHoveredTask(null)}
                onClick={() => setSelectedTask(task)}
                isSelected={selectedTask?.id === task.id}
              />
            ))}
          </div>
          
          {hoveredTask && project && (
            <GanttTooltip
              task={hoveredTask}
              project={project}
            />
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}