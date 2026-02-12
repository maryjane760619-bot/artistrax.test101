# Check Artist Account in Supabase

## Step 1: Find Your User ID

1. Open browser console on artistrax (F12)
2. Paste this and press Enter:
```javascript
(await supabase.auth.getUser()).data.user?.id
```
3. Copy the ID that appears (looks like: `60660d4f-5eaa-45c1-8705-d133bab4c124`)

---

## Step 2: Check if Artist Record Exists

1. Go to Supabase: https://supabase.com/dashboard
2. Click **Table Editor** → **artists** table
3. Look for a row with that ID
4. **Does it exist?**

**If YES:**
- Good! There's another issue. Check console for new errors.

**If NO:**
- Your artist account is missing from the database
- This happens sometimes with signup issues
- We need to create it manually or re-signup

---

## Step 3: If Missing, Create Artist Record Manually

Run this SQL in Supabase (replace YOUR_USER_ID with the ID from Step 1):

```sql
INSERT INTO artists (
  id, 
  username, 
  email, 
  display_name,
  subscription_status,
  trial_ends_at,
  created_at
) VALUES (
  'YOUR_USER_ID',  -- Replace with your user ID
  'test-artist',
  'your-email@example.com',  -- Replace with your email
  'Test Artist',
  'trialing',
  NOW() + INTERVAL '30 days',
  NOW()
);
```

Then refresh dashboard.

---

## Quick Alternative: Re-signup

1. Sign out
2. Go to /artist/signup
3. Create NEW account with different email
4. Try dashboard

This often fixes auth/database sync issues.
