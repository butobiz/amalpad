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

// 2. Paste konfigurasi dari Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyAmmWk4FKLjAGdfMPAVszgPJMdLc9qJY98",
    authDomain: "amalpad-app.firebaseapp.com",
    projectId: "amalpad-app",
    storageBucket: "amalpad-app.firebasestorage.app",
    messagingSenderId: "344360349317",
    appId: "1:344360349317:web:efc5ffea5f28444ee443ec",
    measurementId: "G-KB3T44DZ22"
};

// 3. Inisialisasi Firebase, Analytics, & Auth
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 4. Expose fungsi ke global window agar bisa dipanggil dari tombol HTML
window.loginDenganGoogle = async () => {
    try {
        // Tampilkan popup login Google
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        console.log("Login sukses! UID:", user.uid);
        
        // Tampilkan notifikasi toast jika fungsi tersedia (fallback ke alert)
        if (typeof window.showToast === 'function') {
            window.showToast(`Selamat datang, ${user.displayName}!`, 'success');
        } else {
            alert(`Selamat datang, ${user.displayName}!`);
        }
        
    } catch (error) {
        console.error("Error saat login:", error.code, error.message);
        if (typeof window.showToast === 'function') {
            window.showToast("Gagal login. Coba lagi.", 'error');
        } else {
            alert("Gagal login. Coba lagi.");
        }
    }
};

window.logoutAkun = async () => {
    try {
        await signOut(auth);
        console.log("Logout berhasil");
        if (typeof window.showToast === 'function') {
            window.showToast("Berhasil keluar dari akun.", 'success');
        } else {
            alert("Berhasil keluar dari akun.");
        }
    } catch (error) {
        console.error("Error saat logout:", error);
    }
};

// 5. Listener: Memantau status login user secara real-time
onAuthStateChanged(auth, (user) => {
    const btnLogin = document.getElementById('btn-google-login');
    const headerAvatar = document.getElementById('header-avatar');
    const statsUsername = document.getElementById('stats-username');

    if (user) {
        // JIKA USER SUDAH LOGIN
        console.log("User terdeteksi:", user.email);
        
        // Ubah UI: Tampilkan foto profil Google di header
        if (headerAvatar) {
            headerAvatar.innerHTML = `<img src="${user.photoURL}" class="w-full h-full object-cover rounded-full border-2 border-white dark:border-gray-800" alt="Avatar">`;
        }
        
        // Ubah nama di halaman Stats
        if (statsUsername) {
            statsUsername.innerText = user.displayName;
        }

        // Sembunyikan tombol login, tampilkan tombol logout (jika ada di DOM)
        if (btnLogin) {
            btnLogin.innerHTML = `<span>🚪</span> Keluar Akun`;
            btnLogin.onclick = window.logoutAkun;
            btnLogin.classList.replace('text-blue-600', 'text-rose-600');
        }

        // TODO NEXT: Tarik data progress (Exp, Tasbih) dari Firestore menggunakan user.uid

    } else {
        // JIKA USER BELUM LOGIN / LOGOUT
        console.log("Tidak ada user yang login.");
        
        // Kembalikan UI ke default
        if (headerAvatar) headerAvatar.innerHTML = 'A';
        if (statsUsername) statsUsername.innerText = window.playerState?.name || 'Player';
        
        if (btnLogin) {
            btnLogin.innerHTML = `<span>🌐</span> Login Google`;
            btnLogin.onclick = window.loginDenganGoogle;
            btnLogin.classList.replace('text-rose-600', 'text-blue-600');
        }
    }
});
