'use client'

import Link from 'next/link'
import { Play } from 'lucide-react'
import type { Release } from '@/lib/types'
import { useState } from 'react'

interface ReleaseCardProps {
  release: Release
  size?: 'sm' | 'md' | 'lg'
}

export function ReleaseCard({ release, size = 'md' }: ReleaseCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const sizeClasses = {
    sm: 'w-full',
    md: 'w-full',
    lg: 'w-full'
  }

  return (
    <Link 
      href={`/releases/${release.slug}`}
      className={`group block ${sizeClasses[size]}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-muted-foreground/30 to-muted" />
        <div 
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/60"
        >
          <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center">
            <Play className="w-6 h-6 text-background ml-1" />
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-foreground group-hover:text-muted-foreground transition-colors truncate">
          {release.title}
        </h3>
        <p className="text-sm text-muted-foreground truncate">{release.artistName}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="uppercase">{release.type}</span>
          <span>•</span>
          <span>{release.genre}</span>
        </div>
        <p className="text-sm font-medium text-foreground">
          From ${release.pricing.mp3.toFixed(2)}
        </p>
      </div>
    </Link>
  )
}
