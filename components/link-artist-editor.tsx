'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Loader2, Users, X } from 'lucide-react'

type LinkedArtist = { display_name: string; username: string } | null

export function LinkArtistEditor() {
  const [linkedArtist, setLinkedArtist] = useState<LinkedArtist>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadStatus()
  }, [])

  const authHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${session?.access_token}` }
  }

  const loadStatus = async () => {
    try {
      const res = await fetch('/api/label/link-artist', { headers: await authHeader() })
      const json = await res.json()
      setLinkedArtist(json.linkedArtist || null)
    } catch {
      // fail silently, treat as unlinked
    } finally {
      setLoading(false)
    }
  }

  const handleLink = async () => {
    if (!username.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/label/link-artist', {
        method: 'POST',
        headers: { ...(await authHeader()), 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistUsername: username.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to link')
      setLinkedArtist(json.linkedArtist)
      setUsername('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUnlink = async () => {
    setSaving(true)
    try {
      await fetch('/api/label/link-artist', { method: 'DELETE', headers: await authHeader() })
      setLinkedArtist(null)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6 flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8">
      <CardContent className="pt-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            Linked Artist Profile
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            If you're also an artist who runs this label, link the two profiles so fans can find both.
            Only works if the artist account uses the same email as this label account.
          </p>
        </div>

        {linkedArtist ? (
          <div className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
            <span className="text-sm">
              Linked to <strong>{linkedArtist.display_name}</strong> (@{linkedArtist.username})
            </span>
            <Button variant="outline" size="sm" disabled={saving} onClick={handleUnlink}>
              <X className="w-3.5 h-3.5 mr-1" /> Unlink
            </Button>
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="artistUsername">Artist username</Label>
              <Input
                id="artistUsername"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. joeski"
                className="mt-1"
              />
            </div>
            <Button disabled={saving || !username.trim()} onClick={handleLink}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Link
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
