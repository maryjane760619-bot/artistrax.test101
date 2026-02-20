# Artistrax Live Streaming Platform

## Current State
- ✅ Video upload/storage (pre-recorded)
- ✅ Audio streaming (purchased tracks)
- ❌ NO live streaming infrastructure

## Goal
Build complete live streaming system integrated with chat.

---

## Technical Architecture

### Cloudflare Stream (Selected)
**Best for:** Cost at scale, no egress fees

**Pricing:**
- **Storage:** $5 per 1,000 minutes
- **Delivery:** $1 per 1,000 minutes (75% cheaper than Mux!)
- **Artistrax adds:** 10% platform fee
- **NO egress fees**

**Example: 4 hour stream, 100 viewers = $24 Cloudflare cost + $2.40 fee = $26.40 total**

---

## Alternative Options Considered

### Mux
- $0.004/minute (4x more expensive than Cloudflare)
- Good developer experience
- Not selected due to cost

### WebRTC + SFU (Daily.co/100ms)
- sub-second latency
- Too expensive at scale
- Not selected
**Best for:** Developer experience, reliability, pricing

**Pros:**
- Simple API integration
- Auto-transcoding (multiple qualities)
- Global CDN
- Built-in analytics
- $0.004/minute streamed

**Cons:**
- 10-20 second latency (not "real-time")
- Per-minute pricing

### Option 2: Cloudflare Stream
**Best for:** CDN performance, cost at scale

**Pros:**
- Included in Cloudflare ecosystem
- Good pricing for high volume
- WebRTC input possible

**Cons:**
- More complex setup
- Higher latency (15-30s)

### Option 3: WebRTC + SFU (Daily.co/100ms)
**Best for:** Real-time interaction, low latency

**Pros:**
- Sub-second latency
- Built-in chat/video together
- Easy browser streaming

**Cons:**
- Expensive at scale
- Limited concurrent viewers (100-1000)

## Recommendation: Mux

For music streaming (DJ sets, performances):
- 10-20s latency is acceptable
- Better quality/transcoding
- Scales to thousands of viewers
- Cost-effective

---

## Implementation Plan

### Phase 1: Basic Live Streaming (1 week)
- [ ] Mux integration
- [ ] Artist "Go Live" UI
- [ ] Fan viewer page
- [ ] Stream status (live/offline)
- [ ] Basic viewer count

### Phase 2: Live Chat Integration (1 week)
- [ ] Chat during stream
- [ ] Real-time messages
- [ ] Artist moderation
- [ ] Rate limiting

### Phase 3: Enhanced Features (1 week)
- [ ] Stream scheduling
- [ ] Notifications (going live)
- [ ] Replay/archive
- [ ] Tips/donations
- [ ] OBS integration guide

---

## Database Schema

```sql
-- Live streams table
CREATE TABLE live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  
  -- Stream info
  title TEXT NOT NULL,
  description TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('scheduled', 'live', 'ended', 'error')) DEFAULT 'scheduled',
  
  -- Timing
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Mux integration
  mux_stream_key TEXT,        -- For OBS
  mux_playback_id TEXT,       -- For viewers
  mux_asset_id TEXT,          -- For replay
  
  -- Stream settings
  is_public BOOLEAN DEFAULT TRUE,
  require_subscription BOOLEAN DEFAULT FALSE,
  allow_chat BOOLEAN DEFAULT TRUE,
  
  -- Stats
  max_viewers INTEGER DEFAULT 0,
  total_viewer_minutes INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stream viewers (for analytics)
CREATE TABLE stream_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0
);

-- Stream chat messages
CREATE TABLE stream_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_type TEXT CHECK (user_type IN ('artist', 'label', 'fan')),
  user_name TEXT,
  message TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stream tips/donations
CREATE TABLE stream_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  recipient_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

### Artist Endpoints
```
POST   /api/live-streams
       Body: { title, description, scheduled_for?, is_public }
       Response: { stream_id, mux_stream_key, mux_playback_id }

PUT    /api/live-streams/:id/start
       Marks stream as live

PUT    /api/live-streams/:id/end
       Marks stream as ended

GET    /api/live-streams/mine
       List artist's streams

GET    /api/live-streams/:id/analytics
       Viewer stats, duration, etc.
```

### Fan Endpoints
```
GET    /api/live-streams/active
       List all live streams now

GET    /api/live-streams/following
       Live streams from followed artists

GET    /api/live-streams/:id
       Stream details + playback URL

POST   /api/live-streams/:id/join
       Record viewer joining

POST   /api/live-streams/:id/leave
       Record viewer leaving
```

### Chat Endpoints
```
GET    /api/live-streams/:id/chat?limit=50
       Recent chat messages

