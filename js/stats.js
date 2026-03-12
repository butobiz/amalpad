/* ========================================================================== */
/* stats.js - Berisi Logika Tampilan Profil & Rendering (Cloud Ready ☁️)      */
/* ========================================================================== */

window.handleImageUpload = function(event) {
    const file = event.target?.files[0]; if(!file) return;
    if(!file.type.startsWith('image/')) { window.showToast('Gunakan file gambar ngab!', 'error'); return; }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas'); const MAX_SIZE = 150; let width = img.width; let height = img.height;
            if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
            canvas.width = Math.max(1, width); canvas.height = Math.max(1, height); // Mencegah 0 width/height
            
            const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/webp', 0.8);
            
            if(window.playerState) window.playerState.avatar = compressedDataUrl; 
            const pv = document.getElementById('edit-profile-avatar-preview');
            if(pv) pv.innerHTML = `<img src="${compressedDataUrl}" class="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-800">`; 
            window.showToast("Foto Profil disiapkan!", "success");

            // --- CLOUD SAVE: Avatar ---
            if (typeof window.saveDataKeCloud === 'function') {
                window.saveDataKeCloud({ avatar: compressedDataUrl });
            }
        }; 
        img.src = e.target.result;
    }; 
    reader.readAsDataURL(file);
};

window.renderProfileTexts = function() {
    if (!window.playerState) return; // Failsafe utama

    const currentExp = window.playerState.exp || 0;
    const currentLevel = Math.floor(currentExp / 1000) + 1; 
    const userTitle = typeof window.getUserTitle === 'function' ? window.getUserTitle(currentLevel) : "Skena Player";
    const expProgress = currentExp % 1000;
    const progressPercent = (expProgress / 1000) * 100;
    
    const safeName = window.playerState.name || "Skena Newbie";
    const safeBio = window.playerState.bio || "Baru mulai hijrah jalur langit.";
    const initialChar = safeName.charAt(0).toUpperCase() || "S";
    const safeTotalDzikir = window.playerState.stats?.tasbihTotal || 0;

    document.querySelectorAll('#stats-username, #flex-username').forEach(el => { if(el) el.innerText = safeName; });
    document.querySelectorAll('#card-bio-text, #flex-bio-text').forEach(el => { if(el) el.innerText = `"${safeBio}"`; });
    
    const statsTitle = document.getElementById('stats-title'); if(statsTitle) statsTitle.innerText = userTitle;
    const flexTitle = document.getElementById('flex-title'); if(flexTitle) flexTitle.innerText = userTitle;
    const statsExpDisplay = document.getElementById('stats-exp-display'); if(statsExpDisplay) statsExpDisplay.innerHTML = `${currentExp.toLocaleString('id-ID')}`;
    const statsExpBar = document.getElementById('stats-exp-bar'); if(statsExpBar) statsExpBar.style.width = `${progressPercent}%`;
    const statsExpText = document.getElementById('stats-exp-progress-text'); if(statsExpText) statsExpText.innerText = `${expProgress} / 1000`;
    
    const inputEditName = document.getElementById('input-edit-name'); if(inputEditName) inputEditName.value = safeName;
    const inputEditBio = document.getElementById('input-edit-bio'); if(inputEditBio) inputEditBio.value = safeBio;
    
    const statsTasbihTotal = document.getElementById('stats-tasbih-total'); if(statsTasbihTotal) statsTasbihTotal.innerText = `${safeTotalDzikir.toLocaleString('id-ID')}x`;
    const flexTasbihTotal = document.getElementById('flex-tasbih-total'); if(flexTasbihTotal) flexTasbihTotal.innerText = `${safeTotalDzikir.toLocaleString('id-ID')}x`;
    
    // Failsafe Rendering Avatar
    const avatarHtml = window.playerState.avatar 
        ? `<img src="${window.playerState.avatar}" class="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-800">`
        : initialChar;
    const avatarHtmlNoBorder = window.playerState.avatar 
        ? `<img src="${window.playerState.avatar}" class="w-full h-full object-cover rounded-full">`
        : `<span class="relative z-10 text-white">${initialChar}</span>`;

    const pv = document.getElementById('edit-profile-avatar-preview'); if(pv) pv.innerHTML = avatarHtml;
    const fpv = document.getElementById('flex-avatar-container'); if(fpv) fpv.innerHTML = avatarHtmlNoBorder;
    const spv = document.getElementById('stats-avatar-container'); 
    if(spv) { 
        spv.innerHTML = window.playerState.avatar 
            ? `<img src="${window.playerState.avatar}" class="w-full h-full object-cover rounded-full">`
            : `<span id="stats-avatar-initial">${initialChar}</span>`; 
    }

    const cSkin = window.playerState.activeSkins?.card || 'card_dark';
    const prayerCardEl = document.getElementById('prayer-card-element'); if(prayerCardEl) prayerCardEl.className = `relative w-full h-64 rounded-[2rem] p-6 shadow-2xl transition-all duration-300 transform-style-3d overflow-hidden flex flex-col justify-between ${cSkin}`;
    const flexBgEl = document.getElementById('flex-bg-element'); if(flexBgEl) flexBgEl.className = `absolute inset-0 z-0 ${cSkin}`;
}

