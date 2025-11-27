# 🚀 Panduan Menjalankan Server NeuroHabit

## 📌 Ringkasan Singkat

Server NeuroHabit sekarang **UNIFIED** - AI dan PWA berjalan dalam **1 server**, bukan 2 seperti sebelumnya.

**Sebelumnya:** `npm start` + `npm run pwa` (2 terminal)  
**Sekarang:** `npm start` (1 command aja!) 

---

## 🎯 Opsi Menjalankan Server

### ✅ **OPSI 1: Simple - Command Line (PALING MUDAH)**

Buka terminal/PowerShell di folder proyek dan ketik:

```bash
npm start
```

Selesai! Server berjalan di `http://localhost:3000`

---

### ✅ **OPSI 2: Windows - Double-Click (PALING PRAKTIS)**

**Metode A - Batch File:**
1. Di folder proyek, cari file `start-server.bat`
2. **Double-click** file tersebut
3. Server akan otomatis start

**Metode B - PowerShell Script:**
1. Klik kanan `start-server.ps1`
2. Pilih "Run with PowerShell"
3. Jika diminta, tekan `Y` untuk allow execution
4. Server akan mulai

---

### ✅ **OPSI 3: Auto-Start saat Komputer Nyala**

**Untuk Windows 10/11:**

1. **Siapkan shortcut:**
   - Klik kanan `start-server.bat` → "Create shortcut"
   - Rename menjadi: `NeuroHabit Auto-Start`

2. **Pindahkan ke Startup Folder:**
   - Tekan `Win + R`
   - Ketik: `shell:startup`
   - Tekan Enter
   - Drag & drop shortcut ke folder ini

3. **Restart komputer** → Server akan start otomatis setelah login

**Atau gunakan file yang sudah disediakan:**
- `NeuroHabit-Startup.bat` → Copy ke Startup Folder Windows

---

### ✅ **OPSI 4: Linux/Mac - Terminal**

```bash
chmod +x start-server.sh
./start-server.sh
```

---

## ⚙️ Konfigurasi Pertama Kali

**Langkah 1: Buat file `.env`**

Di folder proyek, buat file bernama `.env` dengan isi:

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
PORT=3000
HOSTNAME=localhost
```

**Langkah 2: Dapatkan OpenAI API Key**
- Buka: https://platform.openai.com/api-keys
- Login dengan akun OpenAI
- Klik "+ Create new secret key"
- Copy key ke file `.env`

**Langkah 3: Install Dependencies** (jika belum)

```bash
npm install
```

**Langkah 4: Start Server**

```bash
npm start
```

---

## 🧪 Testing Server

Setelah server running, buka browser:

```
http://localhost:3000
```

Atau test endpoints secara manual:

**Test PWA (Static Files):**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/" -ErrorAction SilentlyContinue
```

**Test AI Health:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/ai/health" -ErrorAction SilentlyContinue | ConvertTo-Json
```

**Test AI Endpoint (dengan prompt):**
```powershell
$body = @{"prompt"="Apa itu kebiasaan?"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/ai" -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body -ErrorAction SilentlyContinue | ConvertTo-Json
```

---

## 📊 Server Info

**Port:** 3000 (bisa diubah di `.env`)  
**URL:** http://localhost:3000  
**AI Model:** gpt-4o-mini (default)  
**Status:** ✓ Online setelah `npm start`

---

## ❓ Troubleshooting

### ❌ Problem: "OPENAI_API_KEY tidak terpasang"

**Solusi:**
1. Buat/edit file `.env`
2. Tambahkan: `OPENAI_API_KEY=sk-xxxx...`
3. Restart server dengan `npm start`

---

### ❌ Problem: "Port 3000 already in use"

**Solusi - Ubah port:**

Edit `.env`:
```env
PORT=3001
```

Atau via terminal:
```bash
SET PORT=3001
npm start
```

---

### ❌ Problem: "Node.js not found"

**Solusi:**
- Download Node.js: https://nodejs.org/
- Install dengan default settings
- Restart terminal/editor
- Coba `npm start` lagi

---

### ❌ Problem: File `.env` tidak ter-create otomatis

**Solusi Manual:**
1. Buka Notepad
2. Simpan dengan nama: `.env` (dot di depan)
3. Isi dengan:
```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
PORT=3000
HOSTNAME=localhost
```

---

## 🔄 Migrasi dari Setup Lama

**Jika sebelumnya pakai 2 server:**

❌ **OLD WAY** (jangan pakai lagi):
```bash
# Terminal 1
npm start               # Server OpenAI

# Terminal 2
npm run pwa             # Server PWA
```

✅ **NEW WAY** (gunakan ini):
```bash
npm start               # Both + Everything!
```

---

## 📁 File-file Penting

| File | Fungsi |
|------|--------|
| `server.js` | **NEW** - Unified server (AI + PWA) |
| `start-server.bat` | **NEW** - Launcher untuk Windows |
| `start-server.ps1` | **NEW** - PowerShell launcher |
| `start-server.sh` | **NEW** - Launcher untuk Linux/Mac |
| `NeuroHabit-Startup.bat` | **NEW** - Auto-start batch |
| `.env` | **PENTING** - Konfigurasi (create if missing) |
| `neurohabit.html` | Frontend PWA |
| `manifest.json` | PWA Manifest |
| `service-worker.js` | Service Worker |
| `openai-client.js` | Frontend AI Client |
| `package.json` | Dependencies |

---

## 💡 Tips & Tricks

### Auto-Reload saat Edit File
```bash
npm install -g nodemon
nodemon server.js
```

### Check Apakah Server Berjalan
```bash
curl http://localhost:3000
```

### Stop Server
Tekan `Ctrl + C` di terminal

### View Server Logs
Terminal akan menampilkan log otomatis

### Production Mode
Gunakan PM2:
```bash
npm install -g pm2
pm2 start server.js --name "NeuroHabit"
pm2 startup
```

---

## 📞 Quick Reference

```bash
# Start server (all in one)
npm start

# Install dependencies
npm install

# View version
npm --version

# Check Node.js
node --version
```

---

## ✅ Verification Checklist

Sebelum declare "sudah jalan":

- [ ] `npm install` berhasil
- [ ] File `.env` ada dan terisi API key
- [ ] `npm start` berjalan tanpa error
- [ ] Bisa akses `http://localhost:3000` di browser
- [ ] Lihat interface login NeuroHabit
- [ ] Console tidak ada error merah
- [ ] Tombol AI responsive (test dengan prompt)

---

## 🎉 Selesai!

Jika semua checklist OK, berarti **server sudah berjalan dengan baik!**

- AI tetap aktif tanpa perlu `npm start` manual setiap kali
- Service Worker cache files secara otomatis
- Bisa offline partial (dengan cached data)
- Open di berbagai device/browser

Enjoy NeuroHabit! 🧠⚡

---

**Last Updated:** November 27, 2025  
**Status:** ✓ Production Ready
