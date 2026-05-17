'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Music, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { SubscriptionGate } from '@/components/subscription-gate'
import { GENRES, MUSICAL_KEYS } from '@/lib/genres'

export default function UploadTrackPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0')
  const [isFree, setIsFree] = useState(true)
  const [genre, setGenre] = useState('')
  const [bpm, setBpm] = useState('')
  const [musicalKey, setMusicalKey] = useState('')
  
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  
  const audioInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/artist/login')
    }
    
    if (user) {
      fetchSubscriptionData()
    }
  }, [user, authLoading])
  
  const fetchSubscriptionData = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('artists')
      .select('subscription_status, subscription_tier, trial_ends_at, subscription_expires_at')
      .eq('id', user.id)
      .single()
    
    setSubscriptionData(data)
  }

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && (file.type.includes('audio') || file.name.match(/\.(mp3|wav|flac)$/i))) {
      setAudioFile(file)
      if (!title) {
        // Auto-populate title from filename
        const name = file.name.replace(/\.(mp3|wav|flac)$/i, '')
        setTitle(name)
      }
    }
  }

  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.includes('image')) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      if (!title) {
        const name = file.name.replace(/\.(mp3|wav|flac)$/i, '')
        setTitle(name)
      }
    }
  }

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !audioFile) return

    setError('')
    setUploading(true)
    setUploadProgress(10)

    try {
      // Upload audio file
      const audioExt = audioFile.name.split('.').pop()
      const audioPath = `${user.id}/${Date.now()}-${generateSlug(title)}.${audioExt}`
      
      setUploadProgress(30)
      const { error: audioError } = await supabase.storage
        .from('audio')
        .upload(audioPath, audioFile)

      if (audioError) throw audioError

      setUploadProgress(50)

      // Upload cover if provided
      let coverUrl = null
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop()
        const coverPath = `${user.id}/${Date.now()}-cover.${coverExt}`
        
        const { error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverPath, coverFile)

        if (coverError) throw coverError

        const { data: coverData } = supabase.storage
          .from('covers')
          .getPublicUrl(coverPath)
        
        coverUrl = coverData.publicUrl
      }

      setUploadProgress(70)

      // Get audio duration (browser API)
      const duration = await getAudioDuration(audioFile)

      // Get public URL
      const { data: audioData } = supabase.storage
        .from('audio')
        .getPublicUrl(audioPath)

      setUploadProgress(80)

      // Save to database
      const { error: dbError } = await supabase.from('tracks').insert({
        artist_id: user.id,
        title,
        slug: generateSlug(title),
        description: description || null,
        audio_url: audioData.publicUrl,
        cover_url: coverUrl,
        duration: Math.floor(duration),
        file_size: audioFile.size,
        format: audioExt as 'mp3' | 'flac' | 'wav',
        price: isFree ? 0 : parseFloat(price),
        is_free: isFree,
        genre: genre || null,
        bpm: bpm ? parseInt(bpm) : null,
        musical_key: musicalKey || null,
      })

      if (dbError) throw dbError

      setUploadProgress(100)

      // Success! Redirect to dashboard
      setTimeout(() => {
        router.push('/artist/dashboard')
      }, 500)

    } catch (err: any) {
      setError(err.message || 'Upload failed')
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio')
      audio.src = URL.createObjectURL(file)
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration)
      })
    })
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
      {/* Header */}
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold mb-2">Upload Track</h1>
          <p className="text-muted-foreground">
            Share your music with the world
          </p>
        </div>

        <SubscriptionGate
          accountType="artist"
          subscriptionStatus={subscriptionData?.subscription_status}
          trialEndsAt={subscriptionData?.trial_ends_at}
          subscriptionExpiresAt={subscriptionData?.subscription_expires_at}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Audio File Upload */}
          <div>
            <Label>Audio File *</Label>
            <div
              onDrop={handleAudioDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => audioInputRef.current?.click()}
              className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              {audioFile ? (
                <div className="flex items-center justify-center gap-3">
                  <Music className="w-6 h-6 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">{audioFile.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setAudioFile(null)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">
                    Drop your audio file here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports MP3, WAV, FLAC • Max 100MB
                  </p>
                </div>
              )}
            </div>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/mpeg,audio/wav,audio/flac,.mp3,.wav,.flac"
              onChange={handleAudioSelect}
              className="hidden"
            />
          </div>

          {/* Cover Art Upload */}
          <div>
            <Label>Cover Art</Label>
            <div className="mt-2 flex gap-4">
              <div
                onDrop={handleCoverDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => coverInputRef.current?.click()}
                className="w-40 h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors overflow-hidden"
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Click to add</span>
                  </div>
                )}
              </div>
              {coverFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCoverFile(null)
                    setCoverPreview(null)
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverSelect}
              className="hidden"
            />
          </div>

          {/* Track Details */}
          <div>
            <Label htmlFor="title">Track Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Track"
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
              placeholder="Tell people about your track..."
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Genre / BPM / Key */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="genre">Genre</Label>
              <select
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select genre</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="bpm">BPM</Label>
              <Input
                id="bpm"
                type="number"
                min="40"
                max="250"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="128"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="musicalKey">Key</Label>
              <select
                id="musicalKey"
                value={musicalKey}
                onChange={(e) => setMusicalKey(e.target.value)}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select key</option>
                {MUSICAL_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <Label>Pricing</Label>
            <div className="mt-2 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isFree}
                  onChange={() => setIsFree(true)}
                  className="w-4 h-4"
                />
                <span>Free Download</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isFree}
                  onChange={() => setIsFree(false)}
                  className="w-4 h-4"
                />
                <span>Set a Price</span>
              </label>
              {!isFree && (
                <div className="ml-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.50"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="1.99"
                      className="w-32"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum $0.50
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={!audioFile || !title || uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Publish Track'
              )}
            </Button>
            <Link href="/artist/dashboard">
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
        </SubscriptionGate>
      </main>
    </div>
  )
}
