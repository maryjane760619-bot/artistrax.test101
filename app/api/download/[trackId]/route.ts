import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ trackId: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const { trackId } = await params

  try {
    // Fetch track
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('*, artists(*)')
      .eq('id', trackId)
      .single()

    if (trackError || !track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }

    // Check if paid and not purchased (we'll add purchase check later)
    // For now, all downloads work (we'll add Stripe later)

    // Get user IP for tracking
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Record download
    await supabase.from('downloads').insert({
      track_id: trackId,
      artist_id: track.artist_id,
      buyer_email: null, // Will be populated when we add auth
      ip_address: ip,
      user_agent: userAgent,
    })

    // Increment download count
    await supabase
      .from('tracks')
      .update({ download_count: (track.download_count || 0) + 1 })
      .eq('id', trackId)

    // Return download URL
    // Parse the storage path from the public URL
    const audioUrl = track.audio_url
    const pathMatch = audioUrl.match(/\/storage\/v1\/object\/public\/audio\/(.+)$/)
    
    if (!pathMatch) {
      return NextResponse.json({ error: 'Invalid audio URL' }, { status: 500 })
    }

    const filePath = pathMatch[1]

    // Generate signed download URL (expires in 1 hour)
    const { data: signedUrl, error: signError } = await supabase.storage
      .from('audio')
      .createSignedUrl(filePath, 3600, {
        download: `${track.title}.${track.format}`
      })

    if (signError || !signedUrl) {
      return NextResponse.json({ error: 'Download failed' }, { status: 500 })
    }

    // Redirect to signed URL
    return NextResponse.redirect(signedUrl.signedUrl)

  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
