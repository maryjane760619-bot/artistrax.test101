'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Download, Home } from 'lucide-react'

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
            Purchase Complete!
          </h1>

          <p className="text-muted-foreground mb-8">
            Your track has been added to your library. You can now download it anytime from your fan dashboard.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/fan/dashboard">
              <Button className="w-full" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Go to Library
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
