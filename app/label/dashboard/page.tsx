'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Music, ExternalLink, DollarSign, TrendingUp } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function LabelDashboard() {
  const { user } = useAuth()
  const [labelData, setLabelData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    
    const fetchData = async () => {
      const { data } = await supabase
        .from('labels')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setLabelData(data)
      setLoading(false)
    }
    
    fetchData()
  }, [user])

  if (!user) return <div>Please log in</div>
  if (loading) return <div>Loading...</div>

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{labelData?.name || 'Label Dashboard'}</h1>
            <p className="text-muted-foreground">Manage your catalog and artists</p>
          </div>

          {/* Stripe Status - Simple */}
          <Card className="mb-8 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-xl font-bold text-green-800">Stripe Connected!</h3>
                  <p className="text-green-700">You're ready to receive payments.</p>
                </div>
              </div>
              <ul className="text-sm space-y-2 text-green-800 mb-4">
                <li>✓ Charges enabled</li>
                <li>✓ You keep 90% of every sale</li>
                <li>✓ Monthly payouts</li>
              </ul>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Stripe Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Music className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">18</p>
                    <p className="text-sm text-muted-foreground">Tracks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">$0</p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Public Page Link */}
          <div className="text-center">
            <Button asChild size="lg">
              <Link href="/labels/siesta-records" target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public Page
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}