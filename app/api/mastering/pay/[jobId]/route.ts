// LANDR Mastering Payment & Processing
// Creates LANDR mastering job after payment

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const LANDR_API_KEY = process.env.LANDR_MASTERING_API_KEY
const LANDR_API_URL = 'https://api.landr.com/mastering/v1'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    const body = await request.json()
    const { paymentMethodId } = body

    // Lazy init: create clients inside handler
    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim(), {
      apiVersion: '2026-01-28.clover'
    })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if LANDR API is configured
    if (!LANDR_API_KEY) {
      return NextResponse.json(
        { error: 'Mastering service not configured' },
        { status: 503 }
      )
    }

    // Get mastering job details
    const { data: job, error: jobError } = await supabase
      .from('mastering_jobs')
      .select(`
        *,
        artists:artist_id (email, display_name),
        tracks:track_id (title, audio_url)
      `)
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Mastering job not found' },
        { status: 404 }
      )
    }

    if (job.status !== 'pending_payment') {
      return NextResponse.json(
        { error: 'Job already processed or invalid status' },
        { status: 400 }
      )
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(job.cost * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      description: `LANDR Mastering: ${job.tracks.title}`,
      metadata: {
        jobId: job.id,
        trackId: job.track_id,
        artistId: job.artist_id,
        service: 'landr-mastering'
      }
    })

    if (paymentIntent.status === 'succeeded') {
      // Update job to processing
      await supabase
        .from('mastering_jobs')
        .update({
          status: 'processing',
          payment_id: paymentIntent.id,
          paid_at: new Date().toISOString()
        })
        .eq('id', jobId)

      // Create LANDR mastering job
      try {
        const landrResponse = await fetch(`${LANDR_API_URL}/master/single`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-landr-mastering-api-key': LANDR_API_KEY
          },
          body: JSON.stringify({
            inputUri: job.original_audio_url,
            style: job.style,
            loudness: job.loudness || 'medium',
            format: job.format || 'wav'
          })
        })

        if (landrResponse.status === 202) {
          const landrData = await landrResponse.json()

          // Store LANDR master ID
          await supabase
            .from('mastering_jobs')
            .update({
              landr_master_id: landrData.id,
              landr_status_url: landrData.location
            })
            .eq('id', jobId)

          return NextResponse.json({
            success: true,
            message: 'Payment successful. Mastering in progress with LANDR...',
            jobId: job.id,
            landrJobId: landrData.id,
            estimatedTime: '30-60 seconds'
          })
        } else {
          const errorData = await landrResponse.text()
          console.error('LANDR API Error:', errorData)

          // Refund the payment since LANDR job failed
          await stripe.refunds.create({
            payment_intent: paymentIntent.id,
            reason: 'requested_by_customer'
          })

          await supabase
            .from('mastering_jobs')
            .update({
              status: 'failed',
              error_message: 'LANDR service temporarily unavailable. Payment refunded.'
            })
            .eq('id', jobId)

          return NextResponse.json(
            { error: 'Mastering service temporarily unavailable. Payment refunded.' },
            { status: 503 }
          )
        }
      } catch (landrError) {
        console.error('LANDR API Error:', landrError)

        // Refund on error
        await stripe.refunds.create({
          payment_intent: paymentIntent.id,
          reason: 'requested_by_customer'
        })

        await supabase
          .from('mastering_jobs')
          .update({
            status: 'failed',
            error_message: 'Service error. Payment refunded.'
          })
          .eq('id', jobId)

        return NextResponse.json(
          { error: 'Service error. Payment refunded.' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Payment failed', status: paymentIntent.status },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Mastering Payment Error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed', details: error.message },
      { status: 500 }
    )
  }
}