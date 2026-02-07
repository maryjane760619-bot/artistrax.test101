'use client'

import React from "react"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Lock, CreditCard, Check, Download } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CartProvider, useCart } from '@/lib/cart-context'

function CheckoutContent() {
  const { items, totalPrice, clearCart } = useCart()
  const [email, setEmail] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsProcessing(false)
    setIsComplete(true)
    clearCart()
  }

  if (isComplete) {
    return (
      <main className="pt-20 md:pt-24">
        <section className="py-20 md:py-32">
          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-6 flex items-center justify-center">
              <Check className="w-8 h-8 text-accent-foreground" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl mb-4">Thank You!</h1>
            <p className="text-muted-foreground mb-2">
              Your purchase was successful. A download link has been sent to:
            </p>
            <p className="font-medium mb-8">{email}</p>
            
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 text-left">
                <Download className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Download Ready</p>
                  <p className="text-sm text-muted-foreground">
                    Your download link will expire in 7 days
                  </p>
                </div>
              </div>
            </div>

            <Button asChild>
              <Link href="/releases">Continue Browsing</Link>
            </Button>
          </div>
        </section>
      </main>
    )
  }

  if (items.length === 0 && !isComplete) {
    return (
      <main className="pt-20 md:pt-24">
        <section className="py-20 md:py-32">
          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif text-3xl mb-4">No items in cart</h1>
            <p className="text-muted-foreground mb-8">
              Add some releases to your cart to checkout.
            </p>
            <Button asChild>
              <Link href="/releases">Browse Releases</Link>
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
          <Link 
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>

          <h1 className="font-serif text-3xl md:text-4xl mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Checkout Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-input"
                  />
                  <p className="text-xs text-muted-foreground">
                    Download links will be sent to this email
                  </p>
                </div>

                {/* Payment */}
                <div className="space-y-4">
                  <Label>Payment Method</Label>
                  <div className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Credit or Debit Card</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber" className="text-sm">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          className="bg-input mt-1"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry" className="text-sm">Expiry</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            className="bg-input mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvc" className="text-sm">CVC</Label>
                          <Input
                            id="cvc"
                            placeholder="123"
                            className="bg-input mt-1"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Pay ${totalPrice.toFixed(2)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Secure payment powered by Stripe. Your payment info is encrypted.
                </p>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <div className="border border-border rounded-lg p-6 bg-card sticky top-24">
                <h2 className="font-medium text-lg mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.releaseId} className="flex gap-3">
                      <div className="w-12 h-12 rounded bg-muted flex-shrink-0">
                        <div className="w-full h-full bg-gradient-to-br from-muted-foreground/20 to-muted rounded" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.release.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.format.toUpperCase()}
                        </p>
                      </div>
                      <span className="text-sm">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Processing fee</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-medium pt-2">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <CheckoutContent />
        <Footer />
      </div>
    </CartProvider>
  )
}
