'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Music, Video } from 'lucide-react'

export default function LibraryPage() {
  const [tracks, setTracks] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [tab, setTab] = useState<'tracks' | 'videos'>('tracks')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLibrary()
  }, [])

  const loadLibrary = async () => {
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

    // Fetch tracks
    const tracksRes = await fetch('/api/library', { headers })
    if (tracksRes.ok) {
      const data = await tracksRes.json()
      setTracks(data.library || [])
    }

    // Fetch videos
    const videosRes = await fetch('/api/library/videos', { headers })
    if (videosRes.ok) {
      const data = await videosRes.json()
      setVideos(data.videos || [])
    }

    setLoading(false)
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
            onClick={() => setTab('tracks')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              tab === 'tracks' ? 'bg-green-700 text-white' : 'bg-white border'
            }`}
          >
            <Music className="w-4 h-4" />
            Tracks ({tracks.length})
          </button>
          <button 
            onClick={() => setTab('videos')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              tab === 'videos' ? 'bg-green-700 text-white' : 'bg-white border'
            }`}
          >
            <Video className="w-4 h-4" />
            Videos ({videos.length})
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : tab === 'tracks' ? (
          <div className="space-y-3">
            {tracks.length === 0 ? (
              <p className="text-gray-500">No tracks yet. Go buy some music!</p>
            ) : (
              tracks.map((item: any) => (
                <div key={item.purchaseId} className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold">{item.track?.title}</h3>
                  <p className="text-gray-600">{item.track?.artist?.displayName}</p>
                </div>
              ))
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

        <a href="/fan/dashboard" className="block mt-6 text-green-700">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  )
}