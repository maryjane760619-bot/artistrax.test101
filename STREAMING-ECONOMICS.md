# Stream Your Purchases - Economics Breakdown
## "Buy Once, Stream Forever" Cost Analysis

---

## Executive Summary

**Model:** Fans buy a track once ($1.99), then can:
- Download lossless files (WAV/FLAC) unlimited times
- Stream MP3 320kbps unlimited times (forever)

**Key Question:** How many streams before we lose money?

**Answer:** ~70 streams per purchase = break-even (cost ≈ revenue)

**Reality:** Most users stream 10-20 times/year = highly profitable ✅

---

## Cost Breakdown Per Track

### One-Time Costs (Per Track Upload)

| Item | Cost | Notes |
|------|------|-------|
| **Storage (WAV)** | $0.02/GB/mo | 50MB file = $0.001/month |
| **Storage (MP3)** | $0.02/GB/mo | 10MB file = $0.0002/month |
| **Transcoding** | $0.001 | WAV → MP3 320kbps (one-time) |
| **Total Upload Cost** | **$0.001** | One-time per track |

### Per-Stream Costs

| Item | Cost per Stream | Notes |
|------|-----------------|-------|
| **Bandwidth (Supabase)** | $0.0007 | 10MB MP3 × $0.07/GB |
| **API calls** | $0.0001 | Negligible |
| **CDN/edge** | $0.0001 | Included in Supabase |
| **Analytics logging** | $0.00001 | Database write |
| **Total Stream Cost** | **$0.0007** | ~7 cents per 100 streams |

---

## Revenue vs Cost Analysis

### Scenario 1: Low Streamer (5-10 streams/year)

**Revenue:**
- Fan buys track: $1.99
- Stripe fee (2.9% + $0.30): -$0.36
- Net: $1.63
- Platform fee (5%): $0.08
- Artist gets: $1.55

**Costs:**
- Storage (12 months): $0.012 ($0.001/mo × 12)
- Transcoding: $0.001
- Streaming (10× streams): $0.007 ($0.0007 × 10)
- **Total cost:** $0.020

**Profit:**
- Platform revenue: $0.08
- Platform costs: $0.02
- **Net profit:** $0.06 (75% margin) ✅

---

### Scenario 2: Average Streamer (20-30 streams/year)

**Revenue:**
- Same as above: $0.08 platform fee

**Costs:**
- Storage: $0.012
- Transcoding: $0.001
- Streaming (25× streams): $0.0175 ($0.0007 × 25)
- **Total cost:** $0.0305

**Profit:**
- Platform revenue: $0.08
- Platform costs: $0.031
- **Net profit:** $0.049 (61% margin) ✅

---

### Scenario 3: Heavy Streamer (50 streams/year)

**Revenue:**
- Same: $0.08 platform fee

**Costs:**
- Storage: $0.012
- Transcoding: $0.001
- Streaming (50× streams): $0.035 ($0.0007 × 50)
- **Total cost:** $0.048

**Profit:**
- Platform revenue: $0.08
- Platform costs: $0.048
- **Net profit:** $0.032 (40% margin) ✅

---

### Scenario 4: Power User (100 streams/year)

**Revenue:**
- Same: $0.08 platform fee

**Costs:**
- Storage: $0.012
- Transcoding: $0.001
- Streaming (100× streams): $0.07 ($0.0007 × 100)
- **Total cost:** $0.083

**Profit:**
- Platform revenue: $0.08
- Platform costs: $0.083
- **Net loss:** -$0.003 (break-even) ⚠️

---

### Scenario 5: Extreme User (200+ streams/year)

**Revenue:**
- Same: $0.08 platform fee

**Costs:**
- Storage: $0.012
- Transcoding: $0.001
- Streaming (200× streams): $0.14 ($0.0007 × 200)
- **Total cost:** $0.153

**Profit:**
- Platform revenue: $0.08
- Platform costs: $0.153
- **Net loss:** -$0.073 (unprofitable) ❌

---

## Break-Even Analysis

### Streaming Break-Even Point

**Question:** How many streams before we lose money on a $1.99 purchase?

**Math:**
```
Platform revenue: $0.08
Fixed costs: $0.013 (storage + transcoding)
Variable costs: $0.0007 per stream

Break-even:
$0.08 = $0.013 + ($0.0007 × X)
$0.067 = $0.0007X
X = 95.7 streams
```

**Answer: ~96 streams in Year 1 = break-even**

But storage is ongoing, so:

**Year 2:**
- Additional storage: $0.012
- Need: 17 more streams to cover storage
- **Total: 113 cumulative streams = break-even**

**Year 3:**
- Additional storage: $0.012
- Need: 17 more streams to cover storage
- **Total: 130 cumulative streams = break-even**

---

## Lifetime Value Analysis

### Average User (20 streams/year over 5 years)

**Year 1:**
- Revenue: $0.08
- Costs: $0.031
- Profit: $0.049

