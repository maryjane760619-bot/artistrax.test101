'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Play, Download, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BuyToStreamButtonProps {
  trackId: string
  trackTitle: string
  price: number
  artistName: string
  className?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'gradient'
}

export function BuyToStreamButton({
  trackId,
  trackTitle,
  price,
  artistName,
  className,
  size = 'default',
  variant = 'gradient'
}: BuyToStreamButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: window.location.href,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  if (variant === 'gradient') {
    return (
      <Button
        onClick={handleBuy}
        disabled={loading}
        size={size}
        className={cn(
          "bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all",
          className
        )}
      >
        {loading ? (
          'Processing...'
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Buy ${price.toFixed(2)} • Stream Forever
          </>
        )}
      </Button>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        onClick={handleBuy}
        disabled={loading}
        size={size}
        className="w-full bg-green-700 hover:bg-green-800"
      >
        {loading ? (
          'Processing...'
        ) : (
          <>
            Buy ${price.toFixed(2)}
          </>
        )}
      </Button>
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Play className="w-3 h-3" />
          Stream unlimited
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Download className="w-3 h-3" />
          Download lossless
        </span>
      </div>
    </div>
  )
}

/**
 * Compact version for track cards
 */
export function BuyToStreamBadge({ price }: { price: number }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-700 to-green-600 text-white text-xs font-semibold rounded-full shadow-sm">
      <Sparkles className="w-3 h-3" />
      ${price.toFixed(2)} • Stream Forever
    </div>
  )
}
