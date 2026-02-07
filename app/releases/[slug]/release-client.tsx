'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Pause, ShoppingCart, Check } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { CartProvider, useCart } from '@/lib/cart-context'
import { getArtistById } from '@/lib/data'
import type { Release } from '@/lib/types'

function ReleaseContent({ release }: { release: Release }) {
  const { addItem, items } = useCart()
  const [selectedFormat, setSelectedFormat] = useState<'mp3' | 'flac' | 'wav'>('mp3')
  const [playingTrack, setPlayingTrack] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState(false)

  const artist = getArtistById(release.artistId)
  const isInCart = items.some(item => item.releaseId === release.id)

  const handleAddToCart = () => {
    addItem(release, selectedFormat)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const toggleTrackPlay = (trackId: string) => {
    setPlayingTrack(playingTrack === trackId ? null : trackId)
  }

  const formatLabels = {
    mp3: 'MP3 (320kbps)',
    flac: 'FLAC (Lossless)',
    wav: 'WAV (Lossless)'
  }

  return (
    <main className="pt-20 md:pt-24">
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/releases"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Releases
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Album Art */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-card border border-border">
                <div className="w-full h-full bg-gradient-to-br from-muted-foreground/30 to-muted flex items-center justify-center">
                  <Play className="w-16 h-16 text-foreground/20" />
                </div>
              </div>
            </div>

            {/* Release Info */}
            <div>
              <div className="mb-6">
                <span className="text-sm uppercase tracking-wider text-muted-foreground">
                  {release.type} • {release.genre}
                </span>
                <h1 className="font-serif text-4xl md:text-5xl mt-2 mb-3">{release.title}</h1>
                {artist && (
                  <Link 
                    href={`/artists/${artist.slug}`}
                    className="text-xl text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {artist.name}
                  </Link>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Released {new Date(release.releaseDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {/* Format Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Select Format</h3>
                <div className="flex flex-wrap gap-2">
                  {(['mp3', 'flac', 'wav'] as const).map(format => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                        selectedFormat === format
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-card hover:border-muted-foreground'
                      }`}
                    >
                      <span className="font-medium">{format.toUpperCase()}</span>
                      <span className="ml-2 text-muted-foreground">${release.pricing[format].toFixed(2)}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatLabels[selectedFormat]}
                </p>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-3 mb-8">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isInCart && !addedToCart}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Added to Cart
                    </>
                  ) : isInCart ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      In Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart - ${release.pricing[selectedFormat].toFixed(2)}
                    </>
                  )}
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/cart">View Cart</Link>
                </Button>
              </div>

              {/* Track List */}
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider mb-4">
                  {release.tracks.length} Track{release.tracks.length !== 1 ? 's' : ''}
                </h3>
                <div className="space-y-1">
                  {release.tracks.map(track => (
                    <div 
                      key={track.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-card transition-colors group"
                    >
                      <button
                        onClick={() => toggleTrackPlay(track.id)}
                        className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-foreground group-hover:text-background transition-colors"
                      >
                        {playingTrack === track.id ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3 ml-0.5" />
                        )}
                      </button>
                      <span className="text-sm text-muted-foreground w-6">{track.trackNumber}</span>
                      <span className="flex-1 truncate">{track.title}</span>
                      <span className="text-sm text-muted-foreground">{track.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export function ReleasePageClient({ release }: { release: Release }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <ReleaseContent release={release} />
        <Footer />
      </div>
    </CartProvider>
  )
}
