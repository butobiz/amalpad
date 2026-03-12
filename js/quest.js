/* ========================================================================== */
/* quest.js - Berisi Logika Misi, Database Utama, & State (Cloud Ready ☁️)   */
/* ========================================================================== */

// Inisialisasi State yang Aman (Agar tidak error undefined)
let currentSkinTab = 'tasbih';

// Konstanta Achievements / Piala Skena (Ditambahkan)
const BADGE_DEFS = [
    { icon: "🕋", title: "Pusat", desc: "Level kedekatan dengan Sang Pencipta", stat: "pusat" },
    { icon: "✨", title: "Aura", desc: "Aura kebaikan yang terpancar", stat: "aura" },
    { icon: "🤝", title: "Peka", desc: "Kepekaan sosial dan empati", stat: "peka" },
    { icon: "🗿", title: "Sigma", desc: "Keteguhan prinsip ibadah", stat: "sigma" },
    { icon: "🪙", title: "Derma", desc: "Kedermawanan dan sedekah", stat: "derma" },
    { icon: "🧘", title: "Stoic", desc: "Pengendalian diri dan kesabaran", stat: "stoic" },
    { icon: "👑", title: "Level Up", desc: "Level keseluruhan player", type: "overall_lvl" },
    { icon: "🐉", title: "Slayer", desc: "Penakluk Misi Epikal", type: "epic_quests" },
    { icon: "🎯", title: "Veteran", desc: "Penyelesai Quest Harian", type: "total_quests" },
    { icon: "📿", title: "Dzikir", desc: "Ahli Tasbih", type: "tasbih_total" }
];

// Konstanta Skins Kosmetik (Ditambahkan)
const SKINS = {
    tasbih: [
        { id: "default", req: 0, name: "Tasbih Standar", rarity: "Common", desc: "Tasbih andalan para pemula.", icon: "📿", previewClass: "bg-emerald-100 text-emerald-600 border border-emerald-300" },
        { id: "glow", req: 10000, name: "Neon Tasbih", rarity: "Epic", desc: "Menyala menembus kegelapan malam.", icon: "✨", previewClass: "bg-blue-900 text-blue-300 border border-blue-500 shadow-[0_0_10px_#3b82f6]" },
        { id: "gold", req: 50000, name: "Gold Tasbih", rarity: "Mythic", desc: "Ditempa dari keikhlasan absolut.", icon: "👑", previewClass: "bg-yellow-600 text-yellow-100 border border-yellow-400 shadow-[0_0_15px_#f59e0b]" }
    ],
    card: [
        { id: "card_dark", reqType: "quest", req: 0, name: "Midnight Skena", rarity: "Common", desc: "Kartu ID dasar menembus malam.", icon: "🌙", previewClass: "bg-slate-900 border-purple-500" },
        { id: "card_green", reqType: "quest", req: 50, name: "Emerald Card", rarity: "Rare", desc: "Kesejukan iman dalam satu kartu.", icon: "🌿", previewClass: "bg-emerald-700 border-emerald-400" },
        { id: "card_holo", reqType: "quest", req: 150, name: "Holo Card", rarity: "Epic", desc: "Memantulkan cahaya hidayah.", icon: "🌈", previewClass: "bg-gradient-to-r from-blue-500 to-purple-500" },
        { id: "card_crown", reqType: "epic", req: 15, name: "Crown Card", rarity: "Legendary", desc: "Identitas sang Penakluk Epikal.", icon: "🐉", previewClass: "bg-yellow-800 border-yellow-300" }
    ]
};

window.getUserTitle = function(level) { 
    if (level >= 90) return "Final Boss Istiqomah"; 
    if (level >= 80) return "Aura Infinite"; 
    if (level >= 70) return "Core Skena Akhirat"; 
    if (level >= 60) return "Backingan Pusat"; 
    if (level >= 50) return "Puh Sepuh Jalur Langit"; 
    if (level >= 40) return "Suhu Akhlaq"; 
    if (level >= 30) return "Sigma Ibadah"; 
    if (level >= 20) return "Sepuh Magang"; 
    if (level >= 10) return "Skena Perintis"; 
    return "NPC Duniawi"; 
};

window.sholatWajib = [
    { id: "sw-subuh", title: "Subuh", start: 4, end: 6, exp: 50, type: "pusat" }, 
    { id: "sw-dhuhur", title: "Dhuhur", start: 11, end: 15, exp: 50, type: "pusat" }, 
    { id: "sw-ashar", title: "Ashar", start: 15, end: 18, exp: 50, type: "pusat" }, 
    { id: "sw-maghrib", title: "Maghrib", start: 18, end: 19, exp: 50, type: "pusat" }, 
    { id: "sw-isya", title: "Isya", start: 19, end: 24, exp: 50, type: "pusat" } 
];

const POOL_KEJUTAN = [
    { id: "kj1", title: "Pungut sampah di jalanan 🗑️", exp: 20, stat: "peka", wajib: false }, 
    { id: "kj2", title: "Senyum ke orang sekitar 😊", exp: 15, stat: "aura", wajib: false }, 
    { id: "kj3", title: "Ibadah awal waktu ⏰", exp: 50, stat: "pusat", wajib: true }, 
    { id: "kj4", title: "Jaga ucapan seharian 🤐", exp: 50, stat: "stoic", wajib: true }, 
    { id: "kj5", title: "Maafkan kesalahan orang ❤️", exp: 40, stat: "stoic", wajib: false },
    { id: "kj6", title: "Bantu ringankan tugas orang tua/teman 🤝", exp: 30, stat: "peka", wajib: false },
    { id: "kj7", title: "Kasih makan hewan jalanan (kucing/burung) 🐈", exp: 25, stat: "derma", wajib: false },
    { id: "kj8", title: "Berbagi makanan atau minuman 🍱", exp: 35, stat: "derma", wajib: false },
    { id: "kj9", title: "Sapa ramah satpam/petugas kebersihan 💂", exp: 20, stat: "aura", wajib: false },
    { id: "kj10", title: "Rapikan tempat tidur sendiri 🛏️", exp: 15, stat: "pusat", wajib: false },
    { id: "kj11", title: "Tahan amarah saat lagi emosi 😤", exp: 60, stat: "stoic", wajib: true },
    { id: "kj12", title: "Rapikan sandal/sepatu berantakan di masjid 👞", exp: 25, stat: "peka", wajib: false },
    { id: "kj13", title: "Berhenti main HP 1 jam sebelum tidur 📵", exp: 40, stat: "sigma", wajib: false },
    { id: "kj14", title: "Ucapkan terima kasih ke 3 orang hari ini 🙏", exp: 20, stat: "aura", wajib: false },
    { id: "kj15", title: "Sedekah subuh berapapun nominalnya 🪙", exp: 50, stat: "derma", wajib: true },
    { id: "kj16", title: "Dengar curhat teman dengan empati penuh 👂", exp: 30, stat: "peka", wajib: false },
    { id: "kj17", title: "Singkirkan benda tajam/batu dari jalanan 🪨", exp: 30, stat: "peka", wajib: false },
    { id: "kj18", title: "Kirim chat semangat ke sahabat/keluarga 💬", exp: 20, stat: "aura", wajib: false },
    { id: "kj19", title: "Beli dagangan kecil di pinggir jalan 🛒", exp: 35, stat: "derma", wajib: false },
    { id: "kj20", title: "Berwudhu sebelum tidur 💧", exp: 40, stat: "pusat", wajib: true },
    { id: "kj21", title: "Ucapkan salam saat masuk ruangan/rumah 🚪", exp: 15, stat: "aura", wajib: false },
    { id: "kj22", title: "Berdiri di kendaraan umum untuk yang butuh 🚌", exp: 45, stat: "peka", wajib: false },
    { id: "kj23", title: "Tahan diri dari ghibah (ngomongin orang) 🤐", exp: 60, stat: "stoic", wajib: true },
    { id: "kj24", title: "Baca doa sebelum dan sesudah makan 🍽️", exp: 20, stat: "pusat", wajib: false },
    { id: "kj25", title: "Pungut sampah di area tempatmu duduk 🗑️", exp: 25, stat: "peka", wajib: false }
];

