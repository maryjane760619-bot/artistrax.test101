import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Create Stripe Express Connect account for label
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user (label)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
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
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/label/dashboard?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/label/dashboard?stripe=success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url
    })

  } catch (error: any) {
    console.error('Stripe Connect account creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create Stripe account' },
      { status: 500 }
    )
  }
}
