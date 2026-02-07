'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, Music, Building2 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-serif font-semibold">
            artistrax
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-serif font-semibold tracking-tight mb-8">
            artistrax
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Premium digital downloads from independent artists & labels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link 
            href="/fan/signup"
            className="bg-card border-2 border-primary rounded-lg p-6 hover:bg-primary/10 transition-colors text-center"
          >
            <Heart className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Join as Fan</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Discover music, build your collection
            </p>
            <Button size="sm" className="w-full">Sign Up Free</Button>
          </Link>

          <Link 
            href="/artist/signup"
            className="bg-card border-2 border-border rounded-lg p-6 hover:border-primary transition-colors text-center"
          >
            <Music className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Join as Artist</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload tracks, get paid directly
            </p>
            <Button variant="outline" size="sm" className="w-full">Get Started</Button>
          </Link>

          <Link 
            href="/label/signup"
            className="bg-card border-2 border-border rounded-lg p-6 hover:border-primary transition-colors text-center"
          >
            <Building2 className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Join as Label</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage artists, distribute music
            </p>
            <Button variant="outline" size="sm" className="w-full">Get Started</Button>
          </Link>
        </div>

        <div className="text-center mt-12">
          <Link href="/labels/siestarecords">
            <Button size="lg">Browse Music →</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
