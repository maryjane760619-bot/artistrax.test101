'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Grid2X2, List, Search } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArtistCard } from '@/components/artist-card'
import { CartProvider } from '@/lib/cart-context'
import { artists } from '@/lib/data'

export default function ArtistsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [sortBy, setSortBy] = useState<'az' | 'za'>('az')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const genres = Array.from(new Set(artists.flatMap(artist => artist.genres))).sort()
  const filteredArtists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return artists
      .filter(artist => {
        const matchesSearch =
          !query ||
          artist.name.toLowerCase().includes(query) ||
          artist.bio.toLowerCase().includes(query) ||
          artist.genres.some(genre => genre.toLowerCase().includes(query))
        const matchesGenre = !selectedGenre || artist.genres.includes(selectedGenre)

        return matchesSearch && matchesGenre
      })
      .sort((a, b) =>
        sortBy === 'az'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      )
  }, [searchQuery, selectedGenre, sortBy])

  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <section className="py-12 md:py-16">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
              <div className="mb-12 border-b border-border pb-8">
                <div className="text-xs uppercase tracking-[0.2em] text-foreground/60 mb-2">The roster</div>
                <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3">Artists</h1>
                <p className="text-muted-foreground max-w-2xl">
                  Discover the talented artists on artistrax. Each brings a unique voice and vision to our catalog.
                </p>
              </div>

              <div className="mb-8 space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <label className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={searchQuery}
                      onChange={event => setSearchQuery(event.target.value)}
                      placeholder="Search artists or genres..."
                      className="h-11 w-full rounded-sm border border-border bg-card pl-10 pr-4 text-sm outline-none transition focus:border-foreground/40"
                    />
                  </label>

                  <select
                    value={sortBy}
                    onChange={event => setSortBy(event.target.value as 'az' | 'za')}
                    className="h-11 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground/40"
                    aria-label="Sort artists"
                  >
                    <option value="az">Name: A–Z</option>
                    <option value="za">Name: Z–A</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`inline-flex h-11 items-center gap-2 rounded-sm px-3 text-xs uppercase tracking-wide transition ${
                        viewMode === 'grid'
                          ? 'bg-accent text-accent-foreground'
                          : 'border border-border hover:bg-accent/10'
                      }`}
                    >
                      <Grid2X2 className="h-3.5 w-3.5" />
                      Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`inline-flex h-11 items-center gap-2 rounded-sm px-3 text-xs uppercase tracking-wide transition ${
                        viewMode === 'list'
                          ? 'bg-accent text-accent-foreground'
                          : 'border border-border hover:bg-accent/10'
                      }`}
                    >
                      <List className="h-3.5 w-3.5" />
                      List
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedGenre('')}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs transition ${
                      selectedGenre === ''
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-foreground/40'
                    }`}
                  >
                    All genres
                  </button>
                  {genres.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => setSelectedGenre(genre === selectedGenre ? '' : genre)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-xs transition ${
                        selectedGenre === genre
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-foreground/40'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>

                <p className="font-mono text-xs text-muted-foreground">
                  {filteredArtists.length} {filteredArtists.length === 1 ? 'artist' : 'artists'}
                </p>
              </div>

              {filteredArtists.length === 0 ? (
                <div className="rounded-sm border border-dashed border-border py-16 text-center text-muted-foreground">
                  No artists match those filters.
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6">
                  {filteredArtists.map(artist => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              ) : (
                <div className="border-t border-border">
                  {filteredArtists.map(artist => (
                    <Link
                      key={artist.id}
                      href={`/artists/${artist.slug}`}
                      className="group flex items-center gap-4 border-b border-border py-4 transition-colors hover:bg-card/50"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-border bg-muted">
                        {artist.image ? (
                          <img src={artist.image} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 md:grid md:grid-cols-[minmax(12rem,0.35fr)_1fr] md:items-center md:gap-6">
                        <div>
                          <h2 className="font-display text-lg font-semibold">{artist.name}</h2>
                          <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                            {artist.genres.join(' · ')}
                          </p>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground md:mt-0">{artist.bio}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                    </Link>
                  ))}
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
