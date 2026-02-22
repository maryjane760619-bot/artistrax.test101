// LANDR Preview API
// Let artists hear a preview before paying for full master

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LANDR_API_KEY = process.env.LANDR_MASTERING_API_KEY;
const LANDR_API_URL = 'https://api.landr.com/mastering/v1';

export async function POST(request) {
  try {
    // Check if LANDR API is configured
    if (!LANDR_API_KEY) {
      return NextResponse.json(
        { error: 'Preview service not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { trackId, artistId, style = 'balanced', loudness = 'medium' } = body;

    if (!trackId || !artistId) {
      return NextResponse.json(
        { error: 'Track ID and Artist ID required' },
        { status: 400 }
      );
    }

    // Get track details
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

    // Check ownership
    if (track.artist_id !== artistId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create LANDR preview
    const landrResponse = await fetch(`${LANDR_API_URL}/preview/single`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-landr-mastering-api-key': LANDR_API_KEY
      },
      body: JSON.stringify({
        inputUri: track.audio_url,
        style,
        loudness
      })
    });

    if (landrResponse.status === 202) {
      const landrData = await landrResponse.json();
      
      return NextResponse.json({
        success: true,
        previewId: landrData.id,
        statusUrl: landrData.location,
        message: 'Preview processing. Check status in ~10 seconds.'
      });
    } else {
      const errorData = await landrResponse.text();
      console.error('LANDR Preview Error:', errorData);
      
      return NextResponse.json(
        { error: 'Preview service temporarily unavailable' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Preview API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create preview', details: error.message },
      { status: 500 }
    );
  }
}

// Get preview status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const previewId = searchParams.get('previewId');

    if (!previewId) {
      return NextResponse.json(
        { error: 'Preview ID required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${LANDR_API_URL}/preview/single/${previewId}/status`,
      {
        headers: {
          'x-landr-mastering-api-key': LANDR_API_KEY
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Preview not found' },
        { status: 404 }
      );
    }

    const data = await response.json();

    // If completed, get download URL
    if (data.status === 'completed') {
      const downloadResponse = await fetch(
        `${LANDR_API_URL}/preview/single/${previewId}/download`,
        {
          headers: {
            'x-landr-mastering-api-key': LANDR_API_KEY
          }
        }
      );

      if (downloadResponse.ok) {
        const downloadData = await downloadResponse.json();
        data.downloadUrl = downloadData.downloadUrl;
      }
    }

    return NextResponse.json({ preview: data });

  } catch (error) {
    console.error('Preview Status Error:', error);
    return NextResponse.json(
      { error: 'Failed to get preview status' },
      { status: 500 }
    );
  }
}