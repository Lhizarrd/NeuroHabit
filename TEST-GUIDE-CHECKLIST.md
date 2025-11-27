# 🧪 TEST GUIDE: Checklist Kebiasaan Persisten

## Quick Start Test

### Test 1: Checklist Persisten (5 menit)

#### Langkah-langkah:
1. Buka browser ke `http://localhost:3000`
2. Login dengan akun Anda
3. Lihat tab "Pelacak" 
4. Pada salah satu kebiasaan, klik box untuk hari "Hari ini" (hari dengan label "Hari ini")
5. Seharusnya muncul ✓ (centang)
6. **Tekan F5 untuk refresh halaman**
7. ✅ **RESULT YANG DIHARAPKAN**: Centang ✓ masih ada!

#### Apa yang terjadi di belakang layar:
```
Klik box
  ↓
toggleHabit() dipanggil
  ↓
completions["2025-11-27"] = true
  ↓
saveHabits() dipanggil
  ↓
Data disimpan ke localStorage
  ↓
Refresh F5
  ↓
Data diambil dari localStorage saat load
  ↓
Centang tetap ada! ✓
```

---

### Test 2: Multiple Days (10 menit)

#### Langkah-langkah:
1. Dari Test 1 setelah refresh
2. Klik ke tab "Kalender"
3. Lihat minggu ini
4. Klik beberapa habit pada hari-hari berbeda
5. Lihat hasilnya berubah di kalender
6. **Refresh halaman (F5)**
7. ✅ **RESULT YANG DIHARAPKAN**: Semua status tetap ada!

---

### Test 3: Persistence Across Browser Restart (5 menit)

#### Langkah-langkah:
1. Dari Test 2
2. **Tutup browser sepenuhnya** (close tab dan window)
3. Buka browser lagi ke `http://localhost:3000`
4. Login kembali dengan akun yang sama
5. ✅ **RESULT YANG DIHARAPKAN**: Semua checklist Anda masih ada!

---

### Test 4: Multiple Habits (5 menit)

#### Langkah-langkah:
1. Di tab "Pelacak"
2. Klik "Tambah Habit Baru"
3. Pilih habit dari list atau buat custom
4. Klik tombol + atau Simpan
5. Toggle checklist untuk habit baru ini
6. **Refresh halaman (F5)**
7. ✅ **RESULT YANG DIHARAPKAN**: Habit baru dan checklistnya tersimpan!

---

## ✅ Checklist Hasil Test

Tandai ketika test berhasil:

- [ ] Test 1: Centang tetap ada setelah refresh
- [ ] Test 2: Multiple hari tetap tersimpan setelah refresh
- [ ] Test 3: Data ada setelah tutup dan buka ulang browser
- [ ] Test 4: Habit baru dan checklistnya tersimpan

---

## 🐛 Jika Checklist Tidak Tersimpan

### Cek 1: Apakah localStorage diaktifkan?
```javascript
// Buka DevTools (F12) → Console
localStorage.setItem('test', 'value');
localStorage.getItem('test'); // Harus mengembalikan 'value'
```

### Cek 2: Apakah data tersimpan?
```javascript
// Di Console
JSON.parse(localStorage.getItem('neuroHabitUsers'))
// Harus menampilkan array users dengan habits
```

### Cek 3: Check browser mode
- ❌ **Private/Incognito mode** - localStorage tidak bekerja
- ✅ **Normal mode** - localStorage bekerja

### Cek 4: Clear browser cache
Jika masih tidak bekerja:
1. Buka DevTools (F12)
2. Klik tab "Application"
3. Klik "Clear storage" atau "Clear site data"
4. Refresh halaman
5. Test lagi

---

## 📝 Apa yang Diharapkan Terjadi

### Saat Toggle Checklist:
- [ ] Box berubah menjadi berwarna dengan centang ✓
- [ ] Streak berubah (bila applicable)
- [ ] Progress bar bergerak

### Saat Refresh:
- [ ] Layout tetap sama
- [ ] Centang ✓ masih ditampilkan di hari yang sama
- [ ] Tidak ada error di console

### Saat Berganti Hari:
- [ ] Hari lalu tetap menampilkan centang/silang
- [ ] Hari baru menampilkan "Hari ini" dengan box kosong
- [ ] Bisa toggle untuk hari baru

---

## 💡 Tips

- Buka DevTools (F12) → Console untuk melihat apakah ada error
- Gunakan tab "Application" → "Local Storage" untuk lihat data
- Gunakan "Network" tab untuk pastikan tidak ada fetch error
- Test di inkognito mode jika ingin test fresh localStorage

---

## ✅ Kesimpulan

Jika semua 4 test berhasil, maka fitur **Checklist Kebiasaan Persisten** sudah berfungsi dengan baik! 🎉
