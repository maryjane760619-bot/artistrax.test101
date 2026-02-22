// Universal Label Landing Page
// Route: /labels/[slug]
// Works for ANY label on Artistrax

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Play, ShoppingBag, ExternalLink, Instagram, Twitter, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function LabelPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [labelData, setLabelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    params.then(p => {
      setSlug(p.slug);
    });
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    
    fetch(`/api/label/${slug}/tracks`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setLabelData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <LabelPageSkeleton />;
  if (error) return <LabelPageError error={error} />;
  if (!labelData) return null;

  const { label, tracks } = labelData;

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {label.banner ? (
          <Image
            src={label.banner}
            alt={label.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500 to-pink-500" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-background bg-muted shrink-0">
            {label.avatar ? (
              <Image
                src={label.avatar}
                alt={label.name}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                🎵
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pb-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{label.name}</h1>
            <p className="text-muted-foreground mb-4 max-w-2xl">
              {label.description || 'Independent record label'}
            </p>
            
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <span className="text-muted-foreground">
                <strong className="text-foreground">{label.totalTracks}</strong> tracks
              </span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">Lossless</strong> formats
              </span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3 pb-4">
            {label.website && (
              <a href={label.website} target="_blank" rel="noopener">
                <Button variant="outline" size="icon">
                  <Globe className="w-4 h-4" />
                </Button>
              </a>
            )}
            {label.socialLinks?.instagram && (
              <a href={label.socialLinks.instagram} target="_blank" rel="noopener">
                <Button variant="outline" size="icon">
                  <Instagram className="w-4 h-4" />
                </Button>
              </a>
            )}
            {label.socialLinks?.twitter && (
              <a href={label.socialLinks.twitter} target="_blank" rel="noopener">
                <Button variant="outline" size="icon">
                  <Twitter className="w-4 h-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-6">Releases</h2>
        
        {tracks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No releases yet</p>
            <p>Check back soon for new music</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        )}
      </div>

      {/* Embed Widget Section (for labels to copy) */}
      <div className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <h3 className="text-lg font-semibold mb-4">Embed this catalog on your website</h3>
          <code className="block bg-background p-4 rounded-lg text-sm overflow-x-auto">
            {`<iframe src="https://artistrax.com/embed/label/${slug}" width="100%" height="600" frameborder="0"></iframe>`}
          </code>
        </div>
      </div>
    </div>
  );
}

function TrackCard({ track }) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Cover Art */}
        <div className="relative aspect-square bg-muted">
          {track.coverArt ? (
            <Image
              src={track.coverArt}
              alt={track.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🎵
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {track.previewUrl && (
              <Button size="icon" variant="secondary">
                <Play className="w-4 h-4" />
              </Button>
            )}
            <Link href={track.buyUrl}>
              <Button size="icon" variant="secondary">
                <ShoppingBag className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold truncate" title={track.title}>
            {track.title}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {track.artist}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="font-semibold text-green-600">
              ${track.price}
            </span>
            <Link href={track.buyUrl}>
              <Button size="sm" variant="ghost">
                Buy <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LabelPageSkeleton() {
  return (
    <div className="min-h-screen">
      <Skeleton className="h-64 md:h-80 w-full" />
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="flex gap-6">
          <Skeleton className="w-32 h-32 rounded-xl shrink-0" />
          <div className="flex-1 space-y-3 pt-8">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LabelPageError({ error }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Label Not Found</h1>
        <p className="text-muted-foreground">{error}</p>
        <Link href="/labels">
          <Button className="mt-4">Browse All Labels</Button>
        </Link>
      </div>
    </div>
  );
}