const POOL_HABITS = [
    { id: "hb1", title: "Amalan Pagi 🌅", diff: "easy", exp: 20, stat: "pusat" }, 
    { id: "hb2", title: "Puasa Sunnah 🌙", diff: "hard", exp: 100, stat: "sigma" }, 
    { id: "hb3", title: "Baca Kitab 1 Lembar 📖", diff: "normal", exp: 40, stat: "pusat" }, 
    { id: "hb4", title: "Olahraga 15 Menit 💪", diff: "normal", exp: 30, stat: "sigma" }, 
    { id: "hb5", title: "Detox Sosmed 2 Jam 📵", diff: "hard", exp: 80, stat: "stoic" }, 
    { id: "hb6", title: "Minum Air Putih 2L 💧", diff: "easy", exp: 15, stat: "stoic" },
    { id: "hb7", title: "Sholat Dhuha minimal 2 rakaat ☀️", diff: "normal", exp: 50, stat: "pusat" },
    { id: "hb8", title: "Sholat Tahajud malam ini 🌌", diff: "hard", exp: 100, stat: "pusat" },
    { id: "hb9", title: "Baca Al-Qur'an 1 Juz 📖", diff: "hard", exp: 120, stat: "sigma" },
    { id: "hb10", title: "Hafalan 1 ayat baru hari ini 🧠", diff: "normal", exp: 40, stat: "sigma" },
    { id: "hb11", title: "Jalan kaki 5.000 langkah 🚶", diff: "normal", exp: 30, stat: "sigma" },
    { id: "hb12", title: "Dzikir Al-Mathurat (Pagi/Petang) 📿", diff: "normal", exp: 40, stat: "pusat" },
    { id: "hb13", title: "Membaca buku pengembangan diri 15 menit 📚", diff: "easy", exp: 25, stat: "stoic" },
    { id: "hb14", title: "No Sugar / Tidak konsumsi manis 1 hari 🚫", diff: "hard", exp: 80, stat: "stoic" },
    { id: "hb15", title: "Berhenti makan sebelum kenyang 🍽️", diff: "normal", exp: 50, stat: "stoic" },
    { id: "hb16", title: "Dengarkan 1 kajian online/podcast 🎧", diff: "easy", exp: 25, stat: "aura" },
    { id: "hb17", title: "Bersedekah / Infaq harian 💸", diff: "normal", exp: 50, stat: "derma" },
    { id: "hb18", title: "Bantu pekerjaan rumah (nyapu/cuci piring) 🧹", diff: "easy", exp: 30, stat: "peka" },
    { id: "hb19", title: "Tidur lebih awal (sebelum jam 10 malam) 😴", diff: "hard", exp: 80, stat: "sigma" },
    { id: "hb20", title: "Bangun sebelum waktu subuh tiba ⏰", diff: "hard", exp: 100, stat: "pusat" },
    { id: "hb21", title: "Jaga wudhu (batal langsung wudhu lagi) 💧", diff: "hard", exp: 150, stat: "pusat" },
    { id: "hb22", title: "Sholat Rawatib (Qobliyah/Ba'diyah) 🕌", diff: "normal", exp: 60, stat: "pusat" },
    { id: "hb23", title: "Review pelajaran/ilmu yang didapat hari ini 📝", diff: "easy", exp: 20, stat: "sigma" },
    { id: "hb24", title: "Jurnal rasa syukur (tulis 3 hal baik hari ini) ✍️", diff: "easy", exp: 15, stat: "aura" },
    { id: "hb25", title: "Kerjakan tugas paling berat di pagi hari 🌅", diff: "normal", exp: 60, stat: "sigma" }
];