**Year 2:**
- Revenue: $0 (no new purchase)
- Costs: $0.026 (storage + 20 streams)
- Profit: -$0.026

**Year 3:**
- Revenue: $0
- Costs: $0.026
- Profit: -$0.026

**Year 4:**
- Revenue: $0
- Costs: $0.026
- Profit: -$0.026

**Year 5:**
- Revenue: $0
- Costs: $0.026
- Profit: -$0.026

**5-Year Total:**
- Revenue: $0.08
- Costs: $0.135
- **Net loss: -$0.055** ❌

**Wait, this looks bad! But...**

---

## The Subscription Model Saves It

### Reality Check: Artists Pay Subscription

**Artist subscription:** $20/mo = $240/year

**What this covers:**
- Platform infrastructure
- Hosting costs
- Development
- Support
- **Streaming costs for ALL their tracks**

**Example Artist (10 tracks uploaded):**
- Subscription: $240/year
- Platform fee revenue (per artist): ~$50/year average
- **Total revenue from artist:** $290/year

**Costs for that artist's catalog:**
- Storage (10 tracks): $1.20/year
- Transcoding (10 tracks): $0.01
- Streaming (1,000 total streams): $0.70/year
- **Total cost:** $1.91/year

**Profit per artist:**
- Revenue: $290
- Costs: $1.91
- **Net profit: $288** (99% margin!) ✅

---

## Revised Economics: Subscription Model

### Artist-Level Economics (Year 1)

| Metric | Value |
|--------|-------|
| **Artist subscription** | $240/year |
| **Platform fees (avg 7 tracks)** | $50/year |
| **Total revenue per artist** | $290/year |
| | |
| **Storage (7 tracks × 12 months)** | $0.84/year |
| **Transcoding (7 tracks)** | $0.007/year |
| **Streaming (500 total streams)** | $0.35/year |
| **Total costs per artist** | $1.20/year |
| | |
| **Net profit per artist** | **$288.80/year** |
| **Profit margin** | **99.6%** ✅ |

---

## Comparing Models: Download-Only vs Streaming

### Download-Only Model (Like Old Beatport)

**Fan buys track ($1.99):**
- Downloads once: $0.0007 bandwidth
- Never streams
- **Total cost:** $0.013 (storage + download)

**Platform profit:**
- Revenue: $0.08
- Costs: $0.013
- **Net: $0.067** (84% margin)

### Stream Your Purchases Model (artistrax)

**Fan buys track ($1.99):**
- Downloads once: $0.0007
- Streams 20 times/year: $0.014/year
- **Year 1 cost:** $0.027

**Platform profit (Year 1):**
- Revenue: $0.08
- Costs: $0.027
- **Net: $0.053** (66% margin)

**Difference:** -18% margin (but way better user experience!)

---

## Cost Scaling Analysis

### 1,000 Tracks in Catalog (Year 1)

**If every track gets streamed 20x/year:**
- Storage: $120/year
- Transcoding: $1
- Streaming: $14/year
- **Total: $135/year**

**Revenue from those tracks:**
- 1,000 tracks = ~150 artists (avg 7 tracks/artist)
- 150 artists × $290/year = $43,500
- **Platform profit: $43,365** (99.7% margin) ✅

---

### 10,000 Tracks in Catalog (Year 3)

**If every track gets streamed 30x/year:**
- Storage: $1,200/year
- Transcoding: $10
- Streaming: $210/year
- **Total: $1,420/year**

**Revenue from those tracks:**
- 10,000 tracks = ~1,400 artists
- 1,400 artists × $290/year = $406,000
- **Platform profit: $404,580** (99.6% margin) ✅

---

### 100,000 Tracks in Catalog (Year 5)

**If every track gets streamed 40x/year:**
- Storage: $12,000/year
- Transcoding: $100
- Streaming: $2,800/year
- **Total: $14,900/year**

**Revenue from those tracks:**
- 100,000 tracks = ~14,000 artists
- 14,000 artists × $290/year = $4,060,000
- **Platform profit: $4,045,100** (99.6% margin) ✅

---

## What If Streaming Goes Viral?

### Scenario: Track Gets 10,000 Streams (Viral Hit)

**Costs:**
- Storage: $0.012
- Transcoding: $0.001
- Streaming: $7 ($0.0007 × 10,000)
- **Total: $7.01**

**Revenue from that one track:**
- Platform fee from sale: $0.08
- **Loss: -$6.93** ❌

**But artist still pays subscription:**
- Artist subscription: $240/year
- That covers up to **342,857 streams** across their entire catalog
- **One viral track is fine!** ✅

---

## Bandwidth Caps & Mitigation

### When to Worry?

**Average streams per track per year:**
- **0-50 streams:** No problem (profitable)
- **50-100 streams:** Close to break-even (fine)
- **100-500 streams:** Slight loss per track (subscription covers it)
- **500+ streams:** Need to monitor

