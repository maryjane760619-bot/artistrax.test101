'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2 } from 'lucide-react'

type BuyButtonProps = {
  trackId: string
  price: number
  isFree: boolean
  fanEmail?: string
  className?: string
}

export function BuyButton({ trackId, price, isFree, fanEmail, className }: BuyButtonProps) {
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
    <Button
      onClick={handlePurchase}
      disabled={loading}
      size="lg"
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Buy for ${price.toFixed(2)}
        </>
      )}
    </Button>
  )
}
