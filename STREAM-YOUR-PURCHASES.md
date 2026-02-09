# Stream Your Purchases - Implementation Plan

**Feature:** Hybrid ownership + streaming model  
**Status:** 🔄 IN PROGRESS  
**Budget:** $300 of $1,500  
**Timeline:** 3-4 days  

---

## What We're Building

### User Experience:

**After purchasing a track:**

1. **Instant Access**
   - Download button (lossless WAV/FLAC)
   - Stream button (play in browser/app)
   - Add to playlist (auto-streams if not downloaded)

2. **Anywhere Playback**
   - Web player (any browser)
   - PWA app (iPhone, Android, Desktop)
   - Offline mode (cached from streams or downloads)

3. **Your Library**
   - "My Purchases" page shows all owned tracks
   - Toggle between "Stream" and "Download" mode
   - Smart sync (download high-priority, stream the rest)

4. **No Limits**
   - Unlimited streams of purchased tracks
   - No subscription required
   - Works forever (even if you stop buying)

---

## Technical Architecture

### Security Model:

**Problem:** Need to prevent non-owners from streaming tracks

**Solution:** Signed URLs with ownership verification

```typescript
// Check if user owns track
const hasPurchased = await checkPurchase(userId, trackId)

if (hasPurchased) {
  // Generate time-limited signed URL (valid 4 hours)
  const streamUrl = await generateStreamUrl(trackId, userId)
  // streamUrl = https://cdn.supabase.co/storage/v1/object/sign/audio/track.mp3?token=xyz
  
  // Return to audio player
  return { streamUrl, expiresIn: 14400 }
}
```

