'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const router = useRouter()
  const cart = useCart()
  const [items, setItems] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  
  // Load from localStorage on mount
  useEffect(() => {
    console.log('[Cart Page] Loading from localStorage...')
    const saved = localStorage.getItem('artistrax_cart')
    console.log('[Cart Page] localStorage value:', saved)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        console.log('[Cart Page] Parsed cart:', parsed)
        setItems(parsed)
      } catch (e) {
        console.error('Cart parse error:', e)
      }
    }
    setMounted(true)
  }, [])
  
  const itemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
  const loading = !mounted
  
  function removeItem(productId: string, variantId?: string) {
    const updated = items.filter(
      item => !(item.productId === productId && item.variantId === variantId)
    )
    setItems(updated)
    localStorage.setItem('artistrax_cart', JSON.stringify(updated))
    cart.removeItem(productId, variantId)
  }
  
  function updateQuantity(productId: string, quantity: number, variantId?: string) {
    if (quantity <= 0) {
      removeItem(productId, variantId)
      return
    }
    
    const updated = items.map(item =>
      item.productId === productId && item.variantId === variantId
        ? { ...item, quantity }
        : item
    )
    setItems(updated)
    localStorage.setItem('artistrax_cart', JSON.stringify(updated))
    cart.updateQuantity(productId, quantity, variantId)
  }

  const platformFee = totalAmount * 0.05 // Artist pays this
  const shipping = 0 // Will be calculated at checkout
  const total = totalAmount + shipping // Customer only pays subtotal + shipping

  function handleCheckout() {
    if (items.length === 0) return
    router.push('/checkout')
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-semibold mb-8">Shopping Cart</h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading cart...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-card border rounded-lg p-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Browse artists and add some merch to get started!
              </p>
              <Link href="/artists">
                <Button size="lg">Browse Artists</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId || 'default'}`}
                    className="bg-card border rounded-lg p-4 flex gap-4"
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{item.productTitle}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {item.artistName}
                      </p>
                      {item.variantName && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.variantName}
                        </p>
                      )}
                      <p className="font-bold">${item.price.toFixed(2)}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-center gap-2 border rounded-md">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1, item.variantId)
                          }
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1, item.variantId)
                          }
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-sm font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border rounded-lg p-6 sticky top-24">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                      </span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-muted-foreground">
                        Calculated at checkout
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Estimated Total</span>
                        <span>${totalAmount.toFixed(2)}+</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        + shipping (calculated at checkout)
                      </p>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full mb-3"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>

                  <Link href="/artists">
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
