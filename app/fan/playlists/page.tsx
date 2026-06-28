'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FanAuthProvider, useFanAuth } from '@/lib/fan-auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Music, Plus, Trash2, PlayCircle, Globe, Lock, Check } from 'lucide-react'
import Link from 'next/link'

type Playlist = {
  id: string
  name: string
  description: string | null
  cover_url: string | null
  is_public: boolean
  created_at: string
  track_count?: number
}

function PlaylistsContent() {
  const router = useRouter()
  const { user, loading, signOut } = useFanAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/fan/login')
    }

    if (user) {
      loadPlaylists()
    }
  }, [user, loading])

  const loadPlaylists = async () => {
    if (!user) return

    const { data: playlistsData } = await supabase
      .from('playlists')
      .select('*')
      .eq('fan_id', user.id)
      .order('created_at', { ascending: false })

    if (playlistsData) {
      // Get track counts for each playlist
      const playlistsWithCounts = await Promise.all(
        playlistsData.map(async (playlist) => {
          const { count } = await supabase
            .from('playlist_tracks')
            .select('*', { count: 'exact', head: true })
            .eq('playlist_id', playlist.id)

          return { ...playlist, track_count: count || 0 }
        })
      )
      setPlaylists(playlistsWithCounts)
    }
  }

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setCreating(true)

    const { data, error } = await supabase
      .from('playlists')
      .insert({
        fan_id: user.id,
        name: newPlaylistName,
        description: newPlaylistDesc || null,
      })
      .select()
      .single()

    if (!error && data) {
      setPlaylists([{ ...data, track_count: 0 }, ...playlists])
      setNewPlaylistName('')
      setNewPlaylistDesc('')
      setShowCreateForm(false)
    }

    setCreating(false)
  }

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm('Delete this playlist?')) return

    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId)

    if (!error) {
      setPlaylists(playlists.filter(p => p.id !== playlistId))
    }
  }

  const handleTogglePublic = async (playlist: Playlist) => {
    const newValue = !playlist.is_public
    const { error } = await supabase
      .from('playlists')
      .update({ is_public: newValue })
      .eq('id', playlist.id)

    if (!error) {
      setPlaylists(prev =>
        prev.map(p => (p.id === playlist.id ? { ...p, is_public: newValue } : p))
      )
    }
  }

  const handleCopyLink = (playlistId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/fan/playlists/${playlistId}`)
    setCopiedId(playlistId)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-serif font-semibold">
                artistrax
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-lg">My Playlists</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/fan/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-semibold mb-2">My Playlists</h1>
            <p className="text-muted-foreground">
              Create playlists and organize your music
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Playlist
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create Playlist</h2>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="My Awesome Playlist"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="What's this playlist about?"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Playlist'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Playlists Grid */}
        {playlists.length === 0 ? (
          <div className="text-center py-16">
            <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first playlist to organize your music
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Playlist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-colors group"
              >
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {playlist.cover_url ? (
                    <img
                      src={playlist.cover_url}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">
                    {playlist.name}
                  </h3>
                  {playlist.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {playlist.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mb-4">
                    {playlist.track_count} tracks
                  </p>

                  <div className="flex gap-2 mb-2">
                    <Link href={`/fan/playlists/${playlist.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Play
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlaylist(playlist.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleTogglePublic(playlist)}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {playlist.is_public ? (
                        <>
                          <Globe className="w-3.5 h-3.5" /> Public
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Private
                        </>
                      )}
                    </button>
                    {playlist.is_public && (
                      <button
                        onClick={() => handleCopyLink(playlist.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedId === playlist.id ? (
                          <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span>
                        ) : (
                          'Copy link'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function PlaylistsPage() {
  return (
    <FanAuthProvider>
      <PlaylistsContent />
    </FanAuthProvider>
  )
}