const POOL_EPIKAL = [
    { id: "ep1", title: "Ibadah 1/3 Malam 🌌", exp: 200, stat: "pusat", desc: "Ujian elit, koneksi satelit langsung ke langit." }, 
    { id: "ep2", title: "Khatam Target Bacaan 📜", exp: 250, stat: "pusat", desc: "Fokus tingkat tinggi, tak terdistraksi duniawi." },
    { id: "ep3", title: "Puasa Daud (Sehari puasa, sehari tidak) 🛡️", exp: 500, stat: "sigma", desc: "Level puasa tertinggi, uji ketahanan fisik dan mental maksimal." },
    { id: "ep4", title: "I'tikaf di Masjid seharian penuh 🕌", exp: 300, stat: "pusat", desc: "Mengisolasi diri dari sistem matriks duniawi." },
    { id: "ep5", title: "Traktir makan sahabat/orang tak dikenal 🍛", exp: 400, stat: "derma", desc: "Critical hit untuk mengalahkan sifat bakhil dalam diri." },
    { id: "ep6", title: "Khatam Al-Qur'an dalam 1 Bulan 📖", exp: 1000, stat: "pusat", desc: "Konsistensi tanpa batas. Ultimate grinding." },
    { id: "ep7", title: "Tidak marah sama sekali dalam 1 minggu 🧘", exp: 500, stat: "stoic", desc: "Pengendalian ego level dewa. Boss fight batin." },
    { id: "ep8", title: "Detox Sosmed Total 7 Hari 📵", exp: 600, stat: "stoic", desc: "Menghilang dari timeline, log-in ke real life." },
    { id: "ep9", title: "Hafal Surat Al-Kahfi lengkap 110 Ayat 🧠", exp: 800, stat: "sigma", desc: "Armor perlindungan maksimal dari fitnah akhir zaman." },
    { id: "ep10", title: "Sholat Jamaah 40 hari berturut-turut tanpa masbuq 🚶", exp: 2000, stat: "pusat", desc: "Quest legendaris pembebas sifat munafik. The True Veteran." },
    { id: "ep11", title: "Donor Darah 🩸", exp: 300, stat: "peka", desc: "Memberikan sebagian health point (HP) untuk orang lain." },
    { id: "ep12", title: "Jadi relawan sosial / bantu panti asuhan 🤝", exp: 400, stat: "peka", desc: "Mengasah empati sosial tingkat tinggi." },
    { id: "ep13", title: "Selesaikan 1 buku Sirah Nabawiyah 📚", exp: 250, stat: "sigma", desc: "Upgrade lore & skill tree dari sumber aslinya." },
    { id: "ep14", title: "Mulai Nabung Umroh tembus target awal 🕋", exp: 1500, stat: "pusat", desc: "Panggilan rindu. The ultimate fast travel." },
    { id: "ep15", title: "Maafkan musuh terbesar dalam hidup 🕊️", exp: 700, stat: "aura", desc: "Membersihkan debuff hati paling berkerak." },
    { id: "ep16", title: "Sholat Dhuha 8 rakaat full ☀️", exp: 200, stat: "derma", desc: "Sedekah harian untuk seluruh persendian tubuh." },
    { id: "ep17", title: "Bangun jam 3 pagi konstan selama 1 minggu ⏰", exp: 500, stat: "sigma", desc: "Mematahkan belenggu rasa malas tingkat akhir." },
    { id: "ep18", title: "Workout intens hingga batas limit (Failure) 🏃", exp: 250, stat: "sigma", desc: "Membentuk stat fisik pejuang tangguh." },
    { id: "ep19", title: "Hafal dan praktikkan 1 Hadits Arbain minggu ini 📜", exp: 300, stat: "pusat", desc: "Membumikan lore menjadi core gameplay." },
    { id: "ep20", title: "Menyantuni Anak Yatim secara langsung 👧", exp: 400, stat: "derma", desc: "Holy element penangkal hati yang mengeras." },
    { id: "ep21", title: "Tinggalkan 1 kebiasaan buruk selamanya 🚫", exp: 1000, stat: "stoic", desc: "Pertarungan paling brutal melawan sisi gelap diri sendiri." },
    { id: "ep22", title: "Mengajarkan ilmu bermanfaat ke orang lain 🗣️", exp: 350, stat: "aura", desc: "Amal jariyah. Passive income EXP yang tak terputus." },
    { id: "ep23", title: "Berkemah / Tadabbur Alam tanpa sinyal HP 🏕️", exp: 400, stat: "peka", desc: "Merenungi kebesaran grafis ciptaan-Nya." },
    { id: "ep24", title: "Bersihkan toilet masjid sampai kinclong 🧽", exp: 500, stat: "stoic", desc: "Menghancurkan debuff kesombongan paling dalam." },
    { id: "ep25", title: "Sambung silaturahmi yang sempat terputus lama 🤝", exp: 600, stat: "peka", desc: "Membuka hidden path rezeki dan umur panjang." }
];

const SPECIAL_QUESTS = [
    { id: "sq1", tier: "I", rank: "Common", title: "Pemula Skena", desc: "Selesaikan 350 Misi Harian", reqType: "quest", reqAmount: 150, rewardSkin: "card_green", rewardName: "Emerald Card", color: "from-green-500 to-emerald-600", bgDark: "bg-green-900/20", borderDark: "border-green-500/30" },
    { id: "sq2", tier: "II", rank: "Rare", title: "Istiqomah", desc: "Selesaikan 750 Misi Harian", reqType: "quest", reqAmount: 350, rewardSkin: "card_holo", rewardName: "Holo Card", color: "from-blue-400 to-indigo-600", bgDark: "bg-blue-900/20", borderDark: "border-blue-500/30" },
    { id: "sq3", tier: "III", rank: "Epic", title: "Sepuh Tasbih", desc: "Capai 10.000x Total Dzikir", reqType: "tasbih", reqAmount: 10000, rewardSkin: "tasbih-glow", rewardName: "Neon Tasbih", color: "from-purple-500 to-fuchsia-600", bgDark: "bg-purple-900/20", borderDark: "border-purple-500/30" },
    { id: "sq4", tier: "IV", rank: "Legendary", title: "Naga Epikal", desc: "Kalahkan 100 Boss Epikal", reqType: "epic", reqAmount: 15, rewardSkin: "card_crown", rewardName: "Crown Card", color: "from-orange-500 to-red-600", bgDark: "bg-orange-900/20", borderDark: "border-orange-500/30" },
    { id: "sq5", tier: "V", rank: "Mythic", title: "Dewa Tasbih", desc: "Capai 50.000x Total Dzikir", reqType: "tasbih", reqAmount: 50000, rewardSkin: "tasbih-gold", rewardName: "Gold Tasbih", color: "from-yellow-400 to-amber-600", bgDark: "bg-yellow-900/20", borderDark: "border-yellow-500/30" }
];

let safeState;
try { safeState = JSON.parse(localStorage.getItem('amalpadState')); } catch(e) { safeState = null; }

window.playerState = safeState || {
    name: "Skena Newbie", bio: "Baru mulai hijrah jalur langit.", avatar: null,
    exp: 0, history: Array(28).fill(0), lastLoginDate: null,
    radar: { pusat: 10, aura: 10, peka: 10, sigma: 10, derma: 10, stoic: 10 },
    streak: { count: 0, lastClickDate: null, shields: 0 },
    stats: { tasbihTotal: 0, questsCompleted: 0, epicCompleted: 0 },
    activeSkins: { tasbih: 'default', card: 'card_dark' }
};

if(!window.playerState.streak) window.playerState.streak = { count: 0, lastClickDate: null, shields: 0 };
if(!window.playerState.stats) window.playerState.stats = { tasbihTotal: 0, questsCompleted: 0, epicCompleted: 0 };
if(!window.playerState.activeSkins) window.playerState.activeSkins = { tasbih: 'default', card: 'card_dark' };
if(!window.playerState.lastLoginDate) window.playerState.lastLoginDate = new Date().toDateString();

window.saveState = function() { localStorage.setItem('amalpadState', JSON.stringify(window.playerState)); };

