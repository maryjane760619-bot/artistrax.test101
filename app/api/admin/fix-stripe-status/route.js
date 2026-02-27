import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST() {
  try {
    // Update Siesta Records Stripe status
    const { data, error } = await supabase
      .from('labels')
      .update({
        stripe_onboarding_complete: true,
        stripe_charges_enabled: true,
        stripe_details_submitted: true
      })
      .eq('slug', 'siesta-records')
      .select('id, stripe_account_id, stripe_charges_enabled');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Stripe status updated',
      label: data
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}