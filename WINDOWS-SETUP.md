# Windows Setup Guide - NeuroHabit

## 👋 Persiapan Awal (Lakukan SEKALI)

### Step 1: Install Node.js
1. Buka: https://nodejs.org/
2. Download **LTS** version (yang lebih besar angkanya)
3. Install dengan Next > Next > Finish
4. Buka PowerShell/CMD baru, verifikasi:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Setup OpenAI API Key
1. Buka: https://platform.openai.com/api-keys
2. Login dengan akun OpenAI (atau buat baru)
3. Klik "+ Create new secret key"
4. Copy key yang muncul (SIMPAN BAIK-BAIK!)

### Step 3: Konfigurasi `.env` File

Di folder `d:\UII\semester 3\FSD\NeuroHabit3\NeuroHabit`:

**Method A - Menggunakan Notepad:**
1. Buka Notepad
2. Paste:
```
OPENAI_API_KEY=sk-proj-[PASTE_API_KEY_ANDA_DI_SINI]
OPENAI_MODEL=gpt-4o-mini
PORT=3000
HOSTNAME=localhost
```
3. Save As → Nama: `.env` → Tipe: All Files
4. Simpan di folder NeuroHabit

**Method B - Menggunakan PowerShell:**
```powershell
$path = "d:\UII\semester 3\FSD\NeuroHabit3\NeuroHabit"
$env = @"
OPENAI_API_KEY=sk-proj-[PASTE_API_KEY_ANDA_DI_SINI]
OPENAI_MODEL=gpt-4o-mini
PORT=3000
HOSTNAME=localhost
"@
Set-Content -Path "$path\.env" -Value $env
```

---

## 🚀 Menjalankan Server

### SETIAP KALI mau pakai NeuroHabit:

**Option 1 - PowerShell/CMD:**
```bash
cd "d:\UII\semester 3\FSD\NeuroHabit3\NeuroHabit"
npm start
```

**Option 2 - Double-Click Batch:**
- Di folder, cari: `start-server.bat`
- Double-click → Server mulai
- Buka browser: http://localhost:3000

**Option 3 - VS Code (Recommended):**
1. Buka folder di VS Code
2. Tekan `Ctrl+Shift+B` → Pilih "NeuroHabit: Start Server"
3. Atau `Ctrl+Shift+P` → Ketik "Run Task"

---

## 🔄 Auto-Start saat Komputer Nyala (OPTIONAL)

**Setup:**

1. Buka file explorer
2. Di address bar, ketik: `shell:startup`
3. Tekan Enter
4. Folder Startup akan terbuka

5. Dari folder NeuroHabit, copy file: `NeuroHabit-Startup.bat`
6. Paste ke folder Startup yang baru dibuka

7. **RESTART KOMPUTER**
8. Setelah login → Server auto-start di background

**Verifikasi auto-start jalan:**
- Buka browser: `http://localhost:3000`
- Kalau keluar interface NeuroHabit = BERHASIL ✓

---

## ✅ Verifikasi Setup

Setelah `npm start`, cek:

**1. Browser Test:**
```
http://localhost:3000
```
Seharusnya keluar interface login NeuroHabit

**2. PowerShell Test:**
```powershell
# Test server responsive
curl http://localhost:3000

# Test AI health
curl http://localhost:3000/api/ai/health
```

**3. Send AI Prompt:**
```powershell
$prompt = "Apa itu kebiasaan baik?"
$body = @{prompt=$prompt} | ConvertTo-Json
curl -X POST http://localhost:3000/api/ai `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

---

## ❌ Troubleshooting

### Problem: "Node.js command not found"
```
❌ Error: 'node' is not recognized
```
**Solusi:**
- Install Node.js dari https://nodejs.org/
- Restart PowerShell/CMD setelah install
- Cek: `node --version`

---

### Problem: "OPENAI_API_KEY tidak terpasang"
```
❌ OPENAI_API_KEY tidak terpasang di environment server
```
**Solusi:**
1. Cek file `.env` ada di folder NeuroHabit
2. Pastikan berisi: `OPENAI_API_KEY=sk-proj-xxx`
3. Restart server: stop (Ctrl+C) lalu `npm start` lagi

