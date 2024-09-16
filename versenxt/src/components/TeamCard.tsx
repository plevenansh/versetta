



import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ChevronRight, Trash2 } from 'lucide-react'
import TeamMemberList from './TeamMemberList'

interface TeamCardProps {
  team: any
  onDeleteTeam: (teamId: number) => void
  onTeamUpdated: () => void
}

export default function TeamCard({ team, onDeleteTeam, onTeamUpdated }: TeamCardProps) {
  const [activeTab, setActiveTab] = useState('members')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{team.name}</CardTitle>
        <CardDescription>{team.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="members">
            <TeamMemberList teamId={team.id} onTeamUpdated={onTeamUpdated} />
          </TabsContent>
          <TabsContent value="settings">
            <p>Team settings will be implemented here.</p>
          </TabsContent>
          <TabsContent value="billing">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Subscription Details</h3>
              <p>Current Plan: <Badge variant="secondary">{team.subscription?.status || 'No active subscription'}</Badge></p>
              <p>Next billing date: {team.subscription?.nextBillingDate || 'N/A'}</p>
              <Button>
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          View Team Dashboard
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Team
            </Button>
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
              <AlertDialogAction onClick={() => onDeleteTeam(team.id)}>
                Yes, delete team
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}