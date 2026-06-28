'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Upload, Music, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { SubscriptionGate } from '@/components/subscription-gate'

type UploadFile = {
  file: File
  title: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

export default function BatchUploadPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFree, setIsFree] = useState(true)
  const [price, setPrice] = useState('1.99')

  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const audioFiles = selectedFiles.filter(file => 
      file.type.includes('audio') || file.name.match(/\.(mp3|wav|flac)$/i)
    )

    const uploadFiles: UploadFile[] = audioFiles.map(file => ({
      file,
      title: file.name.replace(/\.(mp3|wav|flac)$/i, ''),
      status: 'pending',
      progress: 0,
    }))

    setFiles(prev => [...prev, ...uploadFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    const audioFiles = droppedFiles.filter(file => 
      file.type.includes('audio') || file.name.match(/\.(mp3|wav|flac)$/i)
    )

    const uploadFiles: UploadFile[] = audioFiles.map(file => ({
      file,
      title: file.name.replace(/\.(mp3|wav|flac)$/i, ''),
      status: 'pending',
      progress: 0,
    }))

    setFiles(prev => [...prev, ...uploadFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio')
      audio.src = URL.createObjectURL(file)
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration)
      })
      audio.addEventListener('error', () => {
        resolve(0) // Return 0 if we can't get duration
      })
    })
  }

  const uploadSingleFile = async (uploadFile: UploadFile, index: number) => {
    if (!user) return

    // Update status to uploading
    setFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, status: 'uploading' as const, progress: 10 } : f
    ))

    try {
      const { file, title } = uploadFile
      const audioExt = file.name.split('.').pop()
      const audioPath = `${user.id}/${Date.now()}-${generateSlug(title)}.${audioExt}`
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(audioPath, file)

      if (uploadError) throw uploadError

      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, progress: 50 } : f
      ))

      // Get duration
      const duration = await getAudioDuration(file)

      // Get public URL
      const { data: audioData } = supabase.storage
        .from('audio')
        .getPublicUrl(audioPath)

      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, progress: 70 } : f
      ))

      // Save to database
      const { error: dbError } = await supabase.from('tracks').insert({
        artist_id: user.id,
        title,
        slug: generateSlug(title),
        audio_url: audioData.publicUrl,
        duration: Math.floor(duration),
        file_size: file.size,
        format: audioExt as 'mp3' | 'flac' | 'wav',
        price: isFree ? 0 : parseFloat(price) || 0,
        is_free: isFree,
      })

      if (dbError) throw dbError

      // Success!
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'success' as const, progress: 100 } : f
      ))

    } catch (err: any) {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: 'error' as const, 
          progress: 0,
          error: err.message || 'Upload failed'
        } : f
      ))
    }
  }

  const handleUploadAll = async () => {
    if (!user || files.length === 0) return

    setUploading(true)
    setCurrentIndex(0)

    // Upload files sequentially (could be parallel but safer this way)
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'pending') {
        setCurrentIndex(i)
        await uploadSingleFile(files[i], i)
      }
    }

    setUploading(false)

    // Check if all succeeded
    const allSuccess = files.every(f => f.status === 'success')
    if (allSuccess) {
      setTimeout(() => {
        router.push('/artist/dashboard')
      }, 1000)
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

  const pendingCount = files.filter(f => f.status === 'pending').length
  const successCount = files.filter(f => f.status === 'success').length
  const errorCount = files.filter(f => f.status === 'error').length

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold mb-2">Batch Upload</h1>
          <p className="text-muted-foreground">
            Upload multiple tracks at once — edit details later
          </p>
        </div>

        <SubscriptionGate
          accountType="artist"
          subscriptionStatus={subscriptionData?.subscription_status}
          trialEndsAt={subscriptionData?.trial_ends_at}
          subscriptionExpiresAt={subscriptionData?.subscription_expires_at}
        >
        {/* Drop Zone */}
        {files.length === 0 && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors mb-8"
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Drop your audio files here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Select multiple MP3, WAV, or FLAC files
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mpeg,audio/wav,audio/flac,.mp3,.wav,.flac"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Files List */}
        {files.length > 0 && (
          <>
            {/* Summary */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Ready to Upload</h2>
                  <p className="text-sm text-muted-foreground">
                    {files.length} tracks • Same price applied to all (edit individually later if needed)
                  </p>
                </div>
                {!uploading && pendingCount > 0 && (
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    Add More Files
                  </Button>
                )}
              </div>

              {!uploading && (
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="rounded"
                    />
                    Free download
                  </label>
                  {!isFree && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>$</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-20 px-2 py-1 rounded border border-border bg-background"
                      />
                      <span className="text-muted-foreground">per track</span>
                    </div>
                  )}
                </div>
              )}

              {(successCount > 0 || errorCount > 0) && (
                <div className="mt-4 flex gap-4 text-sm">
                  {successCount > 0 && (
                    <span className="text-green-600 dark:text-green-400">
                      ✓ {successCount} uploaded
                    </span>
                  )}
                  {errorCount > 0 && (
                    <span className="text-destructive">
                      ✗ {errorCount} failed
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Files */}
            <div className="space-y-3 mb-8">
              {files.map((uploadFile, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-lg p-4 flex items-center gap-4"
                >
                  <div className="flex-shrink-0">
                    {uploadFile.status === 'pending' && (
                      <Music className="w-5 h-5 text-muted-foreground" />
                    )}
                    {uploadFile.status === 'uploading' && (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    )}
                    {uploadFile.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                    {uploadFile.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{uploadFile.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                      {uploadFile.error && (
                        <span className="text-destructive ml-2">• {uploadFile.error}</span>
                      )}
                    </div>
                    {uploadFile.status === 'uploading' && (
                      <div className="mt-2 w-full bg-muted rounded-full h-1">
                        <div
                          className="bg-primary h-1 rounded-full transition-all"
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {uploadFile.status === 'pending' && !uploading && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Button */}
            {pendingCount > 0 && (
              <div className="flex gap-3">
                <Button
                  onClick={handleUploadAll}
                  disabled={uploading}
                  size="lg"
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading {currentIndex + 1} of {files.length}...
                    </>
                  ) : (
                    `Upload All ${files.length} Tracks`
                  )}
                </Button>
                {!uploading && (
                  <Link href="/artist/dashboard">
                    <Button variant="outline" size="lg">
                      Cancel
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {successCount === files.length && errorCount === 0 && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded-lg text-center">
                <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                <p className="font-semibold">All tracks uploaded successfully!</p>
                <p className="text-sm mt-1">Redirecting to dashboard...</p>
              </div>
            )}
          </>
        )}
        </SubscriptionGate>
      </main>
    </div>
  )
}
