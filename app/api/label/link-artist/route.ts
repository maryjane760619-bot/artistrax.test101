import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getAuthedUser(request: NextRequest, supabase: ReturnType<typeof createClient>) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  return supabase.auth.getUser(token)
}

// GET: return the artist currently linked to the authenticated label, if any
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user } } = await getAuthedUser(request, supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: label, error } = await supabase
      .from('labels')
      .select('owner_artist_id, owner_artist:owner_artist_id (display_name, username)')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch link status' }, { status: 500 })
    }

    return NextResponse.json({ linkedArtist: label?.owner_artist || null })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: link an artist account to this label, only if their signup emails match
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user } } = await getAuthedUser(request, supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { artistUsername } = await request.json()
    if (!artistUsername) {
      return NextResponse.json({ error: 'Artist username required' }, { status: 400 })
    }

    const { data: label } = await supabase
      .from('labels')
      .select('id, email')
      .eq('id', user.id)
      .single()

    if (!label) {
      return NextResponse.json({ error: 'Label account not found' }, { status: 404 })
    }

    const { data: artist } = await supabase
      .from('artists')
      .select('id, email, display_name, username')
      .ilike('username', artistUsername.trim())
      .single()

    if (!artist) {
      return NextResponse.json({ error: 'No artist found with that username' }, { status: 404 })
    }

    if (artist.email.toLowerCase() !== label.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'That artist account uses a different email than your label account. The two accounts must share the same signup email to link them.' },
        { status: 403 }
      )
    }

    const { error: updateError } = await supabase
      .from('labels')
      .update({ owner_artist_id: artist.id })
      .eq('id', label.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to link accounts' }, { status: 500 })
    }

    return NextResponse.json({
      linkedArtist: { display_name: artist.display_name, username: artist.username },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: unlink
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user } } = await getAuthedUser(request, supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('labels')
      .update({ owner_artist_id: null })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to unlink' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
