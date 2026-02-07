'use client'

import Link from 'next/link'
import type { Artist } from '@/lib/types'

interface ArtistCardProps {
  artist: Artist
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link 
      href={`/artists/${artist.slug}`}
      className="group block"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-muted-foreground/40 to-muted" />
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors duration-300" />
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-serif text-xl text-foreground group-hover:text-muted-foreground transition-colors">
          {artist.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {artist.genres.join(' / ')}
        </p>
      </div>
    </Link>
  )
}