window.openEditProfileModal = () => { 
    if(navigator.vibrate) navigator.vibrate(15);
    window.renderProfileTexts(); 
    const m = document.getElementById('edit-profile-modal'), c = document.getElementById('edit-profile-content'); 
    if(m && c) { m.classList.remove('hidden'); m.classList.add('flex'); setTimeout(() => { m.classList.remove('opacity-0'); c.classList.remove('scale-95'); }, 10); }
}
window.closeEditProfileModal = () => { 
    const m = document.getElementById('edit-profile-modal'), c = document.getElementById('edit-profile-content'); 
    if(m && c) { c.classList.add('scale-95'); m.classList.add('opacity-0'); setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300); }
}
window.saveProfile = () => { 
    const inputName = document.getElementById('input-edit-name'); const inputBio = document.getElementById('input-edit-bio');
    if(window.playerState) {
        if(inputName) window.playerState.name = inputName.value.trim() || "User"; 
        if(inputBio) window.playerState.bio = inputBio.value.trim() || "..."; 
        
        if(typeof window.saveState === 'function') window.saveState(); 
        
        // --- CLOUD SAVE: Nama & Bio ---
        if (typeof window.saveDataKeCloud === 'function') {
            window.saveDataKeCloud({
                name: window.playerState.name,
                bio: window.playerState.bio
            });
        }
    }
    window.renderProfileTexts(); 
    if(typeof window.updateHeader === 'function') window.updateHeader(); 
    window.closeEditProfileModal(); 
    window.showToast("Profil Skena diperbarui!", "success"); 
}

window.init3DCard = function() {
    const wrapper = document.getElementById('prayer-card-wrapper'), card = document.getElementById('prayer-card-element'); 
    if(!wrapper || !card) return;
    
    wrapper.addEventListener('mousemove', (e) => { 
        const r = wrapper.getBoundingClientRect(); 
        const x = e.clientX - r.left, y = e.clientY - r.top; 
        const cX = r.width/2, cY = r.height/2; 
        if(cX === 0 || cY === 0) return; 
        card.style.transform = `rotateX(${((y - cY) / cY) * -12}deg) rotateY(${((x - cX) / cX) * 12}deg)`; 
    });
    wrapper.addEventListener('mouseleave', () => { card.style.transform = `rotateX(0deg) rotateY(0deg)`; });
};

