// app/clad/page.tsx
"use client"

import React, { useState } from 'react';
import { trpc } from '../../utils/trpc';
import { Card } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { GanttChart } from '@/components/Gantt/GanttChart';
import { DateRangePicker } from '../../components/ui/date-range-picker';
import { addMonths, subMonths } from 'date-fns';

export default function GanttPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState({
    start: subMonths(new Date(), 1),
    end: addMonths(new Date(), 2)
  });

  // Queries
  const { data: teams } = trpc.users.getUserTeams.useQuery();
  const { data: projects } = trpc.projects.getByTeamId.useQuery(
    selectedTeamId || -1,
    { enabled: !!selectedTeamId }
  );
  const { data: tasks } = trpc.tasks.getAll.useQuery({
    teamId: selectedTeamId || -1,
    projectId: selectedProjectId || undefined,
  }, {
    enabled: !!selectedTeamId
  });

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Select
            value={selectedTeamId?.toString()}
            onValueChange={(value) => {
              setSelectedTeamId(Number(value));
              setSelectedProjectId(null);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Team" />
            </SelectTrigger>
            <SelectContent>
              {teams?.map((team) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTeamId && (
            <Select
              value={selectedProjectId?.toString()}
              onValueChange={(value) => setSelectedProjectId(Number(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DateRangePicker
          startDate={dateRange.start}
          endDate={dateRange.end}
          onRangeChange={setDateRange}
        />
      </div>

      <Card className="p-0">
        {selectedTeamId && (
          <GanttChart
            teamId={selectedTeamId}
            projectId={selectedProjectId || undefined}
            startDate={dateRange.start}
            endDate={dateRange.end}
          />
        )}
      </Card>
    </div>
  );
}