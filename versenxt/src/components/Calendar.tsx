import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { trpc } from '../trpc/client';
import { Button } from "./ui/button";
import { useRouter } from 'next/navigation';

const localizer = momentLocalizer(moment);

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
}

const CalendarComponent = ({ teamId }: { teamId: number }) => {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const router = useRouter();

  const { data: projects, error, isLoading } = trpc.projects.getByTeamId.useQuery(teamId);

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const handleSelectEvent = useCallback((event: Event) => {
    alert(`Selected project: ${event.title}\nPublish date: ${moment(event.start).format('MMMM D, YYYY')}`);
  }, []);

  if (error) {
    if (error.data?.code === 'UNAUTHORIZED') {
      router.push('/login');
      return null;
    }
    return <div>Error: {error.message}</div>;
  }

  if (isLoading) return <div>Loading calendar...</div>;

  const events: Event[] = projects?.flatMap(project => {
    if (project.endDate) {
      const publishDate = new Date(project.endDate);
      return [{
        id: project.id,
        title: project.title,
        start: publishDate,
        end: moment(publishDate).add(0, 'day').toDate(),
      }];
    }
    return [];
  }) || [];

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