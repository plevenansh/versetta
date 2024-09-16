


import { useState } from 'react'
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
  const [paymentProvider, setPaymentProvider] = useState<'razorpay' | 'polar'>('razorpay')
  const router = useRouter()

  const initiateTeamCreationMutation = trpc.teams.initiateTeamCreation.useMutation()
  const completeTeamCreationMutation = trpc.teams.completeTeamCreation.useMutation()

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await initiateTeamCreationMutation.mutateAsync({
        name: newTeamName,
        description: newTeamDescription,
        workOsUserId: '', // This should be fetched from the user context
        paymentProvider,
      })

      if (paymentProvider === 'razorpay') {
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
            name: '', // This should be fetched from the user context
            email: '', // This should be fetched from the user context
          },
        }

        const paymentObject = new (window as any).Razorpay(options)
        paymentObject.open()
      } else {
        // Implement Polar payment flow
        alert('Polar payment not implemented yet')
      }
    } catch (error) {
      console.error('Error creating team:', error)
      alert('Failed to create team. Please try again.')
    }
  }

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
              <Label htmlFor="paymentProvider" className="text-right">
                Payment Provider
              </Label>
              <select
                id="paymentProvider"
                value={paymentProvider}
                onChange={(e) => setPaymentProvider(e.target.value as 'razorpay' | 'polar')}
                className="col-span-3 border rounded px-2 py-1"
              >
                <option value="razorpay">Razorpay (India)</option>
                <option value="polar">Polar (International)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Team and Subscribe</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </>
  )
}