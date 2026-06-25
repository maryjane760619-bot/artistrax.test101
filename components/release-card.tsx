'use client'

import Link from 'next/link'
import { Play } from 'lucide-react'
import type { Release } from '@/lib/types'

interface ReleaseCardProps {
  release: Release
  size?: 'sm' | 'md' | 'lg'
}

export function ReleaseCard({ release }: ReleaseCardProps) {
  const cover = release.coverArt

  return (
    <Link href={`/releases/${release.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-sm border border-border bg-muted">
        {cover ? (
          <img src={cover} alt={release.title} className="img-zoom h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-full bg-background/95 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] backdrop-blur-md">
            {release.type}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-4 translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
          <div className="min-w-0">
            <div className="font-display text-base font-semibold text-white truncate drop-shadow-md">
              {release.title}
            </div>
            <div className="text-[11px] text-white/80 truncate">{release.artistName}</div>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
            <Play className="h-3.5 w-3.5 fill-current" />
          </span>
        </div>
      </div>

      <div className="mt-3 px-0.5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>{release.type}</span>
          {release.genre && (
            <>
              <span>·</span>
              <span>{release.genre}</span>
            </>
          )}
        </div>
        <h3 className="font-display mt-1 text-lg font-semibold tracking-tight truncate group-hover:text-accent transition-colors">
          {release.title}
        </h3>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground truncate">{release.artistName}</span>
          {release.pricing?.mp3 != null && (
            <span className="font-mono text-xs font-medium tabular-nums shrink-0">
              ${Number(release.pricing.mp3).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
