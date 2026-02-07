'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FanAuthProvider, useFanAuth } from '@/lib/fan-auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Heart, Download, Music, TrendingUp, User } from 'lucide-react'
import Link from 'next/link'

function DashboardContent() {
  const router = useRouter()
  const { user, loading, signOut } = useFanAuth()
  const [fanData, setFanData] = useState<any>(null)
  const [stats, setStats] = useState({
    favorites: 0,
    downloads: 0,
    following: 0,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/fan/login')
    }

    if (user) {
      loadFanData()
      loadStats()
    }
  }, [user, loading])

  const loadFanData = async () => {
    if (!user) return

    const { data } = await supabase
      .from('fans')
      .select('*')
      .eq('id', user.id)
      .single()

    setFanData(data)
  }

  const loadStats = async () => {
    if (!user) return

    // Count favorites
    const { count: favCount } = await supabase
      .from('fan_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('fan_id', user.id)

    // Count downloads
    const { count: downloadCount } = await supabase
      .from('downloads')
      .select('*', { count: 'exact', head: true })
      .eq('buyer_email', user.email)

    // Count follows (artists + labels)
    const { count: artistFollows } = await supabase
      .from('fan_follows_artists')
      .select('*', { count: 'exact', head: true })
      .eq('fan_id', user.id)

    const { count: labelFollows } = await supabase
      .from('fan_follows_labels')
      .select('*', { count: 'exact', head: true })
      .eq('fan_id', user.id)

    setStats({
      favorites: favCount || 0,
      downloads: downloadCount || 0,
      following: (artistFollows || 0) + (labelFollows || 0),
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

  if (!user || !fanData) {
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
              <span className="text-lg">{fanData.display_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm">
                  Browse Music
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
          <h1 className="text-3xl font-serif font-semibold mb-2">Fan Dashboard</h1>
          <p className="text-muted-foreground">
            Your music collection and downloads
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Favorites</span>
            </div>
            <div className="text-3xl font-bold">{stats.favorites}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Download className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Downloads</span>
            </div>
            <div className="text-3xl font-bold">{stats.downloads}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Following</span>
            </div>
            <div className="text-3xl font-bold">{stats.following}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Music className="w-5 h-5" />
              Your Playlists
            </h2>
            <p className="text-muted-foreground mb-4">
              Create and manage custom playlists to listen at home
            </p>
            <Link href="/fan/playlists">
              <Button>View Playlists</Button>
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Your Library
            </h2>
            <p className="text-muted-foreground mb-4">
              All your favorite tracks and purchases in one place
            </p>
            <Link href="/fan/library">
              <Button variant="outline">View Library</Button>
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Discover New Music
            </h2>
            <p className="text-muted-foreground mb-4">
              Explore the latest releases and trending tracks
            </p>
            <Link href="/">
              <Button variant="outline">Browse Catalog</Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Discover Music</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Browse our catalog, explore new releases, and find your next favorite track
                </p>
                <Link href="/">
                  <Button size="sm">Start Exploring</Button>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Build Your Collection</h3>
                <p className="text-sm text-muted-foreground">
                  Add tracks to your favorites and download music you love
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Support Artists</h3>
                <p className="text-sm text-muted-foreground">
                  Follow your favorite artists and purchase their tracks
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function FanDashboardPage() {
  return (
    <FanAuthProvider>
      <DashboardContent />
    </FanAuthProvider>
  )
}
