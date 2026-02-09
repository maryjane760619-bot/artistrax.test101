'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface Track {
  id: string
  title: string
  artist: string
  coverArt?: string
}

interface EnhancedAudioPlayerProps {
  track: Track
  mode?: 'stream' | 'download'
  autoPlay?: boolean
  onEnded?: () => void
  onNext?: () => void
  onPrevious?: () => void
}

export function EnhancedAudioPlayer({
  track,
  mode = 'stream',
  autoPlay = false,
  onEnded,
  onNext,
  onPrevious
}: EnhancedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [streamUrl, setStreamUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Fetch stream URL when in stream mode
  useEffect(() => {
    if (mode === 'stream' && track.id) {
      fetchStreamUrl()
    }
  }, [track.id, mode])

  const fetchStreamUrl = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/stream/${track.id}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to load stream')
      }

      const data = await response.json()
      setStreamUrl(data.streamUrl)
      setLoading(false)
    } catch (err) {
      console.error('Stream fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load stream')
      setLoading(false)
    }
  }

  // Update audio source when stream URL changes
  useEffect(() => {
    if (audioRef.current && streamUrl) {
      audioRef.current.src = streamUrl
      if (autoPlay) {
        audioRef.current.play().catch(console.error)
      }
    }
  }, [streamUrl, autoPlay])

  // Time update handler
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      if (onEnded) onEnded()
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onEnded])

  // Media Session API for background controls
  useEffect(() => {
    if ('mediaSession' in navigator && track) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        artwork: track.coverArt ? [
          { src: track.coverArt, sizes: '512x512', type: 'image/jpeg' }
        ] : []
      })

      navigator.mediaSession.setActionHandler('play', () => handlePlayPause())
      navigator.mediaSession.setActionHandler('pause', () => handlePlayPause())
      navigator.mediaSession.setActionHandler('previoustrack', () => onPrevious?.())
      navigator.mediaSession.setActionHandler('nexttrack', () => onNext?.())
    }
  }, [track])

  const handlePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-center text-muted-foreground">
          Loading player...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-center text-destructive">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <audio ref={audioRef} />

      {/* Track Info */}
      <div className="flex items-center gap-4 mb-4">
        {track.coverArt && (
          <img 
            src={track.coverArt} 
            alt={track.title}
            className="w-16 h-16 rounded object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{track.title}</div>
          <div className="text-sm text-muted-foreground truncate">{track.artist}</div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {mode === 'stream' ? '🌐 Streaming' : '📥 Local'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Previous */}
          {onPrevious && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
            >
              <SkipBack className="w-5 h-5" />
            </Button>
          )}

          {/* Play/Pause */}
          <Button
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            className="w-12 h-12"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>

          {/* Next */}
          {onNext && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Volume Control */}
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
    </div>
  )
}
