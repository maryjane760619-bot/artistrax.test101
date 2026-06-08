import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Generate signed streaming URL for purchased tracks
// Token expires in 4 hours, tied to user ID

const STREAMING_SECRET = process.env.STREAMING_SECRET || 'your-secret-key-change-in-production'
const TOKEN_EXPIRY_HOURS = 4

export async function GET(
  request: NextRequest,
  { params }: { params: { trackId: string } }
) {
  try {
    const { trackId } = params

    // Read auth token from Authorization header (passed by the client)
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}
    )

    // Get authenticated user (fan) via token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      )
    }

    // Check if user purchased this track
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('id, track_id')
      .eq('track_id', trackId)
      .eq('buyer_id', user.id)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: 'Track not purchased - buy to stream' },
        { status: 403 }
      )
    }

    // Get track info
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('id, title, streaming_url, audio_url')
      .eq('id', trackId)
      .single()

    if (trackError || !track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      )
    }

    // Use streaming_url if available, fallback to audio_url
    const streamUrl = track.streaming_url || track.audio_url

    if (!streamUrl) {
      return NextResponse.json(
        { error: 'No audio file available' },
        { status: 404 }
      )
    }

    // Generate signed token
    const expiresAt = Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
    const payload = JSON.stringify({
      trackId,
      userId: user.id,
      expiresAt
    })

    const signature = crypto
      .createHmac('sha256', STREAMING_SECRET)
      .update(payload)
      .digest('hex')

    const token = Buffer.from(JSON.stringify({
      payload,
      signature
    })).toString('base64url')

    // Get signed URL from Supabase Storage
    const bucketName = streamUrl.includes('/audio/') ? 'audio' : 'covers'
    const filePath = streamUrl.split(`/${bucketName}/`)[1]

    const { data: signedUrlData, error: urlError } = await supabase
      .storage
      .from(bucketName)
      .createSignedUrl(filePath, TOKEN_EXPIRY_HOURS * 3600)

    if (urlError || !signedUrlData) {
      console.error('Error creating signed URL:', urlError)
      return NextResponse.json(
        { error: 'Failed to generate streaming URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      streamUrl: signedUrlData.signedUrl,
      token,
      expiresAt,
      trackId: track.id,
      title: track.title
    })

  } catch (error) {
    console.error('Stream URL generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
