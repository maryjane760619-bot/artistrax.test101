'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Copy, CheckCircle, Radio } from 'lucide-react'

export default function GoLivePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stream, setStream] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_public: true,
  })

  const createStream = async () => {
    if (!formData.title) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/live-streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create stream')
      }

      const data = await response.json()
      setStream(data.stream)
    } catch (error) {
      console.error('Create stream error:', error)
      alert('Failed to create stream. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startStream = async () => {
    if (!stream) return
    
    try {
      const response = await fetch(`/api/live-streams/${stream.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      })

      if (!response.ok) {
        throw new Error('Failed to start stream')
      }

      // Redirect to live dashboard
      router.push(`/artist/live/${stream.id}`)
    } catch (error) {
      console.error('Start stream error:', error)
      alert('Failed to start stream')
    }
  }

  const copyStreamKey = () => {
    if (stream?.streamKey) {
      navigator.clipboard.writeText(stream.streamKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Video className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold">Go Live</h1>
        </div>

        {!stream ? (
          <Card>
            <CardHeader>
              <CardTitle>Create Your Stream</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Stream Title</label>
                <Input
                  placeholder="e.g., Sunset DJ Set - Deep House"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  placeholder="What's this stream about?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_public" className="text-sm">
                  Public stream (anyone can watch)
                </label>
              </div>

              <Button 
                onClick={createStream} 
                disabled={loading || !formData.title}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Creating...' : 'Create Stream'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Stream Created!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-100 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-2">Stream Title</p>
                  <p className="font-semibold">{stream.title}</p>
                </div>

                <div className="bg-slate-100 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-2">OBS Stream Key</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-black text-green-400 px-3 py-2 rounded text-sm flex-1 font-mono">
                      {stream.streamKey}
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={copyStreamKey}
                      className="flex items-center gap-2"
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-2">Setup Instructions:</p>
                  <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                    <li>Open OBS Studio (or similar streaming software)</li>
                    <li>Go to Settings → Stream</li>
                    <li>Set Service to "Custom"</li>
                    <li>Set Server to: <code>rtmp://live.mux.com/app</code></li>
                    <li>Paste the Stream Key above</li>
                    <li>Click "Start Streaming" in OBS</li>
                    <li>Come back and click "Go Live" below</li>
                  </ol>
                </div>

                <Button 
                  onClick={startStream}
                  className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                  size="lg"
                >
                  <Radio className="w-5 h-5" />
                  Go Live Now
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}