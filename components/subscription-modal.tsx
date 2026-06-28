'use client'

import { Star } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { SubscriptionCard } from '@/components/subscribe-button'

interface SubscriptionModalProps {
  artistId?: string
  labelId?: string
  price: number
  description?: string
  subscriberCount?: number
  name: string
}

export function SubscriptionModal({ artistId, labelId, price, description, subscriberCount = 0, name }: SubscriptionModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full flex items-center justify-between gap-3 rounded-sm border border-border bg-card px-4 py-3 text-left hover:border-accent/40 transition-colors">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Star className="w-4 h-4 text-pink-500" />
            Subscribe to {name}
          </span>
          <span className="text-sm font-bold text-accent">${price}/mo</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
        <SubscriptionCard
          artistId={artistId}
          labelId={labelId}
          price={price}
          description={description}
          subscriberCount={subscriberCount}
        />
      </DialogContent>
    </Dialog>
  )
}
