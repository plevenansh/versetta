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
function testTeamProcedures() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Testing team procedures...');
            // Create a new team
            const teamInput = {
                name: 'Test Team',
                description: 'This is a test team created by test-client.ts',
                creatorId: 1 // Make sure this is a valid user ID in your database
            };
            const newTeam = yield client.teams.create.mutate(teamInput);
            console.log('New team created:', newTeam);
            // Get all teams
            const allTeams = yield client.teams.getAll.query();
            console.log('All teams:', allTeams);
            // Get team by ID
            const teamById = yield client.teams.getById.query(newTeam.id);
            console.log('Team by ID:', teamById);
            // Update team
            const updatedTeam = yield client.teams.update.mutate({
                id: newTeam.id,
                name: 'Updated Test Team',
                description: 'This team has been updated'
            });
            console.log('Updated team:', updatedTeam);
            // Add a member to the team
            const memberInput = {
                teamId: newTeam.id,
                userId: 2,
                role: 'member'
            };
            const newMember = yield client.teams.addMember.mutate(memberInput);
            console.log('New member added:', newMember);
            // Get team members
            const teamMembers = yield client.teams.getTeamMembers.query(newTeam.id);
            console.log('Team members:', teamMembers);
            // Update member role
            const updatedMember = yield client.teams.updateMemberRole.mutate({
                teamId: newTeam.id,
                userId: 2,
                role: 'admin'
            });
            console.log('Updated member role:', updatedMember);
            // Remove member from the team
            const removedMember = yield client.teams.removeMember.mutate({
                teamId: newTeam.id,
                userId: 2
            });
            console.log('Removed member:', removedMember);
            // // Delete the test team
            // const deletedTeam = await client.teams.delete.mutate(newTeam.id);
            // console.log('Deleted team:', deletedTeam);
        }
        catch (error) {
            console.error('Error testing team procedures:', error);
        }
    });
}
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        yield testTeamProcedures();
    });
}
runTests();