window.renderRadarChart = function(targetMode = 'main') {
    const svg = document.getElementById(`radar-svg-${targetMode}`), webGroup = document.getElementById(`radar-web-group-${targetMode}`), axisGroup = document.getElementById(`radar-axis-group-${targetMode}`), polygon = document.getElementById(`radar-data-polygon-${targetMode}`), nodesGroup = document.getElementById(`radar-nodes-group-${targetMode}`), labelsContainer = document.getElementById(`radar-labels-container-${targetMode}`);
    if(!svg || !webGroup || !axisGroup || !polygon || !nodesGroup || !labelsContainer) return;
    
    const cx = 100, cy = 100, r = 75; 
    const stats = ['pusat', 'aura', 'peka', 'sigma', 'derma', 'stoic']; 
    const labels = ['Pusat 🕋', 'Aura ✨', 'Peka 🤝', 'Sigma 🗿', 'Derma 🪙', 'Stoic 🧘']; 
    const angles = [-Math.PI/2, -Math.PI/6, Math.PI/6, Math.PI/2, 5*Math.PI/6, 7*Math.PI/6];
    
    let webHtml = '', axisHtml = '';
    for(let level = 1; level <= 4; level++) { 
        let points = ''; const currentR = (r / 4) * level; 
        for(let i=0; i<6; i++) { 
            const px = cx + currentR * Math.cos(angles[i]); const py = cy + currentR * Math.sin(angles[i]); 
            points += `${px},${py} `; 
            if(level === 4) axisHtml += `<line x1="${cx}" y1="${cy}" x2="${px}" y2="${py}" />`; 
        } 
        webHtml += `<polygon points="${points.trim()}" fill="transparent" />`; 
    }
    webGroup.innerHTML = webHtml; axisGroup.innerHTML = axisHtml;
    
    let dataPoints = '', nodesHtml = ''; labelsContainer.innerHTML = '';
    let textColor = targetMode === 'flex' ? "text-white/90" : "text-gray-500 dark:text-gray-400"; 
    let valColor = targetMode === 'flex' ? "text-emerald-300 drop-shadow-md" : "text-emerald-600 dark:text-emerald-400";
    
    const safeRadar = window.playerState?.radar || { pusat: 10, aura: 10, peka: 10, sigma: 10, derma: 10, stoic: 10 };

    for(let i=0; i<6; i++) {
        const statKey = stats[i]; 
        let val = Math.max(10, Math.min(100, safeRadar[statKey] || 10)); 
        const dataR = (10 / 100) * r; 
        const px = cx + dataR * Math.cos(angles[i]); const py = cy + dataR * Math.sin(angles[i]); 
        dataPoints += `${px},${py} `;
        
        const circleColor = targetMode === 'flex' ? "#fff" : "#10b981", strokeColor = targetMode === 'flex' ? "transparent" : "#fff";
        nodesHtml += `<circle cx="${cx}" cy="${cy}" r="3" fill="${circleColor}" stroke="${strokeColor}" stroke-width="1.5" class="radar-polygon transition-all duration-1000" id="node-${targetMode}-${i}"/>`;
        
        const labelR = r + 22, leftPercent = 50 + (labelR/100) * 50 * Math.cos(angles[i]), topPercent = 50 + (labelR/100) * 50 * Math.sin(angles[i]);
        let alignmentClass = "transform -translate-x-1/2 -translate-y-1/2 text-center"; 
        if(i===1 || i===2) alignmentClass = "transform translate-y-[-50%] text-left"; 
        if(i===4 || i===5) alignmentClass = "transform -translate-x-full translate-y-[-50%] text-right"; 
        
        labelsContainer.innerHTML += `<div class="absolute text-[9px] font-black ${textColor} ${alignmentClass}" style="left: ${leftPercent}%; top: ${topPercent}%;">${labels[i]}<br><span class="${valColor} text-[10px]">${val}</span></div>`;
    }
    
    polygon.setAttribute('points', dataPoints.trim()); nodesGroup.innerHTML = nodesHtml;
    
    setTimeout(() => {
        let realDataPoints = '';
        for(let i=0; i<6; i++) {
            let val = Math.max(10, Math.min(100, safeRadar[stats[i]] || 10)); 
            const dataR = (val / 100) * r; 
            const px = cx + dataR * Math.cos(angles[i]); const py = cy + dataR * Math.sin(angles[i]);
            realDataPoints += `${px},${py} `; 
            const node = document.getElementById(`node-${targetMode}-${i}`); 
            if(node) { node.setAttribute('cx', px); node.setAttribute('cy', py); }
        }
        polygon.setAttribute('points', realDataPoints.trim());
    }, 50); 
};

window.renderHeatmap = function() {
    const container = document.getElementById('heatmap-container'); if(!container) return;
    let html = ''; 
    const history = window.playerState?.history || Array(28).fill(0); 
    
    for(let i=0; i<28; i++) {
        const actLevel = history[i] || 0; let bgClass = "bg-gray-200 dark:bg-gray-800"; 
        if (actLevel === 1) bgClass = "bg-emerald-200 dark:bg-emerald-900/60"; 
        else if (actLevel === 2) bgClass = "bg-emerald-400"; 
        else if (actLevel >= 3) bgClass = "bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
        
        const isToday = i === 27 ? "ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-gray-900 transform scale-110" : "";
        html += `<div class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] ${bgClass} ${isToday} transition-all duration-300 hover:scale-125 cursor-pointer hover:ring-2 ring-gray-400" title="Aktivitas: ${actLevel}"></div>`;
    }
    container.innerHTML = html;
};

