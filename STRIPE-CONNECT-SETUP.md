# Stripe Connect Integration - Setup & Testing Guide

## Overview

This integration enables automatic 95/5 payment splits between artists/labels (95%) and the platform (5%) using Stripe Connect.

**Payment Flow:**
1. Customer purchases product → Stripe charges full amount
2. 95% automatically transferred to artist/label's Stripe account
3. 5% stays with platform as application fee
4. Artist/label can withdraw to their bank account anytime

---

## Database Setup

### 1. Run the SQL Migration

Execute this in Supabase SQL Editor:

```bash
supabase db push stripe-connect-schema.sql
```

Or copy the contents of `stripe-connect-schema.sql` and run in:
https://wpsmgfulrugrsabgcdmp.supabase.co/project/_/sql

**What it adds:**
- `stripe_account_id` fields to artists/labels tables
- `stripe_onboarding_complete`, `stripe_charges_enabled` status fields
- `payouts` table to track earnings and transfers
- `stripe_payment_intent_id` to orders table

---

## Stripe Dashboard Setup

### 2. Enable Stripe Connect

1. Go to: https://dashboard.stripe.com/test/connect/accounts/overview
2. Click "Get Started" if you haven't enabled Connect yet
3. Choose "Express accounts" (easiest for sellers)
4. Configure Connect settings:
   - Platform profile: Fill out your company info
   - Branding: Add logo and colors

### 3. Configure Webhooks

**For Connect Events:**

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe-connect`
4. Select these events:
   - `account.updated`
   - `payment_intent.succeeded`
   - `transfer.created`
   - `transfer.paid`
5. Copy the webhook signing secret
6. Add to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

**For Local Testing (ngrok):**

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Terminal 3: Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe-connect
```

---

## Testing the Integration

### Step 1: Artist/Label Onboarding

**Option A: Use the Component**

Add to artist/label dashboard:

```tsx
import { StripeConnectButton } from '@/components/stripe-connect-button'

// In your dashboard component:
<StripeConnectButton 
  userId={artistId}
  userType="artist"  // or "label"
  userEmail={artistEmail}
/>
```

**Option B: Test the API Directly**

```bash
# 1. Create Stripe Connect account
curl -X POST http://localhost:3000/api/stripe/connect/create-account \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-artist-id",
    "userType": "artist",
    "email": "artist@example.com"
  }'

# Response: { "accountId": "acct_xxxxx" }

# 2. Get onboarding link
curl -X POST http://localhost:3000/api/stripe/connect/onboarding-link \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "acct_xxxxx",
    "userType": "artist"
  }'

# Response: { "url": "https://connect.stripe.com/setup/..." }

# 3. Visit the URL and complete onboarding
```

**Test Onboarding:**
- Use Stripe's test mode
- You can fill in fake info (name, DOB, SSN, bank details)
- Stripe provides test values: https://stripe.com/docs/connect/testing

### Step 2: Make a Test Purchase

**Update Checkout to Include Seller Info:**

Modify your checkout page to pass seller information:

```tsx
// In checkout page
const response = await fetch('/api/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: total,
    orderId: order.id,
    sellerId: firstItem.artistId,  // or labelId
    sellerType: firstItem.sellerType, // 'artist' or 'label'
    metadata: {
      customerEmail: buyerEmail
    }
  })
})
```

**Test Purchase Flow:**

1. Add product to cart from a connected artist/label
2. Proceed to checkout
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete purchase

**What Happens:**
- Full payment charged to customer
- 95% instantly transferred to artist/label's Connect account
- 5% stays with platform
- Payout record created in database
- Order marked as "processing"

### Step 3: Verify the Split

**Check in Stripe Dashboard:**

1. **Platform account:** https://dashboard.stripe.com/test/payments
   - You'll see the payment
   - Application fee (5%) shown separately

2. **Connected account:** https://dashboard.stripe.com/test/connect/accounts/overview
   - Click on the connected account
   - View balance (should show 95% of sale)

**Check in Database:**

```sql
-- Check order was created
SELECT * FROM orders WHERE id = 'order-id';

-- Check payout was recorded
SELECT * FROM payouts WHERE order_id = 'order-id';

-- Should show:
-- amount: $50.00 (full sale)
-- platform_fee: $2.50 (5%)
-- net_amount: $47.50 (95% to artist)
-- status: 'paid'
```

---

## Dashboard Integration Examples

