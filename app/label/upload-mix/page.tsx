'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LabelAuthProvider, useLabelAuth } from '@/lib/label-auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Music, Image as ImageIcon, X, Loader2, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface TracklistRow {
  timestamp: string // mm:ss as typed by the user
  title: string
  artist: string
}

function parseTimestamp(ts: string): number {
  const parts = ts.split(':').map(p => parseInt(p, 10) || 0)
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return parseInt(ts, 10) || 0
}

function UploadMixForm() {
  const router = useRouter()
  const { user, loading: authLoading } = useLabelAuth()

  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [artistName, setArtistName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0')
  const [isFree, setIsFree] = useState(true)
  const [genre, setGenre] = useState('')

  const [tracklist, setTracklist] = useState<TracklistRow[]>([
    { timestamp: '0:00', title: '', artist: '' },
  ])

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  const audioInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/label/login')
    }
  }, [user, authLoading])

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      if (!title) setTitle(file.name.replace(/\.(mp3|wav|flac)$/i, ''))
    }
  }

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const updateRow = (index: number, field: keyof TracklistRow, value: string) => {
    setTracklist(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  const addRow = () => {
    setTracklist(prev => [...prev, { timestamp: '', title: '', artist: '' }])
  }

  const removeRow = (index: number) => {
    setTracklist(prev => prev.filter((_, i) => i !== index))
  }

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise(resolve => {
      const audio = document.createElement('audio')
      audio.src = URL.createObjectURL(file)
      audio.addEventListener('loadedmetadata', () => resolve(audio.duration))
      audio.addEventListener('error', () => resolve(0))
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !audioFile) return

    setError('')
    setUploading(true)
    setUploadProgress(10)

    try {
      const audioExt = audioFile.name.split('.').pop()
      const audioPath = `${user.id}/${Date.now()}-${generateSlug(title)}.${audioExt}`

      setUploadProgress(30)
      const { error: audioError } = await supabase.storage.from('audio').upload(audioPath, audioFile)
      if (audioError) throw audioError

      setUploadProgress(50)

      let coverUrl = null
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop()
        const coverPath = `${user.id}/${Date.now()}-cover.${coverExt}`
        const { error: coverError } = await supabase.storage.from('covers').upload(coverPath, coverFile)
        if (coverError) throw coverError
        const { data: coverData } = supabase.storage.from('covers').getPublicUrl(coverPath)
        coverUrl = coverData.publicUrl
      }

      setUploadProgress(70)

      const duration = await getAudioDuration(audioFile)
      const { data: audioData } = supabase.storage.from('audio').getPublicUrl(audioPath)

      setUploadProgress(85)

      const cleanTracklist = tracklist
        .filter(row => row.title.trim())
        .map(row => ({
          timestamp_seconds: parseTimestamp(row.timestamp),
          title: row.title.trim(),
          artist: row.artist.trim() || null,
        }))

      const { error: dbError } = await supabase.from('tracks').insert({
        label_id: user.id,
        title,
        slug: generateSlug(title),
        description: artistName ? `Artist: ${artistName}\n\n${description}` : description,
        audio_url: audioData.publicUrl,
        cover_url: coverUrl,
        duration: Math.floor(duration),
        file_size: audioFile.size,
        format: audioExt as 'mp3' | 'flac' | 'wav',
        price: isFree ? 0 : parseFloat(price),
        is_free: isFree,
        genre: genre || null,
        is_mix: true,
        tracklist: cleanTracklist.length > 0 ? cleanTracklist : null,
      })

      if (dbError) throw dbError

      setUploadProgress(100)
      setTimeout(() => router.push('/label/dashboard'), 500)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
      setUploading(false)
      setUploadProgress(0)
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/label/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </Link>
            <h1 className="font-display text-lg font-semibold">Upload a DJ Mix</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted-foreground mb-8">
          One long-form mix, with an optional tracklist your listeners can browse and jump to —
          like a SoundCloud mix page.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Audio */}
          <div>
            <Label>Mix audio file</Label>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleAudioSelect}
            />
            {audioFile ? (
              <div className="mt-2 flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-primary" />
                  <span className="text-sm">{audioFile.name}</span>
                </div>
                <button type="button" onClick={() => setAudioFile(null)}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="mt-2 w-full rounded-md border border-dashed border-border py-10 text-center text-sm text-muted-foreground hover:border-foreground/40"
              >
                <Upload className="w-5 h-5 mx-auto mb-2" />
                Click to select the mix (MP3, WAV, FLAC)
              </button>
            )}
          </div>

          {/* Cover */}
          <div>
            <Label>Cover art</Label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverSelect}
            />
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

          {/* Title / artist / description */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="artistName">Artist / DJ name</Label>
            <Input
              id="artistName"
              value={artistName}
              onChange={e => setArtistName(e.target.value)}
              className="mt-1"
              placeholder="Who recorded this mix?"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mt-1"
              placeholder="Recorded live at... / A deep house journey through..."
            />
          </div>

          {/* Pricing */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                id="isFree"
                checked={isFree}
                onChange={e => setIsFree(e.target.checked)}
              />
              <Label htmlFor="isFree">Free to stream/download</Label>
            </div>
            {!isFree && (
              <Input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="Price"
              />
            )}
          </div>

          {/* Tracklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Tracklist (optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRow}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add track
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Timestamp format: mm:ss (e.g. 4:32) or hh:mm:ss for longer mixes.
            </p>
            <div className="space-y-2">
              {tracklist.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={row.timestamp}
                    onChange={e => updateRow(i, 'timestamp', e.target.value)}
                    placeholder="0:00"
                    className="w-20 font-mono text-sm"
                  />
                  <Input
                    value={row.title}
                    onChange={e => updateRow(i, 'title', e.target.value)}
                    placeholder="Track title"
                    className="flex-1"
                  />
                  <Input
                    value={row.artist}
                    onChange={e => updateRow(i, 'artist', e.target.value)}
                    placeholder="Artist (optional)"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {uploading && (
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <Button type="submit" disabled={!audioFile || uploading} className="w-full" size="lg">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
              </>
            ) : (
              'Publish Mix'
            )}
          </Button>
        </form>
      </main>
    </div>
  )
}

export default function LabelUploadMixPage() {
  return (
    <LabelAuthProvider>
      <UploadMixForm />
    </LabelAuthProvider>
  )
}
