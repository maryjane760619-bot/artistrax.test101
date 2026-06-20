import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/events — list published events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'published'
    const artistId = searchParams.get('artist_id')
    const labelId = searchParams.get('label_id')
    const upcoming = searchParams.get('upcoming') === 'true'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let query = supabase
      .from('events')
      .select(`
        *,
        artists:artist_id (id, display_name, avatar_url, username),
        labels:label_id (id, name, logo_url, slug),
        ticket_tiers (*)
      `)

    if (status) {
      query = query.eq('status', status)
    }
    if (artistId) {
      query = query.eq('artist_id', artistId)
    }
    if (labelId) {
      query = query.eq('label_id', labelId)
    }
    if (upcoming) {
      query = query.gte('event_date', new Date().toISOString().split('T')[0])
    }

    query = query.order('event_date', { ascending: true })

    const { data: events, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ events })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/events — create a new event
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Parse token from Authorization header
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      description,
      cover_url,
      venue_name,
      venue_address,
      event_date,
      start_time,
      end_time,
      is_virtual,
      streaming_url,
      ticket_tiers,
    } = body

    if (!title || !slug || !event_date) {
      return NextResponse.json({ error: 'Title, slug, and event_date are required' }, { status: 400 })
    }

    // Check if user is an artist or label
    const { data: artist } = await supabase
      .from('artists')
      .select('id, stripe_account_id')
      .eq('id', user.id)
      .single()

    const { data: label } = await supabase
      .from('labels')
      .select('id, stripe_account_id')
      .eq('id', user.id)
      .single()

    if (!artist && !label) {
      return NextResponse.json({ error: 'Only artists and labels can create events' }, { status: 403 })
    }

    const isArtist = !!artist
    const creatorId = isArtist ? artist.id : label!.id
    const stripeAccountId = isArtist ? artist.stripe_account_id : label!.stripe_account_id

    if (!stripeAccountId) {
      return NextResponse.json(
        { error: 'Complete Stripe onboarding before creating paid events' },
        { status: 400 }
      )
    }

    // Generate unique slug if not provided
    let finalSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, '')

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .eq('slug', finalSlug)
      .maybeSingle()

    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString(36)}`
    }

    // Create event
    const eventData: any = {
      title,
      slug: finalSlug,
      description: description || null,
      cover_url: cover_url || null,
      venue_name: venue_name || null,
      venue_address: venue_address || null,
      event_date,
      start_time: start_time || null,
      end_time: end_time || null,
      is_virtual: is_virtual || false,
      streaming_url: streaming_url || null,
      stripe_account_id: stripeAccountId,
      status: 'draft',
    }

    if (isArtist) {
      eventData.artist_id = creatorId
    } else {
      eventData.label_id = creatorId
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single()

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 500 })
    }

    // Create ticket tiers if provided
    if (ticket_tiers && Array.isArray(ticket_tiers) && ticket_tiers.length > 0) {
      const tiersWithEventId = ticket_tiers.map((tier: any, idx: number) => ({
        event_id: event.id,
        name: tier.name,
        description: tier.description || null,
        price: tier.price,
        quantity: tier.quantity || 0,
        sort_order: idx,
      }))

      const { error: tiersError } = await supabase
        .from('ticket_tiers')
        .insert(tiersWithEventId)

      if (tiersError) {
        console.error('Error creating ticket tiers:', tiersError)
      }
    }

    return NextResponse.json({ success: true, event }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
