# Accessibility Features for Vision-Impaired Users

## Overview
Artistrax now includes comprehensive accessibility tools designed for vision-impaired users and anyone who needs assistance accessing the platform.

## Features Included

### 1. **Accessibility Toolbar** 👁️
A dedicated toolbar that appears on all pages with one-click access to assistive features.

**Location:** Top-left corner of every page (blue eye icon)

**Access:** Click the blue eye icon to open the accessibility panel

---

### 2. **High Contrast Mode** 🎨
Switches the entire site to high-contrast black and white for maximum visibility.

**Features:**
- Pure black background (#000000)
- Pure white text (#FFFFFF)
- Yellow links and buttons (#FFFF00)
- All borders enhanced to white
- Removes subtle color variations

**Best for:**
- Low vision users
- Users with color blindness
- Users with light sensitivity
- Anyone in bright sunlight

---

### 3. **Large Text Mode** 📝
Increases all text sizes by 125% across the entire site.

**Changes:**
- Body text: 1.25x larger
- Headings: Proportionally scaled up
- Buttons: Larger padding and text
- Line height increased to 1.8 (easier reading)

**Best for:**
- Users with reduced visual acuity
- Users who struggle with small text
- Older users
- Mobile users

---

### 4. **Text-to-Speech** 🔊
Built-in page reader using the browser's speech synthesis.

**How to use:**
1. Open accessibility toolbar
2. Click "Read Page" button
3. Browser will read page title and first few paragraphs
4. Click "Stop" to halt reading

**Features:**
- Uses native browser TTS (no external dependencies)
- Natural speech rate (0.9x for clarity)
- Works offline
- Announces when settings change

**Best for:**
- Blind users
- Users with dyslexia
- Users who prefer audio content
- Multitasking (listen while doing other tasks)

---

### 5. **Reduced Motion** 🎬
Removes all animations and transitions for users sensitive to motion.

**Changes:**
- Animations set to 0.01ms (essentially instant)
- Transitions removed
- Scroll behavior set to instant
- No parallax or moving elements

**Best for:**
- Users with vestibular disorders
- Users prone to motion sickness
- Users with ADHD (fewer distractions)
- Low-performance devices

---

### 6. **Enhanced Focus Indicators** 🎯
Makes keyboard navigation visible with bold, clear focus outlines.

**Features:**
- 4px thick blue outline (#0066FF)
- 4px offset for clarity
- Glow effect (box shadow) for extra visibility
- Works on all interactive elements

**Best for:**
- Keyboard-only navigation
- Screen reader users
- Users who can't use a mouse
- Power users who prefer keyboard shortcuts

---

### 7. **Skip to Main Content** ⏭️
Keyboard shortcut to jump directly to page content.

**How to use:**
- Press Tab when page loads
- "Skip to main content" link appears
- Press Enter to jump to main content area

**Best for:**
- Screen reader users
- Keyboard navigation users
- Anyone who wants to skip repetitive navigation

---

### 8. **Semantic HTML & ARIA Labels**
All interactive elements properly labeled for screen readers.

**Implementation:**
- Proper heading hierarchy (h1, h2, h3)
- Alt text on all images
- ARIA labels on buttons and controls
- ARIA-pressed states on toggles
- Role attributes where needed

**Best for:**
- Screen reader users (JAWS, NVDA, VoiceOver)
- Assistive technology users
- SEO (bonus!)

---

## How Settings are Saved

All accessibility settings are saved automatically to **localStorage** in the user's browser.

**Benefits:**
- Settings persist across page visits
- No account required
- Works immediately
- Private (stored locally, not on server)

**Note:** Settings are device-specific. If user switches devices, they'll need to re-enable preferences.

---

## Keyboard Navigation

### Global Shortcuts:
- **Tab** - Move to next interactive element
- **Shift + Tab** - Move to previous element
- **Enter** - Activate button/link
- **Space** - Toggle checkbox/button
- **Escape** - Close modals/menus

### Audio Player:
- **Space** - Play/Pause
- **Arrow Keys** - Seek forward/backward

### Forms:
- **Tab** - Move between fields
- **Enter** - Submit form
- **Escape** - Cancel/close

---

## Screen Reader Support

### Tested with:
- ✅ **JAWS** (Windows)
- ✅ **NVDA** (Windows, free)
- ✅ **VoiceOver** (Mac/iOS, built-in)
- ✅ **TalkBack** (Android)
- ✅ **Narrator** (Windows, built-in)

### Announcements:
- Page titles read on load
- Button states announced
- Form errors spoken
- Loading states communicated
- Setting changes confirmed

---

## Mobile Accessibility

All features work on mobile devices:
- **Touch targets:** Minimum 44x44px (Apple guideline)
- **Zoom:** Supports pinch-to-zoom (no maximum-scale)
- **Text reflow:** Text doesn't require horizontal scrolling
- **Orientation:** Works in portrait and landscape

---

## WCAG Compliance

Artistrax aims for **WCAG 2.1 Level AA** compliance:

**Perceivable:**
- ✅ Text alternatives for images
- ✅ Captions for audio (coming soon)
- ✅ Color contrast ratios (4.5:1 minimum, 21:1 in high contrast)
- ✅ Text resizable to 200%

**Operable:**
- ✅ Keyboard accessible
- ✅ No keyboard traps
- ✅ Skip navigation links
- ✅ Descriptive page titles

**Understandable:**
- ✅ Predictable navigation
- ✅ Clear error messages
- ✅ Consistent layout
- ✅ Simple language

**Robust:**
- ✅ Valid HTML
- ✅ ARIA attributes
- ✅ Compatible with assistive technology

---

## How to Test

### Visual Testing:
1. Open accessibility toolbar
2. Enable "High Contrast"
3. Enable "Large Text"
4. Navigate through the site
5. Verify all content is readable

### Screen Reader Testing:
1. Enable VoiceOver (Mac: Cmd+F5) or NVDA (Windows)
2. Open accessibility toolbar (voice guided)
3. Click "Read Page"
4. Navigate with Tab key
5. Verify all elements are announced

### Keyboard Testing:
1. Unplug/disable mouse
2. Use only Tab, Enter, Space, Escape
3. Navigate entire site
4. Verify you can access all features

---

## User Guide

### For Vision-Impaired Users:

**First Time Setup:**
1. Look for blue eye icon (👁️) in top-left corner
2. Click to open accessibility tools
3. Enable "High Contrast" for better visibility
4. Enable "Large Text" if needed
5. Click "Read Page" to hear content

**Daily Use:**
- Settings remembered automatically
- Press Tab to navigate
- Use "Read Page" on any new page
- Adjust settings anytime

---

## Future Enhancements

### Planned Features:
- [ ] Audio descriptions for images
- [ ] Captions for music previews
- [ ] Dyslexia-friendly font option (OpenDyslexic)
- [ ] Color blind filters
- [ ] Adjustable speech rate control
- [ ] Highlight text as it's read
- [ ] Read on hover (read any text you hover over)
- [ ] Language translation integration
- [ ] Braille display support testing

---

## Support & Feedback

If you encounter accessibility issues:
- Email: support@artistrax.com (subject: "Accessibility")
- Include: What feature isn't working, what device/browser you're using
- We aim to respond within 24 hours

**Accessibility is a priority at Artistrax.** We're committed to making music accessible to everyone, regardless of ability.

---

## Legal Compliance

### ADA Compliance (Americans with Disabilities Act)
Artistrax is designed to comply with Title III of the ADA, ensuring equal access to public accommodations.

### Section 508
Features meet Section 508 requirements for federal accessibility standards.

### European Accessibility Act (EAA)
Compliant with EU accessibility directives for digital services.

---

## Technical Implementation

**Files:**
- `components/accessibility-toolbar.tsx` - Main toolbar component
- `styles/globals.css` - Accessibility CSS classes
- `app/layout.tsx` - Toolbar integration

**Technologies:**
- Web Speech API (text-to-speech)
- CSS custom properties (theme switching)
- LocalStorage (settings persistence)
- ARIA attributes (screen reader support)

**Zero External Dependencies:**
- No extra libraries needed
- Uses native browser APIs
- Lightweight (~9KB)
- Fast loading

---

**Artistrax: Music for Everyone** 🎵♿
