'use client'

import Link from 'next/link'
import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <WifiOff className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
        <h1 className="text-4xl font-serif font-semibold mb-4">
          You're Offline
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          No internet connection detected. Some features may be limited.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You can still:
          </p>
          <ul className="text-left space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Play downloaded tracks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Browse your playlists</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>View your library</span>
            </li>
          </ul>
          <div className="pt-4">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
