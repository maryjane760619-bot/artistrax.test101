'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Music, ArrowLeft, Loader2, ExternalLink } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'

export default function TrackPage() {
  const params = useParams()
  const id = params?.id as string
  const [track, setTrack] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    
    const fetchTrack = async () => {
      const { data } = await supabase
        .from('tracks')
        .select(`*, artists:artist_id (display_name)`)
        .eq('id', id)
        .single()
      
      setTrack(data)
      setLoading(false)
    }
    
    fetchTrack()
  }, [id])

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

  // Stripe payment link (direct)
  const stripePaymentUrl = `https://buy.stripe.com/test_eVa3fWePd28j4z6bII?prefilled_email=&client_reference_id=${track.id}&metadata_track_id=${track.id}&metadata_track_title=${encodeURIComponent(track.title)}`

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/labels/siesta-records">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Siesta Records
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

              <a 
                href={stripePaymentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg" 
                  className="w-full"
                >
                  Buy Now <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>

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