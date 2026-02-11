import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Get user's purchased tracks (their library)
// Shows all tracks they can stream unlimited

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all purchases with track details
    const { data: purchases, error: purchaseError } = await supabase
      .from('purchases')
      .select(`
        id,
        created_at,
        amount,
        track_id,
        tracks (
          id,
          title,
          slug,
          description,
          cover_url,
          duration,
          price,
          artist_id,
          streaming_url,
          audio_url,
          artists (
            id,
            username,
            display_name,
            avatar_url
          )
        )
      `)
      .eq('buyer_id', user.id)
      .not('track_id', 'is', null)
      .order('created_at', { ascending: false })

    if (purchaseError) {
      console.error('Error fetching library:', purchaseError)
      return NextResponse.json(
        { error: 'Failed to fetch library' },
        { status: 500 }
      )
    }

    // Also get stream stats for these tracks (user's listening history)
    const trackIds = purchases?.map(p => p.track_id).filter(Boolean) || []
    
    let streamStats: any = {}
    if (trackIds.length > 0) {
      const { data: streams, error: streamError } = await supabase
        .from('stream_plays')
        .select('track_id, duration_seconds, played_at')
        .eq('user_id', user.id)
        .in('track_id', trackIds)
        .order('played_at', { ascending: false })

      if (!streamError && streams) {
        // Group by track_id
        streamStats = streams.reduce((acc: any, stream: any) => {
          if (!acc[stream.track_id]) {
            acc[stream.track_id] = {
              playCount: 0,
              lastPlayed: null
            }
          }
          acc[stream.track_id].playCount++
          if (!acc[stream.track_id].lastPlayed || 
              stream.played_at > acc[stream.track_id].lastPlayed) {
            acc[stream.track_id].lastPlayed = stream.played_at
          }
          return acc
        }, {})
      }
    }

    // Format response
    const library = purchases?.map((purchase: any) => ({
      purchaseId: purchase.id,
      purchasedAt: purchase.created_at,
      pricePaid: purchase.amount,
      track: {
        id: purchase.tracks.id,
        title: purchase.tracks.title,
        slug: purchase.tracks.slug,
        description: purchase.tracks.description,
        coverUrl: purchase.tracks.cover_url,
        duration: purchase.tracks.duration,
        price: purchase.tracks.price,
        streamingUrl: purchase.tracks.streaming_url || purchase.tracks.audio_url,
        downloadUrl: purchase.tracks.audio_url,
        artist: {
          id: purchase.tracks.artists?.id,
          username: purchase.tracks.artists?.username,
          displayName: purchase.tracks.artists?.display_name,
          avatarUrl: purchase.tracks.artists?.avatar_url
        },
        stats: streamStats[purchase.track_id] || {
          playCount: 0,
          lastPlayed: null
        }
      }
    })) || []

    return NextResponse.json({
      library,
      totalTracks: library.length
    })

  } catch (error) {
    console.error('Library fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
