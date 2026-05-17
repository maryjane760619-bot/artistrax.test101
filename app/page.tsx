'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, Music, Building2, Play, Pause, ShoppingCart, CheckCircle, X, TrendingUp } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/lib/cart-context'
import { GENRES } from '@/lib/genres'

const TRACK_SELECT = `id, title, price, is_free, cover_url, audio_url, artist_id, label_id, genre, bpm, musical_key, artists(display_name), labels(name)`

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
      artistName: track.artists?.display_name || track.labels?.name || '',
      imageUrl: track.cover_url || undefined,
    })
  }

  const handlePlay = (track: any) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false) }
      else { audioRef.current?.play(); setIsPlaying(true) }
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
        if (!purchases) return

        const counts: Record<string, number> = {}
        purchases.forEach(p => { if (p.track_id) counts[p.track_id] = (counts[p.track_id] || 0) + 1 })
        const allTopIds = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([id]) => id)

        if (allTopIds.length === 0) {
          let q = supabase.from('tracks').select(TRACK_SELECT).order('created_at', { ascending: false }).limit(10)
          if (genreFilter) q = q.eq('genre', genreFilter)
          const { data } = await q
          setTop10(data || [])
        } else {
          // Fetch candidate tracks (get more than 10 so we can genre-filter)
          let q = supabase.from('tracks').select(TRACK_SELECT).in('id', allTopIds.slice(0, 50))
          if (genreFilter) q = q.eq('genre', genreFilter)
          const { data } = await q
          if (data) {
            const sorted = allTopIds
              .map(id => data.find(t => t.id === id))
              .filter(Boolean)
              .slice(0, 10)
            setTop10(sorted as any[])
          }
        }
      })

    // New releases: latest 6, optionally filtered by genre
    let q = supabase.from('tracks').select(TRACK_SELECT).order('created_at', { ascending: false }).limit(6)
    if (selectedGenre) q = q.eq('genre', selectedGenre)
    q.then(({ data }) => setNewReleases(data || []))
  }, [selectedGenre])

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  }

  const TrackRow = ({ track, rank }: { track: any; rank?: number }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
      {rank && <span className="text-2xl font-bold text-muted-foreground/40 w-8 text-right flex-shrink-0">{rank}</span>}
      <div
        className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer bg-muted flex items-center justify-center"
        onClick={() => handlePlay(track)}
      >
        {track.cover_url ? (
          <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <Music className="w-5 h-5 text-muted-foreground" />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          {currentTrack?.id === track.id && isPlaying
            ? <Pause className="w-4 h-4 text-white" />
            : <Play className="w-4 h-4 text-white" />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{track.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {track.artists?.display_name || track.labels?.name || 'Unknown'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {track.bpm && (
            <span className="text-xs text-muted-foreground/70">{track.bpm} BPM</span>
          )}
          {track.musical_key && (
            <span className="text-xs text-muted-foreground/70">{track.musical_key}</span>
          )}
          {track.genre && (
            <span className="text-xs text-primary/60">{track.genre}</span>
          )}
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground flex-shrink-0">
        {track.is_free ? 'Free' : `$${Number(track.price).toFixed(2)}`}
      </span>
      {!track.is_free && (
        <Button
          size="sm"
          variant={isInCart(track.id) ? 'outline' : 'ghost'}
          className="h-8 px-2 flex-shrink-0"
          onClick={() => handleAddToCart(track)}
        >
          {isInCart(track.id)
            ? <CheckCircle className="w-4 h-4 text-green-600" />
            : <ShoppingCart className="w-4 h-4" />}
        </Button>
      )}
    </div>
  )

  return (
    <>
      <Header />
      <audio ref={audioRef} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-32">

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-serif font-semibold tracking-tight mb-8">artistrax</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Premium digital downloads from independent artists & labels
          </p>
          <p className="text-base text-primary/80 italic max-w-2xl mx-auto mb-8">
            Where an artist can be an artist
          </p>
          <Link href="/releases">
            <Button size="lg">Browse All Music →</Button>
          </Link>
        </div>

        {/* Genre filter pills */}
        <div className="flex flex-wrap gap-2 mb-10">
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

        {/* Top 10 + New Releases side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          {/* Top 10 */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-serif font-semibold">
                Artistrax Top 10{selectedGenre ? ` · ${selectedGenre}` : ''}
              </h2>
            </div>
            {top10.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {selectedGenre ? `No chart data for ${selectedGenre} yet.` : 'No chart data yet.'}
              </p>
            ) : (
              <div className="space-y-1">
                {top10.map((track, i) => (
                  <TrackRow key={track.id} track={track} rank={i + 1} />
                ))}
              </div>
            )}
          </div>

          {/* New Releases */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-semibold">
                New Releases{selectedGenre ? ` · ${selectedGenre}` : ''}
              </h2>
              <Link href="/releases" className="text-sm text-primary hover:underline">See all →</Link>
            </div>
            {newReleases.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {selectedGenre ? `No ${selectedGenre} releases yet.` : 'No releases yet.'}
              </p>
            ) : (
              <div className="space-y-1">
                {newReleases.map(track => (
                  <TrackRow key={track.id} track={track} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Join cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link href="/fan/signup" className="bg-card border-2 border-primary rounded-lg p-6 hover:bg-primary/10 transition-colors text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Join as Fan</h3>
            <p className="text-sm text-muted-foreground mb-4">Discover music, build your collection</p>
            <Button size="sm" className="w-full">Sign Up Free</Button>
          </Link>
          <Link href="/artist/signup" className="bg-card border-2 border-border rounded-lg p-6 hover:border-primary transition-colors text-center">
            <Music className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Join as Artist</h3>
            <p className="text-sm text-muted-foreground mb-4">Upload tracks, get paid directly</p>
            <Button variant="outline" size="sm" className="w-full">Get Started</Button>
          </Link>
          <Link href="/label/signup" className="bg-card border-2 border-border rounded-lg p-6 hover:border-primary transition-colors text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Join as Label</h3>
            <p className="text-sm text-muted-foreground mb-4">Manage artists, distribute music</p>
            <Button variant="outline" size="sm" className="w-full">Get Started</Button>
          </Link>
        </div>
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
            <span className="text-xs text-muted-foreground w-10 text-right">{fmt(progress)}</span>
            <div
              className="flex-1 h-1.5 bg-muted rounded cursor-pointer"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect()
                if (audioRef.current) audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration
              }}
            >
              <div className="h-full bg-primary rounded" style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }} />
            </div>
            <span className="text-xs text-muted-foreground w-10">{fmt(duration)}</span>
          </div>
          <button onClick={() => { audioRef.current?.pause(); setCurrentTrack(null); setIsPlaying(false) }}>
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      )}
    </>
  )
}
