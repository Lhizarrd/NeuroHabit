        // App State
        let currentUser = null;
        let currentView = 'tracker';
        let calendarMode = 'weekly';
        let calendarMonth = new Date(); // digunakan untuk tampilan bulanan
        // Mengambil data pengguna dari localStorage atau membuat array kosong jika belum ada
        let users = JSON.parse(localStorage.getItem('neuroHabitUsers')) || [];

        // Data habits sekarang akan menjadi properti dari setiap pengguna
        let habits = [];

// KONFIGURASI GOOGLE - Ganti nilai di bawah dengan Client ID Anda dari Google Cloud Console
const GOOGLE_CLIENT_ID = '113527070387-jogik1kbo9ri7ncop1jv9pekso5ui6qn.apps.googleusercontent.com';
let googleInitialized = false;

// UX helpers
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return alert(message);
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px)';
        setTimeout(() => el.remove(), 200);
    }, 2500);
}

// Notifications helpers
function requestNotificationPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
        try { Notification.requestPermission(); } catch (e) {}
    }
}

function sendNotification(title, body) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
        try { new Notification(title, { body }); } catch (e) {}
    }
}

// Reminders: simple in-app notifier at set time and selected days
function startReminderLoop() {
    function checkReminders() {
        if (!Array.isArray(habits) || habits.length === 0) return;
        const now = new Date();
        const hh = String(now.getHours()).padStart(2,'0');
        const mm = String(now.getMinutes()).padStart(2,'0');
        const cur = `${hh}:${mm}`;
        const dayIdx = now.getDay(); // 0 Sun .. 6 Sat
        const dayIds = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const today = now.toISOString().split('T')[0];
        habits.forEach(h => {
            const m = h.meta || {};
            if (!m.time || !m.days) return;
            if (m.time === cur && m.days.includes(dayIds[dayIdx])) {
                const key = `${today} ${cur}`;
                if (m.lastRemindedKey !== key) {
                    const msg = `Lakukan ${h.name} sekarang`;
                    addNotification(msg);
                    showToast(msg, 'success');
                    sendNotification('Pengingat Kebiasaan', msg);
                    m.lastRemindedKey = key;
                }
            }
        });
    }
    // Align to next minute boundary to follow real-time clock exactly
    const now = new Date();
    const delay = 60000 - (now.getSeconds()*1000 + now.getMilliseconds());
    setTimeout(() => {
        checkReminders();
        setInterval(checkReminders, 60000);
    }, delay);
    // Also check when tab becomes visible again
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkReminders();
        }
    });
}

function setError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg || '';
}
function clearAuthErrors() {
    ['signInEmailError','signInPasswordError','signUpNameError','signUpEmailError','signUpPasswordError'].forEach(id => setError(id, ''));
}

function validEmail(email) {
    return /.+@.+\..+/.test(email);
}