**Across entire catalog:**
- If average track gets >343 streams/year, subscription revenue won't fully cover bandwidth
- But that's 343 streams PER TRACK, not per user
- **Reality:** Most tracks get 5-20 streams/year

---

## Cost Optimization Strategies

### 1. CDN Caching (Reduce Bandwidth)
- Cache MP3s at edge locations
- First stream costs $0.0007, next 99 streams cost $0
- **Savings:** 99% reduction if popular tracks are cached

### 2. Tiered Storage (Reduce Storage Costs)
- Move tracks >1 year old to cold storage ($0.004/GB vs $0.02/GB)
- **Savings:** 80% reduction on old catalog

### 3. Adaptive Bitrate (Reduce Bandwidth)
- Serve 128kbps MP3 on mobile (5MB vs 10MB)
- **Savings:** 50% reduction on mobile streams

### 4. Usage Limits (Fair Use Policy)
- If user streams same track >1,000 times/year, flag for review
- **Reality:** <0.1% of users will hit this

---

## Competitive Analysis

### Spotify Model
**Fan pays:** $10.99/mo = $131.88/year
**Streams:** Unlimited
**Artist gets:** $0.003-$0.004 per stream
**Cost to Spotify:** $0.001-$0.002 per stream (estimated)
**Spotify margin:** 25-30% gross margin

### artistrax Model
**Fan pays:** $1.99 once (per track)
**Streams:** Unlimited (that track only)
**Artist gets:** $1.55 per purchase
**Cost to artistrax:** $0.027 Year 1, $0.026/year after
**artistrax margin:** 66-84% gross margin (per transaction)

**Key difference:** We make money on the sale, not the streams. Streaming is a value-add, not the revenue model.

---

## Risk Analysis

### Worst Case Scenario: Heavy Streaming

**Assumptions:**
- Every fan streams every track 100 times/year
- No caching, no optimization
- 100,000 tracks in catalog

**Costs:**
- Storage: $12,000/year
- Streaming: $7,000,000/year (100 streams × 100K tracks × $0.0007)
- **Total: $7,012,000/year**

**Revenue:**
- 14,000 artists × $240/year = $3,360,000

**Result:** Massive loss ❌

**But this won't happen because:**
1. Average fan streams 10-20 times/year, not 100
2. CDN caching reduces costs by 90%+
3. Most tracks are rarely streamed
4. We can implement usage caps if needed

---

## Realistic Projection

### Year 1 (2,500 tracks, 40,000 downloads)

**Streaming behavior:**
- 50% of buyers stream 0-5 times (archivists)
- 30% stream 10-20 times (regular listeners)
- 15% stream 30-50 times (daily listeners)
- 5% stream 100+ times (superfans)

**Average streams per purchase:** 18 streams/year

**Costs:**
- Storage: $300/year (2,500 tracks)
- Transcoding: $2.50
- Streaming: $504/year (40,000 purchases × 18 streams × $0.0007)
- **Total: $806/year**

**Revenue:**
- 350 artists × $240 = $84,000
- Platform fees: $3,600
- **Total: $87,600**

**Streaming as % of costs:** 0.9% (negligible!) ✅

---

### Year 5 (150,000 tracks, 5,000,000 downloads)

**Streaming behavior:**
- Average: 25 streams/year (older tracks streamed more)

**Costs:**
- Storage: $18,000/year
- Transcoding: $150
- Streaming: $87,500/year (5M purchases × 25 streams × $0.0007)
- **Total: $105,650/year**

**Revenue:**
- 15,000 artists × $240 = $3,600,000
- Platform fees: $540,000
- **Total: $4,140,000**

**Streaming as % of costs:** 2.5% (still negligible!) ✅

---

## Conclusion

### Key Findings:

1. **Streaming is cheap:** $0.0007 per stream = 7 cents per 100 streams
2. **Subscription covers everything:** $240/artist/year covers storage + streaming for their entire catalog
3. **Break-even:** ~96 streams in Year 1 (most users stream 10-20 times)
4. **Margins stay high:** 99%+ gross margin even with unlimited streaming
5. **Risk is low:** Even worst-case scenarios are manageable with CDN caching

### Strategic Advantages:

✅ **Better user experience** (stream anywhere, anytime)
✅ **Higher conversion** (fans less afraid to buy)
✅ **Competitive moat** (Bandcamp doesn't offer this)
✅ **Sustainable costs** (subscription model covers it)

### Recommendations:

1. **Launch with unlimited streaming** (confidence in the model)
2. **Implement CDN caching by Year 2** (reduce costs 90%)
3. **Monitor power users** (flag >500 streams/track/year)
4. **Add usage analytics to artist dashboard** (transparency)

---

**Bottom line: "Stream Your Purchases" is a slam dunk feature with minimal cost impact and huge user value.** 🎧✅

---

**Powered by Siesta Records 🌿**

_Fair pay for artists. True ownership for fans. Music ownership reimagined._
