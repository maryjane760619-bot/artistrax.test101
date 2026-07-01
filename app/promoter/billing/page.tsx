'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Loader2, ArrowLeft, AlertCircle, CheckCircle, ExternalLink, DollarSign, RefreshCw } from 'lucide-react'

export default function PromoterBillingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [promoter, setPromoter] = useState<any>(null)
  const [stripeStatus, setStripeStatus] = useState<{
    hasAccount: boolean
    onboardingComplete: boolean
    chargesEnabled: boolean
    payoutsEnabled: boolean
    requirements?: any
  } | null>(null)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/promoter/login')
      return
    }

    // Load promoter profile
    const { data: promoterData, error: promoterError } = await supabase
      .from('promoters')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (promoterError || !promoterData) {
      setError('Promoter profile not found')
      setLoading(false)
      return
    }

    setPromoter(promoterData)

    // Check Stripe status via API
    try {
      const res = await fetch('/api/stripe/connect/promoter/account-status', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setStripeStatus(data)
      } else {
        // No account yet — that's fine
        setStripeStatus({
          hasAccount: false,
          onboardingComplete: false,
          chargesEnabled: false,
          payoutsEnabled: false,
        })
      }
    } catch {
      setStripeStatus({
        hasAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      })
    }

    setLoading(false)
  }

  const handleCreateAccount = async () => {
    setActionLoading('create')
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setError('Please log in')
      setActionLoading(null)
      return
    }

    try {
      const res = await fetch('/api/stripe/connect/promoter/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl
      }
    } catch (err: any) {
      setError(err.message)
    }

    setActionLoading(null)
  }

  const handleStartOnboarding = async () => {
    setActionLoading('onboarding')
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setError('Please log in')
      setActionLoading(null)
      return
    }

    try {
      const res = await fetch('/api/stripe/connect/promoter/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create onboarding link')
      }

      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl
      }
    } catch (err: any) {
      setError(err.message)
    }

    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isFullyOnboarded = stripeStatus?.chargesEnabled && stripeStatus?.payoutsEnabled

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 md:pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/promoter/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="mb-8">
            <DollarSign className="w-10 h-10 text-primary mb-3" />
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              Payout Setup
            </h1>
            <p className="text-muted-foreground">
              Connect Stripe to receive payouts from ticket sales. You keep 95% — only 5% platform fee.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm mb-6 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Card */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="font-display text-lg font-semibold mb-4">Stripe Connect Status</h2>

            {!stripeStatus?.hasAccount ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-2">No Payout Account</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Create a Stripe Connect account to start selling tickets and receiving payouts.
                  Only takes a few minutes.
                </p>
                <Button
                  onClick={handleCreateAccount}
                  disabled={actionLoading !== null}
                  className="h-auto rounded-sm px-6 py-2.5"
                >
                  {actionLoading === 'create' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</>
                  ) : (
                    <><ExternalLink className="w-4 h-4 mr-2" />Create Stripe Account</>
                  )}
                </Button>
              </div>
            ) : isFullyOnboarded ? (
              <div>
                <div className="flex items-start gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-4">
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-500">All Set!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your Stripe account is fully onboarded. You can create paid events and receive payouts.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-muted-foreground mb-0.5">Account ID</p>
                    <p className="font-mono text-xs truncate">{stripeStatus?.hasAccount ? promoter?.stripe_account_id || 'Connected' : '-'}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-muted-foreground mb-0.5">Payouts</p>
                    <p className="font-medium text-emerald-500">Active</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartOnboarding}
                    disabled={actionLoading !== null}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Update Stripe Info
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
                  <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-500">Onboarding Incomplete</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your Stripe account exists but needs additional information before you can receive payouts.
                      Complete the onboarding process to start selling tickets.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleStartOnboarding}
                  disabled={actionLoading !== null}
                  className="h-auto rounded-sm px-6 py-2.5"
                >
                  {actionLoading === 'onboarding' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</>
                  ) : (
                    <><ExternalLink className="w-4 h-4 mr-2" />Complete Onboarding</>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold mb-4">How Payouts Work</h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-medium text-foreground mb-0.5">Fan Buys Tickets</p>
                  <p>Stripe processes the payment securely. The full ticket price is collected.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-medium text-foreground mb-0.5">Platform Fee Deducted</p>
                  <p>artistrax takes a 5% platform fee. You keep 95% of every ticket sold.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <p className="font-medium text-foreground mb-0.5">Payout Sent to Your Bank</p>
                  <p>Stripe automatically transfers your earnings to your connected bank account, typically within 2-7 days after the event.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                <div>
                  <p className="font-medium text-foreground mb-0.5">Track Everything</p>
                  <p>View your earnings, ticket sales, and payout history from your dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
