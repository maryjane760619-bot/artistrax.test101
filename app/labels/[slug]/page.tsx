import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { LabelPublicPage } from '@/components/label-public-page'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function LabelPage({ params }: Props) {
  const { slug } = await params
  const supabase = createClient()
  
  // Fetch label
  const { data: label, error: labelError } = await supabase
    .from('labels')
    .select('*')
    .eq('slug', slug.toLowerCase())
    .single()

  if (labelError || !label) {
    notFound()
  }

  // Fetch label's catalog
  const { data: tracks } = await supabase
    .from('tracks')
    .select('*, artists(display_name, username)')
    .eq('label_id', label.id)
    .order('created_at', { ascending: false })

  // Fetch label's products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('label_id', label.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Fetch label's videos
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('label_id', label.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  // Fetch subscription settings
  const { data: subscriptionSettings } = await supabase
    .from('creator_subscription_settings')
    .select('*')
    .eq('label_id', label.id)
    .single()

  // Fetch subscriber count
  const { count: subscriberCount } = await supabase
    .from('fan_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('label_id', label.id)
    .eq('status', 'active')

  return (
    <>
      <Header />
      <LabelPublicPage 
        label={label} 
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