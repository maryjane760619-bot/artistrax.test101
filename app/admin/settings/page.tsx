'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your store configuration</p>
      </div>

      {/* Store Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Basic information about your music store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input id="storeName" defaultValue="artistrax" className="bg-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeEmail">Contact Email</Label>
              <Input id="storeEmail" type="email" defaultValue="hello@siestalife.com" className="bg-input" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeDescription">Store Description</Label>
            <Textarea 
              id="storeDescription" 
              defaultValue="Premium digital music downloads from independent artists."
              className="bg-input" 
            />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
          <CardDescription>Configure your payment gateway</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stripeKey">Stripe Public Key</Label>
            <Input id="stripeKey" placeholder="pk_live_..." className="bg-input font-mono text-sm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stripeSecret">Stripe Secret Key</Label>
            <Input id="stripeSecret" type="password" placeholder="sk_live_..." className="bg-input font-mono text-sm" />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="testMode">Test Mode</Label>
              <p className="text-xs text-muted-foreground">Use Stripe test environment</p>
            </div>
            <Switch id="testMode" />
          </div>
          <Button>Update Payment Settings</Button>
        </CardContent>
      </Card>

      {/* Download Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Download Settings</CardTitle>
          <CardDescription>Configure download link behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkExpiry">Link Expiry (days)</Label>
            <Input id="linkExpiry" type="number" defaultValue="7" className="bg-input w-32" />
            <p className="text-xs text-muted-foreground">Download links expire after this many days</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxDownloads">Max Downloads per Link</Label>
            <Input id="maxDownloads" type="number" defaultValue="5" className="bg-input w-32" />
            <p className="text-xs text-muted-foreground">Maximum number of downloads per purchase</p>
          </div>
          <Button>Save Download Settings</Button>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Email Integration</CardTitle>
          <CardDescription>Connect your email marketing service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mailchimpKey">Mailchimp API Key</Label>
            <Input id="mailchimpKey" placeholder="Enter your Mailchimp API key" className="bg-input font-mono text-sm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="listId">Mailing List ID</Label>
            <Input id="listId" placeholder="Enter your list ID" className="bg-input font-mono text-sm" />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="autoSubscribe">Auto-subscribe customers</Label>
              <p className="text-xs text-muted-foreground">Add customers to mailing list after purchase</p>
            </div>
            <Switch id="autoSubscribe" defaultChecked />
          </div>
          <Button>Connect Mailchimp</Button>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Track visitor and sales data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gaId">Google Analytics ID</Label>
            <Input id="gaId" placeholder="G-XXXXXXXXXX" className="bg-input font-mono text-sm" />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="enableAnalytics">Enable Analytics</Label>
              <p className="text-xs text-muted-foreground">Track page views and conversions</p>
            </div>
            <Switch id="enableAnalytics" defaultChecked />
          </div>
          <Button>Save Analytics Settings</Button>
        </CardContent>
      </Card>
    </div>
  )
}
