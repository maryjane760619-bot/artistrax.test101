'use client'

import { useState } from 'react'
import { Play, Video as VideoIcon } from 'lucide-react'

type Video = {
  id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  view_count: number
  category: string
  created_at: string
}

type Props = {
  videos: Video[]
}

export function VideoPlayer({ videos }: Props) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  const handleVideoPlay = (video: Video) => {
    setSelectedVideo(video)
    
    // Increment view count
    fetch('/api/videos/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: video.id })
    }).catch(err => console.error('Failed to increment view:', err))
  }

  if (videos.length === 0) return null

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-semibold">
          Videos ({videos.length})
        </h2>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-background rounded-lg overflow-hidden">
              <div className="aspect-video bg-black">
                <video
                  src={selectedVideo.video_url}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2">{selectedVideo.title}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span>{formatViews(selectedVideo.view_count)} views</span>
                  <span>•</span>
                  <span>{formatDate(selectedVideo.created_at)}</span>
                  <span>•</span>
                  <span className="capitalize">{selectedVideo.category.replace('_', ' ')}</span>
                </div>
                {selectedVideo.description && (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {selectedVideo.description}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedVideo(null)}
              className="mt-4 text-white/80 hover:text-white text-sm"
            >
              Close (Esc)
            </button>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => handleVideoPlay(video)}
            className="bg-card border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-muted relative group">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <VideoIcon className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-3">
              <h3 className="font-semibold line-clamp-2 mb-1">{video.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatViews(video.view_count)} views</span>
                <span>•</span>
                <span>{formatDate(video.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