window.updateHeader = function() {
    const currentExp = window.playerState.exp;
    const currentLevel = Math.floor(currentExp / 1000) + 1;
    const expProgress = currentExp % 1000;
    const progressPercent = (expProgress / 1000) * 100;
    
    const lvlBadge = document.getElementById('header-level'); if(lvlBadge) lvlBadge.innerText = `Lv. ${currentLevel}`;
    const expBar = document.getElementById('header-exp-bar'); if(expBar) expBar.style.width = `${progressPercent}%`;
    const streakCount = document.getElementById('header-streak-count'); if(streakCount) streakCount.innerText = window.playerState.streak.count;
    const streakShield = document.getElementById('header-streak-shield'); if(streakShield) streakShield.innerText = window.playerState.streak.shields;
    
    const av = document.getElementById('header-avatar');
    if(av) {
        if(window.playerState.avatar) av.innerHTML = `<img src="${window.playerState.avatar}" class="w-full h-full object-cover">`;
        else av.innerHTML = window.playerState.name.charAt(0).toUpperCase();
    }
};

window.checkDailyReset = function() {
    const todayStr = new Date().toDateString();
    let needsCloudSync = false; // Deteksi jika ada perubahan data akibat reset

    if (window.playerState.lastLoginDate !== todayStr) {
        const lastDate = new Date(window.playerState.lastLoginDate);
        const today = new Date(todayStr);
        const diffDays = Math.floor(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24)); 
        if(diffDays > 0) {
            for(let i=0; i<Math.min(diffDays, 28); i++) {
                window.playerState.history.shift(); window.playerState.history.push(0);
            }
            localStorage.setItem('penaltyMultiplier', 1); 
        }
        window.playerState.lastLoginDate = todayStr; window.saveState();
        needsCloudSync = true;
    }
    
    const lastStreak = window.playerState.streak.lastClickDate;
    if (lastStreak && lastStreak !== todayStr) {
        const lastDate = new Date(lastStreak); const today = new Date(todayStr);
        const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24)); 
        if (diffDays > 1) { 
            if (window.playerState.streak.shields > 0) {
                window.playerState.streak.shields--;
                window.playerState.streak.lastClickDate = new Date(today.getTime() - 24*60*60*1000).toDateString();
                window.showToast("Streak diselamatkan oleh Shield! 🛡️", "success");
            } else {
                window.playerState.streak.count = 0; window.showToast("Streak reset karena terlewat 💔", "error");
            }
            window.saveState();
            needsCloudSync = true;
        }
    }

    // --- CLOUD SAVE: Sync jika terjadi reset harian ---
    if (needsCloudSync && typeof window.saveDataKeCloud === 'function') {
        window.saveDataKeCloud({
            history: window.playerState.history,
            streak: window.playerState.streak,
            lastLoginDate: window.playerState.lastLoginDate
        });
    }

    window.updateHeader();
};

window.claimStreak = function() {
    const todayStr = new Date().toDateString();
    if (window.playerState.streak.lastClickDate === todayStr) { 
        window.showToast("Sudah claim streak hari ini ngab! 🔥", "error"); 
        if(navigator.vibrate) navigator.vibrate([20, 50, 20]); return; 
    }
    
    window.playerState.streak.count++; window.playerState.streak.lastClickDate = todayStr;
    if (window.playerState.streak.count % 7 === 0) {
        window.playerState.streak.shields++; window.showToast("7 Hari Berturut! Dapet 1 Shield 🛡️", "epic");
    } else { window.showToast(`Streak Naik! 🔥 ${window.playerState.streak.count} Hari`, "success"); }
    
    if(navigator.vibrate) navigator.vibrate(50);
    if(typeof confetti === 'function') confetti({ particleCount: 50, spread: 60, origin: { y: 0.1 } });
    
    window.saveState(); 
    
    // --- CLOUD SAVE: Simpan Streak ---
    if (typeof window.saveDataKeCloud === 'function') {
        window.saveDataKeCloud({ streak: window.playerState.streak });
    }

    window.updateHeader();
};

window.addExp = function(amount, isQuest = true) {
    window.playerState.exp += amount;
    if(isQuest) window.playerState.stats.questsCompleted++;
    window.playerState.history[27] = Math.min(4, window.playerState.history[27] + 1);
    window.saveState(); window.updateHeader();
    if(document.getElementById('view-stats').style.display === 'block') { 
        window.renderProfileTexts(); window.renderHeatmap(); window.renderAchievements(); window.renderSkinCollection(); 
    }
    window.renderSpecialQuests();
};

// ==========================================================================
// FUNGSI BARU: Uncapped Radar Stat
// ==========================================================================
window.addRadarStat = function(stat, amount) {
    if(window.playerState.radar[stat] !== undefined) {
        // UNCAP LIMIT: Poin sekarang bisa tembus infinite
        window.playerState.radar[stat] = window.playerState.radar[stat] + amount;
        window.saveState();
        if(document.getElementById('view-stats').style.display === 'block') { 
            window.renderRadarChart('main'); 
            window.renderAchievements(); 
        }
    }
};

window.switchTab = function(tabId) {
    const viewQuest = document.getElementById('view-quest'), viewStats = document.getElementById('view-stats');
    const btnQuest = document.getElementById('nav-btn-quest'), btnStats = document.getElementById('nav-btn-stats');
    if(navigator.vibrate) navigator.vibrate(15);

    if(tabId === 'quest') {
        if(viewQuest) viewQuest.style.display = 'block'; if(viewStats) viewStats.style.display = 'none';
        if(btnQuest) { btnQuest.className = "nav-btn text-emerald-500 flex flex-col items-center p-2 transition-all duration-300 w-24 active:scale-90 scale-105"; btnQuest.querySelector('span:first-child').className = "text-[26px] mb-1.5 filter drop-shadow-sm transition-transform duration-300"; }
        if(btnStats) { btnStats.className = "nav-btn text-gray-400 dark:text-gray-500 flex flex-col items-center p-2 transition-all duration-300 w-24 active:scale-90"; btnStats.querySelector('span:first-child').className = "text-[26px] mb-1.5 filter drop-shadow-sm grayscale opacity-50 transition-all duration-300"; }
    } else {
        if(viewStats) viewStats.style.display = 'block'; if(viewQuest) viewQuest.style.display = 'none';
        if(btnStats) { btnStats.className = "nav-btn text-emerald-500 flex flex-col items-center p-2 transition-all duration-300 w-24 active:scale-90 scale-105"; btnStats.querySelector('span:first-child').className = "text-[26px] mb-1.5 filter drop-shadow-sm transition-transform duration-300"; }
        if(btnQuest) { btnQuest.className = "nav-btn text-gray-400 dark:text-gray-500 flex flex-col items-center p-2 transition-all duration-300 w-24 active:scale-90"; btnQuest.querySelector('span:first-child').className = "text-[26px] mb-1.5 filter drop-shadow-sm grayscale opacity-50 transition-all duration-300"; }
        
        window.renderProfileTexts(); window.renderHeatmap(); window.renderAchievements(); window.init3DCard(); window.renderSkinCollection();
        setTimeout(() => window.renderRadarChart('main'), 50); 
    }
};

