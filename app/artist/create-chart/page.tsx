'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, GripVertical, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Track = {
  id: string
  title: string
  audio_url: string
  cover_url: string | null
  artists: {
    display_name: string
  } | null
  labels: {
    name: string
  } | null
}

type ChartTrack = {
  track: Track
  position: number
  note: string
}

export default function CreateChartPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [myTracks, setMyTracks] = useState<Track[]>([])
  const [chartTracks, setChartTracks] = useState<ChartTrack[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/artist/login')
    }

    if (user) {
      loadMyTracks()
    }
  }, [user, authLoading])

  const loadMyTracks = async () => {
    if (!user) return

    const { data } = await supabase
      .from('tracks')
      .select('id, title, audio_url, cover_url, artists(display_name), labels(name)')
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false })

    setMyTracks(data || [])
  }

  const addTrack = (track: Track) => {
    if (chartTracks.length >= 10) {
      setError('Maximum 10 tracks per chart')
      return
    }

    if (chartTracks.some(ct => ct.track.id === track.id)) {
      setError('Track already in chart')
      return
    }

    setChartTracks([
      ...chartTracks,
      { track, position: chartTracks.length + 1, note: '' }
    ])
    setError('')
  }

  const removeTrack = (trackId: string) => {
    const newTracks = chartTracks
      .filter(ct => ct.track.id !== trackId)
      .map((ct, index) => ({ ...ct, position: index + 1 }))
    setChartTracks(newTracks)
  }

  const moveTrack = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= chartTracks.length) return

    const newTracks = [...chartTracks]
    const temp = newTracks[index]
    newTracks[index] = newTracks[newIndex]
    newTracks[newIndex] = temp

    // Reassign positions
    newTracks.forEach((ct, i) => ct.position = i + 1)
    setChartTracks(newTracks)
  }

  const updateNote = (trackId: string, note: string) => {
    setChartTracks(chartTracks.map(ct => 
      ct.track.id === trackId ? { ...ct, note } : ct
    ))
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || chartTracks.length === 0) return

    setError('')
    setSaving(true)

    try {
      // Create chart
      const { data: chart, error: chartError } = await supabase
        .from('dj_charts')
        .insert({
          artist_id: user.id,
          title,
          description: description || null,
          slug: generateSlug(title),
          is_published: true,
        })
        .select()
        .single()

      if (chartError) throw chartError

      // Add tracks to chart
      const chartTracksData = chartTracks.map(ct => ({
        chart_id: chart.id,
        track_id: ct.track.id,
        position: ct.position,
        note: ct.note || null,
      }))

      const { error: tracksError } = await supabase
        .from('chart_tracks')
        .insert(chartTracksData)

      if (tracksError) throw tracksError

      // Success! Redirect to dashboard
      router.push('/artist/dashboard')

    } catch (err: any) {
      setError(err.message || 'Failed to create chart')
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/artist/dashboard" className="text-2xl font-serif font-semibold">
              artistrax
            </Link>
            <Link href="/artist/dashboard">
              <Button variant="ghost" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold mb-2">Create DJ Chart</h1>
          <p className="text-muted-foreground">
            Share your current Top 10 with fans
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Chart Details + My Tracks */}
          <div className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="title">Chart Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Top 10 - February 2026"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="My current rotation..."
                rows={3}
                className="mt-2"
              />
            </div>

            {/* My Tracks */}
            <div>
              <Label>Add Tracks from Your Uploads</Label>
              <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
                {myTracks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tracks uploaded yet. Upload tracks first!
                  </p>
                ) : (
                  myTracks.map(track => (
                    <div 
                      key={track.id}
                      className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{track.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {track.artists?.display_name || track.labels?.name || 'Unknown'}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addTrack(track)}
                        disabled={chartTracks.some(ct => ct.track.id === track.id)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Chart Preview */}
          <div>
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">
                Chart Preview ({chartTracks.length}/10)
              </h2>

              {chartTracks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Add tracks to your chart
                </p>
              ) : (
                <div className="space-y-3">
                  {chartTracks.map((ct, index) => (
                    <div key={ct.track.id} className="bg-background border border-border rounded-lg p-3">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                          {ct.position}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{ct.track.title}</div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => moveTrack(index, 'up')}
                            disabled={index === 0}
                          >
                            ▲
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => moveTrack(index, 'down')}
                            disabled={index === chartTracks.length - 1}
                          >
                            ▼
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeTrack(ct.track.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Input
                        placeholder="Optional note about this track..."
                        value={ct.note}
                        onChange={(e) => updateNote(ct.track.id, e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!title || chartTracks.length === 0 || saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish DJ Chart'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
