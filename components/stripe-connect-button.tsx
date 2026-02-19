'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

type StripeConnectButtonProps = {
  userId: string
  userType: 'artist' | 'label'
  userEmail: string
}

export function StripeConnectButton({ userId, userType, userEmail }: StripeConnectButtonProps) {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [status, setStatus] = useState<{
    connected: boolean
    chargesEnabled: boolean
    detailsSubmitted: boolean
    requiresAction: boolean
  } | null>(null)

  useEffect(() => {
    checkAccountStatus()
  }, [])

  async function checkAccountStatus() {
    try {
      setChecking(true)
      const response = await fetch('/api/stripe/connect/account-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userType })
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to check Stripe status:', error)
    } finally {
      setChecking(false)
    }
  }

  async function handleConnect() {
    try {
      setLoading(true)

      // Create or get Stripe Connect account
      const accountResponse = await fetch('/api/stripe/connect/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userType, email: userEmail })
      })

      if (!accountResponse.ok) throw new Error('Failed to create account')

      const { accountId } = await accountResponse.json()

      // Get onboarding link
      const linkResponse = await fetch('/api/stripe/connect/onboarding-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, userType })
      })

      if (!linkResponse.ok) throw new Error('Failed to create onboarding link')

      const { url } = await linkResponse.json()

      // Redirect to Stripe onboarding
      window.location.href = url

    } catch (error: any) {
      console.error('Stripe Connect error:', error)
      alert('Failed to start Stripe setup: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Checking Stripe status...</span>
      </div>
    )
  }

  if (status?.chargesEnabled && status?.detailsSubmitted) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">Stripe Connected - Ready to receive payments!</span>
      </div>
    )
  }

  if (status?.connected && status?.requiresAction) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-orange-600">
          <AlertCircle className="w-5 h-5" />
          <span>Stripe setup incomplete</span>
        </div>
        <Button onClick={handleConnect} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Complete Stripe Setup
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Connect Stripe to Get Paid</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Connect your Stripe account to receive payments when customers buy your products.
          You'll keep 95% of every sale!
        </p>
        <ul className="text-sm space-y-1 mb-3 text-muted-foreground">
          <li>✓ Instant payouts to your bank account</li>
          <li>✓ Secure payment processing</li>
          <li>✓ Only takes 2 minutes to set up</li>
        </ul>
      </div>
      
      <Button onClick={handleConnect} disabled={loading} size="lg">
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Connect Stripe Account
      </Button>
      
      <p className="text-xs text-muted-foreground">
        You'll be redirected to Stripe to complete the setup. 
        We use Stripe Connect Express for secure payments.
      </p>
    </div>
  )
}
