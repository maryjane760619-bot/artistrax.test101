'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Artist } from '@/lib/types'

interface ArtistCardProps {
  artist: Artist
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link href={`/${artist.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-sm border border-border bg-muted">
        {artist.image ? (
          <img
            src={artist.image}
            alt={artist.name}
            className="img-zoom absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/95 opacity-0 backdrop-blur-md transition group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 px-0.5">
        <h3 className="font-display text-lg font-semibold tracking-tight truncate group-hover:text-accent transition-colors">
          {artist.name}
        </h3>
        {artist.genres && artist.genres.length > 0 && (
          <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground truncate">
            {artist.genres.join(' · ')}
          </p>
        )}
      </div>
    </Link>
  )
}
