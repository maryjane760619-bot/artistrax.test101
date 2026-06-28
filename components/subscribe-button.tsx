'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, Star, Sparkles, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SubscribeButtonProps {
  artistId?: string
  labelId?: string
  price: number
  isSubscribed?: boolean
  variant?: 'default' | 'outline' | 'small'
  className?: string
}

export function SubscribeButton({ 
  artistId, 
  labelId, 
  price, 
  isSubscribed = false,
  variant = 'default',
  className = ''
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Sign in as a fan to subscribe')
      }
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          artist_id: artistId,
          label_id: labelId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to subscribe')
      }

      const data = await response.json()
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch (error: any) {
      alert(error.message)
      setLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <Link href="/fan/subscriptions">
        <Button 
          variant="outline" 
          className={`bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 ${className}`}
        >
          <Check className="w-4 h-4 mr-2" />
          Subscribed
        </Button>
      </Link>
    )
  }

  if (variant === 'small') {
    return (
      <Button 
        onClick={handleSubscribe}
        disabled={loading}
        size="sm"
        className={`bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white ${className}`}
      >
        <Heart className="w-4 h-4 mr-1" />
        ${price}/mo
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleSubscribe}
      disabled={loading}
      size="lg"
      className={`bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 ${className}`}
    >
      {loading ? (
        'Loading...'
      ) : (
        <>
          <Sparkles className="w-5 h-5 mr-2" />
          Subscribe ${price}/month
        </>
      )}
    </Button>
  )
}

interface SubscriptionCardProps {
  artistId?: string
  labelId?: string
  price: number
  description?: string
  subscriberCount?: number
  isSubscribed?: boolean
}

export function SubscriptionCard({
  artistId,
  labelId,
  price,
  description = 'Support my music and get exclusive perks',
  subscriberCount = 0,
  isSubscribed = false,
}: SubscriptionCardProps) {
  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-6 h-6 text-pink-500" />
        <h3 className="text-xl font-bold text-gray-900">Fan Subscription</h3>
      </div>
      
      <div className="mb-4">
        <span className="text-4xl font-bold text-gray-900">${price}</span>
        <span className="text-gray-600">/month</span>
      </div>
      
      <p className="text-gray-600 mb-4">{description}</p>
      
      <ul className="space-y-2 mb-6">
        <li className="flex items-center gap-2 text-sm text-gray-700">
          <Check className="w-4 h-4 text-green-500" />
          10% off all purchases
        </li>
        <li className="flex items-center gap-2 text-sm text-gray-700">
          <Check className="w-4 h-4 text-green-500" />
          Early access to releases (24hrs)
        </li>
        <li className="flex items-center gap-2 text-sm text-gray-700">
          <Check className="w-4 h-4 text-green-500" />
          Subscriber-only live streams
        </li>
        <li className="flex items-center gap-2 text-sm text-gray-700">
          <Check className="w-4 h-4 text-green-500" />
          Exclusive subscriber badge
        </li>
      </ul>
      
      <SubscribeButton
        artistId={artistId}
        labelId={labelId}
        price={price}
        isSubscribed={isSubscribed}
        className="w-full"
      />
      
      {subscriberCount > 0 && (
        <p className="text-center text-sm text-gray-500 mt-3">
          {subscriberCount} {subscriberCount === 1 ? 'subscriber' : 'subscribers'}
        </p>
      )}
      
      <p className="text-center text-xs text-gray-400 mt-2">
        Cancel anytime. 95% goes to creator.
      </p>
    </div>
  )
}