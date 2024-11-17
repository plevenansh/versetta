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
function testProjectProcedures() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Testing project procedures...');
            // Create a new project
            const projectInput = {
                title: 'Test Project',
                description: 'This is a test project created by test-project-client.ts',
                status: 'active',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                creatorId: 3,
                teamId: 2, // Make sure this is a valid team ID in your database
            };
            const newProject = yield client.projects.create.mutate(projectInput);
            console.log('New project created:', newProject);
            // Get all projects
            const allProjects = yield client.projects.getAll.query();
            console.log('All projects:', allProjects);
            // Get project by ID
            const projectById = yield client.projects.getById.query(newProject.id);
            console.log('Project by ID:', projectById);
            // Update project
            const updatedProject = yield client.projects.update.mutate({
                id: newProject.id,
                title: 'Updated Test Project',
                description: 'This project has been updated'
            });
            console.log('Updated project:', updatedProject);
            // Update project stage
            const stageUpdateInput = {
                projectId: newProject.id,
                stage: 'Ideation',
                completed: true
            };
            const updatedStage = yield client.projects.updateProjectStage.mutate(stageUpdateInput);
            console.log('Updated project stage:', updatedStage);
            // Get projects by team ID
            const projectsByTeam = yield client.projects.getByTeamId.query(projectInput.teamId);
            console.log('Projects by team ID:', projectsByTeam);
            // Get projects by team member ID (assuming user ID 1 is a member of the team)
            const projectsByMember = yield client.projects.getByTeamMemberId.query(1);
            console.log('Projects by team member ID:', projectsByMember);
            // // Delete the test project
            // const deletedProject = await client.projects.delete.mutate(newProject.id);
            // console.log('Deleted project:', deletedProject);
        }
        catch (error) {
            console.error('Error testing project procedures:', error);
        }
    });
}
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        yield testProjectProcedures();
    });
}
runTests();
