'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, Image as ImageIcon, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function ProfileEditPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  // Social links
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [twitter, setTwitter] = useState('')
  const [soundcloud, setSoundcloud] = useState('')
  const [spotify, setSpotify] = useState('')
  
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/artist/login')
    }

    if (user) {
      loadProfile()
    }
  }, [user, authLoading])

  const loadProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setDisplayName(data.display_name || '')
      setBio(data.bio || '')
      setAvatarUrl(data.avatar_url || '')
      setWebsite(data.website || '')
      setInstagram(data.instagram || '')
      setTwitter(data.twitter || '')
      setSoundcloud(data.soundcloud || '')
      setSpotify(data.spotify || '')
    }

    setLoading(false)
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.includes('image')) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError('')
    setSaving(true)
    setSuccess(false)

    try {
      let newAvatarUrl = avatarUrl

      // Upload new avatar if selected
      if (avatarFile) {
        const avatarExt = avatarFile.name.split('.').pop()
        const avatarPath = `${user.id}/avatar-${Date.now()}.${avatarExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('covers')
          .upload(avatarPath, avatarFile)

        if (uploadError) throw uploadError

        const { data: avatarData } = supabase.storage
          .from('covers')
          .getPublicUrl(avatarPath)
        
        newAvatarUrl = avatarData.publicUrl
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('artists')
        .update({
          display_name: displayName,
          bio,
          avatar_url: newAvatarUrl,
          website: website || null,
          instagram: instagram || null,
          twitter: twitter || null,
          soundcloud: soundcloud || null,
          spotify: spotify || null,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess(true)
      setAvatarUrl(newAvatarUrl)
      setAvatarFile(null)
      setAvatarPreview(null)

      setTimeout(() => setSuccess(false), 3000)

    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
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
          <h1 className="text-3xl font-serif font-semibold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">
            Customize your public artist page
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-md text-sm">
              Profile updated successfully!
            </div>
          )}

          {/* Avatar */}
          <div>
            <Label>Profile Picture</Label>
            <div className="mt-2 flex items-center gap-6">
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="w-32 h-32 rounded-full overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center border-2 border-border"
              >
                {avatarPreview || avatarUrl ? (
                  <img 
                    src={avatarPreview || avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG or GIF • Max 2MB
                </p>
              </div>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
          </div>

          {/* Display Name */}
          <div>
            <Label htmlFor="displayName">Artist / Band Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your stage name"
              required
              className="mt-2"
            />
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself, your music, your story..."
              rows={6}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {bio.length} / 1000 characters
            </p>
          </div>

          {/* Social Links */}
          <div>
            <Label className="mb-3 block">Social Links</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="website" className="text-sm text-muted-foreground">
                  Website
                </Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="instagram" className="text-sm text-muted-foreground">
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@username or full URL"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="twitter" className="text-sm text-muted-foreground">
                  Twitter / X
                </Label>
                <Input
                  id="twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@username or full URL"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="soundcloud" className="text-sm text-muted-foreground">
                  SoundCloud
                </Label>
                <Input
                  id="soundcloud"
                  value={soundcloud}
                  onChange={(e) => setSoundcloud(e.target.value)}
                  placeholder="soundcloud.com/username"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="spotify" className="text-sm text-muted-foreground">
                  Spotify
                </Label>
                <Input
                  id="spotify"
                  value={spotify}
                  onChange={(e) => setSpotify(e.target.value)}
                  placeholder="Artist page URL"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={saving || !displayName}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Link href="/artist/dashboard">
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
