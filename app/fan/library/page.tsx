'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFanAuth } from '@/lib/fan-auth-context'
import { Button } from '@/components/ui/button'
import { StreamingAudioPlayer } from '@/components/streaming-audio-player'
import { Play, Download, Clock } from 'lucide-react'

interface Track {
  id: string
  title: string
  slug: string
  coverUrl: string
  duration: number
  price: number
  streamingUrl: string
  downloadUrl: string
  artist: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
  }
  stats: {
    playCount: number
    lastPlayed: string | null
  }
}

interface LibraryItem {
  purchaseId: string
  purchasedAt: string
  pricePaid: number
  track: Track
}

export default function LibraryPage() {
  const { fan } = useFanAuth()
  const router = useRouter()
  const [library, setLibrary] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)

  useEffect(() => {
    if (!fan) {
      router.push('/fan/login')
      return
    }

    fetchLibrary()
  }, [fan, router])

  const fetchLibrary = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/library')
      
      if (!response.ok) {
        throw new Error('Failed to fetch library')
      }

      const data = await response.json()
      setLibrary(data.library || [])
    } catch (err: any) {
      console.error('Error fetching library:', err)
      setError(err.message || 'Failed to load library')
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = (track: Track) => {
    setCurrentTrack(track)
  }

  const handleDownload = async (track: Track) => {
    try {
      const response = await fetch(`/api/download/${track.id}`)
      
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${track.artist.displayName} - ${track.title}.wav`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (err: any) {
      console.error('Error downloading:', err)
      alert('Failed to download track')
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your library...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            Your Library
          </h1>
          <p className="text-gray-600">
            {library.length} {library.length === 1 ? 'track' : 'tracks'} owned • Stream unlimited • Download anytime
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Streaming Audio Player */}
        {currentTrack && (
          <div className="mb-8">
            <StreamingAudioPlayer
              track={{
                id: currentTrack.id,
                title: currentTrack.title,
                artist: currentTrack.artist.displayName,
                audioUrl: currentTrack.streamingUrl,
                coverUrl: currentTrack.coverUrl,
                duration: currentTrack.duration
              }}
              mode="stream"
              onClose={() => setCurrentTrack(null)}
              queue={library.map(item => ({
                id: item.track.id,
                title: item.track.title,
                artist: item.track.artist.displayName,
                audioUrl: item.track.streamingUrl,
                coverUrl: item.track.coverUrl,
                duration: item.track.duration
              }))}
              onTrackChange={(nextTrack) => {
                const libraryTrack = library.find(item => item.track.id === nextTrack.id)
                if (libraryTrack) {
                  setCurrentTrack(libraryTrack.track)
                }
              }}
            />
          </div>
        )}

        {library.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Your library is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Purchase tracks to build your collection. Stream unlimited + download lossless.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="bg-green-700 hover:bg-green-800"
            >
              Browse Music
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {library.map((item) => (
              <div
                key={item.purchaseId}
                className="bg-white rounded-lg shadow-md p-6 flex items-center gap-6 hover:shadow-lg transition-shadow"
              >
                {/* Cover Art */}
                <div className="flex-shrink-0">
                  <img
                    src={item.track.coverUrl || '/placeholder-cover.png'}
                    alt={item.track.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                </div>

                {/* Track Info */}
                <div className="flex-grow min-w-0">
                  <h3 className="text-xl font-bold text-gray-800 truncate">
                    {item.track.title}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    by{' '}
                    <a
                      href={`/${item.track.artist.username}`}
                      className="text-green-700 hover:underline"
                    >
                      {item.track.artist.displayName}
                    </a>
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(item.track.duration)}
                    </span>
                    <span>•</span>
                    <span>Purchased {formatDate(item.purchasedAt)}</span>
                    {item.track.stats.playCount > 0 && (
                      <>
                        <span>•</span>
                        <span>Played {item.track.stats.playCount}×</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Button
                    onClick={() => handlePlay(item.track)}
                    className="bg-green-700 hover:bg-green-800 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Stream
                  </Button>
                  <Button
                    onClick={() => handleDownload(item.track)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