### Artist Dashboard

```tsx
// app/artist/dashboard/page.tsx
import { StripeConnectButton } from '@/components/stripe-connect-button'
import { useAuth } from '@/lib/auth-context'

export default function ArtistDashboard() {
  const { artist } = useAuth()
  
  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>
      
      {/* Stripe Connect Section */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Setup</h2>
        <StripeConnectButton 
          userId={artist.id}
          userType="artist"
          userEmail={artist.email}
        />
      </div>
      
      {/* Rest of dashboard */}
    </div>
  )
}
```

### Earnings Display

```tsx
// Create a new component: components/earnings-dashboard.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function EarningsDashboard({ userId, userType }) {
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, paid: 0 })
  
  useEffect(() => {
    loadEarnings()
  }, [])
  
  async function loadEarnings() {
    const filter = userType === 'artist' 
      ? { artist_id: userId }
      : { label_id: userId }
      
    const { data } = await supabase
      .from('payouts')
      .select('net_amount, status')
      .match(filter)
    
    if (data) {
      const total = data.reduce((sum, p) => sum + parseFloat(p.net_amount), 0)
      const paid = data.filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + parseFloat(p.net_amount), 0)
      const pending = total - paid
      
      setEarnings({ total, paid, pending })
    }
  }
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-card border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">Total Earnings</p>
        <p className="text-2xl font-bold">${earnings.total.toFixed(2)}</p>
      </div>
      <div className="bg-card border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">Paid Out</p>
        <p className="text-2xl font-bold text-green-600">${earnings.paid.toFixed(2)}</p>
      </div>
      <div className="bg-card border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">Pending</p>
        <p className="text-2xl font-bold text-orange-600">${earnings.pending.toFixed(2)}</p>
      </div>
    </div>
  )
}
```

---

## Production Checklist

Before going live:

- [ ] Switch Stripe from test mode to live mode
- [ ] Update API keys in production `.env`:
  - `STRIPE_SECRET_KEY=sk_live_...`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
- [ ] Configure production webhook endpoint
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Test full flow in live mode (use small real amounts first)
- [ ] Set up Stripe Connect payout schedule (instant, daily, weekly, monthly)
- [ ] Add Stripe Express dashboard link for artists to manage their accounts
- [ ] Configure email notifications for successful payouts

---

## Troubleshooting

### "Seller has not completed Stripe setup"
- Artist/label needs to complete Stripe onboarding
- Check account status: https://dashboard.stripe.com/test/connect/accounts/overview
- Make sure `stripe_charges_enabled` is true

### Payment succeeds but no payout recorded
- Check webhook events in Stripe dashboard
- Verify webhook endpoint is receiving events
- Check application logs for errors

### 95/5 split not working
- Verify `application_fee_amount` is calculated correctly (5% of total)
- Check `transfer_data.destination` has correct Connect account ID
- Ensure payment intent includes seller metadata

### Cannot create Connect account
- Verify email is valid and not already used
- Check Stripe API keys are correct
- Ensure Connect is enabled in Stripe dashboard

---

## API Reference

### POST /api/stripe/connect/create-account
Creates a Stripe Connect Express account.

**Request:**
```json
{
  "userId": "uuid",
  "userType": "artist" | "label",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "accountId": "acct_xxxxx",
  "success": true
}
```

### POST /api/stripe/connect/onboarding-link
Generates an onboarding link for Connect account setup.

**Request:**
```json
{
  "accountId": "acct_xxxxx",
  "userType": "artist" | "label"
}
```

**Response:**
```json
{
  "url": "https://connect.stripe.com/setup/...",
  "success": true
}
```

### POST /api/stripe/connect/account-status
Checks the status of a Connect account.

**Request:**
```json
{
  "userId": "uuid",
  "userType": "artist" | "label"
}
```

**Response:**
```json
{
  "connected": true,
  "accountId": "acct_xxxxx",
  "chargesEnabled": true,
  "detailsSubmitted": true,
  "payoutsEnabled": true,
  "requiresAction": false
}
```

---

## Support Resources

- **Stripe Connect Docs:** https://stripe.com/docs/connect
- **Test Cards:** https://stripe.com/docs/testing
- **Connect Testing:** https://stripe.com/docs/connect/testing
- **Webhook Testing:** https://stripe.com/docs/webhooks/test

---

**Questions? Issues?**
Check Stripe dashboard logs and application console for detailed error messages.
