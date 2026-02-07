import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartProvider } from '@/lib/cart-context'
import { ArtistPublicPage } from '@/components/artist-public-page'

type Props = {
  params: Promise<{ username: string }>
}

export default async function UsernamePage({ params }: Props) {
  const { username } = await params
  
  // Fetch artist
  const { data: artist, error: artistError } = await supabase
    .from('artists')
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

  return (
    <CartProvider>
      <Header />
      <ArtistPublicPage artist={artist} tracks={tracks || []} />
      <Footer />
    </CartProvider>
  )
}
