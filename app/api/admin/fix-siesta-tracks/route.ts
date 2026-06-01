// Fix tracks to link to the correct Siesta Records (the one you're logged into)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the request body (which label you're logged into)
    const body = await request.json()
    const { labelId } = body

    if (!labelId) {
      return NextResponse.json({
        error: 'Please provide your label ID from the dashboard URL'
      }, { status: 400 })
    }

    // Get all Siesta Records labels
    const { data: siestaLabels } = await supabase
      .from('labels')
      .select('id, slug, name, email')
      .in('slug', ['siesta-records', 'siestarecords', 'siesta-test'])

    // Find which one has tracks
    const labelsWithCounts = await Promise.all(
      (siestaLabels || []).map(async (label: any) => {
        const { count } = await supabase
          .from('tracks')
          .select('*', { count: 'exact', head: true })
          .eq('label_id', label.id)
        return { ...label, trackCount: count || 0 }
      })
    )

    // Get ALL tracks from any Siesta label
    const allSiestaLabelIds = (siestaLabels || []).map(l => l.id)

    const { data: allTracks } = await supabase
      .from('tracks')
      .select('id, title, label_id')
      .in('label_id', allSiestaLabelIds)

    // Move ALL tracks to your logged-in label
    const trackIds = allTracks?.map(t => t.id) || []

    if (trackIds.length > 0) {
      const { error: updateError } = await supabase
        .from('tracks')
        .update({ label_id: labelId })
        .in('id', trackIds)

      if (updateError) {
        return NextResponse.json({
          error: 'Failed to update tracks',
          details: updateError
        }, { status: 500 })
      }
    }

    // Also move all artists to your label
    const { data: allArtists } = await supabase
      .from('artists')
      .select('id')
      .in('label_id', allSiestaLabelIds)

    if (allArtists && allArtists.length > 0) {
      await supabase
        .from('artists')
        .update({ label_id: labelId })
        .in('id', allArtists.map(a => a.id))
    }

    // Update your label info to be the main Siesta Records
    await supabase
      .from('labels')
      .update({
        name: 'Siesta Records',
        slug: 'siesta-records',
        bio: 'Surf · Sound · Soul. Independent electronic music label from Encinitas, CA.',
        website: 'https://siestarecords.net',
        instagram: 'siestabert',
        twitter: 'Siestabert'
      })
      .eq('id', labelId)

    return NextResponse.json({
      success: true,
      message: 'All tracks moved to your Siesta Records label',
      tracksMoved: trackIds.length,
      artistsMoved: allArtists?.length || 0,
      yourLabelId: labelId,
      allSiestaLabels: labelsWithCounts
    })

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
