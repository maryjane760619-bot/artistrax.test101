'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package } from 'lucide-react'
import Link from 'next/link'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')

  return (
    <>
      <Header />
      
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border rounded-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-serif font-semibold mb-4">
              Order Confirmed!
            </h1>
            
            <p className="text-lg text-muted-foreground mb-2">
              Thank you for your order!
            </p>
            
            {orderId && (
              <p className="text-sm text-muted-foreground mb-8">
                Order ID: <span className="font-mono">{orderId}</span>
              </p>
            )}

            <div className="bg-muted rounded-lg p-6 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Package className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">What happens next?</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• You'll receive a confirmation email shortly</li>
                    <li>• The artist will prepare your order for shipping</li>
                    <li>• You'll get tracking information once shipped</li>
                    <li>• Questions? Contact support@artistrax.com</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button size="lg">
                  Back to Home
                </Button>
              </Link>
              <Link href="/artists">
                <Button variant="outline" size="lg">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}