window.renderAchievements = function() {
    const container = document.getElementById('achievements-container'); if(!container) return;
    
    const radar = window.playerState?.radar || { pusat: 0, aura: 0, peka: 0, sigma: 0, derma: 0, stoic: 0 }; 
    const exp = window.playerState?.exp || 0;
    const overallLevel = Math.floor(exp / 1000) + 1; 
    const s = window.playerState?.stats || { tasbihTotal: 0, questsCompleted: 0, epicCompleted: 0 };
    const safeBadgeDefs = typeof BADGE_DEFS !== 'undefined' ? BADGE_DEFS : []; 
    
    if(safeBadgeDefs.length === 0) return;

    // FUNGSI BARU: Kurva RPG Hardcore (Akar Kuadrat)
    // Semakin tinggi levelnya, butuh poin eksponensial lebih banyak
    const getHardLevel = (value, factor) => {
        if (value <= 0) return 0;
        return Math.min(99, Math.floor(Math.sqrt(value / factor)));
    };

    container.innerHTML = safeBadgeDefs.map(b => {
        let level = 0;
        
        // PENGHITUNGAN LEVEL HARDCORE BIKIN NANGIS (Grinding sesungguhnya)
        if (b.stat) level = getHardLevel(radar[b.stat] || 0, 4); // Misal radar 60 -> 60/4 = 15 -> akar(15) = Lv 3 (Turun drastis dari Lv 15!)
        else if (b.type === 'overall_lvl') level = getHardLevel(overallLevel, 1); // Overall Lv 10 -> akar(10) = Lv 3
        else if (b.type === 'epic_quests') level = getHardLevel(s.epicCompleted || 0, 1.5); 
        else if (b.type === 'total_quests') level = getHardLevel(s.questsCompleted || 0, 5); // 125 Quest Harian -> 125/5 = 25 -> akar(25) = Lv 5
        else if (b.type === 'tasbih_total') level = getHardLevel(s.tasbihTotal || 0, 1000); // 10.000 Tasbih -> 10.000/1000 = 10 -> akar(10) = Lv 3
        
        const isLocked = level === 0;
        let cardClass = isLocked ? "bg-gray-100 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 opacity-60 grayscale filter" : "bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/10 border border-yellow-300 dark:border-yellow-600/50 shadow-sm transform hover:scale-105 hover:shadow-md transition-all cursor-pointer group";
        let titleClass = isLocked ? "text-gray-400 dark:text-gray-500" : "text-yellow-700 dark:text-yellow-500";
        
        // Penyesuaian nama badge menjadi Admin Pusat
        let displayTitle = (b.title === "Pusat" || b.title === "Wali Pusat") ? "Admin Pusat" : b.title;

        return `<div class="${cardClass} rounded-2xl p-3 flex flex-col items-center text-center relative" title="${b.desc}">
            <span class="text-3xl mb-1.5 filter drop-shadow-sm ${!isLocked ? 'group-hover:animate-bounce' : ''}">${b.icon}</span>
            <span class="text-[9px] font-black ${titleClass} leading-tight">${displayTitle}</span>
            ${!isLocked ? `<span class="absolute -top-2 -right-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">Lv.${level}</span>` : ''}
        </div>`;
    }).join('');
};

const rarityColors = {
    "Common": "text-gray-500 bg-gray-100 dark:bg-gray-800",
    "Rare": "text-blue-500 bg-blue-100 dark:bg-blue-900/30 border border-blue-500/30",
    "Epic": "text-purple-500 bg-purple-100 dark:bg-purple-900/30 border border-purple-500/30",
    "Legendary": "text-red-500 bg-red-100 dark:bg-red-900/30 border border-red-500/30",
    "Mythic": "text-amber-500 bg-amber-100 dark:bg-amber-900/30 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
};

window.getCurrentSkinTab = () => typeof currentSkinTab !== 'undefined' ? currentSkinTab : (window._currentSkinTab || 'tasbih');
window.setCurrentSkinTab = (tab) => { if(typeof currentSkinTab !== 'undefined') { currentSkinTab = tab; } window._currentSkinTab = tab; };

window.switchSkinTab = (tab) => {
    if(navigator.vibrate) navigator.vibrate(10);
    window.setCurrentSkinTab(tab);
    
    const tabTasbih = document.getElementById('tab-skin-tasbih'); const tabCard = document.getElementById('tab-skin-card');
    if(tabTasbih && tabCard) {
        tabTasbih.className = tab === 'tasbih' ? "flex-1 text-[10px] font-black uppercase py-2 rounded-lg bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm transition-all duration-300" : "flex-1 text-[10px] font-black uppercase py-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-300";
        tabCard.className = tab === 'card' ? "flex-1 text-[10px] font-black uppercase py-2 rounded-lg bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm transition-all duration-300" : "flex-1 text-[10px] font-black uppercase py-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-300";
    }
    window.renderSkinCollection();
};

