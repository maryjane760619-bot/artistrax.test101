# Add Subscription Price IDs to Vercel

Go to: https://vercel.com/your-team/music-download-store-2/settings/environment-variables

Add these 4 new environment variables:

```
NEXT_PUBLIC_STRIPE_ARTIST_MONTHLY_PRICE=price_1SyZ9xKbze7gWTYk6gHMaUXX
NEXT_PUBLIC_STRIPE_ARTIST_ANNUAL_PRICE=price_1SyZF5Kbze7gWTYka8dt4sd5
NEXT_PUBLIC_STRIPE_LABEL_MONTHLY_PRICE=price_1SyZGlKbze7gWTYkUL1KjzWf
NEXT_PUBLIC_STRIPE_LABEL_ANNUAL_PRICE=price_1SyZHnKbze7gWTYkRxSZpUaP
```

**Important:** Make sure to select all three environments:
- ✅ Production
- ✅ Preview
- ✅ Development

Then redeploy for changes to take effect.

---

## Later: Live Mode

When switching to Stripe Live mode:
1. Create the same 4 products in Live mode
2. Get new Live Price IDs
3. Replace these test Price IDs with live ones
4. Redeploy
