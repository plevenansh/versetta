// components/gantt/GanttControls.tsx
import React from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DateRangePicker } from '../ui/date-range-picker';
import { 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  CalendarRange,
  Filter
} from 'lucide-react';
import { addDays, subDays } from 'date-fns';

interface GanttControlsProps {
  zoom: 'day' | 'week' | 'month';
  onZoomChange: (zoom: 'day' | 'week' | 'month') => void;
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (start: Date, end: Date) => void;
  onFilter?: (filters: any) => void;
}

export function GanttControls({
  zoom,
  onZoomChange,
  startDate,
  endDate,
  onDateRangeChange,
  onFilter
}: GanttControlsProps) {
  const handleZoomIn = () => {
    if (zoom === 'month') onZoomChange('week');
    else if (zoom === 'week') onZoomChange('day');
  };

  const handleZoomOut = () => {
    if (zoom === 'day') onZoomChange('week');
    else if (zoom === 'week') onZoomChange('month');
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const days = zoom === 'day' ? 7 : zoom === 'week' ? 30 : 90;
    if (direction === 'prev') {
      onDateRangeChange(
        subDays(startDate, days),
        subDays(endDate, days)
      );
    } else {
      onDateRangeChange(
        addDays(startDate, days),
        addDays(endDate, days)
      );
    }
  };

  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigate('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigate('next')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onRangeChange={({ start, end }) => onDateRangeChange(start, end)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Select value={zoom} onValueChange={(value: any) => onZoomChange(value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Zoom level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoom === 'month'}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoom === 'day'}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => onFilter?.({})}>
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline" size="sm">
          <CalendarRange className="h-4 w-4 mr-2" />
          Today
        </Button>
      </div>
    </div>
  );
}