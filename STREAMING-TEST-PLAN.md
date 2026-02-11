# Stream Your Purchases - Testing Plan (Day 4)

## 🎯 Testing Goals

1. **Functional Testing** - Core streaming features work correctly
2. **Device Testing** - Works on iOS, Android, Desktop
3. **Browser Testing** - Chrome, Safari, Firefox, Edge
4. **Performance Testing** - Fast, smooth, no lag
5. **Edge Cases** - Handle errors, network issues, expiry
6. **Security Testing** - Signed URLs work, unauthorized access blocked

---

## ✅ Functional Testing Checklist

### Purchase Flow
- [ ] Fan can sign up
- [ ] Fan can log in
- [ ] Fan can purchase a track ($1.99 test)
- [ ] Stripe checkout completes successfully
- [ ] Success page shows streaming benefits
- [ ] Track appears in library immediately

### Library Page
- [ ] Library page loads with purchased tracks
- [ ] Track cards show correct metadata (title, artist, cover)
- [ ] "Stream" button visible on all owned tracks
- [ ] "Download" button visible on all owned tracks
- [ ] Play count displayed correctly

### Streaming Player
- [ ] Click "Stream" opens player
- [ ] Player fetches signed URL successfully
- [ ] Waveform loads and displays
- [ ] Audio plays when clicking play button
- [ ] Pause/resume works correctly
- [ ] Seek (click waveform) works
- [ ] Volume control works
- [ ] Mute/unmute works
- [ ] Playback speed (0.75x, 1x, 1.25x, 1.5x) works
- [ ] Repeat mode works
- [ ] Shuffle mode works (if queue exists)
- [ ] Skip forward/backward works (if queue exists)
- [ ] Close button (X) closes player
- [ ] Keyboard shortcuts work (Space, ←/→, M, Esc)

### Analytics
- [ ] Play logged when streaming starts
- [ ] Duration tracked correctly
- [ ] Completed flag set when track finishes
- [ ] Play count increments in library
- [ ] Last played timestamp updates

### Signed URL Management
- [ ] Signed URL generated on first play
- [ ] URL includes valid token
- [ ] URL expires after 4 hours
- [ ] URL auto-refreshes 30 min before expiry
- [ ] Unauthorized users cannot access signed URLs

---

## 📱 Device Testing Checklist

### iPhone (Safari)
- [ ] Library page loads correctly
- [ ] Streaming player opens
- [ ] Audio plays (not blocked by iOS restrictions)
- [ ] Background audio continues when screen locks
- [ ] Controls work (play, pause, seek)
- [ ] Volume controls work
- [ ] PWA installable (Add to Home Screen)
- [ ] PWA opens in full screen
- [ ] PWA audio continues in background

### Android (Chrome)
- [ ] Library page loads correctly
- [ ] Streaming player opens
- [ ] Audio plays smoothly
- [ ] Background audio continues
- [ ] Controls work
- [ ] PWA installable (Install prompt)
- [ ] PWA full screen mode
- [ ] PWA background audio

### Desktop (Chrome)
- [ ] Library page loads
- [ ] Streaming player works
- [ ] Audio quality is high
- [ ] Keyboard shortcuts work
- [ ] Waveform is smooth
- [ ] PWA installable

### Desktop (Safari)
- [ ] Library page loads
- [ ] Streaming player works
- [ ] Audio plays
- [ ] Controls work

### Desktop (Firefox)
- [ ] Library page loads
- [ ] Streaming player works
- [ ] Audio plays
- [ ] Controls work

---

## 🚀 Performance Testing Checklist

### Load Times
- [ ] Library page loads in <2 seconds
- [ ] Streaming player initializes in <1 second
- [ ] Audio starts playing in <2 seconds (after play click)
- [ ] Waveform renders in <1 second

### Bandwidth
- [ ] Streaming uses ~320kbps (MP3 quality)
- [ ] No excessive buffering on normal connection
- [ ] Handles slow connections gracefully
- [ ] Shows loading states appropriately

### Concurrent Streams
- [ ] Multiple users can stream simultaneously
- [ ] No rate limiting issues
- [ ] Supabase bandwidth doesn't spike excessively

### Memory/CPU
- [ ] No memory leaks during long sessions
- [ ] CPU usage stays low (<10%)
- [ ] Browser doesn't lag or freeze

---

## 🛡️ Security Testing Checklist

### Authorization
- [ ] Non-logged-in users cannot access library
- [ ] Non-logged-in users cannot stream tracks
- [ ] User A cannot stream User B's purchased tracks
- [ ] Signed URLs tied to user ID correctly

### Token Validation
- [ ] Expired tokens are rejected
- [ ] Invalid tokens are rejected
- [ ] Token signature verified correctly
- [ ] Tampering with token fails

### API Security
- [ ] `/api/stream/[trackId]` verifies purchase
- [ ] `/api/library` returns only user's tracks
- [ ] `/api/stream/log` verifies ownership before logging

---

## 🐛 Edge Case Testing Checklist

