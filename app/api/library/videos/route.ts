import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Get videos the user has access to (via subscription or purchase)

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get authenticated user
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get active subscriptions for this fan
    const { data: subscriptions } = await supabase
      .from('fan_subscriptions')
      .select('artist_id, label_id')
      .eq('fan_id', user.id)
      .eq('status', 'active')

    const artistIds = subscriptions?.filter(s => s.artist_id).map(s => s.artist_id) || []
    const labelIds = subscriptions?.filter(s => s.label_id).map(s => s.label_id) || []

    // Get videos from subscribed artists/labels + public videos
    let videosQuery = supabase
      .from('videos')
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        duration,
        view_count,
        category,
        created_at,
        is_public,
        artist_id,
        label_id,
        artists:artist_id (display_name, username),
        labels:label_id (name, slug)
      `)
      .order('created_at', { ascending: false })

    // If they have subscriptions, get videos from those artists/labels
    if (artistIds.length > 0 || labelIds.length > 0) {
      const conditions = []
      if (artistIds.length > 0) {
        conditions.push(`artist_id.in.(${artistIds.join(',')})`)
      }
      if (labelIds.length > 0) {
        conditions.push(`label_id.in.(${labelIds.join(',')})`)
      }
      // Also include public videos
      conditions.push('is_public.eq.true')
      
      videosQuery = videosQuery.or(conditions.join(','))
    } else {
      // No subscriptions, only show public videos
      videosQuery = videosQuery.eq('is_public', true)
    }

    const { data: videos, error: videosError } = await videosQuery

    if (videosError) {
      console.error('Error fetching videos:', videosError)
      return NextResponse.json(
        { error: 'Failed to fetch videos' },
        { status: 500 }
      )
    }

    // Format response
    const formattedVideos = videos?.map((video: any) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnail_url,
      duration: video.duration,
      viewCount: video.view_count,
      category: video.category,
      createdAt: video.created_at,
      isPublic: video.is_public,
      artist: video.artists?.display_name || video.labels?.name || 'Unknown',
      artistId: video.artist_id || video.label_id,
      artistUsername: video.artists?.username || video.labels?.slug,
    })) || []

    return NextResponse.json({
      videos: formattedVideos,
      total: formattedVideos.length
    })

  } catch (error) {
    console.error('Library videos fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}