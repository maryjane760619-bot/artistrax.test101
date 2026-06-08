'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Music, Video, Play, Pause, Loader2 } from 'lucide-react'

export default function LibraryPage() {
  const [tracks, setTracks] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [tab, setTab] = useState<'tracks' | 'videos'>('tracks')
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    loadLibrary()
  }, [])

  const loadLibrary = async () => {
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

    const tracksRes = await fetch('/api/library', { headers })
    if (tracksRes.ok) {
      const data = await tracksRes.json()
      setTracks(data.library || [])
    }

    const videosRes = await fetch('/api/library/videos', { headers })
    if (videosRes.ok) {
      const data = await videosRes.json()
      setVideos(data.videos || [])
    }

    setLoading(false)
  }

  const togglePlay = async (item: any) => {
    const trackId = item.track?.id || item.track_id

    // If clicking the already-playing track, toggle pause/play
    if (playingId === trackId && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
      return
    }

    // Stop current playback
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    setPlayingId(trackId)
    setIsPlaying(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}

      const res = await fetch(`/api/stream/${trackId}`, { headers })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to load stream')
        setPlayingId(null)
        return
      }

      const data = await res.json()

      // Stop any existing playback
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      const audio = new Audio(data.streamUrl)
      audioRef.current = audio

      // Attach side-effect listeners before playing
      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        setPlayingId(null)
      })

      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e)
        alert('Failed to play audio')
        setPlayingId(null)
      })

      // Play immediately (click = user gesture, autoplay allowed)
      await audio.play()
      setIsPlaying(true)
    } catch (err) {
      alert('Failed to load stream')
      setPlayingId(null)
    }
  }

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setPlayingId(null)
    setIsPlaying(false)
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Your Library</h1>
        <p className="text-gray-600 mb-6">
          {tracks.length + videos.length} items
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setTab('tracks'); stopPlayback() }}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              tab === 'tracks' ? 'bg-green-700 text-white' : 'bg-white border'
            }`}
          >
            <Music className="w-4 h-4" />
            Tracks ({tracks.length})
          </button>
          <button
            onClick={() => { setTab('videos'); stopPlayback() }}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              tab === 'videos' ? 'bg-green-700 text-white' : 'bg-white border'
            }`}
          >
            <Video className="w-4 h-4" />
            Videos ({videos.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </div>
        ) : tab === 'tracks' ? (
          <div className="space-y-3">
            {tracks.length === 0 ? (
              <p className="text-gray-500">No tracks yet. Go buy some music!</p>
            ) : (
              tracks.map((item: any, idx: number) => {
                const trackId = item.track?.id || item.track_id;
                const isThisPlaying = playingId === trackId;
                return (
                  <div
                    key={item.purchaseId || idx}
                    className={`bg-white p-4 rounded shadow flex items-center gap-4 ${
                      isThisPlaying ? 'ring-2 ring-green-500' : ''
                    }`}
                  >
                    <button
                      onClick={() => togglePlay(item)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isThisPlaying
                          ? 'bg-green-700 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {isThisPlaying && isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{item.track?.title}</h3>
                      <p className="text-gray-600 text-sm truncate">
                        {item.track?.artist?.displayName || item.artist_name || 'Unknown'}
                      </p>
                    </div>
                    {isThisPlaying && isPlaying && (
                      <div className="flex gap-0.5 items-end h-4">
                        <span className="w-1 bg-green-600 rounded-full h-3 animate-bounce" style={{animationDelay: '0ms'}} />
                        <span className="w-1 bg-green-600 rounded-full h-4 animate-bounce" style={{animationDelay: '150ms'}} />
                        <span className="w-1 bg-green-600 rounded-full h-2 animate-bounce" style={{animationDelay: '300ms'}} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {videos.length === 0 ? (
              <p className="text-gray-500">No videos yet. Subscribe to artists!</p>
            ) : (
              videos.map((video: any) => (
                <div key={video.id} className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold">{video.title}</h3>
                  <p className="text-gray-600">{video.artist}</p>
                </div>
              ))
            )}
          </div>
        )}

        <a href="/fan/dashboard" className="block mt-6 text-green-700 hover:underline">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  )
}