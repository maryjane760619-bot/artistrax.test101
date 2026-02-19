'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, Clock, Truck, CheckCircle, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Order = {
  id: string
  buyer_name: string
  buyer_email: string
  total: number
  status: string
  created_at: string
  order_items: Array<{
    product_title: string
    variant_name: string | null
    quantity: number
    unit_price: number
  }>
}

export default function ArtistOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getUser()
        
        if (error || !data.user) {
          router.push('/artist/login')
          return
        }
        
        setUserId(data.user.id)
        setLoading(false)
      } catch (err) {
        console.error('Auth error:', err)
        router.push('/artist/login')
      }
    }
    
    checkAuth()
  }, [router])

  useEffect(() => {
    if (userId) {
      loadOrders()
    }
  }, [userId, filter])

  async function loadOrders() {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items!inner(
            product_title,
            variant_name,
            quantity,
            unit_price,
            artist_id
          )
        `)
        .eq('order_items.artist_id', userId)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Group order items by order
      const ordersMap = new Map<string, Order>()
      data?.forEach((row: any) => {
        if (!ordersMap.has(row.id)) {
          ordersMap.set(row.id, {
            id: row.id,
            buyer_name: row.buyer_name,
            buyer_email: row.buyer_email,
            total: row.total,
            status: row.status,
            created_at: row.created_at,
            order_items: []
          })
        }
        
        // Add order items if they exist
        if (row.order_items) {
          ordersMap.get(row.id)!.order_items.push({
            product_title: row.order_items.product_title,
            variant_name: row.order_items.variant_name,
            quantity: row.order_items.quantity,
            unit_price: row.order_items.unit_price
          })
        }
      })

      setOrders(Array.from(ordersMap.values()))
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      loadOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'processing': return <Package className="w-4 h-4" />
      case 'shipped': return <Truck className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Orders</h1>
            <p className="text-muted-foreground">Manage your product orders</p>
          </div>
          <Link href="/artist/dashboard">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {['all', 'pending', 'processing', 'shipped', 'delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                filter === status
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-card border rounded-lg p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground">
              Orders from your merch will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-card border rounded-lg p-6">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-4 pb-4 border-b">
                  <p className="text-sm font-medium mb-1">Customer</p>
                  <p className="text-sm">{order.buyer_name}</p>
                  <p className="text-sm text-muted-foreground">{order.buyer_email}</p>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Items</p>
                  <div className="space-y-2">
                    {order.order_items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.product_title}
                          {item.variant_name && ` - ${item.variant_name}`}
                          {' '}×{item.quantity}
                        </span>
                        <span className="font-medium">
                          ${(item.unit_price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/artist/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  {order.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'processing')}
                    >
                      Mark as Processing
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                    >
                      Mark as Shipped
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                    >
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
