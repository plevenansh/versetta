import React from 'react';
import { trpc } from '@/trpc/client';

interface TeamMemberListProps {
  teamId: number;
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({ teamId }) => {
  const { data: teamMembers, isLoading, refetch } = trpc.teams.listTeamMembers.useQuery(teamId);
  const removeMemberMutation = trpc.teams.removeTeamMember.useMutation({
    onSuccess: () => refetch()
  });
  const updateRoleMutation = trpc.teams.updateTeamMemberRole.useMutation({
    onSuccess: () => refetch()
  });

  if (isLoading) return <div className="text-center">Loading team members...</div>;

  const handleRemoveMember = async (memberId: number) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMemberMutation.mutateAsync(memberId);
      } catch (error) {
        console.error('Error removing team member:', error);
        alert('Failed to remove team member. Please try again.');
      }
    }
  };

  const handleUpdateRole = async (memberId: number, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({ teamMemberId: memberId, newRole });
    } catch (error) {
      console.error('Error updating team member role:', error);
      alert('Failed to update team member role. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
      <ul className="space-y-4">
        {teamMembers?.map((member) => (
          <li key={member.id} className="bg-blue-100 p-4 rounded-xl flex items-center justify-between">
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