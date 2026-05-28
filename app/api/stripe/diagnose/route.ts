import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(( process.env.STRIPE_SECRET_KEY || '').trim(), {
  apiVersion: '2024-12-18.acacia'
});

export async function GET() {
  try {
    // Test 1: Check if key exists
    const hasKey = !!process.env.STRIPE_SECRET_KEY;
    const keyPrefix = process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'none';
    
    // Test 2: Try to retrieve the connected account
    let accountTest = null;
    let accountError = null;
    
    try {
      const account = await stripe.accounts.retrieve('acct_1TWqHTCsH0QKNquU');
      accountTest = {
        id: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted
      };
    } catch (err: any) {
      accountError = err.message;
    }
    
    // Test 3: Try a simple balance check
    let balanceTest = null;
    let balanceError = null;
    
    try {
      const balance = await stripe.balance.retrieve();
      balanceTest = 'Success - can retrieve balance';
    } catch (err: any) {
      balanceError = err.message;
    }
    
    // Test 4: Raw fetch directly to Stripe REST API (bypasses SDK)
    let fetchTest = null;
    let fetchError = null;
    try {
      const r = await fetch('https://api.stripe.com/v1/balance', {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      });
      const body = await r.json();
      fetchTest = { status: r.status, ok: r.ok, body };
    } catch (err: any) {
      fetchError = err.message;
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      envCheck: {
        hasStripeKey: hasKey,
        keyPrefix: keyPrefix,
        keyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
        keyHasWhitespace: /\s/.test(process.env.STRIPE_SECRET_KEY || ''),
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? '(not set)',
        siteUrlValid: (process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? '').startsWith('http'),
      },
      accountTest,
      accountError,
      balanceTest,
      balanceError,
      fetchTest,
      fetchError,
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Diagnostic failed',
      message: error.message
    }, { status: 500 });
  }
}