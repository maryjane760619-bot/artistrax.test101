'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArtistCard } from '@/components/artist-card'
import { CartProvider } from '@/lib/cart-context'
import { artists } from '@/lib/data'

export default function ArtistsPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-20 md:pt-24">
          <section className="py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12">
                <h1 className="font-serif text-4xl md:text-5xl mb-4">Artists</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Discover the talented artists on artistrax. Each brings a unique voice and vision to our catalog.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {artists.map(artist => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}
