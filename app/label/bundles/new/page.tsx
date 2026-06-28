'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LabelAuthProvider, useLabelAuth } from '@/lib/label-auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Image as ImageIcon, Loader2, Package } from 'lucide-react'
import Link from 'next/link'

type Track = {
  id: string
  title: string
  price: number
  cover_url: string | null
}

function NewLabelBundleForm() {
  const router = useRouter()
  const { user, loading: authLoading } = useLabelAuth()

  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([])
  const [tracksLoading, setTracksLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [discountPercent, setDiscountPercent] = useState('20')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/label/login')
    }
    if (user) fetchTracks()
  }, [user, authLoading])

  const fetchTracks = async () => {
    if (!user) return
    const { data } = await supabase
      .from('tracks')
      .select('id, title, price, cover_url')
      .eq('label_id', user.id)
      .order('created_at', { ascending: false })
    setTracks(data || [])
    setTracksLoading(false)
  }

  const toggleTrack = (trackId: string) => {
    setSelectedTrackIds(prev =>
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    )
  }

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const selectedTracks = tracks.filter(t => selectedTrackIds.includes(t.id))
  const fullPrice = selectedTracks.reduce((sum, t) => sum + Number(t.price), 0)
  const discountedPrice = fullPrice * (1 - (parseInt(discountPercent) || 0) / 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || selectedTrackIds.length < 2) return

    setSaving(true)
    setError('')

    try {
      let coverUrl = null
      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-bundle-cover.${ext}`
        const { error: uploadError } = await supabase.storage.from('covers').upload(path, coverFile)
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('covers').getPublicUrl(path)
        coverUrl = data.publicUrl
      }

      const { data: bundle, error: bundleError } = await supabase
        .from('bundles')
        .insert({
          label_id: user.id,
          title,
          slug: generateSlug(title),
          description,
          cover_url: coverUrl,
          discount_percent: parseInt(discountPercent) || 20,
        })
        .select('id')
        .single()

      if (bundleError) throw bundleError

      const { error: tracksError } = await supabase.from('bundle_tracks').insert(
        selectedTrackIds.map((trackId, i) => ({
          bundle_id: bundle.id,
          track_id: trackId,
          position: i,
        }))
      )

      if (tracksError) throw tracksError

      router.push('/label/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create bundle')
      setSaving(false)
    }
  }

  if (authLoading || tracksLoading) {
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/label/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </Link>
            <h1 className="font-display text-lg font-semibold">Create a Bundle</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted-foreground mb-8">
          Pick a discounted set of your catalog's tracks. Fans buy them together at one price.
        </p>

        {tracks.length < 2 ? (
          <div className="rounded-md border border-dashed border-border py-12 text-center">
            <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              You need at least 2 uploaded tracks to create a bundle.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <Label>Cover art</Label>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
              {coverPreview ? (
                <div className="mt-2 flex items-center gap-4">
                  <img src={coverPreview} alt="" className="h-20 w-20 rounded-md object-cover border border-border" />
                  <Button type="button" variant="outline" size="sm" onClick={() => coverInputRef.current?.click()}>
                    Change
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="mt-2 flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:border-foreground/40"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            <div>
              <Label htmlFor="title">Bundle title</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1" />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min="1"
                max="90"
                value={discountPercent}
                onChange={e => setDiscountPercent(e.target.value)}
                className="mt-1 w-32"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Select tracks ({selectedTrackIds.length} selected)</Label>
              </div>
              <div className="space-y-1 max-h-80 overflow-y-auto border border-border rounded-md p-2">
                {tracks.map(track => (
                  <label
                    key={track.id}
                    className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-secondary cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTrackIds.includes(track.id)}
                      onChange={() => toggleTrack(track.id)}
                    />
                    <span className="flex-1 text-sm">{track.title}</span>
                    <span className="font-mono text-xs text-muted-foreground">${Number(track.price).toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedTrackIds.length >= 2 && (
              <div className="rounded-md border border-border bg-card px-4 py-3 flex items-center gap-3">
                <span className="font-mono text-lg font-semibold">${discountedPrice.toFixed(2)}</span>
                <span className="font-mono text-sm text-muted-foreground line-through">${fullPrice.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">bundle price for fans</span>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={saving || selectedTrackIds.length < 2 || !title} className="w-full" size="lg">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Create Bundle
            </Button>
          </form>
        )}
      </main>
    </div>
  )
}

export default function NewLabelBundlePage() {
  return (
    <LabelAuthProvider>
      <NewLabelBundleForm />
    </LabelAuthProvider>
  )
}
