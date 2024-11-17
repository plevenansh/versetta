"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@trpc/client");
const client = (0, client_1.createTRPCClient)({
    links: [
        (0, client_1.httpBatchLink)({
            url: 'http://localhost:3000/api/trpc',
        }),
    ],
});
function testTaskProcedures() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Testing task procedures...');
            // Create a new task
            const taskInput = {
                title: 'Test Task',
                description: 'This is a test task created by task-test.ts',
                status: 'pending',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                teamId: 2,
                creatorId: 3 // Make sure this is a valid user ID in your database
            };
            const newTask = yield client.tasks.create.mutate(taskInput);
            console.log('New task created:', newTask);
            // Get all tasks
            const allTasks = yield client.tasks.getAll.query({});
            console.log('All tasks:', allTasks);
            // Get tasks assigned to a team member
            const assignedTasks = yield client.tasks.getTasksAssignedToTeamMember.query(1); // Use a valid user ID
            console.log('Tasks assigned to team member:', assignedTasks);
            // Get tasks created by a team member
            const createdTasks = yield client.tasks.getTasksCreatedByTeamMember.query(1); // Use a valid user ID
            console.log('Tasks created by team member:', createdTasks);
            // Update task
            const updatedTask = yield client.tasks.update.mutate({
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
        }
        catch (error) {
            console.error('Error testing task procedures:', error);
        }
    });
}
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        yield testTaskProcedures();
    });
}
runTests();