window.equipSkin = (type, skinId) => {
    if(!window.playerState) return;
    if(!window.playerState.activeSkins) window.playerState.activeSkins = {};
    window.playerState.activeSkins[type] = skinId; 
    
    if(typeof window.saveState === 'function') window.saveState();
    
    // --- CLOUD SAVE: Skin Kosmetik ---
    if (typeof window.saveDataKeCloud === 'function') {
        window.saveDataKeCloud({ activeSkins: window.playerState.activeSkins });
    }

    window.renderSkinCollection(); window.renderProfileTexts(); 
    if(typeof window.initTasbih === 'function') window.initTasbih();
    
    window.showToast("Kosmetik Berhasil Digunakan! ✨", "success");
    if(navigator.vibrate) navigator.vibrate(30);
    if(typeof confetti === 'function') confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
};

window.renderSkinCollection = function() {
    const container = document.getElementById('skin-collection-container'); if(!container) return;
    
    const activeTab = window.getCurrentSkinTab();
    const safeSkinsDb = typeof SKINS !== 'undefined' ? SKINS : (window.SKINS || {});
    const items = safeSkinsDb[activeTab] || []; 
    
    if(items.length === 0) {
        container.innerHTML = '<p class="text-center text-xs text-gray-500 py-4">Kosmetik belum tersedia.</p>';
        return;
    }

    const s = window.playerState?.stats || { tasbihTotal: 0, questsCompleted: 0, epicCompleted: 0 };
    const safeActiveSkins = window.playerState?.activeSkins || { tasbih: 'default', card: 'card_dark' };
    
    container.innerHTML = items.map(skin => {
        let isUnlocked = true; let currentReq = 0;
        if(activeTab === 'tasbih') { currentReq = s.tasbihTotal || 0; isUnlocked = currentReq >= skin.req; }
        else { currentReq = skin.reqType === 'epic' ? (s.epicCompleted || 0) : (s.questsCompleted || 0); isUnlocked = currentReq >= skin.req; }
        
        const isEquipped = safeActiveSkins[activeTab] === skin.id;
        
        let btnHtml = "";
        if(isEquipped) btnHtml = `<span class="text-[9px] font-black bg-blue-500 text-white px-3.5 py-1.5 rounded-lg shadow-inner tracking-widest shrink-0">DIPAKAI</span>`;
        else if(isUnlocked) btnHtml = `<button onclick="window.equipSkin('${activeTab}', '${skin.id}')" class="text-[9px] font-black bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-3.5 py-1.5 rounded-lg transition-transform active:scale-90 tracking-widest shadow-sm shrink-0">PAKAI</button>`;
        else btnHtml = `<span class="text-[8px] font-bold text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-700 px-2 py-1.5 rounded-lg tracking-widest bg-gray-50 dark:bg-gray-800/50 shrink-0">🔒 TERKUNCI</span>`;

        const bgClass = isEquipped ? "bg-blue-50 dark:bg-blue-900/10 border-blue-400 dark:border-blue-500/50 ring-1 ring-blue-500/20" : (isUnlocked ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300" : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-800 opacity-60 grayscale-[50%]");
        const rarityBadge = `<span class="text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${rarityColors[skin.rarity] || 'text-gray-500'}">${skin.rarity}</span>`;
        
        let previewHtml = "";
        if(activeTab === 'tasbih') {
            previewHtml = `<div class="w-14 h-14 rounded-full flex flex-col items-center justify-center text-sm shadow-md flex-shrink-0 relative ${skin.previewClass}"><span class="opacity-80 leading-none">${skin.icon}</span></div>`;
        } else {
            previewHtml = `<div class="w-12 h-16 rounded-lg shadow-md flex-shrink-0 relative overflow-hidden flex flex-col justify-between p-1.5 border border-white/20 ${skin.previewClass}"><div class="w-4 h-4 rounded-full bg-white/30 border border-white/50 flex items-center justify-center text-[5px]">${skin.icon}</div><div class="h-1.5 w-full bg-white/20 rounded mt-auto"></div></div>`;
        }

        return `<div class="flex items-center justify-between p-3.5 rounded-[1.2rem] border ${bgClass} transition-all duration-300 shadow-sm"><div class="flex items-center gap-3.5">${previewHtml}<div><div class="flex items-center gap-1.5 mb-1"><h4 class="font-black text-sm text-gray-900 dark:text-white leading-tight">${skin.name}</h4>${isUnlocked ? rarityBadge : ''}</div>${!isUnlocked ? `<p class="text-[9px] text-gray-500 tracking-wide">${skin.desc}</p>` : `<p class="text-[9px] text-emerald-500 font-bold">Unik Tersedia ✓</p>`}</div></div><div>${btnHtml}</div></div>`;
    }).join('');
};

