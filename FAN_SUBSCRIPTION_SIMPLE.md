# Fan Subscription to Artists/Labels - Simplified Model

## Overview
Fans can subscribe to individual artists or labels for a low monthly fee. Simple pricing: Fan pays $X/month, Artistrax keeps 5%, artist/label keeps 95%.

## Pricing Structure

### Simple Fan Subscriptions
- **Fan pays:** $1-10/month (artist/label sets price)
- **Platform fee:** 5% (Artistrax)
- **Creator keeps:** 95%
- **Stripe processing:** ~2.9% + $0.30 per transaction

### Example Breakdown
**$5/month subscription:**
- Fan pays: $5.00
- Stripe fee: $0.30 + ($5.00 × 2.9%) = $0.445
- Platform fee (5%): $0.25
- **Artist/Label receives: $4.305**

**$1/month subscription:**
- Fan pays: $1.00
- Stripe fee: $0.30 + ($1.00 × 2.9%) = $0.329
- Platform fee (5%): $0.05
- **Artist/Label receives: $0.621**

## Database Schema (Simplified)

```sql
-- Fan subscriptions to artists/labels
CREATE TABLE fan_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID REFERENCES fans(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  
  -- Monthly price (set by creator, $1-10)
  monthly_price DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  
  -- Stripe
  stripe_subscription_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'active', -- active, canceled
  current_period_end TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  canceled_at TIMESTAMPTZ,
  
  -- Ensure fan subscribes to either artist OR label
  CONSTRAINT one_creator CHECK (
    (artist_id IS NOT NULL AND label_id IS NULL) OR
    (artist_id IS NULL AND label_id IS NOT NULL)
  ),
  
  UNIQUE(fan_id, artist_id),
  UNIQUE(fan_id, label_id)
);

-- Creator settings for fan subscriptions
CREATE TABLE creator_fan_subscription_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  
  is_enabled BOOLEAN DEFAULT FALSE,
  monthly_price DECIMAL(10,2) DEFAULT 5.00,
  
  description TEXT, -- "Support my music and get exclusive perks"
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT one_creator_settings CHECK (
    (artist_id IS NOT NULL AND label_id IS NULL) OR
    (artist_id IS NULL AND label_id IS NULL)
  )
);

-- Benefits for subscribers (applied automatically)
-- 1. Purchase discount (shown at checkout)
-- 2. Early access (tracks flagged as subscriber_early_access)
-- 3. Exclusive live streams (live_streams.subscriber_only = true)
```

## Benefits (Auto-Applied)

When a fan is subscribed to an artist/label, they automatically get:

1. **10% off all purchases** from that creator
2. **Early access** to new releases (24 hours before public)
3. **Access to subscriber-only live streams**
4. **"Subscriber" badge** on their profile

No complex tiers - just one simple subscription per creator.

## Fan Experience

### On Artist/Label Page
```
┌─────────────────────────────────────┐
│  DJ Siesta                          │
│                                     │
│  💎 Subscribe $5/month              │
│                                     │
│  Support my music and get:          │
│  • 10% off all purchases            │
│  • Early access to releases         │
│  • Subscriber-only live streams     │
│                                     │
│  [Subscribe $5/month]               │
│  Cancel anytime                     │
│                                     │
└─────────────────────────────────────┘
```

### At Checkout (if subscribed)
```
Cart Total: $10.00
Subscriber Discount (10%): -$1.00
────────────────────────────
You Pay: $9.00
```

## Revenue Flow

```
Fan subscribes to DJ Siesta for $5/month
    ↓
Stripe charges fan $5.00
    ↓
Stripe fees: $0.445
    ↓
Artistrax fee (5%): $0.25
    ↓
DJ Siesta receives: $4.305 (paid monthly)
```

## API Endpoints

```
POST /api/subscriptions
  Subscribe to artist/label
  Body: { artist_id?, label_id?, price }

DELETE /api/subscriptions/:id
  Cancel subscription

GET /api/subscriptions
  List my subscriptions (fan)

GET /api/creator/subscribers
  List subscribers (artist/label)

GET /api/creator/subscription-settings
PUT /api/creator/subscription-settings
  Configure subscription (artist/label)
```

## Simple Implementation

### Phase 1: Basic Subscription (1 week)
- [ ] Database tables
- [ ] Subscribe button on artist/label pages
- [ ] Stripe subscription creation
- [ ] Cancel subscription

### Phase 2: Benefits (1 week)
- [ ] 10% discount at checkout
- [ ] Early access to tracks
- [ ] Subscriber-only live streams
- [ ] Badge on fan profile

### Phase 3: Creator Dashboard (1 week)
- [ ] Subscriber count
- [ ] Monthly revenue
- [ ] Subscriber list
- [ ] Toggle on/off

## Comparison to Platform Subscriptions

| | Platform Subscription | Fan Subscription |
|---|----------------------|------------------|
| **Who pays** | Artists/Labels | Fans |
| **Price** | $20-25/month | $1-10/month |
| **To whom** | Artistrax | Specific Artist/Label |
| **Benefit** | Upload/sell music | Get discounts/exclusive |
| **Artistrax keeps** | 5-10% of sales | 5% of subscription |

## Summary

- **Fan subscribes** to favorite artists/labels ($1-10/month)
- **Artistrax keeps 5%**, creator gets 95%
- **Automatic benefits:** 10% off, early access, exclusive streams
- **Simple:** One price, no tiers, easy to understand