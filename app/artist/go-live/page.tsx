'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, ArrowLeft } from 'lucide-react'

// Live streaming isn't built yet -- the backend (app/api/live-streams/*)
// only ever returned hardcoded stub data with no real Mux/RTMP integration
// behind it. The old version of this page told artists to configure real
// OBS software against a real Mux server using a stream key that was
// never actually provisioned, which would silently fail for anyone who
// tried it. Showing an honest "not ready yet" state instead of a fake
// working flow until the real integration is built.
export default function GoLivePage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Video className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold">Go Live</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Live streaming isn't ready yet. We're still building the real
              broadcast infrastructure behind this feature, so it's
              temporarily disabled rather than risk a stream that doesn't
              actually go anywhere.
            </p>
            <Link href="/artist/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
