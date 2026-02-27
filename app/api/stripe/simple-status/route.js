// Simple direct database check for Stripe status
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    // Get Siesta Records directly
    const { data: label, error } = await supabase
      .from('labels')
      .select('id, name, slug, stripe_account_id, stripe_charges_enabled, stripe_onboarding_complete, stripe_details_submitted')
      .eq('slug', 'siesta-records')
      .single();

    if (error || !label) {
      return NextResponse.json({ 
        error: 'Label not found',
        details: error 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      label: {
        id: label.id,
        name: label.name,
        slug: label.slug,
        hasStripeAccount: !!label.stripe_account_id,
        stripeAccountId: label.stripe_account_id,
        chargesEnabled: label.stripe_charges_enabled,
        onboardingComplete: label.stripe_onboarding_complete,
        detailsSubmitted: label.stripe_details_submitted
      },
      allFlagsTrue: label.stripe_charges_enabled && label.stripe_onboarding_complete && label.stripe_details_submitted
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}