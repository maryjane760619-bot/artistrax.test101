'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Music, ExternalLink, DollarSign, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function LabelDashboard() {
  const { user } = useAuth()
  const [labelData, setLabelData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')

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
  }, [user])

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

      if (!res.ok) throw new Error(data.error || 'Failed to start Stripe setup')

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

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-8">
            <h1 className="text-3xl font-bold">{labelData?.name || 'Label Dashboard'}</h1>
            <p className="text-muted-foreground">Manage your catalog and artists</p>
          </div>

          {/* Stripe Status */}
          {stripeConnected ? (
            <Card className="mb-8 bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-xl font-bold text-green-800">Stripe Connected!</h3>
                    <p className="text-green-700">You're ready to receive payments.</p>
                  </div>
                </div>
                <ul className="text-sm space-y-2 text-green-800 mb-4">
                  <li>✓ Charges enabled</li>
                  <li>✓ You keep 90% of every sale</li>
                  <li>✓ Monthly payouts</li>
                </ul>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Stripe Dashboard
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
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Music className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{labelData?.track_count ?? '—'}</p>
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
                    <p className="text-2xl font-bold">$0</p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/label/upload">Upload Track</Link>
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
