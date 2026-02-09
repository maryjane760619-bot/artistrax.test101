# artistrax Launch Roadmap - $2K Budget (Option C)

**Budget:** $2,000 total  
**Split:** $1,500 product + $500 marketing  
**Timeline:** 2-3 weeks to launch  
**Goal:** Prove concept, acquire first 100 users, iterate based on feedback

---

## Phase 1: Core Polish ($800) - Week 1

### 1. Professional Icons & Branding ($200)
**Status:** ✅ IN PROGRESS
- [x] Create proper app icons (192x192, 512x512, 180x180)
- [ ] Design splash screens for iOS/Android
- [ ] Update favicon with brand colors
- [ ] Create social media preview images (og:image)
- [ ] App store screenshots (for future use)

**Deliverables:**
- Professional app icons (forest green + white logo)
- Splash screens that match brand
- Better first impression

### 2. Audio Player Upgrades ($400)
**Status:** 🔄 STARTING NEXT
- [ ] **Mini Player** - Sticky bottom bar (always visible)
- [ ] **Gapless Playback** - No silence between tracks
- [ ] **Crossfade** - Smooth transitions (DJ-style)
- [ ] **Better Scrubbing** - Drag progress bar accurately
- [ ] **Volume Control** - Slider + mute button
- [ ] **Queue Management** - See what's playing next
- [ ] **Keyboard Shortcuts** - Space to play/pause, arrows to skip
- [ ] **Background Audio** - Keep playing when screen off (iOS/Android)
- [ ] **Media Session API** - Controls in notification shade

**Why this matters:**
- Carbon Music's strength is smooth playback
- This is where we MATCH or BEAT them
- Makes app feel professional, not amateur

**Technical approach:**
- Use Web Audio API for gapless playback
- Implement Media Session API for background controls
- Add audio buffering/preloading for next track
- PWA already supports background audio

### 3. Mobile UX Polish ($300)
**Status:** 🔜 QUEUED
- [ ] Touch gestures (swipe to favorite, swipe to skip)
- [ ] Larger tap targets (44x44px minimum)
- [ ] Loading skeletons (no blank screens)
- [ ] Error boundaries (graceful failures)
- [ ] Pull-to-refresh on playlists/library
- [ ] Haptic feedback (vibrate on actions)
- [ ] Safe area handling (iPhone notch/home bar)
- [ ] Better typography scales (readable on small screens)
- [ ] Optimized images (WebP, lazy loading)

**Why this matters:**
- 80%+ of users are on mobile
- Small UX improvements = big retention boost
- Feels native, not web-app-in-browser

---

## Phase 2: Basic Discovery ($400) - Week 2

### 1. Browse & Filter ($200)
**Status:** 🔜 QUEUED
- [ ] Genre filter dropdown (House, Techno, Trance, etc.)
- [ ] Sort options (Newest, Most Downloaded, Price: Low to High, Trending)
- [ ] Search with autocomplete (artist names, track titles)
- [ ] Filter by price (Free, Under $1, $1-$3, $3+)
- [ ] Filter by artist/label
- [ ] "New This Week" section on homepage

**Technical:**
- Add genre tags to tracks database
- Implement full-text search (Supabase built-in)
- Cache popular searches
- Debounce search input (300ms)

### 2. Simple Recommendations ($200)
**Status:** 🔜 QUEUED
- [ ] "Similar Tracks" - Based on genre + artist
- [ ] "Fans Also Bought" - Tracks purchased together
- [ ] "Trending Now" - Most downloads last 7 days
- [ ] "New Releases" - Last 30 days, sorted by date
- [ ] "Popular on Siesta Records" - Label showcase

