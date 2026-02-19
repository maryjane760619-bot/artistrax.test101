'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Variant = {
  name: string
  sku: string
  price_modifier: number
  stock_quantity: number
}

type ShippingRate = {
  region: string
  rate: number
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [label, setLabel] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'apparel',
    base_price: '',
  })

  const [variants, setVariants] = useState<Variant[]>([
    { name: 'Standard', sku: '', price_modifier: 0, stock_quantity: 0 }
  ])

  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([
    { region: 'US', rate: 5 },
    { region: 'International', rate: 15 }
  ])

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getUser()
        
        if (error || !data.user) {
          router.push('/label/login')
          return
        }
        
        setLabel(data.user)
        setLoading(false)
      } catch (err) {
        console.error('Auth error:', err)
        router.push('/label/login')
      }
    }
    
    checkAuth()
  }, [router])

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setImageFiles(prev => [...prev, ...files])
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  function removeImage(index: number) {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  function addVariant() {
    setVariants([...variants, { name: '', sku: '', price_modifier: 0, stock_quantity: 0 }])
  }

  function removeVariant(index: number) {
    setVariants(variants.filter((_, i) => i !== index))
  }

  function updateVariant(index: number, field: keyof Variant, value: any) {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  function addShippingRate() {
    setShippingRates([...shippingRates, { region: '', rate: 0 }])
  }

  function removeShippingRate(index: number) {
    setShippingRates(shippingRates.filter((_, i) => i !== index))
  }

  function updateShippingRate(index: number, field: keyof ShippingRate, value: any) {
    const updated = [...shippingRates]
    updated[index] = { ...updated[index], [field]: value }
    setShippingRates(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      // Upload images
      const imageUrls: string[] = []
      for (const file of imageFiles) {
        const fileName = `${label?.id}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('covers')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('covers')
          .getPublicUrl(fileName)

        imageUrls.push(publicUrl)
      }

      // Create product
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          label_id: label?.id,
          title: formData.title,
          slug,
          description: formData.description,
          category: formData.category,
          base_price: parseFloat(formData.base_price),
          images: imageUrls,
          is_active: true
        })
        .select()
        .single()

      if (productError) throw productError

      // Create variants
      for (const variant of variants) {
        if (!variant.name) continue
        
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert({
            product_id: product.id,
            name: variant.name,
            sku: variant.sku || null,
            price_modifier: variant.price_modifier,
            stock_quantity: variant.stock_quantity,
            is_available: true
          })

        if (variantError) throw variantError
      }

      // Create shipping rates
      for (const rate of shippingRates) {
        if (!rate.region) continue

        const { error: shippingError } = await supabase
          .from('product_shipping')
          .insert({
            product_id: product.id,
            region: rate.region,
            rate: rate.rate
          })

        if (shippingError) throw shippingError
      }

      router.push('/label/merch')
    } catch (error: any) {
      console.error('Error creating product:', error)
      alert(`Failed to create product: ${error.message || JSON.stringify(error)}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !label) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-background border rounded-md"
                placeholder="e.g., Band T-Shirt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-background border rounded-md resize-none"
                placeholder="Describe your product..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-background border rounded-md"
                >
                  <option value="apparel">Apparel</option>
                  <option value="vinyl">Vinyl</option>
                  <option value="cd">CD</option>
                  <option value="poster">Poster</option>
                  <option value="sticker">Sticker</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Base Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  className="w-full px-4 py-2 bg-background border rounded-md"
                  placeholder="20.00"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Images</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <label className="block">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload images</p>
              </div>
            </label>
          </div>

          {/* Variants */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Variants (Sizes, Colors, etc.)</h2>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="w-4 h-4 mr-1" />
                Add Variant
              </Button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <label className="block text-xs font-medium mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-md text-sm"
                      placeholder="e.g., Small Black"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-medium mb-1">SKU</label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-md text-sm"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">+Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={variant.price_modifier}
                      onChange={(e) => updateVariant(index, 'price_modifier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-background border rounded-md text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Stock</label>
                    <input
                      type="number"
                      value={variant.stock_quantity}
                      onChange={(e) => updateVariant(index, 'stock_quantity', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-background border rounded-md text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Shipping Rates</h2>
              <Button type="button" variant="outline" size="sm" onClick={addShippingRate}>
                <Plus className="w-4 h-4 mr-1" />
                Add Rate
              </Button>
            </div>

            <div className="space-y-4">
              {shippingRates.map((rate, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-7">
                    <label className="block text-xs font-medium mb-1">Region *</label>
                    <input
                      type="text"
                      required
                      value={rate.region}
                      onChange={(e) => updateShippingRate(index, 'region', e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-md text-sm"
                      placeholder="e.g., US, Canada, International"
                    />
                  </div>
                  <div className="col-span-4">
                    <label className="block text-xs font-medium mb-1">Rate ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={rate.rate}
                      onChange={(e) => updateShippingRate(index, 'rate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-background border rounded-md text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    {shippingRates.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeShippingRate(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? 'Saving...' : 'Create Product'}
            </Button>
            <Link href="/label/merch">
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
