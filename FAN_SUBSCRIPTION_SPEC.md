# Fan Subscription to Artists/Labels Specification

## Overview
Allow fans to subscribe to individual artists or labels for exclusive benefits. This is separate from the platform subscription - it's fan → creator subscriptions.

## Use Cases

### Fan Benefits
- Access to subscriber-only live streams
- Early access to new releases (24-48 hours early)
- Discount on purchases (10-20% off)
- Exclusive content (behind-the-scenes, demos)
- Direct messaging with artist/label
- Subscriber-only chat badge

### Artist/Label Benefits
- Recurring monthly revenue from fans
- Predictable income stream
- Direct relationship with super fans
- Higher engagement from committed fans

## Pricing Structure

### Artist-Fan Subscriptions
- **Monthly:** $5-15/month (artist sets price)
- **Annual:** $50-150/year (2 months free)
- **Platform fee:** 10% of subscription revenue
- **Artist keeps:** 90%

### Label-Fan Subscriptions
- **Monthly:** $10-30/month (label sets price)
- **Annual:** $100-300/year (2 months free)
- **Platform fee:** 10% of subscription revenue
- **Label keeps:** 90%

## Database Schema

```sql
-- Fan subscriptions to artists/labels
CREATE TABLE fan_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID REFERENCES fans(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  
  -- Pricing (set by artist/label)
  price_monthly DECIMAL(10,2) NOT NULL,
  price_annual DECIMAL(10,2),
  
  -- Subscription type
  tier_name TEXT DEFAULT 'Standard', -- e.g., "Fan", "Super Fan", "VIP"
  tier_description TEXT,
  
  -- Stripe subscription
  stripe_subscription_id TEXT,
  stripe_price_id_monthly TEXT,
  stripe_price_id_annual TEXT,
  
  -- Status
  status TEXT DEFAULT 'active', -- active, canceled, paused, past_due
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Benefits configuration (JSONB for flexibility)
  benefits JSONB DEFAULT '{
    "early_access_hours": 24,
    "purchase_discount_percent": 10,
    "exclusive_livestreams": true,
    "direct_messaging": true,
    "subscriber_badge": true
  }',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  canceled_at TIMESTAMPTZ,
  
  -- Ensure fan subscribes to either artist OR label, not both
  CONSTRAINT one_creator CHECK (
    (artist_id IS NOT NULL AND label_id IS NULL) OR
    (artist_id IS NULL AND label_id IS NOT NULL)
  ),
  
  UNIQUE(fan_id, artist_id),
  UNIQUE(fan_id, label_id)
);

-- Track subscription payments
CREATE TABLE fan_subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES fan_subscriptions(id) ON DELETE CASCADE,
  
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  creator_payout DECIMAL(10,2) NOT NULL,
  
  status TEXT DEFAULT 'succeeded', -- succeeded, failed, pending
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator subscription settings (what artist/label offers)
CREATE TABLE creator_subscription_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  
  -- Enabled/disabled
  is_enabled BOOLEAN DEFAULT FALSE,
  
  -- Pricing
  monthly_price DECIMAL(10,2) DEFAULT 5.00,
  annual_price DECIMAL(10,2) DEFAULT 50.00,
  
  -- Subscription name/description
  tier_name TEXT DEFAULT 'Fan Subscription',
  description TEXT,
  
  -- Benefits offered
  benefits JSONB DEFAULT '{
    "early_access_hours": 24,
    "purchase_discount_percent": 10,
    "exclusive_livestreams": true,
    "direct_messaging": true,
    "subscriber_badge": true,
    "exclusive_releases": true
  }',
  
  -- Welcome message for new subscribers
  welcome_message TEXT,
  
  -- Subscriber-only content preview
  preview_image_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT one_creator_settings CHECK (
    (artist_id IS NOT NULL AND label_id IS NULL) OR
    (artist_id IS NULL AND label_id IS NOT NULL)
  )
);

-- Index for performance
CREATE INDEX idx_fan_subscriptions_fan ON fan_subscriptions(fan_id);
CREATE INDEX idx_fan_subscriptions_artist ON fan_subscriptions(artist_id);
CREATE INDEX idx_fan_subscriptions_label ON fan_subscriptions(label_id);
CREATE INDEX idx_fan_subscriptions_status ON fan_subscriptions(status);
```

## API Endpoints

