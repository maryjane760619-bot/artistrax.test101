# Subscription System Setup Guide

Complete setup instructions for the artistrax subscription system.

---

## 📋 Overview

**Subscription Plans:**
- **Artists:** $20/month or $96/year (60% off)
- **Labels:** $25/month or $120/year (60% off)
- **Storage Add-On:** $5/month for unlimited storage
- **Trial:** 30 days free, credit card required, cancel anytime

---

## 🗄️ Step 1: Update Database

Run the SQL migration files in order:

```bash
# 1. Base subscription schema (if not already run)
psql -h [your-supabase-host] -U postgres -d postgres -f supabase-subscriptions-schema.sql

# 2. Enhanced schema with storage tracking
psql -h [your-supabase-host] -U postgres -d postgres -f supabase-subscriptions-v2-schema.sql
```

**Or via Supabase Dashboard:**
1. Go to SQL Editor
2. Copy contents of `supabase-subscriptions-v2-schema.sql`
3. Paste and run

---

## 💳 Step 2: Create Stripe Products

Run the product setup script:

```bash
npm install stripe dotenv

node stripe-subscription-products.js
```

**This creates:**
- Artist Monthly ($20/month)
- Artist Annual ($96/year)
- Label Monthly ($25/month)
- Label Annual ($120/year)
- Unlimited Storage Add-On ($5/month)

**Output:**
The script will print environment variables. Copy them to `.env.local`:

```env
# Add these to your .env.local file

# Artist Subscription Price IDs
STRIPE_ARTIST_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ARTIST_ANNUAL_PRICE_ID=price_xxxxxxxxxxxxx

# Label Subscription Price IDs
STRIPE_LABEL_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_LABEL_ANNUAL_PRICE_ID=price_xxxxxxxxxxxxx

# Storage Add-On Price ID
STRIPE_UNLIMITED_STORAGE_PRICE_ID=price_xxxxxxxxxxxxx

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=https://artistrax.com
```

---

## 🔔 Step 3: Configure Stripe Webhooks

### Create Webhook Endpoint

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter endpoint URL:
   ```
   https://artistrax.com/api/webhooks/stripe-subscriptions
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Click **Add endpoint**

### Get Webhook Secret

1. After creating the endpoint, click on it
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🧪 Step 4: Test Subscriptions

### Test Mode (Recommended First)

Use Stripe test mode initially:

```env
# Use test keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

### Test Cards

**Successful payment:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Payment declined:**
```
Card: 4000 0000 0000 0002
```

### Test Flow

1. Go to `/artist/subscribe` or `/label/subscribe`
2. Select a plan (monthly or annual)
3. Click "Start Free Trial"
4. Enter test card details
5. Complete checkout
6. Verify redirect to dashboard
7. Check subscription status in database

---

## 🚀 Step 5: Go Live

### Switch to Live Mode

1. Get live Stripe keys from [Dashboard](https://dashboard.stripe.com/apikeys)
2. Update `.env.local`:

```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
```

3. **Re-run product setup script** with live keys (products are mode-specific)
4. Create new webhook endpoint for live mode
5. Update `STRIPE_WEBHOOK_SECRET` with live webhook secret

---

## 📊 Step 6: Monitor Subscriptions

### Subscription Analytics

Query subscription stats:

```sql
-- Artist subscription breakdown
SELECT * FROM artist_subscription_stats;

-- Label subscription breakdown
SELECT * FROM label_subscription_stats;

-- Recent subscription events
SELECT * FROM subscription_events 
ORDER BY created_at DESC 
LIMIT 50;
```

### Stripe Dashboard

Monitor in real-time:
- [Subscriptions](https://dashboard.stripe.com/subscriptions)
- [Customers](https://dashboard.stripe.com/customers)
- [Revenue](https://dashboard.stripe.com/revenue)
- [Webhooks](https://dashboard.stripe.com/webhooks)

---

## 🔧 Troubleshooting

### Subscription Not Updating

**Check:**
1. Webhook is active and receiving events
2. Webhook secret is correct in `.env.local`
3. Check webhook logs in Stripe Dashboard
4. Look at server logs for errors

**Fix:**
```bash
# Verify webhook endpoint is accessible
curl https://artistrax.com/api/webhooks/stripe-subscriptions

# Should return 405 Method Not Allowed (POST required)
```

### Trial Not Starting

**Check database:**
```sql
SELECT 
  username, 
  subscription_status, 
  trial_ends_at,
  stripe_subscription_id
FROM artists 
WHERE id = 'user-id-here';
```

**If trial_ends_at is NULL:**
- Webhook didn't fire
- Check Stripe Dashboard → Events
- Manually trigger webhook event

### Payment Failing

**Common causes:**
- Card declined
- Insufficient funds
- Payment method removed

**Stripe handles:**
- Automatic retries (3 attempts)
- Email notifications to customer
- Webhook events: `invoice.payment_failed`

---

## 📝 Next Steps

### Features to Add

1. **Email Notifications**
   - Trial ending reminders (7 days, 3 days, 1 day)
   - Payment receipts
   - Subscription canceled confirmations

2. **Unlimited Storage Upgrade**
   - Add storage upgrade flow
   - Handle storage add-on subscription

3. **Proration Handling**
   - Plan upgrades (monthly → annual)
   - Storage upgrades

4. **Admin Dashboard**
   - View all subscriptions
   - Manually cancel/refund
   - Revenue analytics

---

## 🎯 Testing Checklist

- [ ] Artist can start trial (monthly plan)
- [ ] Artist can start trial (annual plan)
- [ ] Label can start trial (monthly plan)
- [ ] Label can start trial (annual plan)
- [ ] Trial countdown shows correctly
- [ ] Trial converts to paid after 30 days
- [ ] Payment succeeds webhook updates database
- [ ] Cancel subscription works
- [ ] Canceled subscription maintains access until period end
- [ ] Storage usage displays correctly
- [ ] Storage quota prevents over-limit uploads

---

## 💰 Revenue Projections

**At 10,000 subscribers (50% monthly, 50% annual):**

**Artists (70% = 7,000):**
- 3,500 monthly: 3,500 × $20 × 12 = $840,000
- 3,500 annual: 3,500 × $96 = $336,000
- **Subtotal: $1,176,000/year**

**Labels (30% = 3,000):**
- 1,500 monthly: 1,500 × $25 × 12 = $450,000
- 1,500 annual: 1,500 × $120 = $180,000
- **Subtotal: $630,000/year**

**Storage Add-Ons (20% upgrade):**
- 2,000 × $5 × 12 = $120,000/year

**Total Subscription Revenue: $1,926,000/year**

Plus transaction fees (5% artists, 10% labels) + Treasury interest!

---

## 📞 Support

**Issues?**
- Check Stripe Dashboard logs
- Review server console logs
- Verify webhook signatures
- Test with Stripe CLI for local development

**Stripe CLI (for local testing):**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe-subscriptions
```

🌿