**Security features:**
- URLs expire after 4 hours (auto-renew when playing)
- Token tied to user ID (can't share)
- Server-side ownership check (can't fake)
- Rate limiting (prevent abuse)

### Storage Strategy:

**Current:** Supabase Storage (audio files)  
**Add:** Signed URL generation for streaming

**File formats:**
- **Original:** WAV/FLAC (lossless, 30-100MB)
- **Streaming:** MP3 320kbps (5-10MB) - transcoded on upload
- **Fan gets both:** Download lossless, stream compressed

**Why two formats?**
- Streaming 100MB WAV = slow, expensive bandwidth
- Streaming 8MB MP3 = fast, smooth, works on mobile data
- Downloads still lossless for DJs, collectors

### Player Enhancements:

**New capabilities:**

1. **Dual Mode Player**
   ```tsx
   <AudioPlayer 
     mode="stream"  // or "download"
     trackUrl={streamUrl}  // signed URL
     trackId={trackId}
   />
   ```

2. **Smart Buffering**
   - Preload next track in queue
   - Background buffer while playing
   - Adaptive quality (slow connection = lower bitrate)

3. **Offline Sync**
   - Mark tracks "Available Offline"
   - Auto-download + cache in service worker
   - Seamlessly switch between stream/offline

4. **Resume Playback**
   - Remember position across devices
   - Sync queue across web/mobile
   - "Continue where you left off"

---

## Implementation Phases

### Phase 1: Backend (Day 1) ✅ STARTING NOW

**API Routes:**

1. `/api/stream/[trackId]` - Generate stream URL
   - Check ownership
   - Generate signed URL
   - Return with expiry
   - Log stream for analytics

2. `/api/library/purchased` - Get user's library
   - All tracks they own
   - Streaming URLs included
   - Download URLs included
   - Playlist compatibility

3. `/api/tracks/transcode` - Convert to streaming format
   - Run on upload (async)
   - WAV/FLAC → MP3 320kbps
   - Store both versions
   - CDN-ready

**Database Schema:**
```sql
-- Add to tracks table
ALTER TABLE tracks ADD COLUMN streaming_url TEXT;
ALTER TABLE tracks ADD COLUMN file_size_stream INTEGER;

-- Track streaming analytics
CREATE TABLE stream_plays (
  id UUID PRIMARY KEY,
  track_id UUID REFERENCES tracks(id),
  user_id UUID REFERENCES fans(id),
  played_at TIMESTAMP DEFAULT NOW(),
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT FALSE
);
```

### Phase 2: Audio Player (Days 2-3) 🔜 NEXT

**Enhanced Player Features:**

1. **Stream Mode**
   - Use signed URL from API
   - Auto-renew on expiry
   - Smooth buffering
   - No gaps between tracks

2. **Download Mode**
   - Play from downloaded file
   - No network needed
   - Instant playback

3. **Hybrid Mode** (Smart default)
   - If downloaded → play local
   - If not downloaded → stream
   - Background download while streaming

4. **Queue Management**
   - Preload next 2 tracks
   - Smart buffering
   - Crossfade transitions

**UI Updates:**
```tsx
// Library page
<TrackItem>
  <PlayButton mode="stream" />  // Play now (streaming)
  <DownloadButton />            // Download lossless
  <OfflineToggle />             // Make available offline
</TrackItem>
```

### Phase 3: Library & Sync (Day 3) 🔜 QUEUED

**My Library Page:**

```
/fan/library
- All purchased tracks
- Filter: All / Downloaded / Streaming Only
- Sort: Recent, Artist, Album, Date Purchased
- Bulk actions: Download All, Make All Offline
```

**Playlist Integration:**
- Playlists automatically stream owned tracks
- "Download Playlist" button (downloads all tracks)
- Offline playlists (marked, auto-synced)

**Cross-Device Sync:**
- Queue syncs between devices
- Playback position syncs
- Downloads sync (know what's available offline)

### Phase 4: PWA Enhancements (Day 4) 🔜 FINAL

**Service Worker Updates:**

1. **Cache Streams**
   - First stream → cache audio
   - Future plays → cached (instant)
   - Smart eviction (keep recently played)

2. **Background Sync**
   - Download marked tracks in background
   - Sync playback history
   - Update library when back online

3. **Offline Library**
   - Show what's available offline
   - Disable stream-only tracks when offline
   - Queue management (only offline tracks)

**Media Session API:**
- Show track art in notification
- Play/pause/skip controls
- Lock screen controls (iOS/Android)
- Car audio integration

---

## User Flows

### Flow 1: First Purchase

1. Fan buys track for $1
2. Redirected to success page:
   ```
   ✅ You own "Track Name"!
   
   [▶ Stream Now]  [⬇ Download (WAV)]
   
   You can stream this track unlimited times
   from any device. Download lossless files
   for DJing or offline listening.
   
   [Add to Playlist]
   ```

3. Click "Stream Now" → plays immediately
4. Added to "My Library" automatically

### Flow 2: Building Library

1. Fan buys 10 tracks over time
2. Visits `/fan/library`:
   ```
   My Library (10 tracks)
   
   [Stream All] [Download All] [Create Playlist]
   
   🎵 Track 1 - Artist A
      [▶ Stream] [⬇ Download] [📱 Offline] 
   
   🎵 Track 2 - Artist B
      [▶ Stream] [⬇ Download] [📱 Offline] ✓
      └─ Available offline
   ```

3. Toggle "Offline" → downloads in background
4. Can play all tracks even without internet

### Flow 3: Mobile App Experience

1. Fan installs PWA app
2. Opens app → sees library
3. Taps track → streams (or plays cached)
4. Locks phone → keeps playing
5. Notification shade shows controls:
   ```
   🎵 Now Playing
   Track Name - Artist Name
   [⏮][⏸][⏭]
   ```

### Flow 4: DJ Downloads

1. DJ buys track for set
2. Sees both options:
   - Stream (preview quality)
   - Download WAV (DJ-quality)
3. Downloads WAV for Rekordbox/Traktor
4. Can still stream from phone while traveling

---

## Competitive Advantages

### vs Spotify/Apple Music:

| Feature | Spotify | artistrax |
|---------|---------|-----------|
| **Monthly cost** | $10.99 | $0 (pay per track) |
| **Ownership** | ❌ Rent | ✅ Own forever |
| **Quality** | Compressed | Lossless downloads |
| **Offline** | ⚠️ Requires subscription | ✅ Always (if downloaded) |
| **Artist revenue** | $0.003/stream | $0.95/sale |
| **Share tracks** | ❌ No | ✅ Can gift/share files |

### vs Carbon Music:

| Feature | Carbon | artistrax |
|---------|--------|-----------|
| **Monthly cost** | $10-15 | $0 |
| **Ownership** | ❌ No | ✅ Yes |
| **Stream + Download** | ❌ Stream only | ✅ Both |
| **Artist revenue** | $0.004/stream | $0.95/sale |
| **Works after cancel** | ❌ No | ✅ Forever |

### vs Beatport:

| Feature | Beatport | artistrax |
|---------|----------|-----------|
| **Track price** | $1.49-$2.49 | $1.00 |
| **Artist gets** | 50-70% | 95% |
| **Streaming** | ⚠️ $9.99/mo extra | ✅ Included |
| **Link-in-bio** | ❌ No | ✅ Included |

---

## Analytics & Insights

### For Artists:

**New metrics:**
- Total streams (of purchased tracks)
- Stream-to-download ratio
- Most streamed tracks (engagement)
- Completion rate (how much listened)
- Device breakdown (mobile/desktop/app)

**Why this matters:**
- See which tracks get replayed most
- Understand fan engagement
- Identify potential singles/hits
- Better than just download count

### For Platform:

- Track bandwidth costs (streaming)
- Optimize transcoding quality
- Cache hit rates
- Popular tracks (for recommendations)

---

## Costs & Economics

### Bandwidth Costs:

**Supabase Storage:**
- Included: 100GB egress/month (free tier)
- Beyond that: $0.09/GB

**Estimated usage:**
- Average track: 8MB (MP3 320kbps, 4 min)
- 1,000 streams = 8GB = $0.72
- 10,000 streams = 80GB = $7.20

**Per sale economics:**
- Track sells for $1.00
- Artist gets: $0.95
- Platform gets: $0.05
- Streaming cost (1,000 plays): $0.72
- **Loss if streamed 1,000+ times**

**Mitigation:**
- CDN caching (reduces bandwidth)
- Service worker caching (plays from local after first stream)
- Most tracks won't get 1,000 streams per buyer
- Average: 10-20 streams per purchase
- 10 streams cost = $0.007 (negligible)

**Break-even math:**
- Need < 70 streams per purchase to profit
- Average user: 10-15 streams per track
- **Profitable at 95% of normal usage**

### Storage Costs:

**Per track:**
- Original WAV: 60MB (lossless)
- Streaming MP3: 8MB (320kbps)
- Cover art: 0.5MB
- **Total: 68.5MB per track**

**For 200-track catalog:**
- Storage: 13.7GB
- Supabase free tier: 1GB
- Need paid plan: $25/mo (100GB included)
- **$0.125 per track per month**

**Covered by:**
- 1 artist subscription ($20/mo) = 160 tracks
- 5 artist subscriptions = 800 tracks
- **Profitable if you have artists paying**

---

## Marketing Messaging

### Headline:
**"Own Your Music. Stream Everywhere."**

### Tagline:
**"Buy once. Stream unlimited. Forever."**

### Value Props:

**For Fans:**
- "Pay $1 once, not $10 every month"
- "Own lossless files + stream from anywhere"
- "Your library works forever, even offline"
- "No subscription, no ads, no bullshit"

**For Artists:**
- "One sale = 300 streams of revenue"
- "Fans own your music (but can still stream it)"
- "Track engagement with streaming analytics"
- "Keep 95% of every sale"

**For DJs:**
- "Buy once, get lossless downloads + mobile streaming"
- "Preview tracks anywhere, download for sets"
- "Build your collection without subscriptions"

### Comparison Table (for landing page):

```
🎵 How to Listen to Music in 2026

Spotify:         $132/year → Rent 100M songs
Carbon Music:    $144/year → Rent electronic music
Beatport LINK:   $120/year → Stream for DJs

artistrax:       $0/year → Own what you buy
  + Buy 10 tracks = $10
  + Stream unlimited forever
  + Download lossless files
  + Support artists 300x more
  
Total cost: $10 once vs $132/year
10 years: $10 vs $1,320

You save $1,310 AND you own the music.
```

---

## Implementation Checklist

### Backend (Day 1):
- [ ] API route: `/api/stream/[trackId]` (generate signed URLs)
- [ ] API route: `/api/library/purchased` (get user's tracks)
- [ ] Database: Add `streaming_url` column to tracks
- [ ] Database: Create `stream_plays` analytics table
- [ ] Upload: Add MP3 transcoding (WAV → MP3 320kbps)
- [ ] Security: Ownership verification before streaming

### Audio Player (Days 2-3):
- [ ] Dual-mode player (stream or download)
- [ ] Signed URL handling (auto-renew)
- [ ] Smart buffering (preload next track)
- [ ] Gapless playback
- [ ] Queue management
- [ ] Media Session API integration
- [ ] Background audio support

### UI (Day 3):
- [ ] "My Library" page (`/fan/library`)
- [ ] Stream vs Download buttons
- [ ] "Make Available Offline" toggle
- [ ] Playlist streaming integration
- [ ] Purchase success page updates
- [ ] Track detail page updates

### PWA (Day 4):
- [ ] Service worker: Cache streams
- [ ] Service worker: Offline library
- [ ] Background sync for downloads
- [ ] Notification controls (play/pause/skip)
- [ ] Cross-device queue sync

### Testing:
- [ ] Purchase track → stream immediately
- [ ] Stream works on mobile (iOS/Android)
- [ ] Offline mode works
- [ ] Queue preloading works
- [ ] Background audio works (screen off)
- [ ] Bandwidth usage is reasonable
- [ ] Security: Can't stream un-purchased tracks

---

## Success Metrics

### Week 1:
- [ ] Feature launches
- [ ] 50%+ of purchases result in streams
- [ ] Average 5+ streams per purchased track
- [ ] No security breaches

### Month 1:
- [ ] 80%+ of users stream purchased tracks
- [ ] Average 15+ streams per track
- [ ] Streaming bandwidth < $50
- [ ] Positive user feedback

### Month 3:
- [ ] Streaming becomes primary consumption method
- [ ] Users report convenience as top benefit
- [ ] Minimal support issues
- [ ] Feature highlighted in marketing

---

## Next Steps

**Starting NOW (Feb 9, 2026):**

1. ✅ Build backend API routes
2. ✅ Add MP3 transcoding to upload flow
3. ✅ Create signed URL system
4. 🔜 Enhanced audio player (Days 2-3)
5. 🔜 My Library page
6. 🔜 PWA enhancements

**Timeline:** Ready by Feb 13 (4 days)  
**Budget:** $300 of $1,500  
**Impact:** 🚀 **GAME CHANGER** 🚀

Let's build this! 💪
