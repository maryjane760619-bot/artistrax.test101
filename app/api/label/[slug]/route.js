// Label API - queries database
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    // Get label
    const { data: label } = await supabase
      .from('labels')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!label) {
      return NextResponse.json({ error: 'Label not found' }, { status: 404 });
    }

    // Get tracks
    const { data: tracks } = await supabase
      .from('tracks')
      .select(`
        id, title, price, cover_url,
        artists:artist_id (display_name)
      `)
      .eq('label_id', label.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      label: {
        id: label.id,
        name: label.name,
        slug: label.slug,
        description: label.bio,
        totalTracks: tracks?.length || 0
      },
      tracks: tracks?.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artists?.display_name || 'Unknown',
        price: t.price,
        coverArt: t.cover_url,
        buyUrl: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/track/${t.id}`
      })) || []
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}