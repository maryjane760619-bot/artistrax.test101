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

    // Get Siesta Records label
    const { data: label } = await supabase
      .from('labels')
      .select('id')
      .eq('slug', 'siesta-records')
      .single()

    if (!label) {
      return NextResponse.json({ error: 'Label not found' }, { status: 404 })
    }

    // Count current tracks
    const { count: beforeCount } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })
      .eq('label_id', label.id)

    // Link ALL tracks to Siesta Records
    const { data: allTracks } = await supabase
      .from('tracks')
      .select('id')

    let updatedCount = 0
    if (allTracks && allTracks.length > 0) {
      const { error: updateError } = await supabase
        .from('tracks')
        .update({ label_id: label.id })
        .in('id', allTracks.map(t => t.id))

      if (!updateError) {
        updatedCount = allTracks.length
      }
    }

    // Count after
    const { count: afterCount } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })
      .eq('label_id', label.id)

    return NextResponse.json({
      success: true,
      labelId: label.id,
      tracksBefore: beforeCount,
      tracksUpdated: updatedCount,
      tracksAfter: afterCount
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
