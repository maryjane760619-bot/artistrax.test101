import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase, createClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export async function POST(request: NextRequest) {
  try {
    // Check if auth-token based (from dashboard component - no body)
    const authHeader = request.headers.get('authorization')
    const contentLength = request.headers.get('content-length')
    const hasBody = contentLength && parseInt(contentLength) > 0

    let artistId: string
    let artistEmail: string

    if (authHeader && !hasBody) {
      // Auth-token based: get user from token
      const token = authHeader.replace('Bearer ', '')
      const supabaseClient = createClient()
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
      if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const { data: artist, error: artistError } = await supabaseClient
        .from('artists')
        .select('id, email, stripe_account_id')
        .eq('id', user.id)
        .single()

      if (artistError || !artist) return NextResponse.json({ error: 'Artist not found' }, { status: 404 })

      // Already has account - return onboarding link
      if (artist.stripe_account_id) {
        const accountLink = await stripe.accountLinks.create({
          account: artist.stripe_account_id,
          refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/artist/dashboard?stripe=refresh`,
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/artist/dashboard?stripe=success`,
          type: 'account_onboarding',
        })
        return NextResponse.json({ accountId: artist.stripe_account_id, onboardingUrl: accountLink.url })
      }

      artistId = artist.id
      artistEmail = artist.email
    } else {
      // Body-based: get user from request body
      const body = await request.json()
      const { userId, userType, email } = body

      if (!userId || !userType || !email) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      const table = userType === 'artist' ? 'artists' : 'labels'
      const { data: existingUser } = await supabase
        .from(table)
        .select('stripe_account_id')
        .eq('id', userId)
        .single()

      if (existingUser?.stripe_account_id) {
        return NextResponse.json({ accountId: existingUser.stripe_account_id, alreadyExists: true })
      }

      artistId = userId
      artistEmail = email
    }

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email: artistEmail,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_type: 'individual',
      metadata: {
        artist_id: artistId,
        platform: 'artistrax',
        account_type: 'artist'
      }
    })

    // Save account ID to database
    await supabase
      .from('artists')
      .update({
        stripe_account_id: account.id,
        stripe_onboarding_complete: false,
        stripe_charges_enabled: false,
        stripe_details_submitted: false
      })
      .eq('id', artistId)

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/artist/dashboard?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/artist/dashboard?stripe=success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
      success: true
    })

  } catch (error: any) {
    console.error('Stripe Connect account creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create Connect account' },
      { status: 500 }
    )
  }
}
