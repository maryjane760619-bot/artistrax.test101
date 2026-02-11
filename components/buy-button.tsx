'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2, Sparkles, Play, Download } from 'lucide-react'

type BuyButtonProps = {
  trackId: string
  price: number
  isFree: boolean
  fanEmail?: string
  className?: string
  showStreamingBenefits?: boolean
}

export function BuyButton({ 
  trackId, 
  price, 
  isFree, 
  fanEmail, 
  className,
  showStreamingBenefits = true 
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId, fanEmail }),
      })

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned')
        setLoading(false)
      }
    } catch (error) {
      console.error('Purchase error:', error)
      setLoading(false)
    }
  }

  if (isFree) {
    return null // Don't show buy button for free tracks
  }

  return (
    <div className={className}>
      <Button
        onClick={handlePurchase}
        disabled={loading}
        size="lg"
        className="w-full bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Buy ${price.toFixed(2)} • Own Forever
          </>
        )}
      </Button>
      
      {showStreamingBenefits && !loading && (
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-2">
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
      )}
    </div>
  )
}
