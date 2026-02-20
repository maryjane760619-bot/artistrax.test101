'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Music, Video, Library as LibraryIcon } from 'lucide-react'
import Link from 'next/link'

export default function LibraryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tracks, setTracks] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'tracks' | 'videos'>('tracks')

  useEffect(() => {
    loadLibrary()
  }, [])

  const loadLibrary = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Check auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/fan/login')
        return
      }

      // Load tracks
      const tracksRes = await fetch('/api/library')
      if (tracksRes.ok) {
        const data = await tracksRes.json()
        setTracks(data.library || [])
      }

      // Load videos  
      const videosRes = await fetch('/api/library/videos')
      if (videosRes.ok) {
        const data = await videosRes.json()
        setVideos(data.videos || [])
      }
    } catch (err: any) {
      console.error('Library error:', err)
      setError(err.message || 'Failed to load library')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto"></div>
          <p className="mt-4">Loading library...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
          <Button onClick={loadLibrary}>Retry</Button>
        </div>
      </div>
    )
  }

  const totalItems = tracks.length + videos.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-green-800 mb-2">Your Library</h1>
        <p className="text-gray-600 mb-6">{totalItems} items</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant={activeTab === 'tracks' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tracks')}
            className="flex items-center gap-2"
          >
            <Music className="w-4 h-4" />
            Tracks ({tracks.length})
          </Button>
          <Button 
            variant={activeTab === 'videos' ? 'default' : 'outline'}
            onClick={() => setActiveTab('videos')}
            className="flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            Videos ({videos.length})
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'tracks' && (
          <div className="grid gap-4">
            {tracks.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Music className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No tracks yet</p>
                <Link href="/">
                  <Button className="mt-4 bg-green-700">Browse Music</Button>
                </Link>
              </div>
            ) : (
              tracks.map((item: any) => (
                <div key={item.track?.id || item.id} className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-bold">{item.track?.title || 'Unknown'}</h3>
                  <p className="text-gray-600">{item.track?.artist?.displayName || 'Unknown Artist'}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="grid gap-4">
            {videos.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No videos yet</p>
                <p className="text-sm text-gray-500 mt-2">Subscribe to artists to see their videos</p>
              </div>
            ) : (
              videos.map((video: any) => (
                <div key={video.id} className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-bold">{video.title}</h3>
                  <p className="text-gray-600">{video.artist}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}