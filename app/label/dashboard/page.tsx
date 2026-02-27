'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Music, 
  Users, 
  DollarSign, 
  TrendingUp,
  Upload,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

// Stripe Status Component - Direct from DB
function StripeStatusCard({ userId }: { userId: string }) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Direct database query instead of API
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
        console.error('Stripe check error:', err)
      } finally {
        setLoading(false)
      }
    }
    checkStatus()
  }, [userId])

  if (loading) return <div className="p-4 text-center">Loading Stripe status...</div>

  if (!status?.hasAccount) {
    return (
      <div className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-lg p-6 border-2 border-orange-200">
        <h3 className="text-xl font-bold mb-2">Connect Your Stripe Account</h3>
        <p className="text-muted-foreground mb-4">
          To receive payments and get paid instantly, you need to connect a Stripe account.
          This takes 2-3 minutes.
        </p>
        <div className="bg-background/50 rounded p-3 mb-4 text-sm">
          <strong className="text-orange-600">You keep 90% of every sale.</strong> Monthly payouts. No hidden fees.
        </div>
        <ul className="text-sm space-y-1 mb-4 text-muted-foreground">
          <li>• Bank account information</li>
          <li>• Tax ID (SSN or EIN)</li>
          <li>• Date of birth</li>
          <li>• Contact information</li>
        </ul>
        <Button 
          onClick={() => window.location.href = '/api/stripe/connect/create-account-link?userType=label'}
          className="w-full"
        >
          Connect Stripe Account
        </Button>
      </div>
    )
  }

  if (!status.onboardingComplete) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-bold">Complete Stripe Onboarding</h3>
        </div>
        <p className="text-muted-foreground mb-4">
          Your Stripe account is created but needs more information to start receiving payments.
        </p>
        <Button 
          onClick={() => window.location.href = '/api/stripe/connect/create-account-link?userType=label'}
        >
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
        <li className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Account: ...{status.accountId?.slice(-10)}
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Charges enabled
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Onboarding complete
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          You keep 90% of every sale
        </li>
      </ul>
      <Button 
        variant="outline" 
        onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
        className="w-full"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Open Stripe Dashboard
      </Button>
    </div>
  )
}

// ... rest of the dashboard component