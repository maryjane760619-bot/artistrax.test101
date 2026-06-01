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

    // Get authenticated user
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get label ID
    const { data: label } = await supabase
      .from('labels')
      .select('id, slug, email')
      .eq('id', user.id)
      .single()

    if (!label) {
      return NextResponse.json({ error: 'Label not found' }, { status: 404 })
    }

    const results: string[] = []

    // Step 1: Update label info
    const { error: updateError } = await supabase
      .from('labels')
      .update({
        slug: 'siesta-records',
        name: 'Siesta Records',
        bio: 'Surf · Sound · Soul. Independent electronic music label from Encinitas, CA.',
        website: 'https://siestarecords.net',
        instagram: 'siestabert',
        twitter: 'Siestabert'
      })
      .eq('id', label.id)

    if (updateError) {
      results.push(`Label update error: ${updateError.message}`)
    } else {
      results.push('✅ Label info updated')
    }

    // Step 2: Move all tracks
    const { data: allTracks } = await supabase.from('tracks').select('id')

    if (allTracks && allTracks.length > 0) {
      const { error: tracksError } = await supabase
        .from('tracks')
        .update({ label_id: label.id })
        .in('id', allTracks.map(t => t.id))

      if (tracksError) {
        results.push(`Tracks error: ${tracksError.message}`)
      } else {
        results.push(`✅ Linked ${allTracks.length} tracks`)
      }
    }

    // Step 3: Move all artists
    const { data: allArtists } = await supabase.from('artists').select('id')

    if (allArtists && allArtists.length > 0) {
      await supabase
        .from('artists')
        .update({ label_id: label.id })
        .in('id', allArtists.map(a => a.id))

      results.push(`✅ Linked ${allArtists.length} artists`)
    }

    return NextResponse.json({
      success: true,
      results,
      labelId: label.id,
      labelUrl: `https://music-download-store-2.vercel.app/labels/${label.slug}`
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
