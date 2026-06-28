'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FanAuthProvider, useFanAuth } from '@/lib/fan-auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { FavoriteButton } from '@/components/favorite-button'
import { Heart, Music, ArrowLeft } from 'lucide-react'

type FavoriteTrack = {
  id: string
  track: {
    id: string
    title: string
    cover_url: string | null
    price: number
    is_free: boolean
    artists: { display_name: string; username: string } | null
    labels: { name: string; slug: string } | null
  }
}

function FavoritesContent() {
  const router = useRouter()
  const { user, loading } = useFanAuth()
  const [favorites, setFavorites] = useState<FavoriteTrack[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/fan/login')
    }
    if (user) {
      loadFavorites()
    }
  }, [user, loading])

  const loadFavorites = async () => {
    if (!user) return

    const { data } = await supabase
      .from('fan_favorites')
      .select(`
        id,
        track:tracks (
          id, title, cover_url, price, is_free,
          artists:artist_id (display_name, username),
          labels:label_id (name, slug)
        )
      `)
      .eq('fan_id', user.id)
      .order('created_at', { ascending: false })

    setFavorites((data as any) || [])
    setLoadingFavorites(false)
  }

  if (loading || loadingFavorites) {
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
          <div className="flex items-center gap-4">
            <Link href="/fan/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-lg">Favorites</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold mb-2">Favorites</h1>
          <p className="text-muted-foreground">Tracks you've hearted</p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              Tap the heart on any track to save it here
            </p>
            <Link href="/">
              <Button>Browse Music</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {favorites.map((fav) => {
              const track = fav.track
              if (!track) return null
              return (
                <Link
                  key={fav.id}
                  href={`/track/${track.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  {track.cover_url ? (
                    <img src={track.cover_url} alt={track.title} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                      <Music className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {track.artists?.display_name || track.labels?.name}
                    </p>
                  </div>
                  <FavoriteButton trackId={track.id} />
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default function FavoritesPage() {
  return (
    <FanAuthProvider>
      <FavoritesContent />
    </FanAuthProvider>
  )
}
