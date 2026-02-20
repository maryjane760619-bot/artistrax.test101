# Live Streaming Chat Specification

## Overview
Real-time chat system for artists during live streams. Fans watch the stream and can chat with the artist and other fans in real-time.

## Use Cases

### Artist Live Stream
- Artist starts a live stream (DJ set, production session, Q&A)
- Fans join the stream
- Real-time chat between artist and fans
- Special "Artist" badge for streamer
- Moderation tools for artist

### Fan Experience
- Join live stream from artist profile or notifications
- See chat history since joining
- Send messages (rate limited for free users)
- Emoji reactions
- See how many viewers are watching

## Database Schema

### live_streams
```sql
CREATE TABLE live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('scheduled', 'live', 'ended')) DEFAULT 'scheduled',
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  stream_url TEXT, -- URL to streaming service (Mux, Cloudflare, etc.)
  thumbnail_url TEXT,
  viewer_count INTEGER DEFAULT 0,
  total_unique_viewers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### live_stream_chat
```sql
CREATE TABLE live_stream_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  sender_type TEXT CHECK (sender_type IN ('artist', 'fan')),
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  message TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('chat', 'system', 'donation', 'reaction')) DEFAULT 'chat',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast retrieval of recent messages
CREATE INDEX idx_live_stream_chat_stream_created 
  ON live_stream_chat(stream_id, created_at DESC);
```

### live_stream_viewers
```sql
CREATE TABLE live_stream_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_type TEXT CHECK (user_type IN ('artist', 'fan')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  last_ping_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stream_id, user_id)
);
```

## Permission Rules

### Who Can Watch?
- **Public streams:** Anyone can watch (no login required for viewing)
- **Subscriber-only:** Must be subscribed to artist
- **Purchasers-only:** Must have bought at least one track

### Who Can Chat?
- **Free fans:** 1 message per 30 seconds
- **Subscribers:** Unlimited messages
- **Purchasers:** Unlimited messages
- **Artist:** Unlimited + moderation powers

### Moderation
- Artist can delete any message
- Artist can ban users from chat
- Artist can pin important messages
- Auto-moderation for spam/profanity

## Features

### MVP (Phase 1)
- [ ] Start/end live stream (artist)
- [ ] Watch stream (fans)
- [ ] Real-time chat
- [ ] Viewer count
- [ ] Basic moderation (delete messages)

### Phase 2
- [ ] Emoji reactions
- [ ] Pinned messages
- [ ] Chat slow mode (artist controls rate)
- [ ] Viewer list
- [ ] Chat history/replay

### Phase 3
- [ ] Donations/tips during stream
- [ ] Special badges for top supporters
- [ ] Polls/Q&A
- [ ] Screen sharing (for production tutorials)
- [ ] Clip creation (fans can save moments)

## UI Components

### 1. Live Stream Page
```
┌─────────────────────────────────────┐
│  [VIDEO PLAYER - STREAM]            │
│                                     │
│  ▶️ LIVE • 234 viewers              │
│                                     │
├─────────────────────────────────────┤
│  💬 Chat                    🎁 Tip  │
│  ┌──────────────────────────────┐  │
│  │ [Artist] DJ Siesta: Thanks  │  │
│  │ for joining!               │  │
│  │                              │  │
│  │ [Fan] Mike: 🔥🔥🔥          │  │
│  │                              │  │
│  │ [Fan] Sarah: Drop the bass! │  │
│  └──────────────────────────────┘  │
│  [Type a message...        ] [Send] │
└─────────────────────────────────────┘
```

### 2. Artist Dashboard - Go Live
- "Start Live Stream" button
- Stream title/description input
- Privacy settings (public/subscribers/purchasers)
- Go live confirmation
- End stream button

### 3. Fan View - Live Now Badge
- "🔴 LIVE" badge on artist profile
- "Join Live Stream" button
- Viewer count preview
- "Get notified when live" option

### 4. Chat Message Component
- Avatar + name
- Special styling for artist messages
- Timestamp
- Delete button (for artist/mods)
- Pin button (artist only)

## API Endpoints

### Streams
```
POST   /api/live-streams              # Start stream (artist)
GET    /api/live-streams              # List active streams
GET    /api/live-streams/:id          # Get stream details
PUT    /api/live-streams/:id          # Update stream (artist)
DELETE /api/live-streams/:id          # End stream (artist)
POST   /api/live-streams/:id/join     # Join as viewer
POST   /api/live-streams/:id/leave    # Leave stream
```

### Chat
```
GET    /api/live-streams/:id/chat     # Get recent messages
POST   /api/live-streams/:id/chat     # Send message
DELETE /api/chat-messages/:id         # Delete message (artist/mod)
PUT    /api/chat-messages/:id/pin     # Pin message (artist)
```

## Real-time Events (Supabase Realtime)

### Channels
- `live-streams` - New streams started, stream ended
- `live-stream-chat:${streamId}` - New chat messages
- `live-stream-viewers:${streamId}` - Viewer joined/left

### Client Events
```javascript
// Subscribe to chat
supabase
  .channel('live-stream-chat:123')
  .on('INSERT', handleNewMessage)
  .subscribe()

// Subscribe to viewer count
supabase
  .channel('live-stream-viewers:123')
  .on('*', handleViewerChange)
  .subscribe()
```

## Example Flow: Artist Live Stream

### 1. Artist Goes Live
```
1. Artist clicks "Go Live" on dashboard
2. System creates live_streams record
3. Artist gets streaming key/URL
4. Artist starts streaming via OBS/etc
5. Fans see "🔴 LIVE" badge on artist profile
```

### 2. Fan Joins Stream
```
1. Fan clicks "Join Live Stream"
2. Fan added to live_stream_viewers
3. Fan sees video player + chat
4. Fan can send messages (rate limited if free)
```

### 3. Chat During Stream
```
Artist: "Playing my new unreleased track!"
Fan1: "🔥🔥🔥"
Fan2: "When does this drop??"
Artist: "Next Friday, exclusive here first!"
Fan3: "Can't wait!"
```

### 4. Artist Moderates
```
- Artist sees spam message
- Artist clicks delete
- Message removed for all viewers
- Fan gets temporary chat ban
```

### 5. Stream Ends
```
1. Artist clicks "End Stream"
2. Stream status set to 'ended'
3. Final viewer count recorded
4. Chat history saved
5. Replay available (if enabled)
```

## Technical Considerations

### Streaming Provider
Options for video streaming:
- **Mux** - Developer-friendly, good pricing
- **Cloudflare Stream** - CDN included
- **AWS IVS** - Amazon's solution
- **Daily.co** - Easy to integrate

### Chat Scaling
- Use Supabase Realtime for < 1000 concurrent users
- For larger: consider Pusher or Ably
- Rate limiting via Redis/upstash

### Storage
- Stream recordings: S3/Supabase Storage
- Chat history: Postgres (partitioned by stream)
- Thumbnails: Supabase Storage

## Monetization

### During Stream
- **Tips/Donations** - Fans can tip artist
- **Super Chat** - Paid messages highlighted
- **Exclusive drops** - Limited releases during stream

### After Stream
- **Replay** - Available for subscribers
- **Chat export** - Artist can save highlights
- **Clip sharing** - Fans share best moments

## Success Metrics

- Streams per week/month
- Average concurrent viewers
- Chat messages per stream
- Tip revenue during streams
- Subscriber conversion from streams
- Fan retention (stream watchers vs non-watchers)