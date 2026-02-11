'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OwnedBadgeProps {
  trackId: string
  className?: string
}

export function OwnedBadge({ trackId, className }: OwnedBadgeProps) {
  const [isOwned, setIsOwned] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkOwnership()
  }, [trackId])

  const checkOwnership = async () => {
    try {
      const response = await fetch('/api/library')
      
      if (response.ok) {
        const data = await response.json()
        const owned = data.library?.some((item: any) => item.track.id === trackId)
        setIsOwned(owned)
      }
    } catch (err) {
      console.error('Error checking ownership:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !isOwned) return null

  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded",
      className
    )}>
      <CheckCircle2 className="w-3 h-3" />
      OWNED
    </div>
  )
}

/**
 * Optimized version that accepts ownership status as a prop
 * Use this when you already have the ownership data (e.g., from library page)
 */
interface OwnedBadgeSimpleProps {
  isOwned: boolean
  className?: string
}

export function OwnedBadgeSimple({ isOwned, className }: OwnedBadgeSimpleProps) {
  if (!isOwned) return null

  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded",
      className
    )}>
      <CheckCircle2 className="w-3 h-3" />
      OWNED
    </div>
  )
}
