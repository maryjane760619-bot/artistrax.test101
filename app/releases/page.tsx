'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/lib/cart-context'
import { ArrowRight, Music, ShoppingCart, CheckCircle, Grid2X2, List, Play, Pause, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GENRES } from '@/lib/genres'

export const dynamic = 'force-dynamic'

export default function ReleasesPage() {
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGenre, setSelectedGenre] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az' | 'price-high' | 'price-low'>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { addItem, items } = useCart()

  // Player state
  const [currentTrack, setCurrentTrack] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const isInCart = (trackId: string) => items.some(i => i.productId === trackId)

  const handleAddToCart = (track: any) => {
    if (isInCart(track.id)) return
    addItem({
      productId: track.id,
      productTitle: track.title,
      price: Number(track.price),
      artistId: track.artist_id || track.label_id || '',
      artistName: track.artists?.display_name || track.labels?.name || '',
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
    if (isPlaying) audioRef.current.play().catch(() => {})
  }, [currentTrack])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => setProgress(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration)
    const onEnded = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)

    // Safety timeout: prevent infinite spinner
    const timeoutId = setTimeout(() => {
      setError('Request timed out. Please try again.')
      setLoading(false)
    }, 15000)

    let q = supabase
      .from('tracks')
      .select(`
        id, title, price, is_free, cover_url, audio_url, created_at,
        artist_id, label_id, genre, bpm, musical_key,
        artists(display_name, username),
        labels(name, slug)
      `)
      .order('created_at', { ascending: false })
    if (selectedGenre) q = q.eq('genre', selectedGenre)

    q.then(({ data, error: fetchError }) => {
      clearTimeout(timeoutId)
      if (fetchError) {
        console.error('[Releases] Supabase query error:', fetchError)
        setError(fetchError.message)
        setTracks([])
      } else {
        setTracks(data || [])
      }
      setLoading(false)
    }).catch((err: unknown) => {
      clearTimeout(timeoutId)
      const message = err instanceof Error ? err.message : 'Failed to load releases'
      console.error('[Releases] Fetch failed:', message)
      setError(message)
      setLoading(false)
    })

    return () => clearTimeout(timeoutId)
  }, [selectedGenre])

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const filteredTracks = tracks
    .filter(track => {
      const query = searchQuery.trim().toLowerCase()
      if (!query) return true

      return (
        track.title?.toLowerCase().includes(query) ||
        track.genre?.toLowerCase().includes(query) ||
        track.artists?.display_name?.toLowerCase().includes(query) ||
        track.labels?.name?.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      if (sortBy === 'az') return String(a.title).localeCompare(String(b.title))
      if (sortBy === 'price-high') return Number(b.price || 0) - Number(a.price || 0)
      if (sortBy === 'price-low') return Number(a.price || 0) - Number(b.price || 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <audio ref={audioRef} />

      <main className="pb-32">
        <section className="py-12 md:py-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="mb-8">
              <div className="text-xs uppercase tracking-[0.2em] text-foreground/60 mb-2">Browse the catalog</div>
              <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3">New Releases</h1>
              <p className="text-muted-foreground max-w-2xl mb-6">
                Browse the latest tracks from our artists and labels — lossless, DRM-free, yours forever.
              </p>
              {/* Genre pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedGenre('')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selectedGenre === ''
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
                  }`}
                >
                  All
                </button>
                {GENRES.map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g === selectedGenre ? '' : g)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      selectedGenre === g
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8 flex flex-col gap-3 border-y border-border py-4 md:flex-row md:items-center">
              <label className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  placeholder="Search releases, artists, labels..."
                  className="h-11 w-full rounded-sm border border-border bg-card pl-10 pr-4 text-sm outline-none transition focus:border-foreground/40"
                />
              </label>

              <select
                value={sortBy}
                onChange={event => setSortBy(event.target.value as typeof sortBy)}
                className="h-11 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground/40"
                aria-label="Sort releases"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="az">Title: A–Z</option>
                <option value="price-high">Price: High to low</option>
                <option value="price-low">Price: Low to high</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex h-11 items-center gap-2 rounded-sm px-3 text-xs uppercase tracking-wide transition ${
                    viewMode === 'grid'
                      ? 'bg-accent text-accent-foreground'
                      : 'border border-border hover:bg-accent/10'
                  }`}
                >
                  <Grid2X2 className="h-3.5 w-3.5" />
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`inline-flex h-11 items-center gap-2 rounded-sm px-3 text-xs uppercase tracking-wide transition ${
                    viewMode === 'list'
                      ? 'bg-accent text-accent-foreground'
                      : 'border border-border hover:bg-accent/10'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  List
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-sm border border-dashed border-destructive/30 py-16 text-center">
                <p className="text-destructive font-medium mb-2">Failed to load releases</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            ) : loading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : filteredTracks.length === 0 ? (
              <div className="rounded-sm border border-dashed border-border py-16 text-center text-muted-foreground">
                No releases match those filters.
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
                {filteredTracks.map(track => (
                  <div key={track.id} className="group">
                    {/* Cover art with play overlay */}
                    <div
                      className="relative aspect-square overflow-hidden rounded-sm border border-border bg-muted flex items-center justify-center cursor-pointer"
                      onClick={() => handlePlay(track)}
                    >
                      {track.cover_url ? (
                        <img
                          src={track.cover_url}
                          alt={track.title}
                          className="img-zoom h-full w-full object-cover"
                        />
                      ) : (
                        <Music className="w-12 h-12 text-foreground/20" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                      <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                          {currentTrack?.id === track.id && isPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current" />
                          )}
                        </span>
                      </div>
                      {currentTrack?.id === track.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30">
                          <div
                            className="h-full bg-accent"
                            style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-3 px-0.5">
                      <Link href={`/track/${track.id}`}>
                        <p className="font-display text-base font-semibold tracking-tight truncate group-hover:text-accent transition-colors">{track.title}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {track.artists?.display_name || track.labels?.name || 'Unknown'}
                        </p>
                        {(track.bpm || track.musical_key) && (
                          <p className="font-mono text-[11px] tabular-nums text-muted-foreground/70 mt-1">
                            {[track.bpm && `${track.bpm} BPM`, track.musical_key].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </Link>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-medium tabular-nums">
                          {track.is_free ? 'Free' : `$${Number(track.price).toFixed(2)}`}
                        </span>
                        {!track.is_free && (
                          <button
                            onClick={() => handleAddToCart(track)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                              isInCart(track.id) ? 'text-emerald-600' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                            aria-label="Add to cart"
                          >
                            {isInCart(track.id) ? <CheckCircle className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-t border-border">
                {filteredTracks.map(track => (
                  <div
                    key={track.id}
                    className="group flex items-center gap-4 border-b border-border py-4 transition-colors hover:bg-card/50"
                  >
                    <button
                      type="button"
                      onClick={() => handlePlay(track)}
                      className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-muted"
                      aria-label={`Play ${track.title}`}
                    >
                      {track.cover_url ? (
                        <img src={track.cover_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Music className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100">
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Pause className="h-4 w-4 fill-current text-white" />
                        ) : (
                          <Play className="h-4 w-4 fill-current text-white" />
                        )}
                      </span>
                    </button>

                    <Link href={`/track/${track.id}`} className="min-w-0 flex-1 md:grid md:grid-cols-[minmax(12rem,0.45fr)_1fr_auto] md:items-center md:gap-6">
                      <div className="min-w-0">
                        <h2 className="truncate font-display text-lg font-semibold group-hover:text-accent">{track.title}</h2>
                        <p className="truncate text-xs text-muted-foreground">
                          {track.artists?.display_name || track.labels?.name || 'Unknown'}
                        </p>
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground md:mt-0">
                        {[track.genre, track.bpm && `${track.bpm} BPM`, track.musical_key].filter(Boolean).join(' · ')}
                      </p>
                      <span className="mt-2 block font-mono text-sm font-bold md:mt-0">
                        {track.is_free ? 'Free' : `$${Number(track.price).toFixed(2)}`}
                      </span>
                    </Link>

                    {!track.is_free && (
                      <button
                        type="button"
                        onClick={() => handleAddToCart(track)}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                          isInCart(track.id) ? 'text-emerald-600' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        aria-label={`Add ${track.title} to cart`}
                      >
                        {isInCart(track.id) ? <CheckCircle className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                      </button>
                    )}
                    <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent sm:block" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Sticky bottom player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 z-50 flex items-center gap-4">
          {currentTrack.cover_url && (
            <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-12 h-12 rounded object-cover flex-shrink-0" />
          )}
          <div className="flex-shrink-0">
            <p className="font-semibold text-sm">{currentTrack.title}</p>
            <p className="text-xs text-muted-foreground">
              {currentTrack.artists?.display_name || currentTrack.labels?.name}
            </p>
          </div>
          <button
            onClick={() => handlePlay(currentTrack)}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(progress)}</span>
            <div
              className="flex-1 h-1.5 bg-muted rounded cursor-pointer"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect()
                const pct = (e.clientX - rect.left) / rect.width
                if (audioRef.current) audioRef.current.currentTime = pct * duration
              }}
            >
              <div
                className="h-full bg-primary rounded"
                style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
          </div>
          <button onClick={() => { audioRef.current?.pause(); setCurrentTrack(null); setIsPlaying(false) }}>
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      )}
    </div>
  )
}
