# Creating PWA Icons for artistrax

We need to create the following icon files for the PWA to work properly:

## Required Icons

### 1. `/public/icon-192.png` (192x192px)
- Android home screen icon
- Format: PNG with transparency
- Background: Forest green (#1F4E3D)
- Logo: White artistrax logo/symbol

### 2. `/public/icon-512.png` (512x512px)
- Android splash screen
- Format: PNG with transparency
- Same design as 192x192, just larger

### 3. `/public/apple-icon.png` (180x180px)
- iOS home screen icon  
- Format: PNG
- Should match 192px design

## Quick Create Options

### Option 1: Use Existing Logo (Fastest)
If you have an artistrax logo file:
1. Open in Photoshop/Figma/Canva
2. Create 512x512px canvas with green background
3. Center logo in white
4. Export as PNG
5. Resize to create 192px and 180px versions

### Option 2: Online Tool (Easiest)
1. Go to https://realfavicongenerator.net/
2. Upload your logo
3. Configure colors (green bg, white logo)
4. Generate all sizes at once
5. Download and place in `/public/`

### Option 3: Figma Template (Professional)
```
Canvas: 512x512px
Background: Solid #1F4E3D (forest green)
Logo: "artistrax" in white, Playfair Display font
OR: Simple "A" monogram
Padding: 64px from edges (for safe area)
Corner radius: 0px (system will add on devices)
```

### Option 4: Simple Text Icon (Quick Test)
For testing, I can create a simple text-based icon:
- Green square background
- White "A" or "artistrax" text
- Clean and minimal

## Design Guidelines

### iOS:
- No transparency needed (system adds rounded corners)
- Avoid putting text too close to edges (will be cropped)
- High contrast for visibility

### Android:
- Can use transparency
- Can be any shape (will be masked on device)
- Adaptive icon support (foreground + background layers)

### Colors:
- Primary: #1F4E3D (forest green from brand)
- Secondary: #F59E0B (sunset orange)
- Text/Logo: White (#FFFFFF)

## Temporary Solution

For now, I'll create simple placeholder icons so the PWA works immediately. You can replace them with professional designs later.

Would you like me to:
1. Create simple placeholder icons (solid color + text)?
2. Wait for you to provide logo files?
3. Generate icons from existing artistrax-logo.svg?

Let me know and I'll handle the icon creation! 🎨
