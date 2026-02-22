// Universal Label API - works for any label
// GET /api/label/[slug]/tracks
// Next.js App Router format

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, { params }) {
  const { slug } = await params;
  
  if (!slug) {
    return NextResponse.json({ error: 'Label slug required' }, { status: 400 });
  }

  try {
    // Try different slug formats
    const slugVariations = [
      slug,
      slug.toLowerCase(),
      slug.replace(/-/g, ''),
      slug.replace(/-/g, '_'),
      slug.replace(/ /g, '-'),
      slug.replace(/ /g, '_')
    ];
    
    let label = null;
    
    for (const trySlug of slugVariations) {
      const { data } = await supabase
        .from('labels')
        .select(`
          id, 
          name, 
          slug, 
          description, 
          avatar_url,
          banner_url,
          website_url,
          social_links
        `)
        .eq('slug', trySlug)
        .single();
      
      if (data) {
        label = data;
        break;
      }
    }

    if (!label) {
      return NextResponse.json({ 
        error: 'Label not found',
        tried: slugVariations 
      }, { status: 404 });
    }

    // Get all published tracks for this label
    const { data: tracks, error: tracksError } = await supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        price,
        cover_art_url,
        audio_preview_url,
        created_at,
        artists:artist_id (name, slug, avatar_url)
      `)
      .eq('label_id', label.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (tracksError) throw tracksError;

    // Get label stats
    const { count: totalTracks } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('label_id', label.id)
      .eq('status', 'published');

    // Format response
    const formattedTracks = tracks?.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artists?.name || 'Unknown Artist',
      artistSlug: track.artists?.slug,
      artistAvatar: track.artists?.avatar_url,
      price: track.price,
      coverArt: track.cover_art_url,
      previewUrl: track.audio_preview_url,
      buyUrl: `https://artistrax.com/track/${track.id}`,
      createdAt: track.created_at
    })) || [];

    return NextResponse.json({
      label: {
        id: label.id,
        name: label.name,
        slug: label.slug,
        description: label.description,
        avatar: label.avatar_url,
        banner: label.banner_url,
        website: label.website_url,
        socialLinks: label.social_links || {},
        totalTracks: totalTracks || 0
      },
      tracks: formattedTracks
    });
  } catch (error) {
    console.error('Label API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch label data' }, { status: 500 });
  }
}