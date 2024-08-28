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

  if (isLoading) return <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>;
  if (!team) return <div className="text-center text-2xl text-red-600 mt-10">Team not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">{team.name} - Team Management</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <TeamMemberList teamId={team.id} />
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <AddTeamMemberForm teamId={team.id} />
        </div>
      </div>
    </div>
  );
};

export default TeamManagementPage;