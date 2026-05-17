'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/lib/cart-context'
import { Music, ShoppingCart, CheckCircle, Play, Pause, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GENRES } from '@/lib/genres'

export default function ReleasesPage() {
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGenre, setSelectedGenre] = useState('')
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
    q.then(({ data }) => {
      setTracks(data || [])
      setLoading(false)
    })
  }, [selectedGenre])

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <audio ref={audioRef} />

      <main className="pt-20 md:pt-24 pb-32">
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="font-serif text-4xl md:text-5xl mb-4">New Releases</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mb-6">
                Browse the latest tracks from our artists and labels.
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

            {loading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : tracks.length === 0 ? (
              <div className="text-muted-foreground">No tracks yet.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tracks.map(track => (
                  <div key={track.id} className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-colors group">
                    {/* Cover art with play overlay */}
                    <div
                      className="aspect-square bg-muted flex items-center justify-center overflow-hidden relative cursor-pointer"
                      onClick={() => handlePlay(track)}
                    >
                      {track.cover_url ? (
                        <img
                          src={track.cover_url}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Music className="w-12 h-12 text-muted-foreground" />
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Pause className="w-10 h-10 text-white drop-shadow" />
                        ) : (
                          <Play className="w-10 h-10 text-white drop-shadow" />
                        )}
                      </div>
                      {currentTrack?.id === track.id && (
                        <div className="absolute bottom-2 left-2 right-2 h-0.5 bg-white/30 rounded">
                          <div
                            className="h-full bg-primary rounded"
                            style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <Link href={`/track/${track.id}`}>
                        <p className="font-semibold text-sm truncate hover:underline">{track.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {track.artists?.display_name || track.labels?.name || 'Unknown'}
                        </p>
                        {(track.bpm || track.musical_key) && (
                          <p className="text-xs text-muted-foreground/70 mt-0.5">
                            {[track.bpm && `${track.bpm} BPM`, track.musical_key].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        <p className="text-xs font-medium text-primary mt-1">
                          {track.is_free ? 'Free' : `$${Number(track.price).toFixed(2)}`}
                        </p>
                      </Link>
                      {!track.is_free && (
                        <Button
                          size="sm"
                          variant={isInCart(track.id) ? 'outline' : 'default'}
                          className="w-full mt-2 h-8 text-xs"
                          onClick={() => handleAddToCart(track)}
                        >
                          {isInCart(track.id) ? (
                            <><CheckCircle className="w-3 h-3 mr-1" />In Cart</>
                          ) : (
                            <><ShoppingCart className="w-3 h-3 mr-1" />Add to Cart</>
                          )}
                        </Button>
                      )}
                    </div>
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
