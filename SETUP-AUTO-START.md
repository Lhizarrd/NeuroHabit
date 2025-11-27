# NeuroHabit - Auto-Startup Setup Guide

## 📋 Overview

Proyek ini sekarang telah dikonfigurasi agar AI dan PWA berjalan dalam **satu server unified** tanpa perlu perintah terpisah.

### Yang Berubah:
- ✅ **Baru**: File `server.js` - menggabungkan OpenAI AI + PWA dalam satu server
- ✅ **Update**: `package.json` - semua scripts sekarang menunjuk ke `server.js`
- ✅ **Baru**: `start-server.bat` - launcher untuk Windows
- ✅ **Baru**: `NeuroHabit-Startup.bat` - auto-startup pada boot

---

## 🚀 Cara Menggunakan

### Opsi 1: Manual Start (Rekomendasi untuk Testing)

**Di Terminal:**
```bash
npm start
```

Server akan berjalan di `http://localhost:3000` dengan AI terkoneksi.

---

### Opsi 2: Menggunakan Batch File

**Double-click** file `start-server.bat` di folder proyek.
- Akan mengecek Node.js
- Akan membuat `.env` jika belum ada
- Akan menginstal dependencies jika perlu
- Akan start server otomatis

---

### Opsi 3: Auto-Startup pada Boot Windows

#### Setup:

1. **Copy file `NeuroHabit-Startup.bat`**
   - Lokasi: `d:\UII\semester 3\FSD\NeuroHabit3\NeuroHabit\NeuroHabit-Startup.bat`

2. **Buka Startup Folder Windows**
   - Tekan `Win + R`
   - Ketik: `shell:startup`
   - Tekan Enter

3. **Paste file** ke Startup Folder

4. **Restart komputer** - Server akan start otomatis setelah login

---

## ⚙️ Konfigurasi Environment

**File `.env` diperlukan:**

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
PORT=3000
HOSTNAME=localhost
```

- Dapatkan API Key dari: https://platform.openai.com/api-keys
- Model bisa diganti dengan: `gpt-4`, `gpt-4-turbo`, dll

---

## 📊 Server Features

Server unified `server.js` menyediakan:

### 1. **Static File Serving (PWA)**
- ✅ HTML, CSS, JavaScript files
- ✅ Manifest.json
- ✅ Service Worker
- ✅ Cache headers

### 2. **AI API Endpoints**
- `GET /api/ai/health` - Cek status AI
- `POST /api/ai` - Kirim prompt ke OpenAI

### 3. **CORS Support**
- ✅ Mendukung cross-origin requests
- ✅ Preflight OPTIONS handling

---

## 🔍 Troubleshooting

### Problem: "OPENAI_API_KEY tidak terpasang"
**Solusi:**
1. Buka atau buat file `.env`
2. Tambahkan: `OPENAI_API_KEY=sk-xxxxxxxxxxxxx`
3. Restart server

### Problem: "Port 3000 sudah digunakan"
**Solusi:**
```bash
SET PORT=3001
npm start
```

### Problem: Server tidak start otomatis di startup
**Solusi:**
1. Pastikan file ada di Startup Folder:
   `C:\Users\{USERNAME}\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`
2. Pastikan path di batch file benar
3. Coba manual dulu dengan `npm start`

---

## 🎯 Testing

### Test AI:
```bash
curl -X POST http://localhost:3000/api/ai ^
  -H "Content-Type: application/json" ^
  -d "{\"prompt\":\"Apa itu kebiasaan?\"}"
```

### Test PWA:
- Buka: http://localhost:3000
- Buka DevTools → Service Workers
- Verifikasi service worker registered

### Test Health:
```bash
curl http://localhost:3000/api/ai/health
```

---

## 📁 File Structure Sekarang

```
NeuroHabit/
├── server.js                    (NEW - Unified Server)
├── start-server.bat             (NEW - Manual Launcher)
├── NeuroHabit-Startup.bat       (NEW - Auto-Startup)
├── neurohabit.html              (PWA Frontend)
├── openai-client.js             (Frontend AI Client)
├── openai-server.js             (Old - bisa di-archive)
├── pwa-server.js                (Old - bisa di-archive)
├── service-worker.js            (Service Worker)
├── manifest.json                (PWA Manifest)
├── package.json                 (Updated Scripts)
├── .env                         (Config - create if missing)
└── ...
```

---

## 🔄 Migration dari Setup Lama

**Sebelumnya** (2 terminal):
```bash
# Terminal 1
npm start           # Server OpenAI

# Terminal 2  
npm run pwa         # Server PWA
```

**Sekarang** (1 command):
```bash
npm start           # Both OpenAI + PWA
```

---

## 📌 Quick Start

1. **Konfigurasi `.env`:**
   ```bash
   OPENAI_API_KEY=sk-xxxxxxxxxxxxx
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start server:**
   ```bash
   npm start
   ```

4. **Buka browser:**
   ```
   http://localhost:3000
   ```

Done! ✅

---

## 💡 Tips

- Server logs akan ditampilkan di terminal
- Untuk auto-restart saat file berubah: `npm install -g nodemon` lalu `nodemon server.js`
- Untuk production: gunakan PM2 atau similar process manager
- Service Worker akan cache files secara otomatis

---

**Created**: November 27, 2025
**NeuroHabit Team** 🧠⚡
