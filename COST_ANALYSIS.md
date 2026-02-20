# Artistrax Monthly Cost Analysis

## Artist/Label Subscription Revenue vs Platform Costs

### Current Pricing Structure

| Tier | Monthly Price | Annual Price | Storage |
|------|---------------|--------------|---------|
| **Base** | $20 (artists) / $25 (labels) | $96 / $120 | 10GB |
| **Unlimited** | $25 (artists) / $30 (labels) | $120 / $150 | Unlimited |

---

## 1. Storage Costs (Supabase)

### Free Tier (Included)
- **Storage:** 1GB (we're using this)
- **Bandwidth:** 2GB/month egress
- **Database:** 500MB
- **Cost:** $0

### Pro Tier (What we might need)
- **Storage:** 8GB included
- **Additional storage:** $0.021/GB/month
- **Bandwidth:** 250GB included
- **Additional bandwidth:** $0.09/GB

### Realistic Storage Costs

**Per Artist (10GB included):**
- Supabase storage cost: ~$0.21/GB/month
- 10GB per artist = **$2.10/month per artist**
- Artistrax charges: $20/month
- **Artistrax margin: $17.90/month** (89.5%)

**Per Artist (Unlimited storage):**
- Average usage: ~50GB per active artist
- Supabase cost: 50GB × $0.021 = **$1.05/month**
- OR if using AWS S3: ~$1.15/month for 50GB
- Artistrax charges: $25/month
- **Artistrax margin: $23.95/month** (95.8%)

**Better Option for Unlimited:**
- Use **AWS S3** or **Cloudflare R2** for unlimited storage
- S3 Standard: $0.023/GB/month
- R2: $0.015/GB/month (no egress fees!)

---

## 2. Live Streaming Costs (Mux)

### Mux Pricing
- **Streaming:** $0.004/minute delivered
- **Storage:** $0.003/minute stored (for replays)
- **No monthly minimum**

### Cost Scenarios

**Small Artist (2 hours/month, 50 viewers):**
- Stream duration: 120 minutes
- Viewers: 50
- Minutes delivered: 120 × 50 = 6,000 minutes
- Cost: 6,000 × $0.004 = **$24/stream**
- Monthly (4 streams): **$96/month**
- Artist subscription: $20/month
- **Artistrax loss: -$76/month** ❌

**Medium Artist (4 hours/month, 100 viewers):**
- Stream duration: 240 minutes
- Viewers: 100
- Minutes delivered: 240 × 100 = 24,000 minutes
- Cost: 24,000 × $0.004 = **$96/stream**
- Monthly (4 streams): **$384/month**
- Artist subscription: $20/month
- **Artistrax loss: -$364/month** ❌

### The Problem
Live streaming is EXPENSIVE at scale. We need to either:

1. **Charge extra for streaming** (pass-through cost)
2. **Limit free streaming hours** (e.g., 5 hours/month included)
3. **Use cheaper streaming solution**

---

## 3. Alternative: Cloudflare Stream

### Cloudflare Stream Pricing
- **Storage:** $5/1000 minutes (¢0.005/minute)
- **Delivery:** $1/1000 minutes (¢0.001/minute)
- **No egress fees!**

### Same Scenarios with Cloudflare

**Small Artist (2 hours/month, 50 viewers):**
- Minutes delivered: 6,000
- Cost: 6,000 × $0.001 = **$6/stream**
- Monthly: **$24/month**
- Artist subscription: $20/month
- **Artistrax loss: -$4/month** ⚠️

**Medium Artist (4 hours/month, 100 viewers):**
- Minutes delivered: 24,000
- Cost: 24,000 × $0.001 = **$24/stream**
- Monthly: **$96/month**
- Artist subscription: $20/month
- **Artistrax loss: -$76/month** ❌

Still losing money on active streamers.

---

## 4. Revised Business Model (Profitable)

### Option A: Pass-Through Streaming Costs
**Artist pays:**
- Base subscription: $20/month (platform access)
- PLUS streaming cost: ~$0.004/minute (at cost)

**Example:**
- 4 hours streaming, 100 viewers = $96/month streaming
- Total artist pays: $20 + $96 = $116/month
- Artistrax keeps: $20 (from subscription) + 0% of streaming
- **Artistrax profit: $20 - storage costs (~$2) = $18/month** ✅

### Option B: Include Limited Streaming
- **Base:** $25/month includes 10 hours streaming/month
- **Overage:** $0.50/hour additional
- Average usage: 8 hours
- Mux cost: ~$64/month
- **Artistrax loss: -$39/month** ❌

### Option C: Streaming as Add-On
- **Base:** $20/month (no streaming)
- **Streaming add-on:** $50/month unlimited
- Mux cost for active user: ~$100-400/month
- **Artistrax still loses money** ❌

---

## 5. Realistic Profitable Model

### Hybrid Approach

**Storage:**
- 10GB included: ✅ Profitable (costs $2, charges $20)
- Unlimited: Use R2/S3 (costs ~$1-2 for 50GB, charges $25)

**Streaming:**
- **Free tier:** 2 hours/month included (for testing/promotion)
- **Paid tier:** $1/hour streamed + $0.004/minute per viewer
- OR: $100/month unlimited streaming

### Revenue Breakdown

**1000 artists, mixed tiers:**

| Tier | Count | Monthly Revenue | Storage Cost | Streaming Cost | Profit |
|------|-------|-----------------|--------------|----------------|--------|
| 10GB | 700 | $14,000 | $1,470 | $0 | $12,530 |
| Unlimited | 200 | $5,000 | $230 | $0 | $4,770 |
| Streaming | 100 | $10,000 | $200 | $12,000 | -$2,200 |
| **Total** | **1000** | **$29,000** | **$1,900** | **$12,000** | **$15,100** |

**Profit margin: 52%**

---

## 6. Summary: Cost Per Feature

| Feature | Cost to Artistrax | Revenue | Margin |
|---------|-------------------|---------|--------|
| **10GB Storage** | $2/month | $20/month | 90% ✅ |
| **Unlimited Storage** | $1-2/month | $25/month | 92% ✅ |
| **Live Streaming** | $0.004/minute | Varies | 0-50% ⚠️ |

### Recommendation

**For Launch:**
1. ✅ **Storage is profitable** - Keep as is
2. ⚠️ **Streaming is risky** - Start with limited beta
3. 📊 **Monitor usage** - Adjust pricing based on real data

**Pricing:**
- 10GB: $20/month (profitable ✅)
- Unlimited: $25/month (very profitable ✅)
- Streaming: Start with 2 hours free, then pass-through costs or $100/month unlimited

**Break-even:**
- Need ~100 paying artists to cover $2,000/month infrastructure
- With current pricing, that's easily achievable

**The streaming feature should be an upsell, not included in base price.**