let isDark = localStorage.getItem('theme') === 'dark';
if(isDark) document.documentElement.classList.add('dark');

window.openSettings = () => {
    if(navigator.vibrate) navigator.vibrate(15);
    const themeStatus = document.getElementById('theme-status-text'); if(themeStatus) themeStatus.innerText = isDark ? "Dark Mode" : "Light Mode";
    const m = document.getElementById('settings-modal'), c = document.getElementById('settings-content'); 
    if(m && c) { m.classList.remove('hidden'); m.classList.add('flex'); setTimeout(() => { m.classList.remove('opacity-0'); c.classList.remove('scale-95'); }, 10); }
};
window.closeSettings = () => { 
    const m = document.getElementById('settings-modal'), c = document.getElementById('settings-content'); 
    if(m && c) { c.classList.add('scale-95'); m.classList.add('opacity-0'); setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300); }
};

const themeBtn = document.getElementById('theme-toggle-btn');
if(themeBtn) {
    themeBtn.addEventListener('click', () => {
        if(navigator.vibrate) navigator.vibrate(15);
        document.documentElement.classList.toggle('dark'); isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        const themeStatus = document.getElementById('theme-status-text'); if(themeStatus) themeStatus.innerText = isDark ? "Dark Mode" : "Light Mode";
        const viewStats = document.getElementById('view-stats'); if(viewStats && viewStats.style.display === 'block') setTimeout(() => window.renderRadarChart('main'), 50);
    });
}

window.hardRefresh = () => { 
    if(navigator.vibrate) navigator.vibrate([20, 50, 20]);
    window.showToast("Memaksa sinkronisasi engine...", "success"); setTimeout(() => { window.location.reload(true); }, 800); 
};

window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toast-container'); if(!container) return;
    const toastId = 'toast-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    let bgClass = type === 'success' ? 'bg-emerald-500' : type === 'epic' ? 'bg-purple-600' : 'bg-rose-500';
    let icon = type === 'success' ? '✅' : type === 'epic' ? '🐉' : '⚠️';
    const html = `<div id="${toastId}" class="toast-enter ${bgClass} text-white px-4 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-md w-max max-w-full pointer-events-auto"><span class="text-xl drop-shadow-md">${icon}</span><span class="text-xs font-bold tracking-wide leading-tight">${message}</span></div>`;
    container.insertAdjacentHTML('beforeend', html);
    setTimeout(() => { const el = document.getElementById(toastId); if(el) { el.classList.remove('toast-enter'); el.classList.add('toast-exit'); setTimeout(() => { el.style.display = 'none'; el.remove(); }, 400); } }, 3000);
};

window.initDailyCountdown = function() {
    setInterval(() => {
        const now = new Date(); const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); const diff = tomorrow - now;
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)); const s = Math.floor((diff % (1000 * 60)) / 1000);
        const timerEl = document.getElementById('daily-countdown'); if(timerEl) timerEl.innerText = `⏳ Reset: ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }, 1000);
};

window.verifyServerTime = function() {
    const statusEl = document.getElementById('server-time-status');
    if(statusEl) {
        statusEl.innerHTML = `<span class="w-2 h-2 bg-yellow-500 rounded-full animate-ping shadow-[0_0_5px_#eab308]"></span> Menyesuaikan jam...`;
        setTimeout(() => {
            statusEl.innerHTML = `<span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]"></span> Sinkronisasi Real-Time ✓`;
            statusEl.classList.replace('text-gray-500', 'text-emerald-600'); statusEl.classList.replace('dark:text-gray-400', 'dark:text-emerald-400');
        }, 1200);
    }
};

window.initDailyQuestData = function() {
    const todayStr = new Date().toDateString(); const lastSeed = localStorage.getItem('questSeedDate');
    if (lastSeed !== todayStr) {
        const shuffle = (arr) => { let newArr = [...arr]; for (let i = newArr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [newArr[i], newArr[j]] = [newArr[j], newArr[i]]; } return newArr; };
        localStorage.setItem('dailyKejutan', JSON.stringify(shuffle(POOL_KEJUTAN).slice(0, 1))); 
        localStorage.setItem('dailyHabits', JSON.stringify(shuffle(POOL_HABITS).slice(0, 5))); 
        localStorage.setItem('dailyEpic', JSON.stringify(shuffle(POOL_EPIKAL)[0])); 
        localStorage.setItem('questSeedDate', todayStr);
    }
};

window.handleSholatClick = function(id, isActive, isFuture, isDone) {
    if (isDone) return;
    if (isFuture) { window.showToast("⏳ Belum masuk waktunya ngab!", "error"); if(navigator.vibrate) navigator.vibrate([30, 50, 30]); return; }
    if (!isActive) return; 
    
    const todayStr = new Date().toDateString(); const checkbox = document.getElementById(id);
    if(checkbox) {
        if (!checkbox.checked) { checkbox.checked = true; return; }
        localStorage.setItem(`${id}_${todayStr}`, 'true'); checkbox.disabled = true; localStorage.setItem('penaltyMultiplier', 1);
        window.addExp(parseInt(checkbox.dataset.exp)); window.addRadarStat(checkbox.dataset.type, 5);
        window.showToast("Alhamdulillah selesai! Multiplier Penalti direset.", "success");
        if(navigator.vibrate) navigator.vibrate(50); if(typeof confetti === 'function') confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
        
        // --- CLOUD SAVE: Pengerjaan Sholat ---
        if (typeof window.saveDataKeCloud === 'function') {
            window.saveDataKeCloud({ exp: window.playerState.exp, radar: window.playerState.radar, stats: window.playerState.stats });
        }

        window.renderSholatWajib();
    }
}

