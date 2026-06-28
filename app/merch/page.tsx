'use client'

import { useEffect, useMemo, useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { CartProvider, useCart } from '@/lib/cart-context'
import { supabase } from '@/lib/supabase'
import { Search, ShoppingBag } from 'lucide-react'

const CATEGORIES = [
  { value: 'apparel', label: 'Apparel' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'cd', label: 'CD' },
  { value: 'poster', label: 'Posters' },
  { value: 'sticker', label: 'Stickers' },
  { value: 'other', label: 'Other' },
]

const PAGE_SIZE = 24

type RawProduct = {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  base_price: number
  images: string[]
  is_active: boolean
  artist_id: string | null
  label_id: string | null
  variants: { id: string; name: string; price_modifier: number; stock_quantity: number; is_available: boolean }[]
  artists: { display_name: string; username: string } | null
  labels: { name: string; slug: string } | null
}

function MerchPageContent() {
  const { addItem } = useCart()
  const [products, setProducts] = useState<RawProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, title, slug, description, category, base_price, images, is_active, artist_id, label_id,
          variants:product_variants(id, name, price_modifier, stock_quantity, is_available),
          artists:artist_id (display_name, username),
          labels:label_id (name, slug)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setProducts(data as any)
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return products.filter(p => {
      const matchesCategory = !selectedCategory || p.category === selectedCategory
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        p.artists?.display_name.toLowerCase().includes(q) ||
        p.labels?.name.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [products, searchQuery, selectedCategory])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [searchQuery, selectedCategory])

  const visibleProducts = filtered.slice(0, visibleCount)

  function handleAddToCart(productId: string, variantId?: string) {
    const product = products.find(p => p.id === productId)
    if (!product) return
    const variant = variantId ? product.variants?.find(v => v.id === variantId) : undefined
    const sellerId = product.artist_id || product.label_id || ''
    const sellerName = product.artists?.display_name || product.labels?.name || 'Unknown'
    addItem({
      productId: product.id,
      variantId,
      productTitle: product.title,
      variantName: variant?.name,
      price: product.base_price + (variant?.price_modifier || 0),
      imageUrl: product.images?.[0],
      artistId: sellerId,
      artistName: sellerName,
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pb-16 min-h-[70vh]">
        <section className="py-12 md:py-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-border pb-8">
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.2em] text-foreground/60">Marketplace</div>
                <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
                  Shop Merchandise
                </h1>
                <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
                  Apparel, vinyl, and collectibles from every artist and label on artistrax — in one place.
                </p>
              </div>

              <div className="w-full md:w-80 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search merch, artists, labels..."
                  className="w-full h-11 pl-10 pr-4 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-foreground/40 text-foreground placeholder:text-muted-foreground/60 transition"
                />
              </div>
            </div>

            {/* Category filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 mb-8">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`shrink-0 rounded-sm px-3 py-2 text-xs uppercase tracking-wide transition ${
                  selectedCategory === null
                    ? 'bg-accent text-accent-foreground'
                    : 'border border-border hover:bg-accent/10'
                }`}
              >
                All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`shrink-0 rounded-sm px-3 py-2 text-xs uppercase tracking-wide transition ${
                    selectedCategory === cat.value
                      ? 'bg-accent text-accent-foreground'
                      : 'border border-border hover:bg-accent/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <ShoppingBag className="w-10 h-10 animate-pulse text-primary mb-4" />
                <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Loading merch...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 border border-border rounded-sm max-w-md mx-auto">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-foreground font-semibold mb-1">No merch found</p>
                <p className="text-muted-foreground text-xs">
                  {products.length === 0
                    ? 'No merchandise has been listed yet. Check back soon!'
                    : `Nothing matches "${searchQuery}".`}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                  {visibleProducts.map(product => {
                    const sellerName = product.artists?.display_name || product.labels?.name
                    const sellerHref = product.artists
                      ? `/${product.artists.username}`
                      : product.labels
                      ? `/labels/${product.labels.slug}`
                      : undefined
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        sellerName={sellerName}
                        sellerHref={sellerHref}
                      />
                    )
                  })}
                </div>
                {visibleCount < filtered.length && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                      className="rounded-sm border border-border px-8 py-3 text-sm font-medium hover:bg-accent/10 transition"
                    >
                      Load More ({filtered.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function MerchPage() {
  return (
    <CartProvider>
      <MerchPageContent />
    </CartProvider>
  )
}
