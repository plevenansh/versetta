
'use client'

import { useState, useEffect } from 'react'
import { trpc } from '../../trpc/client'
import { Button } from "../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Dialog, DialogTrigger } from "../../components/ui/dialog"
import { PlusCircle } from 'lucide-react'
import TeamCard from '../../components/TeamCard'
import CreateTeamForm from '../../components/CreateTeamForm'

export default function TeamsPage() {
  const [user, setUser] = useState<any>(null)
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false)

  const { data: userTeams, isLoading, refetch } = trpc.teams.getUserTeams.useQuery(
    { workOsUserId: user?.workOsUserId || '' },
    { enabled: !!user?.workOsUserId }
  )

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user')
        if (!response.ok) {
          throw new Error('Failed to fetch user')
        }
        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    fetchUser()
  }, [])

  const handleTeamCreated = () => {
    setIsCreateTeamDialogOpen(false)
    refetch()
  }

  const handleDeleteTeam = async (teamId: number) => {
    try {
      await trpc.teams.deleteTeam.useMutation().mutateAsync(teamId)
      refetch()
    } catch (error) {
      console.error('Error deleting team:', error)
      alert('Failed to delete team. Please try again.')
    }
  }

  if (isLoading) return <div className="container mx-auto py-10">Loading teams...</div>

  const myTeams = userTeams?.filter(team => team.creator.id === user?.id) || []
  const otherTeams = userTeams?.filter(team => team.creator.id !== user?.id) || []

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Team Management</h1>
        <Dialog open={isCreateTeamDialogOpen} onOpenChange={setIsCreateTeamDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Team
            </Button>
          </DialogTrigger>
          <CreateTeamForm onTeamCreated={handleTeamCreated} />
        </Dialog>
      </div>

      <Tabs defaultValue="myTeams" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="myTeams">My Teams</TabsTrigger>
          <TabsTrigger value="otherTeams">Other Teams</TabsTrigger>
        </TabsList>
        <TabsContent value="myTeams">
          <div className="grid gap-6">
            {myTeams.map(team => (
              <TeamCard key={team.id} team={team} onDeleteTeam={handleDeleteTeam} onTeamUpdated={refetch} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="otherTeams">
          <div className="grid gap-6">
            {otherTeams.map(team => (
              <TeamCard key={team.id} team={team} onDeleteTeam={handleDeleteTeam} onTeamUpdated={refetch} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


