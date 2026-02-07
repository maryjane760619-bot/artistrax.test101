'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ReleaseCard } from '@/components/release-card'
import { Button } from '@/components/ui/button'
import { CartProvider } from '@/lib/cart-context'
import { getArtistBySlug, getReleasesByArtist } from '@/lib/data'
import { notFound } from 'next/navigation'

interface ArtistPageProps {
  params: Promise<{ slug: string }>
}

export default function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = use(params)
  const artist = getArtistBySlug(slug)

  if (!artist) {
    notFound()
  }

  const artistReleases = getReleasesByArtist(artist.id)

  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-20 md:pt-24">
          {/* Artist Hero */}
          <section className="py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Link 
                href="/artists"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                All Artists
              </Link>

              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                {/* Artist Image */}
                <div className="aspect-square rounded-lg overflow-hidden bg-card">
                  <div className="w-full h-full bg-gradient-to-br from-muted-foreground/40 to-muted" />
                </div>

                {/* Artist Info */}
                <div className="flex flex-col justify-center">
                  <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4">{artist.name}</h1>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {artist.genres.map(genre => (
                      <span 
                        key={genre}
                        className="text-xs uppercase tracking-wider bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                    {artist.bio}
                  </p>
                  <div className="flex gap-4">
                    <Button asChild>
                      <a href="#discography">View Discography</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Discography */}
          <section id="discography" className="py-12 md:py-20 bg-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-3xl md:text-4xl mb-8">Discography</h2>
              
              {artistReleases.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {artistReleases.map(release => (
                    <ReleaseCard key={release.id} release={release} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No releases yet. Check back soon!</p>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}
