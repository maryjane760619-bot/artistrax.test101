'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Music, ExternalLink, DollarSign, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { BrandingEditor } from '@/components/branding-editor'
import { SubscriptionSettingsEditor } from '@/components/subscription-settings-editor'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function LabelDashboard() {
  const { user } = useAuth()
  const [labelData, setLabelData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')
  const [continuingOnboarding, setContinuingOnboarding] = useState(false)
  const [earnings, setEarnings] = useState<any>(null)
  const [tracks, setTracks] = useState<any[]>([])

  useEffect(() => {
    if (!user) return

    supabase
      .from('labels')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setLabelData(data)
        setLoading(false)
      })

    supabase
      .from('tracks')
      .select('id, title, price, is_free, cover_url, created_at')
      .eq('label_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setTracks(data || []))

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      fetch('/api/stripe/connect/label/earnings', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then(r => r.json())
        .then(data => setEarnings(data))
        .catch(() => {})
    })
  }, [user])

  const handleContinueOnboarding = async () => {
    setContinuingOnboarding(true)
    setConnectError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Please log in again')

      const res = await fetch('/api/stripe/connect/label/create-link', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create onboarding link')
      window.location.href = data.onboardingUrl
    } catch (err: any) {
      setConnectError(err.message)
      setContinuingOnboarding(false)
    }
  }

  const handleConnectStripe = async () => {
    setConnecting(true)
    setConnectError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Please log in again')

      const res = await fetch('/api/stripe/connect/label/create-account', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      const data = await res.json()

      if (!res.ok) throw new Error(
        `${data.error || 'Failed'}${data.type ? ` [${data.type}]` : ''}${data.code ? ` code:${data.code}` : ''}`
      )

      window.location.href = data.onboardingUrl
    } catch (err: any) {
      setConnectError(err.message)
      setConnecting(false)
    }
  }

  if (!user) return <div className="p-8">Please log in</div>
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  )

  const stripeConnected = !!(labelData?.stripe_account_id && labelData?.stripe_charges_enabled)
  const stripeIncomplete = !!(labelData?.stripe_account_id && !labelData?.stripe_charges_enabled)

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">{labelData?.name || 'Label Dashboard'}</h1>
              <p className="text-muted-foreground">Manage your catalog and artists</p>
            </div>
            <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}>
              Sign Out
            </Button>
          </div>

          {user && (
            <BrandingEditor
              table="labels"
              recordId={user.id}
              logoUrl={labelData?.logo_url || null}
              bannerUrl={labelData?.banner_url || null}
              onUpdated={urls => setLabelData((prev: any) => ({ ...prev, ...urls }))}
            />
          )}

          <SubscriptionSettingsEditor />

          {/* Stripe Status */}
          {stripeConnected ? (
            <div className="flex items-center gap-2 mb-6 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span>Stripe connected</span>
              <span className="text-muted-foreground">·</span>
              <button
                className="underline text-muted-foreground hover:text-foreground"
                onClick={() => window.open(earnings?.stripeLoginUrl || 'https://dashboard.stripe.com', '_blank')}
              >
                Open Stripe Dashboard
              </button>
            </div>
          ) : stripeIncomplete ? (
            <Card className="mb-8 border-2 border-yellow-300 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h3 className="text-xl font-bold text-yellow-800">Complete Stripe Onboarding</h3>
                    <p className="text-yellow-700">Your account was created but onboarding isn't finished yet.</p>
                  </div>
                </div>
                {connectError && (
                  <p className="text-red-600 text-sm mb-3">{connectError}</p>
                )}
                <Button
                  onClick={handleContinueOnboarding}
                  disabled={continuingOnboarding}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {continuingOnboarding ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</>
                  ) : (
                    'Continue Onboarding'
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8 border-2 border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                  <div>
                    <h3 className="text-xl font-bold text-orange-800">Connect Stripe to Get Paid</h3>
                    <p className="text-orange-700">Required to receive payments from track sales.</p>
                  </div>
                </div>
                <ul className="text-sm space-y-1 text-orange-800 mb-4">
                  <li>• You keep 90% of every sale</li>
                  <li>• Instant payouts to your bank</li>
                  <li>• Takes 2–3 minutes to set up</li>
                </ul>
                {connectError && (
                  <p className="text-red-600 text-sm mb-3">{connectError}</p>
                )}
                <Button
                  onClick={handleConnectStripe}
                  disabled={connecting}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {connecting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
                  ) : (
                    'Connect Stripe Account'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Music className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{tracks.length}</p>
                    <p className="text-sm text-muted-foreground">Tracks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      ${earnings?.stripeBalance ? earnings.stripeBalance.available.toFixed(2) : '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">Available in Stripe</p>
                    {earnings?.stripeBalance?.pending > 0 && (
                      <p className="text-xs text-muted-foreground">${earnings.stripeBalance.pending.toFixed(2)} pending</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      ${earnings ? earnings.labelShare.toFixed(2) : '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tracked sales ({earnings?.salesCount ?? 0})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Catalog */}
          {tracks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Catalog</h2>
              <div className="space-y-2">
                {tracks.map(track => (
                  <div key={track.id} className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      {track.cover_url ? (
                        <img src={track.cover_url} alt={track.title} className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <Music className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="font-medium">{track.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {track.is_free ? 'Free' : `$${Number(track.price).toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/label/upload">Upload Track</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/label/upload-mix">Upload Mix</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/labels/siesta-records" target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public Page
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/label/billing">Billing</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
