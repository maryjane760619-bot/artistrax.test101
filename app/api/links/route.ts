import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { detectPlatform, isValidUrl } from '@/lib/link-platforms';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getAuthedUser(request: NextRequest, supabase: ReturnType<typeof createClient>) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

// GET - Fetch links for an artist or label
// Public visitors only see visible links; the owner viewing their own
// dashboard editor (verified via Bearer token) sees all of them, including
// hidden ones -- otherwise hiding a link made it impossible to un-hide.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get('artistId');
    const labelId = searchParams.get('labelId');

    if (!artistId && !labelId) {
      return NextResponse.json(
        { error: 'artistId or labelId required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    const user = await getAuthedUser(request, supabase);
    const isOwner = !!user && user.id === (artistId || labelId);

    let query = supabase
      .from('social_links')
      .select('*')
      .order('position', { ascending: true });

    if (!isOwner) {
      query = query.eq('is_visible', true);
    }

    if (artistId) {
      query = query.eq('artist_id', artistId);
    } else if (labelId) {
      query = query.eq('label_id', labelId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch links:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ links: data || [] });
  } catch (error: any) {
    console.error('GET links error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// POST - Create new link
export async function POST(request: NextRequest) {
  try {
    const { artistId, labelId, title, url, platform } = await request.json();

    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL required' },
        { status: 400 }
      );
    }

    if (!artistId && !labelId) {
      return NextResponse.json(
        { error: 'artistId or labelId required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Caller must be the artist/label they're claiming to create a link for --
    // otherwise anyone could plant links on someone else's public profile.
    const user = await getAuthedUser(request, supabase);
    if (!user || user.id !== (artistId || labelId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current max position
    let maxPosQuery = supabase
      .from('social_links')
      .select('position')
      .order('position', { ascending: false })
      .limit(1);

    if (artistId) {
      maxPosQuery = maxPosQuery.eq('artist_id', artistId);
    } else if (labelId) {
      maxPosQuery = maxPosQuery.eq('label_id', labelId);
    }

    const { data: maxPosData } = await maxPosQuery;
    const nextPosition = (maxPosData?.[0]?.position || 0) + 1;

    // Auto-detect platform if not provided
    const detectedPlatform = platform || detectPlatform(url);

    // Insert new link
    const { data, error } = await supabase
      .from('social_links')
      .insert({
        artist_id: artistId || null,
        label_id: labelId || null,
        title,
        url,
        platform: detectedPlatform,
        position: nextPosition,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create link:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ link: data });
  } catch (error: any) {
    console.error('POST link error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create link' },
      { status: 500 }
    );
  }
}

// PUT - Update link
export async function PUT(request: NextRequest) {
  try {
    const { id, title, url, platform, isVisible, position } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 });
    }

    if (url && !isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const user = await getAuthedUser(request, supabase);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: existing } = await supabase
      .from('social_links')
      .select('artist_id, label_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    if (existing.artist_id !== user.id && existing.label_id !== user.id) {
      return NextResponse.json({ error: 'Not your link' }, { status: 403 });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (url !== undefined) updates.url = url;
    if (platform !== undefined) updates.platform = platform;
    if (isVisible !== undefined) updates.is_visible = isVisible;
    if (position !== undefined) updates.position = position;

    const { data, error } = await supabase
      .from('social_links')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update link:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ link: data });
  } catch (error: any) {
    console.error('PUT link error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update link' },
      { status: 500 }
    );
  }
}

// DELETE - Remove link
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const user = await getAuthedUser(request, supabase);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: existing } = await supabase
      .from('social_links')
      .select('artist_id, label_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    if (existing.artist_id !== user.id && existing.label_id !== user.id) {
      return NextResponse.json({ error: 'Not your link' }, { status: 403 });
    }

    const { error } = await supabase.from('social_links').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete link:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE link error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete link' },
      { status: 500 }
    );
  }
}
