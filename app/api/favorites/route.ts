import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getFanFromRequest(request: NextRequest, supabase: ReturnType<typeof createClient>) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

// GET ?trackId=<uuid> -> { isFavorited }
export async function GET(request: NextRequest) {
  try {
    const trackId = request.nextUrl.searchParams.get('trackId') || ''
    if (!trackId) {
      return NextResponse.json({ error: 'trackId required' }, { status: 400 })
    }

    const supabase = getServiceClient()
    const fan = await getFanFromRequest(request, supabase)
    if (!fan) {
      return NextResponse.json({ isFavorited: false })
    }

    const { data } = await supabase
      .from('fan_favorites')
      .select('id')
      .eq('track_id', trackId)
      .eq('fan_id', fan.id)
      .maybeSingle()

    return NextResponse.json({ isFavorited: !!data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST { trackId } -> favorite
export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceClient()
    const fan = await getFanFromRequest(request, supabase)
    if (!fan) {
      return NextResponse.json({ error: 'Sign in as a fan to favorite tracks' }, { status: 401 })
    }

    const { trackId } = await request.json()
    if (!trackId) {
      return NextResponse.json({ error: 'trackId required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('fan_favorites')
      .insert({ fan_id: fan.id, track_id: trackId })

    if (error && error.code !== '23505') {
      return NextResponse.json({ error: 'Failed to favorite track' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE { trackId } -> unfavorite
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getServiceClient()
    const fan = await getFanFromRequest(request, supabase)
    if (!fan) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { trackId } = await request.json()
    if (!trackId) {
      return NextResponse.json({ error: 'trackId required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('fan_favorites')
      .delete()
      .eq('fan_id', fan.id)
      .eq('track_id', trackId)

    if (error) {
      return NextResponse.json({ error: 'Failed to unfavorite track' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
