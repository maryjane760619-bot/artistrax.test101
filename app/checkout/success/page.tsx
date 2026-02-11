'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Download, Home, Play, Music } from 'lucide-react'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Could verify the session here if needed
    setTimeout(() => setLoading(false), 1000)
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Confirming your purchase...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-3xl font-serif font-semibold mb-4">
            You Now Own This Track!
          </h1>

          <p className="text-lg text-foreground font-medium mb-4">
            🎵 Stream unlimited • Download lossless • Forever
          </p>

          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3 mb-3">
              <Play className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Stream Anywhere</p>
                <p className="text-sm text-muted-foreground">
                  Listen unlimited on any device. Your purchase never expires.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Download Lossless</p>
                <p className="text-sm text-muted-foreground">
                  Get the highest quality WAV or FLAC file. DJs and audiophiles approved.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/fan/library">
              <Button className="w-full bg-green-700 hover:bg-green-800" size="lg">
                <Music className="w-4 h-4 mr-2" />
                Open Your Library
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full" size="lg">
                <Home className="w-4 h-4 mr-2" />
                Browse More Music
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            A receipt has been sent to your email
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