window.renderSholatWajib = function() {
    const container = document.getElementById('sholat-wajib-container'); if(!container) return;
    const currentHour = new Date().getHours(); const todayStr = new Date().toDateString();
    let penaltyMultiplier = parseInt(localStorage.getItem('penaltyMultiplier')) || 1;
    const multText = document.getElementById('penalty-multiplier-text'); if(multText) multText.innerText = `Multiplier: ${penaltyMultiplier}x`;
    let html = ''; 
    
    window.sholatWajib.forEach(q => {
        const isDone = localStorage.getItem(`${q.id}_${todayStr}`) === 'true'; 
        const isActive = currentHour >= q.start && currentHour < q.end; const isPast = currentHour >= q.end; const isFuture = currentHour < q.start;

        let statusUI = ""; let cardClass = "";
        if (isDone) { statusUI = `<span class="text-emerald-500 font-black text-[10px] flex items-center gap-1.5"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Kelar Skuy (+${q.exp})</span>`; cardClass = "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 opacity-70 grayscale-[20%]"; } 
        else if (isActive) { statusUI = `<span class="text-emerald-600 dark:text-emerald-400 font-black text-[10px] animate-pulse flex items-center gap-1.5"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> GAS SEKARANG</span>`; cardClass = "bg-white dark:bg-gray-800 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] transform scale-[1.02] z-10 ring-1 ring-emerald-500/50"; } 
        else if (isPast) { 
            let penaltyAmount = q.exp * penaltyMultiplier; statusUI = `<span class="text-rose-600 dark:text-rose-400 font-black text-[10px] flex items-center gap-1.5"><span class="text-lg leading-none">❌</span> Terlewat (-${penaltyAmount} EXP)</span>`; cardClass = "bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20 opacity-60 grayscale-[40%]";
            if (localStorage.getItem(`penalty_applied_${q.id}_${todayStr}`) !== 'true') {
                localStorage.setItem(`penalty_applied_${q.id}_${todayStr}`, 'true'); window.playerState.exp = Math.max(0, window.playerState.exp - penaltyAmount); window.saveState(); window.updateHeader();
                penaltyMultiplier++; localStorage.setItem('penaltyMultiplier', penaltyMultiplier); window.showToast(`Waktu ${q.title} terlewat! Penalti.`, 'error');
            }
        } 
        else if (isFuture) { statusUI = `<span class="text-gray-400 dark:text-gray-500 font-bold text-[10px] flex items-center gap-1.5"><span class="text-sm leading-none">⏳</span> ${q.start.toString().padStart(2,'0')}:00</span>`; cardClass = "bg-gray-100 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/50 opacity-80 cursor-not-allowed"; }
        
        const isInputDisabled = !isActive || isDone ? 'disabled' : '';
        html += `<div onclick="window.handleSholatClick('${q.id}', ${isActive}, ${isFuture}, ${isDone})" class="flex items-center justify-between p-4 rounded-[1.2rem] border-2 transition-all duration-300 ${!isInputDisabled && !isFuture ? 'cursor-pointer group hover:border-emerald-400' : ''} ${cardClass}"><div class="flex items-center gap-4"><div class="relative flex items-center justify-center pointer-events-none"><input type="checkbox" id="${q.id}" class="w-7 h-7 text-emerald-500 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-emerald-500 focus:ring-2 transition appearance-none checked:bg-emerald-500 checked:border-transparent sholat-item" ${isInputDisabled} ${isDone ? 'checked' : ''} data-exp="${q.exp}" data-type="${q.type}">${isDone ? '<span class="absolute text-white font-black text-sm">✓</span>' : ''}</div><div><span class="block font-black text-sm text-gray-900 dark:text-gray-100 tracking-wide">${q.title}</span>${statusUI}</div></div></div>`;
    });
    container.innerHTML = html;
};

const createMissionCard = (m, typeClass, isDone) => {
    let badgeWajib = m.wajib ? `<span class="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase ml-2 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse">Wajib</span>` : '';
    let badgeDiff = m.diff ? `<span class="${m.diff === 'hard' ? 'bg-rose-500' : m.diff === 'normal' ? 'bg-orange-500' : 'bg-emerald-500'} text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase ml-2">${m.diff}</span>` : '';
    const doneClassVertical = isDone ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-500/30 opacity-70" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm";
    return `<label class="flex items-center justify-between p-4 rounded-[1.2rem] border transition-all cursor-pointer ${doneClassVertical} hover:border-gray-400 dark:hover:border-gray-500 active:scale-[0.98]"><div class="flex items-center gap-3.5"><div class="relative flex items-center justify-center"><input type="checkbox" id="${m.id}" class="w-6 h-6 text-emerald-500 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded-md focus:ring-emerald-500 transition appearance-none checked:bg-emerald-500 checked:border-transparent ${typeClass}" ${isDone ? 'checked disabled' : ''} data-exp="${m.exp}" data-type="${m.stat}">${isDone ? '<span class="absolute text-white font-black text-[10px] pointer-events-none">✓</span>' : ''}</div><div><div class="flex items-center"><span class="block font-bold text-sm text-gray-800 dark:text-gray-200">${m.title}</span>${badgeWajib}${badgeDiff}</div><span class="text-[9px] font-black text-gray-400 uppercase mt-1 inline-block text-emerald-500 tracking-wide">+${m.exp} EXP • Stat: ${m.stat}</span></div></div></label>`;
};

window.renderMissions = function() {
    const todayStr = new Date().toDateString();
    const dailyKejutan = JSON.parse(localStorage.getItem('dailyKejutan') || '[]'); const containerKejutan = document.getElementById('kejutan-container');
    if(containerKejutan) {
        if (!(localStorage.getItem(`kejutanOpened_${todayStr}`) === 'true')) containerKejutan.innerHTML = `<div onclick="window.openMysteryMission()" class="bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-purple-500/50 rounded-[1.5rem] p-6 text-center cursor-pointer mystery-box relative overflow-hidden group w-full shadow-lg"><div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div><span class="text-5xl mb-3 block group-hover:animate-shake drop-shadow-xl">🎁</span><h4 class="text-white font-black text-sm uppercase tracking-widest mb-1">Misi Misteri Hari Ini</h4><p class="text-[10px] text-purple-300 font-medium tracking-wide">Berani ngetest niatmu? Klik untuk buka takdir kebaikanmu!</p></div>`;
        else containerKejutan.innerHTML = dailyKejutan.map(m => createMissionCard(m, 'kejutan-item', localStorage.getItem(`${m.id}_${todayStr}`) === 'true')).join('');
    }
    const dailyHabits = JSON.parse(localStorage.getItem('dailyHabits') || '[]'); const containerHabits = document.getElementById('habits-container');
    if(containerHabits) containerHabits.innerHTML = dailyHabits.map(m => createMissionCard(m, 'habit-item', localStorage.getItem(`${m.id}_${todayStr}`) === 'true')).join('');

    document.querySelectorAll('.kejutan-item, .habit-item').forEach(box => {
        box.addEventListener('change', function() {
            if (!this.checked) { this.checked = true; return; }
            localStorage.setItem(`${this.id}_${todayStr}`, 'true'); this.disabled = true; 
            window.addExp(parseInt(this.dataset.exp)); window.addRadarStat(this.dataset.type, 2);
            window.showToast(`Gacor! +${this.dataset.exp} EXP Didapatkan.`, 'success');
            if(navigator.vibrate) navigator.vibrate(20);
            if(typeof confetti === 'function') confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
            
            // --- CLOUD SAVE: Pengerjaan Misi & Habit ---
            if (typeof window.saveDataKeCloud === 'function') {
                window.saveDataKeCloud({ exp: window.playerState.exp, radar: window.playerState.radar, stats: window.playerState.stats });
            }

            window.renderMissions(); window.checkEpicUnlock();
        });
    });
};

