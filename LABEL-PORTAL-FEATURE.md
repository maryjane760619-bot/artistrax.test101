# Artistrax Label Portal - Feature Documentation

## Overview

The **Label Portal** feature allows any record label on Artistrax to:

1. **Get a branded landing page** at `artistrax.com/labels/[your-label]`
2. **Embed their catalog** on their own website
3. **Auto-sync** tracks when uploaded to Artistrax
4. **Sell directly** through Artistrax checkout

---

## For Siesta Records (Your Use Case)

### Option 1: Embed Widget on SiestaRecords.net (Recommended)

Add this single line to your HTML:

```html
<script src="https://artistrax.com/widget.js" data-label="siesta-records"></script>
```

**What happens:**
- Catalog appears automatically on your site
- Updates instantly when you upload tracks on Artistrax
- Fans click → go to Artistrax checkout
- You get paid, fans get lossless downloads

### Option 2: Link to Artistrax Label Page

Link to your branded page:
```
https://artistrax.com/labels/siesta-records
```

### Option 3: iframe Embed

```html
<iframe 
  src="https://artistrax.com/embed/label/siesta-records" 
  width="100%" 
  height="600" 
  frameborder="0"
></iframe>
```

---

## For All Artistrax Labels

### How It Works

1. **Upload tracks** on Artistrax as usual
2. **Set label** = your label name
3. **Auto-publish** → appears instantly on your portal

### API Endpoint

Any label can access their catalog via API:

```
GET https://artistrax.com/api/label/{slug}/tracks
```

**Response:**
```json
{
  "label": {
    "name": "Siesta Records",
    "slug": "siesta-records",
    "description": "Surf · Sound · Soul",
    "avatar": "https://...",
    "banner": "https://...",
    "totalTracks": 42
  },
  "tracks": [
    {
      "id": "uuid",
      "title": "Track Name",
      "artist": "Artist Name",
      "price": 1.99,
      "coverArt": "https://...",
      "buyUrl": "https://artistrax.com/track/uuid"
    }
  ]
}
```

### Customization Options

Labels can customize their portal:

| Field | Description |
|-------|-------------|
| `name` | Label name |
| `description` | Bio/tagline |
| `avatar` | Logo image |
| `banner` | Header banner |
| `website` | External website URL |
| `socialLinks` | Instagram, Twitter, etc. |

---

## Technical Implementation

### Files Created

1. **`/api/label/[slug]/tracks.js`** - Universal API endpoint
2. **`/labels/[slug]/page.tsx`** - Branded landing page
3. **`/embed/label/[slug]/page.tsx`** - iframe embed version
4. **`/public/widget.js`** - JavaScript widget for any site

### Database Schema

Uses existing tables:
- `labels` - label info
- `products` - tracks (filtered by label_id)
- `artists` - linked via artist_id

### Security

- CORS enabled for widget.js
- Public read-only access
- No authentication required for viewing
- Purchase requires normal Artistrax auth

---

## Deployment

```bash
# Add all files
git add app/api/label/[slug]/tracks.js
git add app/labels/[slug]/page.tsx
git add app/embed/label/[slug]/page.tsx
git add public/widget.js

# Commit and deploy
git commit -m "Add Label Portal feature for all labels"
git push
vercel --prod
```

---

## Usage Examples

### Example 1: Small Label
```html
<!-- On their Wix/Squarespace site -->
<script src="https://artistrax.com/widget.js" data-label="underground-beats"></script>
```

### Example 2: Big Label
```html
<!-- Custom React component fetching from API -->
const tracks = await fetch('https://artistrax.com/api/label/atlantic-records/tracks')
```

### Example 3: Simple Link
```markdown
[Buy our music on Artistrax](https://artistrax.com/labels/siesta-records)
```

---

## Benefits

✅ **Automatic sync** - Upload once, appears everywhere  
✅ **Branded experience** - Your logo, your colors  
✅ **Direct sales** - Artistrax handles checkout & delivery  
✅ **Lossless formats** - FLAC, WAV, AIFF  
✅ **Analytics** - See what's selling  
✅ **Free hosting** - No cost to labels  

---

## Next Steps

1. Deploy the code
2. Create Siesta Records label in Artistrax database
3. Upload first track
4. Test the widget on siestarecords.net
5. Document for other labels

---

**Questions?** Contact bert@siestarecords.net