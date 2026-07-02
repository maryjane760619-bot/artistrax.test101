'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Music, Building2, User, Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Input } from '@/components/ui/input'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<{ artists: any[], labels: any[], tracks: any[] }>({ artists: [], labels: [], tracks: [] })
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults({ artists: [], labels: [], tracks: [] })
      setSearched(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery)
  }, [initialQuery, doSearch])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}`)
    doSearch(query)
  }

  const totalResults = results.artists.length + results.labels.length + results.tracks.length

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={handleInput}
              placeholder="Search artists, labels, tracks..."
              className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 focus:border-primary"
            />
            {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-muted-foreground" />}
          </div>
        </form>

        {/* Results */}
        {searched && !loading && totalResults === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No results found for &ldquo;{query}&rdquo;</p>
            <p className="text-sm mt-2">Try a different search term</p>
          </div>
        )}

        {/* Artists */}
        {results.artists.length > 0 && (
          <section className="mb-10">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <User className="w-5 h-5 text-primary" />
              Artists
              <span className="text-sm font-normal text-muted-foreground">({results.artists.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.artists.map((artist: any) => (
                <Link
                  key={artist.id}
                  href={`/${artist.username}`}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary transition-colors"
                >
                  {artist.avatar_url ? (
                    <img src={artist.avatar_url} alt={artist.display_name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{artist.display_name}</p>
                    <p className="text-sm text-muted-foreground">@{artist.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Labels */}
        {results.labels.length > 0 && (
          <section className="mb-10">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Building2 className="w-5 h-5 text-primary" />
              Labels
              <span className="text-sm font-normal text-muted-foreground">({results.labels.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.labels.map((label: any) => (
                <Link
                  key={label.id}
                  href={`/labels/${label.slug}`}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary transition-colors"
                >
                  {label.logo_url ? (
                    <img src={label.logo_url} alt={label.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{label.name}</p>
                    {label.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{label.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tracks */}
        {results.tracks.length > 0 && (
          <section className="mb-10">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Music className="w-5 h-5 text-primary" />
              Tracks
              <span className="text-sm font-normal text-muted-foreground">({results.tracks.length})</span>
            </h2>
            <div className="flex flex-col gap-3">
              {results.tracks.map((track: any) => (
                <Link
                  key={track.id}
                  href={`/track/${track.id}`}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary transition-colors"
                >
                  {track.cover_url ? (
                    <img src={track.cover_url} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Music className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{track.title}</p>
                    <p className="text-sm text-muted-foreground">{track.artists?.display_name}</p>
                  </div>
                  <div className="text-sm font-medium text-right">
                    {track.is_free ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span>${Number(track.price).toFixed(2)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  )
}
