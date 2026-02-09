import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { trackId: string } }
) {
  try {
    const supabase = createClient()
    const { trackId } = params

    // Get the current user (fan)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Check if user has purchased this track
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('id')
      .eq('fan_id', user.id)
      .eq('track_id', trackId)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: 'Track not purchased - Please buy to stream' },
        { status: 403 }
      )
    }

    // Get track details
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('audio_url, streaming_url, title, artist_name')
      .eq('id', trackId)
      .single()

    if (trackError || !track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      )
    }

    // Generate signed URL for streaming (expires in 4 hours)
    const streamingPath = track.streaming_url || track.audio_url
    const { data: signedUrl, error: signError } = await supabase
      .storage
      .from('audio')
      .createSignedUrl(streamingPath, 14400) // 4 hours = 14400 seconds

    if (signError || !signedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate stream URL' },
        { status: 500 }
      )
    }

    // Log the stream play for analytics
    await supabase
      .from('stream_plays')
      .insert({
        track_id: trackId,
        user_id: user.id,
        played_at: new Date().toISOString()
      })

    // Return streaming URL
    return NextResponse.json({
      streamUrl: signedUrl.signedUrl,
      expiresIn: 14400,
      track: {
        id: trackId,
        title: track.title,
        artist: track.artist_name
      }
    })

  } catch (error) {
    console.error('Stream API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
