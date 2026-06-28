'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Heart, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  trackId: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
}

export function FavoriteButton({ trackId, className, variant = 'outline', size = 'icon', showLabel = false }: Props) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [trackId])

  const authHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
  }

  const loadStatus = async () => {
    try {
      const res = await fetch(`/api/favorites?trackId=${trackId}`, { headers: await authHeader() })
      const json = await res.json()
      setIsFavorited(!!json.isFavorited)
    } catch {
      setIsFavorited(false)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPending(true)
    const wasFavorited = isFavorited
    setIsFavorited(!wasFavorited)

    try {
      const res = await fetch('/api/favorites', {
        method: wasFavorited ? 'DELETE' : 'POST',
        headers: { ...(await authHeader()), 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      })
      if (!res.ok) {
        setIsFavorited(wasFavorited)
        if (res.status === 401) {
          alert('Sign in as a fan to favorite tracks.')
        }
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      disabled={loading || pending}
      onClick={handleToggle}
      className={cn('gap-1.5', className)}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart className={cn('w-4 h-4', isFavorited && 'fill-current text-red-500')} />
      )}
      {showLabel && (isFavorited ? 'Favorited' : 'Favorite')}
    </Button>
  )
}
