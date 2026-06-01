// LANDR Mastering API Integration
// Production-ready implementation using LANDR API v1

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const LANDR_API_URL = 'https://api.landr.com/mastering/v1'

export async function POST(request: NextRequest) {
  try {
    const LANDR_API_KEY = process.env.LANDR_MASTERING_API_KEY

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if LANDR API is configured
    if (!LANDR_API_KEY) {
      return NextResponse.json(
        { error: 'Mastering service not configured. Please contact support.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { trackId, artistId, style = 'balanced', loudness = 'medium', format = 'wav' } = body

    if (!trackId || !artistId) {
      return NextResponse.json(
        { error: 'Track ID and Artist ID required' },
        { status: 400 }
      )
    }

    // Get track details from database
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .single()

    if (trackError || !track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      )
    }

    // Check if artist owns this track
    if (track.artist_id !== artistId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Validate LANDR parameters
    const validStyles = ['warm', 'balanced', 'open']
    const validLoudness = ['low', 'medium', 'high']
    const validFormats = ['cd', 'mp3', 'wav']

    const finalStyle = validStyles.includes(style) ? style : 'balanced'
    const finalLoudness = validLoudness.includes(loudness) ? loudness : 'medium'
    const finalFormat = validFormats.includes(format) ? format : 'wav'

    // Create mastering job in database
    const { data: masteringJob, error: jobError } = await supabase
      .from('mastering_jobs')
      .insert({
        track_id: trackId,
        artist_id: artistId,
        status: 'pending_payment',
        style: finalStyle,
        loudness: finalLoudness,
        format: finalFormat,
        original_audio_url: track.audio_url,
        cost: 9.99,
        landr_master_id: null
      })
      .select()
      .single()

    if (jobError) throw jobError

    return NextResponse.json({
      success: true,
      job: masteringJob,
      message: 'Mastering job created. Payment required to proceed.',
      paymentUrl: `/api/mastering/pay/${masteringJob.id}`,
      estimatedTime: '30-60 seconds'
    })

  } catch (error: any) {
    console.error('Mastering API Error:', error)
    return NextResponse.json(
      { error: 'Failed to create mastering job', details: error.message },
      { status: 500 }
    )
  }
}

// Get mastering status
export async function GET(request: NextRequest) {
  try {
    const LANDR_API_KEY = process.env.LANDR_MASTERING_API_KEY

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID required' },
        { status: 400 }
      )
    }

    const { data: job, error } = await supabase
      .from('mastering_jobs')
      .select(`
        *,
        tracks:track_id (title, cover_url)
      `)
      .eq('id', jobId)
      .single()

    if (error || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // If job has a LANDR master ID and is processing, check LANDR status
    if (job.landr_master_id && job.status === 'processing') {
      try {
        const landrResponse = await fetch(
          `${LANDR_API_URL}/master/single/${job.landr_master_id}/status`,
          {
            headers: {
              'x-landr-mastering-api-key': LANDR_API_KEY!
            }
          }
        )

        if (landrResponse.ok) {
          const landrData = await landrResponse.json()

          if (landrData.status === 'completed') {
            const downloadResponse = await fetch(
              `${LANDR_API_URL}/master/single/${job.landr_master_id}/download`,
              {
                headers: {
                  'x-landr-mastering-api-key': LANDR_API_KEY!
                }
              }
            )

            if (downloadResponse.ok) {
              const downloadData = await downloadResponse.json()

              await supabase
                .from('mastering_jobs')
                .update({
                  status: 'completed',
                  mastered_audio_url: downloadData.downloadUrl,
                  completed_at: new Date().toISOString()
                })
                .eq('id', jobId)

              job.status = 'completed'
              job.mastered_audio_url = downloadData.downloadUrl
            }
          } else if (landrData.status === 'failed') {
            await supabase
              .from('mastering_jobs')
              .update({
                status: 'failed',
                error_message: landrData.error?.details || 'Mastering failed'
              })
              .eq('id', jobId)

            job.status = 'failed'
            job.error_message = landrData.error?.details
          }
        }
      } catch (landrError) {
        console.error('LANDR API Error:', landrError)
      }
    }

    return NextResponse.json({ job })

  } catch (error: any) {
    console.error('Mastering Status Error:', error)
    return NextResponse.json(
      { error: 'Failed to get mastering status' },
      { status: 500 }
    )
  }
}
