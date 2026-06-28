import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { LabelPublicPage } from '@/components/label-public-page'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function LabelSlugPage({ params }: Props) {
  const { slug } = await params
  const supabase = createClient()

  const { data: label, error: labelError } = await supabase
    .from('labels')
    .select('*, owner_artist:owner_artist_id (display_name, username)')
    .eq('slug', slug)
    .single()

  if (labelError || !label) {
    notFound()
  }

  const { data: tracks } = await supabase
    .from('tracks')
    .select(`
      id, title, price, is_free, cover_url, audio_url, artist_id, label_id,
      genre, bpm, musical_key, description, created_at,
      artists:artist_id (display_name)
    `)
    .eq('label_id', label.id)
    .order('created_at', { ascending: false })

  const { data: artists } = await supabase
    .from('public_artist_profiles')
    .select('id, username, display_name, avatar_url, bio')
    .eq('label_id', label.id)

  const { data: products } = await supabase
    .from('products')
    .select('*, variants:product_variants(id, name, price_modifier, stock_quantity, is_available)')
    .eq('label_id', label.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('label_id', label.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  const { data: subscriptionSettings } = await supabase
    .from('creator_subscription_settings')
    .select('*')
    .eq('label_id', label.id)
    .maybeSingle()

  const { count: subscriberCount } = await supabase
    .from('fan_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('label_id', label.id)
    .eq('status', 'active')

  const today = new Date().toISOString().split('T')[0]
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('label_id', label.id)
    .eq('status', 'published')
    .gte('event_date', today)
    .order('event_date', { ascending: true })

  const mappedTracks = (tracks || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    artist: t.artists?.display_name || 'Unknown',
    price: Number(t.price),
    is_free: !!t.is_free,
    audio_url: t.audio_url,
    artist_id: t.artist_id,
    label_id: t.label_id,
    genre: t.genre,
    bpm: t.bpm,
    musical_key: t.musical_key,
    description: t.description,
    coverArt: t.cover_url,
  }))

  return (
    <>
      <Header />
      <LabelPublicPage
        label={label}
        tracks={mappedTracks}
        artists={artists || []}
        products={products || []}
        videos={videos || []}
        events={events || []}
        subscriptionSettings={subscriptionSettings}
        subscriberCount={subscriberCount || 0}
      />
      <Footer />
    </>
  )
}
