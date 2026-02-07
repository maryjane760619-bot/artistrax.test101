'use client'

import Link from 'next/link'
import { 
  Disc3, 
  Users, 
  Package, 
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Play
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { releases, artists, bundles } from '@/lib/data'

// Mock stats data
const stats = {
  totalRevenue: 12847.50,
  revenueChange: '+12.5%',
  totalOrders: 342,
  ordersChange: '+8.2%',
  totalDownloads: 1289,
  downloadsChange: '+15.3%',
  conversionRate: 3.2,
  conversionChange: '+0.4%'
}

const recentOrders = [
  { id: 'ORD-001', email: 'john@example.com', amount: 14.99, status: 'completed', date: '2025-01-24' },
  { id: 'ORD-002', email: 'jane@example.com', amount: 29.99, status: 'completed', date: '2025-01-24' },
  { id: 'ORD-003', email: 'mike@example.com', amount: 9.99, status: 'pending', date: '2025-01-23' },
  { id: 'ORD-004', email: 'sarah@example.com', amount: 19.99, status: 'completed', date: '2025-01-23' },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-accent flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              {stats.revenueChange} from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orders
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-accent flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              {stats.ordersChange} from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Downloads
            </CardTitle>
            <Disc3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-accent flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              {stats.downloadsChange} from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-accent flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              {stats.conversionChange}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Releases
              <Link href="/admin/releases" className="text-muted-foreground hover:text-foreground">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{releases.length}</div>
            <p className="text-xs text-muted-foreground">Total releases in catalog</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Artists
              <Link href="/admin/artists" className="text-muted-foreground hover:text-foreground">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{artists.length}</div>
            <p className="text-xs text-muted-foreground">Active artists</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Bundles
              <Link href="/admin/bundles" className="text-muted-foreground hover:text-foreground">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bundles.length}</div>
            <p className="text-xs text-muted-foreground">Active bundles</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Top Releases */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Recent Orders
              <Link 
                href="/admin/orders" 
                className="text-sm text-muted-foreground hover:text-foreground font-normal"
              >
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${order.amount.toFixed(2)}</p>
                    <span className={`text-xs ${
                      order.status === 'completed' ? 'text-accent' : 'text-muted-foreground'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Releases */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Top Releases
              <Link 
                href="/admin/releases" 
                className="text-sm text-muted-foreground hover:text-foreground font-normal"
              >
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {releases.slice(0, 4).map((release, index) => (
                <div key={release.id} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-4">{index + 1}</span>
                  <div className="w-10 h-10 rounded bg-muted flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-muted-foreground/20 to-muted rounded flex items-center justify-center">
                      <Play className="w-3 h-3 text-muted-foreground/50" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{release.title}</p>
                    <p className="text-xs text-muted-foreground">{release.artistName}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ${release.pricing.mp3.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
