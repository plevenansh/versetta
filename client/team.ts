import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../versenxt/src/server';

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
    }),
  ],
});

type TeamCreateInput = {
  name: string;
  description?: string;
  creatorId: number;
};

type TeamMemberInput = {
  teamId: number;
  userId: number;
  role: string;
};

async function testTeamProcedures() {
  try {
    console.log('Testing team procedures...');

    // Create a new team
    const teamInput: TeamCreateInput = {
      name: 'Test Team',
      description: 'This is a test team created by test-client.ts',
      creatorId: 1 // Make sure this is a valid user ID in your database
    };

    const newTeam = await client.teams.create.mutate(teamInput);
    console.log('New team created:', newTeam);

    // Get all teams
    const allTeams = await client.teams.getAll.query();
    console.log('All teams:', allTeams);

    // Get team by ID
    const teamById = await client.teams.getById.query(newTeam.id);
    console.log('Team by ID:', teamById);

    // Update team
    const updatedTeam = await client.teams.update.mutate({
      id: newTeam.id,
      name: 'Updated Test Team',
      description: 'This team has been updated'
    });
    console.log('Updated team:', updatedTeam);

    // Add a member to the team
    const memberInput: TeamMemberInput = {
      teamId: newTeam.id,
      userId: 2, // Make sure this is a valid user ID in your database
      role: 'member'
    };
    const newMember = await client.teams.addMember.mutate(memberInput);
    console.log('New member added:', newMember);

    // Get team members
    const teamMembers = await client.teams.getTeamMembers.query(newTeam.id);
    console.log('Team members:', teamMembers);

    // Update member role
    const updatedMember = await client.teams.updateMemberRole.mutate({
      teamId: newTeam.id,
      userId: 2,
      role: 'admin'
    });
    console.log('Updated member role:', updatedMember);

    // Remove member from the team
    const removedMember = await client.teams.removeMember.mutate({
      teamId: newTeam.id,
      userId: 2
    });
    console.log('Removed member:', removedMember);

    // // Delete the test team
    // const deletedTeam = await client.teams.delete.mutate(newTeam.id);
    // console.log('Deleted team:', deletedTeam);

  } catch (error) {
    console.error('Error testing team procedures:', error);
  }
}

async function runTests() {
  await testTeamProcedures();
}

runTests();
