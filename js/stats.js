/* ========================================================================== */
/* ✂️ START COPY UNTUK: stats.js (Berisi Logika Tampilan Profil & Rendering)  */
/* ========================================================================== */
        window.handleImageUpload = function(event) {
            const file = event.target.files[0]; if(!file) return;
            if(!file.type.startsWith('image/')) { window.showToast('Gunakan file gambar ngab!', 'error'); return; }
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas'); const MAX_SIZE = 150; let width = img.width; let height = img.height;
                    if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                    canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                    const compressedDataUrl = canvas.toDataURL('image/webp', 0.8);
                    window.playerState.avatar = compressedDataUrl; 
                    const pv = document.getElementById('edit-profile-avatar-preview');
                    if(pv) pv.innerHTML = `<img src="${compressedDataUrl}" class="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-800">`; 
                    window.showToast("Foto Profil disiapkan!", "success");
                }; img.src = e.target.result;
            }; reader.readAsDataURL(file);
        };

        window.renderProfileTexts = function() {
            const currentExp = window.playerState.exp;
            const currentLevel = Math.floor(currentExp / 1000) + 1; 
            const userTitle = window.getUserTitle(currentLevel);
            const expProgress = currentExp % 1000;
            const progressPercent = (expProgress / 1000) * 100;
            
            document.querySelectorAll('#stats-username, #flex-username').forEach(el => { if(el) el.innerText = window.playerState.name; });
            document.querySelectorAll('#card-bio-text, #flex-bio-text').forEach(el => { if(el) el.innerText = `"${window.playerState.bio}"`; });
            
            const statsTitle = document.getElementById('stats-title'); if(statsTitle) statsTitle.innerText = userTitle;
            const flexTitle = document.getElementById('flex-title'); if(flexTitle) flexTitle.innerText = userTitle;
            const statsExpDisplay = document.getElementById('stats-exp-display'); if(statsExpDisplay) statsExpDisplay.innerHTML = `${currentExp.toLocaleString('id-ID')}`;
            const statsExpBar = document.getElementById('stats-exp-bar'); if(statsExpBar) statsExpBar.style.width = `${progressPercent}%`;
            const statsExpText = document.getElementById('stats-exp-progress-text'); if(statsExpText) statsExpText.innerText = `${expProgress} / 1000`;
            const inputEditName = document.getElementById('input-edit-name'); if(inputEditName) inputEditName.value = window.playerState.name;
            const inputEditBio = document.getElementById('input-edit-bio'); if(inputEditBio) inputEditBio.value = window.playerState.bio;
            const statsTasbihTotal = document.getElementById('stats-tasbih-total'); if(statsTasbihTotal) statsTasbihTotal.innerText = `${window.playerState.stats.tasbihTotal.toLocaleString('id-ID')}x`;
            const flexTasbihTotal = document.getElementById('flex-tasbih-total'); if(flexTasbihTotal) flexTasbihTotal.innerText = `${window.playerState.stats.tasbihTotal.toLocaleString('id-ID')}x`;
            
            const pv = document.getElementById('edit-profile-avatar-preview'); 
            if(pv) { if(window.playerState.avatar) pv.innerHTML = `<img src="${window.playerState.avatar}" class="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-800">`; else pv.innerHTML = window.playerState.name.charAt(0).toUpperCase(); }
            const fpv = document.getElementById('flex-avatar-container'); 
            if(fpv) { if(window.playerState.avatar) fpv.innerHTML = `<img src="${window.playerState.avatar}" class="w-full h-full object-cover rounded-full">`; else fpv.innerHTML = `<span class="relative z-10 text-white">${window.playerState.name.charAt(0).toUpperCase()}</span>`; }
            const spv = document.getElementById('stats-avatar-container'); 
            if(spv) { if(window.playerState.avatar) spv.innerHTML = `<img src="${window.playerState.avatar}" class="w-full h-full object-cover rounded-full">`; else spv.innerHTML = `<span id="stats-avatar-initial">${window.playerState.name.charAt(0).toUpperCase()}</span>`; }

            const cSkin = window.playerState.activeSkins.card || 'card_dark';
            const prayerCardEl = document.getElementById('prayer-card-element'); if(prayerCardEl) prayerCardEl.className = `relative w-full h-64 rounded-[2rem] p-6 shadow-2xl transition-all duration-300 transform-style-3d overflow-hidden flex flex-col justify-between ${cSkin}`;
            const flexBgEl = document.getElementById('flex-bg-element'); if(flexBgEl) flexBgEl.className = `absolute inset-0 z-0 ${cSkin}`;
        }

        window.openEditProfileModal = () => { 
            if(navigator.vibrate) navigator.vibrate(15);
            window.renderProfileTexts(); const m = document.getElementById('edit-profile-modal'), c = document.getElementById('edit-profile-content'); 
            if(m && c) { m.classList.remove('hidden'); m.classList.add('flex'); setTimeout(() => { m.classList.remove('opacity-0'); c.classList.remove('scale-95'); }, 10); }
        }
        window.closeEditProfileModal = () => { 
            const m = document.getElementById('edit-profile-modal'), c = document.getElementById('edit-profile-content'); 
            if(m && c) { c.classList.add('scale-95'); m.classList.add('opacity-0'); setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300); }
        }
        window.saveProfile = () => { 
            const inputName = document.getElementById('input-edit-name'); const inputBio = document.getElementById('input-edit-bio');
            if(inputName) window.playerState.name = inputName.value.trim() || "User"; 
            if(inputBio) window.playerState.bio = inputBio.value.trim() || "..."; 
            window.saveState(); window.renderProfileTexts(); window.updateHeader(); window.closeEditProfileModal(); 
            window.showToast("Profil Skena diperbarui!", "success"); 
        }

        window.init3DCard = function() {
            const wrapper = document.getElementById('prayer-card-wrapper'), card = document.getElementById('prayer-card-element'); if(!wrapper || !card) return;
            wrapper.addEventListener('mousemove', (e) => { const r = wrapper.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top; const cX = r.width/2, cY = r.height/2; card.style.transform = `rotateX(${((y - cY) / cY) * -12}deg) rotateY(${((x - cX) / cX) * 12}deg)`; });
            wrapper.addEventListener('mouseleave', () => { card.style.transform = `rotateX(0deg) rotateY(0deg)`; });
        };

        window.renderRadarChart = function(targetMode = 'main') {
            const svg = document.getElementById(`radar-svg-${targetMode}`), webGroup = document.getElementById(`radar-web-group-${targetMode}`), axisGroup = document.getElementById(`radar-axis-group-${targetMode}`), polygon = document.getElementById(`radar-data-polygon-${targetMode}`), nodesGroup = document.getElementById(`radar-nodes-group-${targetMode}`), labelsContainer = document.getElementById(`radar-labels-container-${targetMode}`);
            if(!svg || !webGroup || !axisGroup || !polygon || !nodesGroup || !labelsContainer) return;
            
            const cx = 100, cy = 100, r = 75; const stats = ['pusat', 'aura', 'peka', 'sigma', 'derma', 'stoic']; const labels = ['Pusat 🕋', 'Aura ✨', 'Peka 🤝', 'Sigma 🗿', 'Derma 🪙', 'Stoic 🧘']; const angles = [-Math.PI/2, -Math.PI/6, Math.PI/6, Math.PI/2, 5*Math.PI/6, 7*Math.PI/6];
            let webHtml = '', axisHtml = '';
            for(let level = 1; level <= 4; level++) { let points = ''; const currentR = (r / 4) * level; for(let i=0; i<6; i++) { const px = cx + currentR * Math.cos(angles[i]); const py = cy + currentR * Math.sin(angles[i]); points += `${px},${py} `; if(level === 4) axisHtml += `<line x1="${cx}" y1="${cy}" x2="${px}" y2="${py}" />`; } webHtml += `<polygon points="${points.trim()}" fill="transparent" />`; }
            webGroup.innerHTML = webHtml; axisGroup.innerHTML = axisHtml;
            let dataPoints = '', nodesHtml = ''; labelsContainer.innerHTML = '';
            let textColor = targetMode === 'flex' ? "text-white/90" : "text-gray-500 dark:text-gray-400"; let valColor = targetMode === 'flex' ? "text-emerald-300 drop-shadow-md" : "text-emerald-600 dark:text-emerald-400";
            for(let i=0; i<6; i++) {
                const statKey = stats[i]; let val = Math.max(10, Math.min(100, window.playerState.radar[statKey] || 10)); 
                const dataR = (10 / 100) * r; const px = cx + dataR * Math.cos(angles[i]); const py = cy + dataR * Math.sin(angles[i]); dataPoints += `${px},${py} `;
                const circleColor = targetMode === 'flex' ? "#fff" : "#10b981", strokeColor = targetMode === 'flex' ? "transparent" : "#fff";
                nodesHtml += `<circle cx="${cx}" cy="${cy}" r="3" fill="${circleColor}" stroke="${strokeColor}" stroke-width="1.5" class="radar-polygon transition-all duration-1000" id="node-${targetMode}-${i}"/>`;
                const labelR = r + 22, leftPercent = 50 + (labelR/100) * 50 * Math.cos(angles[i]), topPercent = 50 + (labelR/100) * 50 * Math.sin(angles[i]);
                let alignmentClass = "transform -translate-x-1/2 -translate-y-1/2 text-center"; if(i===1 || i===2) alignmentClass = "transform translate-y-[-50%] text-left"; if(i===4 || i===5) alignmentClass = "transform -translate-x-full translate-y-[-50%] text-right"; 
                labelsContainer.innerHTML += `<div class="absolute text-[9px] font-black ${textColor} ${alignmentClass}" style="left: ${leftPercent}%; top: ${topPercent}%;">${labels[i]}<br><span class="${valColor} text-[10px]">${val}</span></div>`;
            }
            polygon.setAttribute('points', dataPoints.trim()); nodesGroup.innerHTML = nodesHtml;
            setTimeout(() => {
                let realDataPoints = '';
                for(let i=0; i<6; i++) {
                    let val = Math.max(10, Math.min(100, window.playerState.radar[stats[i]] || 10)); const dataR = (val / 100) * r; const px = cx + dataR * Math.cos(angles[i]); const py = cy + dataR * Math.sin(angles[i]);
                    realDataPoints += `${px},${py} `; const node = document.getElementById(`node-${targetMode}-${i}`); if(node) { node.setAttribute('cx', px); node.setAttribute('cy', py); }
                }
                polygon.setAttribute('points', realDataPoints.trim());
            }, 50); 
        };

        window.renderHeatmap = function() {
            const container = document.getElementById('heatmap-container'); if(!container) return;
            let html = ''; const history = window.playerState.history; 
            for(let i=0; i<28; i++) {
                const actLevel = history[i] || 0; let bgClass = "bg-gray-200 dark:bg-gray-800"; 
                if (actLevel === 1) bgClass = "bg-emerald-200 dark:bg-emerald-900/60"; else if (actLevel === 2) bgClass = "bg-emerald-400"; else if (actLevel >= 3) bgClass = "bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
                const isToday = i === 27 ? "ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-gray-900 transform scale-110" : "";
                html += `<div class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] ${bgClass} ${isToday} transition-all duration-300 hover:scale-125 cursor-pointer hover:ring-2 ring-gray-400" title="Aktivitas: ${actLevel}"></div>`;
            }
            container.innerHTML = html;
        };

        window.renderAchievements = function() {
            const container = document.getElementById('achievements-container'); if(!container) return;
            const radar = window.playerState.radar; const overallLevel = Math.floor(window.playerState.exp / 1000) + 1; const s = window.playerState.stats;
            container.innerHTML = BADGE_DEFS.map(b => {
                let level = 0;
                if (b.stat) level = Math.min(25, Math.floor(radar[b.stat] / 4)); 
                else if (b.type === 'overall_lvl') level = Math.min(25, Math.floor(overallLevel / 2));
                else if (b.type === 'epic_quests') level = Math.min(25, s.epicCompleted);
                else if (b.type === 'total_quests') level = Math.min(25, Math.floor(s.questsCompleted / 10));
                else if (b.type === 'tasbih_total') level = Math.min(25, Math.floor(s.tasbihTotal / 500));
                const isLocked = level === 0;
                let cardClass = isLocked ? "bg-gray-100 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 opacity-60 grayscale filter" : "bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/10 border border-yellow-300 dark:border-yellow-600/50 shadow-sm transform hover:scale-105 hover:shadow-md transition-all cursor-pointer group";
                let titleClass = isLocked ? "text-gray-400 dark:text-gray-500" : "text-yellow-700 dark:text-yellow-500";
                return `<div class="${cardClass} rounded-2xl p-3 flex flex-col items-center text-center relative" title="${b.desc}"><span class="text-3xl mb-1.5 filter drop-shadow-sm ${!isLocked ? 'group-hover:animate-bounce' : ''}">${b.icon}</span><span class="text-[9px] font-black ${titleClass} leading-tight">${b.title}</span>${!isLocked ? `<span class="absolute -top-2 -right-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">Lv.${level}</span>` : ''}</div>`;
            }).join('');
        };

        const rarityColors = {
            "Common": "text-gray-500 bg-gray-100 dark:bg-gray-800",
            "Rare": "text-blue-500 bg-blue-100 dark:bg-blue-900/30 border border-blue-500/30",
            "Epic": "text-purple-500 bg-purple-100 dark:bg-purple-900/30 border border-purple-500/30",
            "Legendary": "text-red-500 bg-red-100 dark:bg-red-900/30 border border-red-500/30",
            "Mythic": "text-amber-500 bg-amber-100 dark:bg-amber-900/30 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
        };
        
        window.switchSkinTab = (tab) => {
            if(navigator.vibrate) navigator.vibrate(10);
            currentSkinTab = tab;
            const tabTasbih = document.getElementById('tab-skin-tasbih'); const tabCard = document.getElementById('tab-skin-card');
            if(tabTasbih && tabCard) {
                tabTasbih.className = tab === 'tasbih' ? "flex-1 text-[10px] font-black uppercase py-2 rounded-lg bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm transition-all duration-300" : "flex-1 text-[10px] font-black uppercase py-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-300";
                tabCard.className = tab === 'card' ? "flex-1 text-[10px] font-black uppercase py-2 rounded-lg bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm transition-all duration-300" : "flex-1 text-[10px] font-black uppercase py-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-300";
            }
            window.renderSkinCollection();
        };

        window.equipSkin = (type, skinId) => {
            window.playerState.activeSkins[type] = skinId; window.saveState();
            window.renderSkinCollection(); window.renderProfileTexts(); window.initTasbih();
            window.showToast("Kosmetik Berhasil Digunakan! ✨", "success");
            if(navigator.vibrate) navigator.vibrate(30);
            if(typeof confetti === 'function') confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        };

        window.renderSkinCollection = function() {
            const container = document.getElementById('skin-collection-container'); if(!container) return;
            const items = SKINS[currentSkinTab]; const s = window.playerState.stats;
            
            container.innerHTML = items.map(skin => {
                let isUnlocked = true; let currentReq = 0;
                if(currentSkinTab === 'tasbih') { currentReq = s.tasbihTotal; isUnlocked = currentReq >= skin.req; }
                else { currentReq = skin.reqType === 'epic' ? s.epicCompleted : s.questsCompleted; isUnlocked = currentReq >= skin.req; }
                
                const isEquipped = window.playerState.activeSkins[currentSkinTab] === skin.id;
                
                let btnHtml = "";
                if(isEquipped) btnHtml = `<span class="text-[9px] font-black bg-blue-500 text-white px-3.5 py-1.5 rounded-lg shadow-inner tracking-widest shrink-0">DIPAKAI</span>`;
                else if(isUnlocked) btnHtml = `<button onclick="window.equipSkin('${currentSkinTab}', '${skin.id}')" class="text-[9px] font-black bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-3.5 py-1.5 rounded-lg transition-transform active:scale-90 tracking-widest shadow-sm shrink-0">PAKAI</button>`;
                else btnHtml = `<span class="text-[8px] font-bold text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-700 px-2 py-1.5 rounded-lg tracking-widest bg-gray-50 dark:bg-gray-800/50 shrink-0">🔒 TERKUNCI</span>`;

                const bgClass = isEquipped ? "bg-blue-50 dark:bg-blue-900/10 border-blue-400 dark:border-blue-500/50 ring-1 ring-blue-500/20" : (isUnlocked ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300" : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-800 opacity-60 grayscale-[50%]");
                const rarityBadge = `<span class="text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${rarityColors[skin.rarity]}">${skin.rarity}</span>`;
                
                let previewHtml = "";
                if(currentSkinTab === 'tasbih') {
                    previewHtml = `<div class="w-14 h-14 rounded-full flex flex-col items-center justify-center text-sm shadow-md flex-shrink-0 relative ${skin.previewClass}"><span class="opacity-80 leading-none">${skin.icon}</span></div>`;
                } else {
                    previewHtml = `<div class="w-12 h-16 rounded-lg shadow-md flex-shrink-0 relative overflow-hidden flex flex-col justify-between p-1.5 border border-white/20 ${skin.previewClass}"><div class="w-4 h-4 rounded-full bg-white/30 border border-white/50 flex items-center justify-center text-[5px]">${skin.icon}</div><div class="h-1.5 w-full bg-white/20 rounded mt-auto"></div></div>`;
                }

                return `<div class="flex items-center justify-between p-3.5 rounded-[1.2rem] border ${bgClass} transition-all duration-300 shadow-sm"><div class="flex items-center gap-3.5">${previewHtml}<div><div class="flex items-center gap-1.5 mb-1"><h4 class="font-black text-sm text-gray-900 dark:text-white leading-tight">${skin.name}</h4>${isUnlocked ? rarityBadge : ''}</div>${!isUnlocked ? `<p class="text-[9px] text-gray-500 tracking-wide">${skin.desc}</p>` : `<p class="text-[9px] text-emerald-500 font-bold">Unik Tersedia ✓</p>`}</div></div><div>${btnHtml}</div></div>`;
            }).join('');
        };

        window.openFlexCardModal = function() {
            if(navigator.vibrate) navigator.vibrate(30);
            const r = window.playerState.radar; const overall = Math.floor((r.pusat + r.aura + r.peka + r.sigma + r.derma + r.stoic) / 6);
            const flexScore = document.getElementById('flex-overall-score'); if(flexScore) flexScore.innerText = overall;
            window.renderRadarChart('flex');
            const m = document.getElementById('flex-card-modal'); if(m) { m.classList.remove('hidden'); m.classList.add('flex'); setTimeout(() => { m.classList.remove('opacity-0'); }, 10); }
        };
        window.closeFlexCardModal = function() { 
            const m = document.getElementById('flex-card-modal'); if(m) { m.classList.add('opacity-0'); setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300); }
        };

        // --- Inisiasi Utama Aplikasi ---
        document.addEventListener("DOMContentLoaded", () => {
            window.checkDailyReset(); 
            const viewStats = document.getElementById('view-stats'); if(viewStats) viewStats.style.display = 'none';

            window.verifyServerTime();
            window.initDailyCountdown();
            
            setTimeout(() => {
                window.initDailyQuestData();
                window.renderSholatWajib();
                window.renderMissions();
                window.checkEpicUnlock();
                window.renderSpecialQuests();
                window.initTasbih();
            }, 300);
            
            setInterval(() => { window.renderSholatWajib(); }, 60000); 
        });

/* ========================================================================== */
/* ✂️ END COPY UNTUK: stats.js                                               */
/* ========================================================================== */

