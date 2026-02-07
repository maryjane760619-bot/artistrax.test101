'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Download, Play, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type DownloadRecord = {
  id: string
  track_id: string
  created_at: string
  ip_address: string | null
  tracks: {
    title: string
  }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [downloads, setDownloads] = useState<DownloadRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/artist/login')
    }

    if (user) {
      loadDownloads()
    }
  }, [user, authLoading])

  const loadDownloads = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('downloads')
      .select('*, tracks(title)')
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (data) {
      setDownloads(data)
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/artist/dashboard" className="text-2xl font-serif font-semibold">
              artistrax
            </Link>
            <Link href="/artist/dashboard">
              <Button variant="ghost" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold mb-2">Download Analytics</h1>
          <p className="text-muted-foreground">
            Track who's downloading your music
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Download className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Downloads</span>
            </div>
            <div className="text-3xl font-bold">{downloads.length}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Last 24 Hours</span>
            </div>
            <div className="text-3xl font-bold">
              {downloads.filter(d => {
                const dayAgo = Date.now() - 24 * 60 * 60 * 1000
                return new Date(d.created_at).getTime() > dayAgo
              }).length}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Last 7 Days</span>
            </div>
            <div className="text-3xl font-bold">
              {downloads.filter(d => {
                const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
                return new Date(d.created_at).getTime() > weekAgo
              }).length}
            </div>
          </div>
        </div>

        {/* Recent Downloads Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">Recent Downloads</h2>
          </div>

          {downloads.length === 0 ? (
            <div className="p-12 text-center">
              <Download className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No downloads yet. Share your tracks to get started!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium">Track</th>
                    <th className="text-left px-6 py-3 text-sm font-medium">Date & Time</th>
                    <th className="text-left px-6 py-3 text-sm font-medium">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {downloads.map((download) => (
                    <tr key={download.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="font-medium">{download.tracks.title}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDate(download.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {download.ip_address || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
