'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CartItem, Release } from './types'

interface CartContextType {
  items: CartItem[]
  addItem: (release: Release, format: 'mp3' | 'flac' | 'wav') => void
  removeItem: (releaseId: string) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (release: Release, format: 'mp3' | 'flac' | 'wav') => {
    setItems(prev => {
      const existing = prev.find(item => item.releaseId === release.id)
      if (existing) {
        return prev.map(item =>
          item.releaseId === release.id
            ? { ...item, format, price: release.pricing[format] }
            : item
        )
      }
      return [...prev, {
        releaseId: release.id,
        format,
        price: release.pricing[format],
        release
      }]
    })
  }

  const removeItem = (releaseId: string) => {
    setItems(prev => prev.filter(item => item.releaseId !== releaseId))
  }

  const clearCart = () => setItems([])

  const totalItems = items.length
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
