import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { detectPlatform, isValidUrl } from '@/lib/link-platforms';

// Verify Bearer token and check that caller owns the artistId or labelId
async function verifyOwner(request: NextRequest, artistId?: string | null, labelId?: string | null): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized — Bearer token required' }, { status: 401 }) as any;
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized — invalid token' }, { status: 401 }) as any;
  }

  // If modifying, verify ownership
  if (artistId && user.id !== artistId) {
    return NextResponse.json({ error: 'Forbidden — you do not own this artist account' }, { status: 403 }) as any;
  }
  if (labelId && user.id !== labelId) {
    return NextResponse.json({ error: 'Forbidden — you do not own this label account' }, { status: 403 }) as any;
  }

  return { userId: user.id };
}

// GET - Fetch links for an artist or label
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

    // Check if caller is the owner — if so, show all links including hidden ones
    const authHeader = request.headers.get('authorization');
    let isOwner = false;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        if (artistId && user.id === artistId) isOwner = true;
        if (labelId && user.id === labelId) isOwner = true;
      }
    }

    const supabase = createClient();
    let query = supabase
      .from('social_links')
      .select('*')
      .order('position', { ascending: true });

    // Only filter hidden links for non-owners
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

    // Verify ownership
    const ownerCheck = await verifyOwner(request, artistId, labelId);
    if ('error' in ownerCheck) return ownerCheck as NextResponse;

    const supabase = createClient();

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

    const supabase = createClient();

    // Fetch the link to check ownership
    const { data: existingLink, error: fetchError } = await supabase
      .from('social_links')
      .select('id, artist_id, label_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Verify ownership of the link owner
    const ownerCheck = await verifyOwner(request, existingLink.artist_id, existingLink.label_id);
    if ('error' in ownerCheck) return ownerCheck as NextResponse;

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

    const supabase = createClient();

    // Fetch the link to check ownership
    const { data: existingLink, error: fetchError } = await supabase
      .from('social_links')
      .select('id, artist_id, label_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Verify ownership of the link owner
    const ownerCheck = await verifyOwner(request, existingLink.artist_id, existingLink.label_id);
    if ('error' in ownerCheck) return ownerCheck as NextResponse;

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