# Stripe Subscription Setup Guide

## Step 1: Create Products in Stripe Dashboard

Go to: https://dashboard.stripe.com/test/products

### Product 1: Artist Subscription

1. Click **"+ Add product"**
2. **Name:** Artist Subscription
3. **Description:** Monthly or annual subscription for artists on Artistrax
4. **Pricing:**
   - Click **"+ Add another price"** to create both prices:
   
   **Price 1 - Monthly:**
   - Type: Recurring
   - Amount: $20.00 USD
   - Billing period: Monthly
   - Free trial: 30 days ✅
   - Price description: "Artist Monthly"
   
   **Price 2 - Annual:**
   - Type: Recurring
   - Amount: $96.00 USD
   - Billing period: Yearly
   - Free trial: 30 days ✅
   - Price description: "Artist Annual (60% off)"

5. Click **"Save product"**

### Product 2: Label Subscription

1. Click **"+ Add product"**
2. **Name:** Label Subscription
3. **Description:** Monthly or annual subscription for labels on Artistrax
4. **Pricing:**
   
   **Price 1 - Monthly:**
   - Type: Recurring
   - Amount: $25.00 USD
   - Billing period: Monthly
   - Free trial: 30 days ✅
   - Price description: "Label Monthly"
   
   **Price 2 - Annual:**
   - Type: Recurring
   - Amount: $120.00 USD
   - Billing period: Yearly
   - Free trial: 30 days ✅
   - Price description: "Label Annual (60% off)"

5. Click **"Save product"**

---

## Step 2: Copy Price IDs

After creating each price, Stripe will give you a **Price ID** (starts with `price_`).

Click on each price and copy its ID. You'll need 4 total:
- Artist Monthly Price ID
- Artist Annual Price ID
- Label Monthly Price ID
- Label Annual Price ID

---

## Step 3: Add to Config File

Open `lib/stripe-config.ts` and paste your Price IDs into the config object.

---

## Step 4: Add to Environment Variables

Add to `.env.local` and Vercel:

```
# Subscription Price IDs
NEXT_PUBLIC_STRIPE_ARTIST_MONTHLY_PRICE=price_xxx
NEXT_PUBLIC_STRIPE_ARTIST_ANNUAL_PRICE=price_xxx
NEXT_PUBLIC_STRIPE_LABEL_MONTHLY_PRICE=price_xxx
NEXT_PUBLIC_STRIPE_LABEL_ANNUAL_PRICE=price_xxx
```

---

## Later: Switch to Live Mode

When ready for production:
1. Create the same products in **Live mode** (toggle in Stripe Dashboard)
2. Get new Live Price IDs
3. Update environment variables with live IDs
4. Deploy to Vercel

---

## Free Trial Notes

- Stripe automatically handles the 30-day trial
- Customer won't be charged until trial ends
- They can cancel anytime during trial with no charge
- After trial, they're charged monthly/annually based on their plan