window.openMysteryMission = function() {
    const todayStr = new Date().toDateString(); localStorage.setItem(`kejutanOpened_${todayStr}`, 'true');
    if(navigator.vibrate) navigator.vibrate([30, 80, 30]);
    if(typeof confetti === 'function') confetti({ particleCount: 100, spread: 80, zIndex: 9999, colors: ['#f97316', '#a855f7'] });
    window.showToast("Misi Misteri Terungkap!", "epic"); window.renderMissions();
};

window.checkEpicUnlock = function() {
    const todayStr = new Date().toDateString();
    const dailyKejutan = JSON.parse(localStorage.getItem('dailyKejutan') || '[]'); const dailyHabits = JSON.parse(localStorage.getItem('dailyHabits') || '[]');
    const allKejutanDone = dailyKejutan.every(m => localStorage.getItem(`${m.id}_${todayStr}`) === 'true'); const allHabitsDone = dailyHabits.every(m => localStorage.getItem(`${m.id}_${todayStr}`) === 'true');
    const wrapper = document.getElementById('epic-mission-wrapper'), overlay = document.getElementById('epic-lock-overlay'), container = document.getElementById('epic-container');
    if(!wrapper || !overlay || !container) return;

    if (allKejutanDone && allHabitsDone && dailyKejutan.length > 0) {
        if(!wrapper.classList.contains('epic-unlocked')) { 
            wrapper.classList.add('epic-unlocked'); overlay.classList.add('opacity-0', 'pointer-events-none'); 
            window.showToast("🔥 EPIC BOSS FIGHT TERBUKA! 🔥", "epic"); if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
        const epicData = JSON.parse(localStorage.getItem('dailyEpic')); const isDone = localStorage.getItem(`${epicData.id}_${todayStr}`) === 'true';
        container.innerHTML = `<div class="bg-black/40 rounded-[1.2rem] p-4.5 border border-purple-500/50 backdrop-blur-md relative z-10 ${isDone ? 'opacity-50 grayscale' : ''}"><div class="flex justify-between items-center mb-2.5"><h4 class="font-black text-lg text-white tracking-wide">${epicData.title}</h4><div class="relative flex items-center justify-center"><input type="checkbox" id="${epicData.id}" class="w-8 h-8 text-purple-600 bg-gray-900 border-purple-500 rounded-xl focus:ring-purple-500 transition appearance-none checked:bg-purple-600 checked:border-transparent epic-item cursor-pointer" ${isDone ? 'checked disabled' : ''} data-exp="${epicData.exp}" data-type="${epicData.stat}">${isDone ? '<span class="absolute text-white font-black pointer-events-none">✓</span>' : ''}</div></div><p class="text-xs text-purple-200 italic mb-4">"${epicData.desc}"</p><div class="inline-block bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-black text-[10px] px-3.5 py-1.5 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.6)] uppercase tracking-widest">+${epicData.exp} EXP</div></div>`;
        document.querySelectorAll('.epic-item').forEach(box => {
            box.addEventListener('change', function() {
                if (!this.checked) { this.checked = true; return; }
                localStorage.setItem(`${this.id}_${todayStr}`, 'true'); this.disabled = true; 
                window.playerState.stats.epicCompleted++; window.addExp(parseInt(this.dataset.exp)); window.addRadarStat(this.dataset.type, 10);
                window.showToast("LEGENDARY! Misi Epikal Diselesaikan!", "epic");
                if(navigator.vibrate) navigator.vibrate([100, 50, 200]);
                if(typeof confetti === 'function') confetti({ particleCount: 300, spread: 150, zIndex: 9999, colors: ['#9333ea', '#a855f7', '#fbbf24'] });
                
                // --- CLOUD SAVE: Misi Epikal ---
                if (typeof window.saveDataKeCloud === 'function') {
                    window.saveDataKeCloud({ exp: window.playerState.exp, radar: window.playerState.radar, stats: window.playerState.stats });
                }

                window.checkEpicUnlock(); 
            });
        });
    } else { wrapper.classList.remove('epic-unlocked'); overlay.classList.remove('opacity-0', 'pointer-events-none'); container.innerHTML = ''; }
};

window.renderSpecialQuests = function() {
    const container = document.getElementById('special-quests-container'); if(!container) return;
    const s = window.playerState.stats;
    
    container.innerHTML = SPECIAL_QUESTS.map(sq => {
        let current = 0; if(sq.reqType === 'quest') current = s.questsCompleted; else if(sq.reqType === 'epic') current = s.epicCompleted; else if(sq.reqType === 'tasbih') current = s.tasbihTotal;
        const isDone = current >= sq.reqAmount; const percent = Math.min((current / sq.reqAmount) * 100, 100);
        const bgClass = isDone ? `${sq.bgDark} border ${sq.borderDark}` : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
        return `<div class="p-4 rounded-[1.2rem] border ${bgClass} shadow-sm relative overflow-hidden transition-all duration-300"><div class="flex justify-between items-center mb-1"><span class="text-[8px] font-black text-gray-500 tracking-[0.2em] uppercase">TIER ${sq.tier} : ${sq.rank}</span>${isDone ? `<span class="text-[8px] font-black bg-gradient-to-r ${sq.color} text-white px-2 py-0.5 rounded shadow-sm">UNLOCKED</span>` : `<span class="text-[9px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded">${current.toLocaleString('id-ID')}/${sq.reqAmount.toLocaleString('id-ID')}</span>`}</div><h4 class="font-bold text-sm text-gray-900 dark:text-white mb-3">${sq.title}</h4><div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden shadow-inner mb-2.5"><div class="bg-gradient-to-r ${sq.color} h-full transition-all duration-1000 ease-out" style="width:${percent}%"></div></div><div class="flex justify-between items-center"><p class="text-[9px] text-gray-500 dark:text-gray-400 font-medium">${sq.desc}</p><p class="text-[9px] font-bold uppercase tracking-widest text-gray-900 dark:text-white">Reward: <span class="bg-clip-text text-transparent bg-gradient-to-r ${sq.color}">${sq.rewardName}</span></p></div></div>`;
    }).join('');
};

window.initTasbih = function() {
    const btn = document.getElementById('btn-tasbih'), counterText = document.getElementById('tasbih-counter-text'), selector = document.getElementById('tasbih-type'), bar = document.getElementById('tasbih-bar'), targetText = document.getElementById('tasbih-target-text'), resetBtn = document.getElementById('tasbih-reset'), antiCheatOverlay = document.getElementById('anti-cheat-overlay'), comboBadge = document.getElementById('tasbih-combo-badge');
    if(!btn || !selector) return;
    
    btn.className = `skin-${window.playerState.activeSkins.tasbih} relative z-10 mt-2 w-44 h-44 rounded-full border-[10px] text-6xl font-black shadow-[20px_20px_40px_rgba(0,0,0,0.08),-20px_-20px_40px_rgba(255,255,255,0.9)] dark:shadow-[15px_15px_30px_rgba(0,0,0,0.4),-15px_-15px_30px_rgba(255,255,255,0.03)] active:shadow-[inset_15px_15px_30px_rgba(0,0,0,0.1),inset_-15px_-15px_30px_rgba(255,255,255,0.8)] dark:active:shadow-[inset_15px_15px_30px_rgba(0,0,0,0.5),inset_-15px_-15px_30px_rgba(255,255,255,0.02)] transform transition-all duration-100 active:scale-[0.96] flex items-center justify-center bg-gray-50 dark:bg-gray-800 select-none cursor-pointer overflow-hidden`;

    let currentType = selector.value, target = 33, count = 0, lastTapTime = 0, comboMultiplier = 0; const todayStr = new Date().toDateString(); let tapIntervals = [];
    const getTypeTarget = (val) => { if(val === 'istighfar') return 100; if(val === 'sholawat') return 1000; return 33; };
    const updateTasbihUI = () => { if(counterText) counterText.innerText = count; if(targetText) targetText.innerText = `${count} / ${target}`; if(bar) bar.style.width = `${Math.min((count / target) * 100, 100)}%`; };

    window.resolveCaptcha = function() { if(antiCheatOverlay) antiCheatOverlay.classList.add('hidden'); tapIntervals = []; comboMultiplier = 0; if(comboBadge) comboBadge.classList.add('hidden'); }

    selector.addEventListener('change', (e) => { currentType = e.target.value; target = getTypeTarget(currentType); count = parseInt(localStorage.getItem(`tasbih_${currentType}`) || 0); comboMultiplier = 0; if(comboBadge) comboBadge.classList.add('hidden'); updateTasbihUI(); });

    btn.addEventListener('click', (e) => {
        const now = Date.now();
        if (lastTapTime > 0) {
            let interval = now - lastTapTime; tapIntervals.push(interval); if(tapIntervals.length > 8) tapIntervals.shift();
            if(tapIntervals.length === 8) {
                const mean = tapIntervals.reduce((a,b)=>a+b)/8; const variance = tapIntervals.reduce((a,b)=>a + Math.pow(b-mean, 2), 0)/8;
                if(variance < 30 && mean < 400) { if(antiCheatOverlay) antiCheatOverlay.classList.remove('hidden'); if(navigator.vibrate) navigator.vibrate([100, 50, 100]); return; }
            }
        }
        if (now - lastTapTime < 1500) comboMultiplier++; else comboMultiplier = 1; lastTapTime = now;
        
        if (comboMultiplier >= 5) { 
            if(comboBadge) { comboBadge.innerText = `🔥 ${comboMultiplier}x Combo!`; comboBadge.classList.remove('hidden', 'combo-active'); void comboBadge.offsetWidth; comboBadge.classList.add('combo-active'); }
        } else { if(comboBadge) comboBadge.classList.add('hidden'); }

        const ripple = document.createElement('div'); ripple.className = 'ripple-effect'; btn.appendChild(ripple); setTimeout(() => ripple.remove(), 500);
        const floatEl = document.createElement('span'); floatEl.className = 'floating-tap'; floatEl.innerText = '+1'; btn.appendChild(floatEl); setTimeout(() => floatEl.remove(), 600);
        
        count++; localStorage.setItem(`tasbih_${currentType}`, count); 
        window.playerState.stats.tasbihTotal++; window.saveState(); 
        
        const viewStats = document.getElementById('view-stats'); if(viewStats && viewStats.style.display === 'block') window.renderSpecialQuests(); 
        if(navigator.vibrate) navigator.vibrate(10); 
        updateTasbihUI();

        let dailyRewards = JSON.parse(localStorage.getItem(`tasbihRewards_${todayStr}`)) || { '33': false, '100': false, '1000': false };
        
        // --- CLOUD SAVE: Momen Milestone Tasbih ---
        if (count === 33 && !dailyRewards['33']) { 
            window.addExp(10, false); window.showToast("Target 33x Tercapai! +10 EXP ✨", "success"); dailyRewards['33'] = true; 
            if(typeof confetti === 'function') confetti({ particleCount: 50 }); 
            if (typeof window.saveDataKeCloud === 'function') window.saveDataKeCloud({ exp: window.playerState.exp, stats: window.playerState.stats });
        } 
        else if (count === 100 && !dailyRewards['100']) { 
            window.addExp(30, false); window.showToast("Luar Biasa! 100x Tercapai! +30 EXP 🚀", "success"); dailyRewards['100'] = true; 
            if(typeof confetti === 'function') confetti({ particleCount: 100 }); 
            if (typeof window.saveDataKeCloud === 'function') window.saveDataKeCloud({ exp: window.playerState.exp, stats: window.playerState.stats });
        } 
        else if (count === 1000 && !dailyRewards['1000']) { 
            window.addExp(100, false); window.showToast("LEGENDARIS! 1000x Tercapai! +100 EXP 👑", "epic"); dailyRewards['1000'] = true; 
            if(typeof confetti === 'function') confetti({ particleCount: 200, spread: 150, zIndex: 9999 }); 
            if (typeof window.saveDataKeCloud === 'function') window.saveDataKeCloud({ exp: window.playerState.exp, stats: window.playerState.stats });
        }
        localStorage.setItem(`tasbihRewards_${todayStr}`, JSON.stringify(dailyRewards));
        
        if (count === target) { comboMultiplier = 0; if(comboBadge) comboBadge.classList.add('hidden'); }
    });

    if(resetBtn) { 
        resetBtn.addEventListener('click', () => { 
            if(navigator.vibrate) navigator.vibrate(20); 
            
            // --- CLOUD SAVE: Simpan hitungan terakhir sebelum di-reset ---
            if (typeof window.saveDataKeCloud === 'function') {
                window.saveDataKeCloud({ stats: window.playerState.stats });
            }

            count = 0; comboMultiplier = 0; if(comboBadge) comboBadge.classList.add('hidden'); localStorage.setItem(`tasbih_${currentType}`, 0); updateTasbihUI(); 
        }); 
    }
    target = getTypeTarget(currentType); count = parseInt(localStorage.getItem(`tasbih_${currentType}`) || 0); updateTasbihUI();
};
