'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Music, Heart, Users, Sparkles, Building2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-semibold mb-6">
            About artistrax
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            A platform built for independent artists, labels, and music lovers who believe in direct connection and fair compensation.
          </p>
          <p className="text-lg text-primary italic max-w-3xl mx-auto">
            Where an artist can be an artist
          </p>
        </section>

        {/* Mission Section */}
        <section className="bg-card py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-serif font-semibold mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  In a world dominated by streaming algorithms and fractional pennies, artistrax brings music back to its roots: direct from artist to fan.
                </p>
                <p className="text-lg text-muted-foreground mb-4">
                  We believe artists deserve fair pay for their work. We believe fans deserve high-quality downloads they own forever. We believe labels should empower artists, not exploit them.
                </p>
                <p className="text-lg text-muted-foreground">
                  artistrax is where music meets integrity.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-background p-6 rounded-lg border border-border">
                  <Heart className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Artist-First</h3>
                  <p className="text-sm text-muted-foreground">Fair splits, transparent payouts</p>
                </div>
                <div className="bg-background p-6 rounded-lg border border-border">
                  <Sparkles className="w-8 h-8 text-accent mb-3" />
                  <h3 className="font-semibold mb-2">Premium Quality</h3>
                  <p className="text-sm text-muted-foreground">Lossless audio, yours forever</p>
                </div>
                <div className="bg-background p-6 rounded-lg border border-border">
                  <Users className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Direct Connection</h3>
                  <p className="text-sm text-muted-foreground">Support artists you love</p>
                </div>
                <div className="bg-background p-6 rounded-lg border border-border">
                  <Zap className="w-8 h-8 text-accent mb-3" />
                  <h3 className="font-semibold mb-2">Fast & Simple</h3>
                  <p className="text-sm text-muted-foreground">Upload, share, earn</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Siesta Records Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12 border border-border">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-10 h-10 text-primary" />
                <h2 className="text-3xl font-serif font-semibold">
                  Powered by Siesta Records
                </h2>
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                artistrax was born from Siesta Records, an independent electronic music label based in Encinitas, California. After years of navigating the challenges of digital distribution, we built the platform we wished existed.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Siesta Records represents the laid-back beach vibes of Southern California while pushing the boundaries of electronic music. From deep house to progressive beats, we believe music should be felt, not just heard.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Now, we're opening the doors for artists and labels worldwide to benefit from what we've built. Welcome to the family.
              </p>
              <Link href="/labels/siestarecords">
                <Button size="lg">
                  Explore Siesta Records
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-card py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-semibold text-center mb-12">
              How artistrax Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* For Fans */}
              <div className="bg-background rounded-lg p-8 border border-border">
                <Heart className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-serif font-semibold mb-4">For Fans</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Discover independent artists and labels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Download high-quality music you own forever</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Create playlists for home, car, or anywhere</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Support artists directly with every purchase</span>
                  </li>
                </ul>
                <Link href="/fan/signup">
                  <Button className="w-full mt-6">Join as Fan</Button>
                </Link>
              </div>

              {/* For Artists */}
              <div className="bg-background rounded-lg p-8 border border-border">
                <Music className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-serif font-semibold mb-4">For Artists</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Upload your tracks in minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Set your own prices or offer free downloads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Track plays, downloads, and earnings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Get paid directly—no middleman</span>
                  </li>
                </ul>
                <Link href="/artist/signup">
                  <Button variant="outline" className="w-full mt-6">Join as Artist</Button>
                </Link>
              </div>

              {/* For Labels */}
              <div className="bg-background rounded-lg p-8 border border-border">
                <Building2 className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-serif font-semibold mb-4">For Labels</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Manage your entire catalog in one place</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Upload tracks for multiple artists</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Build your public label page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Distribute music on your terms</span>
                  </li>
                </ul>
                <Link href="/label/signup">
                  <Button variant="outline" className="w-full mt-6">Join as Label</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-semibold mb-6">
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Have questions? Want to partner with us? Building something cool? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:hello@artistrax.com">
                <Button size="lg">
                  Contact Us
                </Button>
              </a>
              <Link href="/">
                <Button variant="outline" size="lg">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
