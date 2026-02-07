'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Check, Play } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { CartProvider, useCart } from '@/lib/cart-context'
import { getBundleBySlug, getReleaseById } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Bundle } from '@/lib/types'

interface BundlePageProps {
  params: Promise<{ slug: string }>
}

function BundleContent({ bundle }: { bundle: Bundle }) {
  const { addItem, items } = useCart()
  const [selectedFormat, setSelectedFormat] = useState<'mp3' | 'flac' | 'wav'>('mp3')
  const [addedToCart, setAddedToCart] = useState(false)

  const bundleReleases = bundle.releases
    .map(id => getReleaseById(id))
    .filter(Boolean)

  const handleAddAllToCart = () => {
    bundleReleases.forEach(release => {
      if (release) addItem(release, selectedFormat)
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const allInCart = bundleReleases.every(
    release => release && items.some(item => item.releaseId === release.id)
  )

  const formatPricing = {
    mp3: bundle.discountedPrice,
    flac: bundle.discountedPrice * 1.4,
    wav: bundle.discountedPrice * 1.4
  }

  return (
    <main className="pt-20 md:pt-24">
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/bundles"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Bundles
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Bundle Image */}
            <div>
              <div className="aspect-square rounded-lg overflow-hidden bg-card border border-border">
                <div className="w-full h-full bg-gradient-to-br from-muted-foreground/30 to-muted flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-2 p-8 w-full h-full">
                    {bundleReleases.slice(0, 4).map(release => release && (
                      <div key={release.id} className="rounded-lg bg-muted overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-muted-foreground/20 to-muted" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bundle Info */}
            <div>
              <div className="mb-6">
                <span className="text-sm uppercase tracking-wider text-muted-foreground">
                  Bundle • {bundleReleases.length} Releases
                </span>
                <h1 className="font-serif text-4xl md:text-5xl mt-2 mb-3">{bundle.title}</h1>
                <p className="text-lg text-muted-foreground">{bundle.description}</p>
              </div>

              {/* Pricing */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-card rounded-lg border border-border">
                <span className="text-3xl font-medium">${formatPricing[selectedFormat].toFixed(2)}</span>
                <span className="text-xl text-muted-foreground line-through">${bundle.originalPrice.toFixed(2)}</span>
                <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm">
                  Save ${(bundle.originalPrice - bundle.discountedPrice).toFixed(2)}
                </span>
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
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-3 mb-8">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={handleAddAllToCart}
                  disabled={allInCart && !addedToCart}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Added to Cart
                    </>
                  ) : allInCart ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      All Items in Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add Bundle to Cart
                    </>
                  )}
                </Button>
              </div>

              {/* Included Releases */}
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider mb-4">
                  Included Releases
                </h3>
                <div className="space-y-3">
                  {bundleReleases.map(release => release && (
                    <Link
                      key={release.id}
                      href={`/releases/${release.slug}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-card transition-colors group"
                    >
                      <div className="w-14 h-14 rounded bg-muted overflow-hidden flex-shrink-0">
                        <div className="w-full h-full bg-gradient-to-br from-muted-foreground/20 to-muted flex items-center justify-center">
                          <Play className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate group-hover:text-muted-foreground transition-colors">
                          {release.title}
                        </p>
                        <p className="text-sm text-muted-foreground">{release.artistName}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-muted-foreground">
                          {release.tracks.length} tracks
                        </p>
                        <p className="text-sm">${release.pricing[selectedFormat].toFixed(2)}</p>
                      </div>
                    </Link>
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

export default function BundlePage({ params }: BundlePageProps) {
  const { slug } = use(params)
  const bundle = getBundleBySlug(slug)

  if (!bundle) {
    notFound()
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <BundleContent bundle={bundle} />
        <Footer />
      </div>
    </CartProvider>
  )
}
