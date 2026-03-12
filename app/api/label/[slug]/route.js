// Simple Label API - reliable version
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    // Find label
    const { data: label, error: labelError } = await supabase
      .from('labels')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (labelError) {
      return NextResponse.json({ error: 'Database error', details: labelError.message }, { status: 500 });
    }

    if (!label) {
      return NextResponse.json({ error: 'Label not found', slug }, { status: 404 });
    }

    // Get tracks for this label
    const { data: tracks, error: tracksError } = await supabase
      .from('tracks')
      .select(`
        id, title, price, cover_url, audio_url,
        artists:artist_id (display_name)
      `)
      .eq('label_id', label.id)
      .order('created_at', { ascending: false });

    if (tracksError) {
      return NextResponse.json({ error: 'Tracks error', details: tracksError.message }, { status: 500 });
    }

    return NextResponse.json({
      label: {
        id: label.id,
        name: label.name,
        slug: label.slug,
        description: label.bio,
        avatar: label.logo_url,
        totalTracks: tracks?.length || 0
      },
      tracks: tracks?.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artists?.display_name || 'Unknown',
        price: t.price,
        coverArt: t.cover_url,
        buyUrl: `https://artistrax.com/track/${t.id}`
      })) || []
    });

  } catch (error) {
    console.error('Label API Error:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error.message 
    }, { status: 500 });
  }
}