---

### Problem: "Port 3000 sudah digunakan"
```
❌ listen EADDRINUSE: address already in use :::3000
```
**Solusi:**

**A - Ganti port:**
Edit `.env`:
```env
PORT=3001
```

**B - Tutup app yang pakai port 3000:**
```powershell
netstat -ano | findstr :3000
taskkill /PID [PID_YANG_MUNCUL] /F
npm start
```

---

### Problem: "npm command not found"
```
❌ 'npm' is not recognized
```
**Solusi:**
- npm harusnya included saat install Node.js
- Download ulang Node.js dari https://nodejs.org/
- Restart PowerShell/CMD

---

### Problem: Batch file tidak berjalan
```
❌ start-server.bat tidak ketika di-double-click
```
**Solusi:**
1. Klik kanan `start-server.bat`
2. Properties
3. Uncheck "Read-only"
4. Apply & OK
5. Coba double-click lagi

---

### Problem: `.env` file tidak ditemukan
```
❌ File .env tidak bisa dibuat
```
**Solusi Manual:**
1. Buka PowerShell
2. Navigate ke folder: `cd "d:\UII\semester 3\FSD\NeuroHabit3\NeuroHabit"`
3. Run:
```powershell
@"
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
PORT=3000
HOSTNAME=localhost
"@ | Out-File -Encoding UTF8 -FilePath .env
```
4. Cek dengan: `cat .env`

---

## 📊 Port Management

**Default port:** 3000

Jika 3000 occupied, options:

**Option 1 - Ubah port di `.env`:**
```env
PORT=8080
```

**Option 2 - Find & kill process:**
```powershell
# Find what using port 3000
Get-NetTCPConnection -LocalPort 3000 | Select -ExpandProperty OwningProcess

# Kill process
Stop-Process -Id [PROCESS_ID] -Force
```

---

## 🔐 API Key Security

**PENTING:**
- ❌ JANGAN share file `.env` ke orang lain
- ❌ JANGAN commit `.env` ke GitHub
- ✅ Add `.env` ke `.gitignore`

**Check:**
```bash
cat .gitignore
```

Harus ada: `.env`

---

## 📁 File Structure

```
d:\UII\semester 3\FSD\NeuroHabit3\NeuroHabit\
├── .env                    ← Create ini! Konfigurasi
├── server.js               ← Unified server (baru)
├── start-server.bat        ← Launcher Windows
├── NeuroHabit-Startup.bat  ← Auto-start Windows
├── neurohabit.html         ← Frontend
├── manifest.json           ← PWA config
├── service-worker.js       ← Caching
├── package.json            ← Dependencies
└── ...
```

---

## 🎯 Next Steps

1. **Setup `.env`** dengan OpenAI API Key
2. **Run `npm start`** - Server mulai
3. **Buka `http://localhost:3000`** - Akses app
4. **Login** dan test features
5. **(Optional) Setup auto-start** - Copy batch ke Startup

---

## ⏱️ Timing

- Setup pertama kali: ~5-10 menit
- Daily startup: ~10 detik (`npm start`)
- Auto-startup: 0 detik (automatic)

---

## 💬 Quick Commands

```powershell
# Start server
npm start

# Check server running
curl http://localhost:3000/api/ai/health

# Stop server
Ctrl+C  # (di terminal tempat npm start)

# View dependencies
npm list

# Update packages
npm update

# Restart server
# Tekan Ctrl+C, lalu npm start
```

---

## 📞 Support Resources

- Node.js Docs: https://nodejs.org/docs/
- OpenAI API: https://platform.openai.com/docs/
- npm Docs: https://docs.npmjs.com/

---

## ✅ Final Checklist

- [ ] Node.js installed (`node --version` works)
- [ ] `.env` file created dengan API Key
- [ ] `npm install` berhasil (folder `node_modules` ada)
- [ ] `npm start` berjalan tanpa error
- [ ] `http://localhost:3000` accessible
- [ ] Interface NeuroHabit muncul
- [ ] Login bisa dilakukan
- [ ] AI features responsive

---

**Status:** Ready to Use! 🚀
**Last Updated:** November 27, 2025
