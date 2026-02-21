# Icon Generation Instructions

The app now uses SVG icons for better quality. However, PNG fallbacks are still needed for some devices.

## Generate PNG Icons from SVG

You can use any of these methods:

### Method 1: Online Converter (Easiest)
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icons/icon-192.svg` and convert to PNG at 192x192
3. Upload `icons/icon-512.svg` and convert to PNG at 512x512
4. Save as `icon-192.png` and `icon-512.png` in the `icons/` folder

### Method 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Convert icons
convert -background none -resize 192x192 icons/icon-192.svg icons/icon-192.png
convert -background none -resize 512x512 icons/icon-512.svg icons/icon-512.png
```

### Method 3: Using Inkscape (GUI)
1. Install Inkscape from https://inkscape.org/
2. Open each SVG file
3. File → Export PNG Image
4. Set width/height to 192 or 512
5. Export

### Method 4: Using Node.js (Automated)
```bash
npm install -g sharp-cli
sharp -i icons/icon-192.svg -o icons/icon-192.png resize 192 192
sharp -i icons/icon-512.svg -o icons/icon-512.png resize 512 512
```

## Icon Design

The new icon features:
- 🛡️ Shield symbol representing security and protection
- 💰 Rupee symbol for money management
- Gradient colors matching the app theme (green → blue → pink)
- Rounded corners for modern look
- Works on both light and dark backgrounds

## Testing Icons

After generating PNGs:
1. Clear browser cache
2. Uninstall PWA if already installed
3. Reload the app
4. Check if icons appear correctly in:
   - Browser tab
   - Home screen (after install)
   - App switcher
   - Splash screen

## Troubleshooting

If icons don't appear:
- Check file paths in `manifest.json`
- Verify PNG files are in `icons/` folder
- Check file sizes (should be < 100KB each)
- Clear service worker cache
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
