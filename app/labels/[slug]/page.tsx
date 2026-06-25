// Universal Label Page - With error recovery
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, Music, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LabelPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!slug) {
      setError('No label specified');
      setLoading(false);
      return;
    }
    
    const fetchLabel = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Add cache-busting parameter
        const cacheBuster = `?t=${Date.now()}`;
        const res = await fetch(`/api/label/${slug}${cacheBuster}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        const text = await res.text();
        
        // Check if response is HTML (error page)
        if (text.trim().startsWith('<')) {
          throw new Error('Server returned HTML instead of JSON. Please try again.');
        }
        
        let json;
        try {
          json = JSON.parse(text);
        } catch (parseErr) {
          throw new Error('Invalid response from server. Please try again.');
        }
        
        if (!res.ok || json.error) {
          throw new Error(json.error || 'Failed to load label');
        }
        
        setData(json);
      } catch (err) {
        console.error('Label fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLabel();
  }, [slug, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Music className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading label...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-red-500 mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button asChild>
              <Link href="/">Back Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.label) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Label not found</p>
          <Button asChild>
            <Link href="/">Back Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { label, tracks } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative h-48 sm:h-64 overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-600">
        {label.bannerUrl && (
          <img
            src={label.bannerUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end gap-4 -mt-12 sm:-mt-16 pb-6">
          <div className="h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-md border-4 border-background bg-card shadow-lg">
            {label.logoUrl ? (
              <img src={label.logoUrl} alt={`${label.name} logo`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Music className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="pb-1">
            <h1 className="text-2xl sm:text-3xl font-bold">{label.name}</h1>
            <p className="text-sm text-muted-foreground">
              {tracks?.length || 0} tracks · Lossless formats
            </p>
          </div>
        </div>
        <p className="max-w-2xl pb-8 text-muted-foreground">
          {label.description || label.bio || 'Independent record label'}
        </p>
      </div>

      {/* Tracks Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-6">Releases</h2>
        
        {!tracks || tracks.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No releases yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {tracks.map((track: any) => (
              <Card key={track.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Cover */}
                  <div className="relative aspect-square bg-muted">
                    {track.coverArt || track.cover_url ? (
                      <img
                        src={track.coverArt || track.cover_url}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🎵
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold truncate text-sm" title={track.title}>
                      {track.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.artist}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-semibold text-green-600 text-sm">
                        ${track.price}
                      </span>
                      <Link href={track.buyUrl || `/track/${track.id}`} target="_blank">
                        <Button size="sm" variant="ghost" className="text-xs">
                          Buy <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by <Link href="/" className="text-primary hover:underline">Artistrax</Link>
            {' '}· Where an artist can be an artist
          </p>
        </div>
      </div>
    </div>
  );
}