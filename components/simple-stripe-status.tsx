'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react'

interface SimpleStripeProps {
  userId: string
}

export default function SimpleStripeStatus({ userId }: SimpleStripeProps) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data: label } = await supabase
          .from('labels')
          .select('stripe_account_id, stripe_charges_enabled, stripe_onboarding_complete')
          .eq('id', userId)
          .single()

        setStatus({
          connected: !!label?.stripe_account_id && label?.stripe_charges_enabled,
          accountId: label?.stripe_account_id
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [userId])

  if (loading) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    )
  }

  if (status?.connected) {
    return (
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="text-xl font-bold text-green-800">Stripe Connected!</h3>
            <p className="text-green-700">You're ready to receive payments.</p>
          </div>
        </div>
        <ul className="text-sm space-y-2 text-green-800 mb-4">
          <li>✓ Account connected</li>
          <li>✓ Charges enabled</li>
          <li>✓ You keep 90% of every sale</li>
        </ul>
        <Button 
          variant="outline" 
          onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open Stripe Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-lg p-6 border-2 border-orange-200">
      <h3 className="text-xl font-bold mb-2">Connect Your Stripe Account</h3>
      <p className="text-muted-foreground mb-4">
        To receive payments and get paid instantly, connect a Stripe account.
      </p>
      <div className="bg-background/50 rounded p-3 mb-4 text-sm">
        <strong className="text-orange-600">You keep 90% of every sale.</strong> Monthly payouts.
      </div>
      <Button 
        onClick={() => window.location.href = '/api/stripe/connect/create-account-link?userType=label'}
        className="w-full"
      >
        Connect Stripe Account
      </Button>
    </div>
  )
}