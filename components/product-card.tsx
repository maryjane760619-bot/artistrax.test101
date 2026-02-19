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
}

type Props = {
  product: Product
  onAddToCart: (productId: string, variantId?: string) => void
}

export function ProductCard({ product, onAddToCart }: Props) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!product.is_active) return null

  return (
    <div className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="aspect-square bg-muted relative group">
        {product.images && product.images.length > 0 ? (
          <>
            <img
              src={product.images[selectedImage]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === selectedImage ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
        <p className="text-sm text-muted-foreground mb-2 capitalize">
          {product.category}
        </p>
        {product.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">
            ${product.base_price.toFixed(2)}
          </span>
          <Button
            size="sm"
            onClick={() => onAddToCart(product.id)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
