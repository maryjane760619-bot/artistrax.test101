'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Package } from 'lucide-react'

type Product = {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  base_price: number
  images: string[]
  is_active: boolean
  variants?: { stock_quantity: number }[]
}

type Props = {
  product: Product
  onAddToCart: (productId: string, variantId?: string) => void
}

export function ProductCard({ product, onAddToCart }: Props) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!product.is_active) return null

  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
  const isVinyl = product.category === 'vinyl'

  return (
    <div className="group rounded-sm border border-border bg-card overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.images && product.images.length > 0 ? (
          <>
            <img
              src={product.images[selectedImage]}
              alt={product.title}
              className="img-zoom h-full w-full object-cover"
            />
            {product.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      index === selectedImage ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] backdrop-blur-md">
          {isVinyl ? 'Vinyl' : product.category}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold tracking-tight truncate">
          {product.title}
        </h3>
        {product.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}

        {isVinyl && totalStock !== undefined && (
          <p
            className={`mt-2 text-xs font-mono ${
              totalStock <= 5 ? 'text-accent' : 'text-muted-foreground'
            }`}
          >
            {totalStock > 0 ? `${totalStock} left` : 'Sold out'}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-lg font-semibold">
            ${product.base_price.toFixed(2)}
          </span>
          <Button size="sm" onClick={() => onAddToCart(product.id)}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
