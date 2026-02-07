import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartProvider } from '@/lib/cart-context'
import { LabelPublicPage } from '@/components/label-public-page'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function LabelPage({ params }: Props) {
  const { slug } = await params
  
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

  return (
    <CartProvider>
      <Header />
      <LabelPublicPage label={label} tracks={tracks || []} />
      <Footer />
    </CartProvider>
  )
}
