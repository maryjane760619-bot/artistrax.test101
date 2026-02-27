// Universal Label Page - Simplified version
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Play, ShoppingBag, ExternalLink, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LabelPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    
    const fetchLabel = async () => {
      try {
        const res = await fetch(`/api/label/${slug}`);
        const json = await res.json();
        
        if (!res.ok || json.error) {
          throw new Error(json.error || 'Failed to load label');
        }
        
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLabel();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Music className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button asChild>
            <Link href="/">Back Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { label, tracks } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{label.name}</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            {label.description || label.bio}
          </p>
          <p className="text-sm mt-2 opacity-75">
            {tracks?.length || 0} tracks · Lossless formats
          </p>
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-6">Releases</h2>
        
        {tracks?.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No releases yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {tracks?.map((track: any) => (
              <Card key={track.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Cover */}
                  <div className="relative aspect-square bg-muted">
                    {track.coverArt ? (
                      <img
                        src={track.coverArt}
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
                      <Link href={track.buyUrl} target="_blank">
                        <Button size="sm" variant="ghost">
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

      {/* Embed Section */}
      <div className="border-t bg-muted/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-sm text-muted-foreground">
            Embed this catalog on your website
          </p>
          <code className="block bg-background p-3 rounded mt-2 text-sm overflow-x-auto">
            {`<iframe src="https://artistrax.com/embed/label/${slug}" width="100%" height="600"></iframe>`}
          </code>
        </div>
      </div>
    </div>
  );
}