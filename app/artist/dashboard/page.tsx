'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Upload, Music, TrendingUp, DollarSign, Download, User, ListMusic, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { SubscriptionBanner } from '@/components/subscription-banner'

export default function ArtistDashboard() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [artistData, setArtistData] = useState<any>(null)
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalDownloads: 0,
    totalPlays: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/artist/login')
    }

    if (user) {
      loadArtistData()
      loadStats()
    }
  }, [user, loading])

  const loadArtistData = async () => {
    if (!user) return

    const { data } = await supabase
      .from('artists')
      .select('*, subscription_status, subscription_tier, trial_ends_at, subscription_expires_at')
      .eq('id', user.id)
      .single()

    setArtistData(data)
  }

  const loadStats = async () => {
    if (!user) return

    // Count tracks
    const { count: trackCount } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', user.id)

    // Sum downloads
    const { count: downloadCount } = await supabase
      .from('downloads')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', user.id)

    // Sum plays
    const { data: playData } = await supabase
      .from('plays')
      .select('duration_played')
      .eq('artist_id', user.id)

    const totalPlays = playData?.length || 0

    // Sum revenue
    const { data: purchaseData } = await supabase
      .from('purchases')
      .select('amount')
      .eq('artist_id', user.id)

    const totalRevenue = purchaseData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

    setStats({
      totalTracks: trackCount || 0,
      totalDownloads: downloadCount || 0,
      totalPlays,
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

  if (!user || !artistData) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-serif font-semibold">
                artistrax
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-lg">{artistData.display_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/${artistData.username}`}>
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
          <h1 className="text-3xl font-serif font-semibold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {artistData.display_name}
          </p>
        </div>

        {/* Subscription Banner */}
        <div className="mb-8">
          <SubscriptionBanner
            accountType="artist"
            subscriptionStatus={artistData.subscription_status}
            subscriptionTier={artistData.subscription_tier}
            trialEndsAt={artistData.trial_ends_at}
            subscriptionExpiresAt={artistData.subscription_expires_at}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Link href="/artist/upload">
            <Button className="w-full h-auto py-6 flex-col gap-2">
              <Upload className="w-8 h-8" />
              <span className="text-lg">Upload Track</span>
            </Button>
          </Link>
          <Link href="/artist/batch-upload">
            <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
              <Upload className="w-8 h-8" />
              <span className="text-lg">Batch Upload</span>
            </Button>
          </Link>
          <Link href="/artist/links">
            <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
              <LinkIcon className="w-8 h-8" />
              <span className="text-lg">Manage Links</span>
            </Button>
          </Link>
          <Link href="/artist/profile">
            <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
              <User className="w-8 h-8" />
              <span className="text-lg">Edit Profile</span>
            </Button>
          </Link>
          <Link href="/artist/analytics">
            <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
              <Download className="w-8 h-8" />
              <span className="text-lg">Analytics</span>
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Music className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Tracks</span>
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

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Upload your first track</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Share your music with the world. Supports MP3, FLAC, and WAV.
                </p>
                <Link href="/artist/upload">
                  <Button size="sm">Upload Now</Button>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Customize your artist page</h3>
                <p className="text-sm text-muted-foreground">
                  Add a bio, profile picture, and links. Make it yours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Set up payouts</h3>
                <p className="text-sm text-muted-foreground">
                  Connect Stripe to start receiving payments directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
