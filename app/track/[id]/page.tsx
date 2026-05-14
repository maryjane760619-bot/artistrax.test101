'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Music, ArrowLeft, Loader2, ShoppingCart, CheckCircle, Download } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'

export default function TrackPage() {
  const params = useParams()
  const id = params?.id as string
  const [track, setTrack] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alreadyOwned, setAlreadyOwned] = useState(false)

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
      }

      setLoading(false)
    }

    fetchTrack()
  }, [id])

  const handleBuy = async () => {
    setPurchasing(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const fanEmail = session?.user?.email

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: id, fanEmail }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setPurchasing(false)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch {
      setError('Network error. Please check your connection and try again.')
      setPurchasing(false)
    }
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

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <Button
                    size="lg"
                    className="w-full bg-green-700 hover:bg-green-800"
                    onClick={handleBuy}
                    disabled={purchasing}
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redirecting to checkout...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy Now — ${track.price}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Secure payment via Stripe · 95% goes directly to the artist
                  </p>
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
