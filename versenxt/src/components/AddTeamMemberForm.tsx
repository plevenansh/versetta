import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import { TRPCClientError } from '@trpc/client';
import { AccessLevel } from '@prisma/client';

interface AddTeamMemberFormProps {
  teamId: number;
  onMemberAdded: () => void;
}

const AddTeamMemberForm: React.FC<AddTeamMemberFormProps> = ({ teamId, onMemberAdded }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [access, setAccess] = useState<AccessLevel>(AccessLevel.MEMBER);
  const [error, setError] = useState<string | null>(null);

  const addMemberMutation = trpc.teams.addTeamMember.useMutation({
    onSuccess: () => {
      setEmail('');
      setRole('');
      setAccess(AccessLevel.MEMBER);
      setError(null);
      alert('Team member added successfully!');
      onMemberAdded();
    },
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        if (error.data?.code === 'NOT_FOUND') {
          setError('User not found. Please ensure they have signed up on VERSETTA.');
        } else if (error.data?.code === 'CONFLICT') {
          setError('This user is already a member of the team.');
        } else if (error.data?.code === 'FORBIDDEN') {
          setError('You do not have permission to add team members.');
        } else {
          setError('An error occurred while adding the team member. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    addMemberMutation.mutate({
      teamId: teamId,
      email: email,
      role: role,
      access: access,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">Make sure the member has already signed up on VERSETTA before adding them to your team.</p>
      <h2 className="text-2xl font-semibold mb-4">Add Team Member</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
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
          disabled={addMemberMutation.isPending}
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role:
        </label>
        <input
          type="text"
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={addMemberMutation.isPending}
        />
      </div>
      <div>
        <label htmlFor="access" className="block text-sm font-medium text-gray-700 mb-1">
          Access Level:
        </label>
        <select
          id="access"
          value={access}
          onChange={(e) => setAccess(e.target.value as AccessLevel)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={addMemberMutation.isPending}
        >
          <option value={AccessLevel.ADMIN}>Admin</option>
          <option value={AccessLevel.MANAGER}>Manager</option>
          <option value={AccessLevel.MEMBER}>Member</option>
        </select>
      </div>
      <button 
        type="submit"
        className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          addMemberMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={addMemberMutation.isPending}
      >
        {addMemberMutation.isPending ? 'Adding Member...' : 'Add Member'}
      </button>
    </form>
  );
};

export default AddTeamMemberForm;