import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../versenxt/src/server';

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
    }),
  ],
});

type TaskCreateInput = {
  title: string;
  description?: string;
  status?: 'pending' | 'completed';
  dueDate?: string;
  projectId?: number;
  teamId?: number;
  creatorId: number;
};

async function testTaskProcedures() {
  try {
    console.log('Testing task procedures...');

    // Create a new task
    const taskInput: TaskCreateInput = {
      title: 'Test Task',
      description: 'This is a test task created by task-test.ts',
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      teamId: 2, // Make sure this is a valid team ID in your database
      creatorId: 3 // Make sure this is a valid user ID in your database
    };

    const newTask = await client.tasks.create.mutate(taskInput);
    console.log('New task created:', newTask);

    // Get all tasks
    const allTasks = await client.tasks.getAll.query({});
    console.log('All tasks:', allTasks);

    // Get tasks assigned to a team member
    const assignedTasks = await client.tasks.getTasksAssignedToTeamMember.query(1); // Use a valid user ID
    console.log('Tasks assigned to team member:', assignedTasks);

    // Get tasks created by a team member
    const createdTasks = await client.tasks.getTasksCreatedByTeamMember.query(1); // Use a valid user ID
    console.log('Tasks created by team member:', createdTasks);

    // Update task
    const updatedTask = await client.tasks.update.mutate({
      id: newTask.id,
      title: 'Updated Test Task',
      description: 'This task has been updated',
      status: 'completed',
      assigneeId: 3 // Make sure this is a valid user ID in your database
    });
    console.log('Updated task:', updatedTask);

    // // Delete the test task
    // const deletedTask = await client.tasks.delete.mutate(newTask.id);
    // console.log('Deleted task:', deletedTask);

  } catch (error) {
    console.error('Error testing task procedures:', error);
  }
}

async function runTests() {
  await testTaskProcedures();
}

runTests();
