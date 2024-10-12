

//components/TeamMemberList.tsx

import { useState } from 'react'
import { trpc } from '../utils/trpc'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { PlusCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

interface TeamMemberListProps {
  teamId: number
  onTeamUpdated: () => void
}

export default function TeamMemberList({ teamId, onTeamUpdated }: TeamMemberListProps) {
  const [showAddMember, setShowAddMember] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [memberToRemove, setMemberToRemove] = useState<{ id: number, name: string } | null>(null)

  const { data: teamMembers, refetch: refetchMembers, error: teamMembersError } = trpc.teams.listTeamMembers.useQuery(teamId)
  const addTeamMemberMutation = trpc.teams.addTeamMember.useMutation()
  const removeTeamMemberMutation = trpc.teams.removeTeamMember.useMutation()
  const updateTeamMemberRoleMutation = trpc.teams.updateTeamMemberRole.useMutation()

  const handleAddMember = async (email: string, role: string, access: 'ADMIN' | 'MANAGER' | 'MEMBER') => {
    try {
      await addTeamMemberMutation.mutateAsync({ teamId, email, role, access })
      setShowAddMember(false)
      refetchMembers()
      onTeamUpdated()
    } catch (error: any) {
      console.error('Error adding team member:', error);
      setErrorMessage(error.message || 'Failed to add team member. Please try again.');
      setShowErrorDialog(true);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await removeTeamMemberMutation.mutateAsync(memberToRemove.id)
      refetchMembers()
      onTeamUpdated()
      setMemberToRemove(null)
    } catch (error: any) {
      console.error('Error removing team member:', error)
      setErrorMessage(error.message || 'Failed to remove team member. Please try again.');
      setShowErrorDialog(true);
    }
  }

  const handleUpdateRole = async (memberId: number, newRole: string, newAccess: 'ADMIN' | 'MANAGER' | 'MEMBER') => {
    try {
      await updateTeamMemberRoleMutation.mutateAsync({ teamMemberId: memberId, newRole, newAccess })
      refetchMembers()
      onTeamUpdated()
    } catch (error: any) {
      console.error('Error updating team member role:', error)
      setErrorMessage(error.message || 'Failed to update team member role. Please try again.');
      setShowErrorDialog(true);
    }
  }

  if (teamMembersError) {
    return <div>Error loading team members: {teamMembersError.message}</div>
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Access</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamMembers?.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.user.name}</TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>
                <Input
                  value={member.role}
                  onChange={(e) => handleUpdateRole(member.id, e.target.value, member.access)}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={member.access}
                  onValueChange={(newAccess) => handleUpdateRole(member.id, member.role, newAccess as 'ADMIN' | 'MANAGER' | 'MEMBER')}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button variant="destructive" size="sm" onClick={() => setMemberToRemove({ id: member.id, name: member.user.name })}>
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

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            handleAddMember(
              formData.get('email') as string,
              formData.get('role') as string,
              formData.get('access') as 'ADMIN' | 'MANAGER' | 'MEMBER'
            )
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
                <Input id="role" name="role" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="access" className="text-right">
                  Access
                </Label>
                <Select name="access">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit">Add Member</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to remove {memberToRemove?.name} from the team? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberToRemove(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveMember}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTitle>Operation Failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          <Button onClick={() => setShowErrorDialog(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}


