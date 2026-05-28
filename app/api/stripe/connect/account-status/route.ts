import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase, createClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
  apiVersion: '2024-12-18.acacia'
})

// GET handler - auth-token based (used by dashboard component)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient()

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Try labels table first (for label dashboard)
    const { data: label } = await supabaseClient
      .from('labels')
      .select('id, stripe_account_id, stripe_onboarding_complete, stripe_charges_enabled')
      .eq('id', user.id)
      .single()

    if (label) {
      if (!label.stripe_account_id) {
        return NextResponse.json({
          hasAccount: false,
          onboardingComplete: false,
          chargesEnabled: false,
          payoutsEnabled: false
        })
      }

      const dbResponse = {
        hasAccount: true,
        accountId: label.stripe_account_id,
        onboardingComplete: label.stripe_onboarding_complete ?? false,
        chargesEnabled: label.stripe_charges_enabled ?? false,
        payoutsEnabled: label.stripe_charges_enabled ?? false,
      }

      try {
        const account = await stripe.accounts.retrieve(label.stripe_account_id)
        return NextResponse.json({
          ...dbResponse,
          onboardingComplete: account.details_submitted,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          requirements: account.requirements,
          email: account.email,
        })
      } catch {
        return NextResponse.json(dbResponse)
      }
    }

    // Try artists table (for artist dashboard)
    const { data: artist, error: artistError } = await supabaseClient
      .from('artists')
      .select('id, stripe_account_id, stripe_onboarding_complete, stripe_charges_enabled')
      .eq('id', user.id)
      .single()

    if (artistError || !artist) {
      return NextResponse.json({ error: 'Artist or Label not found' }, { status: 404 })
    }

    if (!artist.stripe_account_id) {
      return NextResponse.json({
        hasAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false
      })
    }

    const artistDbResponse = {
      hasAccount: true,
      accountId: artist.stripe_account_id,
      onboardingComplete: artist.stripe_onboarding_complete ?? false,
      chargesEnabled: artist.stripe_charges_enabled ?? false,
      payoutsEnabled: artist.stripe_charges_enabled ?? false,
    }

    try {
      const account = await stripe.accounts.retrieve(artist.stripe_account_id)
      return NextResponse.json({
        ...artistDbResponse,
        onboardingComplete: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirements: account.requirements,
        email: account.email,
      })
    } catch {
      return NextResponse.json(artistDbResponse)
    }

  } catch (error: any) {
    console.error('Stripe account status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get account status' },
      { status: 500 }
    )
  }
}

// POST handler - userId/userType based (used by scripts/API)
export async function POST(request: NextRequest) {
  try {
    const { userId, userType } = await request.json()

    if (!userId || !userType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const table = userType === 'artist' ? 'artists' : 'labels'

    const { data: user, error: fetchError } = await supabase
      .from(table)
      .select('stripe_account_id')
      .eq('id', userId)
      .single()

    if (fetchError || !user?.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        chargesEnabled: false,
        detailsSubmitted: false
      })
    }

    const account = await stripe.accounts.retrieve(user.stripe_account_id)

    await supabase
      .from(table)
      .update({
        stripe_onboarding_complete: account.details_submitted,
        stripe_charges_enabled: account.charges_enabled,
        stripe_details_submitted: account.details_submitted
      })
      .eq('id', userId)

    return NextResponse.json({
      connected: true,
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
      email: account.email
    })

  } catch (error: any) {
    console.error('Stripe connect status error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}