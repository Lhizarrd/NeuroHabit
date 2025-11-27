# 📚 NeuroHabit - Documentation Index

## 🆕 **BARU - Unified Server (AI + PWA dalam 1!)**

**START HERE untuk setup cepat:**

1. **[QUICK-START.md](QUICK-START.md)** ⭐
   - 5 menit setup
   - Opsi menjalankan server
   - Troubleshooting basic
   
2. **[WINDOWS-SETUP.md](WINDOWS-SETUP.md)** 🪟
   - Setup lengkap untuk Windows user
   - Step-by-step guide
   - Comprehensive troubleshooting

3. **[SOLUTION-SUMMARY.md](SOLUTION-SUMMARY.md)** 📋
   - Ringkas: apa yang berubah
   - Bagaimana cara pakai
   - File baru dibuat

4. **[SETUP-AUTO-START.md](SETUP-AUTO-START.md)** 🚀
   - Setup auto-start pada boot
   - Server management
   - Advanced configuration

---

## 📖 Original Documentation (Masih Berlaku)

### PWA Documentation
- **[PWA-README.md](PWA-README.md)** - Dokumentasi PWA lengkap
- **[PWA-ARCHITECTURE.md](PWA-ARCHITECTURE.md)** - Arsitektur teknis PWA
- **[PWA-SETUP.md](PWA-SETUP.md)** - Setup guide PWA
- **[PWA-CHECKLIST.md](PWA-CHECKLIST.md)** - Implementation checklist
- **[PWA-QUICK-START.md](PWA-QUICK-START.md)** - Quick reference

### Status & Implementation
- **[IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md)** - Summary implementasi
- **[PWA-STATUS.txt](PWA-STATUS.txt)** - Status report

---

## 🗂️ File Structure Aplikasi

### Core Server Files
```
📄 server.js               ← NEW: Unified server (AI + PWA)
📄 openai-server.js        (original, bisa di-archive)
📄 pwa-server.js           (original, bisa di-archive)
```

### Frontend Files
```
📄 neurohabit.html         ← Main PWA app interface
📄 neurostyle.css          ← Styling
📄 Neuro.js                ← Core app logic
📄 neuro-enhanced.js       ← Enhanced features
```

### AI Integration
```
📄 openai-client.js        ← Client-side AI handler
📄 (server handles POST to /api/ai)
```

### PWA Files
```
📄 manifest.json           ← PWA manifest
📄 service-worker.js       ← Service worker (caching)
📄 offline.html            ← Offline page
```

### Configuration
```
📄 package.json            ← Dependencies & scripts
📄 .env                    ← Environment (create manually)
```

### Auto-Start Scripts
```
📄 start-server.bat        ← Windows batch launcher
📄 start-server.ps1        ← PowerShell launcher
📄 start-server.sh         ← Linux/Mac bash script
📄 NeuroHabit-Startup.bat  ← Windows auto-startup
```

### Utilities
```
📄 verify-pwa.js           ← Original PWA checker
📄 verify-server.js        ← NEW: Server verification
```

---

## 🎯 Common Tasks

### I want to...

#### 1. **Start the server**
→ [QUICK-START.md](QUICK-START.md) - Option 1
```bash
npm start
```

#### 2. **Setup auto-start on computer boot**
→ [SETUP-AUTO-START.md](SETUP-AUTO-START.md) - Option 3
Copy `NeuroHabit-Startup.bat` ke Windows Startup folder

#### 3. **Configure OpenAI API Key**
→ [WINDOWS-SETUP.md](WINDOWS-SETUP.md) - Step 2
Edit `.env` dengan API key

#### 4. **Test if server is running**
→ [QUICK-START.md](QUICK-START.md) - Testing section
```bash
curl http://localhost:3000
```

#### 5. **Change server port**
→ [QUICK-START.md](QUICK-START.md) - Troubleshooting
Edit `.env`: `PORT=3001`

#### 6. **Install as PWA on device**
→ [PWA-README.md](PWA-README.md) - Installation section
Click install button in browser

