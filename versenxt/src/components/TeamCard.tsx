import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AddTeamMemberForm from './AddTeamMemberForm';
import TeamMemberList from './TeamMemberList';

interface TeamCardProps {
  team: any;
  onTeamUpdated: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onTeamUpdated }) => {
  const [showAddMember, setShowAddMember] = useState(false);
  const deleteTeamMutation = trpc.teams.deleteTeam.useMutation();

  const handleDeleteTeam = async () => {
    try {
      await deleteTeamMutation.mutateAsync(team.id);
      onTeamUpdated();
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team. Please try again.');
    }
  };

  return (
    <Card className="w-full bg-white shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <CardTitle className="text-xl font-semibold text-gray-800">{team.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-gray-600 mb-4">{team.description}</p>
        <Accordion type="single" collapsible>
          <AccordionItem value="members">
            <AccordionTrigger>Team Members</AccordionTrigger>
            <AccordionContent>
              <TeamMemberList teamId={team.id} />
              <Button 
                onClick={() => setShowAddMember(!showAddMember)} 
                className="mt-4 w-full bg-green-600 hover:bg-green-600 text-white"
              >
                {showAddMember ? 'Cancel' : 'Add Member'}
              </Button>
              {showAddMember && (
                <AddTeamMemberForm 
                  teamId={team.id} 
                  onMemberAdded={() => {
                    setShowAddMember(false);
                    onTeamUpdated();
                  }} 
                />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">Delete Team</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the team
                and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTeam}>
                Yes, delete team
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default TeamCard;