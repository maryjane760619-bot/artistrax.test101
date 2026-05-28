import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: label, error: labelError } = await supabase
      .from('labels')
      .select('id, name, stripe_account_id, stripe_charges_enabled, stripe_onboarding_complete')
      .eq('id', user.id)
      .single()

    if (labelError || !label) return NextResponse.json({ error: 'Label not found', labelError }, { status: 404 })

    let stripeAccount = null
    let stripeError = null
    let linkResult = null
    let linkError = null

    if (label.stripe_account_id) {
      const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim(), { apiVersion: '2024-12-18.acacia' })

      try {
        const acct = await stripe.accounts.retrieve(label.stripe_account_id)
        stripeAccount = { id: acct.id, charges_enabled: acct.charges_enabled, details_submitted: acct.details_submitted }
      } catch (e: any) {
        stripeError = { message: e.message, code: e.code, type: e.type }
      }

      try {
        const link = await stripe.accountLinks.create({
          account: label.stripe_account_id,
          refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/label/dashboard?stripe=refresh`,
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/label/dashboard?stripe=success`,
          type: 'account_onboarding',
        })
        linkResult = { url: link.url.substring(0, 80) + '...' }
      } catch (e: any) {
        linkError = { message: e.message, code: e.code, type: e.type }
      }
    }

    return NextResponse.json({
      label: {
        id: label.id,
        name: label.name,
        stripe_account_id: label.stripe_account_id,
        stripe_charges_enabled: label.stripe_charges_enabled,
        stripe_onboarding_complete: label.stripe_onboarding_complete,
      },
      stripeAccount,
      stripeError,
      linkResult,
      linkError,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
