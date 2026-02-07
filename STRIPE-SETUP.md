# Stripe Payment Setup

This guide explains how to enable paid track downloads on artistrax.

## 1. Create a Stripe Account

Go to https://stripe.com and sign up for a free account.

## 2. Get Your API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

## 3. Add Keys to Environment Variables

### Local Development (.env.local)

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_key_here  # We'll get this in step 4
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production (Vercel)

Run these commands in your terminal:

```bash
cd /path/to/music-download-store-2

# Add publishable key
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production

# Add secret key
vercel env add STRIPE_SECRET_KEY production

# Add webhook secret (after step 4)
vercel env add STRIPE_WEBHOOK_SECRET production

# Add site URL
vercel env add NEXT_PUBLIC_SITE_URL production
# (Enter: https://music-download-store-2.vercel.app)
```

## 4. Set Up Webhooks

Webhooks let Stripe notify your app when a payment completes.

### For Production:

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter endpoint URL: `https://music-download-store-2.vercel.app/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to Vercel: `vercel env add STRIPE_WEBHOOK_SECRET production`

### For Local Testing (Optional):

Use Stripe CLI to forward webhooks to localhost:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 5. Deploy

After adding all environment variables:

```bash
vercel --prod
```

## 6. Test the Payment Flow

1. Go to your live site
2. Find a paid track (price > $0)
3. Click "Buy for $X.XX"
4. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
5. Complete checkout
6. You should be redirected to success page
7. Purchase should appear in Supabase `purchases` table

## Test Credit Cards

Stripe provides test cards for different scenarios:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

All test cards:
- Use any future expiry date
- Use any 3-digit CVC
- Use any ZIP code

## Go Live

When ready for real payments:

1. Complete Stripe account verification
2. Switch to **Live mode** in Stripe dashboard
3. Get your **live** API keys (start with `pk_live_` and `sk_live_`)
4. Update Vercel environment variables with live keys
5. Set up live webhook endpoint
6. Deploy!

## Troubleshooting

- **"No signature" error:** Webhook secret is missing or incorrect
- **Payment not recording:** Check Stripe webhook logs
- **Redirect not working:** Verify `NEXT_PUBLIC_SITE_URL` is correct
