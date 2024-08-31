import React, { useState } from 'react';
import { trpc } from '@/trpc/client';

interface AddTeamMemberFormProps {
  teamId: number;
  onMemberAdded: () => void;
}

const AddTeamMemberForm: React.FC<AddTeamMemberFormProps> = ({ teamId, onMemberAdded }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');

  const addMemberMutation = trpc.teams.addTeamMember.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMemberMutation.mutateAsync({
        teamId: teamId,
        email: email,
        role: role,
      });
      setEmail('');
      setRole('member');
      alert('Team member added successfully!');
      onMemberAdded();
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p>Make sure the member has already signed up on VERSETTA before adding them to your team.</p>
      <h2 className="text-2xl font-semibold mb-4">Add Team Member</h2>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email:
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role:
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>
      <button 
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Add Member
      </button>
    </form>
  );
};

export default AddTeamMemberForm;