 // src/components/CreateTeamForm.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '../utils/trpc'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import Script from 'next/script'
import { TRPCClientError } from '@trpc/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider,EmbeddedCheckout} from '@stripe/react-stripe-js';
import React, { useCallback } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CreateTeamFormProps {
  onTeamCreated: () => void
}

export default function CreateTeamForm({ onTeamCreated }: CreateTeamFormProps) {
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamDescription, setNewTeamDescription] = useState('')
  const [subscriptionType, setSubscriptionType] = useState<'razorpay' | 'stripe' | 'invite'>('razorpay')
  const [access, setAccess] = useState<'ADMIN' | 'MANAGER' | 'MEMBER'>('ADMIN')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const { data: user, isLoading: userLoading, error: userError } = trpc.users.getUser.useQuery()
  const initiateTeamCreationMutation = trpc.teams.initiateTeamCreation.useMutation()
  const completeTeamCreationMutation = trpc.teams.completeTeamCreation.useMutation()



  const resetForm = () => {
    setStripeClientSecret(null);
    setNewTeamName('');
    setNewTeamDescription('');
    setSubscriptionType('razorpay');
    setError(null);
  }


  const fetchClientSecret = useCallback(async (teamName: string, teamDescription: string) => {
    const result = await initiateTeamCreationMutation.mutateAsync({
      name: teamName,
      description: teamDescription,
      subscriptionType: 'stripe',
    });
    if ('sessionId' in result) {
      return result.sessionId;
    } else {
      throw new Error('Session ID not returned for Stripe payment');
    }
  }, [initiateTeamCreationMutation]);
  
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('User not authenticated. Please log in and try again.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await initiateTeamCreationMutation.mutateAsync({
        name: newTeamName,
        description: newTeamDescription,
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
              try {
                await completeTeamCreationMutation.mutateAsync({
                  teamId: result.teamId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                })
                alert('Team created and subscription activated successfully!')
                onTeamCreated()
                router.push('/dashboard')
              } catch (error) {
                if (error instanceof TRPCClientError) {
                  setError(error.message)
                } else {
                  setError('An error occurred while completing team creation')
                }
              }
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
      }
      
      else if (subscriptionType === 'stripe') {
        if ('checkoutUrl' in result) {
          router.push(result.checkoutUrl!)
        } else {
          throw new Error('Checkout URL not returned for Stripe payment')
        }
      } 
      
      else {
        // Invite method
        alert('Team created successfully with invite access!')
        onTeamCreated()
        router.push('/dashboard')
      }
    } catch (error) {
      if (error instanceof TRPCClientError) {
        setError(error.message)
      } else {
        setError('An error occurred while creating the team')
      }
    } finally {
      setLoading(false)
    }
  }

  if (userLoading) return <div>Loading...</div>
  if (userError) return <div>Error: {userError.message}</div>
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
            <Select
              value={subscriptionType}
              onValueChange={(value) => setSubscriptionType(value as 'razorpay' | 'stripe' | 'invite')}
            >
              <SelectTrigger className="w-full col-span-3">
                <SelectValue placeholder="Select Subscription Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="razorpay">Razorpay (INR)</SelectItem>
                <SelectItem value="stripe">Stripe (All Currencies)</SelectItem>
                <SelectItem value="invite">Invite (Free Access)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Team'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
    </>
  )
}



