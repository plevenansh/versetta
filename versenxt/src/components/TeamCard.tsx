import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import AddTeamMemberForm from './AddTeamMemberForm';
import TeamMemberList from './TeamMemberList';

interface TeamCardProps {
  team: any;
  onTeamUpdated: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onTeamUpdated }) => {
  const [showAddMember, setShowAddMember] = useState(false);

  return (
    <Card className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
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
                className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white"
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
    </Card>
  );
};

export default TeamCard;