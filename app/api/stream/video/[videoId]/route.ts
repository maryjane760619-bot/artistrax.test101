import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const STREAMING_SECRET = process.env.STREAMING_SECRET || 'your-secret-key-change-in-production'
const TOKEN_EXPIRY_HOURS = 4

// Generate signed streaming URL for videos
// Similar to audio streaming but for video content

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get authenticated user
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      )
    }

    // Get video info
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, title, video_url, thumbnail_url, artist_id, label_id, is_public')
      .eq('id', videoId)
      .single()

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Check if video is public (no purchase needed)
    if (video.is_public) {
      // For public videos, still generate signed URL but no purchase check
      const { data: signedUrlData, error: urlError } = await supabase
        .storage
        .from('videos')
        .createSignedUrl(video.video_url, TOKEN_EXPIRY_HOURS * 3600)

      if (urlError || !signedUrlData) {
        console.error('Error creating signed URL:', urlError)
        return NextResponse.json(
          { error: 'Failed to generate streaming URL' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        streamUrl: signedUrlData.signedUrl,
        videoId: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnail_url,
        requiresPurchase: false
      })
    }

    // For private videos, check if user purchased access
    // This could be through a bundle, subscription, or individual purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('id')
      .or(`video_id.eq.${videoId},bundle_id.in.(select id from bundles where video_ids.cs.{${videoId}})`)
      .eq('buyer_id', user.id)
      .single()

    // Also check if they have an active subscription to the artist/label
    const { data: subscription } = await supabase
      .from('fan_subscriptions')
      .select('id')
      .or(`artist_id.eq.${video.artist_id},label_id.eq.${video.label_id}`)
      .eq('fan_id', user.id)
      .eq('status', 'active')
      .single()

    if (!purchase && !subscription) {
      return NextResponse.json(
        { error: 'Video not purchased - buy to stream' },
        { status: 403 }
      )
    }

    // Generate signed URL
    const { data: signedUrlData, error: urlError } = await supabase
      .storage
      .from('videos')
      .createSignedUrl(video.video_url, TOKEN_EXPIRY_HOURS * 3600)

    if (urlError || !signedUrlData) {
      console.error('Error creating signed URL:', urlError)
      return NextResponse.json(
        { error: 'Failed to generate streaming URL' },
        { status: 500 }
      )
    }

    // Generate signed token
    const expiresAt = Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
    const payload = JSON.stringify({
      videoId,
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

    return NextResponse.json({
      streamUrl: signedUrlData.signedUrl,
      token,
      expiresAt,
      videoId: video.id,
      title: video.title,
      thumbnailUrl: video.thumbnail_url,
      requiresPurchase: true
    })

  } catch (error) {
    console.error('Video stream URL generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}