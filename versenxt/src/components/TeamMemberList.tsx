import React from 'react';
import { trpc } from '@/trpc/client';

interface TeamMemberListProps {
  teamId: number;
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({ teamId }) => {
  const { data: teamMembers, isLoading } = trpc.teams.listTeamMembers.useQuery(teamId);
  const removeMemberMutation = trpc.teams.removeTeamMember.useMutation();
  const updateRoleMutation = trpc.teams.updateTeamMemberRole.useMutation();

  if (isLoading) return <div>Loading team members...</div>;

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
      <h2>Team Members</h2>
      <ul>
        {teamMembers?.map((member) => (
          <li key={member.id}>
            {member.user.name} ({member.role})
            <button onClick={() => handleRemoveMember(member.id)}>Remove</button>
            <select
              value={member.role}
              onChange={(e) => handleUpdateRole(member.id, e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamMemberList;