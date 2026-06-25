'use client'

import { SimpleAudioPlayer } from '@/components/simple-audio-player'
import { Button } from '@/components/ui/button'
import { Download, Play, Globe, Instagram, Twitter, Music2, ExternalLink, ShoppingBag, Video } from 'lucide-react'
import { SocialLinksDisplay } from '@/components/social-links-display'
import { ProductCard } from '@/components/product-card'
import { VideoPlayer } from '@/components/video-player'
import { SubscriptionCard } from '@/components/subscribe-button'
import { useCart } from '@/lib/cart-context'

type Artist = {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  website?: string | null
  instagram?: string | null
  twitter?: string | null
  soundcloud?: string | null
  spotify?: string | null
  tiktok?: string | null
}

type Track = {
  id: string
  title: string
  description: string | null
  audio_url: string
  cover_url: string | null
  duration: number | null
  price: number
  is_free: boolean
  play_count: number
  download_count: number
  created_at: string
}

type Product = {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  base_price: number
  images: string[]
  is_active: boolean
}

type Video = {
  id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  view_count: number
  category: string
  created_at: string
}

type SubscriptionSettings = {
  is_enabled: boolean
  monthly_price: number
  description: string
  benefits_discount_percent: number
  benefits_early_access_hours: number
  benefits_exclusive_streams: boolean
  benefits_subscriber_badge: boolean
}

type Props = {
  artist: Artist
  tracks: Track[]
  products?: Product[]
  videos?: Video[]
  subscriberCount: number
  subscriptionSettings: SubscriptionSettings | null
}

export function ArtistPublicPage({ artist, tracks, products = [], videos = [], subscriberCount, subscriptionSettings }: Props) {
  const cart = useCart()
  
  function handleAddToCart(productId: string) {
    const product = products.find(p => p.id === productId)
    if (!product) {
      console.error('Product not found:', productId)
      return
    }
    
    console.log('Adding to cart:', {
      productId: product.id,
      productTitle: product.title,
      price: product.base_price,
      imageUrl: product.images[0],
      artistId: artist.id,
      artistName: artist.display_name
    })
    
    cart.addItem({
      productId: product.id,
      productTitle: product.title,
      price: product.base_price,
      imageUrl: product.images[0],
      artistId: artist.id,
      artistName: artist.display_name
    })
    
    console.log('Cart after adding:', cart.items)
    alert('Added to cart!')
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getSocialLink = (platform: string, value: string) => {
    if (value.startsWith('http')) return value
    
    switch(platform) {
      case 'instagram':
        return value.startsWith('@') 
          ? `https://instagram.com/${value.slice(1)}`
          : `https://instagram.com/${value}`
      case 'twitter':
        return value.startsWith('@')
          ? `https://twitter.com/${value.slice(1)}`
          : `https://twitter.com/${value}`
      case 'soundcloud':
        return value.includes('soundcloud.com')
          ? `https://${value}`
          : `https://soundcloud.com/${value}`
      case 'tiktok':
        return value.startsWith('@')
          ? `https://tiktok.com/${value}`
          : `https://tiktok.com/@${value}`
      case 'spotify':
        return value
      default:
        return value
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Artist Header */}
        <div className="mb-12 text-center">
          <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-6 bg-muted border-4 border-border">
            {artist.avatar_url ? (
              <img 
                src={artist.avatar_url} 
                alt={artist.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music2 className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>
          <h1 className="text-5xl font-serif font-semibold mb-3">
            {artist.display_name}
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            @{artist.username}
          </p>
          {subscriberCount > 0 && (
            <p className="text-sm text-pink-500 font-medium mb-4">
              {subscriberCount} {subscriberCount === 1 ? 'subscriber' : 'subscribers'}
            </p>
          )}
          {artist.bio && (
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6 whitespace-pre-wrap">
              {artist.bio}
            </p>
          )}

          {/* Social Links */}
          {(artist.website || artist.instagram || artist.twitter || artist.soundcloud || artist.spotify || artist.tiktok) && (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {artist.website && (
                <a
                  href={artist.website.startsWith('http') ? artist.website : `https://${artist.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md hover:bg-muted transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Website</span>
                </a>
              )}
              {artist.instagram && (
                <a
                  href={getSocialLink('instagram', artist.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md hover:bg-muted transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span className="text-sm">Instagram</span>
                </a>
              )}
              {artist.twitter && (
                <a
                  href={getSocialLink('twitter', artist.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md hover:bg-muted transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="text-sm">Twitter</span>
                </a>
              )}
              {artist.soundcloud && (
                <a
                  href={getSocialLink('soundcloud', artist.soundcloud)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md hover:bg-muted transition-colors"
                >
                  <Music2 className="w-4 h-4" />
                  <span className="text-sm">SoundCloud</span>
                </a>
              )}
              {artist.spotify && (
                <a
                  href={artist.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md hover:bg-muted transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">Spotify</span>
                </a>
              )}
              {artist.tiktok && (
                <a
                  href={getSocialLink('tiktok', artist.tiktok)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md hover:bg-muted transition-colors"
                >
                  <Video className="w-4 h-4" />
                  <span className="text-sm">TikTok</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* New Social Links Section */}
        <div className="mb-12 max-w-md mx-auto">
          <SocialLinksDisplay artistId={artist.id} />
        </div>

        {/* Subscription Section */}
        {subscriptionSettings?.is_enabled && (
          <div className="mb-12 max-w-md mx-auto">
            <SubscriptionCard
              artistId={artist.id}
              price={subscriptionSettings.monthly_price}
              description={subscriptionSettings.description}
              subscriberCount={subscriberCount}
            />
          </div>
        )}

        {/* Tracks Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-semibold">
              Tracks ({tracks.length})
            </h2>
          </div>

          {tracks.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No tracks uploaded yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {tracks.map((track) => (
                <div key={track.id} className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="p-6">
                    {/* Track Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-serif font-semibold mb-1">
                          {track.title}
                        </h3>
                        {track.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {track.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatDate(track.created_at)}</span>
                          <span>•</span>
                          <span>{track.play_count} plays</span>
                          <span>•</span>
                          <span>{track.download_count} downloads</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {track.is_free ? (
                          <div className="text-lg font-semibold text-primary">
                            Free
                          </div>
                        ) : (
                          <div className="text-2xl font-bold">
                            ${track.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Audio Player */}
                    <SimpleAudioPlayer
                      track={{
                        id: track.id,
                        title: track.title,
                        artist: artist.display_name,
                        audioUrl: track.audio_url,
                        coverUrl: track.cover_url || undefined,
                      }}
                      className="mb-4"
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {track.is_free ? (
                        <Button 
                          className="flex-1"
                          asChild
                        >
                          <a href={`/api/download/${track.id}`} download>
                            <Download className="w-4 h-4 mr-2" />
                            Free Download
                          </a>
                        </Button>
                      ) : (
                        <>
                          <Button className="flex-1">
                            Buy & Download - ${track.price.toFixed(2)}
                          </Button>
                          <Button variant="outline">
                            Add to Cart
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Videos Section */}
        {videos.length > 0 && (
          <VideoPlayer videos={videos} />
        )}

        {/* Merch Section */}
        {products.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-semibold">
                Merchandise ({products.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
