# Artistrax Chat Platform Specification

## Overview
A messaging system allowing artists, labels, and fans to communicate within the platform. Builds community, enables collaborations, and provides direct fan engagement.

## Use Cases

### 1. Fan → Artist/Label (Primary)
- Fans message artists they follow/subscribe to
- Q&A about releases
- Support requests
- Collaboration requests (remixes, etc.)

### 2. Artist ↔ Artist
- Collaboration discussions
- Peer networking
- Advice and feedback

### 3. Artist ↔ Label
- Demo submissions
- Contract negotiations
- Release planning

### 4. Label → Fans (Broadcast)
- New release announcements
- Exclusive offers
- Community updates

## Database Schema

### conversations
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('direct', 'group')),
  title TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  metadata JSONB -- for group chat settings, etc.
);
```

### conversation_participants
```sql
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT CHECK (user_type IN ('artist', 'label', 'fan')),
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  is_muted BOOLEAN DEFAULT FALSE,
  UNIQUE(conversation_id, user_id)
);
```

### messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  sender_type TEXT CHECK (sender_type IN ('artist', 'label', 'fan')),
  content TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('text', 'image', 'audio', 'file')) DEFAULT 'text',
  attachments JSONB,
  reply_to UUID REFERENCES messages(id),
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);
```

### message_reactions
```sql
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);
```

## Permission Rules

### Who Can Start a Conversation?

1. **Fan → Artist/Label**
   - Must be subscribed to artist/label OR
   - Must have purchased at least one track OR
   - Artist/Label has public messaging enabled

2. **Artist → Label**
   - Always allowed (for demo submissions)
   - Or label must accept unsolicited messages

3. **Artist ↔ Artist**
   - Always allowed (peer networking)

4. **Label → Fan**
   - Only if fan is subscribed OR purchased
   - Or fan has opted-in to marketing messages

### Rate Limits
- Free fans: 10 messages/day
- Subscribed fans: Unlimited
- Artists/Labels: Unlimited

## Features

### MVP (Phase 1)
- [ ] Direct messaging (1-on-1)
- [ ] Text messages only
- [ ] Real-time with Supabase Realtime
- [ ] Message history/pagination
- [ ] Unread indicators
- [ ] Basic notifications

### Phase 2
- [ ] Group chats (artist + multiple fans)
- [ ] File attachments (images, audio clips)
- [ ] Message reactions (emoji)
- [ ] Reply/threads
- [ ] Message search
- [ ] Read receipts

### Phase 3
- [ ] Voice messages
- [ ] Video calls (1-on-1)
- [ ] Broadcast messages (label → all fans)
- [ ] Scheduled messages
- [ ] Auto-responses/away messages

## UI Components Needed

### 1. Chat Inbox
- List of conversations
- Unread count badges
- Last message preview
- Timestamp
- Search/filter

### 2. Chat Window
- Message bubbles (sent/received)
- Input box with send button
- Attachment button
- Emoji picker
- Scroll to load more history

### 3. New Message Modal
- Search users (artists/labels/fans)
- Filter by type
- Start conversation button
- Show connection status (can message?)

### 4. Message Notifications
- Toast notifications for new messages
- Browser notifications
- Email notifications (optional)
- Mobile push (future)

## API Endpoints

### Conversations
- `GET /api/conversations` - List user's conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get conversation details
- `DELETE /api/conversations/:id` - Leave/delete conversation

### Messages
- `GET /api/conversations/:id/messages` - Get messages (paginated)
- `POST /api/conversations/:id/messages` - Send message
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/:id/reactions` - Add reaction

### Real-time
- Supabase Realtime subscriptions for:
  - New messages
  - Typing indicators
  - Read receipts

## Security & Moderation

### Content Moderation
- Auto-flag profanity/spam
- Report message functionality
- Block user capability
- Admin moderation dashboard

### Privacy
- Users can disable messaging
- Option for "verified fans only"
- Data retention policy
- GDPR compliance

## Business Value

1. **Fan Retention** - Direct connection increases loyalty
2. **Artist Revenue** - Personalized engagement drives sales
3. **Collaboration** - Artist-label deals happen in-platform
4. **Community** - Builds ecosystem around the platform
5. **Differentiation** - No other platform has built-in messaging

## Implementation Priority

**Week 1:** Database schema, basic API
**Week 2:** UI components, real-time setup
**Week 3:** Permissions, rate limiting
**Week 4:** Testing, polish, launch

## Success Metrics

- Messages sent per day
- Active conversations per user
- Fan retention with messaging vs without
- Collaboration deals facilitated
- Support tickets reduced (self-service via chat)