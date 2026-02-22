// Mastering Payment Processing
// Stripe integration for LANDR mastering payments

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request, { params }) {
  try {
    const { jobId } = params;
    const body = await request.json();
    const { paymentMethodId } = body;

    // Get mastering job details
    const { data: job, error: jobError } = await supabase
      .from('mastering_jobs')
      .select(`
        *,
        artists:artist_id (email, display_name),
        tracks:track_id (title)
      `)
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Mastering job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'pending') {
      return NextResponse.json(
        { error: 'Job already processed' },
        { status: 400 }
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(job.cost * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      description: `Mastering: ${job.tracks.title}`,
      metadata: {
        jobId: job.id,
        trackId: job.track_id,
        artistId: job.artist_id
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Update job status
      await supabase
        .from('mastering_jobs')
        .update({
          status: 'processing',
          payment_id: paymentIntent.id,
          paid_at: new Date().toISOString()
        })
        .eq('id', jobId);

      // In production, this would trigger LANDR API call
      // For now, simulate processing
      setTimeout(async () => {
        await supabase
          .from('mastering_jobs')
          .update({
            status: 'completed',
            mastered_audio_url: `${job.original_audio_url}?mastered=true`,
            completed_at: new Date().toISOString()
          })
          .eq('id', jobId);
      }, 30000); // Simulate 30 second processing

      return NextResponse.json({
        success: true,
        message: 'Payment successful. Mastering in progress...',
        jobId: job.id
      });
    } else {
      return NextResponse.json(
        { error: 'Payment failed', status: paymentIntent.status },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Mastering Payment Error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}