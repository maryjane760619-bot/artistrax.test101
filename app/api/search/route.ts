import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json({ artists: [], labels: [], tracks: [] })
  }

  const search = `%${query}%`

  const [artistsRes, labelsRes, tracksRes] = await Promise.all([
    supabase
      .from('artists')
      .select('id, display_name, username, bio, avatar_url')
      .or(`display_name.ilike.${search},username.ilike.${search},bio.ilike.${search}`)
      .limit(6),

    supabase
      .from('labels')
      .select('id, name, slug, description, logo_url')
      .or(`name.ilike.${search},description.ilike.${search}`)
      .limit(6),

    supabase
      .from('tracks')
      .select('id, title, slug, cover_url, price, is_free, artist_id, artists(display_name, username)')
      .ilike('title', search)
      .limit(10),
  ])

  return NextResponse.json({
    artists: artistsRes.data || [],
    labels: labelsRes.data || [],
    tracks: tracksRes.data || [],
  })
}
