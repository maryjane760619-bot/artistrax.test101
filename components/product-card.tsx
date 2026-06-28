'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart, Package } from 'lucide-react'
import { ProductModal } from '@/components/product-modal'

type Variant = {
  id: string
  name: string
  price_modifier: number
  stock_quantity: number
  is_available: boolean
}

type Product = {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  base_price: number
  images: string[]
  is_active: boolean
  variants?: Variant[]
}

type Props = {
  product: Product
  onAddToCart: (productId: string, variantId?: string) => void
}

export function ProductCard({ product, onAddToCart }: Props) {
  if (!product.is_active) return null

  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
  const isVinyl = product.category === 'vinyl'

  return (
    <ProductModal product={product} onAddToCart={onAddToCart}>
      <div className="group cursor-pointer rounded-sm border border-border bg-card overflow-hidden">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="img-zoom h-full w-full object-cover"
            />
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
            <Button size="sm">
              <ShoppingCart className="w-4 h-4 mr-2" />
              View
            </Button>
          </div>
        </div>
      </div>
    </ProductModal>
  )
}
