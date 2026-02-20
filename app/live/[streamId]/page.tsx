'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Radio, Users, Send, Heart } from 'lucide-react'

interface ChatMessage {
  id: string
  user_name: string
  user_avatar: string
  message: string
  is_artist: boolean
  created_at: string
}

export default function LiveStreamViewerPage() {
  const params = useParams()
  const streamId = params.streamId as string
  
  const [stream, setStream] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewerCount, setViewerCount] = useState(0)
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)

  // Fetch stream details
  useEffect(() => {
    fetchStream()
    joinAsViewer()
    
    return () => {
      leaveAsViewer()
    }
  }, [streamId])

  // Subscribe to chat
  useEffect(() => {
    if (!streamId) return
    
    const subscription = supabase
      .channel(`stream-chat-${streamId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'stream_chat',
        filter: `stream_id=eq.${streamId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage])
      })
      .subscribe()

    // Fetch existing messages
    fetchMessages()

    return () => {
      subscription.unsubscribe()
    }
  }, [streamId])

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchStream = async () => {
    try {
      const response = await fetch(`/api/live-streams/${streamId}`)
      if (!response.ok) {
        throw new Error('Stream not found')
      }
      const data = await response.json()
      setStream(data.stream)
      setViewerCount(data.stream.viewer_count)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const joinAsViewer = async () => {
    try {
      await fetch(`/api/live-streams/${streamId}/viewers`, {
        method: 'POST',
      })
    } catch (e) {
      // Silent fail - viewer tracking is not critical
    }
  }

  const leaveAsViewer = async () => {
    try {
      await fetch(`/api/live-streams/${streamId}/viewers`, {
        method: 'DELETE',
      })
    } catch (e) {
      // Silent fail
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/live-streams/${streamId}/chat?limit=50`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (e) {
      console.error('Failed to fetch messages:', e)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/live-streams/${streamId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }

      setNewMessage('')
      messageInputRef.current?.focus()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Stream not found'}</p>
          <Button onClick={() => window.location.href = '/'}>Go Home</Button>
        </div>
      </div>
    )
  }

  const isLive = stream.status === 'live'
  const playbackUrl = `https://stream.mux.com/${stream.mux_playback_id}.m3u8`

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isLive && (
            <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
              <Radio className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-bold">LIVE</span>
            </div>
          )}
          <div>
            <h1 className="font-bold">{stream.title}</h1>
            <p className="text-sm text-gray-400">
              {stream.artists?.display_name || stream.labels?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="w-5 h-5" />
          <span>{viewerCount} watching</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Video Player */}
        <div className="flex-1 bg-black flex items-center justify-center">
          {isLive ? (
            <video
              src={playbackUrl}
              controls
              autoPlay
              className="w-full h-full max-h-full"
              poster={stream.thumbnail_url}
            />
          ) : (
            <div className="text-center text-gray-500">
              <Radio className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xl">Stream is offline</p>
              <p className="text-sm mt-2">Check back later for the next live event</p>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="w-full lg:w-80 bg-gray-900 flex flex-col border-l border-gray-800">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-800">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Live Chat
            </h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className={`font-semibold ${msg.is_artist ? 'text-yellow-400' : 'text-blue-400'}`}>
                  {msg.user_name}
                  {msg.is_artist && <span className="ml-1 text-xs">🎵</span>}
                </span>
                <span className="text-gray-300 ml-2">{msg.message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          {isLive && (
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-800">
              <div className="flex gap-2">
                <Input
                  ref={messageInputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Say something..."
                  className="flex-1 bg-gray-800 border-gray-700 text-white"
                  maxLength={500}
                />
                <Button 
                  type="submit" 
                  disabled={sending || !newMessage.trim()}
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}