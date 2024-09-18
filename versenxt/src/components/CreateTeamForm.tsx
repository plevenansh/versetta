import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/trpc/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Script from 'next/script'

interface CreateTeamFormProps {
  onTeamCreated: () => void
}

export default function CreateTeamForm({ onTeamCreated }: CreateTeamFormProps) {
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamDescription, setNewTeamDescription] = useState('')
  const [subscriptionType, setSubscriptionType] = useState<'razorpay' | 'polar' | 'invite'>('razorpay')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const initiateTeamCreationMutation = trpc.teams.initiateTeamCreation.useMutation()
  const completeTeamCreationMutation = trpc.teams.completeTeamCreation.useMutation()

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
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !user.workOsUserId) {
      alert('User not authenticated. Please log in and try again.')
      return
    }
    try {
      const result = await initiateTeamCreationMutation.mutateAsync({
        name: newTeamName,
        description: newTeamDescription,
        workOsUserId: user.workOsUserId,
        subscriptionType,
      })

      if (subscriptionType === 'razorpay') {
        if ('subscriptionId' in result) {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            subscription_id: result.subscriptionId,
            name: 'Versetta',
            description: 'Prime Plan',
            handler: async function (response: any) {
              await completeTeamCreationMutation.mutateAsync({
                teamId: result.teamId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              alert('Team created and subscription activated successfully!')
              onTeamCreated()
              router.push('/dashboard')
            },
            prefill: {
              name: user.name,
              email: user.email,
            },
          }

          const paymentObject = new (window as any).Razorpay(options)
          paymentObject.open()
        } else {
          throw new Error('Subscription ID not returned for Razorpay payment')
        }
      } else if (subscriptionType === 'polar') {
        // Implement Polar payment flow
        alert('Polar payment not implemented yet')
      } else {
        // Invite method
        alert('Team created successfully with invite access!')
        onTeamCreated()
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error creating team:', error)
      alert('Failed to create team. Please try again.')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!user) return <div>No user data available</div>

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Enter details for your new team. You can add members after creation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateTeam}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="teamName" className="text-right">
                Team Name
              </Label>
              <Input
                id="teamName"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="teamDescription" className="text-right">
                Description
              </Label>
              <Input
                id="teamDescription"
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subscriptionType" className="text-right">
                Subscription Type
              </Label>
              <select
                id="subscriptionType"
                value={subscriptionType}
                onChange={(e) => setSubscriptionType(e.target.value as 'razorpay' | 'polar' | 'invite')}
                className="col-span-3 border rounded px-2 py-1"
              >
                <option value="razorpay">Razorpay (India)</option>
                <option value="polar">Polar (International)</option>
                <option value="invite">Invite (Free Access)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Team</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </>
  )
}