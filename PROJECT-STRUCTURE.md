# 📁 NeuroHabit - Project Structure

Proyek ini sudah terorganisir dalam struktur MVC/Layered Architecture yang rapi:

## 🗂️ Struktur Folder

```
NeuroHabit/
├── backend/
│   ├── server.js              ← Main unified server (AI + PWA)
│   ├── openai-server.js       ← OpenAI API integration
│   ├── openai-client.js       ← OpenAI client utilities
│   ├── pwa-server.js          ← PWA server configuration
│   └── verify-server.js       ← Server health check
│
├── frontend/
│   ├── neurohabit.html        ← Main HTML application
│   ├── neurostyle.css         ← Styling
│   ├── Neuro.js               ← Core JavaScript logic
│   ├── neuro-enhanced.js      ← Enhanced features
│   ├── service-worker.js      ← PWA offline support
│   ├── offline.html           ← Offline page
│   ├── manifest.json          ← PWA manifest
│   └── verify-pwa.js          ← PWA verification
│
├── database/
│   └── (Lokasi untuk file database jika diperlukan)
│
├── docs/                       ← Documentation
│   ├── README-START-HERE.md
│   ├── QUICK-START.md
│   ├── SETUP-GUIDE.md
│   ├── PWA-README.md
│   └── ... (other docs)
│
├── package.json               ← Node.js dependencies
├── .env                       ← Environment variables (JANGAN di-push!)
├── .env.example               ← Template untuk .env
├── .gitignore                 ← Git ignore rules
└── (Config files & README)
```

---

## 🚀 Cara Menjalankan

```bash
# Install dependencies (di root directory)
npm install

# Start server (akan menjalankan backend/server.js)
npm start

# Server akan running di http://localhost:3000
```

---

## 📋 Penjelasan Setiap Folder

### 🔧 `/backend`
Berisi semua logika server-side:
- **server.js** - Main server yang serve static files dari frontend + API routes
- **openai-server.js** - Integrasi OpenAI API
- **pwa-server.js** - Konfigurasi PWA khusus

**Path management**:
- Membaca `.env` dari parent directory (`../env`)
- Serve static files dari `../frontend`

### 🎨 `/frontend`
Berisi semua file client-side:
- **neurohabit.html** - Aplikasi utama
- **Neuro.js** - Logic utama aplikasi
- **neurostyle.css** - Styling
- **service-worker.js** - PWA offline functionality
- **manifest.json** - PWA metadata

### 💾 `/database`
Folder ini siap untuk:
- File database (SQLite, JSON, dll)
- Database migration scripts
- Database schema definitions

---

## 🔐 Security Notes

- `.env` file tidak ter-push ke Git (lihat `.gitignore`)
- `.env.example` tersedia sebagai template
- API Key disimpan lokal, tidak di-hardcode di code

---

## 📝 File Paths Update

Berikut path yang sudah di-update:

| File | Perubahan |
|------|-----------|
| `package.json` | Scripts sekarang jalankan `backend/server.js` |
| `backend/server.js` | `.env` path diubah ke `../.env` |
| `backend/server.js` | Frontend path: `../frontend` |

---

## ✅ Development Workflow

```
1. Edit frontend files di folder /frontend
2. Edit backend files di folder /backend
3. Jalankan: npm start
4. Browser: http://localhost:3000
5. Lihat console untuk error messages
```

---

## 📚 Dokumentasi Lengkap

Untuk setup lebih detail, lihat:
- `SETUP-GUIDE.md` - Setup dengan API Key
- `QUICK-START.md` - Quick reference
- `PWA-README.md` - PWA documentation
- `WINDOWS-SETUP.md` - Windows-specific setup

