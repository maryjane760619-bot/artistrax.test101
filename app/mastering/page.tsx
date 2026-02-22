// Artistrax Mastering Service Page
// Artists can master their tracks here

'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MasteringPanel } from '@/components/mastering-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Wand2, Music, CreditCard, CheckCircle } from 'lucide-react';

export default function MasteringPage() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [masteringHistory, setMasteringHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Fetch artist's tracks
    supabase
      .from('tracks')
      .select('*')
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTracks(data || []);
        setLoading(false);
      });

    // Fetch mastering history
    supabase
      .from('mastering_jobs')
      .select(`
        *,
        tracks:track_id (title, cover_url)
      `)
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMasteringHistory(data || []);
      });
  }, [user]);

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">AI Mastering</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to access mastering services
            </p>
            <Button asChild>
              <a href="/artist/login">Sign In</a>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              AI Mastering
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional-quality mastering powered by LANDR. 
              Make your tracks release-ready in seconds.
            </p>
            <p className="text-primary italic mt-2">
              Where an artist can be an artist
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <Wand2 className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced algorithms analyze and optimize your tracks
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Music className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Multiple Styles</h3>
                <p className="text-sm text-muted-foreground">
                  Warm, balanced, open, or loud - choose your sound
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Instant Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Get mastered tracks in under a minute
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Mastering Panel */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Master a Track</h2>
              
              {loading ? (
                <p className="text-muted-foreground">Loading your tracks...</p>
              ) : tracks.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">
                      No tracks found. Upload a track first to master it.
                    </p>
                    <Button asChild className="w-full mt-4">
                      <a href="/artist/upload">Upload Track</a>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Select 
                    value={selectedTrack?.id} 
                    onValueChange={(id) => setSelectedTrack(tracks.find(t => t.id === id))}
                  >
                    <SelectTrigger className="mb-6">
                      <SelectValue placeholder="Select a track to master" />
                    </SelectTrigger>
                    <SelectContent>
                      {tracks.map(track => (
                        <SelectItem key={track.id} value={track.id}>
                          {track.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedTrack && (
                    <MasteringPanel
                      trackId={selectedTrack.id}
                      trackTitle={selectedTrack.title}
                      audioUrl={selectedTrack.audio_url}
                      onMasteringComplete={(url) => {
                        console.log('Mastered:', url);
                      }}
                    />
                  )}
                </>
              )}
            </div>

            {/* History */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Mastering History</h2>
              
              {masteringHistory.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">
                      No mastering jobs yet. Master your first track!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {masteringHistory.map(job => (
                    <Card key={job.id}>
                      <CardContent className="pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {job.tracks?.cover_url ? (
                            <img 
                              src={job.tracks.cover_url} 
                              alt="" 
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <Music className="w-12 h-12 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium">{job.tracks?.title}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {job.style} • {job.intensity} intensity
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            job.status === 'completed' ? 'bg-green-100 text-green-700' :
                            job.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {job.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                            {job.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pricing Info */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-semibold mb-4">Simple Pricing</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="border-primary">
                <CardContent className="pt-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">Standard</h3>
                  <p className="text-4xl font-bold mb-4">$9.99</p>
                  <p className="text-sm text-muted-foreground mb-4">per track</p>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      AI mastering
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Streaming optimized
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Instant delivery
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      WAV + MP3 formats
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">Pro</h3>
                  <p className="text-4xl font-bold mb-4">$24.99</p>
                  <p className="text-sm text-muted-foreground mb-4">per track</p>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      AI + Human review
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      All formats
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      2 revision rounds
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Stem mastering
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}