**Technical:**
- Use co-purchase data (what's bought together)
- Genre-based similarity
- Simple trending algorithm (downloads × recency)
- Cache recommendations (update hourly)

**Note:** Not AI-powered (that's $10K+), but smart enough to work

---

## Phase 3: Testing & Bug Fixes ($200) - Week 3

### Cross-Browser Testing
- [ ] Chrome (Desktop + Android)
- [ ] Safari (Desktop + iOS)
- [ ] Firefox (Desktop + Android)
- [ ] Edge (Desktop)
- [ ] Samsung Internet (Android)

### Device Testing
- [ ] iPhone 13/14/15 (Safari)
- [ ] Android phone (Chrome)
- [ ] iPad (Safari)
- [ ] Android tablet
- [ ] Desktop (1920x1080, 1366x768)

### Critical Flows
- [ ] Sign up (fan, artist, label)
- [ ] Purchase track (Stripe test mode)
- [ ] Download track
- [ ] Create playlist
- [ ] Redeem points
- [ ] Subscribe (artist/label)
- [ ] Upload track (artist/label)

### Performance
- [ ] Lighthouse audit (95+ scores)
- [ ] Load time <2 seconds
- [ ] Audio start time <500ms
- [ ] PWA install works on iOS + Android

### Bug Fixes
- [ ] Fix any broken links
- [ ] Handle edge cases (empty states, errors)
- [ ] Mobile keyboard issues
- [ ] Payment flow edge cases
- [ ] Audio player race conditions

---

## Phase 4: Marketing Setup ($500) - Ongoing

### Pre-Launch ($100)
- [ ] Landing page optimization (clear value prop)
- [ ] Email capture form (waitlist)
- [ ] Social media accounts (Instagram, Twitter, TikTok)
- [ ] Press kit (screenshots, one-pager, founder story)
- [ ] Launch announcement copy

### Paid Ads ($300)
**Platforms:**
- Facebook/Instagram Ads: $150
- Google Search Ads: $100
- Reddit Ads (music subreddits): $50

**Target:**
- Independent artists looking for distribution
- Electronic music fans (Beatport/Bandcamp users)
- DJs needing promo tracks

**Goal:** 100 signups in first month

### Organic ($100)
- Post in music production subreddits
- Reach out to electronic music bloggers
- DM artists on SoundCloud/Bandcamp
- Post in producer Facebook groups
- Launch on Product Hunt

---

## What We're NOT Doing (Smart Cuts)

❌ Multiple languages (English only)
❌ Advanced AI recommendations (simple logic is fine)
❌ Video support (audio-first)
❌ Native app store submission (PWA only for now)
❌ Complex social features (coming later)
❌ Label-specific tools (basic upload is enough)
❌ Advanced analytics dashboard (basic stats only)

---

## Launch Checklist

### Must-Have for Launch:
- [x] PWA installable on iOS/Android/Desktop
- [x] Purchase & download tracks
- [x] Stripe payments working
- [x] Artist subscriptions ($20/mo)
- [x] Points rewards (2% cashback)
- [ ] Professional icons & branding
- [ ] Smooth audio player
- [ ] Basic search & filter
- [ ] Mobile-optimized UX
- [ ] No critical bugs

### Nice-to-Have (Can Add Post-Launch):
- Following system
- Comments on releases
- Advanced recommendations
- Multiple languages
- DJ tools (beatmatching, etc.)
- Live streaming
- Merchandise

---

## Success Metrics (First 30 Days)

### User Acquisition:
- **Target:** 100 signups (50 fans, 30 artists, 20 labels)
- **Cost:** $3-5 per signup (from $500 budget)

### Engagement:
- 50%+ install PWA app
- 30%+ make a purchase
- 20%+ return weekly

### Revenue:
- 10 artist subscriptions = $200/mo
- 5 label subscriptions = $125/mo
- Track sales (variable)
- **Goal:** $500/mo by end of month 1

### Retention:
- 40%+ of artists stay subscribed month 2
- 60%+ of fans return to browse

---

## Timeline

### Week 1 (Feb 9-15):
- **Mon-Tue:** Icons/branding + Start audio player
- **Wed-Thu:** Audio player upgrades
- **Fri-Sun:** Mobile UX polish

### Week 2 (Feb 16-22):
- **Mon-Tue:** Browse & filter features
- **Wed-Thu:** Simple recommendations
- **Fri-Sun:** Integration testing

### Week 3 (Feb 23-Mar 1):
- **Mon-Wed:** Cross-browser testing + bug fixes
- **Thu:** Final polish + marketing setup
- **Fri:** Soft launch (to small audience)
- **Weekend:** Monitor, fix issues

### Week 4 (Mar 2-8):
- **Mon:** Full public launch
- **Tue-Sun:** Marketing push + user support

---

## Risk Mitigation

### What Could Go Wrong:

1. **Audio player doesn't work on iOS**
   - Mitigation: Test early, fallback to simpler player
   - Backup: Use Howler.js library (battle-tested)

2. **Stripe payments fail**
   - Mitigation: Extensive testing in test mode
   - Backup: Have Stripe support on speed dial

3. **No signups despite ads**
   - Mitigation: A/B test ad copy, targeting
   - Backup: Focus on organic (Reddit, forums)

4. **Artists don't upload tracks**
   - Mitigation: Onboard Siesta Records catalog first
   - Backup: Reach out to SoundCloud artists directly

5. **Performance issues on mobile**
   - Mitigation: Optimize images, lazy load
   - Backup: Reduce features if needed

---

## Post-Launch Iteration Plan

### Month 2 ($0 budget - use revenue):
- Add following system
- Comments on releases
- Better recommendation algorithm
- More genres/filters

### Month 3 (If revenue > $1K/mo):
- Consider native iOS app (submit to App Store)
- Add push notifications
- Advanced analytics for artists
- Multiple languages (Spanish, Portuguese)

### Month 4+ (If revenue > $3K/mo):
- Native Android app
- Label management tools
- DJ features (beatmatching, key detection)
- Live streaming
- Marketplace (merch, tickets)

---

## Why This Will Work

### Advantages vs Carbon Music:

1. **Economics:**
   - Carbon: Streaming pays $0.003/play
   - artistrax: Download pays $1+/track (95% to artist)
   - **Artist makes 300x more per sale**

2. **Ownership:**
   - Carbon: Rent music (lose access if stop paying)
   - artistrax: Own forever (DRM-free files)

3. **Fan Rewards:**
   - Carbon: 0% cashback
   - artistrax: 2% in points

4. **Link-in-Bio:**
   - Carbon: No social link management
   - artistrax: Replace Linktree + get music platform

5. **Distribution:**
   - Carbon: App store only (2-5 min to install)
   - artistrax: PWA (10 seconds to install, no store)

6. **Flexibility:**
   - Carbon: Controlled by VCs, can change terms anytime
   - artistrax: Artist-owned, transparent, no BS

### Target Market:

**Primary:** Independent electronic music artists & DJs
- 100K+ on SoundCloud, Bandcamp, Beatport
- Frustrated with low streaming payouts
- Want direct fan relationships
- Already have email lists/social following

**Secondary:** Electronic music fans
- Pay for music on Bandcamp/Beatport
- Support independent artists
- Want high-quality downloads
- Build DJ collections

**Opportunity:** $10B+ electronic music market, growing 15%/year

---

## Next Steps (Starting NOW)

1. ✅ **Finalize icons** (already in progress)
2. 🔄 **Start audio player upgrades** (begins next)
3. 🔜 **Mobile UX improvements** (queued)
4. 🔜 **Discovery features** (week 2)
5. 🔜 **Testing & launch** (week 3)

---

**Budget Remaining:** $1,500 (product) + $500 (marketing)  
**Timeline:** 3 weeks to launch  
**Success Criteria:** 100 users, $500/mo revenue, prove concept  
**Next Funding:** Raise $50K+ once product-market fit proven  

Let's build this! 🚀
