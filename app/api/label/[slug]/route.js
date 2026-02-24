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
    console.log('Looking for label with slug:', slug);
    
    // First, try to list all labels (for debugging)
    const { data: allLabels, error: listError } = await supabase
      .from('labels')
      .select('id, name, slug')
      .limit(10);
    
    console.log('Available labels:', allLabels);
    console.log('List error:', listError);

    // Try exact match first
    const { data: exactMatch, error: exactError } = await supabase
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
      .eq('slug', slug)
      .maybeSingle();
    
    console.log('Exact match:', exactMatch);
    console.log('Exact error:', exactError);

    let label = exactMatch;

    // If not found, try case-insensitive
    if (!label) {
      const { data: caseMatch } = await supabase
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
        .ilike('slug', slug)
        .maybeSingle();
      
      label = caseMatch;
      console.log('Case match:', caseMatch);
    }

    // Try name match
    if (!label) {
      const { data: nameMatch } = await supabase
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
        .ilike('name', slug.replace(/-/g, ' '))
        .maybeSingle();
      
      label = nameMatch;
      console.log('Name match:', nameMatch);
    }

    if (!label) {
      return NextResponse.json({ 
        error: 'Label not found',
        searched: slug,
        availableLabels: allLabels?.map(l => ({ name: l.name, slug: l.slug })) || []
      }, { status: 404 });
    }

    console.log('Found label:', label);

    // Get artists for this label
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('id, display_name, username')
      .eq('label_id', label.id);

    console.log('Artists:', artists);
    console.log('Artists error:', artistsError);

    const artistIds = artists?.map(a => a.id) || [];

    // Get tracks by these artists
    let tracks = [];
    if (artistIds.length > 0) {
      const { data: tracksData, error: tracksError } = await supabase
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

      console.log('Tracks:', tracksData);
      console.log('Tracks error:', tracksError);

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
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}