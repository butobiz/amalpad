// js/firebase-auth.js

// 1. Import modul Firebase v12.10.0 melalui CDN (Standar PWA tanpa bundler)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    child, 
    update 
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

// 2. Konfigurasi Firebase TERBARU (Menggunakan Realtime Database)
const firebaseConfig = {
    apiKey: "AIzaSyAmmWk4FKLjAGdfMPAVszgPJMdLc9qJY98",
    authDomain: "amalpad-app.firebaseapp.com",
    databaseURL: "https://amalpad-app-default-rtdb.firebaseio.com",
    projectId: "amalpad-app",
    storageBucket: "amalpad-app.firebasestorage.app",
    messagingSenderId: "344360349317",
    appId: "1:344360349317:web:efc5ffea5f28444ee443ec",
    measurementId: "G-KB3T44DZ22"
};

// 3. Inisialisasi Firebase & Realtime Database
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app); 
const provider = new GoogleAuthProvider();

// 4. Fungsi Login & Logout
window.loginDenganGoogle = async () => {
    try {
        await signInWithPopup(auth, provider);
        // Notifikasi sukses ditangani oleh observer onAuthStateChanged
    } catch (error) {
        console.error("Error login:", error);
        if (typeof window.showToast === 'function') {
            window.showToast("Gagal login: " + error.message, 'error');
        } else {
            alert("Gagal login: " + error.message);
        }
    }
};

window.logoutAkun = async () => {
    try {
        await signOut(auth);
        if (typeof window.showToast === 'function') {
            window.showToast("Berhasil keluar dari akun.", 'success');
        } else {
            alert("Berhasil keluar dari akun.");
        }
        // Jeda 1 detik agar animasi Toast selesai sebelum halaman di-refresh
        setTimeout(() => { window.location.reload(); }, 1000); 
    } catch (error) {
        console.error("Error logout:", error);
    }
};

// ==========================================
// 5. SISTEM CLOUD SAVE (REALTIME DATABASE)
// ==========================================
window.saveDataKeCloud = async (dataBaru) => {
    const user = auth.currentUser;
    if (!user) return; 

    try {
        // Gunakan update() agar data lama tidak terhapus (hanya menimpa yang berubah)
        await update(ref(db, 'users/' + user.uid), dataBaru);
        console.log("Data berhasil diamankan ke Jalur Langit! (RTDB) ☁️✓");
    } catch (error) {
        console.error("Gagal save ke cloud:", error);
    }
};

// 6. Listener Status Login
onAuthStateChanged(auth, async (user) => {
    const btnLogin = document.getElementById('btn-google-login');
    const headerAvatar = document.getElementById('header-avatar');
    const statsUsername = document.getElementById('stats-username');

    if (user) {
        // --- JIKA LOGIN BERHASIL ---
        console.log("User terdeteksi:", user.uid);
        
        // Update UI Profil
        if (headerAvatar) {
            headerAvatar.innerHTML = `<img src="${user.photoURL}" class="w-full h-full object-cover rounded-full border-2 border-white dark:border-gray-800" alt="Avatar">`;
        }
        if (statsUsername) statsUsername.innerText = user.displayName;
        if (btnLogin) {
            btnLogin.innerHTML = `<span>🚪</span> Keluar Akun`;
            btnLogin.onclick = window.logoutAkun;
            btnLogin.classList.replace('text-blue-600', 'text-rose-600');
        }

        // --- TARIK DATA DARI RTDB ---
        const dbRef = ref(db);
        try {
            const snapshot = await get(child(dbRef, `users/${user.uid}`));
            
            if (snapshot.exists()) {
                const dataUser = snapshot.val();
                console.log("Data user ditemukan:", dataUser);
                
                // Panggil fungsi render UI jika kamu sudah menyiapkannya (seperti di stats.js)
                if (typeof window.loadDataDariCloud === 'function') {
                    window.loadDataDariCloud(dataUser);
                }
                
                if (typeof window.showToast === 'function') {
                    window.showToast(`Selamat datang kembali, ${user.displayName}! Data disinkron.`, 'success');
                } else {
                    alert(`Selamat datang kembali, ${user.displayName}! Data dari cloud ditarik.`);
                }
                
            } else {
                console.log("User baru! Membuat profil kosong di RTDB...");
                const dataAwal = {
                    nama: user.displayName,
                    email: user.email,
                    level: 1,
                    exp: 0,
                    totalTasbih: 0,
                    streak: 0,
                    terakhirLogin: new Date().toISOString()
                };
                
                // Gunakan set() untuk inisialisasi awal user
                await set(ref(db, 'users/' + user.uid), dataAwal);
                
                if (typeof window.showToast === 'function') {
                    window.showToast(`Ahlan wa Sahlan, ${user.displayName}! Profil Amalpad dibuat.`, 'success');
                } else {
                    alert(`Ahlan wa Sahlan, ${user.displayName}! Profil Amalpad berhasil dibuat.`);
                }
            }
        } catch (error) {
            console.error("Gagal menarik data dari RTDB:", error);
        }

    } else {
        // --- JIKA BELUM LOGIN ---
        if (headerAvatar) headerAvatar.innerHTML = 'A';
        if (statsUsername) statsUsername.innerText = window.playerState?.name || 'Player';
        
        if (btnLogin) {
            btnLogin.innerHTML = `<span>🌐</span> Login Google`;
            btnLogin.onclick = window.loginDenganGoogle;
            btnLogin.classList.replace('text-rose-600', 'text-blue-600');
        }
    }
});
