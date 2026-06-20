import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Generate a unique ticket code: 8-char alphanumeric, QR-code ready
function generateTicketCode(): string {
  return crypto.randomBytes(6).toString('base64url').toUpperCase().slice(0, 8)
}

// POST /api/events/[id]/purchase — buy tickets for an event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim(), {
      apiVersion: '2026-01-28.clover'
    })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const {
      tierId,
      quantity,
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerAddress,  // {street, city, state, zip, country}
      notes,
      referralSource,
      emailOptIn,
      attendees,     // [{name, email, accommodations, dietary}] — per ticket
    } = body

    // Validate required basics
    if (!tierId || !quantity || !buyerName || !buyerEmail) {
      return NextResponse.json(
        { error: 'Ticket tier, quantity, name, and email required' },
        { status: 400 }
      )
    }

    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 })
    }

    // Get event and ticket tier
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*, artists!left(stripe_account_id), labels!left(stripe_account_id)')
      .eq('id', id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.status !== 'published') {
      return NextResponse.json({ error: 'Event is not available for purchase' }, { status: 400 })
    }

    const { data: tier, error: tierError } = await supabase
      .from('ticket_tiers')
      .select('*')
      .eq('id', tierId)
      .eq('event_id', id)
      .single()

    if (tierError || !tier) {
      return NextResponse.json({ error: 'Ticket tier not found' }, { status: 404 })
    }

    if (!tier.is_available) {
      return NextResponse.json({ error: 'This ticket tier is no longer available' }, { status: 400 })
    }

    if (tier.quantity > 0) {
      const available = tier.quantity - tier.quantity_sold
      if (quantity > available) {
        return NextResponse.json(
          { error: `Only ${available} tickets available in this tier` },
          { status: 400 }
        )
      }
    }

    if (tier.max_per_order && quantity > tier.max_per_order) {
      return NextResponse.json(
        { error: `Maximum ${tier.max_per_order} tickets per order for this tier` },
        { status: 400 }
      )
    }

    // Validate attendee names match quantity
    if (attendees && attendees.length > 0) {
      if (attendees.length !== quantity) {
        return NextResponse.json(
          { error: `Provide names for all ${quantity} tickets` },
          { status: 400 }
        )
      }
      const missing = attendees.findIndex((a: any) => !a.name?.trim())
      if (missing >= 0) {
        return NextResponse.json(
          { error: `Attendee name required for ticket #${missing + 1}` },
          { status: 400 }
        )
      }
    }

    // Get the creator's Stripe Connect account
    const connectedAccountId = event.artists?.stripe_account_id || event.labels?.stripe_account_id
    if (!connectedAccountId) {
      return NextResponse.json(
        { error: 'Event organizer has not completed payment setup' },
        { status: 400 }
      )
    }

    // Calculate amounts
    const unitAmount = Math.round(Number(tier.price) * 100)
    const totalAmount = unitAmount * quantity
    const platformFeePercent = event.label_id ? 0.10 : 0.05
    const platformFee = Math.round(totalAmount * platformFeePercent)

    // Create Stripe checkout session with Connect transfer
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tier.name} — ${event.title}`,
            description: tier.description || `Ticket for ${event.title}`,
          },
          unit_amount: unitAmount,
        },
        quantity,
      }],
      customer_email: buyerEmail,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: connectedAccountId,
        },
      },
      metadata: {
        eventId: id,
        tierId: tierId,
        buyerName,
        buyerEmail,
        quantity: String(quantity),
        unitPrice: String(unitAmount),
      },
      success_url: `${request.headers.get('origin')}/events/${event.slug}?purchase=success`,
      cancel_url: `${request.headers.get('origin')}/events/${event.slug}`,
    })

    // Generate attendee records (use provided names or buyer name for each)
    const attendeeList = []
    for (let i = 0; i < quantity; i++) {
      const a = attendees?.[i]
      attendeeList.push({
        attendee_name: a?.name?.trim() || buyerName,
        attendee_email: a?.email?.trim() || null,
        special_accommodations: a?.accommodations?.trim() || null,
        dietary_restrictions: a?.dietary?.trim() || null,
      })
    }

    // Record pending purchase with ALL buyer info
    const purchaseData: any = {
      event_id: id,
      ticket_tier_id: tierId,
      buyer_email: buyerEmail,
      buyer_name: buyerName,
      phone: buyerPhone || null,
      email_opt_in: emailOptIn || false,
      buyer_address: buyerAddress || null,
      notes: notes || null,
      referral_source: referralSource || null,
      quantity,
      unit_price: Number(tier.price),
      subtotal: (Number(tier.price) * quantity),
      platform_fee: platformFee / 100,
      total: (Number(tier.price) * quantity) + (platformFee / 100),
      stripe_session_id: session.id,
      status: 'pending',
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from('ticket_purchases')
      .insert(purchaseData)
      .select('id')
      .single()

    if (purchaseError) {
      console.error('Failed to record ticket purchase:', purchaseError)
      // Still return success — Stripe session was created
    }

    // Create attendee records (even before payment — they'll get confirmed in webhook)
    if (purchase?.id) {
      const attendeeRows = attendeeList.map(a => ({
        purchase_id: purchase.id,
        event_id: id,
        ticket_tier_id: tierId,
        attendee_name: a.attendee_name,
        attendee_email: a.attendee_email,
        special_accommodations: a.special_accommodations,
        dietary_restrictions: a.dietary_restrictions,
        ticket_code: generateTicketCode(),
      }))

      const { error: attendeeError } = await supabase
        .from('ticket_attendees')
        .insert(attendeeRows)

      if (attendeeError) {
        console.error('Failed to create attendee records:', attendeeError)
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Ticket purchase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}