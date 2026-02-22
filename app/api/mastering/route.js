// LANDR Mastering Integration for Artistrax
// Allows artists to master tracks directly on the platform

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// LANDR API configuration
const LANDR_API_KEY = process.env.LANDR_API_KEY;
const LANDR_API_URL = 'https://api.landr.com/v1';

export async function POST(request) {
  try {
    const body = await request.json();
    const { trackId, artistId, style = 'balanced', intensity = 'medium' } = body;

    if (!trackId || !artistId) {
      return NextResponse.json(
        { error: 'Track ID and Artist ID required' },
        { status: 400 }
      );
    }

    // Get track details from database
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .single();

    if (trackError || !track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    // Check if artist owns this track
    if (track.artist_id !== artistId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create mastering job in database
    const { data: masteringJob, error: jobError } = await supabase
      .from('mastering_jobs')
      .insert({
        track_id: trackId,
        artist_id: artistId,
        status: 'pending',
        style,
        intensity,
        original_audio_url: track.audio_url,
        cost: 9.99 // LANDR per-track cost
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // In production, this would call LANDR API
    // For now, return the job details
    return NextResponse.json({
      success: true,
      job: masteringJob,
      message: 'Mastering job created. Payment required to proceed.',
      paymentUrl: `/api/mastering/pay/${masteringJob.id}`
    });

  } catch (error) {
    console.error('Mastering API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create mastering job' },
      { status: 500 }
    );
  }
}

// Get mastering status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID required' },
        { status: 400 }
      );
    }

    const { data: job, error } = await supabase
      .from('mastering_jobs')
      .select(`
        *,
        tracks:track_id (title, cover_url)
      `)
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ job });

  } catch (error) {
    console.error('Mastering Status Error:', error);
    return NextResponse.json(
      { error: 'Failed to get mastering status' },
      { status: 500 }
    );
  }
}