#### 7. **Understanding PWA architecture**
→ [PWA-ARCHITECTURE.md](PWA-ARCHITECTURE.md)
Deep technical dive

#### 8. **Offline functionality**
→ [PWA-README.md](PWA-README.md) - Offline section
Service worker caches automatically

---

## 🚀 Getting Started Flow

```
┌─────────────────────────────────┐
│ First Time Setup?                │
└────────┬────────────────────────┘
         │
         ├─→ Windows user?
         │   └─→ Read: WINDOWS-SETUP.md
         │
         ├─→ Linux/Mac user?
         │   └─→ Read: QUICK-START.md
         │
         └─→ Just want quick start?
             └─→ Read: QUICK-START.md (5 min)
                └─→ Run: npm start
                └─→ Open: http://localhost:3000
                └─→ Done! ✓
```

---

## 📊 Architecture Overview

```
Client Browser (http://localhost:3000)
         ↓
Service Worker (service-worker.js)
↓        ↓        ↓
Cache  Sync    Network
         ↓
   Unified Server (server.js)
   ├─ PWA Routes
   │  ├─ GET / → neurohabit.html
   │  ├─ GET /manifest.json
   │  └─ GET /service-worker.js
   │
   └─ AI Routes
      ├─ GET /api/ai/health
      └─ POST /api/ai → OpenAI API
```

---

## ⚙️ Configuration Files

### `.env` (Create manually)
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
PORT=3000
HOSTNAME=localhost
```

### `package.json` (Already updated)
```json
"scripts": {
  "start": "node server.js",
  "dev": "node server.js",
  "pwa": "node server.js",
  "server": "node server.js"
}
```

### `.vscode/tasks.json` (For VS Code)
- Task: NeuroHabit: Start Server
- Task: NeuroHabit: Verify Server
- Task: NeuroHabit: Install Dependencies

---

## 📋 Change Summary

### What Changed?

| Before | After |
|--------|-------|
| 2 separate servers | 1 unified server |
| `npm start` + `npm run pwa` | Just `npm start` |
| Manual server management | Auto-start options |
| No launcher scripts | `start-server.bat`, `.ps1`, `.sh` |

### What Stayed Same?

✓ All frontend code (HTML, CSS, JS)
✓ Service Worker functionality
✓ PWA manifest
✓ OpenAI integration
✓ Database/storage logic

---

## ✅ Verification

After setup, verify with:

1. **Server running?**
   ```bash
   curl http://localhost:3000
   ```

2. **AI working?**
   ```bash
   curl http://localhost:3000/api/ai/health
   ```

3. **Browser access?**
   ```
   http://localhost:3000
   ```

---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| Node.js | https://nodejs.org/ |
| OpenAI API | https://platform.openai.com/api-keys |
| PWA Info | https://web.dev/progressive-web-apps/ |
| Service Workers | https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API |

---

## 📞 Quick Support

**Q: Server won't start?**
A: Check `.env` file has `OPENAI_API_KEY` set → Read WINDOWS-SETUP.md

**Q: Port 3000 in use?**
A: Change in `.env`: `PORT=3001` → Read QUICK-START.md

**Q: Can't auto-start?**
A: Copy batch to Startup folder → Read SETUP-AUTO-START.md

**Q: Need PWA info?**
A: Read PWA-README.md or PWA-ARCHITECTURE.md

---

## 🎯 Summary

**Before November 27, 2025:**
- 2 terminal windows needed
- Manual server startup each time
- Confusing npm commands

**After November 27, 2025:**
- 1 unified server
- Simple `npm start`
- Auto-start options available
- Better documentation
- 🚀 Production ready!

---

## 📌 Next Steps

1. **Read** appropriate guide (QUICK-START or WINDOWS-SETUP)
2. **Create** `.env` file
3. **Run** `npm start`
4. **Open** http://localhost:3000
5. **Enjoy** NeuroHabit! 🧠⚡

---

**Last Updated:** November 27, 2025  
**Version:** 1.0.0 - Unified Server Release  
**Status:** ✅ Production Ready