### Network Issues
- [ ] Handles offline mode (shows error or cached version)
- [ ] Reconnects automatically when network restored
- [ ] Handles slow network (shows loading state)
- [ ] Handles network interruption mid-stream

### Expiry
- [ ] Signed URL expires after 4 hours
- [ ] Player refreshes URL automatically before expiry
- [ ] User can continue playing after refresh
- [ ] No audio interruption during refresh

### Multiple Tabs
- [ ] Can play different tracks in different tabs
- [ ] Audio doesn't conflict between tabs
- [ ] Only one player can play at a time (or both play simultaneously?)

### Long Sessions
- [ ] Can stream for hours without issues
- [ ] Memory usage stays reasonable
- [ ] Auto-refresh continues working

### Database/API Errors
- [ ] Handles track not found gracefully
- [ ] Handles purchase not found gracefully
- [ ] Shows user-friendly error messages
- [ ] Doesn't crash or show stack traces

---

## 📊 Analytics Testing Checklist

### Play Logging
- [ ] Each stream logged in `stream_plays` table
- [ ] Duration calculated correctly
- [ ] Completed flag set accurately (>90% listened = completed)
- [ ] Device type detected (mobile/desktop/PWA)

### Artist Dashboard (Future)
- [ ] Stream count visible to artist
- [ ] Play duration aggregated
- [ ] Completion rate calculated
- [ ] Top streamed tracks shown

---

## 🎨 UI/UX Polish Checklist

### Visual
- [ ] "OWNED" badge displays correctly
- [ ] "STREAMING" badge shows when in stream mode
- [ ] Gradient buttons look good
- [ ] Icons aligned properly
- [ ] Responsive on all screen sizes
- [ ] Dark mode works correctly

### Messaging
- [ ] "Stream unlimited • Download lossless" clear
- [ ] Purchase success page celebratory
- [ ] Library empty state helpful
- [ ] Error messages user-friendly

### Flow
- [ ] Purchase → Library flow is smooth
- [ ] Stream button → Player is instant
- [ ] Close player → Back to library is clean
- [ ] Download button works alongside streaming

---

## 🚀 Launch Readiness Checklist

### Production Setup
- [ ] `STREAMING_SECRET` set in Vercel env vars
- [ ] Supabase RLS policies enabled
- [ ] Stripe webhooks configured correctly
- [ ] Email notifications working (purchase confirmation)

### Documentation
- [ ] README updated with streaming feature
- [ ] Help docs explain streaming (if exists)
- [ ] FAQ covers common questions

### Monitoring
- [ ] Error tracking (Sentry?) configured
- [ ] Analytics (Plausible?) tracking streaming events
- [ ] Cost monitoring for Supabase bandwidth

### Marketing
- [ ] "Stream Your Purchases" featured on homepage
- [ ] Artist pitch updated with streaming benefits
- [ ] Launch announcement mentions streaming

---

## 🎯 Priority Testing Order

### Phase 1: Core Functionality (30 min)
1. Purchase flow (Stripe test card)
2. Library page loads
3. Streaming player opens and plays
4. Analytics logged correctly

### Phase 2: Device Testing (45 min)
1. iPhone Safari (most critical)
2. Desktop Chrome (most common)
3. Android Chrome (second most common)
4. Desktop Safari, Firefox (lower priority)

### Phase 3: Edge Cases (30 min)
1. Signed URL expiry and refresh
2. Network interruption
3. Unauthorized access
4. Concurrent streams

### Phase 4: Polish (30 min)
1. Visual issues
2. Error messages
3. Loading states
4. Mobile responsiveness

**Total Time:** ~2.5 hours

---

## 🐛 Known Issues to Fix

1. **Service worker audio caching**
   - Not implemented yet
   - Need to cache streamed audio for offline playback

2. **No transcoding yet**
   - Using same file for stream and download
   - Should use MP3 320kbps for streaming (smaller, cheaper)

3. **No offline queue**
   - Can't download tracks for offline listening within player
   - PWA should support "download for offline" feature

4. **Multiple players issue**
   - If multiple tabs open, audio might conflict
   - Should stop other players when starting new one

---

## 📝 Testing Notes Template

Use this format when testing:

```
### Test: [Feature Name]
- **Date:** 2026-02-11
- **Tester:** Bert / Mary Jane
- **Device:** iPhone 15 / Desktop Chrome
- **Result:** ✅ Pass / ❌ Fail
- **Notes:** [Details, screenshots, issues]
```

---

## 🎉 Success Criteria

**Streaming feature is launch-ready when:**

✅ All core functionality works on iPhone Safari and Desktop Chrome
✅ Purchase → Stream flow is smooth and fast
✅ No major bugs or security issues
✅ Analytics logging correctly
✅ User experience is delightful

**Nice-to-have (can defer post-launch):**
- Offline caching
- MP3 transcoding
- Advanced PWA features
- Multi-device sync

---

**Budget remaining:** $75
**Time estimate:** 2-3 hours for comprehensive testing + fixes

Let's ship this! 🚀
