import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Radio, Users, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LiveStreamsPage() {
  const supabase = createClient()

  // Fetch active live streams
  const { data: streams } = await supabase
    .from('live_streams')
    .select(`
      *,
      artists:artist_id (display_name, username, avatar_url),
      labels:label_id (name, slug, logo_url)
    `)
    .eq('status', 'live')
    .eq('is_public', true)
    .order('started_at', { ascending: false })

  // Fetch scheduled streams
  const { data: scheduled } = await supabase
    .from('live_streams')
    .select(`
      *,
      artists:artist_id (display_name, username, avatar_url),
      labels:label_id (name, slug, logo_url)
    `)
    .eq('status', 'scheduled')
    .eq('is_public', true)
    .order('scheduled_for', { ascending: true })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Radio className="w-10 h-10 text-red-500" />
            Live Now
          </h1>
          <p className="text-xl text-gray-600">
            Watch live DJ sets, production sessions, and exclusive performances
          </p>
        </div>

        {/* Live Streams */}
        {streams && streams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {streams.map((stream) => (
              <Link key={stream.id} href={`/live/${stream.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                  <div className="aspect-video bg-gray-900 relative">
                    {stream.thumbnail_url ? (
                      <img
                        src={stream.thumbnail_url}
                        alt={stream.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-16 h-16 text-gray-700" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span className="text-sm font-bold">LIVE</span>
                    </div>
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{stream.max_viewers} viewers</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{stream.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {stream.artists?.display_name || stream.labels?.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow mb-12">
            <Radio className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Live Streams Right Now</h2>
            <p className="text-gray-500 mb-6">Check back later for live performances</p>
            <Link href="/">
              <Button>Browse Artists</Button>
            </Link>
          </div>
        )}

        {/* Scheduled Streams */}
        {scheduled && scheduled.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Coming Up</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduled.map((stream) => (
                <Card key={stream.id} className="opacity-75">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <Video className="w-16 h-16 text-gray-400" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{stream.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {stream.artists?.display_name || stream.labels?.name}
                    </p>
                    <p className="text-sm text-blue-600">
                      {stream.scheduled_for 
                        ? new Date(stream.scheduled_for).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })
                        : 'Scheduled soon'
                      }
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}