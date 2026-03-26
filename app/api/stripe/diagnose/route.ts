import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
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
      const account = await stripe.accounts.retrieve('acct_1T23nFKSY7M6vQDj');
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
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      envCheck: {
        hasStripeKey: hasKey,
        keyPrefix: keyPrefix,
        keyLength: process.env.STRIPE_SECRET_KEY?.length || 0
      },
      accountTest,
      accountError,
      balanceTest,
      balanceError
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Diagnostic failed',
      message: error.message
    }, { status: 500 });
  }
}