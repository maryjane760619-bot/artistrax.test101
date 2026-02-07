'use client'

import Link from 'next/link'
import { Trash2, ShoppingBag, ArrowRight, Play } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { CartProvider, useCart } from '@/lib/cart-context'

function CartContent() {
  const { items, removeItem, totalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <main className="pt-20 md:pt-24">
        <section className="py-20 md:py-32">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
            <h1 className="font-serif text-3xl md:text-4xl mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Discover our catalog of premium digital music downloads.
            </p>
            <Button asChild size="lg">
              <Link href="/releases">
                Browse Releases
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="pt-20 md:pt-24">
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-serif text-3xl md:text-4xl">Your Cart</h1>
            <button 
              onClick={clearCart}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-4 mb-8">
            {items.map(item => (
              <div 
                key={item.releaseId}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card"
              >
                <div className="w-20 h-20 rounded bg-muted overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-muted-foreground/20 to-muted flex items-center justify-center">
                    <Play className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/releases/${item.release.slug}`}
                    className="font-medium hover:text-muted-foreground transition-colors"
                  >
                    {item.release.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{item.release.artistName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.format.toUpperCase()} • {item.release.tracks.length} track{item.release.tracks.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeItem(item.releaseId)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <h2 className="font-medium text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing fee</span>
                <span>$0.00</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between text-lg font-medium">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link href="/checkout">
                Proceed to Checkout
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Secure payment powered by Stripe
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link 
              href="/releases"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default function CartPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <CartContent />
        <Footer />
      </div>
    </CartProvider>
  )
}