POST   /api/live-streams/:id/chat
       Body: { message }
       Send chat message (rate limited)

DELETE /api/live-streams/:id/chat/:messageId
       Delete message (artist only)
```

---

## UI Components

### 1. Artist - Go Live Button
```
┌─────────────────────────────┐
│  [Go Live 🔴]               │
│                             │
│  Stream Title: [________]   │
│  Description:  [________]   │
│                             │
│  [ ] Public                 │
│  [ ] Subscribers Only       │
│                             │
│  OBS Stream Key:            │
│  stream-xxxx-xxxx           │
│  [Copy]                     │
│                             │
│  [Start Streaming]          │
└─────────────────────────────┘
```

### 2. Artist - Live Dashboard
```
┌─────────────────────────────┐
│  🔴 LIVE - 234 viewers      │
│                             │
│  [VIDEO PREVIEW]            │
│                             │
│  Stream Health: ✅ Good     │
│  Duration: 45:32            │
│                             │
│  Tips: $127.50              │
│                             │
│  [View Chat] [End Stream]   │
└─────────────────────────────┘
```

### 3. Fan - Watch Stream
```
┌─────────────────────────────┐
│  🔴 LIVE                    │
│                             │
│  [VIDEO PLAYER]             │
│  [Play/Pause] [Volume]      │
│                             │
│  DJ Siesta - Sunset Set     │
│  234 viewers                │
│                             │
│  💬 Chat          [💰 Tip $]│
│  ┌─────────────────────────┐│
│  │ [chat messages...]      ││
│  └─────────────────────────┘│
│  [Type message...] [Send]   │
└─────────────────────────────┘
```

### 4. Fan - Discover Live
```
┌─────────────────────────────┐
│  🔴 Live Now                │
│                             │
│  ┌───────────────────────┐  │
│  │ [Thumbnail] 🔴 LIVE   │  │
│  │ DJ Siesta             │  │
│  │ 234 viewers           │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ [Thumbnail] 🔴 LIVE   │  │
│  │ Mary Records Showcase │  │
│  │ 89 viewers            │  │
│  └───────────────────────┘  │
│                             │
│  [Browse All Live Streams]  │
└─────────────────────────────┘
```

---

## OBS Integration

### Setup Instructions for Artists
1. Download OBS (free)
2. In Artistrax dashboard, click "Go Live"
3. Copy Stream Key
4. In OBS:
   - Settings → Stream
   - Service: Custom
   - Server: rtmp://live.mux.com/app
   - Stream Key: [paste from Artistrax]
5. Click "Start Streaming" in OBS
6. Artistrax automatically goes LIVE

### OBS Settings Recommendations
- **Video:** 1080p 30fps or 720p 60fps
- **Audio:** 160kbps AAC
- **Bitrate:** 4500 kbps (1080p) or 3000 kbps (720p)
- **Keyframe:** 2 seconds

---

## Cost Estimation (Mux)

### Streaming Costs
- **$0.004/minute** streamed
- Example: 1-hour stream, 100 viewers = $24
- 10 streams/month, avg 50 viewers = $120/month

### Storage Costs (Replays)
- **$0.003/minute** stored
- 1-hour replay = $0.18

### Egress Costs
- Included in Mux pricing

---

## Security

### Stream Protection
- Stream keys are secret (only artist sees)
- Playback IDs can be signed (optional)
- Domain restrictions (only artistrax.com)

### Chat Protection
- Rate limiting (prevents spam)
- Auto-moderation (profanity filter)
- Report system
- IP blocking for repeat offenders

---

## Monetization

### During Stream
- **Tips** - Fans can tip any amount
- **Super Chat** - $5+ for highlighted message
- **Exclusive Drops** - Limited releases

### After Stream
- **Replay Access** - Free or subscriber-only
- **Highlights** - Auto-generated clips

---

## Success Metrics

- Streams per week
- Average concurrent viewers
- Average stream duration
- Chat messages per stream
- Tip revenue per stream
- New subscribers during streams

---

## Next Steps

1. **Set up Mux account** (dev + prod)
2. **Create database tables**
3. **Build "Go Live" UI** for artists
4. **Build viewer page** with Mux player
5. **Integrate chat** (real-time)
6. **Add OBS instructions**
7. **Test end-to-end**
8. **Launch beta** with 5 artists

---

## Files to Create

1. `app/api/live-streams/route.ts` - CRUD endpoints
2. `app/artist/go-live/page.tsx` - Artist streaming UI
3. `app/live/[streamId]/page.tsx` - Fan viewer page
4. `components/stream-player.tsx` - Mux video player
5. `components/stream-chat.tsx` - Live chat component
6. `lib/mux.ts` - Mux API client
7. `supabase-streaming-schema.sql` - Database setup