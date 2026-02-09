'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { EnhancedAudioPlayer } from '@/components/enhanced-audio-player'
import { Button } from '@/components/ui/button'
import { Play, Download, Music } from 'lucide-react'
import Link from 'next/link'

interface Track {
  id: string
  title: string
  artist_name: string
  artist_id: string
  genre: string
  price: number
  cover_art_url?: string
  audio_url: string
  created_at: string
}

interface LibraryItem {
  purchaseId: string
  purchasedAt: string
  track: Track
  streamCount: number
}

export default function FanLibraryPage() {
  const [library, setLibrary] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [filterGenre, setFilterGenre] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'artist' | 'title'>('recent')

  useEffect(() => {
    fetchLibrary()
  }, [])

  const fetchLibrary = async () => {
    try {
      const response = await fetch('/api/library/purchased')
      
      if (!response.ok) {
        throw new Error('Failed to load library')
      }

      const data = await response.json()
      setLibrary(data.library)
      setLoading(false)
    } catch (err) {
      console.error('Library error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load library')
      setLoading(false)
    }
  }

  const handleDownload = async (track: Track) => {
    try {
      const response = await fetch(`/api/download/${track.id}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${track.artist_name} - ${track.title}.wav`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download track')
    }
  }

  const genres = ['all', ...new Set(library.map(item => item.track.genre).filter(Boolean))]

  const filteredLibrary = library
    .filter(item => filterGenre === 'all' || item.track.genre === filterGenre)
    .sort((a, b) => {
      switch (sortBy) {
        case 'artist':
          return a.track.artist_name.localeCompare(b.track.artist_name)
        case 'title':
          return a.track.title.localeCompare(b.track.title)
        case 'recent':
        default:
          return new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
      }
    })

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading your library...</div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-destructive">{error}</div>
              <Button onClick={fetchLibrary} className="mt-4">
                Try Again
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-semibold mb-2">My Library</h1>
            <p className="text-muted-foreground">
              {library.length} {library.length === 1 ? 'track' : 'tracks'} owned • Stream unlimited or download lossless
            </p>
          </div>

          {/* Filters */}
          {library.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-border">
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">Genre:</span>
                {genres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => setFilterGenre(genre)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filterGenre === genre
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border hover:bg-accent'
                    }`}
                  >
                    {genre === 'all' ? 'All' : genre}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">Sort:</span>
                {[
                  { value: 'recent', label: 'Recent' },
                  { value: 'artist', label: 'Artist' },
                  { value: 'title', label: 'Title' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      sortBy === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border hover:bg-accent'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {library.length === 0 && (
            <div className="text-center py-16">
              <Music className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-4">Your library is empty</h2>
              <p className="text-muted-foreground mb-8">
                Start building your collection by purchasing tracks
              </p>
              <Link href="/labels/siestarecords">
                <Button size="lg">Browse Music</Button>
              </Link>
            </div>
          )}

          {/* Track List */}
          {filteredLibrary.length > 0 && (
            <div className="space-y-4">
              {filteredLibrary.map((item) => (
                <div
                  key={item.purchaseId}
                  className="bg-card border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Cover Art */}
                    {item.track.cover_art_url && (
                      <img
                        src={item.track.cover_art_url}
                        alt={item.track.title}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                      />
                    )}

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.track.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.track.artist_name}
                      </p>
                      {item.track.genre && (
                        <span className="text-xs text-muted-foreground">
                          {item.track.genre}
                        </span>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.streamCount > 0 && (
                          <span>Streamed {item.streamCount}× • </span>
                        )}
                        Purchased {new Date(item.purchasedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setCurrentTrack(item.track)}
                        className="gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Stream
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(item.track)}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current Player */}
          {currentTrack && (
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-50">
              <div className="max-w-7xl mx-auto">
                <EnhancedAudioPlayer
                  track={{
                    id: currentTrack.id,
                    title: currentTrack.title,
                    artist: currentTrack.artist_name,
                    coverArt: currentTrack.cover_art_url
                  }}
                  mode="stream"
                  autoPlay={true}
                  onEnded={() => {
                    // Auto-play next track
                    const currentIndex = filteredLibrary.findIndex(
                      item => item.track.id === currentTrack.id
                    )
                    if (currentIndex < filteredLibrary.length - 1) {
                      setCurrentTrack(filteredLibrary[currentIndex + 1].track)
                    }
                  }}
                  onNext={() => {
                    const currentIndex = filteredLibrary.findIndex(
                      item => item.track.id === currentTrack.id
                    )
                    if (currentIndex < filteredLibrary.length - 1) {
                      setCurrentTrack(filteredLibrary[currentIndex + 1].track)
                    }
                  }}
                  onPrevious={() => {
                    const currentIndex = filteredLibrary.findIndex(
                      item => item.track.id === currentTrack.id
                    )
                    if (currentIndex > 0) {
                      setCurrentTrack(filteredLibrary[currentIndex - 1].track)
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  )
}
