import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface ArtistPageProps {
  params: Promise<{ slug: string }>
}

// Used to render fake demo content from lib/data.ts -- not reachable from
// real navigation (the real /artists directory links to /[username]), but
// a landmine if hit directly or indexed. Redirects to the real artist
// profile instead of showing a fake one.
export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params
  const supabase = createClient()

  const { data: artist } = await supabase
    .from('artists')
    .select('username')
    .eq('username', slug.toLowerCase())
    .maybeSingle()

  if (!artist) {
    notFound()
  }

  redirect(`/${artist.username}`)
}
