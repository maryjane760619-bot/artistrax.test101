'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Trash2, Music, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart()
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = items.reduce((sum, item) => sum + item.price, 0)

  const handleCheckout = async () => {
    if (items.length === 0) return
    setCheckingOut(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const fanEmail = session?.user?.email

      // Checkout each track — for same-destination tracks this creates one session
      // For now process the first track and redirect; multi-track Stripe sessions coming soon
      const trackIds = items.map(i => i.productId)

      const res = await fetch('/api/checkout/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackIds, fanEmail }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Checkout failed. Please try again.')
        setCheckingOut(false)
        return
      }

      clearCart()
      window.location.href = data.url
    } catch {
      setError('Network error. Please try again.')
      setCheckingOut(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-semibold mb-8">Your Cart</h1>

          {items.length === 0 ? (
            <div className="bg-card border rounded-lg p-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Browse music and add tracks to get started.</p>
              <Link href="/releases">
                <Button size="lg">Browse Music</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Track list */}
              <div className="lg:col-span-2 space-y-3">
                {items.map(item => (
                  <div key={item.productId} className="bg-card border rounded-lg p-4 flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productTitle} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.productTitle}</p>
                      <p className="text-sm text-muted-foreground">{item.artistName}</p>
                    </div>
                    <p className="font-bold">${item.price.toFixed(2)}</p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-muted-foreground hover:text-red-500 transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border rounded-lg p-6 sticky top-24">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-2 mb-6">
                    {items.map(item => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate mr-2">{item.productTitle}</span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-600 text-sm mb-3">{error}</p>
                  )}

                  <Button
                    size="lg"
                    className="w-full mb-3 bg-green-700 hover:bg-green-800"
                    onClick={handleCheckout}
                    disabled={checkingOut}
                  >
                    {checkingOut ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecting...</>
                    ) : (
                      <>Checkout — ${total.toFixed(2)}</>
                    )}
                  </Button>

                  <Link href="/releases">
                    <Button variant="outline" size="lg" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
