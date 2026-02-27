'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function LinkTracksPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const linkTracks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/link-all-tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-md mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">🔗 Link Tracks to Siesta Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-center">
                This will link all tracks and artists to the Siesta Records label.
              </p>
              
              <Button 
                onClick={linkTracks}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Linking...
                  </>
                ) : (
                  'Link All Tracks'
                )}
              </Button>

              {result && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Success!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tracks found: {result.tracksFound}<br/>
                    Tracks updated: {result.tracksUpdated}<br/>
                    Artists updated: {result.artistsUpdated}
                  </p>
                  <Button asChild className="w-full mt-4" variant="outline">
                    <a href="/labels/siesta-records" target="_blank">
                      View Label Page →
                    </a>
                  </Button>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Error</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}