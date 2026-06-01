// Admin API to link tracks/artists to Siesta Records label
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: label } = await supabase
      .from('labels')
      .select('id, name, slug')
      .eq('slug', 'siesta-records')
      .single()

    if (!label) {
      return NextResponse.json({ error: 'Siesta Records label not found' }, { status: 404 })
    }

    const { data: allTracks } = await supabase
      .from('tracks')
      .select('id, title, label_id')

    const unlinkedTracks = (allTracks || []).filter(t => t.label_id !== label.id)
    const trackIds = unlinkedTracks.map(t => t.id)

    if (trackIds.length > 0) {
      await supabase
        .from('tracks')
        .update({ label_id: label.id })
        .in('id', trackIds)
    }

    const { data: allArtists } = await supabase
      .from('artists')
      .select('id, display_name')

    const unlinkedArtists = (allArtists || []).filter((a: any) => a.label_id !== label.id)
    const artistIds = unlinkedArtists.map((a: any) => a.id)

    if (artistIds.length > 0) {
      await supabase
        .from('artists')
        .update({ label_id: label.id })
        .in('id', artistIds)
    }

    return NextResponse.json({
      success: true,
      tracksLinked: trackIds.length,
      artistsLinked: artistIds.length,
      totalTracks: allTracks?.length || 0,
      totalArtists: allArtists?.length || 0
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
