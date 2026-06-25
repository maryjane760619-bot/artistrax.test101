'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Heart,
  Music,
  Building2,
  Play,
  Pause,
  ShoppingCart,
  CheckCircle,
  X,
  Volume2,
  ArrowUpRight,
  ArrowRight,
  Disc3,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/lib/cart-context'
import { GENRES } from '@/lib/genres'
import { SectionHeader, ViewAllLink, MiniStat } from '@/components/site-bits'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const TRACK_SELECT = `id, title, price, is_free, cover_url, audio_url, artist_id, label_id, genre, bpm, musical_key, artists(display_name), labels(name)`

const DEMO_TRACKS = [
  {
    id: 'demo-1',
    title: 'A Gentle Fog Descends',
    price: 1.99,
    is_free: false,
    cover_url: '/placeholder.svg',
    audio_url: '/audio/Brylie Christopher - A Gentle Fog Descends.mp3',
    genre: 'Ambient',
    bpm: 90,
    musical_key: 'A Minor',
    artists: { display_name: 'Brylie Christopher' }
  },
  {
    id: 'demo-2',
    title: 'Waiting Becomes Not Waiting',
    price: 2.49,
    is_free: false,
    cover_url: '/placeholder.svg',
    audio_url: '/audio/Heather Perkins - Waiting Becomes Not Waiting.mp3',
    genre: 'Experimental',
    bpm: 110,
    musical_key: 'C Major',
    artists: { display_name: 'Heather Perkins' }
  },
  {
    id: 'demo-3',
    title: 'A Visit to Kali the Artificer',
    price: 0,
    is_free: true,
    cover_url: '/placeholder.svg',
    audio_url: '/audio/human gazpacho - A Visit to Kali the Artificer.mp3',
    genre: 'Electronic',
    bpm: 124,
    musical_key: 'F# Minor',
    artists: { display_name: 'human gazpacho' }
  },
  {
    id: 'demo-4',
    title: "Varnyr's Room",
    price: 1.99,
    is_free: false,
    cover_url: '/placeholder.svg',
    audio_url: "/audio/human gazpacho - Varnyr's Room.mp3",
    genre: 'Electronic',
    bpm: 120,
    musical_key: 'D Minor',
    artists: { display_name: 'human gazpacho' }
  }
]

