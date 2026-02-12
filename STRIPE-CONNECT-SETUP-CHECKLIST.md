# Stripe Connect Production Setup Checklist

## 🎯 Goal
Enable instant payouts + automatic tax reporting for artists and labels

---

## ✅ Step 1: Database Migration (5 minutes)

### Run SQL in Supabase:

1. Go to https://supabase.com/dashboard
2. Select your project: `wpsmgfulrugrsabgcdmp`
3. Click **SQL Editor** in left sidebar
4. Click **New Query**
5. Paste this SQL:

```sql
-- Add stripe_account_id columns
ALTER TABLE artists ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE labels ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_artists_stripe_account ON artists(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_labels_stripe_account ON labels(stripe_account_id);

-- Add comments
COMMENT ON COLUMN artists.stripe_account_id IS 'Stripe Connect Express account ID for receiving payments';
COMMENT ON COLUMN labels.stripe_account_id IS 'Stripe Connect Express account ID for receiving payments';
```

6. Click **Run** button
7. Verify: Should see "Success. No rows returned"

---

## ✅ Step 2: Enable Stripe Connect in Dashboard (10 minutes)

### Stripe Dashboard Setup:

1. Go to https://dashboard.stripe.com
2. Click **Connect** in left sidebar (under "Products")
3. Click **Get Started** (if first time)
4. Enable **Express accounts** (simplest for artists)
5. Set **Application name:** "artistrax"
6. Set **Support email:** support@artistrax.com
7. Enable **Standard onboarding** (fastest)
8. Click **Save settings**

### Platform Settings:

1. In Connect dashboard, click **Settings**
2. **Branding:**
   - Name: artistrax
   - Icon: Upload artistrax logo (if you have one)
   - Color: #1F4E3D (forest green)
3. **Statement descriptor:** "ARTISTRAX" (shows on bank statements)
4. Click **Save**

### Webhook Setup:

1. Click **Webhooks** in left sidebar
2. Click **Add endpoint**
3. URL: `https://music-download-store-2.vercel.app/api/webhooks/stripe`
4. Description: "Stripe Connect events"
5. **Events to send:**
   - `account.updated`
   - `account.external_account.created`
   - `account.external_account.deleted`
   - `charge.succeeded`
   - `charge.failed`
   - `payout.paid`
   - `payout.failed`
6. Click **Add endpoint**
7. **Copy webhook signing secret** (starts with `whsec_`)
8. Save this for Step 3

---

## ✅ Step 3: Environment Variables (5 minutes)

### Add to Vercel:

1. Go to https://vercel.com/dashboard
2. Select project: **music-download-store-2**
3. Click **Settings** → **Environment Variables**
4. Add these:

