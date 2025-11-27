# 🚀 NeuroHabit PWA - Quick Reference

## Start Here 👇

### Run the App
```bash
npm run pwa
```
Then open: **http://localhost:3000**

### Install PWA
**Desktop:** Click "Install" in address bar  
**Mobile:** Tap ⋮ → "Install app"  
**iPhone:** Tap Share → "Add to Home Screen"

---

## 📁 Important Files

| File | What to Know |
|------|--------------|
| `manifest.json` | App metadata - change here for app name, icons, colors |
| `service-worker.js` | Offline support - edit cache strategy here |
| `pwa-server.js` | Server - runs on port 3000 |
| `offline.html` | Offline page - shown when no internet |
| `neurohabit.html` | Main app - PWA registration here |

---

## 🛠️ npm Commands

```bash
npm run pwa       # Run PWA server (port 3000)
npm run server    # Alias for pwa
npm start         # Run original OpenAI server
npm install       # Install dependencies
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `PWA-README.md` | Full documentation & troubleshooting |
| `PWA-SETUP.md` | Quick setup guide |
| `PWA-CHECKLIST.md` | Implementation status |
| `PWA-ARCHITECTURE.md` | Technical architecture |
| `IMPLEMENTATION-SUMMARY.md` | Overview of what was done |

---

## 🧪 Testing Offline

1. Open DevTools (F12)
2. Go to **Network** tab
3. Check "Offline" checkbox
4. Reload page
5. App still works! ✅

---

## 🔍 Debugging

### Check Service Worker
1. DevTools → **Application** tab
2. Look for "Service Workers"
3. Should show "running"

### View Cache
1. DevTools → **Application**
2. Go to "Cache Storage"
3. Expand "neurohabit-v1"
4. See all cached files

### Uninstall PWA
**Windows:** Settings → Apps → Search NeuroHabit → Uninstall  
**Mac:** Applications → Drag to Trash  
**Mobile:** Long press app → "Uninstall"

---

## 🌐 Theme Customization

Edit `manifest.json`:
```json
"theme_color": "#7c3aed",           // Change main color
"background_color": "#ffffff",       // Change background
"name": "Your App Name",             // Change app name
```

---

## 📱 Add App Shortcuts

Edit `manifest.json` in `shortcuts` array:
```json
{
  "name": "My Action",
  "short_name": "Action",
  "url": "/?action=myaction"
}
```

---

## 🔐 Production Setup

### With HTTPS (Required)
```bash
# Using Vercel
npm install -g vercel
vercel

# Using Netlify
npm install -g netlify-cli
netlify deploy
```

### On Custom Server
1. Get SSL certificate (Let's Encrypt)
2. Upload files to server
3. Configure web server
4. Restart server

---

## 📊 Performance Tips

- ✅ Keep manifest.json under 1KB
- ✅ Minimize service-worker.js file size
- ✅ Optimize icons (use SVG when possible)
- ✅ Cache only essential files
- ✅ Set appropriate cache expiry

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Not installable" | Check DevTools, ensure HTTPS/localhost, valid manifest |
| Offline doesn't work | Service Worker not registered, check console |
| Cache not updating | Clear site data in DevTools, reinstall PWA |
| Icons not showing | Check manifest.json paths, icon sizes |
| App won't open | Service Worker crashed, check service-worker.js |

---

## 🎨 Customize Icons

Replace in `manifest.json`:
```json
"icons": [
  {
    "src": "your-icon.png",
    "sizes": "192x192",
    "type": "image/png"
  }
]
```

---

## 📈 Check Installation Stats

In browser console:
```javascript
// Check if running as PWA
console.log(window.navigator.standalone);

// Get Service Worker
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log(regs));

// List all caches
caches.keys().then(names => console.log(names));
```

---

## 🔄 Update Strategy

Current strategy:
1. Service Worker checks for updates automatically
2. If new version found, shows notification
3. User can refresh to update
4. Or automatic update on next load

---

## 🎯 Next Steps

1. ✅ Test offline functionality
2. ✅ Test on mobile device
3. ✅ Run Lighthouse audit
4. ✅ Customize theme colors
5. ✅ Deploy to production

---

## 📞 Quick Help

**How do I...?**

- ...disable offline mode? → Comment out service worker registration in HTML
- ...change colors? → Edit manifest.json theme_color
- ...add more caching? → Edit urlsToCache in service-worker.js
- ...test installation? → Open DevTools → Application → Manifest
- ...deploy to production? → Use Vercel or Netlify

---

## ✨ Features Available

- ✅ Works offline
- ✅ Installable on all devices
- ✅ Fast loading (cached assets)
- ✅ App launcher integration
- ✅ Custom theme colors
- ✅ Splash screen
- ✅ Status bar styling
- ✅ Quick shortcuts

---

**Need help? Check PWA-README.md for detailed documentation!**

Good luck! 🎉
