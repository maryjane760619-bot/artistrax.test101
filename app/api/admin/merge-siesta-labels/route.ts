// One-click fix for Siesta Records label
// Moves all tracks to the correct label and fixes slug conflicts

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const results: string[] = []

    // Step 1: Find all Siesta labels
    const { data: siestaLabels } = await supabase
      .from('labels')
      .select('id, slug, name, email')
      .or('slug.eq.siesta-records,slug.eq.siestarecords,slug.eq.siesta-test')

    results.push(`Found ${siestaLabels?.length || 0} Siesta labels`)

    // Find the main one
    const mainLabel = siestaLabels?.find((l: any) => l.email === 'bertporcayo@icloud.com')
    const otherLabels = siestaLabels?.filter((l: any) => l.id !== mainLabel?.id) || []

    if (!mainLabel) {
      return NextResponse.json({ error: 'Main Siesta Records label not found' }, { status: 404 })
    }

    results.push(`Main label: ${mainLabel.id} (${mainLabel.email})`)

    // Step 2: Temporarily rename other labels' slugs
    for (const label of otherLabels) {
      await supabase
        .from('labels')
        .update({ slug: `${label.slug}-old-${Date.now()}` })
        .eq('id', label.id)
      results.push(`Renamed ${label.slug} to avoid conflict`)
    }

    // Step 3: Update main label with correct slug and info
    await supabase
      .from('labels')
      .update({
        slug: 'siesta-records',
        name: 'Siesta Records',
        bio: 'Surf · Sound · Soul. Independent electronic music label from Encinitas, CA.',
        website: 'https://siestarecords.net',
        instagram: 'siestabert',
        twitter: 'Siestabert'
      })
      .eq('id', mainLabel.id)

    results.push('Updated main label slug to siesta-records')

    // Step 4: Move ALL tracks to main label
    const { data: allTracks } = await supabase
      .from('tracks')
      .select('id')

    if (allTracks && allTracks.length > 0) {
      await supabase
        .from('tracks')
        .update({ label_id: mainLabel.id })
        .in('id', allTracks.map(t => t.id))

      results.push(`Moved ${allTracks.length} tracks to main label`)
    }

    // Step 5: Move ALL artists to main label
    const { data: allArtists } = await supabase
      .from('artists')
      .select('id')

    if (allArtists && allArtists.length > 0) {
      await supabase
        .from('artists')
        .update({ label_id: mainLabel.id })
        .in('id', allArtists.map(a => a.id))

      results.push(`Moved ${allArtists.length} artists to main label`)
    }

    // Step 6: Verify
    const { count: trackCount } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })
      .eq('label_id', mainLabel.id)

    return NextResponse.json({
      success: true,
      results,
      mainLabelId: mainLabel.id,
      tracksOnLabel: trackCount,
      labelUrl: 'https://music-download-store-2.vercel.app/labels/siesta-records'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
