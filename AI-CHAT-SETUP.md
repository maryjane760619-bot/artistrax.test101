# AI Chat Assistant - Setup Guide

## Overview
Artistrax now includes an AI-powered chat assistant that helps fans, artists, and labels with questions about the platform. Powered by OpenAI GPT-4.

## What It Does

### Context-Aware Support
- Detects if user is a fan, artist, or label based on page URL
- Provides tailored responses for each user type
- Comprehensive knowledge base about Artistrax features

### Knowledge Base Includes:
- Platform overview and founder info
- Pricing details (fan/artist/label)
- Features (Link-in-Bio, Points Rewards, Music Player)
- Common questions and answers
- Step-by-step instructions
- Direct links to features

### User Experience
- Floating chat bubble in bottom-right corner
- Clean chat interface
- Real-time responses
- Message history preserved during session
- Mobile-friendly design

---

## Setup Instructions

### Step 1: Get OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. **Name:** Artistrax AI Chat
5. Copy the API key (starts with `sk-`)

### Step 2: Add to Environment Variables

**Local Development (.env.local):**
```bash
OPENAI_API_KEY=sk-your_actual_api_key_here
```

**Vercel Production:**
1. Go to: https://vercel.com/maryjane760619-9668s-projects/music-download-store-2/settings/environment-variables
2. Add new variable:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-your_actual_api_key_here`
   - **Environments:** ✅ Production ✅ Preview ✅ Development
3. Click "Save"
4. **Redeploy** for changes to take effect

### Step 3: Test Locally

```bash
npm run dev
```

Visit http://localhost:3000 and:
- Click the chat bubble in bottom-right
- Ask: "How do I earn points?"
- You should get a detailed response about the 2% rewards system

---

## Cost Estimate

**OpenAI Pricing (GPT-4o-mini):**
- Input: $0.15 per 1M tokens (~750,000 words)
- Output: $0.60 per 1M tokens (~750,000 words)

**Estimated Usage:**
- Average chat: ~500 tokens in + 300 tokens out
- Cost per chat: ~$0.0003 (three hundredths of a penny)
- **1,000 chats/month ≈ $0.30**
- **10,000 chats/month ≈ $3.00**

Very affordable! The AI chat is essentially free until you have serious scale.

---

## Files Created

### New Files:
- `lib/ai-knowledge-base.ts` - Platform knowledge base
- `app/api/chat/route.ts` - API endpoint for chat
- `components/ai-chat-widget.tsx` - Chat UI component
- `components/ai-chat-wrapper.tsx` - Context-aware wrapper
- `AI-CHAT-SETUP.md` - This file

### Modified Files:
- `app/layout.tsx` - Added chat widget to all pages
- `.env.local` - Added OPENAI_API_KEY placeholder
- `package.json` - Added openai dependency

---

## Usage

### For Users:
1. Click the floating chat bubble (💬) in bottom-right
2. Type a question
3. Press Enter or click Send
4. Get instant AI-powered response

### Example Questions:

**Fans:**
- "How do I earn rewards?"
- "Can I create playlists?"
- "How do I redeem my points?"

**Artists:**
- "How much do I keep from sales?"
- "Can I replace Linktree?"
- "How do I upload multiple tracks?"

**Labels:**
- "What's the pricing?"
- "Can I manage multiple artists?"
- "How do batch uploads work?"

---

## Customization

### Update Knowledge Base:
Edit `lib/ai-knowledge-base.ts` to:
- Add new features
- Update pricing
- Include new FAQs
- Change tone/style

### Adjust AI Model:
In `app/api/chat/route.ts`, change:
```typescript
model: 'gpt-4o-mini', // Fast and cheap
// or
model: 'gpt-4o', // More accurate but 15x more expensive
```

### Styling:
Edit `components/ai-chat-widget.tsx` to:
- Change colors (currently forest green #1F4E3D)
- Adjust size
- Modify position
- Update messages UI

---

## Fallback Behavior

If `OPENAI_API_KEY` is not set:
- Chat still works
- Returns friendly error message
- Directs users to email support@artistrax.com
- No crashes or broken functionality

---

## Benefits vs. Traditional Support

### Traditional Live Chat:
- Requires human agents ($15-30/hr)
- Limited hours (9-5 or similar)
- Slow response times
- Can only help one person at a time

### AI Chat:
- **24/7 availability**
- Instant responses
- Unlimited concurrent users
- **~$0.0003 per conversation**
- Consistent, accurate answers
- Never tired or grumpy

### Hybrid Approach:
- AI handles 80% of common questions
- Escalate complex issues to email (support@artistrax.com)
- Saves time and money while improving user experience

---

## Monitoring & Analytics

### Track Performance:
- Monitor OpenAI usage at: https://platform.openai.com/usage
- Set spending limits to avoid surprises
- Review common questions to improve knowledge base

### Future Enhancements:
- [ ] Save chat history to database
- [ ] Analytics dashboard (most asked questions)
- [ ] User feedback (👍/👎) on responses
- [ ] Escalate to human support button
- [ ] Email transcript option
- [ ] Multi-language support

---

## Troubleshooting

**Chat not responding:**
- Check OPENAI_API_KEY is set
- Verify API key is valid (OpenAI dashboard)
- Check browser console for errors
- Ensure OpenAI account has credits

**Incorrect answers:**
- Update `lib/ai-knowledge-base.ts` with correct info
- Redeploy
- Test again

**Slow responses:**
- GPT-4o-mini should respond in 1-3 seconds
- If slower, check OpenAI status page
- Consider caching common questions

---

## Next Steps

1. **Get OpenAI API key**
2. **Add to Vercel environment variables**
3. **Deploy** (already in progress)
4. **Test** on production site
5. **Monitor usage** and improve knowledge base over time

---

**The AI chat assistant gives Artistrax yet another edge over competitors like Linktree and Bandcamp who don't offer any AI-powered support!** 🤖🎵
