'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type CheckoutFormProps = {
  clientSecret: string
  onSuccess: () => void
  onError: (error: string) => void
  total: number
}

function CheckoutForm({ clientSecret, onSuccess, onError, total }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
        },
        redirect: 'if_required'
      })

      if (error) {
        onError(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess()
      }
    } catch (err: any) {
      onError(err.message || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-muted/50 rounded-lg p-6">
        <PaymentElement />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full"
        size="lg"
      >
        {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </Button>
    </form>
  )
}

type StripePaymentFormProps = {
  amount: number
  orderId: string
  onSuccess: () => void
  onError: (error: string) => void
}

export function StripePaymentForm({ amount, orderId, onSuccess, onError }: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        orderId,
        metadata: {
          orderId
        }
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        } else {
          onError('Failed to initialize payment')
        }
      })
      .catch((err) => {
        console.error('Payment initialization error:', err)
        onError('Failed to initialize payment')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [amount, orderId, onError])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Initializing payment...</p>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-8 text-red-500">
        Failed to initialize payment. Please try again.
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        onError={onError}
        total={amount}
      />
    </Elements>
  )
}
