'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Music, Music2, Music4, Disc, Play, Pause, ShoppingCart, CheckCircle,
  Globe, Instagram, Twitter, Video, Download, SlidersHorizontal, Search,
  Sparkles, Calendar, MapPin, Ticket, ExternalLink, Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SocialLinksDisplay } from '@/components/social-links-display'
import { ProductCard } from '@/components/product-card'
import { VideoPlayer } from '@/components/video-player'
import { SubscriptionModal } from '@/components/subscription-modal'
import { useCart } from '@/lib/cart-context'

type Artist = {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  banner_url?: string | null
  website?: string | null
  instagram?: string | null
  twitter?: string | null
  soundcloud?: string | null
  spotify?: string | null
  tiktok?: string | null
}

type Track = {
  id: string
  title: string
  description: string | null
  audio_url: string
  cover_url: string | null
  price: number
  is_free: boolean
  genre?: string | null
  bpm?: number | null
  musical_key?: string | null
  created_at: string
}

type Product = {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  base_price: number
  images: string[]
  is_active: boolean
  variants?: { id: string; name: string; price_modifier: number; stock_quantity: number; is_available: boolean }[]
}

type Video = {
  id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  view_count: number
  category: string
  created_at: string
}

type EventItem = {
  id: string
  slug: string
  title: string
  venue_name: string | null
  venue_address: string | null
  event_date: string
  start_time: string | null
  is_virtual: boolean
}

type SubscriptionSettings = {
  is_enabled: boolean
  monthly_price: number
  description: string
} | null

type OwnedLabel = {
  name: string
  slug: string
  logo_url: string | null
}

type Props = {
  artist: Artist
  tracks: Track[]
  products?: Product[]
  videos?: Video[]
  events?: EventItem[]
  ownedLabels?: OwnedLabel[]
  subscriberCount: number
  subscriptionSettings: SubscriptionSettings
}

const PAGE_SIZE = 12
const TABLE_PAGE_SIZE = 25