**Already have (verify they exist):**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_... (or pk_live_...)
STRIPE_SECRET_KEY = sk_test_... (or sk_live_...)
STRIPE_WEBHOOK_SECRET = whsec_...
```

**Need to verify:**
- Make sure you're using the RIGHT keys (test vs live)
- For testing: Use test keys (pk_test, sk_test)
- For production launch: Switch to live keys (pk_live, sk_live)

**No new variables needed!** Stripe Connect uses the same keys.

4. Click **Save**
5. **Redeploy** (changes take effect immediately)

---

## ✅ Step 4: Test Artist Onboarding (15 minutes)

### Create Test Artist Account:

1. Go to https://music-download-store-2.vercel.app/artist/signup
2. Create new artist account:
   - Username: `test-artist-stripe`
   - Email: Your test email
   - Password: Something secure
3. Log in to artist dashboard
4. Click **"Connect Stripe"** (should be in dashboard or billing section)
5. Complete Stripe onboarding:
   - Business type: Individual
   - Personal info: Use test data (Stripe test mode accepts fake info)
   - Bank account: Use Stripe test account numbers:
     - Routing: 110000000
     - Account: 000123456789
   - Submit

### Verify Onboarding:

1. Check Supabase:
   - Go to **Table Editor** → `artists` table
   - Find your test artist
   - Should see `stripe_account_id` populated (starts with `acct_`)
2. Check Stripe Dashboard:
   - Go to **Connect** → **Accounts**
   - Should see new Express account listed
   - Status should be "Enabled" or "Pending" (depending on onboarding completion)

---

## ✅ Step 5: Test Payment Splitting (20 minutes)

### Make Test Purchase:

1. Open incognito window
2. Go to https://music-download-store-2.vercel.app
3. Find track uploaded by your test artist
4. Purchase with Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete purchase

### Verify Split Payment:

1. **In Stripe Dashboard:**
   - Go to **Payments** → **All payments**
   - Find the test payment
   - Should show:
     - Total: $1.99
     - Platform fee: $0.10 (5% of $1.99)
     - Transfer to artist: $1.89 (95%)
2. **In Connect Accounts:**
   - Go to **Connect** → **Accounts**
   - Click on test artist account
   - Go to **Transfers** tab
   - Should see $1.89 transfer (pending or completed)

**If you see this:** ✅ Payment splitting is working!

---

## ✅ Step 6: Test Label Onboarding (Optional - 10 minutes)

Same process as artist, but:
1. Go to `/label/signup`
2. Create test label account
3. Connect Stripe
4. Upload track as label
5. Purchase and verify 90% split (artist keeps 90%, platform 10%)

---

## 🐛 Troubleshooting

### Issue: "Stripe Connect not enabled"
**Fix:** Make sure you enabled Connect in Stripe dashboard (Step 2)

### Issue: "stripe_account_id not saving"
**Fix:** Run database migration again (Step 1)

### Issue: "Onboarding flow not appearing"
**Fix:** Check that Stripe API keys are correct in Vercel env vars

### Issue: "Payment not splitting"
**Fix:** 
1. Verify artist has `stripe_account_id` in database
2. Check Stripe webhook is receiving events
3. Look for errors in Vercel logs

---

## ✅ Success Criteria

**You're ready when:**

✅ Database has `stripe_account_id` columns
✅ Stripe Connect enabled in dashboard
✅ Test artist can complete onboarding
✅ Test purchase splits payment correctly (95%/5%)
✅ Artist sees transfer in Stripe dashboard
✅ No errors in console or Vercel logs

---

## 📊 What Artists See

### Before Connecting Stripe:
- Dashboard shows: "Connect Stripe to receive payments"
- Earnings shown but not accessible
- Big "Connect Stripe" button

### After Connecting Stripe:
- Dashboard shows: "Stripe Connected ✓"
- Earnings instantly transferred to their bank
- "View Payouts" button (links to Stripe dashboard)
- Tax forms sent automatically by Stripe (1099-Ks)

---

## 💰 Commission Structure (Automatic)

**Artists:**
- Sale: $1.99
- Artist receives: $1.89 (95%)
- Platform keeps: $0.10 (5%)

**Labels:**
- Sale: $1.99
- Label receives: $1.79 (90%)
- Platform keeps: $0.20 (10%)

**Stripe handles all splitting automatically.** No manual transfers needed.

---

## 🎯 Next Steps After Setup

1. **Test thoroughly** (make several test purchases)
2. **Switch to live mode** (when ready for real money):
   - Replace test API keys with live keys in Vercel
   - Redeploy
   - Re-test with real card (then refund)
3. **Update marketing** to mention:
   - "Instant payouts via Stripe Connect"
   - "Automatic 1099-K tax reporting"
   - "Keep 95% (artists) or 90% (labels)"

---

## 📞 Need Help?

**Stripe Connect Docs:** https://stripe.com/docs/connect
**Stripe Support:** https://support.stripe.com
**Supabase Support:** https://supabase.com/support

---

**Estimated Total Time:** ~1 hour
**Status:** Ready to execute! 🚀
