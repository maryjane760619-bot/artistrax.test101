import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    // Get Siesta Records label
    const { data: label } = await supabase
      .from('labels')
      .select('id, name, email, stripe_account_id, stripe_onboarding_complete, stripe_charges_enabled, stripe_details_submitted')
      .eq('slug', 'siesta-records')
      .single();

    if (!label) {
      return NextResponse.json({ error: 'Label not found' }, { status: 404 });
    }

    return NextResponse.json({
      label: {
        name: label.name,
        email: label.email,
        hasStripeAccount: !!label.stripe_account_id,
        stripeAccountId: label.stripe_account_id,
        onboardingComplete: label.stripe_onboarding_complete,
        chargesEnabled: label.stripe_charges_enabled,
        detailsSubmitted: label.stripe_details_submitted
      },
      message: label.stripe_account_id 
        ? 'You have a Stripe account. Check if onboarding is complete.'
        : 'No Stripe account connected yet.'
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}