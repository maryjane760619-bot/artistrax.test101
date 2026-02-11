# Quick Test: Stream Your Purchases Feature

## 🚀 5-Minute Smoke Test

**Goal:** Verify core streaming functionality works before full testing.

### Test Steps

1. **Purchase a track** (use Stripe test card: `4242 4242 4242 4242`)
   - Go to https://music-download-store-2.vercel.app
   - Find a track (or go to `/labels/siestarecords`)
   - Click "Buy $1.99 • Own Forever"
   - Complete Stripe checkout
   - ✅ Should see success page with streaming benefits

2. **Check library**
   - Click "Open Your Library" on success page
   - ✅ Should see purchased track in library
   - ✅ Should see "Stream" and "Download" buttons

3. **Test streaming**
   - Click "Stream" button
   - ✅ Player should open with "STREAMING" and "OWNED" badges
   - ✅ Waveform should load
   - Click play button
   - ✅ Audio should start playing within 2 seconds
   - ✅ Waveform should animate
   - ✅ Time should update

4. **Test controls**
   - ✅ Pause/resume works
   - ✅ Volume control works
   - ✅ Seek (click waveform) works
   - ✅ Keyboard shortcuts work (Space, M)
   - ✅ Close (X) works

5. **Test download**
   - Click "Download" button (in player or library)
   - ✅ Should download WAV/FLAC file
   - ✅ File should be named correctly

### Expected Results

✅ All 5 steps work smoothly
✅ No console errors
✅ Player is responsive and fast
✅ Audio quality is good

### If Something Fails

Check browser console for errors and report:
- What step failed?
- What error message (if any)?
- What browser/device?

---

## 🧪 Full Test (30-60 min)

See `STREAMING-TEST-PLAN.md` for comprehensive testing checklist.

---

## 🐛 Known Issues (As of Day 4)

1. **No MP3 transcoding yet** - Uses same file for stream/download (works but not optimized)
2. **Service worker caching** - Audio caching implemented but needs real-world testing
3. **Multiple tab handling** - No coordination between tabs (both can play simultaneously)

None of these are blockers for launch. Can improve post-launch.

---

## ✅ Ready to Test?

1. Open incognito window (fresh session)
2. Follow the 5 steps above
3. Report results to Bert/Mary Jane
4. If all green, we're ready to launch! 🚀
