'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Package, ShoppingCart, Check } from 'lucide-react'

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
  description: string | null
  category: string
  base_price: number
  images: string[]
  variants?: Variant[]
}

type Props = {
  product: Product
  children: React.ReactNode
  onAddToCart: (productId: string, variantId?: string) => void
}

export function ProductModal({ product, children, onAddToCart }: Props) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const variants = product.variants?.filter(v => v.is_available !== false) || []
  const hasVariants = variants.length > 0
  const selectedVariant = variants.find(v => v.id === selectedVariantId)
  const finalPrice = product.base_price + (selectedVariant?.price_modifier || 0)
  const canAdd = !hasVariants || !!selectedVariantId
  const outOfStock = selectedVariant && selectedVariant.stock_quantity <= 0

  const handleAdd = () => {
    if (!canAdd || outOfStock) return
    onAddToCart(product.id, selectedVariantId || undefined)
    setJustAdded(true)
    setTimeout(() => {
      setJustAdded(false)
      setOpen(false)
    }, 900)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-muted">
            {product.images?.length > 0 ? (
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground/40" />
              </div>
            )}
            {product.images?.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${i === selectedImage ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col p-6">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {product.category === 'vinyl' ? 'Vinyl' : product.category}
            </span>
            <h2 className="font-display text-2xl font-semibold tracking-tight mt-1">
              {product.title}
            </h2>
            {product.description && (
              <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
            )}

            {hasVariants && (
              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  Select an option
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map(variant => {
                    const isSoldOut = variant.stock_quantity <= 0
                    return (
                      <button
                        key={variant.id}
                        disabled={isSoldOut}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`rounded-sm border px-3 py-2 text-sm transition-colors ${
                          selectedVariantId === variant.id
                            ? 'border-foreground bg-foreground text-background'
                            : isSoldOut
                            ? 'border-border text-muted-foreground/40 line-through cursor-not-allowed'
                            : 'border-border hover:border-foreground/40'
                        }`}
                      >
                        {variant.name}
                        {!isSoldOut && variant.stock_quantity <= 5 && (
                          <span className="ml-1.5 text-[10px] text-accent">
                            {variant.stock_quantity} left
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-auto pt-6">
              <p className="font-mono text-2xl font-semibold mb-3">
                ${finalPrice.toFixed(2)}
              </p>
              <Button
                className="w-full"
                disabled={!canAdd || !!outOfStock}
                onClick={handleAdd}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Added to cart
                  </>
                ) : outOfStock ? (
                  'Sold out'
                ) : !canAdd ? (
                  'Select an option'
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
