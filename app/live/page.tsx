import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Radio, Users, Video } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const dynamic = 'force-dynamic'

export default async function LiveStreamsPage() {
  const supabase = createClient()

  // Fetch active live streams
  const { data: streams } = await supabase
    .from('live_streams')
    .select(`
      *,
      artists:artist_id (display_name, username, avatar_url),
      labels:label_id (name, slug, logo_url)
    `)
    .eq('status', 'live')
    .eq('is_public', true)
    .order('started_at', { ascending: false })

  // Fetch scheduled streams
  const { data: scheduled } = await supabase
    .from('live_streams')
    .select(`
      *,
      artists:artist_id (display_name, username, avatar_url),
      labels:label_id (name, slug, logo_url)
    `)
    .eq('status', 'scheduled')
    .eq('is_public', true)
    .order('scheduled_for', { ascending: true })
    .limit(5)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
          {/* Header */}
          <div className="mb-12 border-b border-border pb-8">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Live
            </div>
            <h1 className="font-display mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
              Live Now
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Watch live DJ sets, production sessions, and exclusive performances — direct from the artists.
            </p>
          </div>

          {/* Live Streams */}
          {streams && streams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {streams.map((stream) => (
                <Link key={stream.id} href={`/live/${stream.id}`} className="group block">
                  <div className="relative aspect-video overflow-hidden rounded-sm border border-border bg-muted">
                    {stream.thumbnail_url ? (
                      <img src={stream.thumbnail_url} alt={stream.title} className="img-zoom h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Video className="w-16 h-16 text-foreground/20" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-accent-foreground">
                      <Radio className="w-3 h-3 animate-pulse" />
                      Live
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-xs backdrop-blur-md">
                      <Users className="w-3.5 h-3.5" />
                      {stream.max_viewers}
                    </div>
                  </div>
                  <div className="mt-3 px-0.5">
                    <h3 className="font-display text-lg font-semibold tracking-tight truncate group-hover:text-accent transition-colors">{stream.title}</h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {stream.artists?.display_name || stream.labels?.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mx-auto mb-16 max-w-md rounded-sm border border-border bg-card py-16 text-center">
              <Radio className="w-12 h-12 mx-auto mb-4 text-foreground/20" />
              <h2 className="font-display text-2xl font-semibold tracking-tight mb-2">No Live Streams Right Now</h2>
              <p className="text-sm text-muted-foreground mb-6">Check back later for live performances.</p>
              <Link href="/releases" className="inline-flex items-center rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                Browse Releases
              </Link>
            </div>
          )}

          {/* Scheduled Streams */}
          {scheduled && scheduled.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight mb-6">Coming Up</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scheduled.map((stream) => (
                  <div key={stream.id} className="rounded-sm border border-border bg-card overflow-hidden opacity-90">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Video className="w-16 h-16 text-foreground/20" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-lg font-semibold tracking-tight mb-1">{stream.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {stream.artists?.display_name || stream.labels?.name}
                      </p>
                      <p className="font-mono text-xs tabular-nums text-accent">
                        {stream.scheduled_for
                          ? new Date(stream.scheduled_for).toLocaleDateString('en-US', {
                              weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                            })
                          : 'Scheduled soon'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}