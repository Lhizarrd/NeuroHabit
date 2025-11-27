# 🔐 Setup Guide - Aman & Secure

## ⚠️ Penting: Keamanan API Key

Repository ini **TIDAK mengandung** OpenAI API Key di GitHub. Ini adalah **best practice** keamanan.

## 📋 Cara Setup (untuk Dosen/Evaluator)

### 1. Clone Repository
```bash
git clone <URL_REPOSITORY>
cd NeuroHabit
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
# Copy template ke .env
cp .env.example .env

# Edit .env dan masukkan OpenAI API Key Anda
# OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```

### 4. Dapatkan OpenAI API Key
1. Buka https://platform.openai.com/api-keys
2. Login dengan akun OpenAI Anda
3. Click "Create new secret key"
4. Copy key dan paste ke `.env`

### 5. Jalankan Server
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

---

## 🛡️ Struktur Keamanan

```
✅ Masuk ke .gitignore:
   - .env (file dengan API Key aktual)
   - node_modules/
   - .DS_Store
   
✅ Masuk ke repository:
   - .env.example (template)
   - .gitignore (config git)
   - Semua kode source
```

---

## 🔑 Mengapa API Key Harus Rahasia?

- **Biaya**: Orang bisa abuse API Anda, tagihan meningkat
- **Rate Limit**: API Anda bisa di-block jika digunakan berlebihan
- **Security**: Akses ke OpenAI dengan permission Anda

---

## 📝 Catatan untuk Pengumpulan Tugas

Karena menggunakan environment variables, pastikan:
1. ✅ `.gitignore` sudah ada dan include `.env`
2. ✅ `.env.example` sudah ada sebagai template
3. ✅ Dokumentasi lengkap ada (file ini)
4. ✅ Dosen punya akses ke cara mendapatkan API Key sendiri

**Status**: Aman untuk di-push ke GitHub Public ✓
