'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Music, ArrowLeft, Loader2, ShoppingCart, CheckCircle, Download, Play } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/lib/cart-context'
import { RedeemWithPointsButton } from '@/components/redeem-with-points-button'
import { POINTS_CONFIG } from '@/lib/points-config'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function TrackPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { addItem, items } = useCart()
  const [track, setTrack] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alreadyOwned, setAlreadyOwned] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [pointsBalance, setPointsBalance] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const jumpTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds
      audioRef.current.play()
    }
  }

  useEffect(() => {
    if (!id) return

    const fetchTrack = async () => {
      const { data } = await supabase
        .from('tracks')
        .select(`*, artists:artist_id (display_name), labels:label_id (name)`)
        .eq('id', id)
        .single()

      setTrack(data)

      // Check if logged-in fan already owns this track
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user && data) {
        const { data: purchase } = await supabase
          .from('purchases')
          .select('id')
          .eq('track_id', id)
          .eq('buyer_email', session.user.email)
          .single()
        if (purchase) setAlreadyOwned(true)

        const { data: fan } = await supabase
          .from('fans')
          .select('points_balance')
          .eq('id', session.user.id)
          .single()
        if (fan) setPointsBalance(fan.points_balance || 0)
      }

      setLoading(false)
    }

    fetchTrack()
  }, [id])

  const inCart = items.some(i => i.productId === id)

  const handleAddToCart = () => {
    if (!track || inCart) return
    addItem({
      productId: track.id,
      productTitle: track.title,
      price: Number(track.price),
      artistId: track.artist_id || track.label_id || '',
      artistName: track.labels?.name || track.artists?.display_name || '',
      imageUrl: track.cover_url || undefined,
    })
    setAddedToCart(true)
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </main>
        <Footer />
      </>
    )
  }

  if (!track) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p>Track not found</p>
            <Link href="/">
              <Button className="mt-4">Back Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const artistName = track.labels?.name || track.artists?.display_name || 'Unknown Artist'

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <Link href={track.label_id ? `/labels/siesta-records` : `/artists`}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          <Card>
            <CardContent className="p-8">
              <div className="aspect-square bg-muted rounded-lg mb-6 flex items-center justify-center max-w-sm mx-auto">
                {track.cover_url ? (
                  <img
                    src={track.cover_url}
                    alt={track.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Music className="w-24 h-24 text-muted-foreground" />
                )}
              </div>

              <h1 className="text-3xl font-bold mb-2">{track.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">{artistName}</p>

              {track.is_mix && (
                <div className="mb-6 rounded-md border border-border bg-card p-4">
                  <audio ref={audioRef} src={track.audio_url} controls className="w-full" />

                  {Array.isArray(track.tracklist) && track.tracklist.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-2">
                        Tracklist
                      </p>
                      <div className="divide-y divide-border">
                        {track.tracklist.map((row: any, i: number) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => jumpTo(row.timestamp_seconds)}
                            className="group flex w-full items-center gap-3 py-2 text-left hover:bg-accent/5"
                          >
                            <Play className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-accent" />
                            <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">
                              {formatTime(row.timestamp_seconds)}
                            </span>
                            <span className="text-sm truncate">
                              {row.title}
                              {row.artist && (
                                <span className="text-muted-foreground"> — {row.artist}</span>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {track.is_free ? (
                <div className="mb-6">
                  <p className="text-2xl font-bold text-green-600 mb-4">Free Download</p>
                  <Link href={`/api/download/${track.id}`}>
                    <Button size="lg" className="w-full bg-green-700 hover:bg-green-800">
                      <Download className="w-4 h-4 mr-2" />
                      Download Free
                    </Button>
                  </Link>
                </div>
              ) : alreadyOwned ? (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">You own this track</span>
                  </div>
                  <Link href="/fan/library">
                    <Button size="lg" className="w-full bg-green-700 hover:bg-green-800">
                      <Music className="w-4 h-4 mr-2" />
                      Open in Library
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-3xl font-bold mb-2">${track.price}</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Own it forever · Stream unlimited · Download lossless
                  </p>

                  {inCart || addedToCart ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <CheckCircle className="w-5 h-5" />
                        Added to cart
                      </div>
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={() => router.push('/cart')}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        View Cart &amp; Checkout
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full bg-green-700 hover:bg-green-800"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart — ${track.price}
                    </Button>
                  )}

                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Secure payment via Stripe · 90% goes directly to the artist
                  </p>

                  {pointsBalance !== null && pointsBalance >= POINTS_CONFIG.POINTS_PER_TRACK && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-3 text-center">or</p>
                      <RedeemWithPointsButton
                        trackId={track.id}
                        pointsBalance={pointsBalance}
                        onSuccess={() => setAlreadyOwned(true)}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
