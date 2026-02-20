'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Download, Clock, Music, Video, Library as LibraryIcon } from 'lucide-react'
import Link from 'next/link'

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
}

interface Video {
  id: string
  title: string
  thumbnailUrl: string
  duration: number
  artist: string
  artistId: string
  viewCount: number
}

export default function LibraryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/fan/login')
      return
    }
    setUser(user)
    fetchLibrary()
  }

  const fetchLibrary = async () => {
    try {
      setLoading(true)
      
      // Fetch tracks
      const tracksResponse = await fetch('/api/library')
      if (tracksResponse.ok) {
        const data = await tracksResponse.json()
        setTracks(data.library?.map((item: any) => item.track) || [])
      }

      // Fetch videos
      const videosResponse = await fetch('/api/library/videos')
      if (videosResponse.ok) {
        const data = await videosResponse.json()
        setVideos(data.videos || [])
      }
    } catch (err: any) {
      console.error('Error fetching library:', err)
      setError(err.message || 'Failed to load library')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const totalItems = tracks.length + videos.length

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
            {totalItems} {totalItems === 1 ? 'item' : 'items'} • Stream unlimited • Download anytime
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {totalItems === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <LibraryIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Your library is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Purchase tracks or subscribe to artists to build your collection.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="bg-green-700 hover:bg-green-800"
            >
              Browse Music
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="tracks" className="space-y-6">
            <TabsList className="bg-white">
              <TabsTrigger value="tracks" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                Tracks ({tracks.length})
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Videos ({videos.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tracks" className="space-y-4">
              {tracks.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <Music className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No tracks yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {tracks.map((track) => (
                    <div
                      key={track.id}
                      className="bg-white rounded-lg shadow-md p-6 flex items-center gap-6"
                    >
                      <img
                        src={track.coverUrl || '/placeholder-cover.png'}
                        alt={track.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold text-gray-800">{track.title}</h3>
                        <p className="text-gray-600">{track.artist?.displayName}</p>
                        <p className="text-sm text-gray-500">{formatDuration(track.duration)}</p>
                      </div>
                      <Button className="bg-green-700 hover:bg-green-800">
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos" className="space-y-4">
              {videos.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No videos yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Subscribe to artists to see their videos here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      <div className="aspect-video bg-gray-200 flex items-center justify-center">
                        <Video className="w-12 h-12 text-gray-400" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800">{video.title}</h3>
                        <p className="text-gray-600 text-sm">{video.artist}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDuration(video.duration)} • {video.viewCount} views
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}