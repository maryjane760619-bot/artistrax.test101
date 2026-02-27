'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

interface StripeStatusProps {
  userId: string
}

export default function StripeStatusCheck({ userId }: StripeStatusProps) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      // Direct database check
      const { data: label } = await supabase
        .from('labels')
        .select('stripe_account_id, stripe_charges_enabled, stripe_onboarding_complete')
        .eq('id', userId)
        .single()

      setStatus({
        hasAccount: !!label?.stripe_account_id,
        chargesEnabled: label?.stripe_charges_enabled,
        onboardingComplete: label?.stripe_onboarding_complete,
        accountId: label?.stripe_account_id
      })
    } catch (err) {
      console.error('Status check error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Checking Stripe status...</div>

  if (!status?.hasAccount) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-orange-50 rounded-lg shadow-md p-6 border-2 border-green-200">
        <h3 className="text-xl font-bold mb-2">Connect Your Stripe Account</h3>
        <p className="mb-4">Connect to receive payments. Takes 2-3 minutes.</p>
        <div className="bg-green-50 rounded p-3 mb-4">
          <strong>You keep 90% of every sale.</strong> Monthly payouts.
        </div>
        <Button onClick={() => window.location.href = '/api/stripe/connect/create-account-link?userType=label'}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Connect Stripe Account
        </Button>
      </div>
    )
  }

  if (!status.onboardingComplete) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-2">Complete Stripe Onboarding</h3>
        <p className="mb-4">Your account is created but needs more information.</p>
        <Button onClick={() => window.location.href = '/api/stripe/connect/create-account-link?userType=label'}>
          Continue Setup
        </Button>
      </div>
    )
  }

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
        <li>✓ Account: {status.accountId?.slice(-10)}</li>
        <li>✓ Charges enabled</li>
        <li>✓ Onboarding complete</li>
        <li>✓ You keep 90% of every sale</li>
      </ul>
      <Button variant="outline" onClick={() => window.open('https://dashboard.stripe.com', '_blank')}>
        Open Stripe Dashboard
      </Button>
    </div>
  )
}