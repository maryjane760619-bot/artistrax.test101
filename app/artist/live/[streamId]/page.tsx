'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Radio, Users, MessageSquare, DollarSign, StopCircle } from 'lucide-react'

interface ChatMessage {
  id: string
  user_name: string
  message: string
  is_artist: boolean
  created_at: string
}

export default function ArtistLiveDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const streamId = params.streamId as string
  
  const [stream, setStream] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [totalTips, setTotalTips] = useState(0)

  useEffect(() => {
    fetchStreamData()
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchStreamData, 5000)
    
    return () => clearInterval(interval)
  }, [streamId])

  // Subscribe to new chat messages
  useEffect(() => {
    if (!streamId) return
    
    const subscription = supabase
      .channel(`artist-stream-${streamId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'stream_chat',
        filter: `stream_id=eq.${streamId}`,
      }, (payload) => {
        setMessages((prev) => [...prev.slice(-49), payload.new as ChatMessage])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [streamId])

  const fetchStreamData = async () => {
    try {
      const response = await fetch(`/api/live-streams/${streamId}`)
      if (!response.ok) {
        router.push('/artist/dashboard')
        return
      }
      const data = await response.json()
      setStream(data.stream)
      setViewerCount(data.stream.viewer_count)
    } catch (e) {
      console.error('Fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  const endStream = async () => {
    if (!confirm('Are you sure you want to end this stream?')) return
    
    try {
      const response = await fetch(`/api/live-streams/${streamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' }),
      })

      if (!response.ok) throw new Error('Failed to end stream')
      
      router.push('/artist/dashboard')
    } catch (e) {
      alert('Failed to end stream')
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/live-streams/${streamId}/chat/${messageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
      }
    } catch (e) {
      console.error('Delete error:', e)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!stream) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-full">
              <Radio className="w-5 h-5 animate-pulse" />
              <span className="font-bold">LIVE NOW</span>
            </div>
            <h1 className="text-2xl font-bold">{stream.title}</h1>
          </div>
          <Button 
            onClick={endStream}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <StopCircle className="w-4 h-4" />
            End Stream
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Current Viewers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{viewerCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{messages.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Tips Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalTips.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stream Preview */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Stream Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <video
                  src={`https://stream.mux.com/${stream.mux_playback_id}.m3u8`}
                  controls
                  className="w-full h-full rounded-lg"
                />
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-400">Stream Key:</p>
                <code className="bg-black text-green-400 px-3 py-2 rounded text-sm block font-mono">
                  {stream.mux_stream_key}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Live Chat */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Live Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 overflow-y-auto space-y-3 pr-2">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex items-start justify-between group">
                    <div className="text-sm">
                      <span className={`font-semibold ${msg.is_artist ? 'text-yellow-400' : 'text-blue-400'}`}>
                        {msg.user_name}
                      </span>
                      <span className="text-gray-300 ml-2">{msg.message}</span>
                    </div>
                    {!msg.is_artist && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="text-red-500 text-xs opacity-0 group-hover:opacity-100 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No messages yet...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6 bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>OBS Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Server:</p>
                <code className="text-green-400">rtmp://live.mux.com/app</code>
              </div>
              <div>
                <p className="text-gray-400">Stream Key:</p>
                <code className="text-green-400">{stream.mux_stream_key}</code>
              </div>
              <div>
                <p className="text-gray-400">Video Bitrate:</p>
                <p className="text-white">4500 kbps (1080p) or 3000 kbps (720p)</p>
              </div>
              <div>
                <p className="text-gray-400">Audio Bitrate:</p>
                <p className="text-white">160 kbps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}