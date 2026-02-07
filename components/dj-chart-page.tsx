'use client'

import Link from 'next/link'
import { AudioPlayer } from '@/components/audio-player'
import { Button } from '@/components/ui/button'
import { ListMusic, Calendar, User2 } from 'lucide-react'

type ChartTrack = {
  position: number
  note: string | null
  tracks: {
    id: string
    title: string
    audio_url: string
    cover_url: string | null
    duration: number | null
    price: number
    is_free: boolean
    play_count: number
    download_count: number
    artists: {
      display_name: string
      username: string
    } | null
    labels: {
      name: string
      slug: string
    } | null
  }
}

type Chart = {
  id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
  artists: {
    display_name: string
    username: string
    avatar_url: string | null
  }
  chart_tracks: ChartTrack[]
}

type Props = {
  chart: Chart
}

export function DJChartPage({ chart }: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Chart Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {chart.artists.avatar_url ? (
                <img 
                  src={chart.artists.avatar_url} 
                  alt={chart.artists.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User2 className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <ListMusic className="w-4 h-4" />
                <span>DJ Chart</span>
              </div>
              <h1 className="text-4xl font-serif font-semibold mb-2">
                {chart.title}
              </h1>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Link 
                  href={`/${chart.artists.username}`}
                  className="text-primary hover:underline font-medium"
                >
                  by {chart.artists.display_name}
                </Link>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(chart.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {chart.description && (
            <p className="text-muted-foreground max-w-2xl">
              {chart.description}
            </p>
          )}
        </div>

        {/* Chart Tracks */}
        <div className="space-y-6">
          {chart.chart_tracks.map((item) => (
            <div key={item.tracks.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6">
                {/* Track Header with Position */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0">
                    {item.position}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-serif font-semibold mb-1">
                      {item.tracks.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {item.tracks.artists && (
                        <Link 
                          href={`/${item.tracks.artists.username}`}
                          className="text-primary hover:underline"
                        >
                          {item.tracks.artists.display_name}
                        </Link>
                      )}
                      {item.tracks.labels && (
                        <>
                          <span>•</span>
                          <Link 
                            href={`/labels/${item.tracks.labels.slug}`}
                            className="hover:underline"
                          >
                            {item.tracks.labels.name}
                          </Link>
                        </>
                      )}
                      <span>•</span>
                      <span>{item.tracks.play_count} plays</span>
                    </div>
                    {item.note && (
                      <p className="text-sm text-muted-foreground italic mt-2">
                        "{item.note}"
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {item.tracks.is_free ? (
                      <div className="text-lg font-semibold text-primary">Free</div>
                    ) : (
                      <div className="text-xl font-bold">${item.tracks.price.toFixed(2)}</div>
                    )}
                  </div>
                </div>

                {/* Audio Player */}
                <AudioPlayer
                  track={{
                    id: item.tracks.id,
                    title: item.tracks.title,
                    artist: item.tracks.artists?.display_name || 'Unknown',
                    audioUrl: item.tracks.audio_url,
                    coverUrl: item.tracks.cover_url || undefined,
                    duration: item.tracks.duration || undefined,
                  }}
                  className="mb-4"
                />

                {/* Download/Buy Button */}
                <div className="flex gap-3">
                  {item.tracks.is_free ? (
                    <Button 
                      className="flex-1"
                      asChild
                    >
                      <a href={`/api/download/${item.tracks.id}`} download>
                        Free Download
                      </a>
                    </Button>
                  ) : (
                    <>
                      <Button className="flex-1">
                        Buy & Download - ${item.tracks.price.toFixed(2)}
                      </Button>
                      <Button variant="outline">
                        Add to Cart
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back to Artist */}
        <div className="mt-12 text-center">
          <Link href={`/${chart.artists.username}`}>
            <Button variant="outline">
              View {chart.artists.display_name}'s Page
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
