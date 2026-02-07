'use client'

import { useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Track {
  id: string
  title: string
  artist: string
  audioUrl: string
  coverUrl?: string
}

interface SimpleAudioPlayerProps {
  track: Track
  className?: string
}

export function SimpleAudioPlayer({ track, className }: SimpleAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className={cn("bg-card border border-border rounded-lg p-4", className)}>
      <div className="flex items-center gap-4">
        {track.coverUrl && (
          <img 
            src={track.coverUrl} 
            alt={track.title}
            className="w-16 h-16 rounded object-cover"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{track.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
        </div>

        <Button
          onClick={togglePlay}
          size="icon"
          variant="default"
          className="flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </Button>
      </div>

      <audio
        ref={audioRef}
        src={track.audioUrl}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        className="w-full mt-3"
        controls
      />
    </div>
  )
}
