// Direct fix - link specific tracks to Siesta Records
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

    const { data: label, error: labelError } = await supabase
      .from('labels')
      .select('id')
      .eq('slug', 'siesta-records')
      .single()

    if (labelError || !label) {
      return NextResponse.json({ error: 'Siesta Records label not found' }, { status: 404 })
    }

    const { data: tracks } = await supabase
      .from('tracks')
      .select('id, title')

    if (!tracks || tracks.length === 0) {
      return NextResponse.json({ message: 'No tracks found' })
    }

    const trackIds = tracks.map(t => t.id)
    const { error: updateError } = await supabase
      .from('tracks')
      .update({ label_id: label.id })
      .in('id', trackIds)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Linked ${trackIds.length} tracks to Siesta Records`
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
