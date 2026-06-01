import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArtistPublicPage } from '@/components/artist-public-page'
import { SubscriptionCard } from '@/components/subscribe-button'

type Props = {
  params: Promise<{ username: string }>
}

export default async function UsernamePage({ params }: Props) {
  const { username } = await params
  const supabase = createClient()
  
  // Fetch artist
  const { data: artist, error: artistError } = await supabase
    .from('public_artist_profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .single()

  if (artistError || !artist) {
    notFound()
  }

  // Fetch artist's tracks
  const { data: tracks } = await supabase
    .from('tracks')
    .select('*')
    .eq('artist_id', artist.id)
    .order('created_at', { ascending: false })

  // Fetch artist's products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('artist_id', artist.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false})

  // Fetch artist's videos
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('artist_id', artist.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false})

  // Fetch subscription settings
  const { data: subscriptionSettings } = await supabase
    .from('creator_subscription_settings')
    .select('*')
    .eq('artist_id', artist.id)
    .single()

  // Fetch subscriber count
  const { count: subscriberCount } = await supabase
    .from('fan_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('artist_id', artist.id)
    .eq('status', 'active')

  return (
    <>
      <Header />
      <ArtistPublicPage 
        artist={artist} 
        tracks={tracks || []} 
        products={products || []} 
        videos={videos || []}
        subscriberCount={subscriberCount || 0}
        subscriptionSettings={subscriptionSettings}
      />
      <Footer />
    </>
  )
}