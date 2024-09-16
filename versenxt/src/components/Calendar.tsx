import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { trpc } from '@/trpc/client';
import { Button } from "@/components/ui/button";

const localizer = momentLocalizer(moment);

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
}

const CalendarComponent = ({ teamId }: { teamId: number }) => {
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const { data: projects, isLoading } = trpc.projects.getByTeamId.useQuery(teamId);

  const events: Event[] = projects?.flatMap(project => {
    if (project.endDate) {
      const publishDate = new Date(project.endDate);
      return [{
        id: project.id,
        title: project.title,
        start: publishDate,
        end: moment(publishDate).add(0, 'day').toDate(), // Make it a full-day event
      }];
    }
    return []; // Skip projects without an endDate
  }) || [];

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: string) => {
    setView(newView);
  }, []);

  const handleSelectEvent = useCallback((event: Event) => {
    alert(`Selected project: ${event.title}\nPublish date: ${moment(event.start).format('MMMM D, YYYY')}`);
    // You can implement more interactive behavior here, like opening a modal with event details
  }, []);

  if (isLoading) return <div>Loading calendar...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
       
        <h2 className="text-xl font-bold">{moment(date).format('MMMM YYYY')}</h2>
       
      </div>
      
      <div style={{ height: '500px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          onView={handleViewChange}
          date={date}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
        />
      </div>
    </div>
  );
};

export default CalendarComponent;