'use client'

import Link from 'next/link'
import { Building2, ArrowUpRight } from 'lucide-react'

interface LabelCardProps {
  label: {
    id: string
    name: string
    slug: string
    bio?: string
    description?: string
    logo_url?: string
  }
}

export function LabelCard({ label }: LabelCardProps) {
  const bioText = label.bio || label.description || 'Independent record label.'

  return (
    <Link href={`/labels/${label.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-sm border border-border bg-muted">
        {label.logo_url ? (
          <img
            src={label.logo_url}
            alt={label.name}
            className="img-zoom absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <Building2 className="h-14 w-14 text-foreground/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/95 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] backdrop-blur-md">
            <Building2 className="h-3 w-3" />
            Label
          </span>
        </div>
        <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/95 opacity-0 backdrop-blur-md transition group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 px-0.5">
        <h3 className="font-display text-lg font-semibold tracking-tight truncate group-hover:text-accent transition-colors">
          {label.name}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{bioText}</p>
      </div>
    </Link>
  )
}
