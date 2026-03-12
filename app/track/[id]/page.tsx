'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Music, ArrowLeft, Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'

export default function TrackPage() {
  const params = useParams()
  const id = params?.id as string
  const [track, setTrack] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    if (!id) return
    
    const fetchTrack = async () => {
      const { data } = await supabase
        .from('tracks')
        .select(`
          *,
          artists:artist_id (display_name)
        `)
        .eq('id', id)
        .single()
      
      setTrack(data)
      setLoading(false)
    }
    
    fetchTrack()
  }, [id])

  const handleBuy = async () => {
    setBuying(true)
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: id })
      })
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error: ' + (data.error || 'Could not create checkout'))
      }
    } catch (err) {
      alert('Error creating checkout session')
    } finally {
      setBuying(false)
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

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          <Card>
            <CardContent className="p-8">
              <div className="aspect-square bg-muted rounded-lg mb-6 flex items-center justify-center">
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
              <p className="text-xl text-muted-foreground mb-4">
                {track.artists?.display_name || 'Unknown Artist'}
              </p>
              
              <p className="text-3xl font-bold text-green-600 mb-6">
                ${track.price}
              </p>

              <Button 
                size="lg" 
                className="w-full"
                onClick={handleBuy}
                disabled={buying}
              >
                {buying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Buy Now'
                )}
              </Button>

              <p className="text-sm text-muted-foreground mt-4 text-center">
                Secure payment via Stripe
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}