export function ArtistPublicPage({
  artist,
  tracks,
  products = [],
  videos = [],
  events = [],
  ownedLabels = [],
  subscriberCount,
  subscriptionSettings,
}: Props) {
  const cart = useCart()
  const vinylProducts = products.filter(p => p.category === 'vinyl')
  const merchProducts = products.filter(p => p.category !== 'vinyl')

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [tableVisibleCount, setTableVisibleCount] = useState(TABLE_PAGE_SIZE)

  useEffect(() => {
    if (!currentTrack || !audioRef.current) return
    audioRef.current.src = currentTrack.audio_url || ''
    if (isPlaying) audioRef.current.play().catch(() => {})
  }, [currentTrack])

  const handlePlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        audioRef.current?.play()
        setIsPlaying(true)
      }
    } else {
      setCurrentTrack(track)
      setIsPlaying(true)
    }
  }

  const isInCart = (id: string) => cart.items.some(i => i.productId === id)

  const handleAddTrackToCart = (track: Track) => {
    if (isInCart(track.id)) return
    cart.addItem({
      productId: track.id,
      productTitle: track.title,
      price: Number(track.price),
      artistId: artist.id,
      artistName: artist.display_name,
      imageUrl: track.cover_url || undefined,
    })
  }

  function handleAddProductToCart(productId: string, variantId?: string) {
    const product = products.find(p => p.id === productId)
    if (!product) return
    const variant = variantId ? product.variants?.find(v => v.id === variantId) : undefined
    cart.addItem({
      productId: product.id,
      variantId,
      productTitle: product.title,
      variantName: variant?.name,
      price: product.base_price + (variant?.price_modifier || 0),
      imageUrl: product.images[0],
      artistId: artist.id,
      artistName: artist.display_name,
    })
  }

  const filteredTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return tracks
    return tracks.filter(
      t => t.title.toLowerCase().includes(q) || (t.genre || '').toLowerCase().includes(q)
    )
  }, [tracks, searchQuery])

  const visibleGridTracks = filteredTracks.slice(0, visibleCount)
  const visibleTableTracks = filteredTracks.slice(0, tableVisibleCount)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
    setTableVisibleCount(TABLE_PAGE_SIZE)
  }, [searchQuery])

  const getSocialLink = (platform: string, value: string) => {
    if (value.startsWith('http')) return value
    switch (platform) {
      case 'instagram':
        return value.startsWith('@') ? `https://instagram.com/${value.slice(1)}` : `https://instagram.com/${value}`
      case 'twitter':
        return value.startsWith('@') ? `https://twitter.com/${value.slice(1)}` : `https://twitter.com/${value}`
      case 'soundcloud':
        return value.includes('soundcloud.com') ? `https://${value}` : `https://soundcloud.com/${value}`
      case 'tiktok':
        return value.startsWith('@') ? `https://tiktok.com/${value}` : `https://tiktok.com/@${value}`
      default:
        return value
    }
  }

  const bannerImage = artist.banner_url || artist.avatar_url || tracks[0]?.cover_url || null
  const hasRealBanner = !!artist.banner_url

  return (
    <div className="min-h-screen bg-background text-foreground">
      <audio ref={audioRef} />

      <main className="pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 space-y-10 pt-10">
          {/* Hero */}
          <div className="relative rounded-sm border border-border overflow-hidden shadow-xl p-6 md:p-8 glass-panel">
            <div className="absolute inset-0 overflow-hidden -z-10">
              {bannerImage ? (
                <img
                  src={bannerImage}
                  alt=""
                  className={hasRealBanner ? 'w-full h-full object-cover opacity-40' : 'w-full h-full object-cover blur-3xl opacity-20 scale-125 pointer-events-none'}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-primary/10 via-secondary/10 to-background opacity-30 blur-3xl" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-card border border-border shadow-2xl flex-shrink-0 flex items-center justify-center">
                {artist.avatar_url ? (
                  <img src={artist.avatar_url} alt={artist.display_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-muted to-secondary flex items-center justify-center">
                    <Music2 className="w-16 h-16 text-accent/30" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-accent/5 text-accent text-[10px] font-bold uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 fill-current" />
                  Independent Artist
                </div>

                <h1 className="text-3xl sm:text-5xl font-display font-semibold tracking-tight text-foreground">
                  {artist.display_name}
                </h1>
                <p className="text-sm text-muted-foreground">@{artist.username}</p>

                {ownedLabels.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    {ownedLabels.map(label => (
                      <a
                        key={label.slug}
                        href={`/labels/${label.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground hover:text-accent hover:border-accent/40 transition-colors"
                      >
                        <Building2 className="w-3 h-3" />
                        Also runs {label.name}
                      </a>
                    ))}
                  </div>
                )}

                {artist.bio && (
                  <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{artist.bio}</p>
                )}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                  <div className="text-center md:text-left">
                    <p className="text-xl font-black text-accent font-mono">{tracks.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Releases</p>
                  </div>

                  {subscriberCount > 0 && (
                    <div className="text-center md:text-left border-l border-border pl-6">
                      <p className="text-xl font-black text-pink-500 font-mono">{subscriberCount}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Subscribers</p>
                    </div>
                  )}

                  {(artist.website || artist.instagram || artist.twitter || artist.soundcloud || artist.spotify || artist.tiktok) && (
                    <div className="flex items-center gap-2 border-l border-border pl-6">
                      {artist.website && (
                        <a href={artist.website.startsWith('http') ? artist.website : `https://${artist.website}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-all duration-300" title="Website">
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                      {artist.instagram && (
                        <a href={getSocialLink('instagram', artist.instagram)} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-all duration-300" title="Instagram">
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                      {artist.twitter && (
                        <a href={getSocialLink('twitter', artist.twitter)} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-all duration-300" title="Twitter">
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {artist.soundcloud && (
                        <a href={getSocialLink('soundcloud', artist.soundcloud)} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-all duration-300" title="SoundCloud">
                          <Music className="w-4 h-4" />
                        </a>
                      )}
                      {artist.spotify && (
                        <a href={artist.spotify} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-all duration-300" title="Spotify">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {artist.tiktok && (
                        <a href={getSocialLink('tiktok', artist.tiktok)} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-all duration-300" title="TikTok">
                          <Video className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 w-full">
            {/* Left column */}
            <div className="w-full lg:w-2/3 space-y-10">
              {/* Featured Release */}
              {tracks.length > 0 && (
                <div className="rounded-sm border border-border p-6 md:p-8 shadow-xl flex flex-col md:flex-row gap-6 md:gap-8 items-center relative overflow-hidden group glass-panel">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none -z-10" />
                  <div className="w-40 h-40 md:w-48 md:h-48 rounded-sm overflow-hidden shadow-2xl relative flex-shrink-0 bg-muted border border-border">
                    {tracks[0].cover_url ? (
                      <img src={tracks[0].cover_url} alt={tracks[0].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Disc className="w-16 h-16 text-accent/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                      <button onClick={() => handlePlay(tracks[0])} className="w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                        {currentTrack?.id === tracks[0].id && isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 w-full text-center md:text-left">
                    <div>
                      <span className="px-2.5 py-0.5 rounded bg-accent/10 text-accent text-[9px] font-bold tracking-wider uppercase">Featured Release</span>
                      <h3 className="text-xl md:text-2xl font-display font-semibold text-foreground mt-2 truncate">{tracks[0].title}</h3>
                      <p className="text-sm text-accent font-medium mt-1">{artist.display_name}</p>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {tracks[0].description || `Latest official release from ${artist.display_name}.`}
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                      <Button onClick={() => handlePlay(tracks[0])} className="rounded-full bg-primary hover:bg-accent/90 text-background font-bold px-6">
                        {currentTrack?.id === tracks[0].id && isPlaying ? (
                          <><Pause className="w-4 h-4 mr-2 fill-current" /> Pause Preview</>
                        ) : (
                          <><Play className="w-4 h-4 mr-2 fill-current ml-0.5" /> Stream Track</>
                        )}
                      </Button>

                      {!tracks[0].is_free ? (
                        <Button
                          variant={isInCart(tracks[0].id) ? 'outline' : 'secondary'}
                          onClick={() => handleAddTrackToCart(tracks[0])}
                          className={`rounded-full px-6 transition-all duration-300 ${isInCart(tracks[0].id) ? 'border-green-500/30 text-green-400' : ''}`}
                        >
                          {isInCart(tracks[0].id) ? (
                            <><CheckCircle className="w-4 h-4 mr-2 text-green-400" /> In Cart</>
                          ) : (
                            <><ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart — ${Number(tracks[0].price).toFixed(2)}</>
                          )}
                        </Button>
                      ) : (
                        <Button asChild variant="outline" className="rounded-full px-6">
                          <a href={`/api/download/${tracks[0].id}`} download>
                            <Download className="w-4 h-4 mr-2" /> Free Download
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Search */}
              {tracks.length > 6 && (
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search releases by title or genre..."
                    className="w-full h-11 pl-11 pr-4 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-foreground/40 placeholder:text-muted-foreground/60 transition"
                  />
                </div>
              )}

              {/* Catalog Releases Grid */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Disc className="w-5 h-5 text-accent" />
                  <h2 className="text-xl md:text-2xl font-display font-semibold tracking-tight text-foreground">
                    Discography ({filteredTracks.length})
                  </h2>
                </div>

                {filteredTracks.length === 0 ? (
                  <div className="bg-card border border-border p-12 rounded-sm text-center">
                    <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                      {tracks.length === 0 ? 'No tracks uploaded yet. Check back soon!' : 'No releases match your search.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      {visibleGridTracks.map(track => (
                        <BandcampTrackCard
                          key={track.id}
                          track={track}
                          playing={currentTrack?.id === track.id && isPlaying}
                          onPlay={() => handlePlay(track)}
                        />
                      ))}
                    </div>
                    {visibleCount < filteredTracks.length && (
                      <div className="flex justify-center mt-8">
                        <Button variant="outline" className="rounded-full px-8" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
                          Load More ({filteredTracks.length - visibleCount} remaining)
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* Tracks Directory */}
              <section className="p-6 md:p-8 rounded-sm border border-border shadow-xl glass-panel">
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-accent" />
                    <h2 className="text-lg md:text-xl font-display font-semibold tracking-tight text-foreground">Tracks Directory</h2>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Detailed directory featuring Key and BPM mapping details for DJs.</p>
                </div>

                <div className="hidden md:flex items-center gap-4 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border mb-2">
                  <div className="w-10 text-center flex-shrink-0">Play</div>
                  <div className="flex-1 pr-2">Track Details</div>
                  <div className="w-24 flex-shrink-0">Genre</div>
                  <div className="w-16 flex-shrink-0 text-center">BPM</div>
                  <div className="w-16 flex-shrink-0 text-center">Key</div>
                  <div className="w-16 flex-shrink-0 text-right">Price</div>
                  <div className="w-10 text-center flex-shrink-0">Cart</div>
                </div>

                {filteredTracks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">No tracks found.</p>
                ) : (
                  <>
                    <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
                      {visibleTableTracks.map(track => (
                        <BeatportTrackRow
                          key={track.id}
                          track={track}
                          playing={currentTrack?.id === track.id && isPlaying}
                          active={currentTrack?.id === track.id}
                          inCart={isInCart(track.id)}
                          onPlay={() => handlePlay(track)}
                          onAddToCart={() => handleAddTrackToCart(track)}
                        />
                      ))}
                    </div>
                    {tableVisibleCount < filteredTracks.length && (
                      <div className="flex justify-center mt-4">
                        <Button variant="outline" className="rounded-full px-8" onClick={() => setTableVisibleCount(c => c + TABLE_PAGE_SIZE)}>
                          Load More ({filteredTracks.length - tableVisibleCount} remaining)
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* Videos */}
              {videos.length > 0 && <VideoPlayer videos={videos} />}

              {/* Merch */}
              {merchProducts.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight mb-6">
                    Merchandise ({merchProducts.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {merchProducts.map(product => (
                      <ProductCard key={product.id} product={product} onAddToCart={handleAddProductToCart} />
                    ))}
                  </div>
                </div>
              )}

              {/* Vinyl */}
              {vinylProducts.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight mb-6">
                    Limited Edition Vinyl ({vinylProducts.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vinylProducts.map(product => (
                      <ProductCard key={product.id} product={product} onAddToCart={handleAddProductToCart} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="w-full lg:w-1/3 space-y-8">
              {subscriptionSettings?.is_enabled && (
                <SubscriptionModal
                  artistId={artist.id}
                  price={subscriptionSettings.monthly_price}
                  description={subscriptionSettings.description}
                  subscriberCount={subscriberCount}
                  name={artist.display_name}
                />
              )}

              {events.length > 0 && (
                <div className="rounded-sm border border-border p-6 shadow-xl space-y-4 glass-panel">
                  <h3 className="font-display font-semibold text-lg text-foreground border-b border-border pb-2">Upcoming Shows</h3>
                  <div className="space-y-4">
                    {events.map(event => (
                      <div key={event.id}>
                        <p className="font-bold text-xs text-foreground truncate">{event.title}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {event.start_time && ` · ${event.start_time.slice(0, 5)}`}
                        </div>
                        {(event.venue_name || event.is_virtual) && (
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {event.is_virtual ? 'Virtual' : event.venue_name}
                          </div>
                        )}
                        <a href={`/events/${event.slug}`} className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold text-accent hover:underline">
                          <Ticket className="w-3 h-3" /> Get Tickets
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <SocialLinksDisplay artistId={artist.id} />
              </div>

              <div className="rounded-sm border border-border p-6 shadow-xl space-y-4 glass-panel">
                <h3 className="font-display font-semibold text-base text-foreground">Subscribe to {artist.display_name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Stay updated on new releases and announcements directly from the artist.
                </p>
                <form onSubmit={e => { e.preventDefault(); alert('Subscribed!') }} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground transition-all duration-300"
                    required
                  />
                  <Button type="submit" size="sm" className="bg-accent text-accent-foreground font-semibold hover:bg-accent/90 text-xs rounded-lg">
                    Join
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/85 backdrop-blur-xl border-t border-border px-6 py-4 z-50 shadow-2xl flex items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {currentTrack.cover_url ? (
              <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-border" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                <Music className="w-5 h-5 text-accent/45" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm truncate text-foreground">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{artist.display_name}</p>
            </div>
          </div>
          <button
            onClick={() => handlePlay(currentTrack)}
            className="w-11 h-11 rounded-full bg-primary hover:bg-accent/90 text-background flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg flex-shrink-0"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
        </div>
      )}
    </div>
  )
}

function BandcampTrackCard({ track, playing, onPlay }: { track: Track; playing: boolean; onPlay: () => void }) {
  return (
    <div className="group cursor-pointer" onClick={onPlay}>
      <div className="aspect-square w-full relative bg-card rounded-sm overflow-hidden border border-border shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl">
        {track.cover_url ? (
          <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center relative">
            <Disc className="w-20 h-20 text-accent/15" />
            <Music4 className="w-8 h-8 text-accent/45 absolute" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
          <button onClick={e => { e.stopPropagation(); onPlay() }} className="w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
            {playing ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>
        </div>
        {track.is_free && (
          <span className="absolute top-3 right-3 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded bg-green-900/80 border border-green-500/20 text-green-300">Free</span>
        )}
      </div>
      <div className="mt-3 px-1">
        <h4 className="font-bold text-sm truncate text-foreground group-hover:text-accent transition-colors">{track.title}</h4>
        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold">
          {track.is_free ? 'Free' : `$${Number(track.price).toFixed(2)}`}
        </span>
      </div>
    </div>
  )
}

function BeatportTrackRow({
  track, active, playing, inCart, onPlay, onAddToCart,
}: {
  track: Track; active: boolean; playing: boolean; inCart: boolean; onPlay: () => void; onAddToCart: () => void
}) {
  return (
    <div className={`flex items-center gap-2 md:gap-4 p-3 rounded-lg transition-all duration-200 border border-transparent ${active ? 'bg-accent/10 border-border' : 'hover:bg-accent/[0.04] hover:border-border'}`}>
      <div className="w-10 flex-shrink-0 flex items-center justify-center">
        <button onClick={onPlay} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${playing ? 'bg-accent text-accent-foreground' : 'bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground'}`}>
          {playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-3 pr-2">
        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-muted hidden sm:block">
          {track.cover_url ? (
            <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Music className="w-4 h-4 text-accent/45" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm truncate text-foreground hover:text-accent transition-colors cursor-pointer" onClick={onPlay}>{track.title}</p>
        </div>
      </div>

      <div className="hidden md:block w-24 flex-shrink-0">
        {track.genre ? (
          <span className="text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-border font-bold">{track.genre}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </div>

      <div className="hidden md:block w-16 flex-shrink-0 text-center">
        <span className="text-xs font-mono text-foreground/80">{track.bpm || '-'}</span>
      </div>

      <div className="hidden md:block w-16 flex-shrink-0 text-center">
        <span className="text-xs font-mono text-foreground/80">{track.musical_key || '-'}</span>
      </div>

      <div className="w-16 flex-shrink-0 text-right">
        <span className="text-sm font-semibold text-accent">{track.is_free ? 'Free' : `$${Number(track.price).toFixed(2)}`}</span>
      </div>

      <div className="w-10 flex-shrink-0 flex items-center justify-center">
        {!track.is_free && (
          <Button
            size="sm"
            variant={inCart ? 'outline' : 'ghost'}
            className={`h-8 w-8 p-0 rounded-full transition-all duration-300 ${inCart ? 'border-green-500/30 text-green-400' : 'text-muted-foreground hover:text-accent'}`}
            onClick={onAddToCart}
          >
            {inCart ? <CheckCircle className="w-4 h-4 text-green-400" /> : <ShoppingCart className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  )
}
