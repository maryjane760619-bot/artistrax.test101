'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Upload, Video } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function UploadVideoPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'music_video'
  })

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.push('/artist/login')
        return
      }
      setUserId(data.user.id)
    })
  }, [router])

  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setVideoPreview(url)
    }
  }

  function handleThumbnailSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!videoFile || !userId) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload video file
      const videoFileName = `${userId}/${Date.now()}-${videoFile.name}`
      const { error: videoUploadError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, videoFile, {
          onUploadProgress: (progress) => {
            setUploadProgress(Math.round((progress.loaded / progress.total) * 50)) // First 50%
          }
        })

      if (videoUploadError) throw videoUploadError

      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(videoFileName)

      // Upload thumbnail if provided
      let thumbnailUrl = null
      if (thumbnailFile) {
        const thumbFileName = `${userId}/thumbnails/${Date.now()}-${thumbnailFile.name}`
        const { error: thumbUploadError } = await supabase.storage
          .from('videos')
          .upload(thumbFileName, thumbnailFile)

        if (thumbUploadError) throw thumbUploadError

        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(thumbFileName)
        
        thumbnailUrl = publicUrl
      }

      setUploadProgress(75)

      // Create video record in database
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          artist_id: userId,
          title: formData.title,
          description: formData.description,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          category: formData.category,
          is_public: true
        })

      if (dbError) throw dbError

      setUploadProgress(100)
      
      // Redirect to videos page
      setTimeout(() => {
        router.push('/artist/videos')
      }, 500)

    } catch (error: any) {
      console.error('Upload error:', error)
      alert(`Failed to upload video: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Upload Video</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Upload */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Video File</h2>
            
            {!videoFile ? (
              <label className="block">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                  required
                />
                <div className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Click to upload video</p>
                  <p className="text-sm text-muted-foreground">
                    MP4, MOV, AVI, or any video format
                  </p>
                </div>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-full"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVideoFile(null)
                      setVideoPreview('')
                    }}
                  >
                    Change Video
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Video Details */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Video Details</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-background border rounded-md"
                placeholder="My Music Video"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-background border rounded-md resize-none"
                placeholder="Tell viewers about your video..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-background border rounded-md"
              >
                <option value="music_video">Music Video</option>
                <option value="behind_the_scenes">Behind the Scenes</option>
                <option value="tutorial">Tutorial</option>
                <option value="live">Live Performance</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Thumbnail (Optional)</h2>
            
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  {thumbnailFile ? thumbnailFile.name : 'Click to upload thumbnail'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Recommended: 1280x720px (16:9)
                </p>
              </div>
            </label>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Uploading...</h3>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">{uploadProgress}%</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={uploading || !videoFile}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </Button>
            <Link href="/artist/videos">
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