### Fan Endpoints
```
GET    /api/fan/subscriptions
       List all fan's active subscriptions

POST   /api/fan/subscriptions
       Subscribe to artist/label
       Body: { artist_id?, label_id?, billing_cycle: 'monthly' | 'annual' }

PUT    /api/fan/subscriptions/:id
       Update subscription (change tier, cancel, etc.)

DELETE /api/fan/subscriptions/:id
       Cancel subscription
```

### Creator (Artist/Label) Endpoints
```
GET    /api/creator/subscriptions/settings
       Get subscription settings

PUT    /api/creator/subscriptions/settings
       Update subscription settings (price, benefits)

GET    /api/creator/subscriptions
       List all subscribers
       Query params: status, page, limit

GET    /api/creator/subscriptions/stats
       Revenue stats, churn, etc.
```

## UI Components

### 1. Fan - Subscribe Button on Artist Page
```
┌─────────────────────────────────────┐
│  [Artist Profile Header]            │
│                                     │
│  💎 Subscribe for $5/month          │
│                                     │
│  ✓ Early access to releases         │
│  ✓ 10% off all purchases            │
│  ✓ Subscriber-only live streams     │
│  ✓ Direct messaging                 │
│  ✓ Exclusive behind-the-scenes      │
│                                     │
│  [Subscribe Monthly] [$50/year]     │
│                                     │
└─────────────────────────────────────┘
```

### 2. Fan - Subscription Management
```
┌─────────────────────────────────────┐
│  My Subscriptions                   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ DJ Siesta                     │  │
│  │ $5/month • Renews Jan 15      │  │
│  │ [Manage] [Cancel]             │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Mary Records                  │  │
│  │ $10/month • Renews Feb 1      │  │
│  │ [Manage] [Cancel]             │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### 3. Creator - Subscription Settings
```
┌─────────────────────────────────────┐
│  Fan Subscriptions Settings         │
│                                     │
│  [✓] Enable Fan Subscriptions       │
│                                     │
│  Monthly Price: [$5.00    ]         │
│  Annual Price:  [$50.00    ]        │
│                                     │
│  Subscription Name:                 │
│  [Super Fan Tier      ]             │
│                                     │
│  Benefits:                          │
│  [✓] Early access (24 hours)        │
│  [✓] Purchase discount (10%)        │
│  [✓] Exclusive live streams         │
│  [✓] Direct messaging               │
│  [✓] Subscriber badge               │
│                                     │
│  Welcome Message:                   │
│  [Thanks for subscribing!...]       │
│                                     │
│  [Save Settings]                    │
│                                     │
└─────────────────────────────────────┘
```

### 4. Creator - Subscribers Dashboard
```
┌─────────────────────────────────────┐
│  Subscribers                        │
│                                     │
│  Total: 156 • MRR: $780             │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Name         Since    Status  │  │
│  │ Mike S.      3mo      Active  │  │
│  │ Sarah J.     1mo      Active  │  │
│  │ Alex R.      5mo      Active  │  │
│  │ ...                           │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Export CSV] [Message All]         │
│                                     │
└─────────────────────────────────────┘
```

## Stripe Integration

### Webhook Events to Handle
```javascript
// subscription.created
// subscription.updated
// subscription.deleted
// invoice.paid
// invoice.payment_failed
```

### Payment Flow
1. Fan clicks "Subscribe"
2. Create Stripe Checkout session
3. Fan enters payment info
4. Stripe creates subscription
5. Webhook updates database
6. Fan gets immediate access to benefits

### Revenue Split
```
Fan pays: $10/month
  ↓
Stripe fee: $0.30 + 2.9% = $0.59
  ↓
Platform fee (10%): $1.00
  ↓
Creator receives: $8.41
```

## Benefits Implementation

### 1. Early Access
- Add `subscriber_early_access` boolean to tracks table
- Check subscription status before showing track
- Show countdown for non-subscribers

### 2. Purchase Discount
- Apply discount automatically at checkout
- Show "Subscriber Price: $X.XX" on track pages

### 3. Exclusive Live Streams
- Add `subscriber_only` boolean to live_streams
- Check subscription before allowing view

### 4. Direct Messaging
- Allow subscribers to message creator
- Show "Subscribers Only" badge

### 5. Subscriber Badge
- Show special badge in chat/comments
- Different badge per tier

## Migration/Setup

### For Existing Artists/Labels
- Opt-in feature (disabled by default)
- Can enable in settings
- Set their own prices
- Customize benefits

### Recommended Default Prices
- **Artists:** $5/month or $50/year
- **Labels:** $10/month or $100/year

## Analytics to Track

- Total subscribers
- Monthly recurring revenue (MRR)
- Churn rate
- Average subscription length
- Revenue by tier
- Most popular benefits