export default function HomePage() {
  const [top10, setTop10] = useState<any[]>([])
  const [newReleases, setNewReleases] = useState<any[]>([])
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [currentTrack, setCurrentTrack] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { addItem, items } = useCart()

  const isInCart = (id: string) => items.some(i => i.productId === id)

  const handleAddToCart = (track: any) => {
    if (isInCart(track.id)) return
    addItem({
      productId: track.id,
      productTitle: track.title,
      price: Number(track.price),
      artistId: track.artist_id || track.label_id || '',
      artistName: track.artists?.display_name || track.labels?.name || 'Unknown',
      imageUrl: track.cover_url || undefined,
    })
  }

  const handlePlay = (track: any) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        audioRef.current?.play()
        setIsPlaying(true)
      }
    } else {
      setCurrentTrack(track)
      setProgress(0)
      setIsPlaying(true)
    }
  }

  useEffect(() => {
    if (!currentTrack || !audioRef.current) return
    audioRef.current.src = currentTrack.audio_url || ''
    if (isPlaying) {
      audioRef.current.play().catch(() => {})
    }
  }, [currentTrack])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setProgress(audio.currentTime)
    const onDur = () => setDuration(audio.duration)
    const onEnd = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('durationchange', onDur)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('durationchange', onDur)
      audio.removeEventListener('ended', onEnd)
    }
  }, [])

  useEffect(() => {
    const genreFilter = selectedGenre

    // Top 10: most purchased tracks, optionally filtered by genre
    supabase
      .from('purchases')
      .select('track_id')
      .then(async ({ data: purchases }) => {
        let chartTracks: any[] = []
        if (purchases && purchases.length > 0) {
          const counts: Record<string, number> = {}
          purchases.forEach(p => { if (p.track_id) counts[p.track_id] = (counts[p.track_id] || 0) + 1 })
          const allTopIds = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([id]) => id)

          let q = supabase.from('tracks').select(TRACK_SELECT).in('id', allTopIds.slice(0, 50))
          if (genreFilter) q = q.eq('genre', genreFilter)
          const { data } = await q
          if (data) {
            chartTracks = allTopIds
              .map(id => data.find(t => t.id === id))
              .filter(Boolean)
              .slice(0, 10)
          }
        }

        if (chartTracks.length === 0) {
          let q = supabase.from('tracks').select(TRACK_SELECT).order('created_at', { ascending: false }).limit(10)
          if (genreFilter) q = q.eq('genre', genreFilter)
          const { data } = await q
          chartTracks = data || []
        }

        if (chartTracks.length === 0) {
          const filteredDemos = genreFilter
            ? DEMO_TRACKS.filter(t => t.genre.toLowerCase() === genreFilter.toLowerCase())
            : DEMO_TRACKS
          setTop10(filteredDemos)
        } else {
          setTop10(chartTracks)
        }
      })

    // New releases: latest 6, optionally filtered by genre
    let q = supabase.from('tracks').select(TRACK_SELECT).order('created_at', { ascending: false }).limit(6)
    if (selectedGenre) q = q.eq('genre', selectedGenre)
    q.then(({ data }) => {
      if (data && data.length > 0) {
        setNewReleases(data)
      } else {
        const filteredDemos = selectedGenre
          ? DEMO_TRACKS.filter(t => t.genre.toLowerCase() === selectedGenre.toLowerCase())
          : DEMO_TRACKS
        setNewReleases(filteredDemos)
      }
    })
  }, [selectedGenre])

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  }

  const trackName = (t: any) => t?.artists?.display_name || t?.labels?.name || 'Unknown Artist'
  const priceLabel = (t: any) => (t?.is_free ? 'Free' : `$${Number(t?.price ?? 0).toFixed(2)}`)
  const spotlightTrack = newReleases[0] || DEMO_TRACKS[0]

  /* ---- Editorial release tile (artwork-forward) ---- */
  const ReleaseTile = ({ track }: { track: any }) => {
    const active = currentTrack?.id === track.id
    const playing = active && isPlaying
    const hasCover = track.cover_url && track.cover_url !== '/placeholder.svg'

    return (
      <div className="group cursor-pointer" onClick={() => handlePlay(track)}>
        <div className="relative aspect-square overflow-hidden rounded-sm border border-border bg-muted">
          {hasCover ? (
            <img src={track.cover_url} alt={track.title} className="img-zoom h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
              <Disc3 className="h-16 w-16 text-foreground/15" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          {track.is_free && (
            <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-background/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-accent backdrop-blur-md">
              Free
            </span>
          )}
          <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={(e) => { e.stopPropagation(); handlePlay(track) }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg"
            >
              {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
            </button>
          </div>
        </div>
        <div className="mt-3 px-0.5">
          <h4 className="font-display text-base font-semibold tracking-tight truncate group-hover:text-accent transition-colors">{track.title}</h4>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground truncate">{trackName(track)}</span>
            <span className="font-mono text-xs font-medium tabular-nums shrink-0">{priceLabel(track)}</span>
          </div>
        </div>
      </div>
    )
  }

  /* ---- Editorial chart row (Beatport-style density) ---- */
  const TrackRow = ({ track, index }: { track: any; index: number }) => {
    const active = currentTrack?.id === track.id
    const playing = active && isPlaying
    const hasCover = track.cover_url && track.cover_url !== '/placeholder.svg'

    return (
      <div className={cn(
        'grid grid-cols-12 items-center gap-2 md:gap-4 rounded-sm border px-3 py-2.5 transition',
        active ? 'border-border bg-muted' : 'border-transparent hover:bg-muted/60'
      )}>
        <div className="col-span-1 hidden md:flex items-center justify-center">
          <span className="font-mono text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className="col-span-2 md:col-span-1 flex items-center justify-center">
          <button
            onClick={() => handlePlay(track)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition',
              playing ? 'bg-accent text-accent-foreground' : 'bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
          </button>
        </div>
        <div className="col-span-7 md:col-span-4 flex items-center gap-3 min-w-0 pr-2">
          <div className="hidden sm:block h-10 w-10 shrink-0 overflow-hidden rounded-sm border border-border bg-muted">
            {hasCover ? (
              <img src={track.cover_url} alt={track.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center"><Music className="h-4 w-4 text-foreground/30" /></div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate cursor-pointer hover:text-accent transition-colors" onClick={() => handlePlay(track)}>{track.title}</p>
            <p className="text-xs text-muted-foreground truncate">{trackName(track)}</p>
          </div>
        </div>
        <div className="hidden md:block col-span-2">
          {track.genre ? (
            <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{track.genre}</span>
          ) : <span className="text-muted-foreground">—</span>}
        </div>
        <div className="hidden md:block col-span-1 text-center"><span className="font-mono text-xs tabular-nums text-foreground/80">{track.bpm || '—'}</span></div>
        <div className="hidden md:block col-span-1 text-center"><span className="font-mono text-xs text-foreground/80">{track.musical_key || '—'}</span></div>
        <div className="col-span-2 md:col-span-1 text-right"><span className="font-mono text-xs font-medium tabular-nums">{priceLabel(track)}</span></div>
        <div className="col-span-1 flex items-center justify-center">
          {!track.is_free && (
            <button
              onClick={() => handleAddToCart(track)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full transition',
                isInCart(track.id) ? 'text-emerald-600' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-label="Add to cart"
            >
              {isInCart(track.id) ? <CheckCircle className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <audio ref={audioRef} />

      <main className="flex-1 pb-32">
        {/* Hero */}
        <section className="relative">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 lg:pt-16">
            <div className="max-w-2xl pb-6">
              <div className="text-xs uppercase tracking-[0.2em] text-foreground/60">Independent music · Direct to fan</div>
              <h1 className="font-display mt-3 text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.04] tracking-tight">
                Where an artist can be an{' '}
                <span className="italic text-accent">artist</span>.
              </h1>
              <p className="mt-4 max-w-lg text-sm text-muted-foreground leading-relaxed">
                High-fidelity, lossless downloads straight from the creators. Own your music forever —
                artists keep 95% of every sale.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/releases" className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                  Explore Store <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link href="/artist/signup" className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition">
                  Artist Onboarding <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Spotlight feature */}
            {spotlightTrack && (
              <div className="group relative grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-sm border border-border bg-card">
                <div className="relative lg:col-span-7 aspect-[4/3] lg:aspect-auto lg:min-h-[520px] overflow-hidden bg-muted">
                  {spotlightTrack.cover_url && spotlightTrack.cover_url !== '/placeholder.svg' ? (
                    <img src={spotlightTrack.cover_url} alt={spotlightTrack.title} className="img-zoom absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                      <Disc3 className={cn('h-32 w-32 text-foreground/15', isPlaying && currentTrack?.id === spotlightTrack.id && 'animate-spin [animation-duration:10s]')} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-background/95 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    Featured Spotlight
                  </div>
                  <button
                    onClick={() => handlePlay(spotlightTrack)}
                    className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-2xl transition hover:scale-105"
                    aria-label="Play featured track"
                  >
                    {isPlaying && currentTrack?.id === spotlightTrack.id ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
                  </button>
                </div>
                <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/60">
                      <span>{spotlightTrack.genre || 'New Release'}</span>
                      {spotlightTrack.musical_key && (<><span>·</span><span>{spotlightTrack.musical_key}</span></>)}
                    </div>
                    <h2 className="font-display mt-3 text-4xl sm:text-5xl font-semibold leading-[0.98] tracking-tight">{spotlightTrack.title}</h2>
                    <p className="mt-4 text-sm text-muted-foreground">{trackName(spotlightTrack)}</p>
                    <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-border bg-border">
                      <MiniStat label="Format" value="Lossless" />
                      <MiniStat label="BPM" value={spotlightTrack.bpm ? String(spotlightTrack.bpm) : '—'} />
                      <MiniStat label="Price" value={priceLabel(spotlightTrack)} />
                    </div>
                  </div>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button onClick={() => handlePlay(spotlightTrack)} className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                      <Play className="h-3.5 w-3.5 fill-current" /> Preview
                    </button>
                    {!spotlightTrack.is_free && (
                      <button onClick={() => handleAddToCart(spotlightTrack)} className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-foreground/40">
                        {isInCart(spotlightTrack.id) ? <><CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> In Cart</> : <><ShoppingCart className="h-3.5 w-3.5" /> Buy {priceLabel(spotlightTrack)}</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* New Releases */}
        <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-16 sm:py-20">
          <SectionHeader
            eyebrow="Fresh on artistrax"
            title="New Releases"
            subtitle="The latest drops from independent artists and labels."
            action={<ViewAllLink href="/releases" label="All releases" />}
          />
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {newReleases.slice(0, 6).map(track => (
              <ReleaseTile key={track.id} track={track} />
            ))}
          </div>
        </section>

        {/* Trending / Chart */}
        <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
          <SectionHeader
            eyebrow="Most downloaded"
            title="Top 10 Chart"
            subtitle="DJ-ready listing with BPM and key mapping."
          />

          {/* Genre filter */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGenre('')}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
                selectedGenre === '' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground'
              )}
            >
              All Genres
            </button>
            {GENRES.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g === selectedGenre ? '' : g)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
                  selectedGenre === g ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                )}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-sm border border-border bg-card p-2 sm:p-3">
            <div className="hidden md:grid grid-cols-12 gap-4 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground border-b border-border">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-1 text-center">Play</div>
              <div className="col-span-4">Track</div>
              <div className="col-span-2">Genre</div>
              <div className="col-span-1 text-center">BPM</div>
              <div className="col-span-1 text-center">Key</div>
              <div className="col-span-1 text-right">Price</div>
              <div className="col-span-1 text-center">Cart</div>
            </div>
            <div className="mt-1 space-y-0.5">
              {top10.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No tracks found matching criteria.</p>
              ) : (
                top10.map((track, i) => <TrackRow key={track.id} track={track} index={i} />)
              )}
            </div>
          </div>
        </section>

        {/* Artist Spotlight */}
        <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-sm border border-border bg-card">
            <div className="relative lg:col-span-5 aspect-square lg:aspect-auto lg:min-h-[420px] overflow-hidden bg-muted group">
              <img src="/placeholder-user.jpg" alt="DJ Halo" className="img-zoom absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-background/95 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] backdrop-blur-md">
                Artist Spotlight
              </div>
            </div>
            <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 lg:p-10">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-foreground/60">Deep House · Mexico City</div>
                <h2 className="font-display mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">DJ Halo</h2>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  Pioneering organic deep house rhythms that connect the dancefloor to the cosmos —
                  merging traditional percussion with modern modular synthesizer textures.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-border bg-border">
                  <MiniStat label="Monthly Fans" value="12.4K" />
                  <MiniStat label="Releases" value="18" />
                  <MiniStat label="Artist Split" value="95%" />
                </div>
              </div>
              <div className="mt-8">
                <Link href="/artists" className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                  View Artist Profile <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Join CTA */}
        <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
          <SectionHeader eyebrow="Get started" title="Join artistrax" subtitle="Three ways in — as a fan, an artist, or a label." />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-px overflow-hidden rounded-sm border border-border bg-border">
            {[
              { href: '/fan/signup', icon: Heart, title: 'Join as Fan', copy: 'Discover music, build your lossless collection, and follow your favorite producers.', cta: 'Sign Up Free' },
              { href: '/artist/signup', icon: Music, title: 'Join as Artist', copy: 'Upload your tracks, manage your catalogue, and keep 95% of every sale.', cta: 'Get Started' },
              { href: '/label/signup', icon: Building2, title: 'Join as Label', copy: 'Register your label, distribute catalogs, and coordinate artist accounts.', cta: 'Get Started' },
            ].map(({ href, icon: Icon, title, copy, cta }) => (
              <Link key={href} href={href} className="group flex flex-col bg-card p-8 transition hover:bg-muted">
                <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-secondary text-foreground">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-display mt-6 text-xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">{copy}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted-foreground transition group-hover:text-accent">
                  {cta} <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {/* Sticky bottom player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center gap-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md md:flex-row sm:px-6 lg:px-10">
          <div className="flex w-full items-center gap-3 md:w-auto shrink-0">
            {currentTrack.cover_url && currentTrack.cover_url !== '/placeholder.svg' ? (
              <img src={currentTrack.cover_url} alt={currentTrack.title} className="h-12 w-12 shrink-0 rounded-sm border border-border object-cover" />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-border bg-muted"><Music className="h-5 w-5 text-foreground/30" /></div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{currentTrack.title}</p>
              <p className="truncate text-xs text-muted-foreground">{trackName(currentTrack)}</p>
            </div>
          </div>

          <button
            onClick={() => handlePlay(currentTrack)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition hover:scale-105"
          >
            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
          </button>

          <div className="flex w-full flex-1 items-center gap-3">
            <span className="w-10 text-right font-mono text-[11px] tabular-nums text-muted-foreground">{fmt(progress)}</span>
            <div
              className="group/timeline relative h-1.5 flex-1 cursor-pointer rounded-full bg-secondary"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect()
                if (audioRef.current) audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration
              }}
            >
              <div className="h-full rounded-full bg-accent" style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }} />
            </div>
            <span className="w-10 font-mono text-[11px] tabular-nums text-muted-foreground">{fmt(duration)}</span>
          </div>

          <div className="flex w-full items-center justify-end gap-4 shrink-0 md:w-auto">
            <div className="group/volume hidden items-center gap-2 sm:flex">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <div
                className="relative h-1 w-16 cursor-pointer rounded-full bg-secondary"
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const pct = (e.clientX - rect.left) / rect.width
                  if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(1, pct))
                }}
              >
                <div className="h-full rounded-full bg-foreground/60" style={{ width: audioRef.current ? `${(audioRef.current.volume || 1) * 100}%` : '100%' }} />
              </div>
            </div>

            {!currentTrack.is_free && (
              <button
                onClick={() => handleAddToCart(currentTrack)}
                className="rounded-sm bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition hover:bg-accent/90"
              >
                {isInCart(currentTrack.id) ? 'In Cart' : 'Buy Track'}
              </button>
            )}

            <button
              onClick={() => { audioRef.current?.pause(); setCurrentTrack(null); setIsPlaying(false) }}
              className="p-1 text-muted-foreground transition hover:text-foreground"
              aria-label="Close player"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
