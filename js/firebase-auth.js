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
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// 2. Konfigurasi Asli Firebase Amalpad
const firebaseConfig = {
    apiKey: "AIzaSyAmmWk4FKLjAGdfMPAVszgPJMdLc9qJY98",
    authDomain: "amalpad-app.firebaseapp.com",
    projectId: "amalpad-app",
    storageBucket: "amalpad-app.firebasestorage.app",
    messagingSenderId: "344360349317",
    appId: "1:344360349317:web:efc5ffea5f28444ee443ec",
    measurementId: "G-KB3T44DZ22"
};

// 3. Inisialisasi Firebase, Analytics, Auth, dan Firestore
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 4. Fungsi Login & Logout
window.loginDenganGoogle = async () => {
    try {
        await signInWithPopup(auth, provider);
        // Alert sukses ditangani di dalam onAuthStateChanged agar tidak dobel
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
        // Beri jeda 1 detik agar animasi Toast terlihat sebelum halaman direfresh
        setTimeout(() => { window.location.reload(); }, 1000); 
    } catch (error) {
        console.error("Error logout:", error);
    }
};

// ==========================================
// 5. SISTEM CLOUD SAVE (FIRESTORE LOGIC)
// ==========================================

// Fungsi global untuk menyimpan/update data ke Cloud dari mana saja
window.saveDataKeCloud = async (dataBaru) => {
    const user = auth.currentUser;
    if (!user) {
        console.log("User belum login, progres hanya disimpan di HP (local).");
        return; // Jangan save ke cloud kalau belum login
    }

    try {
        const userRef = doc(db, "users", user.uid);
        // { merge: true } mencegah tertimpanya seluruh dokumen jika kita hanya kirim sebagian field
        await setDoc(userRef, dataBaru, { merge: true });
        console.log("Data berhasil diamankan ke Jalur Langit! ☁️✓");
    } catch (error) {
        console.error("Gagal save ke cloud:", error);
    }
};

// 6. Listener Status Login (Berjalan otomatis saat web dibuka)
onAuthStateChanged(auth, async (user) => {
    const btnLogin = document.getElementById('btn-google-login');
    const headerAvatar = document.getElementById('header-avatar');
    const statsUsername = document.getElementById('stats-username');

    if (user) {
        // --- JIKA USER SUDAH LOGIN ---
        console.log("User terdeteksi:", user.uid);
        
        // Ubah UI Profil
        if (headerAvatar) headerAvatar.innerHTML = `<img src="${user.photoURL}" class="w-full h-full object-cover rounded-full border-2 border-white dark:border-gray-800" alt="Avatar">`;
        if (statsUsername) statsUsername.innerText = user.displayName;
        if (btnLogin) {
            btnLogin.innerHTML = `<span>🚪</span> Keluar Akun`;
            btnLogin.onclick = window.logoutAkun;
            btnLogin.classList.replace('text-blue-600', 'text-rose-600');
        }

        // --- TARIK DATA DARI DATABASE ---
        try {
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                // Jika user pemain lama, ambil datanya
                const dataUser = docSnap.data();
                console.log("Data user ditemukan:", dataUser);
                
                // TODO: Timpa variabel window.playerState milik quest.js dengan dataUser ini
                // Contoh: window.playerState = dataUser.playerState; window.saveState(); window.updateHeader();
                
                if (typeof window.showToast === 'function') {
                    window.showToast(`Selamat datang kembali, ${user.displayName}! Data tersinkron.`, 'success');
                } else {
                    alert(`Selamat datang kembali, ${user.displayName}! Data dari cloud ditarik.`);
                }
            } else {
                // Jika user baru pertama kali main, buatkan struktur data awal di Firestore
                console.log("User baru! Membuat profil kosong di database...");
                
                const dataAwal = {
                    nama: user.displayName,
                    email: user.email,
                    level: 1,
                    exp: 0,
                    totalTasbih: 0,
                    streak: 0,
                    terakhirLogin: new Date().toISOString()
                };
                
                await setDoc(userRef, dataAwal);
                console.log("Profil jalur langit berhasil dibuat!");
                
                if (typeof window.showToast === 'function') {
                    window.showToast(`Ahlan wa Sahlan, ${user.displayName}! Profil Amalpad berhasil dibuat.`, 'success');
                } else {
                    alert(`Ahlan wa Sahlan, ${user.displayName}! Profil Amalpad berhasil dibuat.`);
                }
            }
        } catch (dbError) {
            console.error("Error saat memproses database Firestore:", dbError);
        }

    } else {
        // --- JIKA USER BELUM LOGIN / BARU LOGOUT ---
        console.log("Tidak ada user yang login.");
        
        // Kembalikan UI profil ke Default/Local State
        if (headerAvatar) headerAvatar.innerHTML = 'A';
        if (statsUsername) statsUsername.innerText = window.playerState?.name || 'Player';
        
        if (btnLogin) {
            btnLogin.innerHTML = `<span>🌐</span> Login Google`;
            btnLogin.onclick = window.loginDenganGoogle;
            btnLogin.classList.replace('text-rose-600', 'text-blue-600');
        }
    }
});
