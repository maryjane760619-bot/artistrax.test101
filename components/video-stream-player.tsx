'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { supabase } from '@/lib/supabase'

interface Video {
  id: string
  title: string
  artist: string
  videoUrl: string
  thumbnailUrl?: string
  duration?: number
}

interface VideoPlayerProps {
  video: Video
  mode?: 'stream' | 'public'
  onClose?: () => void
  className?: string
}

export function VideoPlayer({ video, mode = 'stream', onClose, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [streamUrl, setStreamUrl] = useState<string>('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Fetch signed stream URL
  useEffect(() => {
    if (mode === 'stream') {
      fetchStreamUrl()
    }
  }, [video.id, mode])

  const fetchStreamUrl = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}
      const response = await fetch(`/api/stream/video/${video.id}`, { headers })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load video')
      }

      const data = await response.json()
      setStreamUrl(data.streamUrl)
      setLoading(false)
    } catch (err: any) {
      console.error('Stream fetch error:', err)
      setError(err.message || 'Failed to load video')
      setLoading(false)
    }
  }

  // Update video source when stream URL changes
  useEffect(() => {
    if (videoRef.current && streamUrl) {
      videoRef.current.src = streamUrl
    }
  }, [streamUrl])

  // Video event handlers
  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return

    const updateTime = () => setCurrentTime(videoEl.currentTime)
    const updateDuration = () => setDuration(videoEl.duration)
    const handleEnded = () => setIsPlaying(false)
    const handleCanPlay = () => setLoading(false)
    const handleError = () => setError('Error loading video')

    videoEl.addEventListener('timeupdate', updateTime)
    videoEl.addEventListener('loadedmetadata', updateDuration)
    videoEl.addEventListener('ended', handleEnded)
    videoEl.addEventListener('canplay', handleCanPlay)
    videoEl.addEventListener('error', handleError)

    return () => {
      videoEl.removeEventListener('timeupdate', updateTime)
      videoEl.removeEventListener('loadedmetadata', updateDuration)
      videoEl.removeEventListener('ended', handleEnded)
      videoEl.removeEventListener('canplay', handleCanPlay)
      videoEl.removeEventListener('error', handleError)
    }
  }, [])

  const togglePlay = () => {
    if (!videoRef.current) return
    
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return
    
    if (!isFullscreen) {
      videoRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading video...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center bg-muted">
          <div className="text-center text-destructive p-6">
            <p className="font-semibold mb-2">Error loading video</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            {mode === 'stream' && (
              <Button onClick={fetchStreamUrl} variant="outline" size="sm" className="mt-4">
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Video Container */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={mode === 'stream' ? streamUrl : video.videoUrl}
          poster={video.thumbnailUrl}
          className="w-full h-full"
          onClick={togglePlay}
          playsInline
        />
        
        {/* Center Play Button (when paused) */}
        {!isPlaying && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer" onClick={togglePlay}>
            <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
          </div>
        )}

        {/* Close Button */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        )}

        {/* Mode Badge */}
        {mode === 'stream' && (
          <div className="absolute top-4 left-4">
            <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
              OWNED • STREAMING
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{video.title}</h3>
            <p className="text-sm text-muted-foreground">{video.artist}</p>
          </div>
          {mode === 'stream' && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              Stream unlimited
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
              className="w-12 h-12"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2 w-32">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="flex-shrink-0"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {mode === 'stream' && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}