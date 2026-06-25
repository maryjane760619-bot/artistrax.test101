'use client'

import { SimpleAudioPlayer } from '@/components/simple-audio-player'
import { Button } from '@/components/ui/button'
import { Download, Globe, Instagram, Twitter, Music2, ExternalLink, Calendar, MapPin, Ticket } from 'lucide-react'
import Link from 'next/link'
import { SocialLinksDisplay } from '@/components/social-links-display'
import { ProductCard } from '@/components/product-card'
import { VideoPlayer } from '@/components/video-player'
import { SubscribeButton, SubscriptionCard } from '@/components/subscribe-button'
import { useCart } from '@/lib/cart-context'

type Label = {
  id: string
  slug: string
  name: string
  bio: string | null
  logo_url: string | null
  banner_url?: string | null
  website?: string | null
  instagram?: string | null
  twitter?: string | null
  soundcloud?: string | null
  spotify?: string | null
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
  artists: {
    display_name: string
    username: string
  } | null
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
  variants?: { stock_quantity: number }[]
}

type EventItem = {
  id: string
  slug: string
  title: string
  venue_name: string | null
  venue_address: string | null
  event_date: string
  start_time: string | null
  is_virtual: boolean
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
  label: Label
  tracks: Track[]
  products?: Product[]
  videos?: Video[]
  events?: EventItem[]
  subscriberCount: number
  subscriptionSettings: SubscriptionSettings | null
}

export function LabelPublicPage({ label, tracks, products = [], videos = [], events = [], subscriberCount, subscriptionSettings }: Props) {
  const { addItem } = useCart()
  const vinylProducts = products.filter(p => p.category === 'vinyl')
  const merchProducts = products.filter(p => p.category !== 'vinyl')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleAddToCart = (productId: string, variantId?: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) {
      console.error('[Label Page] Product not found:', productId)
      return
    }

    const item = {
      productId: productId,
      variantId,
      productTitle: product.title,
      price: product.base_price,
      imageUrl: product.images[0] || '/placeholder-product.png',
      artistId: label.id,
      artistName: label.name,
      sellerType: 'label' // Track whether this is from an artist or label
    }
    
    console.log('[Label Page] Adding to cart:', item)
    
    try {
      addItem(item)
      console.log('[Label Page] addItem() called successfully')
      
      // Force save to localStorage (backup)
      const currentCart = localStorage.getItem('artistrax_cart')
      const cart = currentCart ? JSON.parse(currentCart) : []
      
      const existingIndex = cart.findIndex((i: any) => 
        i.productId === item.productId && i.variantId === item.variantId
      )
      
      if (existingIndex > -1) {
        cart[existingIndex].quantity += 1
      } else {
        cart.push({ ...item, quantity: 1 })
      }
      
      localStorage.setItem('artistrax_cart', JSON.stringify(cart))
      console.log('[Label Page] Manually saved to localStorage:', cart)
    } catch (error) {
      console.error('[Label Page] Error adding to cart:', error)
    }
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
      default:
        return value
    }
  }

  return (
    <main className="min-h-screen pb-16 bg-background">
      {/* Banner */}
      <div className="pt-24">
        <div className="relative h-48 sm:h-64 overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-600">
          {label.banner_url && (
            <img
              src={label.banner_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Label Header */}
        <div className="mb-12">
          <div className="flex items-end gap-4 -mt-12 sm:-mt-16 pb-6">
            <div className="h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-md border-4 border-background bg-card shadow-lg">
              {label.logo_url ? (
                <img
                  src={label.logo_url}
                  alt={label.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Music2 className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="pb-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-semibold">
                {label.name}
              </h1>
              <p className="text-sm text-muted-foreground">Record Label</p>
            </div>
          </div>
          {subscriberCount > 0 && (
            <p className="text-sm text-pink-500 font-medium mb-4">
              {subscriberCount} {subscriberCount === 1 ? 'subscriber' : 'subscribers'}
            </p>
          )}
          {label.bio && (
            <p className="text-muted-foreground max-w-2xl mb-6 whitespace-pre-wrap">
              {label.bio}
            </p>
          )}

          {/* Social Links */}
          {(label.website || label.instagram || label.twitter || label.soundcloud || label.spotify) && (
            <div className="flex items-center gap-3 flex-wrap">
              {label.website && (
                <a
                  href={label.website.startsWith('http') ? label.website : `https://${label.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md hover:bg-muted transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Website</span>
                </a>
              )}
              {label.instagram && (
                <a
                  href={getSocialLink('instagram', label.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md hover:bg-muted transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span className="text-sm">Instagram</span>
                </a>
              )}
              {label.twitter && (
                <a
                  href={getSocialLink('twitter', label.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md hover:bg-muted transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="text-sm">Twitter</span>
                </a>
              )}
              {label.soundcloud && (
                <a
                  href={getSocialLink('soundcloud', label.soundcloud)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md hover:bg-muted transition-colors"
                >
                  <Music2 className="w-4 h-4" />
                  <span className="text-sm">SoundCloud</span>
                </a>
              )}
              {label.spotify && (
                <a
                  href={label.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md hover:bg-muted transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">Spotify</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* New Social Links Section */}
        <div className="mb-12 max-w-md mx-auto">
          <SocialLinksDisplay labelId={label.id} />
        </div>

        {/* Subscription Section */}
        {subscriptionSettings?.is_enabled && (
          <div className="mb-12 max-w-md mx-auto">
            <SubscriptionCard
              labelId={label.id}
              price={subscriptionSettings.monthly_price}
              description={subscriptionSettings.description}
              subscriberCount={subscriberCount}
            />
          </div>
        )}

        {/* Catalog */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Catalog ({tracks.length})
            </h2>
          </div>

          {tracks.length === 0 ? (
            <div className="rounded-sm border border-border bg-card p-12 text-center">
              <Music2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No releases yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {tracks.map((track) => (
                <div key={track.id} className="rounded-sm border border-border bg-card overflow-hidden">
                  <div className="p-6">
                    {/* Track Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-serif font-semibold mb-1">
                          {track.title}
                        </h3>
                        {track.artists && (
                          <Link 
                            href={`/${track.artists.username}`}
                            className="text-sm text-primary hover:underline mb-2 inline-block"
                          >
                            {track.artists.display_name}
                          </Link>
                        )}
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
                        artist: track.artists?.display_name || label.name,
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

        {/* Merchandise */}
        {merchProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Merchandise ({merchProducts.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {merchProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        )}

        {/* Vinyl */}
        {vinylProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Limited Edition Vinyl ({vinylProducts.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vinylProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Shows */}
        {events.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Upcoming Shows
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="rounded-sm border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold tracking-tight mb-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(event.event_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {event.start_time && ` · ${event.start_time.slice(0, 5)}`}
                  </div>
                  {(event.venue_name || event.is_virtual) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.is_virtual ? 'Virtual event' : event.venue_name}
                    </div>
                  )}
                  <a
                    href={`/events/${event.slug}`}
                    className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Ticket className="w-4 h-4" />
                    Get Tickets
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
