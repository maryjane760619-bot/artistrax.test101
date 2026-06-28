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

function tableFor(type: string) {
  if (type === 'artist') return { table: 'fan_follows_artists', idCol: 'artist_id' }
  if (type === 'label') return { table: 'fan_follows_labels', idCol: 'label_id' }
  return null
}

async function getFanFromRequest(request: NextRequest, supabase: ReturnType<typeof createClient>) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return null
  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

// GET ?type=artist|label&id=<uuid> -> { count, isFollowing }
export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type') || ''
    const id = request.nextUrl.searchParams.get('id') || ''
    const target = tableFor(type)
    if (!target || !id) {
      return NextResponse.json({ error: 'Invalid type or id' }, { status: 400 })
    }

    const supabase = getServiceClient()

    const { count } = await supabase
      .from(target.table)
      .select('*', { count: 'exact', head: true })
      .eq(target.idCol, id)

    const fan = await getFanFromRequest(request, supabase)
    let isFollowing = false
    if (fan) {
      const { data } = await supabase
        .from(target.table)
        .select('id')
        .eq(target.idCol, id)
        .eq('fan_id', fan.id)
        .maybeSingle()
      isFollowing = !!data
    }

    return NextResponse.json({ count: count || 0, isFollowing })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST { type, id } -> follow
export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceClient()
    const fan = await getFanFromRequest(request, supabase)
    if (!fan) {
      return NextResponse.json({ error: 'Sign in as a fan to follow' }, { status: 401 })
    }

    const { type, id } = await request.json()
    const target = tableFor(type)
    if (!target || !id) {
      return NextResponse.json({ error: 'Invalid type or id' }, { status: 400 })
    }

    const { error } = await supabase
      .from(target.table)
      .insert({ fan_id: fan.id, [target.idCol]: id })

    // Ignore unique-violation (already following) -- treat as success
    if (error && error.code !== '23505') {
      return NextResponse.json({ error: 'Failed to follow' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE { type, id } -> unfollow
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getServiceClient()
    const fan = await getFanFromRequest(request, supabase)
    if (!fan) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, id } = await request.json()
    const target = tableFor(type)
    if (!target || !id) {
      return NextResponse.json({ error: 'Invalid type or id' }, { status: 400 })
    }

    const { error } = await supabase
      .from(target.table)
      .delete()
      .eq('fan_id', fan.id)
      .eq(target.idCol, id)

    if (error) {
      return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
