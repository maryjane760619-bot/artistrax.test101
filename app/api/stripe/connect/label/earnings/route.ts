import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: label } = await supabase
      .from('labels')
      .select('id, stripe_account_id')
      .eq('id', user.id)
      .single()

    if (!label) return NextResponse.json({ error: 'Label not found' }, { status: 404 })

    // Get total revenue from purchases for this label's tracks
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: purchases } = await adminSupabase
      .from('purchases')
      .select('amount, tracks!inner(label_id)')
      .eq('tracks.label_id', label.id)

    const totalRevenue = purchases?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
    const labelShare = totalRevenue * 0.9

    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim(), {
      apiVersion: '2024-12-18.acacia',
    })

    // Generate Stripe Express dashboard login link
    let stripeLoginUrl: string | null = null
    let stripeBalance: { available: number; pending: number } | null = null
    let stripeBalanceError: string | null = null

    if (label.stripe_account_id) {
      // Get login link
      try {
        const loginLink = await stripe.accounts.createLoginLink(label.stripe_account_id)
        stripeLoginUrl = loginLink.url
      } catch (err: any) {
        console.error('Failed to create Stripe login link:', err.message)
      }

      // Get actual balance in the connected account
      try {
        const balance = await stripe.balance.retrieve(
          {},
          { stripeAccount: label.stripe_account_id }
        )
        const available = balance.available.reduce((sum, b) => sum + b.amount, 0) / 100
        const pending = balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100
        stripeBalance = { available, pending }
      } catch (err: any) {
        stripeBalanceError = err.message
        console.error('Failed to retrieve Stripe balance:', err.message)
      }
    }

    return NextResponse.json({
      totalRevenue,
      labelShare,
      salesCount: purchases?.length || 0,
      stripeLoginUrl,
      stripeBalance,
      stripeBalanceError,
      stripeAccountId: label.stripe_account_id,
    })
  } catch (error: any) {
    console.error('Earnings fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
