import React, { useState } from 'react';
import { trpc } from '@/trpc/client'

const CreateTeamForm: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createTeamMutation = trpc.teams.createTeam.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const creatorId = 1; // Replace this with the actual logged-in user's ID
      await createTeamMutation.mutateAsync({
        name,
        description,
        creatorId,
      });
      setName('');
      setDescription('');
      alert('Team created successfully!');
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Team Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button type="submit">Create Team</button>
    </form>
  );
};

export default CreateTeamForm;