'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Video, Plus, Trash2, Eye, EyeOff, Play } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Video = {
  id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  duration: number | null
  view_count: number
  is_public: boolean
  category: string
  created_at: string
}

export default function ArtistVideosPage() {
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.push('/artist/login')
        return
      }
      setUserId(data.user.id)
      setLoading(false)
    })
  }, [router])

  useEffect(() => {
    if (userId) {
      loadVideos()
    }
  }, [userId])

  async function loadVideos() {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('artist_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      console.error('Error loading videos:', error)
    }
  }

  async function toggleVideoVisibility(videoId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ is_public: !currentStatus })
        .eq('id', videoId)

      if (error) throw error
      loadVideos()
    } catch (error) {
      console.error('Error toggling video visibility:', error)
    }
  }

  async function deleteVideo(videoId: string) {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (error) throw error
      loadVideos()
    } catch (error) {
      console.error('Error deleting video:', error)
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Videos</h1>
            <p className="text-muted-foreground">Manage your video content</p>
          </div>
          <Link href="/artist/videos/upload">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </Link>
        </div>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="bg-card border rounded-lg p-12 text-center">
            <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No videos yet</h2>
            <p className="text-muted-foreground mb-6">
              Upload your first video to showcase your work
            </p>
            <Link href="/artist/videos/upload">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload Your First Video
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-card border rounded-lg overflow-hidden">
                {/* Video Thumbnail */}
                <div className="aspect-video bg-muted relative group">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  {!video.is_public && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Private
                    </div>
                  )}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-2">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <span>{video.view_count} views</span>
                    <span>•</span>
                    <span className="capitalize">{video.category?.replace('_', ' ')}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => toggleVideoVisibility(video.id, video.is_public)}
                    >
                      {video.is_public ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Show
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteVideo(video.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8">
          <Link href="/artist/dashboard">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
