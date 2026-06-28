import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface ReleasePageProps {
  params: Promise<{ slug: string }>
}

// This route used to render fake demo content from lib/data.ts -- not
// reachable from real navigation (the actual /releases directory links
// to /track/[id]), but a landmine if anyone hit it directly or it got
// indexed. Redirects to the real track page instead of showing a fake
// non-purchasable release.
export default async function ReleasePage({ params }: ReleasePageProps) {
  const { slug } = await params
  const supabase = createClient()

  const { data: track } = await supabase
    .from('tracks')
    .select('id')
    .eq('slug', slug)
    .limit(1)
    .maybeSingle()

  if (!track) {
    notFound()
  }

  redirect(`/track/${track.id}`)
}
