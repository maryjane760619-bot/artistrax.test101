'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ReleaseCard } from '@/components/release-card'
import { CartProvider } from '@/lib/cart-context'
import { releases, artists } from '@/lib/data'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const genres = ['All', 'Electronic', 'Ambient', 'Indie Rock', 'Alternative', 'Jazz Fusion', 'R&B', 'Soul']
const types = ['All', 'Album', 'EP', 'Single']
const years = ['All', '2025', '2024']

export default function ReleasesPage() {
  const [genreFilter, setGenreFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [yearFilter, setYearFilter] = useState('All')
  const [artistFilter, setArtistFilter] = useState('All')

  const filteredReleases = useMemo(() => {
    return releases.filter(release => {
      if (genreFilter !== 'All' && release.genre !== genreFilter) return false
      if (typeFilter !== 'All' && release.type !== typeFilter.toLowerCase()) return false
      if (yearFilter !== 'All' && !release.releaseDate.startsWith(yearFilter)) return false
      if (artistFilter !== 'All' && release.artistId !== artistFilter) return false
      return true
    })
  }, [genreFilter, typeFilter, yearFilter, artistFilter])

  const clearFilters = () => {
    setGenreFilter('All')
    setTypeFilter('All')
    setYearFilter('All')
    setArtistFilter('All')
  }

  const hasActiveFilters = genreFilter !== 'All' || typeFilter !== 'All' || yearFilter !== 'All' || artistFilter !== 'All'

  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-20 md:pt-24">
          <section className="py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h1 className="font-serif text-4xl md:text-5xl mb-4">Releases</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Browse our complete catalog of high-quality digital music downloads.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 mb-8 pb-8 border-b border-border">
                <Select value={artistFilter} onValueChange={setArtistFilter}>
                  <SelectTrigger className="w-[150px] bg-input">
                    <SelectValue placeholder="Artist" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Artists</SelectItem>
                    {artists.map(artist => (
                      <SelectItem key={artist.id} value={artist.id}>
                        {artist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger className="w-[150px] bg-input">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map(genre => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[130px] bg-input">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-[120px] bg-input">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                    Clear filters
                  </Button>
                )}

                <span className="ml-auto text-sm text-muted-foreground">
                  {filteredReleases.length} release{filteredReleases.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Results */}
              {filteredReleases.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredReleases.map(release => (
                    <ReleaseCard key={release.id} release={release} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground mb-4">No releases match your filters.</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
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
