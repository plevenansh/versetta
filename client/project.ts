import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../versenxt/src/server';

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
    }),
  ],
});

type ProjectCreateInput = {
  title: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  creatorId: number; 
  teamId: number;
};

type ProjectStageUpdateInput = {
  projectId: number;
  stage: string;
  completed: boolean;
};

async function testProjectProcedures() {
  try {
    console.log('Testing project procedures...');

    // Create a new project
    const projectInput: ProjectCreateInput = {
      title: 'Test Project',
      description: 'This is a test project created by test-project-client.ts',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      creatorId: 3,
      teamId: 2, // Make sure this is a valid team ID in your database
       
    };

    const newProject = await client.projects.create.mutate(projectInput);
    console.log('New project created:', newProject);

    // Get all projects
    const allProjects = await client.projects.getAll.query();
    console.log('All projects:', allProjects);

    // Get project by ID
    const projectById = await client.projects.getById.query(newProject.id);
    console.log('Project by ID:', projectById);

    // Update project
    const updatedProject = await client.projects.update.mutate({
      id: newProject.id,
      title: 'Updated Test Project',
      description: 'This project has been updated'
    });
    console.log('Updated project:', updatedProject);

    // Update project stage
    const stageUpdateInput: ProjectStageUpdateInput = {
      projectId: newProject.id,
      stage: 'Ideation',
      completed: true
    };
    const updatedStage = await client.projects.updateProjectStage.mutate(stageUpdateInput);
    console.log('Updated project stage:', updatedStage);

    // Get projects by team ID
    const projectsByTeam = await client.projects.getByTeamId.query(projectInput.teamId);
    console.log('Projects by team ID:', projectsByTeam);

    // Get projects by team member ID (assuming user ID 1 is a member of the team)
    const projectsByMember = await client.projects.getByTeamMemberId.query(1);
    console.log('Projects by team member ID:', projectsByMember);

    // // Delete the test project
    // const deletedProject = await client.projects.delete.mutate(newProject.id);
    // console.log('Deleted project:', deletedProject);

  } catch (error) {
    console.error('Error testing project procedures:', error);
  }
}

async function runTests() {
  await testProjectProcedures();
}

runTests();
