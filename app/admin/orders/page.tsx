'use client'

import { useState } from 'react'
import { Search, MoreHorizontal, Eye, Download, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Mock orders data
const orders = [
  { id: 'ORD-001', email: 'john@example.com', items: 2, amount: 24.98, status: 'completed', date: '2025-01-24', downloads: 1 },
  { id: 'ORD-002', email: 'jane.doe@example.com', items: 1, amount: 14.99, status: 'completed', date: '2025-01-24', downloads: 3 },
  { id: 'ORD-003', email: 'mike.smith@example.com', items: 3, amount: 34.97, status: 'pending', date: '2025-01-23', downloads: 0 },
  { id: 'ORD-004', email: 'sarah@example.com', items: 1, amount: 9.99, status: 'completed', date: '2025-01-23', downloads: 2 },
  { id: 'ORD-005', email: 'alex@example.com', items: 2, amount: 19.98, status: 'completed', date: '2025-01-22', downloads: 4 },
  { id: 'ORD-006', email: 'emma@example.com', items: 1, amount: 29.99, status: 'refunded', date: '2025-01-22', downloads: 0 },
  { id: 'ORD-007', email: 'chris@example.com', items: 4, amount: 49.96, status: 'completed', date: '2025-01-21', downloads: 8 },
  { id: 'ORD-008', email: 'lisa@example.com', items: 1, amount: 12.99, status: 'completed', date: '2025-01-21', downloads: 1 },
]

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-accent'
      case 'pending': return 'text-yellow-500'
      case 'refunded': return 'text-muted-foreground'
      default: return 'text-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl mb-2">Orders</h1>
        <p className="text-muted-foreground">View and manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-input">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-accent">{orders.filter(o => o.status === 'completed').length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-yellow-500">{orders.filter(o => o.status === 'pending').length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">${orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-card">
              <tr className="border-b border-border">
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Order ID</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Customer</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Items</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Amount</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Downloads</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Date</th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="border-b border-border hover:bg-card/50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm">{order.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{order.email}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{order.items}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium">${order.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{order.downloads}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{order.date}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Resend Download Link
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Contact Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
