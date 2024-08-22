import React, { useState } from 'react';
import { trpc } from '@/trpc/client';

interface AddTeamMemberFormProps {
  teamId: number;
}

const AddTeamMemberForm: React.FC<AddTeamMemberFormProps> = ({ teamId }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');

  const addMemberMutation = trpc.teams.addTeamMember.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real application, you'd need to first find or create the user based on the email
      // For this example, we'll assume the user exists and has ID 1
      await addMemberMutation.mutateAsync({
        teamId,
        userId: 1, // Replace this with actual user ID
        role,
      });
      setEmail('');
      setRole('member');
      alert('Team member added successfully!');
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Team Member</h2>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="role">Role:</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>
      <button type="submit">Add Member</button>
    </form>
  );
};

export default AddTeamMemberForm;