'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { trpc } from '@/trpc/client';
import TeamMemberList from '@/components/TeamMemberList';
import AddTeamMemberForm from '@/components/AddTeamMemberForm';

const TeamManagementPage = () => {
  const params = useParams();
  const teamId = Number(params.teamId);

  const { data: team, isLoading } = trpc.teams.getTeam.useQuery(teamId, {
    enabled: !!teamId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!team) return <div>Team not found</div>;

  return (
    <div>
      <h1>{team.name} - Team Management</h1>
      <TeamMemberList teamId={team.id} />
      <AddTeamMemberForm teamId={team.id} />
    </div>
  );
};

export default TeamManagementPage;