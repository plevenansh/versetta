import React from 'react';
import { trpc } from '@/trpc/client';

interface TeamMemberListProps {
  teamId: number;
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({ teamId }) => {
  const { data: teamMembers, isLoading } = trpc.teams.listTeamMembers.useQuery(teamId);
  const removeMemberMutation = trpc.teams.removeTeamMember.useMutation();
  const updateRoleMutation = trpc.teams.updateTeamMemberRole.useMutation();

  if (isLoading) return <div className="text-center">Loading team members...</div>;

  const handleRemoveMember = async (memberId: number) => {
    await removeMemberMutation.mutateAsync(memberId);
    // Refetch team members after removal
  };

  const handleUpdateRole = async (memberId: number, newRole: string) => {
    await updateRoleMutation.mutateAsync({ teamMemberId: memberId, newRole });
    // Refetch team members after update
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
      <ul className="space-y-4">
        {teamMembers?.map((member) => (
          <li key={member.id} className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-medium">{member.user.name}</span>
              <span className="ml-2 text-sm text-gray-600">({member.role})</span>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={member.role}
                onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
              <button 
                onClick={() => handleRemoveMember(member.id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamMemberList;