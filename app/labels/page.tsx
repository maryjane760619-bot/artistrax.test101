'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { LabelCard } from '@/components/label-card'
import { CartProvider } from '@/lib/cart-context'
import { supabase } from '@/lib/supabase'
import { ArrowRight, Building2, Grid2X2, List, Music } from 'lucide-react'

export const dynamic = 'force-dynamic'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function LabelsPage() {
  const [labels, setLabels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLabels() {
      try {
        const { data, error } = await supabase
          .from('labels')
          .select('id, name, slug, bio, logo_url')
          .order('name', { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          setLabels(data)
        } else {
          // Fallback static mockups if DB is empty
          setLabels([
            {
              id: 'siesta-records-id',
              name: 'Siesta Records',
              slug: 'siesta-records',
              bio: 'Surf · Sound · Soul. Independent electronic music label based in Encinitas, CA.',
              logo_url: '/placeholder-logo.svg'
            },
            {
              id: 'maya-records-id',
              name: 'Maya Records',
              slug: 'maya-records',
              bio: 'Deep ancestral sounds, organic house, and hypnotic rhythms connecting the modern dancefloor to ancient roots.',
              logo_url: '/images/maya-icon-4.jpg'
            }
          ])
        }
      } catch (err) {
        console.error('Failed to load labels:', err)
        // Fallback static mockups on error
        setLabels([
          {
            id: 'siesta-records-id',
            name: 'Siesta Records',
            slug: 'siesta-records',
            bio: 'Surf · Sound · Soul. Independent electronic music label based in Encinitas, CA.',
            logo_url: '/placeholder-logo.svg'
          },
          {
            id: 'maya-records-id',
            name: 'Maya Records',
            slug: 'maya-records',
            bio: 'Deep ancestral sounds, organic house, and hypnotic rhythms connecting the modern dancefloor to ancient roots.',
            logo_url: '/images/maya-icon-4.jpg'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchLabels()
  }, [])

  // Apply text search and first-letter filtering together.
  const filteredLabels = labels.filter(label => {
    const matchesSearch =
      label.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (label.bio || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLetter =
      selectedLetter === null ||
      label.name.trim().charAt(0).toUpperCase() === selectedLetter

    return matchesSearch && matchesLetter
  })

  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        
        <main className="pb-16 min-h-[70vh]">
          <section className="py-12 md:py-16">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">

              {/* Header and Search section bar */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border pb-8">
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-foreground/60">Directory</div>
                  <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
                    Record Labels
                  </h1>
                  <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
                    Explore independent record labels on artistrax. Discover curated releases, label merchandise, and subscribe directly to back catalogs.
                  </p>
                </div>

                <div className="w-full md:w-80 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search record labels..."
                    className="w-full h-11 px-4 py-2 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-foreground/40 text-foreground placeholder:text-muted-foreground/60 transition"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground bg-secondary/80 px-2 py-0.5 rounded transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div
                  className="flex gap-1.5 overflow-x-auto pb-1"
                  aria-label="Filter labels by first letter"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedLetter(null)}
                    className={`shrink-0 rounded-sm px-3 py-2 text-xs uppercase tracking-wide transition ${
                      selectedLetter === null
                        ? 'bg-accent text-accent-foreground'
                        : 'border border-border hover:bg-accent/10'
                    }`}
                    aria-pressed={selectedLetter === null}
                  >
                    All
                  </button>
                  {LETTERS.map(letter => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => setSelectedLetter(letter)}
                      className={`shrink-0 rounded-sm px-3 py-2 text-xs uppercase tracking-wide transition ${
                        selectedLetter === letter
                          ? 'bg-accent text-accent-foreground'
                          : 'border border-border hover:bg-accent/10'
                      }`}
                      aria-pressed={selectedLetter === letter}
                    >
                      {letter}
                    </button>
                  ))}
                </div>

                <div className="flex shrink-0 items-center gap-2" aria-label="Choose label view">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`inline-flex items-center gap-2 rounded-sm px-3 py-2 text-xs uppercase tracking-wide transition ${
                      viewMode === 'grid'
                        ? 'bg-accent text-accent-foreground'
                        : 'border border-border hover:bg-accent/10'
                    }`}
                    aria-pressed={viewMode === 'grid'}
                  >
                    <Grid2X2 className="h-3.5 w-3.5" />
                    Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`inline-flex items-center gap-2 rounded-sm px-3 py-2 text-xs uppercase tracking-wide transition ${
                      viewMode === 'list'
                        ? 'bg-accent text-accent-foreground'
                        : 'border border-border hover:bg-accent/10'
                    }`}
                    aria-pressed={viewMode === 'list'}
                  >
                    <List className="h-3.5 w-3.5" />
                    List
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Music className="w-10 h-10 animate-pulse text-primary mb-4" />
                  <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Loading labels...</p>
                </div>
              ) : filteredLabels.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                    {filteredLabels.map(label => (
                      <LabelCard key={label.id} label={label} />
                    ))}
                  </div>
                ) : (
                  <div className="border-t border-border">
                    {filteredLabels.map(label => (
                      <Link
                        key={label.id}
                        href={`/labels/${label.slug}`}
                        className="group flex cursor-pointer items-center gap-4 border-b border-border py-4 transition-colors hover:bg-card/50"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-card">
                          {label.logo_url ? (
                            <img
                              src={label.logo_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="font-display text-lg font-semibold text-foreground">
                            {label.name}
                          </h2>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {label.bio || 'Independent record label.'}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                      </Link>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-24 bg-card/40 border border-primary/15 rounded-3xl p-8 glass-panel max-w-md mx-auto">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40 animate-pulse" />
                  <p className="text-foreground font-bold mb-1">No labels found</p>
                  <p className="text-muted-foreground text-xs">We couldn't find any record labels matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </CartProvider>
  )
}
