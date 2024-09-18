import { useState } from 'react'
import { trpc } from '@/trpc/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface TeamMemberListProps {
  teamId: number
  onTeamUpdated: () => void
}

export default function TeamMemberList({ teamId, onTeamUpdated }: TeamMemberListProps) {
  const [showAddMember, setShowAddMember] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { data: teamMembers, refetch: refetchMembers } = trpc.teams.listTeamMembers.useQuery(teamId)
  const addTeamMemberMutation = trpc.teams.addTeamMember.useMutation()
  const removeTeamMemberMutation = trpc.teams.removeTeamMember.useMutation()
  const updateTeamMemberRoleMutation = trpc.teams.updateTeamMemberRole.useMutation()

  const handleAddMember = async (email: string, role: string) => {
    try {
      await addTeamMemberMutation.mutateAsync({ teamId, email, role })
      setShowAddMember(false)
      refetchMembers()
      onTeamUpdated()
    } catch (error: any) {
      console.error('Error adding team member:', error);
      if (error.message.includes('User not found')) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to add team member. Please try again.');
      }
      setShowErrorDialog(true);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      await removeTeamMemberMutation.mutateAsync(memberId)
      refetchMembers()
      onTeamUpdated()
    } catch (error) {
      console.error('Error removing team member:', error)
      alert('Failed to remove team member. Please try again.')
    }
  }

  const handleUpdateRole = async (memberId: number, newRole: string) => {
    try {
      await updateTeamMemberRoleMutation.mutateAsync({ teamMemberId: memberId, newRole })
      refetchMembers()
      onTeamUpdated()
    } catch (error) {
      console.error('Error updating team member role:', error)
      alert('Failed to update team member role. Please try again.')
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamMembers?.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.user.name}</TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>
                <Select
                  value={member.role}
                  onValueChange={(newRole) => handleUpdateRole(member.id, newRole)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button variant="destructive" size="sm" onClick={() => handleRemoveMember(member.id)}>
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={() => setShowAddMember(true)} className="mt-4">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Member
      </Button>
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            handleAddMember(formData.get('email') as string, formData.get('role') as string)
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" name="email" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select name="role">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit">Add Member</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTitle>Failed to add team member</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          <Button onClick={() => setShowErrorDialog(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}