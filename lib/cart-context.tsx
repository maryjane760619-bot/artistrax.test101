'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type CartItem = {
  productId: string
  variantId?: string
  productTitle: string
  variantName?: string
  price: number
  quantity: number
  imageUrl?: string
  artistId: string
  artistName: string
}

type CartContextType = {
  items: CartItem[]
  itemCount: number
  totalAmount: number
  loading: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('artistrax_cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }
    setLoading(false)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('[Cart] Saving to localStorage:', items)
    localStorage.setItem('artistrax_cart', JSON.stringify(items))
  }, [items])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    console.log('[Cart] addItem called:', item)
    setItems(current => {
      const existingIndex = current.findIndex(
        i => i.productId === item.productId && i.variantId === item.variantId
      )

      if (existingIndex > -1) {
        // Item exists, increase quantity
        const updated = [...current]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        }
        console.log('[Cart] Updated existing item, new cart:', updated)
        return updated
      } else {
        // New item
        const newCart = [...current, { ...item, quantity: 1 }]
        console.log('[Cart] Added new item, new cart:', newCart)
        return newCart
      }
    })
  }

  const removeItem = (productId: string, variantId?: string) => {
    setItems(current =>
      current.filter(
        item => !(item.productId === productId && item.variantId === variantId)
      )
    )
  }

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variantId)
      return
    }

    setItems(current =>
      current.map(item =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
