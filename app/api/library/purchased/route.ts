import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get the current user (fan)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Get all tracks the user has purchased
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select(`
        id,
        purchased_at,
        track:tracks (
          id,
          title,
          artist_name,
          artist_id,
          genre,
          price,
          duration,
          cover_art_url,
          audio_url,
          streaming_url,
          created_at
        )
      `)
      .eq('fan_id', user.id)
      .order('purchased_at', { ascending: false })

    if (purchasesError) {
      console.error('Library fetch error:', purchasesError)
      return NextResponse.json(
        { error: 'Failed to fetch library' },
        { status: 500 }
      )
    }

    // Format the response
    const library = purchases?.map(p => ({
      purchaseId: p.id,
      purchasedAt: p.purchased_at,
      track: p.track
    })) || []

    // Get streaming stats
    const trackIds = library.map(item => item.track?.id).filter(Boolean)
    
    const { data: streamStats } = await supabase
      .from('stream_plays')
      .select('track_id, played_at')
      .eq('user_id', user.id)
      .in('track_id', trackIds)

    // Add stream count to each track
    const libraryWithStats = library.map(item => {
      const streams = streamStats?.filter(s => s.track_id === item.track?.id).length || 0
      return {
        ...item,
        streamCount: streams
      }
    })

    return NextResponse.json({
      library: libraryWithStats,
      total: library.length
    })

  } catch (error) {
    console.error('Library API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
