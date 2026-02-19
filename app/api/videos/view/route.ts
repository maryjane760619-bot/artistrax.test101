import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }

    // Get current view count
    const { data: video, error: fetchError } = await supabase
      .from('videos')
      .select('view_count')
      .eq('id', videoId)
      .single()

    if (fetchError) {
      console.error('Error fetching video:', fetchError)
      return NextResponse.json({ success: false })
    }

    // Increment view count
    const { error: updateError } = await supabase
      .from('videos')
      .update({ view_count: (video.view_count || 0) + 1 })
      .eq('id', videoId)

    if (updateError) {
      console.error('Error updating view count:', updateError)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('View count error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
