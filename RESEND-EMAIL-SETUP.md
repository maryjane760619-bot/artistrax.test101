# Resend Email Setup Guide

## Overview
Artistrax uses Resend for transactional emails:
- Welcome emails to new fans, artists, and labels
- Admin notifications for all signups and subscriptions
- From address: `support@artistrax.com`

## Step 1: Create Resend Account

1. Go to: https://resend.com/signup
2. Sign up with your email
3. Verify your email address

## Step 2: Add Domain (artistrax.com)

1. Go to: https://resend.com/domains
2. Click "Add Domain"
3. Enter: `artistrax.com`
4. Resend will show DNS records to add:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT)

5. **Add these DNS records** to your domain registrar:
   - Go to where you manage `artistrax.com` DNS (GoDaddy, Cloudflare, etc.)
   - Add each TXT record exactly as shown by Resend
   - Wait 10-60 minutes for DNS propagation
   - Return to Resend and click "Verify DNS Records"

## Step 3: Get API Key

1. Go to: https://resend.com/api-keys
2. Click "Create API Key"
3. **Name:** Artistrax Production
4. **Permission:** Full Access (or "Send emails" only)
5. Copy the API key (starts with `re_`)

## Step 4: Add to Environment Variables

### Local Development (.env.local)
```bash
RESEND_API_KEY=re_your_api_key_here
```

### Vercel Production
1. Go to: https://vercel.com/maryjane760619-9668s-projects/music-download-store-2/settings/environment-variables
2. Add new variable:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_your_api_key_here`
   - **Environments:** ✅ Production ✅ Preview ✅ Development
3. Click "Save"
4. **Redeploy** for changes to take effect

## Step 5: Verify Setup

### Test Email Locally
Run the dev server and create a new fan account:
```bash
npm run dev
```

Go to: http://localhost:3000/fan/signup

- Create an account
- Check your email for welcome message
- Check `support@artistrax.com` for admin notification

### Check Logs
If emails don't send:
1. Check Vercel function logs for errors
2. Check Resend dashboard for failed emails
3. Verify DNS records are properly configured
4. Ensure API key is set in environment variables

## Email Types Sent

### To Users (Welcome Emails):
- **Fan Signup** → Welcome email to fan
- **Artist Signup** → Welcome email with trial info
- **Label Signup** → Welcome email with trial info

### To Admin (support@artistrax.com):
- **New Fan** → Notification with name + email
- **New Artist** → Notification with profile link + trial end date
- **New Label** → Notification with profile link + trial end date
- **New Subscription** → Notification with payment details

## Pricing

**Resend Pricing:**
- Free tier: 3,000 emails/month
- After: $20/month for 50,000 emails

**Expected Volume:**
- 10 signups/day = 600 emails/month (2 per signup: welcome + admin notification)
- Well within free tier initially

## Troubleshooting

**Emails not sending:**
- Check API key is set correctly
- Verify domain is verified in Resend dashboard
- Check function logs for errors
- Ensure `support@artistrax.com` is a valid mailbox

**Emails going to spam:**
- Make sure DNS records (SPF, DKIM, DMARC) are configured
- Verify domain in Resend dashboard
- Add `support@artistrax.com` to contacts

**Wrong "from" address:**
- Domain must be verified before you can send from `support@artistrax.com`
- Until domain is verified, Resend will use `onboarding@resend.dev` as sender

## Production Checklist

Before launching:
- [ ] Domain `artistrax.com` verified in Resend
- [ ] DNS records added and verified
- [ ] API key added to Vercel environment variables
- [ ] Test emails sent successfully
- [ ] Admin notifications arriving at `support@artistrax.com`
- [ ] Welcome emails arriving in user inboxes (not spam)

## Support

- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
- Check dashboard: https://resend.com/emails

---

**Files Modified:**
- `lib/resend.ts` - Resend client configuration
- `lib/email-templates.ts` - Email HTML templates
- `lib/email-service.ts` - Helper functions to send emails
- `app/api/email/welcome/route.ts` - Welcome email API endpoint
- `app/fan/signup/page.tsx` - Triggers welcome email
- `app/artist/signup/page.tsx` - Triggers welcome email
- `app/label/signup/page.tsx` - Triggers welcome email
- `app/api/webhooks/stripe/route.ts` - Sends subscription notifications
