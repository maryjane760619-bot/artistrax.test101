'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle,
  Download,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface Track {
  id: string
  title: string
  artist: string
  audioUrl: string
  coverUrl?: string
  duration?: number
}

interface StreamingAudioPlayerProps {
  track: Track
  mode: 'stream' | 'download' // New: streaming vs download mode
  onClose?: () => void
  queue?: Track[]
  onTrackChange?: (track: Track) => void
  className?: string
}

export function StreamingAudioPlayer({ 
  track, 
  mode = 'stream',
  onClose,
  queue = [], 
  onTrackChange, 
  className 
}: StreamingAudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  
  // Streaming-specific state
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [streamToken, setStreamToken] = useState<string | null>(null)
  const [streamExpiresAt, setStreamExpiresAt] = useState<number | null>(null)
  const [playStartTime, setPlayStartTime] = useState<number | null>(null)

  // Fetch signed streaming URL if in stream mode
  useEffect(() => {
    if (mode === 'stream') {
      fetchStreamUrl()
    }
  }, [track.id, mode])

  const fetchStreamUrl = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}
      const response = await fetch(`/api/stream/${track.id}`, { headers })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to fetch stream URL:', error)
        return
      }

      const { streamUrl, token, expiresAt } = await response.json()
      setStreamUrl(streamUrl)
      setStreamToken(token)
      setStreamExpiresAt(new Date(expiresAt).getTime())
    } catch (err) {
      console.error('Error fetching stream URL:', err)
    }
  }

  // Refresh signed URL before it expires (30 min before expiry)
  useEffect(() => {
    if (!streamExpiresAt || mode !== 'stream') return

    const checkExpiry = () => {
      const now = Date.now()
      const timeUntilExpiry = streamExpiresAt - now
      const thirtyMinutes = 30 * 60 * 1000

      // Refresh if less than 30 min remaining
      if (timeUntilExpiry < thirtyMinutes && timeUntilExpiry > 0) {
        console.log('Refreshing stream URL (expires soon)')
        fetchStreamUrl()
      }
    }

    // Check every 5 minutes
    const interval = setInterval(checkExpiry, 5 * 60 * 1000)
    checkExpiry() // Check immediately

    return () => clearInterval(interval)
  }, [streamExpiresAt, mode])

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return
    if (mode === 'stream' && !streamUrl) return // Wait for stream URL

    const audioUrl = mode === 'stream' ? streamUrl! : track.audioUrl

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(31, 78, 61, 0.3)',
      progressColor: '#1F4E3D',
      cursorColor: '#F59E0B',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      cursorWidth: 2,
      height: 80,
      normalize: true,
      backend: 'WebAudio',
    })

    wavesurferRef.current = wavesurfer

    // Load track
    wavesurfer.load(audioUrl)

    // Event listeners
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration())
      setIsLoading(false)
      wavesurfer.setVolume(volume)
    })

    wavesurfer.on('play', () => {
      setPlayStartTime(Date.now())
    })

    wavesurfer.on('pause', () => {
      if (mode === 'stream' && playStartTime) {
        const playDuration = Math.floor((Date.now() - playStartTime) / 1000)
        logStreamPlay(playDuration, false)
        setPlayStartTime(null)
      }
    })

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime())
    })

    wavesurfer.on('finish', () => {
      // Log completed play for streaming
      if (mode === 'stream' && playStartTime) {
        const playDuration = Math.floor((Date.now() - playStartTime) / 1000)
        logStreamPlay(playDuration, true)
        setPlayStartTime(null)
      }

      if (isRepeat) {
        wavesurfer.play()
      } else if (queue.length > 0 && onTrackChange) {
        // Play next track in queue
        const currentIndex = queue.findIndex(t => t.id === track.id)
        const nextIndex = isShuffle 
          ? Math.floor(Math.random() * queue.length)
          : (currentIndex + 1) % queue.length
        onTrackChange(queue[nextIndex])
      } else {
        setIsPlaying(false)
      }
    })

    wavesurfer.on('seeking', (progress) => {
      setCurrentTime(progress * wavesurfer.getDuration())
    })

    return () => {
      try {
        if (wavesurfer && !wavesurfer.isDestroyed) {
          wavesurfer.destroy()
        }
      } catch (err) {
        console.debug('WaveSurfer cleanup:', err)
      }
    }
  }, [track.audioUrl, streamUrl, mode])

  // Log streaming analytics
  const logStreamPlay = async (durationSeconds: number, completed: boolean) => {
    if (mode !== 'stream') return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/stream/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          trackId: track.id,
          durationSeconds,
          completed
        })
      })
    } catch (err) {
      console.error('Error logging stream play:', err)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (!isPlaying || !wavesurferRef.current) return
      
      switch(e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          try {
            wavesurferRef.current.skip(-5)
          } catch (err) {
            // Ignore errors
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          try {
            wavesurferRef.current.skip(5)
          } catch (err) {
            // Ignore errors
          }
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'Escape':
          e.preventDefault()
          if (onClose) onClose()
          break
      }
    }

    if (isPlaying) {
      window.addEventListener('keydown', handleKeyPress)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isPlaying])

  // Update volume
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(isMuted ? 0 : volume)
    }
  }, [volume, isMuted])

  // Update playback rate
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(playbackRate)
    }
  }, [playbackRate])

  const togglePlay = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause()
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
  }, [isMuted])

  const skipForward = useCallback(() => {
    if (queue.length > 0 && onTrackChange) {
      const currentIndex = queue.findIndex(t => t.id === track.id)
      const nextIndex = (currentIndex + 1) % queue.length
      onTrackChange(queue[nextIndex])
    }
  }, [queue, track, onTrackChange])

  const skipBack = useCallback(() => {
    if (currentTime > 3) {
      wavesurferRef.current?.seekTo(0)
    } else if (queue.length > 0 && onTrackChange) {
      const currentIndex = queue.findIndex(t => t.id === track.id)
      const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1
      onTrackChange(queue[prevIndex])
    }
  }, [currentTime, queue, track, onTrackChange])

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/download/${track.id}`)
      
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${track.artist} - ${track.title}.wav`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (err) {
      console.error('Error downloading:', err)
      alert('Failed to download track')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn("bg-card border border-border rounded-lg p-6", className)}>
      {/* Header with Close Button */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {mode === 'stream' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
              STREAMING
            </span>
          )}
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded">
            OWNED
          </span>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Track Info */}
      <div className="flex items-start gap-4 mb-6">
        {track.coverUrl && (
          <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
            <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold truncate">{track.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
          {mode === 'stream' && (
            <p className="text-xs text-green-600 mt-1">
              Stream unlimited • Download anytime
            </p>
          )}
        </div>
      </div>

      {/* Waveform */}
      <div className="mb-4 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded">
            <div className="text-sm text-muted-foreground">
              {mode === 'stream' ? 'Loading stream...' : 'Loading waveform...'}
            </div>
          </div>
        )}
        <div ref={containerRef} className="rounded overflow-hidden" />
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-xs text-muted-foreground mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsShuffle(!isShuffle)}
          className={cn(isShuffle && "text-primary")}
          disabled={queue.length === 0}
        >
          <Shuffle className="w-4 h-4" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={skipBack}
          disabled={queue.length === 0 && currentTime <= 3}
        >
          <SkipBack className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          onClick={togglePlay}
          className="w-12 h-12 bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={skipForward}
          disabled={queue.length === 0}
        >
          <SkipForward className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsRepeat(!isRepeat)}
          className={cn(isRepeat && "text-primary")}
        >
          <Repeat className="w-4 h-4" />
        </Button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center gap-4">
        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            onValueChange={(value) => {
              setVolume(value[0] / 100)
              if (isMuted) setIsMuted(false)
            }}
            max={100}
            step={1}
            className="w-24"
          />
        </div>

        {/* Playback Speed */}
        <div className="flex items-center gap-1">
          {[0.75, 1, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                playbackRate === rate
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Download Button (for streaming mode) */}
        {mode === 'stream' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground text-center">
        <kbd className="px-1.5 py-0.5 bg-muted rounded">Space</kbd> Play/Pause • 
        <kbd className="px-1.5 py-0.5 bg-muted rounded ml-2">←/→</kbd> Seek • 
        <kbd className="px-1.5 py-0.5 bg-muted rounded ml-2">M</kbd> Mute •
        <kbd className="px-1.5 py-0.5 bg-muted rounded ml-2">Esc</kbd> Close
      </div>

      {/* Stream Expiry Warning (dev only) */}
      {mode === 'stream' && streamExpiresAt && process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Stream URL expires: {new Date(streamExpiresAt).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
