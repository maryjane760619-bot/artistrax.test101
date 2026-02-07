'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Play, TrendingUp, Clock, ListMusic, Music, Building2, Heart } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { CartProvider } from '@/lib/cart-context'
import { supabase } from '@/lib/supabase'
import { AudioPlayer } from '@/components/audio-player'

type Track = {
  id: string
  title: string
  audio_url: string
  cover_url: string | null
  duration: number | null
  price: number
  is_free: boolean
  play_count: number
  download_count: number
  created_at: string
  artists: {
    display_name: string
    username: string
  } | null
  labels: {
    name: string
    slug: string
  } | null
}

type DJChart = {
  id: string
  title: string
  description: string | null
  slug: string
  created_at: string
  artist_id: string
  artists: {
    display_name: string
    username: string
    avatar_url: string | null
  }
  chart_tracks: {
    position: number
    tracks: Track
  }[]
}

function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-serif font-semibold tracking-tight mb-8">
            artistrax
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 text-pretty">
            Premium digital downloads from independent artists & labels. High-quality audio, direct to you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
            {/* Fan Signup */}
            <Link 
              href="/fan/signup"
              className="bg-card border-2 border-primary rounded-lg p-6 hover:bg-primary/10 transition-colors group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Join as Fan</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover music, build your collection
                </p>
                <Button size="sm" className="w-full">
                  Sign Up Free
                </Button>
              </div>
            </Link>

            {/* Artist Signup */}
            <Link 
              href="/artist/signup"
              className="bg-card border-2 border-border rounded-lg p-6 hover:border-primary transition-colors group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Music className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Join as Artist</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload tracks, get paid directly
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Get Started
                </Button>
              </div>
            </Link>

            {/* Label Signup */}
            <Link 
              href="/label/signup"
              className="bg-card border-2 border-border rounded-lg p-6 hover:border-primary transition-colors group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Building2 className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Join as Label</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage artists, distribute music
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Get Started
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function NewReleasesSection({ tracks }: { tracks: Track[] }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-serif font-semibold">New Releases</h2>
          </div>
          <Link href="/releases">
            <Button variant="ghost">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {tracks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No releases yet. Be the first to upload!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tracks.map((track) => (
              <div key={track.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-serif font-semibold mb-1">
                      {track.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {track.artists && (
                        <Link 
                          href={`/${track.artists.username}`}
                          className="text-primary hover:underline"
                        >
                          {track.artists.display_name}
                        </Link>
                      )}
                      {track.labels && (
                        <>
                          <span>•</span>
                          <Link 
                            href={`/labels/${track.labels.slug}`}
                            className="hover:underline"
                          >
                            {track.labels.name}
                          </Link>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatDate(track.created_at)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {track.is_free ? (
                      <div className="text-lg font-semibold text-primary">Free</div>
                    ) : (
                      <div className="text-xl font-bold">${track.price.toFixed(2)}</div>
                    )}
                  </div>
                </div>
                <AudioPlayer
                  track={{
                    id: track.id,
                    title: track.title,
                    artist: track.artists?.display_name || track.labels?.name || 'Unknown',
                    audioUrl: track.audio_url,
                    coverUrl: track.cover_url || undefined,
                    duration: track.duration || undefined,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function DJChartsSection({ charts }: { charts: DJChart[] }) {
  return (
    <section className="py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <ListMusic className="w-6 h-6 text-accent" />
          <h2 className="text-3xl font-serif font-semibold">Latest DJ Charts</h2>
        </div>

        {charts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No DJ charts yet. DJs - create your first chart!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charts.map((chart) => {
              // Get top 3 tracks from chart
              const topTracks = chart.chart_tracks
                .sort((a, b) => a.position - b.position)
                .slice(0, 3)
              
              return (
                <Link 
                  key={chart.id}
                  href={`/charts/${chart.artists.username}/${chart.slug}`}
                  className="bg-background border border-border rounded-lg p-6 hover:border-primary transition-colors group"
                >
                  {/* DJ Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {chart.artists.avatar_url ? (
                        <img 
                          src={chart.artists.avatar_url} 
                          alt={chart.artists.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ListMusic className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate group-hover:text-primary transition-colors">
                        {chart.title}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        by {chart.artists.display_name}
                      </div>
                    </div>
                  </div>

                  {/* Top 3 Preview */}
                  <div className="space-y-2">
                    {topTracks.map((item) => (
                      <div key={item.tracks.id} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                          {item.position}
                        </div>
                        <div className="flex-1 min-w-0 truncate text-muted-foreground">
                          {item.tracks.title}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View Chart */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-sm text-primary group-hover:underline">
                      View Full Chart →
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function TopTracksSidebar({ tracks }: { tracks: Track[] }) {
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null)

  return (
    <div className="sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-serif font-semibold">Top 10 Downloads</h2>
      </div>

      {tracks.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">
          No tracks yet
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map((track, index) => (
            <div key={track.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}
                className="w-full p-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate mb-1">
                      {track.title}
                    </h3>
                    <div className="text-xs text-muted-foreground">
                      {track.artists && (
                        <span className="text-primary">
                          {track.artists.display_name}
                        </span>
                      )}
                      {track.labels && track.artists && <span> • </span>}
                      {track.labels && (
                        <span>
                          {track.labels.name}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {track.download_count} downloads
                    </div>
                  </div>
                  <Play className={`w-4 h-4 flex-shrink-0 ${expandedTrack === track.id ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
              </button>
              
              {expandedTrack === track.id && (
                <div className="px-3 pb-3 border-t border-border pt-3">
                  <AudioPlayer
                    track={{
                      id: track.id,
                      title: track.title,
                      artist: track.artists?.display_name || track.labels?.name || 'Unknown',
                      audioUrl: track.audio_url,
                      coverUrl: track.cover_url || undefined,
                      duration: track.duration || undefined,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const [newReleases, setNewReleases] = useState<Track[]>([])
  const [topTracks, setTopTracks] = useState<Track[]>([])
  const [djCharts, setDjCharts] = useState<DJChart[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Fetch new releases
    const { data: newData } = await supabase
      .from('tracks')
      .select('*, artists(display_name, username), labels(name, slug)')
      .order('created_at', { ascending: false })
      .limit(10)

    // Fetch top tracks (by downloads)
    const { data: topData } = await supabase
      .from('tracks')
      .select('*, artists(display_name, username), labels(name, slug)')
      .order('download_count', { ascending: false })
      .limit(10)

    // Fetch latest DJ charts with their tracks
    const { data: chartsData } = await supabase
      .from('dj_charts')
      .select(`
        *,
        artists(display_name, username, avatar_url),
        chart_tracks(
          position,
          tracks(id, title, audio_url, cover_url, duration, artists(display_name, username))
        )
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(6)

    setNewReleases(newData || [])
    setTopTracks(topData || [])
    setDjCharts(chartsData || [])
    setLoading(false)
  }

  return (
    <CartProvider>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        
        {/* DJ Charts Section */}
        <DJChartsSection charts={djCharts} />
        
        {/* Two-column layout */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
              {/* Main Content - New Releases */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <Clock className="w-6 h-6 text-primary" />
                  <h2 className="text-3xl font-serif font-semibold">New Releases</h2>
                </div>

                {newReleases.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No releases yet. Be the first to upload!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {newReleases.map((track) => (
                      <div key={track.id} className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-serif font-semibold mb-1">
                              {track.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              {track.artists && (
                                <Link 
                                  href={`/${track.artists.username}`}
                                  className="text-primary hover:underline"
                                >
                                  {track.artists.display_name}
                                </Link>
                              )}
                              {track.labels && (
                                <>
                                  <span>•</span>
                                  <Link 
                                    href={`/labels/${track.labels.slug}`}
                                    className="hover:underline"
                                  >
                                    {track.labels.name}
                                  </Link>
                                </>
                              )}
                              <span>•</span>
                              <span>{formatDate(track.created_at)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {track.is_free ? (
                              <div className="text-lg font-semibold text-primary">Free</div>
                            ) : (
                              <div className="text-xl font-bold">${track.price.toFixed(2)}</div>
                            )}
                          </div>
                        </div>
                        <AudioPlayer
                          track={{
                            id: track.id,
                            title: track.title,
                            artist: track.artists?.display_name || track.labels?.name || 'Unknown',
                            audioUrl: track.audio_url,
                            coverUrl: track.cover_url || undefined,
                            duration: track.duration || undefined,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar - Top 10 */}
              <aside className="hidden lg:block">
                <TopTracksSidebar tracks={topTracks} />
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </CartProvider>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