function initGoogleIfNeeded() {
    if (googleInitialized) return;
    if (typeof google === 'undefined') return; // script belum siap
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith('REPLACE_')) return; // belum dikonfigurasi

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
    });
    googleInitialized = true;

    // Render tombol GIS di dua tempat (Sign In dan Sign Up)
    const signInContainer = document.getElementById('googleSignInContainer');
    const signUpContainer = document.getElementById('googleSignUpContainer');
    if (signInContainer) {
        google.accounts.id.renderButton(signInContainer, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with', // akan tampil sebagai "Lanjutkan dengan Google" karena hl=id
            shape: 'pill',
            logo_alignment: 'left'
        });
    }
    if (signUpContainer) {
        google.accounts.id.renderButton(signUpContainer, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'left'
        });
    }

    // Sembunyikan tombol kustom jika GIS tersedia
    document.querySelectorAll('.btn.btn-google[data-legacy="true"]').forEach(btn => btn.classList.add('hidden'));
}

        function handleGoogleCredentialResponse(response) {
            try {
                const idToken = response && response.credential;
                if (!idToken) return;
                const payload = JSON.parse(atob(idToken.split('.')[1]));
                const email = payload.email;
                const name = payload.name || payload.given_name || `Google User`;

                // Cari user; jika belum ada, buat akun dengan authMethod 'google'
                let user = users.find(u => u.email === email && u.authMethod === 'google');
                if (!user) {
                    user = { name, email, authMethod: 'google', password: null, habits: [] };
                    users.push(user);
                    localStorage.setItem('neuroHabitUsers', JSON.stringify(users));
                }

                currentUser = user;
                habits = currentUser.habits || [];
                showMainApp();
            } catch (e) {
                showToast('Gagal memproses kredensial Google.', 'error');
                // Optional: console.error(e);
            }
        }

        // Auth Functions (Logika Baru)
        function handleSignIn(event) {
            event.preventDefault();
            const email = document.getElementById('signInEmail').value;
            const password = document.getElementById('signInPassword').value;

            clearAuthErrors();
            let ok = true;
            if (!validEmail(email)) { setError('signInEmailError', 'Email tidak valid'); ok = false; }
            if (!password) { setError('signInPasswordError', 'Password wajib diisi'); ok = false; }
            if (!ok) { showToast('Periksa kembali input Anda.', 'error'); return false; }

            // Cari pengguna berdasarkan email
            const user = users.find(u => u.email === email);

            // Validasi: Cek apakah pengguna ada dan password cocok
            if (user && user.password === password) {
                currentUser = user;
                // Muat data habits milik pengguna yang login
                habits = currentUser.habits || [
                    // Data default jika pengguna baru
                    { id: 1, name: 'Olahraga Pagi', icon: '🏃', color: 'bg-blue-500', colorHex: '#3b82f6', streak: 5, completions: {} },
                    { id: 2, name: 'Membaca 30 menit', icon: '📚', color: 'bg-purple-500', colorHex: '#a855f7', streak: 3, completions: {} }
                ];
                showMainApp();
            } else {
                setError('signInPasswordError', 'Email atau password salah');
                showToast('Email atau password salah.', 'error');
            }
            return false;
        }

        function handleSignUp(event) {
            event.preventDefault();
            const name = document.getElementById('signUpName').value;
            const email = document.getElementById('signUpEmail').value;
            const password = document.getElementById('signUpPassword').value;

            // Validasi: Cek apakah email sudah terdaftar
            if (users.find(u => u.email === email)) {
                setError('signUpEmailError', 'Email sudah terdaftar');
                showToast('Email sudah terdaftar. Gunakan email lain atau Sign In.', 'error');
                return false;
            }
            
            // Tambahkan pengguna baru ke array
            const newUser = { name, email, password, habits: [] }; // Setiap user punya data habits sendiri
            users.push(newUser);

            // Simpan array pengguna yang sudah diperbarui ke localStorage
            localStorage.setItem('neuroHabitUsers', JSON.stringify(users));

            showToast('Akun berhasil dibuat! Silakan Sign In untuk melanjutkan.', 'success');
            goToSignIn(); // Arahkan kembali ke halaman sign in
            return false;
        }

        function handleGoogleSignIn() {
            initGoogleIfNeeded();
            if (!googleInitialized) {
                showToast('Google Client ID belum dikonfigurasi.', 'error');
                return;
            }
            // Tampilkan prompt One Tap; klik tombol ini akan memicu pemilihan akun
            google.accounts.id.prompt();
        }

        function handleGoogleSignUp() {
            // Dengan GIS One Tap, pendaftaran dilakukan otomatis saat kredensial diterima
            handleGoogleSignIn();
        }

        function handleLogout() {
            // Simpan data habits terakhir pengguna sebelum logout
            const userIndex = users.findIndex(u => u.email === currentUser.email);
            if (userIndex !== -1) {
                users[userIndex].habits = habits;
                localStorage.setItem('neuroHabitUsers', JSON.stringify(users));
            }

            currentUser = null;
            habits = [];
            document.getElementById('mainApp').classList.add('hidden');
            document.getElementById('signInScreen').classList.remove('hidden');
            setTimeout(() => lucide.createIcons(), 0);
            showToast('Berhasil keluar.', 'success');
        }

        // === AKHIR BAGIAN YANG DIPERBAIKI ===


        // Fungsi lainnya tetap sama
        function goToSignUp() {
            document.getElementById('signInScreen').classList.add('hidden');
            document.getElementById('signUpScreen').classList.remove('hidden');
            setTimeout(() => lucide.createIcons(), 0);
        }

        function goToSignIn() {
            document.getElementById('signUpScreen').classList.add('hidden');
            document.getElementById('signInScreen').classList.remove('hidden');
            setTimeout(() => lucide.createIcons(), 0);
        }

        // Password visibility toggles
        document.addEventListener('DOMContentLoaded', () => {
            const siToggle = document.getElementById('signInShowPassword');
            const siPass = document.getElementById('signInPassword');
            if (siToggle && siPass) {
                siToggle.addEventListener('change', () => {
                    siPass.type = siToggle.checked ? 'text' : 'password';
                });
            }
            const suToggle = document.getElementById('signUpShowPassword');
            const suPass = document.getElementById('signUpPassword');
            if (suToggle && suPass) {
                suToggle.addEventListener('change', () => {
                    suPass.type = suToggle.checked ? 'text' : 'password';
                });
            }
        });

        function showMainApp() {
            document.getElementById('signInScreen').classList.add('hidden');
            document.getElementById('signUpScreen').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            renderHabits();
            updateStats();
            setTimeout(() => lucide.createIcons(), 0);
        }

        // Utility Functions
        function getCurrentDate() {
            return new Date().toISOString().split('T')[0];
        }

        function getLast7Days() {
            // Minggu -> Sabtu untuk minggu berjalan (real-time)
            const today = new Date();
            const dayIdx = today.getDay(); // 0=Min .. 6=Sab
            const sunday = new Date(today);
            sunday.setHours(0,0,0,0);
            sunday.setDate(today.getDate() - dayIdx);
            const days = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(sunday);
                date.setDate(sunday.getDate() + i);
                days.push({
                    date: date.toISOString().split('T')[0],
                    day: date.toLocaleDateString('id-ID', { weekday: 'short' }),
                    dayNum: date.getDate()
                });
            }
            return days;
        }

        function calculateStreak(completions) {
            let streak = 0;
            const today = new Date();
            
            for (let i = 0; i < 365; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                if (completions[dateStr]) {
                    streak++;
                } else {
                    // Cek hari kemarin, jika kosong maka streak berakhir
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    if (i === 0 && !completions[yesterday.toISOString().split('T')[0]]) {
                        break;
                    }
                    if (i > 0) break;
                }
            }
            return streak;
        }


        // Navigation
        function switchView(view) {
            currentView = view;
            
            document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
            event.target.closest('.nav-tab').classList.add('active');
            
            document.querySelectorAll('.view-content').forEach(v => v.classList.add('hidden'));
            document.getElementById(view + 'View').classList.remove('hidden');
            
            if (view === 'analytics') renderAnalytics();
            if (view === 'calendar') switchCalendarMode('weekly');
            
            setTimeout(() => lucide.createIcons(), 0);
        }

        // Render Functions
        function renderHabits() {
            const habitsList = document.getElementById('habitsList');
            const last7Days = getLast7Days();
            
            if (habits.length === 0) {
                habitsList.innerHTML = `<p style="text-align:center; color: #9ca3af; padding: 2rem 0;">Anda belum memiliki habit. Tambahkan satu untuk memulai!</p>`;
                return;
            }

            habitsList.innerHTML = habits.map(habit => `
                <div class="habit-card">
                    <div class="habit-header">
                        <div class="habit-info">
                            <div class="habit-icon" style="background-color: ${habit.colorHex}">
                                ${habit.icon}
                            </div>
                            <div>
                                <div class="habit-name" style="cursor:pointer;" onclick="openHabitDetail(${habit.id})">${habit.name}</div>
                                <div class="habit-streak">
                                    <i data-lucide="award" style="width: 16px; height: 16px;"></i>
                                    <span>${habit.streak} hari beruntun</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <button class="btn-edit-emoji" title="Edit" onclick="editHabit(${habit.id})">✏️</button>
                        </div>
                    </div>
                    <div class="days-tracker">
                        ${last7Days.map(day => `
                            <div class="day-item" onclick="toggleHabit(${habit.id}, '${day.date}')">
                                <span class="day-label">${day.day}</span>
                                <div class="day-box ${habit.completions[day.date] ? 'completed' : 'empty'}" 
                                     style="${habit.completions[day.date] ? `background-color: ${habit.colorHex}` : ''}">
                                    ${habit.completions[day.date] ? '<i data-lucide="check" style="width: 20px; height: 20px;"></i>' : ''}
                                </div>
                                <span class="day-num">${day.dayNum}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
            
            setTimeout(() => lucide.createIcons(), 0);
        }

        function toggleHabit(habitId, date) {
            const habit = habits.find(h => h.id === habitId);
            if (habit) {
                // Inisialisasi completions jika belum ada
                if (!habit.completions) {
                    habit.completions = {};
                }
                habit.completions[date] = !habit.completions[date];
                habit.streak = calculateStreak(habit.completions);
                renderHabits();
                updateStats();
            }
        }

        function updateStats() {
            if (!habits) return;
            const totalStreaks = habits.reduce((sum, h) => sum + h.streak, 0);
            const activeHabits = habits.length;
            const todayCompletions = habits.filter(h => h.completions && h.completions[getCurrentDate()]).length;
            const todayProgress = activeHabits > 0 ? Math.round((todayCompletions / activeHabits) * 100) : 0;
            
            document.getElementById('totalStreaks').textContent = totalStreaks;
            document.getElementById('activeHabits').textContent = activeHabits;
            document.getElementById('todayProgress').textContent = todayProgress + '%';
        }

        // --- Simple Analytics Helpers ---
        function renderDailyLineChart() {
            const container = document.getElementById('dailyLineChart');
            if (!container) return;
            if (!habits || habits.length === 0) { container.innerHTML = ''; return; }
            const daysBack = 14;
            const now = new Date();
            const points = [];
            for (let i = daysBack - 1; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                d.setHours(0,0,0,0);
                const key = d.toISOString().split('T')[0];
                let count = 0;
                for (const h of habits) if (h.completions && h.completions[key]) count++;
                const denom = habits.length || 1;
                const pct = Math.round((count / denom) * 100);
                points.push({ x: (daysBack-1-i), y: pct, label: `${d.getDate()}/${String(d.getMonth()+1).padStart(2,'0')}` });
            }
            const W = 240, H = 120, pad = 12;
            const maxY = 100;
            const minY = 0;
            const dx = (W - pad*2) / Math.max(1, (points.length - 1));
            const toX = (i) => pad + i*dx;
            const toY = (v) => pad + (H - pad*2) * (1 - (v - minY)/(maxY - minY));
            const path = points.map((p, i) => `${i===0?'M':'L'}${toX(i)},${toY(p.y)}`).join(' ');
            const circles = points.map((p,i)=>`<circle cx="${toX(i)}" cy="${toY(p.y)}" r="2" fill="#60a5fa" />`).join('');
            // grid y at 0,50,100
            const grid = [0,50,100].map(v=>`<line x1="${pad}" y1="${toY(v)}" x2="${W-pad}" y2="${toY(v)}" stroke="rgba(148,163,184,0.35)" stroke-width="1" />`).join('');
            const svg = `
                <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">
                    <rect x="0" y="0" width="${W}" height="${H}" fill="transparent" />
                    ${grid}
                    <path d="${path}" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    ${circles}
                </svg>`;
            container.innerHTML = svg;
        }
        function renderWeekdayHistogram() {
            const container = document.getElementById('weekdayHistogram');
            if (!container) return;
            if (!habits || habits.length === 0) { container.innerHTML = ''; return; }
            const daysBack = 28; // 4 weeks
            const now = new Date();
            // count occurrences per weekday in the window
            const weekdayTotals = Array(7).fill(0);
            const weekdayPossible = Array(7).fill(0);
            for (let i = 0; i < daysBack; i++) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                const key = d.toISOString().split('T')[0];
                const wd = d.getDay(); // 0=Min .. 6=Sab
                // possible completions that day
                weekdayPossible[wd] += habits.length;
                // actual completions (sum across habits)
                let count = 0;
                for (const h of habits) {
                    if (h.completions && h.completions[key]) count++;
                }
                weekdayTotals[wd] += count;
            }
            const labels = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
            const bars = labels.map((label, idx) => {
                const denom = weekdayPossible[idx] || 1;
                const pct = Math.round((weekdayTotals[idx] / denom) * 100);
                return `
                <div class="habit-performance">
                    <div class="performance-header">
                        <div class="performance-info">
                            <span style="font-weight:600;">${label}</span>
                        </div>
                        <span class="performance-rate">${pct}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${pct}%; background-color:#60a5fa"></div>
                    </div>
                </div>`;
            }).join('');
            container.innerHTML = `
                <h2 class="section-header" style="margin-bottom:8px;">
                    <i data-lucide="calendar-range" style="width:20px;height:20px;color:#c084fc;"></i>
                    Performa per Hari (28H)
                </h2>
                ${bars}
            `;
        }

        function renderWeeklyTrend() {
            const container = document.getElementById('weeklyTrend');
            if (!container) return;
            if (!habits || habits.length === 0) { container.innerHTML = ''; return; }
            const weeks = [];
            const now = new Date();
            // normalize to end of current week (Sat) to make 4 blocks
            const end = new Date(now);
            end.setHours(0,0,0,0);
            const dayIdx = end.getDay();
            end.setDate(end.getDate() + (6 - dayIdx)); // Saturday of this week
            for (let w = 0; w < 4; w++) {
                const start = new Date(end);
                start.setDate(end.getDate() - 6);
                // compute completions in [start..end]
                let total = 0;
                for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
                    const key = d.toISOString().split('T')[0];
                    for (const h of habits) if (h.completions && h.completions[key]) total++;
                }
                const denom = habits.length * 7 || 1;
                const pct = Math.round((total / denom) * 100);
                const title = `${start.getDate()}/${String(start.getMonth()+1).padStart(2,'0')}–${end.getDate()}/${String(end.getMonth()+1).padStart(2,'0')}`;
                weeks.unshift({ title, pct }); // most recent at right
                // move to previous week
                end.setDate(end.getDate() - 7);
            }
            const bars = weeks.map(w => `
                <div class="habit-performance">
                    <div class="performance-header">
                        <div class="performance-info">
                            <span style="font-weight:600;">${w.title}</span>
                        </div>
                        <span class="performance-rate">${w.pct}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${w.pct}%; background-color:#34d399"></div>
                    </div>
                </div>`).join('');
            container.innerHTML = `
                <h2 class="section-header" style="margin-bottom:8px;">
                    <i data-lucide="line-chart" style="width:20px;height:20px;color:#c084fc;"></i>
                    Tren Mingguan (4W)
                </h2>
                ${bars}
            `;
        }

        function renderAnalytics() {
            const performanceList = document.getElementById('performanceList');
            const last7Days = getLast7Days();

            if (habits.length === 0) {
                 performanceList.innerHTML = `<p style="text-align:center; color: #9ca3af;">Tidak ada data untuk dianalisis.</p>`;
                 document.getElementById('bestStreak').textContent = '0 hari';
                 document.getElementById('avgCompletion').textContent = '0%';
                 const overallEl = document.getElementById('overallRateValue');
                 if (overallEl) overallEl.textContent = '0%';
                 return;
            }
            
            performanceList.innerHTML = habits.map(habit => {
                const completionRate = (last7Days.filter(day => habit.completions && habit.completions[day.date]).length / 7) * 100;
                return `
                    <div class="habit-performance">
                        <div class="performance-header">
                            <div class="performance-info">
                                <span style="font-size: 1.25rem;">${habit.icon}</span>
                                <span style="font-weight: 600;">${habit.name}</span>
                            </div>
                            <span class="performance-rate">${completionRate.toFixed(0)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${completionRate}%; background-color: ${habit.colorHex}"></div>
                        </div>
                    </div>
                `;
            }).join('');
            
            const bestStreak = Math.max(0, ...habits.map(h => h.streak));
            const avgCompletion = habits.length > 0 ? Math.round(habits.reduce((sum, h) => {
                const rate = last7Days.filter(day => h.completions && h.completions[day.date]).length / 7;
                return sum + rate;
            }, 0) / habits.length * 100) : 0;
            
            document.getElementById('bestStreak').textContent = bestStreak + ' hari';
            document.getElementById('avgCompletion').textContent = avgCompletion + '%';

            // Overall rate: total checks over habits*7 (minggu berjalan)
            const totalCompletions = habits.reduce((sum, h) => {
                return sum + last7Days.filter(d => h.completions && h.completions[d.date]).length;
            }, 0);
            const denominator = habits.length * 7;
            const overallRate = denominator > 0 ? Math.round((totalCompletions / denominator) * 100) : 0;
            const overallEl = document.getElementById('overallRateValue');
            if (overallEl) overallEl.textContent = overallRate + '%';

            // extra analytics visuals
            renderDailyLineChart();
        }

        function switchCalendarMode(mode) {
            calendarMode = mode;
            // toggle active tab
            document.querySelectorAll('#calendarModeTabs .nav-tab').forEach(t => t.classList.remove('active'));
            const btn = mode === 'weekly' ? document.getElementById('tabWeekly') : document.getElementById('tabMonthly');
            if (btn) btn.classList.add('active');
            // toggle views
            document.getElementById('calendarWeekly').classList.toggle('hidden', mode !== 'weekly');
            document.getElementById('calendarMonthly').classList.toggle('hidden', mode !== 'monthly');
            renderCalendar();
            setTimeout(() => lucide.createIcons(), 0);
        }

        function renderCalendar() {
            if (calendarMode === 'weekly') renderCalendarWeekly();
            else renderCalendarMonthly();
        }

        function renderCalendarWeekly() {
            const container = document.getElementById('calendarWeekly');
            if (!container) return;
            const days = getLast7Days(); // Min..Sab minggu ini
            let html = '';
            // Header
            html += `<div class="habit-performance">
                <div class="performance-header" style="justify-content:space-between;">
                    <div style="font-weight:600">Mingguan (${days[0].dayNum}/${new Date(days[0].date).toLocaleDateString('id-ID',{month:'2-digit'})} - ${days[6].dayNum}/${new Date(days[6].date).toLocaleDateString('id-ID',{month:'2-digit'})})</div>
                    <div style="display:flex; gap:12px;">${days.map(d=>`<div style='width:32px;text-align:center;color:#94a3b8;'>${d.day}<br><span style='font-weight:600;color:#e2e8f0;'>${d.dayNum}</span></div>`).join('')}</div>
                </div>
            </div>`;
            // Rows per habit
            html += habits.map(h => {
                const row = days.map(d => {
                    const done = h.completions && h.completions[d.date];
                    const fill = done ? `background:${h.colorHex}` : 'background:transparent;border:2px solid rgba(148,163,184,0.3)';
                    return `<div style='width:32px;height:32px;border-radius:8px;${fill};cursor:pointer' onclick="toggleHabit(${h.id}, '${d.date}'); renderCalendarWeekly();"></div>`;
                }).join('');
                return `<div class='habit-performance'>
                    <div class='performance-header' style='justify-content:space-between;'>
                        <div class='performance-info'>
                            <span style='font-size:1.1rem;'>${h.icon}</span>
                            <span style='font-weight:600;'>${h.name}</span>
                        </div>
                        <div style='display:flex; gap:12px;'>${row}</div>
                    </div>
                </div>`;
            }).join('');
            container.innerHTML = html;
        }

        function changeCalendarMonth(delta) {
            calendarMonth.setMonth(calendarMonth.getMonth() + delta);
            renderCalendarMonthly();
        }

        function renderCalendarMonthly() {
            const container = document.getElementById('calendarMonthly');
            if (!container) return;
            const now = new Date();
            // Normalisasi ke awal bulan untuk state
            calendarMonth.setDate(1);
            const title = calendarMonth.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
            let html = `<div style='display:flex;align-items:center;justify-content:center;gap:12px;color:#94a3b8;margin-bottom:8px;'>
                <button class="nav-tab" style="padding:4px 8px;" onclick="changeCalendarMonth(-1)">◀</button>
                <div style='min-width:160px;text-align:center;'>${title}</div>
                <button class="nav-tab" style="padding:4px 8px;" onclick="changeCalendarMonth(1)">▶</button>
            </div>`;

            const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth()+1, 0).getDate();
            const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay(); // 0=Sun
            // Header row
            html += '<div class="calendar-grid">' + ['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d=>`<div class="calendar-header">${d}</div>`).join('') + '</div>';
            // Days grid
            html += '<div class="calendar-grid">';
            for (let i=0;i<firstDay;i++) html += '<div class="calendar-day"></div>';
            for (let day=1; day<=daysInMonth; day++) {
                const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                const dateStr = date.toISOString().split('T')[0];
                // collect icons for habits completed on this date
                const icons = habits.filter(h => h.completions && h.completions[dateStr]).map(h => ({ icon: h.icon, color: h.colorHex })).slice(0,4);
                const iconsHtml = icons.map(i => `<span title="${i.icon}" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:6px;background:${i.color};margin:1px;font-size:0.8rem;">${i.icon}</span>`).join('');
                html += `<div class="calendar-day" style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                    <div>${day}</div>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;row-gap:2px;column-gap:2px;">${iconsHtml}</div>
                </div>`;
            }
            html += '</div>';

            // Legend
            if (habits.length) {
                html += `<div style='display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;'>` +
                    habits.map(h => `<div style='display:flex;align-items:center;gap:6px;color:#94a3b8;'>
                        <span style='display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:6px;background:${h.colorHex};font-size:0.8rem;'>${h.icon}</span>
                        <span>${h.name}</span>
                    </div>`).join('') + `</div>`;
            }

            container.innerHTML = html;
        }

        // Add Habit Functions
        function showAddHabitForm() {
            // Buka modal kategori kebiasaan
            document.getElementById('addHabitModal').classList.remove('hidden');
            renderAddHabitModal('popular');
            setTimeout(() => lucide.createIcons(), 0);
        }

        function cancelAddHabit() {
            document.getElementById('addHabitForm').classList.add('hidden');
            document.getElementById('newHabitInput').value = '';
        }

        function addNewHabit() {
            const input = document.getElementById('newHabitInput');
            const name = input.value.trim();
            
            if (name) {
                const icons = ['🎯', '✨', '🚀', '💪', '🌟', '🔥', '⚡', '🎨', '🎵', '📝'];
                const colors = [
                    { class: 'bg-red-500', hex: '#ef4444' },
                    { class: 'bg-orange-500', hex: '#f97316' },
                    { class: 'bg-yellow-500', hex: '#eab308' },
                    { class: 'bg-green-500', hex: '#22c55e' },
                    { class: 'bg-teal-500', hex: '#14b8a6' },
                    { class: 'bg-blue-500', hex: '#3b82f6' },
                    { class: 'bg-indigo-500', hex: '#6366f1' },
                    { class: 'bg-purple-500', hex: '#a855f7' },
                    { class: 'bg-pink-500', hex: '#ec4899' }
                ];
                
                const randomIcon = icons[Math.floor(Math.random() * icons.length)];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                
                habits.push({
                    id: Date.now(),
                    name,
                    icon: randomIcon,
                    color: randomColor.class,
                    colorHex: randomColor.hex,
                    streak: 0,
                    completions: {}
                });
                
                input.value = '';
                document.getElementById('addHabitForm').classList.add('hidden');
                renderHabits();
                updateStats();
            }
        }

        // ====== Add Habit Modal Logic ======
        const predefinedHabits = {
            popular: [
                { name: 'Jalan', icon: '🚶' },
                { name: 'Tidur', icon: '🛏️' },
                { name: 'Minum air', icon: '💧' },
                { name: 'Meditasi', icon: '🧘' },
                { name: 'Lari', icon: '🏃' },
                { name: 'Berdiri', icon: '🧍' },
                { name: 'Bersepeda', icon: '🚴' },
                { name: 'Workout', icon: '💪' }
            ],
            health: [
                { name: 'Jalan', icon: '🚶' },
                { name: 'Tidur', icon: '🛏️' },
                { name: 'Berdiri', icon: '🧍' },
                { name: 'Bersepeda', icon: '🚴' },
                { name: 'Bakar Kalori', icon: '🔥' },
                { name: 'Olahraga', icon: '🏃' },
                { name: 'Meditasi', icon: '🧘' },
                { name: 'Minum air', icon: '💧' }
            ],
            lifestyle: [
                { name: 'Catat pengeluaran', icon: '🧾' },
                { name: 'Menabung', icon: '💰' },
                { name: 'Kurangi gula', icon: '🍭' },
                { name: 'Bernapas', icon: '😮‍💨' },
                { name: 'Meditasi', icon: '🧘' },
                { name: 'Baca buku', icon: '📚' },
                { name: 'Belajar', icon: '🎓' },
                { name: 'Review hari ini', icon: '🗒️' }
            ],
            quit: [
                { name: 'Kurangi karbohidrat', icon: '🍞' },
                { name: 'Kurangi gula', icon: '🍭' },
                { name: 'Kurangi kafein', icon: '☕' },
                { name: 'Kurangi minuman manis', icon: '🥤' },
                { name: 'Kurangi alkohol', icon: '🍺' },
                { name: 'Kurangi merokok', icon: '🚭' },
                { name: 'Kurangi main game', icon: '🎮' },
                { name: 'Kurangi mengeluh', icon: '😤' }
            ]
        };

        let currentAddCategory = 'popular';

        function renderAddHabitModal(category = 'popular') {
            currentAddCategory = category;
            const list = document.getElementById('addHabitList');
            if (!list) return;
            const items = predefinedHabits[category] || [];
            list.innerHTML = items.map(h => `
                <div class="habit-performance">
                    <div class="performance-header">
                        <div class="performance-info">
                            <span style="font-size: 1.25rem;">${h.icon}</span>
                            <span style="font-weight: 600;">${h.name}</span>
                        </div>
                        <button class="btn-add" onclick="addPredefinedHabit('${h.name.replace(/'/g, "\'")}', '${h.icon}', '${category}')">+</button>
                    </div>
                </div>
            `).join('');
        }

        function switchAddHabitCategory(category, event) {
            document.querySelectorAll('#addHabitModal .nav-tab').forEach(tab => tab.classList.remove('active'));
            if (event && event.target) event.target.closest('.nav-tab').classList.add('active');
            renderAddHabitModal(category);
        }

        function addPredefinedHabit(name, icon, category) {
            // Open custom modal with preset values
            closeAddHabitModal();
            document.getElementById('customHabitModal').classList.remove('hidden');
            initCustomHabitForm();
            // Prefill
            document.getElementById('customHabitName').value = name;
            document.getElementById('customHabitIcon').value = icon;
            setTimeout(() => lucide.createIcons(), 0);
        }

        // Optional helper if we want to call with an object later
        function openCustomHabitWithPreset(preset) {
            closeAddHabitModal();
            document.getElementById('customHabitModal').classList.remove('hidden');
            initCustomHabitForm();
            if (preset) {
                if (preset.name) document.getElementById('customHabitName').value = preset.name;
                if (preset.icon) document.getElementById('customHabitIcon').value = preset.icon;
            }
            setTimeout(() => lucide.createIcons(), 0);
        }

        function openCustomHabit() {
            closeAddHabitModal();
            document.getElementById('customHabitModal').classList.remove('hidden');
            initCustomHabitForm();
            setTimeout(() => lucide.createIcons(), 0);
        }

        function closeAddHabitModal() {
            const modal = document.getElementById('addHabitModal');
            if (modal) modal.classList.add('hidden');
        }

        function closeAddHabitOnBackdrop(event) {
            if (event.target.id === 'addHabitModal') {
                closeAddHabitModal();
            }
        }

        // ====== Custom Habit Modal Logic ======
        let customHabitState = {
            color: { class: 'bg-purple-500', hex: '#a855f7' },
            type: 'build',
            days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
            timeRange: 'any',
            editingHabitId: null
        };

        function initCustomHabitForm() {
            // Days
            const days = [
                { id: 'Mon', label: 'Sen' },
                { id: 'Tue', label: 'Sel' },
                { id: 'Wed', label: 'Rab' },
                { id: 'Thu', label: 'Kam' },
                { id: 'Fri', label: 'Jum' },
                { id: 'Sat', label: 'Sab' },
                { id: 'Sun', label: 'Min' }
            ];
            const daysWrap = document.getElementById('customHabitDays');
            daysWrap.innerHTML = days.map(d => `
                <label style="display:flex;align-items:center;gap:6px;">
                    <input type="checkbox" checked value="${d.id}" onchange="toggleCustomHabitDay(this)">
                    ${d.label}
                </label>
            `).join('');
            // Defaults
            document.getElementById('customHabitIcon').value = '🎯';
            document.getElementById('customHabitName').value = '';
            const defaultTime = '08:00';
            const timeEl = document.getElementById('customHabitTime');
            if (timeEl) timeEl.value = defaultTime;
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('customHabitStart').value = today;
            document.getElementById('customHabitEnd').value = '';
            const delBtn = document.getElementById('customHabitDeleteBtn');
            if (delBtn) delBtn.classList.add('hidden');
            customHabitState.editingHabitId = null;
            // keep default state
            customHabitState.type = 'build';
            customHabitState.timeRange = 'any';
        }

        function selectCustomHabitColor(idx) {
            customHabitState.color = customHabitState.availableColors[idx];
        }

        function setCustomHabitType(type) {
            customHabitState.type = type;
            document.getElementById('typeBuildBtn').classList.toggle('active', type === 'build');
            document.getElementById('typeQuitBtn').classList.toggle('active', type === 'quit');
        }

        function toggleCustomHabitDay(el) {
            const id = el.value;
            if (el.checked) {
                if (!customHabitState.days.includes(id)) customHabitState.days.push(id);
            } else {
                customHabitState.days = customHabitState.days.filter(d => d !== id);
            }
        }

        function setCustomHabitTimeRange(range, event) {
            customHabitState.timeRange = range;
            document.querySelectorAll('#customHabitModal [data-range]').forEach(b => b.classList.remove('active'));
            if (event && event.target) event.target.closest('button').classList.add('active');
            else document.querySelector(`#customHabitModal [data-range="${range}"]`).classList.add('active');
        }

        function saveCustomHabit() {
            const name = document.getElementById('customHabitName').value.trim();
            if (!name) {
                alert('Nama kebiasaan wajib diisi');
                return;
            }
            const icon = (document.getElementById('customHabitIcon').value || '🎯').trim();
            // choose a color automatically (no picker in UI)
            const colors = [
                { class: 'bg-red-500', hex: '#ef4444' },
                { class: 'bg-orange-500', hex: '#f97316' },
                { class: 'bg-yellow-500', hex: '#eab308' },
                { class: 'bg-green-500', hex: '#22c55e' },
                { class: 'bg-teal-500', hex: '#14b8a6' },
                { class: 'bg-blue-500', hex: '#3b82f6' },
                { class: 'bg-indigo-500', hex: '#6366f1' },
                { class: 'bg-purple-500', hex: '#a855f7' },
                { class: 'bg-pink-500', hex: '#ec4899' }
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const timeEl = document.getElementById('customHabitTime');
            const remindTime = timeEl && timeEl.value ? timeEl.value : '08:00';

            const newHabit = {
                id: Date.now(),
                name,
                icon,
                color: color.class,
                colorHex: color.hex,
                streak: 0,
                completions: {},
                meta: {
                    days: [...customHabitState.days],
                    time: remindTime,
                    start: document.getElementById('customHabitStart').value,
                    end: document.getElementById('customHabitEnd').value,
                    lastRemindedKey: null
                }
            };
            if (customHabitState.editingHabitId) {
                const idx = habits.findIndex(h => h.id === customHabitState.editingHabitId);
                if (idx !== -1) {
                    // pertahankan completions & streak jika ada
                    newHabit.id = habits[idx].id;
                    newHabit.completions = habits[idx].completions || {};
                    newHabit.streak = calculateStreak(newHabit.completions);
                    // pertahankan warna lama saat edit
                    newHabit.color = habits[idx].color;
                    newHabit.colorHex = habits[idx].colorHex;
                    habits[idx] = newHabit;
                }
                customHabitState.editingHabitId = null;
            } else {
                habits.push(newHabit);
            }
            closeCustomHabitModal();
            renderHabits();
            updateStats();
        }

        function closeCustomHabitModal() {
            const modal = document.getElementById('customHabitModal');
            if (modal) modal.classList.add('hidden');
        }

        function closeCustomHabitOnBackdrop(event) {
            if (event.target.id === 'customHabitModal') closeCustomHabitModal();
        }

        // ====== Habit Detail Logic ======
        let currentDetailHabitId = null;

        function openHabitDetail(habitId) {
            currentDetailHabitId = habitId;
            document.getElementById('habitDetailModal').classList.remove('hidden');
            renderHabitDetail();
            setTimeout(() => lucide.createIcons(), 0);
        }

        function closeHabitDetail() {
            document.getElementById('habitDetailModal').classList.add('hidden');
            currentDetailHabitId = null;
        }

        function closeHabitDetailOnBackdrop(event) {
            if (event.target.id === 'habitDetailModal') closeHabitDetail();
        }

        function calculateBestStreak(completions) {
            const dates = Object.keys(completions || {}).filter(d => completions[d]).sort();
            let best = 0, cur = 0, prev = null;
            for (const d of dates) {
                if (prev) {
                    const prevDate = new Date(prev);
                    const curDate = new Date(d);
                    const diff = (curDate - prevDate) / (1000*60*60*24);
                    if (diff === 1) cur += 1; else cur = 1;
                } else {
                    cur = 1;
                }
                best = Math.max(best, cur);
                prev = d;
            }
            return best;
        }

        function renderHabitDetail() {
            const container = document.getElementById('habitDetailContent');
            const habit = habits.find(h => h.id === currentDetailHabitId);
            if (!habit || !container) return;

            const now = new Date();
            const monthLabel = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay(); // 0=Min

            // Build calendar grid
            const weekHeaders = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
            let calHtml = '<div class="calendar-grid">' + weekHeaders.map(d=>`<div class="calendar-header">${d}</div>`).join('') + '</div>';
            let grid = '<div class="calendar-grid">';
            const pad = (firstDay + 6) % 7 === 6 ? 0 : (firstDay); // using 0=Min aligns to our headers
            for (let i=0;i<pad;i++) grid += '<div class="calendar-day"></div>';
            let doneInMonth = 0;
            for (let day=1; day<=daysInMonth; day++) {
                const date = new Date(now.getFullYear(), now.getMonth(), day);
                const dateStr = date.toISOString().split('T')[0];
                const done = habit.completions && habit.completions[dateStr];
                if (done) doneInMonth++;
                const bg = done ? habit.colorHex : 'rgba(71,85,105,0.15)';
                grid += `<div class="calendar-day" style="background-color:${bg}">${day}</div>`;
            }
            grid += '</div>';

            const totalDone = Object.keys(habit.completions || {}).filter(k => habit.completions[k]).length;
            const currentStreak = calculateStreak(habit.completions || {});
            const bestStreak = calculateBestStreak(habit.completions || {});

            container.innerHTML = `
                <div class="analytics-section" style="margin-top:4px;">
                    <h2 class="section-header">
                        <span style="font-size:1.2rem; margin-right:8px;">${habit.icon}</span>
                        ${habit.name}
                    </h2>
                    <div style="color:#94a3b8; margin-top:-6px;">Kalender ${monthLabel}</div>
                    ${calHtml}
                    ${grid}
                </div>
                <div class="stats-grid">
                    <div class="stat-card"><h3 class="insight-label">Selesai di ${now.toLocaleDateString('id-ID', { month: 'long' })}</h3><div class="insight-value">${doneInMonth}</div></div>
                    <div class="stat-card"><h3 class="insight-label">Total Selesai</h3><div class="insight-value">${totalDone}</div></div>
                    <div class="stat-card"><h3 class="insight-label">Streak Saat Ini</h3><div class="insight-value">${currentStreak}</div></div>
                    <div class="stat-card"><h3 class="insight-label">Streak Terbaik</h3><div class="insight-value">${bestStreak}</div></div>
                </div>
            `;
        }

        function editHabit(habitId) {
            const habit = habits.find(h => h.id === habitId);
            if (!habit) return;
            closeHabitDetail();
            document.getElementById('customHabitModal').classList.remove('hidden');
            initCustomHabitForm();
            customHabitState.editingHabitId = habit.id;
            document.getElementById('customHabitName').value = habit.name;
            document.getElementById('customHabitIcon').value = habit.icon;
            document.getElementById('customHabitStart').value = (habit.meta && habit.meta.start) || new Date().toISOString().split('T')[0];
            document.getElementById('customHabitEnd').value = (habit.meta && habit.meta.end) || '';
            const delBtn = document.getElementById('customHabitDeleteBtn');
            if (delBtn) delBtn.classList.remove('hidden');
            const timeEl = document.getElementById('customHabitTime');
            if (timeEl) timeEl.value = (habit.meta && habit.meta.time) || '08:00';
            // Reflect days
            if (habit.meta && Array.isArray(habit.meta.days)) {
                customHabitState.days = [...habit.meta.days];
                const wrap = document.getElementById('customHabitDays');
                if (wrap) {
                    wrap.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                        cb.checked = customHabitState.days.includes(cb.value);
                    });
                }
            }
            setTimeout(() => lucide.createIcons(), 0);
        }

        function deleteHabit(habitId) {
            if (!confirm('Hapus kebiasaan ini?')) return;
            habits = habits.filter(h => h.id !== habitId);
            closeHabitDetail();
            closeCustomHabitModal();
            renderHabits();
            updateStats();
        }

        // AI Insights
        function showInsights() {
            generateAIInsights();
            document.getElementById('insightsModal').classList.remove('hidden');
            setTimeout(() => lucide.createIcons(), 0);
        }

        function closeInsights() {
            document.getElementById('insightsModal').classList.add('hidden');
        }

        function closeInsightsOnBackdrop(event) {
            if (event.target.id === 'insightsModal') {
                closeInsights();
            }
        }

        function generateAIInsights() {
            if (habits.length === 0) {
                document.getElementById('insightCompletionRate').textContent = '0%';
                document.getElementById('insightDetail').textContent = `0 dari 0 dalam 7 hari terakhir`;
                document.getElementById('insightAvgStreak').textContent = '0';
                document.getElementById('insightBestHabit').textContent = `Belum ada kebiasaan`;
                document.getElementById('correlationsList').innerHTML = `<p class="correlation-item">Data belum cukup untuk korelasi.</p>`;
                document.getElementById('recommendationsList').innerHTML = `<p class="recommendation-item">Tambahkan kebiasaan untuk mendapatkan rekomendasi AI.</p>`;
                return;
            }

            const days = getLast7Days();
            let totalCompletions = 0;
            habits.forEach(habit => {
                days.forEach(day => { if (habit.completions && habit.completions[day.date]) totalCompletions++; });
            });

            const completionRate = ((totalCompletions / (habits.length * 7)) * 100).toFixed(1);
            const bestHabit = habits.reduce((best, h) => (h.streak > best.streak ? h : best), habits[0]);
            const avgStreak = (habits.reduce((sum, h) => sum + h.streak, 0) / habits.length).toFixed(1);

            document.getElementById('insightCompletionRate').textContent = completionRate + '%';
            document.getElementById('insightDetail').textContent = `${totalCompletions} dari ${habits.length * 7} dalam 7 hari terakhir`;
            document.getElementById('insightAvgStreak').textContent = avgStreak;
            document.getElementById('insightBestHabit').textContent = `Terbaik: ${bestHabit.name} (${bestHabit.streak} hari)`;

            // Baseline correlations (Jaccard)
            const pairs = [];
            for (let i=0;i<habits.length;i++) {
                for (let j=i+1;j<habits.length;j++) {
                    const a = habits[i], b = habits[j];
                    let inter=0, uni=0;
                    for (const d of days) {
                        const av = Boolean(a.completions && a.completions[d.date]);
                        const bv = Boolean(b.completions && b.completions[d.date]);
                        if (av && bv) inter++;
                        if (av || bv) uni++;
                    }
                    const score = uni ? inter/uni : 0;
                    pairs.push({ a: a.name, b: b.name, score });
                }
            }
            pairs.sort((x,y) => y.score - x.score);
            const corrHtml = pairs.slice(0, Math.min(3, pairs.length)).map(c => `
                <div class="correlation-item">
                    <div class="correlation-header">
                        <span class="correlation-text">${c.a} ↔ ${c.b}</span>
                        <span class="correlation-value">${Math.round(c.score * 100)}% korelasi</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${c.score * 100}%"></div>
                    </div>
                </div>`).join('');
            document.getElementById('correlationsList').innerHTML = corrHtml || `<p class="correlation-item">Data belum cukup untuk korelasi.</p>`;

            // Baseline recommendations (with combo suggestions from correlations and complementary new habits)
            const least = habits.map(h => ({ name: h.name, done: days.filter(d => h.completions && h.completions[d.date]).length })).sort((a,b)=>a.done-b.done)[0];
            const recFallback = [
                `Pertahankan ${bestHabit.name} dengan menyiapkan pengingat ringan tiap hari`,
                least ? `Fokus pada ${least.name} selama 5 menit setiap hari untuk membangun momentum` : `Mulai dari kebiasaan termudah selama 5 menit per hari`,
                `Tentukan jam tetap (misalnya pukul 20:00) untuk konsisten selama 7 hari`
            ];
            // Complementary habit suggestions: suggest combos with habits that user belum punya
            const existing = new Set(habits.map(h => h.name.toLowerCase()));
            const suggestionsDict = [
                { keys: ['workout','olahraga','latihan','lari','bersepeda','gym'], add: ['Tidur tepat waktu', 'Peregangan 10 menit', 'Minum air 8 gelas'] },
                { keys: ['membaca','baca','belajar','study'], add: ['Catat ringkasan 5 menit', 'Istirahat mata 20-20-20', 'Tidur tepat waktu'] },
                { keys: ['meditasi','meditation'], add: ['Jalan sore ringan', 'Tidur tepat waktu'] },
                { keys: ['minum air','hidrasi','air'], add: ['Jalan pagi 10 menit'] },
                { keys: ['tidur','sleep'], add: ['Hindari layar 30 menit sebelum tidur'] },
                { keys: ['catat pengeluaran','keuangan','menabung','budget'], add: ['Tentukan anggaran mingguan'] },
                { keys: ['kurangi gula','diet','makanan','karbo','kafein'], add: ['Minum air sebelum makan', 'Tidur tepat waktu'] },
                { keys: ['berdiri','stand'], add: ['Peregangan 5 menit'] }
            ];
            const lower = s => String(s||'').toLowerCase();
            const complementSet = new Set();
            habits.forEach(h => {
                const name = lower(h.name);
                suggestionsDict.forEach(rule => {
                    if (rule.keys.some(k => name.includes(k))) {
                        rule.add.forEach(c => { if (!existing.has(lower(c))) complementSet.add(c); });
                    }
                });
            });
            const complementTexts = Array.from(complementSet).slice(0,2).map(c => {
                // pick a related source habit name for message clarity
                const src = habits.find(h => suggestionsDict.some(rule => rule.keys.some(k => lower(h.name).includes(k)) && rule.add.some(a => lower(a) === lower(c))));
                const left = src ? src.name : 'Kebiasaan Anda';
                return `Kombinasikan ${left} dengan ${c} untuk saling mendukung`;
            });
            // Build combination recommendations from top correlated pairs
            const comboTexts = pairs
                .filter(p => p.score >= 0.3)
                .slice(0, 2)
                .map(p => `Kombinasikan ${p.a} dengan ${p.b} (mis. lakukan ${p.b} setelah ${p.a}) untuk memperkuat kebiasaan`);
            const combinedRecs = [...complementTexts, ...comboTexts, ...recFallback].slice(0, 3);
            document.getElementById('recommendationsList').innerHTML = combinedRecs.map((t, idx) => `
                <div class="recommendation-item">
                    <div class="recommendation-number">${idx + 1}</div>
                    <p class="recommendation-text">${t}</p>
                </div>`).join('');

            // AI enhancement
            if (window.AI && typeof window.AI.ask === 'function') {
                const allowedNames = habits.map(h => h.name);
                const data = {
                    completionRate,
                    bestHabit: { name: bestHabit.name, streak: bestHabit.streak },
                    habits: habits.map(h => ({ name: h.name, streak: h.streak, last7: days.map(d => Boolean(h.completions && h.completions[d.date])) }))
                };
                const system = 'Anda adalah analis kebiasaan. Jawab singkat, jelas, bahasa Indonesia. Jangan halusinasi.';
                const user = `Berdasarkan data kebiasaan berikut (7 hari terakhir), kembalikan JSON VALID persis format berikut tanpa teks lain (tanpa markdown):\n{\n  "correlations": [{"a": "namaHabit", "b": "namaHabit", "score": 0.0}],\n  "recommendations": [{"text": "kalimat pendek", "habit": "namaHabit atau null"}]\n}\nKetentuan ketat:\n- Gunakan HANYA nama kebiasaan dari allowed_names: ${JSON.stringify(allowedNames)}\n- Jika menyebut kebiasaan, field "habit" WAJIB berisi salah satu dari allowed_names. Jika saran umum, set "habit": null.\n- score 0..1. Maksimal 6 korelasi, 3 rekomendasi.\nData: ${JSON.stringify(data).slice(0, 6000)}`;
                const messages = [
                    { role: 'system', content: system },
                    { role: 'user', content: user }
                ];
                window.AI.ask(undefined, { messages }).then(text => {
                    let s = String(text || '');
                    s = s.replace(/^```(?:json)?/i, '').replace(/```$/,'').trim();
                    let parsed = null;
                    try { parsed = JSON.parse(s); } catch (e) { parsed = null; }
                    if (!parsed) return;
                    const allowed = new Set(allowedNames);
                    if (Array.isArray(parsed.correlations) && parsed.correlations.length) {
                        const filtered = parsed.correlations
                            .map(c => ({ a: String(c.a||''), b: String(c.b||''), score: Number(c.score)||0 }))
                            .filter(c => allowed.has(c.a) && allowed.has(c.b) && c.a !== c.b)
                            .slice(0,6);
                        if (filtered.length) {
                            const html = filtered.map(c => {
                                const score = Math.max(0, Math.min(1, c.score));
                                return `
                <div class="correlation-item">
                    <div class="correlation-header">
                        <span class="correlation-text">${c.a} ↔ ${c.b}</span>
                        <span class="correlation-value">${Math.round(score * 100)}% korelasi</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${score * 100}%"></div>
                    </div>
                </div>`;
                            }).join('');
                            const el = document.getElementById('correlationsList');
                            if (el && html) el.innerHTML = html;
                        }
                    }
                    if ((Array.isArray(parsed.recommendations) && parsed.recommendations.length) || (Array.isArray(parsed.correlations) && parsed.correlations.length)) {
                        const recs = (parsed.recommendations || [])
                            .map(r => ({ text: String((r && r.text) || r || '').trim(), habit: r && r.habit != null ? String(r.habit) : null }))
                            .filter(r => r.text)
                            .filter(r => r.habit === null || allowed.has(r.habit))
                            .slice(0,3);
                        // Also derive combo suggestions from AI correlations
                        const combo = (parsed.correlations || [])
                            .map(c => ({ a: String(c.a||''), b: String(c.b||''), score: Number(c.score)||0 }))
                            .filter(c => allowed.has(c.a) && allowed.has(c.b) && c.a !== c.b)
                            .sort((x,y)=> (y.score - x.score))
                            .slice(0,2)
                            .map(c => ({ text: `Kombinasikan ${c.a} dengan ${c.b} (mis. lakukan ${c.b} setelah ${c.a}) untuk memperkuat kebiasaan`, habit: null }));
                        // Complementary suggestions (same rules as baseline)
                        const existing2 = new Set(habits.map(h => h.name.toLowerCase()));
                        const complementSet2 = new Set();
                        habits.forEach(h => {
                            const name = lower(h.name);
                            suggestionsDict.forEach(rule => {
                                if (rule.keys.some(k => name.includes(k))) {
                                    rule.add.forEach(c => { if (!existing2.has(lower(c))) complementSet2.add(c); });
                                }
                            });
                        });
                        const complementTexts2 = Array.from(complementSet2).slice(0,2).map(c => {
                            const src = habits.find(h => suggestionsDict.some(rule => rule.keys.some(k => lower(h.name).includes(k)) && rule.add.some(a => lower(a) === lower(c))));
                            const left = src ? src.name : 'Kebiasaan Anda';
                            return { text: `Kombinasikan ${left} dengan ${c} untuk saling mendukung`, habit: null };
                        });
                        const merged = [...complementTexts2, ...combo, ...recs].slice(0,3);
                        if (recs.length) {
                            const html = merged.map((r, idx) => `
                <div class="recommendation-item">
                    <div class="recommendation-number">${idx + 1}</div>
                    <p class="recommendation-text">${r.text.replace(/^[-•\d\.\s]+/, '')}</p>
                </div>`).join('');
                            const el = document.getElementById('recommendationsList');
                            if (el && html) el.innerHTML = html;
                        }
                    }
                }).catch(() => { /* fallback: biarkan hasil lokal */ });
            }
        }

// Initialize
window.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    // Coba inisialisasi Google jika script sudah siap dan Client ID sudah diisi
    initGoogleIfNeeded();
    scheduleMidnightRefresh();
    requestNotificationPermission();
    startReminderLoop();
});

function scheduleMidnightRefresh() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24,0,0,0); // next midnight
    const ms = next - now;
    setTimeout(() => {
        // Refresh views to follow real-time date
        renderHabits();
        updateStats();
        if (currentView === 'analytics') renderAnalytics();
        if (currentView === 'calendar') renderCalendar();
        if (typeof currentDetailHabitId === 'number') renderHabitDetail();
        // reschedule for following day
        scheduleMidnightRefresh();
    }, ms);
}