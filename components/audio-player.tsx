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
  List
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface Track {
  id: string
  title: string
  artist: string
  audioUrl: string
  coverUrl?: string
  duration?: number
}

interface AudioPlayerProps {
  track: Track
  queue?: Track[]
  onTrackChange?: (track: Track) => void
  className?: string
}

export function AudioPlayer({ track, queue = [], onTrackChange, className }: AudioPlayerProps) {
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

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return

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
    wavesurfer.load(track.audioUrl)

    // Event listeners
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration())
      setIsLoading(false)
      wavesurfer.setVolume(volume)
    })

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime())
    })

    wavesurfer.on('finish', () => {
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

    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      switch(e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          wavesurfer.skip(-5)
          break
        case 'ArrowRight':
          e.preventDefault()
          wavesurfer.skip(5)
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      try {
        wavesurfer.destroy()
      } catch (err) {
        // Ignore abort errors during cleanup
      }
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [track.audioUrl])

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn("bg-card border border-border rounded-lg p-6", className)}>
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
        </div>
      </div>

      {/* Waveform */}
      <div className="mb-4 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded">
            <div className="text-sm text-muted-foreground">Loading waveform...</div>
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
        >
          <Shuffle className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={skipBack}>
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

        <Button variant="ghost" size="icon" onClick={skipForward}>
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
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
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

        {/* Queue Button */}
        {queue.length > 0 && (
          <Button variant="ghost" size="icon-sm">
            <List className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground text-center">
        <kbd className="px-1.5 py-0.5 bg-muted rounded">Space</kbd> Play/Pause • 
        <kbd className="px-1.5 py-0.5 bg-muted rounded ml-2">←/→</kbd> Seek • 
        <kbd className="px-1.5 py-0.5 bg-muted rounded ml-2">M</kbd> Mute
      </div>
    </div>
  )
}
