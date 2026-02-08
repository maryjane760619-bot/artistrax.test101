'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LabelAuthProvider, useLabelAuth } from '@/lib/label-auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Upload, Music, TrendingUp, DollarSign, Download, Users, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { SubscriptionBanner } from '@/components/subscription-banner'

function DashboardContent() {
  const router = useRouter()
  const { user, loading, signOut } = useLabelAuth()
  const [labelData, setLabelData] = useState<any>(null)
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalDownloads: 0,
    totalPlays: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/label/login')
    }

    if (user) {
      loadLabelData()
      loadStats()
    }
  }, [user, loading])

  const loadLabelData = async () => {
    if (!user) return

    const { data } = await supabase
      .from('labels')
      .select('*, subscription_status, subscription_tier, trial_ends_at, subscription_expires_at')
      .eq('id', user.id)
      .single()

    setLabelData(data)
  }

  const loadStats = async () => {
    if (!user) return

    const { count: trackCount } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })
      .eq('label_id', user.id)

    const { count: downloadCount } = await supabase
      .from('downloads')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', user.id)

    const { data: purchaseData } = await supabase
      .from('purchases')
      .select('amount')
      .eq('artist_id', user.id)

    const totalRevenue = purchaseData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

    setStats({
      totalTracks: trackCount || 0,
      totalDownloads: downloadCount || 0,
      totalPlays: 0,
      totalRevenue,
    })
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user || !labelData) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-serif font-semibold">
                artistrax
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-lg">{labelData.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/labels/${labelData.slug}`}>
                <Button variant="outline" size="sm">
                  View Public Page
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold mb-2">Label Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your catalog and artists
          </p>
        </div>

        {/* Subscription Banner */}
        <div className="mb-8">
          <SubscriptionBanner
            accountType="label"
            subscriptionStatus={labelData.subscription_status}
            subscriptionTier={labelData.subscription_tier}
            trialEndsAt={labelData.trial_ends_at}
            subscriptionExpiresAt={labelData.subscription_expires_at}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Link href="/label/upload">
            <Button className="w-full h-auto py-6 flex-col gap-2">
              <Upload className="w-8 h-8" />
              <span className="text-lg">Upload Release</span>
            </Button>
          </Link>
          <Link href="/label/batch-upload">
            <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
              <Upload className="w-8 h-8" />
              <span className="text-lg">Batch Upload</span>
            </Button>
          </Link>
          <Link href="/label/links">
            <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
              <LinkIcon className="w-8 h-8" />
              <span className="text-lg">Manage Links</span>
            </Button>
          </Link>
          <Link href="/label/profile">
            <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
              <Users className="w-8 h-8" />
              <span className="text-lg">Edit Profile</span>
            </Button>
          </Link>
          <Link href="/label/analytics">
            <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
              <Download className="w-8 h-8" />
              <span className="text-lg">Analytics</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Music className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Catalog</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalTracks}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Download className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Downloads</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalDownloads}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Plays</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalPlays}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Revenue</span>
            </div>
            <div className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Upload your first release</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Build your catalog — upload singles, EPs, or full albums.
                </p>
                <Link href="/label/upload">
                  <Button size="sm">Upload Now</Button>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Customize your label page</h3>
                <p className="text-sm text-muted-foreground">
                  Add your logo, bio, and social links. Build your brand.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Connect Stripe for payouts</h3>
                <p className="text-sm text-muted-foreground">
                  Start earning from your releases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function LabelDashboardPage() {
  return (
    <LabelAuthProvider>
      <DashboardContent />
    </LabelAuthProvider>
  )
}
