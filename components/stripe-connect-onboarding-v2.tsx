'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface StripeConnectOnboardingProps {
  accountType?: 'artist' | 'label'
}

export default function StripeConnectOnboarding({ accountType = 'artist' }: StripeConnectOnboardingProps) {
  const [stripeAccountId, setStripeAccountId] = useState<string | null | undefined>(undefined)
  const [chargesEnabled, setChargesEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const table = accountType === 'label' ? 'labels' : 'artists'
      const { data } = await supabase
        .from(table)
        .select('stripe_account_id, stripe_charges_enabled')
        .eq('id', session.user.id)
        .single()

      setStripeAccountId(data?.stripe_account_id ?? null)
      setChargesEnabled(!!data?.stripe_charges_enabled)
    } catch (err) {
      console.error('Status check error:', err)
      setStripeAccountId(null)
    } finally {
      setLoading(false)
    }
  }

  const getApiPath = (endpoint: string) =>
    accountType === 'label'
      ? `/api/stripe/connect/label/${endpoint}`
      : `/api/stripe/connect/${endpoint}`

  const createAccount = async () => {
    try {
      setCreating(true)
      setError('')

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Please log in again')

      const res = await fetch(getApiPath('create-account'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create account')

      window.location.href = data.onboardingUrl
    } catch (err: any) {
      setError(err.message)
      setCreating(false)
    }
  }

  const continueOnboarding = async () => {
    try {
      setCreating(true)
      setError('')

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Please log in again')

      const res = await fetch(getApiPath('create-link'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create onboarding link')

      window.location.href = data.onboardingUrl
    } catch (err: any) {
      setError(err.message)
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Checking payment status...</p>
      </div>
    )
  }

  // Fully connected
  if (stripeAccountId && chargesEnabled) {
    return (
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="text-xl font-bold text-green-800">Payment Setup Complete</h3>
            <p className="text-green-700">You're ready to receive payments.</p>
          </div>
        </div>
        <ul className="text-sm space-y-1 text-green-800 mb-4">
          <li>✓ Charges enabled</li>
          <li>✓ You keep {accountType === 'label' ? '90%' : '95%'} of every sale</li>
          <li>✓ {accountType === 'label' ? 'Monthly' : 'Instant'} payouts</li>
        </ul>
        <Button variant="outline" onClick={() => window.open('https://dashboard.stripe.com', '_blank')}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Open Stripe Dashboard
        </Button>
      </div>
    )
  }

  // Account exists but onboarding incomplete
  if (stripeAccountId && !chargesEnabled) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-8 h-8 text-yellow-600" />
          <div>
            <h3 className="text-xl font-bold">Complete Stripe Onboarding</h3>
            <p className="text-muted-foreground">Your account isn't fully set up yet.</p>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <Button onClick={continueOnboarding} disabled={creating} className="bg-yellow-600 hover:bg-yellow-700">
          {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</> : 'Continue Onboarding'}
        </Button>
      </div>
    )
  }

  // No account yet
  return (
    <div className="bg-gradient-to-br from-green-50 to-orange-50 border-2 border-green-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
        <div className="flex-grow">
          <h3 className="text-xl font-bold mb-2">Connect Your Stripe Account</h3>
          <p className="text-muted-foreground mb-4">
            To receive payments and get paid instantly, connect a Stripe account. This takes 2–3 minutes.
          </p>

          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="font-semibold mb-2">What you'll need:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Bank account information</li>
              <li>• Tax ID (SSN or EIN)</li>
              <li>• Date of birth</li>
              <li>• Contact information</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-800">
              <strong>You keep {accountType === 'label' ? '90%' : '95%'} of every sale.</strong>{' '}
              {accountType === 'label' ? 'Monthly' : 'Instant'} payouts. No hidden fees.
            </p>
          </div>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <Button onClick={createAccount} disabled={creating} className="bg-green-700 hover:bg-green-800">
            {creating
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Setting up...</>
              : <><ExternalLink className="w-4 h-4 mr-2" />Connect Stripe Account</>
            }
          </Button>
        </div>
      </div>
    </div>
  )
}
