// app/stor/page.tsx
"use client"

import React, { useState } from 'react';
import { trpc } from '../../utils/trpc';
import { FileUploader } from '../../components/FileUploader';
import { FileList } from '../../components/FileList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

export default function StoragePage() {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedSubStageId, setSelectedSubStageId] = useState<number | null>(null);

  const { data: userTeams, isLoading: isTeamsLoading } = trpc.users.getUserTeams.useQuery();
  const { data: projects, isLoading: isProjectsLoading } = trpc.projects.getByTeamId.useQuery(
    selectedTeamId || -1,
    { enabled: !!selectedTeamId }
  );

  const handleUploadComplete = () => {
    // Refetch the file list or update the UI as needed
  };

  if (isTeamsLoading) return <div>Loading teams...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Storage Management</h1>

      <div className="mb-4">
        <Select
          value={selectedTeamId?.toString() || undefined}
          onValueChange={(value) => {
            setSelectedTeamId(Number(value));
            setSelectedProjectId(null);
            setSelectedSubStageId(null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Team" />
          </SelectTrigger>
          <SelectContent>
            {userTeams?.map((team) => (
              <SelectItem key={team.id} value={team.id.toString()}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTeamId && (
        <div className="mb-4">
          <Select
            value={selectedProjectId?.toString() || undefined}
            onValueChange={(value) => {
              setSelectedProjectId(value ? Number(value) : null);
              setSelectedSubStageId(null);
            }}
          >
            <SelectTrigger>
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
        </div>
      )}

      {selectedProjectId && (
        <div className="mb-4">
          <Select
            value={selectedSubStageId?.toString() || undefined}
            onValueChange={(value) => setSelectedSubStageId(value ? Number(value) : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Sub-Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sub-Stages</SelectItem>
              {projects?.find(p => p.id === selectedProjectId)?.mainStages.flatMap(ms => 
                ms.subStages.map(ss => (
                  <SelectItem key={ss.id} value={ss.id.toString()}>
                    {ms.name} - {ss.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Upload File</h2>
        {selectedTeamId && (
          <FileUploader
            teamId={selectedTeamId}
            projectId={selectedProjectId === null ? undefined : selectedProjectId}
            subStageId={selectedSubStageId === null ? undefined : selectedSubStageId}
            onUploadComplete={handleUploadComplete}
          />
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">File List</h2>
        {selectedTeamId && (
          <FileList
            teamId={selectedTeamId}
            projectId={selectedProjectId === null ? undefined : selectedProjectId}
            subStageId={selectedSubStageId === null ? undefined : selectedSubStageId}
          />
        )}
      </div>
    </div>
  );
}