window.openFlexCardModal = function() {
    if(navigator.vibrate) navigator.vibrate(30);
    const safeRadar = window.playerState?.radar || { pusat: 0, aura: 0, peka: 0, sigma: 0, derma: 0, stoic: 0 };
    const overall = Math.floor((safeRadar.pusat + safeRadar.aura + safeRadar.peka + safeRadar.sigma + safeRadar.derma + safeRadar.stoic) / 6);
    
    const flexScore = document.getElementById('flex-overall-score'); if(flexScore) flexScore.innerText = overall || 0;
    window.renderRadarChart('flex');
    
    const m = document.getElementById('flex-card-modal'); 
    if(m) { m.classList.remove('hidden'); m.classList.add('flex'); setTimeout(() => { m.classList.remove('opacity-0'); }, 10); }
};
window.closeFlexCardModal = function() { 
    const m = document.getElementById('flex-card-modal'); 
    if(m) { m.classList.add('opacity-0'); setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300); }
};

// ==========================================================================
// FUNGSI SAKTI: Menarik Data dari Cloud & Merender Ulang Seluruh UI Stats
// ==========================================================================
window.loadDataDariCloud = function(cloudData) {
    if (!window.playerState) window.playerState = {}; 

    // 1. Timpa data lokal dengan data dari Firebase
    if (cloudData.name !== undefined) window.playerState.name = cloudData.name;
    if (cloudData.bio !== undefined) window.playerState.bio = cloudData.bio;
    if (cloudData.avatar !== undefined) window.playerState.avatar = cloudData.avatar;
    if (cloudData.exp !== undefined) window.playerState.exp = cloudData.exp;
    if (cloudData.level !== undefined) window.playerState.level = cloudData.level;
    
    // Failsafe untuk nested objects (biar tidak error kalau strukturnya belum ada)
    if (cloudData.stats) window.playerState.stats = { ...window.playerState.stats, ...cloudData.stats };
    if (cloudData.radar) window.playerState.radar = { ...window.playerState.radar, ...cloudData.radar };
    if (cloudData.activeSkins) window.playerState.activeSkins = { ...window.playerState.activeSkins, ...cloudData.activeSkins };
    if (cloudData.history) window.playerState.history = cloudData.history;

    // 2. Simpan ke local storage sebagai backup offline
    if (typeof window.saveState === 'function') window.saveState();

    // 3. Render Ulang Semua Komponen Visual di Tab Stats
    window.renderProfileTexts();
    window.renderRadarChart('main');
    window.renderHeatmap();
    window.renderAchievements();
    window.renderSkinCollection();
    
    console.log("☁️ Data Jalur Langit berhasil disinkronisasi ke UI!");
};

// --- Inisiasi Utama Aplikasi ---
document.addEventListener("DOMContentLoaded", () => {
    if(typeof window.checkDailyReset === 'function') window.checkDailyReset(); 
    
    const viewStats = document.getElementById('view-stats'); if(viewStats) viewStats.style.display = 'none';

    if(typeof window.verifyServerTime === 'function') window.verifyServerTime();
    if(typeof window.initDailyCountdown === 'function') window.initDailyCountdown();
    
    // Timeout memberikan jeda agar DOM ter-render stabil & quest.js termuat sepenuhnya
    setTimeout(() => {
        if(typeof window.initDailyQuestData === 'function') window.initDailyQuestData();
        if(typeof window.renderSholatWajib === 'function') window.renderSholatWajib();
        if(typeof window.renderMissions === 'function') window.renderMissions();
        if(typeof window.checkEpicUnlock === 'function') window.checkEpicUnlock();
        if(typeof window.renderSpecialQuests === 'function') window.renderSpecialQuests();
        if(typeof window.initTasbih === 'function') window.initTasbih();
    }, 400);
    
    setInterval(() => { if(typeof window.renderSholatWajib === 'function') window.renderSholatWajib(); }, 60000); 
});
