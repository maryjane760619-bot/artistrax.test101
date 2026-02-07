'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FanAuthProvider, useFanAuth } from '@/lib/fan-auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { AudioPlayer } from '@/components/audio-player'
import { Music, ArrowLeft, Trash2, Play } from 'lucide-react'
import Link from 'next/link'

type Track = {
  id: string
  title: string
  audio_url: string
  cover_url: string | null
  duration: number | null
  price: number
  is_free: boolean
  artists: {
    display_name: string
    username: string
  } | null
  labels: {
    name: string
    slug: string
  } | null
}

type PlaylistTrack = {
  id: string
  position: number
  tracks: Track
}

type Playlist = {
  id: string
  name: string
  description: string | null
  cover_url: string | null
  fan_id: string
}

function PlaylistViewContent() {
  const router = useRouter()
  const params = useParams()
  const playlistId = params.id as string
  const { user, loading } = useFanAuth()
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrack[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [queue, setQueue] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/fan/login')
    }

    if (user && playlistId) {
      loadPlaylist()
      loadTracks()
    }
  }, [user, loading, playlistId])

  const loadPlaylist = async () => {
    const { data } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', playlistId)
      .single()

    if (data) {
      setPlaylist(data)
    }
  }

  const loadTracks = async () => {
    const { data } = await supabase
      .from('playlist_tracks')
      .select(`
        id,
        position,
        tracks(
          id,
          title,
          audio_url,
          cover_url,
          duration,
          price,
          is_free,
          artists(display_name, username),
          labels(name, slug)
        )
      `)
      .eq('playlist_id', playlistId)
      .order('position', { ascending: true })

    if (data) {
      setPlaylistTracks(data as PlaylistTrack[])
      
      // Build queue for player
      const trackQueue = data.map((pt: any) => ({
        id: pt.tracks.id,
        title: pt.tracks.title,
        artist: pt.tracks.artists?.display_name || pt.tracks.labels?.name || 'Unknown',
        audioUrl: pt.tracks.audio_url,
        coverUrl: pt.tracks.cover_url || undefined,
        duration: pt.tracks.duration || undefined,
      }))
      setQueue(trackQueue)
      
      if (trackQueue.length > 0 && !currentTrack) {
        setCurrentTrack(data[0].tracks)
      }
    }
  }

  const handleRemoveTrack = async (playlistTrackId: string) => {
    if (!confirm('Remove this track from the playlist?')) return

    const { error } = await supabase
      .from('playlist_tracks')
      .delete()
      .eq('id', playlistTrackId)

    if (!error) {
      loadTracks()
    }
  }

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user || !playlist) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/fan/playlists">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-lg">{playlist.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Playlist Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold mb-2">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-muted-foreground">{playlist.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {playlistTracks.length} tracks
          </p>
        </div>

        {/* Current Player */}
        {currentTrack && queue.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Now Playing</h2>
            <AudioPlayer
              track={{
                id: currentTrack.id,
                title: currentTrack.title,
                artist: currentTrack.artists?.display_name || currentTrack.labels?.name || 'Unknown',
                audioUrl: currentTrack.audio_url,
                coverUrl: currentTrack.cover_url || undefined,
                duration: currentTrack.duration || undefined,
              }}
              queue={queue}
              onTrackChange={(newTrack) => {
                const track = playlistTracks.find(pt => pt.tracks.id === newTrack.id)
                if (track) setCurrentTrack(track.tracks)
              }}
            />
          </div>
        )}

        {/* Track List */}
        {playlistTracks.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No tracks yet</h3>
            <p className="text-muted-foreground mb-6">
              Add some tracks to start building your playlist
            </p>
            <Link href="/">
              <Button>
                Browse Music
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Tracks</h2>
            </div>
            <div className="divide-y divide-border">
              {playlistTracks.map((playlistTrack, index) => {
                const track = playlistTrack.tracks
                const isPlaying = currentTrack?.id === track.id

                return (
                  <div
                    key={playlistTrack.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      isPlaying ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handlePlayTrack(track)}
                        className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center flex-shrink-0"
                      >
                        {isPlaying ? (
                          <span className="text-primary font-semibold">{index + 1}</span>
                        ) : (
                          <Play className="w-4 h-4 text-primary ml-0.5" />
                        )}
                      </button>

                      {track.cover_url && (
                        <img
                          src={track.cover_url}
                          alt={track.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{track.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          {track.artists && (
                            <Link
                              href={`/${track.artists.username}`}
                              className="text-primary hover:underline"
                            >
                              {track.artists.display_name}
                            </Link>
                          )}
                          {track.labels && !track.artists && (
                            <Link
                              href={`/labels/${track.labels.slug}`}
                              className="hover:underline"
                            >
                              {track.labels.name}
                            </Link>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTrack(playlistTrack.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function PlaylistViewPage() {
  return (
    <FanAuthProvider>
      <PlaylistViewContent />
    </FanAuthProvider>
  )
}
