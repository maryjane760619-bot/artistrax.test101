'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { ShoppingCart, CreditCard, Truck } from 'lucide-react'
import Link from 'next/link'
import { StripePaymentForm } from '@/components/stripe-payment-form'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, itemCount, totalAmount, clearCart } = useCart()
  const [processing, setProcessing] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    shippingRegion: 'US'
  })

  useEffect(() => {
    if (!items.length) {
      router.push('/cart')
    }
  }, [items, router])

  // Calculate shipping (simplified - just flat rate by region)
  const shippingRate = formData.shippingRegion === 'US' ? 5 : 15
  const platformFee = totalAmount * 0.05 // Artist pays this, not added to customer total
  const total = totalAmount + shippingRate // Customer only pays subtotal + shipping

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setProcessing(true)

    try {
      console.log('Creating order with items:', items)
      
      // Step 1: Create the order in the database
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: {
            name: formData.name,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country
          },
          buyerEmail: formData.email,
          buyerName: formData.name,
          subtotal: totalAmount,
          shippingTotal: shippingRate,
          platformFee,
          total
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const { orderId: newOrderId } = await response.json()
      setOrderId(newOrderId)
      
      // Step 2: Show Stripe payment form
      setShowPayment(true)
      
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to process order. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  function handlePaymentSuccess() {
    // Payment succeeded, clear cart and redirect
    clearCart()
    window.location.href = `/order-success?id=${orderId}`
  }

  function handlePaymentError(error: string) {
    alert(`Payment failed: ${error}. Please try again.`)
  }

  if (!items.length) {
    return null
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-semibold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              {showPayment && orderId ? (
                <div className="bg-card border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </h2>
                  <StripePaymentForm
                    amount={total}
                    orderId={orderId}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="bg-card border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Contact Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-background border rounded-md"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-background border rounded-md"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-card border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipping Address
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Street Address *</label>
                      <input
                        type="text"
                        name="street"
                        required
                        value={formData.street}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-background border rounded-md"
                        placeholder="123 Main St"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-background border rounded-md"
                          placeholder="San Diego"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">State/Province *</label>
                        <input
                          type="text"
                          name="state"
                          required
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-background border rounded-md"
                          placeholder="CA"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">ZIP/Postal Code *</label>
                        <input
                          type="text"
                          name="zip"
                          required
                          value={formData.zip}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-background border rounded-md"
                          placeholder="92101"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Country *</label>
                        <select
                          name="country"
                          required
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-background border rounded-md"
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                          <option value="AU">Australia</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Shipping Region *</label>
                      <select
                        name="shippingRegion"
                        required
                        value={formData.shippingRegion}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-background border rounded-md"
                      >
                        <option value="US">US ($5.00)</option>
                        <option value="International">International ($15.00)</option>
                      </select>
                    </div>
                  </div>
                </div>

                  <div className="flex gap-4">
                    <Button type="submit" size="lg" disabled={processing} className="flex-1">
                      {processing ? 'Processing...' : 'Continue to Payment'}
                    </Button>
                    <Link href="/cart">
                      <Button type="button" variant="outline" size="lg">
                        Back to Cart
                      </Button>
                    </Link>
                  </div>
                </form>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.variantId || 'default'}`} className="flex gap-3">
                      <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productTitle} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.productTitle}</p>
                        {item.variantName && (
                          <p className="text-xs text-muted-foreground">{item.variantName}</p>
                        )}
                        <p className="text-sm">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${shippingRate.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">
                    Artists receive ${(totalAmount - platformFee).toFixed(2)} (5% platform fee deducted)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
