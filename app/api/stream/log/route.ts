import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Log stream plays for analytics
// Called by audio player on play start and completion

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { trackId, durationSeconds, completed, deviceType } = body

    if (!trackId) {
      return NextResponse.json(
        { error: 'trackId required' },
        { status: 400 }
      )
    }

    // Verify user purchased this track
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('id')
      .eq('track_id', trackId)
      .eq('buyer_id', user.id)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: 'Track not purchased' },
        { status: 403 }
      )
    }

    // Insert stream log
    const { data: streamLog, error: logError } = await supabase
      .from('stream_plays')
      .insert({
        track_id: trackId,
        user_id: user.id,
        duration_seconds: durationSeconds || 0,
        completed: completed || false,
        device_type: deviceType || getDeviceType(request)
      })
      .select()
      .single()

    if (logError) {
      console.error('Error logging stream:', logError)
      return NextResponse.json(
        { error: 'Failed to log stream' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      logId: streamLog.id
    })

  } catch (error) {
    console.error('Stream logging error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper: Detect device type from user agent
function getDeviceType(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || ''
  
  if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
    return 'mobile'
  }
  
  // Check if it's running as PWA (look for display mode in URL or headers)
  const referer = request.headers.get('referer') || ''
  if (referer.includes('display=standalone') || 
      request.headers.get('sec-fetch-dest') === 'document' &&
      request.headers.get('sec-fetch-mode') === 'navigate') {
    return 'pwa'
  }
  
  return 'desktop'
}
