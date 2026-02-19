'use client'

import { SimpleAudioPlayer } from '@/components/simple-audio-player'
import { Button } from '@/components/ui/button'
import { Download, Globe, Instagram, Twitter, Music2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { SocialLinksDisplay } from '@/components/social-links-display'
import { ProductCard } from '@/components/product-card'
import { VideoPlayer } from '@/components/video-player'
import { useCart } from '@/lib/cart-context'

type Label = {
  id: string
  slug: string
  name: string
  bio: string | null
  logo_url: string | null
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

type Props = {
  label: Label
  tracks: Track[]
  products?: Product[]
  videos?: Video[]
}

export function LabelPublicPage({ label, tracks, products = [], videos = [] }: Props) {
  const { addItem } = useCart()

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
    <main className="min-h-screen pt-24 pb-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Label Header */}
        <div className="mb-12 text-center">
          <div className="w-40 h-40 rounded-lg overflow-hidden mx-auto mb-6 bg-muted border-4 border-border">
            {label.logo_url ? (
              <img 
                src={label.logo_url} 
                alt={label.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music2 className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>
          <h1 className="text-5xl font-serif font-semibold mb-3">
            {label.name}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Record Label
          </p>
          {label.bio && (
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6 whitespace-pre-wrap">
              {label.bio}
            </p>
          )}

          {/* Social Links */}
          {(label.website || label.instagram || label.twitter || label.soundcloud || label.spotify) && (
            <div className="flex items-center justify-center gap-3 flex-wrap">
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

        {/* Catalog */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-semibold">
              Catalog ({tracks.length})
            </h2>
          </div>

          {tracks.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Music2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No releases yet. Check back soon!
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
