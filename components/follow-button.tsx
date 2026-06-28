'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Heart, Loader2 } from 'lucide-react'

type Props = {
  type: 'artist' | 'label'
  id: string
}

export function FollowButton({ type, id }: Props) {
  const [count, setCount] = useState<number | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [type, id])

  const authHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
  }

  const loadStatus = async () => {
    try {
      const res = await fetch(`/api/follow?type=${type}&id=${id}`, { headers: await authHeader() })
      const json = await res.json()
      setCount(json.count ?? 0)
      setIsFollowing(!!json.isFollowing)
    } catch {
      setCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    setPending(true)
    const wasFollowing = isFollowing
    // Optimistic update
    setIsFollowing(!wasFollowing)
    setCount(c => (c ?? 0) + (wasFollowing ? -1 : 1))

    try {
      const res = await fetch('/api/follow', {
        method: wasFollowing ? 'DELETE' : 'POST',
        headers: { ...(await authHeader()), 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      })
      if (!res.ok) {
        const json = await res.json()
        // Revert on failure (e.g. not signed in)
        setIsFollowing(wasFollowing)
        setCount(c => (c ?? 0) + (wasFollowing ? 1 : -1))
        if (res.status === 401) {
          alert('Sign in as a fan to follow.')
        } else {
          alert(json.error || 'Something went wrong')
        }
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      disabled={loading || pending}
      onClick={handleToggle}
      className="gap-1.5"
    >
      {pending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Heart className={`w-3.5 h-3.5 ${isFollowing ? 'fill-current' : ''}`} />
      )}
      {isFollowing ? 'Following' : 'Follow'}
      {count !== null && <span className="opacity-70">· {count}</span>}
    </Button>
  )
}
