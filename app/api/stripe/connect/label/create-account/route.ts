import { getSiteUrl } from "@/lib/site-url"
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

function createAuthClient(token: string) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

// Create Stripe Express Connect account for label
export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }
    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim(), {
      apiVersion: '2024-12-18.acacia',
      maxNetworkRetries: 0,
      timeout: 8000,
    })
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const supabase = createAuthClient(token)

    // Get authenticated user (label)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get label details
    const { data: label, error: labelError } = await supabase
      .from('labels')
      .select('id, email, name, stripe_account_id')
      .eq('id', user.id)
      .single()

    if (labelError || !label) {
      return NextResponse.json(
        { error: 'Label not found' },
        { status: 404 }
      )
    }

    // Check if label already has a Stripe account
    if (label.stripe_account_id) {
      return NextResponse.json(
        { error: 'Stripe account already exists', accountId: label.stripe_account_id },
        { status: 400 }
      )
    }

    // Create Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: label.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'company', // Labels are typically companies
      metadata: {
        label_id: label.id,
        label_name: label.name,
        platform: 'artistrax',
        account_type: 'label'
      }
    })

    // Save Stripe account ID to database
    const { error: updateError } = await supabase
      .from('labels')
      .update({ stripe_account_id: account.id })
      .eq('id', label.id)

    if (updateError) {
      console.error('Error saving Stripe account ID:', updateError)
    }

    // Create account link for onboarding
    const siteUrl = getSiteUrl()
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${siteUrl}/label/dashboard?stripe=refresh`,
      return_url: `${siteUrl}/label/dashboard?stripe=success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url
    })

  } catch (error: any) {
    console.error('Stripe Connect account creation error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to create Stripe account',
        type: error.type || error.constructor?.name,
        code: error.code,
        statusCode: error.statusCode,
      },
      { status: 500 }
    )
  }
}
