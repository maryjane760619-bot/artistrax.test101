// Universal Label API - works for any label
// GET /api/label/[slug]
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
    
    // Search by slug
    for (const trySlug of slugVariations) {
      const { data } = await supabase
        .from('labels')
        .select(`
          id, 
          name, 
          slug, 
          bio,
          logo_url,
          website,
          instagram,
          twitter
        `)
        .eq('slug', trySlug)
        .single();
      
      if (data) {
        label = data;
        break;
      }
    }

    // Search by name if not found
    if (!label) {
      for (const trySlug of slugVariations) {
        const { data } = await supabase
          .from('labels')
          .select(`
            id, 
            name, 
            slug, 
            bio,
            logo_url,
            website,
            instagram,
            twitter
          `)
          .ilike('name', trySlug.replace(/-/g, ' '))
          .single();
        
        if (data) {
          label = data;
          break;
        }
      }
    }

    if (!label) {
      return NextResponse.json({ 
        error: 'Label not found',
        tried: slugVariations 
      }, { status: 404 });
    }

    // Get artists for this label
    const { data: artists } = await supabase
      .from('artists')
      .select('id, display_name, username')
      .eq('label_id', label.id);

    const artistIds = artists?.map(a => a.id) || [];

    // Get tracks by these artists
    let tracks = [];
    if (artistIds.length > 0) {
      const { data: tracksData } = await supabase
        .from('tracks')
        .select(`
          id,
          title,
          slug,
          description,
          audio_url,
          cover_url,
          duration,
          price,
          is_free,
          play_count,
          download_count,
          created_at,
          artists:artist_id (display_name, username)
        `)
        .in('artist_id', artistIds)
        .order('created_at', { ascending: false });

      tracks = tracksData || [];
    }

    // Format response
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artists?.display_name || 'Unknown Artist',
      artistUsername: track.artists?.username,
      price: track.is_free ? 0 : track.price,
      coverArt: track.cover_url,
      audioUrl: track.audio_url,
      duration: track.duration,
      plays: track.play_count,
      downloads: track.download_count,
      buyUrl: `https://artistrax.com/track/${track.id}`,
      createdAt: track.created_at
    }));

    return NextResponse.json({
      label: {
        id: label.id,
        name: label.name,
        slug: label.slug,
        description: label.bio,
        avatar: label.logo_url,
        website: label.website,
        instagram: label.instagram,
        twitter: label.twitter,
        totalTracks: formattedTracks.length
      },
      tracks: formattedTracks
    });
  } catch (error) {
    console.error('Label API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch label data',
      details: error.message 
    }, { status: 500 });
  }
}