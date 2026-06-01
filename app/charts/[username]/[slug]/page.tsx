import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartProvider } from '@/lib/cart-context'
import { DJChartPage } from '@/components/dj-chart-page'

type Props = {
  params: Promise<{ username: string; slug: string }>
}

export default async function ChartDetailPage({ params }: Props) {
  const { username, slug } = await params
  
  // Fetch artist
  const { data: artist } = await supabase
    .from('public_artist_profiles')
    .select('id, username, display_name, avatar_url')
    .eq('username', username.toLowerCase())
    .single()

  if (!artist) {
    notFound()
  }

  // Fetch chart with tracks
  const { data: chart, error: chartError } = await supabase
    .from('dj_charts')
    .select(`
      *,
      artists(display_name, username, avatar_url),
      chart_tracks(
        position,
        note,
        tracks(
          id,
          title,
          audio_url,
          cover_url,
          duration,
          price,
          is_free,
          play_count,
          download_count,
          artists(display_name, username),
          labels(name, slug)
        )
      )
    `)
    .eq('artist_id', artist.id)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (chartError || !chart) {
    notFound()
  }

  // Sort tracks by position
  const sortedTracks = chart.chart_tracks.sort((a, b) => a.position - b.position)

  return (
    <CartProvider>
      <Header />
      <DJChartPage chart={{ ...chart, chart_tracks: sortedTracks }} />
      <Footer />
    </CartProvider>
  )
}
