window.apps = window.apps || [];
window.masterVolume = 0.8;
window.currentHue = 0;
window.currentSat = 100;
window.currentBri = 100;
window.darkMode = false;
window.coloredButtons = true;
window.multiplayerEnabled = true;
window.sfxEnabled = true;
window.vibrationEnabled = true;
window.fpsEnabled = false;
window.autoSaveEnabled = true;
window.notificationsEnabled = true;
window.notifSoundEnabled = true;
window.screensaverEnabled = true;
window.wifiEnabled = true;
window.sleepTimer = 30;
window.dpadSensitivity = 50;
window.vibrationAmount = 10;
window.handedness = 'right';

window.NotificationService = (function () {
    const STORAGE_KEY = 'pocketjs_notifications';
    let notifications = [];
    let actionCallbacks = {};
    let popupTimeout = null;

    function loadNotifications() {
        try {
            const stored = window.PocketDB.getItem(STORAGE_KEY);
            notifications = stored ? JSON.parse(stored) : [];
        } catch (e) {
            notifications = [];
        }
    }

    function saveNotifications() {
        const str = JSON.stringify(notifications);
        window.PocketDB.setItem(STORAGE_KEY, str);
    }

    function generateId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function getTypeStyle(type) {
        const styles = {
        };
        return styles[type] || styles.default;
    }

    function updateNotificationDot() {
        const dots = document.querySelectorAll('.noti-dot');
        dots.forEach(dot => {
            dot.style.display = notifications.length > 0 ? 'block' : 'none';
        });
    }

    function showPopup(notif) {
        document.querySelectorAll('.notif-popup').forEach(el => el.remove());

        if (popupTimeout) {
            clearTimeout(popupTimeout);
        }

        let buttonsHtml = '';
        if (notif.buttons && notif.buttons.length > 0) {
            buttonsHtml = `<div class="notif-popup-btns">
                ${notif.buttons.map((btn, idx) => `
                    <button class="notif-popup-btn" data-action="${btn.action}">${btn.label}</button>
                `).join('')}
            </div>`;
        }

        const iconHtml = notif.thumbnail
            ? `<img class="notif-popup-thumb" src="${notif.thumbnail}" alt="">`
            : `<div class="notif-popup-icon"></div>`;

        const popupInnerHtml = `
            ${iconHtml}
            <div class="notif-popup-content">
                <div class="notif-popup-title">${escapeHtml(notif.title)}</div>
                <div class="notif-popup-body">${escapeHtml(notif.body)}</div>
            </div>
            ${buttonsHtml}
        `;

        document.querySelectorAll('.os-interface').forEach(os => {
            const popup = document.createElement('div');
            popup.className = 'notif-popup';
            popup.innerHTML = popupInnerHtml;
            os.appendChild(popup);

            popup.querySelectorAll('.notif-popup-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.target.dataset.action;
                    if (actionCallbacks[action]) {
                        actionCallbacks[action](notif);
                    }
                    document.querySelectorAll('.notif-popup').forEach(el => el.remove());
                    if (popupTimeout) clearTimeout(popupTimeout);
                    e.stopPropagation();
                });
            });
        });

        popupTimeout = setTimeout(() => {
            document.querySelectorAll('.notif-popup').forEach(popup => {
                popup.classList.add('notif-popup-hide');
                setTimeout(() => popup.remove(), 300);
            });
        }, 4000);
    }

    function updatePopupOnScreen(id, notif) {
        document.querySelectorAll('.notif-popup').forEach(popup => {

            const titleEl = popup.querySelector('.notif-popup-title');
            const bodyEl = popup.querySelector('.notif-popup-body');
            const btnsContainer = popup.querySelector('.notif-popup-btns');

            if (titleEl) titleEl.textContent = notif.title;
            if (bodyEl) bodyEl.textContent = notif.body;

            if (btnsContainer && notif.buttons) {
                const btnEls = btnsContainer.querySelectorAll('.notif-popup-btn');
                notif.buttons.forEach((btn, idx) => {
                    if (btnEls[idx]) {
                        if (btnEls[idx].textContent !== btn.label) {
                            btnEls[idx].textContent = btn.label;
                        }
                    } else {

                    }
                });
            }
        });
    }

    function updateNotificationOnScreen(id, notif) {
        document.querySelectorAll('.nc-item[data-id="' + id + '"]').forEach(item => {
            const titleEl = item.querySelector('.nc-title');
            const bodyEl = item.querySelector('.nc-desc');
            const btnsContainer = item.querySelector('.nc-buttons');

            if (titleEl) titleEl.textContent = notif.title;
            if (bodyEl) bodyEl.textContent = notif.body;

            if (btnsContainer && notif.buttons && notif.buttons.length > 0) {
                const btnEls = btnsContainer.querySelectorAll('.nc-btn-action');
                if (btnEls.length === notif.buttons.length) {
                    notif.buttons.forEach((btn, idx) => {
                        if (btnEls[idx].textContent !== btn.label) {
                            btnEls[idx].textContent = btn.label;
                        }
                    });
                } else {

                    btnsContainer.innerHTML = notif.buttons.map((btn, idx) => `
                        <button class="nc-btn nc-btn-action" data-notif-id="${notif.id}" data-btn-index="${idx}">${btn.label}</button>
                    `).join('');

                    btnsContainer.querySelectorAll('.nc-btn-action').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const notifId = e.target.dataset.notifId;
                            const btnIndex = parseInt(e.target.dataset.btnIndex);
                            const n = notifications.find(not => not.id === notifId);
                            if (n && n.buttons && n.buttons[btnIndex]) {
                                const actionKey = n.buttons[btnIndex].action;
                                if (actionKey && typeof actionCallbacks[actionKey] === 'function') {
                                    actionCallbacks[actionKey](n);
                                }
                            }
                            e.stopPropagation();
                        });
                    });
                }
            }
        });
        updateNotificationFocus();
    }

    function playNotificationSound() {
        if (window.sfxEnabled && window.notifSoundEnabled) {
            window.playSfx('assets/notification.mp3', 0.6);
        }
    }

    function updateNotificationFocus() {
        const ncLists = document.querySelectorAll('.nc-list');
        if (ncLists.length === 0) return;

        const list = ncLists[0];
        const ncItems = list.querySelectorAll('.nc-item');

        let currentFocus = parseInt(list.dataset.focusIndex);
        if (isNaN(currentFocus)) currentFocus = 0;

        if (ncItems.length === 0) {
            currentFocus = -1;
        } else {
            currentFocus = Math.max(-1, Math.min(currentFocus, ncItems.length - 1));
        }

        let subFocus = parseInt(list.dataset.subFocusIndex) || 0;
        if (currentFocus >= 0) {
            const focusedItem = ncItems[currentFocus];
            if (focusedItem) {
                const btns = focusedItem.querySelectorAll('.nc-btn-action, .nc-btn-delete');
                subFocus = Math.max(0, Math.min(subFocus, btns.length - 1));
            }
        }

        ncLists.forEach(l => {
            l.dataset.focusIndex = currentFocus;
            l.dataset.subFocusIndex = subFocus;
        });

        document.querySelectorAll('.notification-center').forEach(nc => {
            if (currentFocus === -1) {
                nc.classList.add('nc-header-focused');
                const listEl = nc.querySelector('.nc-list');
                if (listEl) listEl.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                nc.classList.remove('nc-header-focused');
            }
        });

        ncLists.forEach(listEl => {
            const items = listEl.querySelectorAll('.nc-item');
            items.forEach((item, idx) => {
                if (idx === currentFocus) {
                    item.classList.add('nc-item-focused');

                    if (currentFocus === 0) {
                        listEl.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (currentFocus === items.length - 1) {
                        listEl.scrollTo({ top: listEl.scrollHeight, behavior: 'smooth' });
                    } else {
                        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }

                    const subBtns = item.querySelectorAll('.nc-btn-action, .nc-btn-delete');
                    subBtns.forEach((btn, sIdx) => {
                        if (sIdx === subFocus) btn.classList.add('sub-focused');
                        else btn.classList.remove('sub-focused');
                    });
                } else {
                    item.classList.remove('nc-item-focused');
                    item.querySelectorAll('.sub-focused').forEach(b => b.classList.remove('sub-focused'));
                }
            });
        });
    }

    function renderNotificationCenter() {
        const listEls = document.querySelectorAll('.nc-list');
        if (listEls.length === 0) return;

        let contentHtml = '';
        if (notifications.length === 0) {
            contentHtml = '<div class="nc-empty">No notifications</div>';
        } else {
            contentHtml = notifications.map(n => {
                const timeStr = formatTime(n.timestamp);

                let iconHtml;
                if (n.thumbnail) {
                    iconHtml = `<img src="${n.thumbnail}" class="nc-thumb" alt="">`;
                } else {
                    iconHtml = `<div class="nc-icon"></div>`;
                }

                let buttonsHtml = '';
                if (n.buttons && n.buttons.length > 0) {
                    buttonsHtml = `<div class="nc-buttons">
                        ${n.buttons.map((btn, idx) => `
                            <button class="nc-btn nc-btn-action" data-notif-id="${n.id}" data-btn-index="${idx}">${btn.label}</button>
                        `).join('')}
                    </div>`;
                }

                return `
                    <div class="nc-item" data-id="${n.id}">
                        ${iconHtml}
                        <div class="nc-content">
                            <div class="nc-header-row">
                                <div class="nc-title">${escapeHtml(n.title)}</div>
                                <div class="nc-time">${timeStr}</div>
                            </div>
                            <div class="nc-desc">${escapeHtml(n.body)}</div>
                            ${buttonsHtml}
                        </div>
                        <button class="nc-btn nc-btn-delete" data-notif-id="${n.id}">&times;</button>
                    </div>
                `;
            }).join('');
        }

        listEls.forEach(listEl => {
            const currentFocus = parseInt(listEl.dataset.focusIndex) || 0;
            const subFocus = parseInt(listEl.dataset.subFocusIndex) || 0;

            listEl.innerHTML = contentHtml;

            updateNotificationFocus();

            listEl.querySelectorAll('.nc-btn-action').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const notifId = e.target.dataset.notifId;
                    const btnIndex = parseInt(e.target.dataset.btnIndex);
                    const notif = notifications.find(n => n.id === notifId);
                    if (notif && notif.buttons && notif.buttons[btnIndex]) {
                        const actionKey = notif.buttons[btnIndex].action;
                        if (actionKey && typeof actionCallbacks[actionKey] === 'function') {
                            actionCallbacks[actionKey](notif);
                        }
                    }
                    e.stopPropagation();
                });
            });

            listEl.querySelectorAll('.nc-btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const notifId = e.target.dataset.notifId;
                    remove(notifId);

                    updateNotificationFocus();
                    e.stopPropagation();
                });
            });
        });

        updateNotificationDot();
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    function addActionListener(action, callback) {
        actionCallbacks[action] = callback;
    }

    function getAppThumbnail(appId) {
        if (!appId) return null;
        const app = window.apps.find(a => a.id === appId);
        return app ? app.thumbnail : null;
    }

    function show(options) {
        const appThumbnail = options.appId ? getAppThumbnail(options.appId) : null;

        const notif = {
            id: options.id || generateId(),
            title: options.title || 'Notification',
            body: options.body || '',
            appId: options.appId || null,
            thumbnail: appThumbnail || options.thumbnail || null,
            timestamp: Date.now(),
            buttons: options.buttons || [],
            read: false
        };

        notifications.unshift(notif);
        if (notifications.length > 100) {
            notifications = notifications.slice(0, 100);
        }
        saveNotifications();

        renderNotificationCenter();
        showPopup(notif);
        playNotificationSound();

        return notif.id;
    }

    function update(id, options) {
        const index = notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            notifications[index] = { ...notifications[index], ...options };
            if (!options.silent) {
                saveNotifications();
                updateNotificationOnScreen(id, notifications[index]);
                updatePopupOnScreen(id, notifications[index]);
            }
            return true;
        }
        return false;
    }

    function remove(id) {
        notifications = notifications.filter(n => n.id !== id);
        saveNotifications();
        renderNotificationCenter();
    }

    function clear() {
        notifications = [];
        saveNotifications();
        renderNotificationCenter();
    }

    function markAsRead(id) {
        const notif = notifications.find(n => n.id === id);
        if (notif) {
            notif.read = true;
            saveNotifications();
            renderNotificationCenter();
        }
    }

    function markAllAsRead() {
        notifications.forEach(n => n.read = true);
        saveNotifications();
        renderNotificationCenter();
    }

    function getAll() {
        return [...notifications];
    }

    function getUnreadCount() {
        return notifications.filter(n => !n.read).length;
    }

    function schedule(options, delayMs) {
        return new Promise((resolve) => {
            const timeoutId = setTimeout(async () => {
                const id = show(options);
                resolve(id);
            }, delayMs);

            return () => clearTimeout(timeoutId);
        });
    }

    function init() {
        loadNotifications();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', renderNotificationCenter);
        } else {
            renderNotificationCenter();
        }
    }

    init();

    return {
        show,
        remove,
        clear,
        markAsRead,
        markAllAsRead,
        getAll,
        getUnreadCount,
        schedule,
        addActionListener,
        update,
        updateFocus: updateNotificationFocus,
        render: renderNotificationCenter
    };
})();

window.AchievementService = (function () {
    const STORAGE_KEY = 'pocketjs_achievements';
    const PLAYTIME_KEY = 'pocketjs_playtime';
    let achievements = {};
    let playtime = {};
    let sessionStart = null;
    let sessionAppId = null;

    let toastQueue = [];
    let isShowingToast = false;

    function load() {
        try {
            achievements = JSON.parse(window.PocketDB.getItem(STORAGE_KEY)) || {};
            playtime = JSON.parse(window.PocketDB.getItem(PLAYTIME_KEY)) || {};
        } catch (e) {
            achievements = {};
            playtime = {};
        }
    }

    function save() {
        window.PocketDB.setItem(STORAGE_KEY, JSON.stringify(achievements));
        window.PocketDB.setItem(PLAYTIME_KEY, JSON.stringify(playtime));
    }

    function grant(appId, achievement) {
        if (!appId || !achievement || !achievement.id) return false;
        if (!achievements[appId]) achievements[appId] = [];
        if (achievements[appId].find(a => a.id === achievement.id)) return false;

        const record = {
            id: achievement.id,
            title: achievement.title || 'Achievement Unlocked',
            description: achievement.description || '',
            difficulty: achievement.difficulty || 'normal',
            icon: achievement.icon || '🏆',
            image: achievement.image || null,
            trophy: achievement.trophy || 'bronze',
            unlockedAt: Date.now()
        };
        achievements[appId].push(record);
        save();

        window.PocketDB.addAchievement(appId, {
                achievement_id: achievement.id,
                title: achievement.title || 'Achievement Unlocked',
                description: achievement.description || '',
                difficulty: achievement.difficulty || 'normal',
                icon: achievement.icon || '',
                image: achievement.image || null,
                trophy: achievement.trophy || 'bronze',
                unlocked_at: Date.now()
            });

        queueToast(record);

        checkPlatinum(appId);

        return true;
    }

    function checkPlatinum(appId) {
        const app = window.apps.find(a => a.id === appId);
        if (!app || !app.achievements) return;

        const platDef = app.achievements.find(a => a.trophy === 'platinum');
        if (!platDef) return;

        if (achievements[appId].find(a => a.id === platDef.id)) return;

        const otherDefs = app.achievements.filter(a => a.trophy !== 'platinum');
        const allUnlocked = otherDefs.every(def => achievements[appId].find(a => a.id === def.id));

        if (allUnlocked && otherDefs.length > 0) {
            grant(appId, platDef);
        }
    }

    function queueToast(record, isCheat = false) {
        toastQueue.push({ record, isCheat });
        processQueue();
    }

    function processQueue() {
        if (isShowingToast || toastQueue.length === 0) return;

        isShowingToast = true;
        const item = toastQueue.shift();
        if (item.isCheat) {
            showCheatToast(item.record);
        } else {
            showToast(item.record);
        }
    }

    function showToast(record) {
        if (window.sfxEnabled) {
            const sound = record.trophy === 'platinum' ? 'assets/achivement-plat.mp3' : 'assets/achivement.mp3';
            window.playSfx(sound, 0.8);
        }
        document.querySelectorAll('.screen, .m-screen').forEach(screen => {
            const existing = screen.querySelector('.achievement-toast');
            if (existing) existing.remove();

            const toast = document.createElement('div');
            toast.className = 'achievement-toast ach-toast-' + (record.trophy || 'bronze');

            const iconContent = record.image
                ? `<img src="${record.image}" alt="" style="width:100%;height:100%;object-fit:contain;">`
                : `<div style="font-size:calc(var(--scale) * 0.04)">${record.icon}</div>`;

            const trophyImg = `./assets/a-${record.trophy || 'bronze'}.png`;

            toast.innerHTML = `
                <div class="ach-toast-icon">${iconContent}</div>
                <div class="ach-toast-text">
                    <div class="ach-toast-label">Achievement Unlocked!</div>
                    <div class="ach-toast-title">${record.title}</div>
                </div>
                <div class="ach-toast-trophy">
                    <img src="${trophyImg}" alt="" style="height:calc(var(--scale) * 0.065); object-fit:contain;">
                </div>
            `;
            const osInterface = screen.querySelector('.os-interface');
            if (osInterface) osInterface.appendChild(toast);

            requestAnimationFrame(() => toast.classList.add('ach-toast-visible'));

            const displayDuration = record.trophy === 'platinum' ? 6000 : 3500;

            setTimeout(() => {
                toast.classList.remove('ach-toast-visible');
                setTimeout(() => {
                    toast.remove();

                    setTimeout(() => {
                        isShowingToast = false;
                        processQueue();
                    }, 400);
                }, 500);
            }, displayDuration);
        });
    }

    function showCheatToast(record) {
        if (window.sfxEnabled) {
            window.playSfx('assets/achivement.mp3', 0.8);
        }
        document.querySelectorAll('.screen, .m-screen').forEach(screen => {
            const existing = screen.querySelector('.achievement-toast');
            if (existing) existing.remove();

            const toast = document.createElement('div');
            toast.className = 'achievement-toast cheat-toast';
            toast.style.background = 'linear-gradient(135deg, #ff3b3b, #ff8a00)';
            toast.style.border = 'calc(var(--scale) * 0.005) solid rgba(255,255,255,0.3)';

            const iconContent = record.image
                ? `<img src="${record.image}" alt="" style="width:100%;height:100%;object-fit:contain;">`
                : `<div style="font-size:calc(var(--scale) * 0.04)">${record.icon || '⌨️'}</div>`;

            toast.innerHTML = `
                <div class="ach-toast-icon">${iconContent}</div>
                <div class="ach-toast-text">
                    <div class="ach-toast-label" style="color: rgba(255,255,255,0.8)">Cheat Activated!</div>
                    <div class="ach-toast-title" style="color: white">${record.title}</div>
                </div>
                <div class="ach-toast-trophy">
                    <div style="font-size:calc(var(--scale) * 0.05)">✨</div>
                </div>
            `;
            const osInterface = screen.querySelector('.os-interface');
            if (osInterface) osInterface.appendChild(toast);

            requestAnimationFrame(() => toast.classList.add('ach-toast-visible'));

            setTimeout(() => {
                toast.classList.remove('ach-toast-visible');
                setTimeout(() => {
                    toast.remove();
                    setTimeout(() => {
                        isShowingToast = false;
                        processQueue();
                    }, 400);
                }, 500);
            }, 3500);
        });
    }

    function getForApp(appId) {
        return achievements[appId] || [];
    }

    function getAll() {
        return achievements;
    }

    function startSession(appId) {
        sessionAppId = appId;
        sessionStart = Date.now();
    }

    function endSession() {
        if (sessionAppId && sessionStart) {
            const elapsed = Date.now() - sessionStart;
            if (!playtime[sessionAppId]) playtime[sessionAppId] = 0;
            playtime[sessionAppId] += elapsed;
            save();
            window.PocketDB.addPlaytime(sessionAppId, elapsed);
        }
        sessionAppId = null;
        sessionStart = null;
    }

    function getPlaytime(appId) {
        let total = playtime[appId] || 0;
        if (sessionAppId === appId && sessionStart) {
            total += Date.now() - sessionStart;
        }
        return total;
    }

    function formatPlaytime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m`;
        return 'Less than 1m';
    }

    function unlock(achId) {
        if (!window.activeApp || !window.activeApp.achievements) return;
        const appId = window.activeApp.id;
        const def = window.activeApp.achievements.find(a => a.id === achId);
        if (def) {
            grant(appId, def);
        }
    }

    function clearAll() {
        achievements = {};
        playtime = {};
        save();
        window.PocketDB.clearAllAchievements();
    }

    load();

    return {
        grant,
        unlock,
        getForApp,
        getAll,
        startSession,
        endSession,
        getPlaytime,
        formatPlaytime,
        clearAll,
        queueToast
    };
})();

window.CheatService = (function () {
    const activeCheats = new Set();
    let inputHistory = [];
    const MAX_HISTORY = 20;

    const cheats = [
        {
            id: 'quadruple_merge',
            title: 'Quadruple Power',
            sequence: ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'],
            image: './games/2048/assets/a-plat.png'
        }
    ];

    function handleInput(action) {
        inputHistory.push(action);
        if (inputHistory.length > MAX_HISTORY) inputHistory.shift();

        cheats.forEach(cheat => {
            const seq = cheat.sequence;
            if (inputHistory.length >= seq.length) {
                const lastN = inputHistory.slice(-seq.length);
                if (lastN.every((val, i) => val === seq[i])) {
                    toggleCheat(cheat);
                    inputHistory = [];
                }
            }
        });
    }

    function toggleCheat(cheat) {
        if (activeCheats.has(cheat.id)) {
            activeCheats.delete(cheat.id);

        } else {
            activeCheats.add(cheat.id);
            if (window.AchievementService) {
                window.AchievementService.queueToast(cheat, true);
            }
        }
        window.dispatchEvent(new CustomEvent('cheatToggle', { detail: { id: cheat.id, active: activeCheats.has(cheat.id) } }));
    }

    function isActive(id) {
        return activeCheats.has(id);
    }

    return {
        handleInput,
        isActive,
        toggleCheat
    };
})();

window.InputService = (function () {
    const registry = {
        'dpad': {
            html: `
                <div class="dpad-module">
                    <svg class="dpad-cross" viewBox="0 0 669 669" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M448.769 157.231C448.769 192.025 476.975 220.231 511.769 220.231H606C640.794 220.231 669 248.438 669 283.231V385.765C669 420.559 640.794 448.765 606 448.765H511.769C476.975 448.765 448.769 476.971 448.769 511.765V606C448.769 640.794 420.562 669 385.769 669H283.235C248.441 669 220.235 640.794 220.235 606V511.765C220.235 476.971 192.029 448.765 157.235 448.765H63C28.2061 448.765 0 420.559 0 385.765V283.231C0 248.438 28.2061 220.231 63 220.231H157.235C192.029 220.231 220.235 192.025 220.235 157.231V63C220.235 28.2061 248.441 0 283.235 0H385.769C420.562 0 448.769 28.2061 448.769 63V157.231Z" fill="var(--btn-container)" />
                    </svg>
                    <div class="dpad-btn dpad-up" data-action="up">
                        <svg viewBox="0 0 239 152" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 35.0016C0 15.6718 15.6698 0.00185387 34.9996 0.0016159L153.641 0.000155292C161.794 5.49237e-05 169.691 2.84599 175.969 8.0468L225.462 49.0456C242.359 63.0424 242.359 88.9555 225.462 102.952L175.969 143.951C169.691 149.152 161.794 151.998 153.642 151.998L35.0004 152C15.6703 152 0 136.33 0 117V35.0016Z" fill="var(--btn-color)" /></svg>
                        <svg class="dpad-arrow" viewBox="0 0 58 90" fill="none"><path d="M35.4588 86.0598L3.77139 54.1208C-1.25708 49.0525 -1.25708 40.8772 3.77139 35.8089L35.4588 3.86992C43.6334 -4.36953 57.6875 1.41934 57.6875 13.0259L57.6875 76.9038C57.6875 88.5103 43.6334 94.2992 35.4588 86.0598Z" /></svg>
                    </div>
                    <div class="dpad-btn dpad-down" data-action="down">
                        <svg viewBox="0 0 239 152" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 35.0016C0 15.6718 15.6698 0.00185387 34.9996 0.0016159L153.641 0.000155292C161.794 5.49237e-05 169.691 2.84599 175.969 8.0468L225.462 49.0456C242.359 63.0424 242.359 88.9555 225.462 102.952L175.969 143.951C169.691 149.152 161.794 151.998 153.642 151.998L35.0004 152C15.6703 152 0 136.33 0 117V35.0016Z" fill="var(--btn-color)" /></svg>
                        <svg class="dpad-arrow" viewBox="0 0 58 90" fill="none"><path d="M35.4588 86.0598L3.77139 54.1208C-1.25708 49.0525 -1.25708 40.8772 3.77139 35.8089L35.4588 3.86992C43.6334 -4.36953 57.6875 1.41934 57.6875 13.0259L57.6875 76.9038C57.6875 88.5103 43.6334 94.2992 35.4588 86.0598Z" /></svg>
                    </div>
                    <div class="dpad-btn dpad-left" data-action="left">
                        <svg viewBox="0 0 239 152" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 35.0016C0 15.6718 15.6698 0.00185387 34.9996 0.0016159L153.641 0.000155292C161.794 5.49237e-05 169.691 2.84599 175.969 8.0468L225.462 49.0456C242.359 63.0424 242.359 88.9555 225.462 102.952L175.969 143.951C169.691 149.152 161.794 151.998 153.642 151.998L35.0004 152C15.6703 152 0 136.33 0 117V35.0016Z" fill="var(--btn-color)" /></svg>
                        <svg class="dpad-arrow" viewBox="0 0 58 90" fill="none"><path d="M35.4588 86.0598L3.77139 54.1208C-1.25708 49.0525 -1.25708 40.8772 3.77139 35.8089L35.4588 3.86992C43.6334 -4.36953 57.6875 1.41934 57.6875 13.0259L57.6875 76.9038C57.6875 88.5103 43.6334 94.2992 35.4588 86.0598Z" /></svg>
                    </div>
                    <div class="dpad-btn dpad-right" data-action="right">
                        <svg viewBox="0 0 239 152" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 35.0016C0 15.6718 15.6698 0.00185387 34.9996 0.0016159L153.641 0.000155292C161.794 5.49237e-05 169.691 2.84599 175.969 8.0468L225.462 49.0456C242.359 63.0424 242.359 88.9555 225.462 102.952L175.969 143.951C169.691 149.152 161.794 151.998 153.642 151.998L35.0004 152C15.6703 152 0 136.33 0 117V35.0016Z" fill="var(--btn-color)" /></svg>
                        <svg class="dpad-arrow" viewBox="0 0 58 90" fill="none"><path d="M35.4588 86.0598L3.77139 54.1208C-1.25708 49.0525 -1.25708 40.8772 3.77139 35.8089L35.4588 3.86992C43.6334 -4.36953 57.6875 1.41934 57.6875 13.0259L57.6875 76.9038C57.6875 88.5103 43.6334 94.2992 35.4588 86.0598Z" /></svg>
                    </div>
                </div>
            `
        },
        'buttons': {
            html: `
                <div class="action-module">
                    <svg class="action-bg" viewBox="0 0 711 683" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M664.871 223.853C673.822 134.473 608.621 54.7595 519.241 45.8087C474.221 41.3003 429.358 55.7484 395.43 85.6818L102.272 344.324C70.5335 372.326 50.5526 411.289 46.3351 453.404L45.8258 458.489C36.875 547.87 102.076 627.583 191.456 636.533C236.476 641.042 281.34 626.594 315.268 596.66L608.425 338.019C640.164 310.017 660.144 271.053 664.362 228.938L664.871 223.853Z" fill="var(--btn-container)" stroke="var(--btn-container)" stroke-width="90" />
                    </svg>
                    <div class="action-btn btn-top-right" data-action="a"><span class="btn-label">A</span></div>
                    <div class="action-btn btn-bottom-left" data-action="b"><span class="btn-label">B</span></div>
                </div>
            `
        },
        'large_button': {
            html: `
                <div class="large-btn-module">
                    <svg class="large-btn-bg" viewBox="0 0 400 400" style="position:absolute;width:100%;height:100%;">
                        <circle cx="200" cy="200" r="200" fill="var(--btn-container)"/>
                    </svg>
                    <div class="action-btn large-btn" data-action="a" style="width: 62%; height: 62%; position: relative; cursor: pointer; z-index: 1;">
                        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                            <circle cx="100" cy="100" r="100" fill="var(--btn-color)"/>
                            <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="'Jua', sans-serif" font-weight="bold" font-size="110" fill="var(--btn-icon)">A</text>
                        </svg>
                    </div>
                </div>
            `
        },
        'quad_buttons': {
            html: `
                <div class="quad-btn-module">
                    <svg class="quad-bg" viewBox="0 0 400 400" style="position:absolute;width:100%;height:100%;">
                        <circle cx="200" cy="200" r="200" fill="var(--btn-container)"/>
                    </svg>
                    <div class="action-btn quad-btn q-top" data-action="up" style="position: absolute; top: 8.5%; left: 50%; transform: translateX(-50%); width: 32%; height: 32%; cursor: pointer; z-index: 1;">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                            <circle cx="50" cy="50" r="50" fill="var(--btn-color)"/>
                            <path d="M50 25 L73 65 H27 Z" stroke="var(--btn-icon)" stroke-width="10" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="action-btn quad-btn q-left" data-action="left" style="position: absolute; left: 8.5%; top: 50%; transform: translateY(-50%); width: 32%; height: 32%; cursor: pointer; z-index: 1;">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                            <circle cx="50" cy="50" r="50" fill="var(--btn-color)"/>
                            <path d="M30 50 L70 25 L70 75 Z" stroke="var(--btn-icon)" stroke-width="10" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="action-btn quad-btn q-right" data-action="right" style="position: absolute; right: 8.5%; top: 50%; transform: translateY(-50%); width: 32%; height: 32%; cursor: pointer; z-index: 1;">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                            <circle cx="50" cy="50" r="50" fill="var(--btn-color)"/>
                            <path d="M70 50 L30 25 L30 75 Z" stroke="var(--btn-icon)" stroke-width="10" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="action-btn quad-btn q-bottom" data-action="down" style="position: absolute; bottom: 8.5%; left: 50%; transform: translateX(-50%); width: 32%; height: 32%; cursor: pointer; z-index: 1;">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                            <circle cx="50" cy="50" r="50" fill="var(--btn-color)"/>
                            <path d="M50 70 L25 30 L75 30 Z" stroke="var(--btn-icon)" stroke-width="10" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            `
        },
        'slider': {
            html: `
                <div class="slider-module">
                    <div class="slider-track">
                        <div class="slider-track-line"></div>
                        <div class="slider-fill"></div>
                        <div class="slider-handle input-part" data-action="slider">
                        </div>
                    </div>
                </div>
            `
        },
        'steering': {
            html: `
                <div class="steering-module dpad-module">
                    <div class="steering-wheel input-part" data-action="steering" style="width: 100%; height: 100%; cursor: grab; transition: transform 0.1s ease-out; position: relative;">
                        <svg width="100%" height="100%" viewBox="0 0 841 841" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="420.5" cy="420.5" r="420.5" fill="var(--btn-container)"/>
                            <path d="M420.5 53C623.465 53 788 217.535 788 420.5C788 623.465 623.465 788 420.5 788C217.535 788 53 623.465 53 420.5C53 217.535 217.535 53 420.5 53ZM267.963 635.809C259.631 648.254 262.685 665.201 275.664 672.672C318.308 697.218 367.764 711.258 420.5 711.258C473.282 711.258 522.778 697.194 565.447 672.609C578.419 665.134 581.468 648.192 573.139 635.751L530.033 571.365C524.91 563.712 516.307 559.119 507.098 559.119H334.043C324.834 559.119 316.231 563.712 311.108 571.365L267.963 635.809ZM150.161 403.248C139.473 401.809 129.742 409.716 129.742 420.5C129.742 473.755 144.06 523.665 169.055 566.593C177.333 580.809 196.542 582.628 208.647 571.488L250.375 533.085C257.829 526.225 260.926 515.833 258.443 506.012L239.941 432.817C237.177 421.884 228.04 413.732 216.864 412.228L150.161 403.248ZM622.531 412.464C611.535 413.944 602.494 421.866 599.581 432.573L580.352 503.261C577.646 513.208 580.709 523.834 588.294 530.815L632.401 571.407C644.508 582.549 663.722 580.727 671.996 566.505C696.96 523.597 711.258 473.718 711.258 420.5C711.258 409.727 701.537 401.828 690.86 403.265L622.531 412.464ZM420.5 129.742C308.755 129.742 211.733 192.78 163.056 285.235C155.569 299.454 163.637 316.386 178.962 321.22L277.823 352.408C280.509 353.256 283.31 353.687 286.126 353.687H555.024C557.841 353.687 560.641 353.256 563.328 352.408L662.059 321.261C677.383 316.427 685.451 299.498 677.967 285.279C629.298 192.8 532.263 129.742 420.5 129.742Z" fill="var(--btn-color)"/>
                        </svg>
                    </div>
                </div>
            `
        },
        'joystick': {
            html: `
                <div class="joystick-module dpad-module">
                    <div class="joystick-container" style="width: 100%; height: 100%; position: relative;">
                        <svg width="100%" height="100%" viewBox="0 0 757 757" fill="none">
                            <circle cx="378.5" cy="378.5" r="378.5" fill="var(--btn-container)"/>
                        </svg>
                        <div class="joystick-handle input-part" data-action="joystick" style="width: 48%; height: 48%; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); cursor: grab; z-index: 5;">
                            <svg width="100%" height="100%" viewBox="0 0 329 329" fill="none">
                                <circle cx="164.5" cy="164.5" r="164.5" fill="var(--btn-color)"/>
                                <path d="M205.595 64.2287L173.656 95.9161C168.588 100.945 160.412 100.945 155.344 95.9161L123.405 64.2287C115.166 56.0541 120.954 42 132.561 42H196.439C208.046 42 213.834 56.0541 205.595 64.2287Z" fill="var(--btn-icon)"/>
                                <path d="M205.595 265.771L173.656 234.084C168.588 229.055 160.412 229.055 155.344 234.084L123.405 265.771C115.166 273.946 120.954 288 132.561 288H196.439C208.046 288 213.834 273.946 205.595 265.771Z" fill="var(--btn-icon)"/>
                                <path d="M63.7287 123.905L95.4161 155.844C100.445 160.912 100.445 169.088 95.4161 174.156L63.7287 206.095C55.5541 214.334 41.5 208.546 41.5 196.939L41.5 133.061C41.5 121.455 55.5541 115.666 63.7287 123.905Z" fill="var(--btn-icon)"/>
                                <path d="M265.271 123.905L233.584 155.844C228.555 160.912 228.555 169.088 233.584 174.156L265.271 206.095C273.446 214.334 287.5 208.546 287.5 196.939L287.5 133.061C287.5 121.454 273.446 115.666 265.271 123.905Z" fill="var(--btn-icon)"/>
                            </svg>
                        </div>
                    </div>
                </div>
            `
        },
        'trackpad': {
            html: `
                <div class="trackpad-module dpad-module">
                    <div class="trackpad-surface input-part" data-action="trackpad">
                        <div class="trackpad-grid"></div>
                    </div>
                </div>
            `
        },
        'winder': {
            html: `
                <div class="winder-module dpad-module">
                    <svg class="winder-bg" viewBox="0 0 400 400" style="position:absolute;width:100%;height:100%;">
                        <circle cx="200" cy="200" r="200" fill="var(--btn-container)"/>
                    </svg>
                    <div class="winder-handle input-part" data-action="winder" style="width: 120%; height: 60%; position: absolute; left: 50%; top: 50%; transform: translate(-26.13%, -50%); transform-origin: 26.13% 50%; cursor: grab; z-index: 5;">
                        <svg width="100%" height="100%" viewBox="0 0 333 172" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path class="winder-path" d="M85.5 0C110.374 0 132.767 10.6845 148.391 27.7396C161.108 41.6222 177.235 54 196.062 54H205.263C220.564 54 234.224 45.179 247.283 37.2036C255.808 31.9969 265.807 29 276.5 29C307.704 29 333 54.5198 333 86C333 117.48 307.704 143 276.5 143C265.807 143 255.808 140.003 247.283 134.796C234.224 126.821 220.564 118 205.263 118H196.062C177.235 118 161.108 130.378 148.391 144.26C132.767 161.315 110.374 172 85.5 172C38.2797 172 0 133.496 0 86C0 38.5035 38.2797 0 85.5 0Z" fill="var(--btn-color)"/>
                            <circle class="winder-detail" cx="277" cy="86" r="29" fill="var(--btn-icon)"/>
                            <circle class="winder-detail" cx="87" cy="86" r="34" fill="var(--btn-icon)"/>
                        </svg>
                    </div>
                </div>
            `
        }
    };

    const currentTypes = { left: null, right: null };
    const fadingSides = new Set();
    const activeReturnRafs = new Set();
    const currentOptions = { left: {}, right: {} };

    function cancelActiveAnimations() {
        activeReturnRafs.forEach(raf => cancelAnimationFrame(raf));
        activeReturnRafs.clear();
    }

    function render(side, type, options = {}, force = false) {
        if (fadingSides.has(side)) return;

        if (!force && currentTypes[side] === type && JSON.stringify(currentOptions[side]) === JSON.stringify(options)) return;

        const desktopId = side === 'left' ? 'desktop-input-left' : 'desktop-input-right';
        const mobileId = side === 'left' ? 'mobile-input-left' : 'mobile-input-right';

        const containers = [document.getElementById(desktopId), document.getElementById(mobileId)];
        const config = registry[type] || registry['dpad'];

        currentTypes[side] = type;
        currentOptions[side] = options;
        fadingSides.add(side);

        containers.forEach(container => {
            if (container) container.classList.add('input-hidden');
        });

        setTimeout(() => {
            if (side === 'left') cancelActiveAnimations();
            containers.forEach(container => {
                if (!container) return;
                container.innerHTML = config.html;
                bindEvents(container, side, options);
                container.classList.remove('input-hidden');
            });

            setTimeout(() => {
                fadingSides.delete(side);
            }, 300);
        }, 250);
    }

    function bindEvents(container, side, options = {}) {

        container.querySelectorAll('.dpad-btn').forEach(btn => {
            const action = btn.dataset.action;
            setupHoldButton(btn, action);
        });

        container.querySelectorAll('.quad-btn').forEach(btn => {
            const action = btn.dataset.action;
            setupHoldButton(btn, action);
        });

        container.querySelectorAll('.action-btn:not(.quad-btn)').forEach(btn => {
            const action = btn.dataset.action;
            setupPressButton(btn, action);
        });

        container.querySelectorAll('.slider-handle').forEach(handle => {
            let isDragging = false;
            const track = handle.closest('.slider-track');
            const fill = track ? track.querySelector('.slider-fill') : null;
            let currentValue = options.defaultValue !== undefined ? options.defaultValue : 50;
            let returnRaf = null;

            const updateSlider = (val, silent = false) => {
                currentValue = Math.max(0, Math.min(100, val));
                const pos = 100 - currentValue;
                handle.style.top = pos + '%';
                if (fill) fill.style.height = currentValue + '%';
                if (!silent) {
                    window.dispatchEvent(new CustomEvent('sliderInput', {
                        detail: { side, value: currentValue, type: options.id || 'default' }
                    }));
                }
            };

            const getValueFromClientY = (clientY) => {
                if (!track) return 50;
                const rect = track.getBoundingClientRect();
                let pos = (clientY - rect.top) / rect.height;
                pos = Math.max(0, Math.min(1, pos));
                return (1 - pos) * 100;
            };

            const startReturn = () => {
                if (isDragging || options.returnTo === undefined) return;
                const target = options.returnTo;
                const speed = options.returnSpeed || 0.15;
                if (Math.abs(currentValue - target) < 0.1) {
                    updateSlider(target);
                    return;
                }
                updateSlider(currentValue + (target - currentValue) * speed);
                returnRaf = requestAnimationFrame(startReturn);
                activeReturnRafs.add(returnRaf);
            };

            handle.addEventListener('pointerdown', (e) => {
                isDragging = true;
                cancelAnimationFrame(returnRaf);
                handle.setPointerCapture(e.pointerId);
                e.preventDefault();
            });

            handle.addEventListener('pointermove', (e) => {
                if (isDragging) updateSlider(getValueFromClientY(e.clientY));
            });

            handle.addEventListener('pointerup', () => {
                isDragging = false;
                startReturn();
                window.dispatchEvent(new CustomEvent('sliderRelease', {
                    detail: { side, type: options.id || 'default', value: currentValue }
                }));
            });
            handle.addEventListener('pointercancel', () => {
                isDragging = false;
                startReturn();
                window.dispatchEvent(new CustomEvent('sliderRelease', {
                    detail: { side, type: options.id || 'default', value: currentValue }
                }));
            });

            updateSlider(currentValue, true);
        });

        container.querySelectorAll('.joystick-handle').forEach(handle => {
            let isDragging = false;
            const joyContainer = handle.closest('.joystick-container');
            let returnRaf = null;
            let currentX = 0;
            let currentY = 0;

            const updateJoystick = (nx, ny, silent = false) => {
                currentX = nx;
                currentY = ny;

                const visualRange = 28;
                handle.style.left = (50 + (nx * visualRange)) + '%';
                handle.style.top = (50 + (ny * visualRange)) + '%';

                if (!silent) {
                    window.dispatchEvent(new CustomEvent('joystickInput', {
                        detail: { side, x: currentX, y: currentY, id: options.id || 'default' }
                    }));
                }
            };

            const handleMove = (clientX, clientY) => {
                const rect = joyContainer.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const radius = rect.width / 2;

                let dx = clientX - centerX;
                let dy = clientY - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > radius) {
                    dx = (dx / dist) * radius;
                    dy = (dy / dist) * radius;
                }

                updateJoystick(dx / radius, dy / radius);
            };

            const startReturn = () => {
                if (isDragging || options.autoReturn === false) return;
                const dist = Math.sqrt(currentX * currentX + currentY * currentY);
                if (dist < 0.05) {
                    updateJoystick(0, 0);
                    return;
                }
                updateJoystick(currentX * 0.8, currentY * 0.8);
                returnRaf = requestAnimationFrame(startReturn);
                activeReturnRafs.add(returnRaf);
            };

            handle.addEventListener('pointerdown', (e) => {
                isDragging = true;
                cancelAnimationFrame(returnRaf);
                handle.setPointerCapture(e.pointerId);
                e.preventDefault();
            });

            handle.addEventListener('pointermove', (e) => {
                if (isDragging) handleMove(e.clientX, e.clientY);
            });

            handle.addEventListener('pointerup', () => {
                isDragging = false;
                startReturn();
                window.dispatchEvent(new CustomEvent('joystickRelease', {
                    detail: { side, x: currentX, y: currentY, id: options.id || 'default' }
                }));
            });
            handle.addEventListener('pointercancel', () => {
                isDragging = false;
                startReturn();
                window.dispatchEvent(new CustomEvent('joystickRelease', {
                    detail: { side, x: currentX, y: currentY, id: options.id || 'default' }
                }));
            });

            updateJoystick(0, 0, true);
        });

        container.querySelectorAll('.steering-wheel').forEach(wheel => {
            let isDragging = false;
            let lastAngle = 0;
            let accumulatedRotation = 0;
            const MAX_ROTATION = (450 * Math.PI) / 180;
            let returnRaf = null;

            const getAngle = (clientX, clientY) => {
                const rect = wheel.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                return Math.atan2(clientY - centerY, clientX - centerX);
            };

            const applyRotation = (rot) => {
                accumulatedRotation = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, rot));
                wheel.style.transform = `rotate(${accumulatedRotation}rad)`;
                const normalized = accumulatedRotation / MAX_ROTATION;
                window.dispatchEvent(new CustomEvent('steeringInput', { detail: { value: normalized } }));
            };

            wheel.addEventListener('pointerdown', (e) => {
                isDragging = true;
                cancelAnimationFrame(returnRaf);
                wheel.setPointerCapture(e.pointerId);
                lastAngle = getAngle(e.clientX, e.clientY);
                e.preventDefault();
            });

            wheel.addEventListener('pointermove', (e) => {
                if (!isDragging) return;
                const currentAngle = getAngle(e.clientX, e.clientY);
                let delta = currentAngle - lastAngle;

                if (delta > Math.PI) delta -= 2 * Math.PI;
                if (delta < -Math.PI) delta += 2 * Math.PI;

                applyRotation(accumulatedRotation + delta);
                lastAngle = currentAngle;
            });

            const startSmoothReturn = () => {
                if (isDragging) return;
                if (Math.abs(accumulatedRotation) < 0.01) {
                    applyRotation(0);
                    return;
                }

                applyRotation(accumulatedRotation * 0.85);
                returnRaf = requestAnimationFrame(startSmoothReturn);
            };

            wheel.addEventListener('pointerup', () => {
                isDragging = false;
                startSmoothReturn();
            });
            wheel.addEventListener('pointercancel', () => {
                isDragging = false;
                startSmoothReturn();
            });
        });

        container.querySelectorAll('.trackpad-surface').forEach(surface => {
            let isDragging = false;

            const handleTouch = (e) => {
                const rect = surface.getBoundingClientRect();
                const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

                window.dispatchEvent(new CustomEvent('trackpadInput', {
                    detail: { side, x, y, id: options.id || 'default' }
                }));
            };

            surface.addEventListener('pointerdown', (e) => {
                isDragging = true;
                surface.setPointerCapture(e.pointerId);
                handleTouch(e);
                e.preventDefault();
            });

            surface.addEventListener('pointermove', (e) => {
                if (isDragging) handleTouch(e);
            });

            surface.addEventListener('pointerup', () => {
                isDragging = false;
                window.dispatchEvent(new CustomEvent('trackpadRelease', { detail: { side, id: options.id || 'default' } }));
            });
            surface.addEventListener('pointercancel', () => {
                isDragging = false;
                window.dispatchEvent(new CustomEvent('trackpadRelease', { detail: { side, id: options.id || 'default' } }));
            });
        });

        container.querySelectorAll('.winder-handle').forEach(handle => {
            let isDragging = false;
            let lastAngle = 0;
            let accumulatedRotation = 0;

            const getAngle = (clientX, clientY) => {
                const rect = handle.parentElement.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                return Math.atan2(clientY - centerY, clientX - centerX);
            };

            const applyRotation = (rot) => {
                accumulatedRotation = rot;
                handle.style.transform = `translate(-26.13%, -50%) rotate(${accumulatedRotation}rad)`;
                window.dispatchEvent(new CustomEvent('winderInput', { detail: { side, value: accumulatedRotation, id: options.id || 'default' } }));
            };

            handle.addEventListener('pointerdown', (e) => {
                isDragging = true;
                handle.setPointerCapture(e.pointerId);
                lastAngle = getAngle(e.clientX, e.clientY);
                e.preventDefault();
                handle.classList.add('btn-pressed');
            });

            handle.addEventListener('pointermove', (e) => {
                if (!isDragging) return;
                const currentAngle = getAngle(e.clientX, e.clientY);
                let delta = currentAngle - lastAngle;

                if (delta > Math.PI) delta -= 2 * Math.PI;
                if (delta < -Math.PI) delta += 2 * Math.PI;

                applyRotation(accumulatedRotation + delta);
                lastAngle = currentAngle;
            });

            const stopDragging = (e) => {
                if (isDragging) {
                    isDragging = false;
                    handle.classList.remove('btn-pressed');
                    handle.releasePointerCapture(e.pointerId);
                    window.dispatchEvent(new CustomEvent('winderRelease', { detail: { side, value: accumulatedRotation, id: options.id || 'default' } }));
                }
            };

            handle.addEventListener('pointerup', stopDragging);
            handle.addEventListener('pointercancel', stopDragging);
        });
    }

    function setupHoldButton(btn, action) {
        let holdRaf = null;
        let holdTimeout = null;
        let isHolding = false;

        const startHold = (e) => {
            if (isHolding) return;
            isHolding = true;
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            btn.classList.add('btn-pressed');

            if (typeof window.handleInputGlobal === 'function') window.handleInputGlobal(action);
            window.dispatchEvent(new CustomEvent('dpadHeld', { detail: { direction: action } }));
            if (window.vibrationEnabled && navigator.vibrate) navigator.vibrate(window.vibrationAmount);

            holdTimeout = setTimeout(() => {
                if (isHolding) {
                    holdRaf = setInterval(() => {
                        if (isHolding) {
                            if (typeof window.handleInputGlobal === 'function') window.handleInputGlobal(action);
                            window.dispatchEvent(new CustomEvent('dpadHeld', { detail: { direction: action } }));
                        }
                    }, 80);
                }
            }, 200);
        };

        const stopHold = (e) => {
            if (isHolding) {
                isHolding = false;
                if (holdTimeout) clearTimeout(holdTimeout);
                if (holdRaf) clearInterval(holdRaf);
                btn.classList.remove('btn-pressed');
                if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                }
                window.dispatchEvent(new CustomEvent('dpadRelease', { detail: { direction: action } }));
                window.dispatchEvent(new CustomEvent('appRelease', { detail: { action: action } }));
            }
        };

        btn.addEventListener('pointerdown', startHold);
        btn.addEventListener('pointerup', stopHold);
        btn.addEventListener('pointercancel', stopHold);
    }

    function setupPressButton(btn, action) {
        let isPressed = false;

        const startPress = (e) => {
            if (isPressed) return;
            isPressed = true;
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            btn.classList.add('btn-pressed');

            if (typeof window.handleInputGlobal === 'function') window.handleInputGlobal(action);
            if (window.vibrationEnabled && navigator.vibrate) navigator.vibrate(window.vibrationAmount);
        };

        const stopPress = (e) => {
            if (isPressed) {
                isPressed = false;
                btn.classList.remove('btn-pressed');
                if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                }
                window.dispatchEvent(new CustomEvent('appRelease', { detail: { action: action } }));
            }
        };

        btn.addEventListener('pointerdown', startPress);
        btn.addEventListener('pointerup', stopPress);
        btn.addEventListener('pointercancel', stopPress);
    }

    function setupMenuPills() {
        document.querySelectorAll('.menu-pill').forEach(pill => {
            if (pill.dataset.inputBound) return;
            pill.dataset.inputBound = 'true';

            const getPillAction = () => {
                const isRight = pill.closest('.side-panel:last-child, .m-menu-wrap .menu-pill:last-child');
                const isLeft = pill.closest('.side-panel:first-child, .m-menu-wrap .menu-pill:first-child');
                if (isLeft && !isRight) return 'pill-left';
                if (isRight && !isLeft) return 'pill-right';
                return null;
            };

            pill.addEventListener('pointerdown', () => {
                pill.classList.add('btn-pressed');
            });
            pill.addEventListener('pointerup', () => {
                pill.classList.remove('btn-pressed');
            });
            pill.addEventListener('pointercancel', () => {
                pill.classList.remove('btn-pressed');
            });
            pill.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = getPillAction();
                if (action && typeof window.handleInputGlobal === 'function') {
                    window.handleInputGlobal(action);
                }
            });
        });
    }

    return {
        render,
        init: function() {

            let left = 'dpad';
            let right = 'buttons';
            if (window.handedness === 'left') [left, right] = [right, left];

            this.render('left', left);
            this.render('right', right);
            setupMenuPills();
        }
    };
})();

window.playSfx = function (path, volumeScale = 1.0) {
    if (!window.sfxEnabled) return;
    const sfx = new Audio(path);
    sfx.volume = Math.min(1, window.masterVolume * volumeScale);
    sfx.play().catch(e => console.warn('SFX Error:', e));
};

(function () {
    const g = (k) => window.PocketDB.getItem(k);

    const h = g('pocketjs_hue');
    const s = g('pocketjs_sat');
    const b = g('pocketjs_bri');
    const d = g('pocketjs_dark');
    const v = g('pocketjs_vol');
    const c = g('pocketjs_colored');
    const mp = g('pocketjs_mp');
    const sfx = g('pocketjs_sfx');
    const vib = g('pocketjs_vib');
    const fps = g('pocketjs_fps');
    const as = g('pocketjs_autosave');
    const sen = g('pocketjs_sens');
    const han = g('pocketjs_handedness');
    const vibAmt = g('pocketjs_vib_amount');
    const notif = g('pocketjs_notif');
    const notifSound = g('pocketjs_notif_sound');
    const screensaver = g('pocketjs_screensaver');
    const wifi = g('pocketjs_wifi');
    const sleepT = g('pocketjs_sleep');

    if (h !== null) window.currentHue = parseFloat(h);
    if (s !== null) window.currentSat = parseFloat(s);
    if (b !== null) window.currentBri = parseFloat(b);
    if (d !== null) window.darkMode = d === 'true';
    if (v !== null) window.masterVolume = parseFloat(v);
    if (c !== null) window.coloredButtons = c === 'true';
    if (mp !== null) window.multiplayerEnabled = mp === 'true';
    if (sfx !== null) window.sfxEnabled = sfx === 'true';
    if (vib !== null) window.vibrationEnabled = vib === 'true';
    if (fps !== null) window.fpsEnabled = fps === 'true';
    if (as !== null) window.autoSaveEnabled = as === 'true';
    if (sen !== null) window.dpadSensitivity = parseFloat(sen);
    if (han !== null) window.handedness = han;
    if (vibAmt !== null) window.vibrationAmount = parseFloat(vibAmt);
    if (notif !== null) window.notificationsEnabled = notif === 'true';
    if (notifSound !== null) window.notifSoundEnabled = notifSound === 'true';
    if (screensaver !== null) window.screensaverEnabled = screensaver === 'true';
    if (wifi !== null) window.wifiEnabled = wifi === 'true';
    if (sleepT !== null) window.sleepTimer = parseFloat(sleepT);
    window.lockEnabled = g('pocketjs_lock') === 'true';
})();

window.toggleHandedness = function (side) {
    window.handedness = side;
    window.PocketDB.setItem('pocketjs_handedness', side);

    if (window.isAppOpen && window.activeApp && window.InputService) {

        if (window.activeApp.inputs) {
            let leftConfig = window.activeApp.inputs.left;
            let rightConfig = window.activeApp.inputs.right;
            if (window.handedness === 'left') [leftConfig, rightConfig] = [rightConfig, leftConfig];

            if (leftConfig) {
                if (typeof leftConfig === 'string') window.InputService.render('left', leftConfig, {}, true);
                else window.InputService.render('left', leftConfig.type, leftConfig.options, true);
            }
            if (rightConfig) {
                if (typeof rightConfig === 'string') window.InputService.render('right', rightConfig, {}, true);
                else window.InputService.render('right', rightConfig.type, rightConfig.options, true);
            }
        }
    }
};

window.toggleDarkMode = function (enabled) {
    window.darkMode = enabled;
    document.documentElement.classList.toggle('dark-mode', enabled);
    document.querySelectorAll('.os-interface').forEach(el => {
        el.classList.toggle('dark-mode', enabled);
    });
    document.querySelectorAll('.screen, .m-screen').forEach(el => {
        el.classList.toggle('dark-mode-screen', enabled);
    });
    window.PocketDB.setItem('pocketjs_dark', enabled);
};

window.toggleColoredButtons = function (enabled) {
    window.coloredButtons = enabled;
    document.documentElement.classList.toggle('neutral-buttons', !enabled);
    window.PocketDB.setItem('pocketjs_colored', enabled);
};

window.updateThemeFilter = function () {
    const filter = `hue-rotate(${window.currentHue}deg) saturate(${window.currentSat}%) brightness(${window.currentBri}%)`;
    document.documentElement.style.setProperty('--theme-filter', filter);
};

window.updateHue = (val) => { window.currentHue = val; window.updateThemeFilter(); window.PocketDB.setItem('pocketjs_hue', val); };
window.updateSat = (val) => { window.currentSat = val; window.updateThemeFilter(); window.PocketDB.setItem('pocketjs_sat', val); };
window.updateBri = (val) => { window.currentBri = val; window.updateThemeFilter(); window.PocketDB.setItem('pocketjs_bri', val); };

window.updateSliderProgress = (slider) => {
    const val = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, #000 ${val}%, #aaa ${val}%)`;
};

let _fpsFrameCount = 0;
let _fpsLastTime = performance.now();
let _fpsElements =[];

function _trackFPS() {
    _fpsFrameCount++;
    const now = performance.now();
    if (now - _fpsLastTime >= 1000) {
        const fps = _fpsFrameCount;
        _fpsFrameCount = 0;
        _fpsLastTime = now;
        _fpsElements.forEach(el => {
            if (el.style.display !== 'none') el.textContent = fps + ' FPS';
        });
    }
    requestAnimationFrame(_trackFPS);
}
requestAnimationFrame(_trackFPS);

window.addEventListener('load', async () => {

    await window.PocketDB.init();
    window.updateThemeFilter();
    if (window.darkMode) window.toggleDarkMode(true);
    if (!window.coloredButtons) window.toggleColoredButtons(false);

    window.apps = window.apps.filter(app => app.thumbnail && !app.hidden);

    let savedPins = JSON.parse(window.PocketDB.getItem('pocketjs_pinned_apps'));
    if (!savedPins) {
        savedPins = window.apps.slice(0, 5).map(a => a.id);
        if (!savedPins.includes('library')) savedPins.push('library');
        window.PocketDB.setItem('pocketjs_pinned_apps', JSON.stringify(savedPins));
    }
    window.pinnedAppIds = savedPins;

    const getOrderedCarouselApps = () => {
        const lib = window.apps.find(a => a.id === 'library');
        const pinned = window.apps.filter(a => window.pinnedAppIds.includes(a.id) && a.id !== 'library');
        return [lib, ...pinned].filter(Boolean);
    };

    window.updateCarouselApps = () => {
        const activeApp = window.activeApp;
        window.carouselApps = getOrderedCarouselApps();

        if (activeApp) {
            const newIndex = window.carouselApps.findIndex(a => a.id === activeApp.id);
            if (newIndex !== -1) currentIndex = newIndex;
        }

        document.querySelectorAll('.screen, .m-screen').forEach(screen => {
            const selector = screen.querySelector('.game-selector');
            if (selector) {
                selector.innerHTML = window.carouselApps.map((app, i) => `
                    <div class="game-item" data-index="${i}">
                        <img src="${app.thumbnail}" class="game-thumb" alt="${app.name || ''}">
                    </div>
                `).join('');
            }
        });
        renderGames();

        if (isAppOpen) {
            document.querySelectorAll('.screen, .m-screen').forEach(screen => {
                const activeEl = screen.querySelector('.game-active');
                if (activeEl) activeEl.classList.add('game-expanding');
            });
        }
    };

    window.togglePin = (appId) => {
        if (appId === 'library') return;
        if (window.pinnedAppIds.includes(appId)) {
            window.pinnedAppIds = window.pinnedAppIds.filter(id => id !== appId);
        } else {
            window.pinnedAppIds.push(appId);
        }
        window.PocketDB.setItem('pocketjs_pinned_apps', JSON.stringify(window.pinnedAppIds));
        window.updateCarouselApps();
    };

    window.carouselApps = getOrderedCarouselApps();

    const applyGlobalSettings = () => {
        document.querySelectorAll('.fps-counter').forEach(el => {
            el.style.display = window.fpsEnabled ? 'block' : 'none';
        });
    };

    function buildScreenHTML() {
        return `
        <div class="os-interface${window.darkMode ? ' dark-mode' : ''}">
            <div class="game-selector">
                ${window.carouselApps.map((app, i) => `
                    <div class="game-item" data-index="${i}">
                        <img src="${app.thumbnail}" class="game-thumb" alt="${app.name || ''}">
                    </div>
                `).join('')}
            </div>
            <div class="opened-app" style="display: none; opacity: 0; transition: opacity 0.6s cubic-bezier(1, 0, 0, 1);">
            </div>
            <div class="recording-indicator"></div>
            <div class="game-info-panel">
                <div class="gip-banner">
                    <div class="gip-banner-icon"></div>
                </div>
                <div class="gip-header">
                    <div class="gip-title"></div>
                    <div class="gip-playtime"></div>
                </div>
                <div class="gip-content">
                    <div class="gip-section-label">ACHIEVEMENTS</div>
                    <div class="gip-achievements"></div>
                    <div class="gip-no-achievements">No achievements yet. Start playing!</div>
                </div>
            </div>
            <div class="loading-screen">
                <div class="spinner"></div>
            </div>
            <div class="fps-counter" style="display:none"></div>
            <div class="notification-center">
                <div class="nc-header">
                    <span>Notifications</span>
                    <span class="nc-clear-all">Clear All</span>
                </div>
                <div class="nc-list"></div>
                <div class="status-bar">
                    <div class="time-wrap">
                        <div class="time"></div>
                        <div class="noti-dot"></div>
                    </div>
                    <div class="battery-bars">
                        <div class="battery-bar small-bar"></div>
                        <div class="battery-bar"></div>
                        <div class="battery-bar"></div>
                        <div class="battery-bar"></div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    const sharedScreen = document.querySelector('.screen');
    sharedScreen.innerHTML = buildScreenHTML();
    if (window.darkMode) sharedScreen.classList.add('dark-mode-screen');

    function updateScale() {
        const rect = sharedScreen.getBoundingClientRect();
        const scale = Math.min(rect.width, rect.height);
        if (scale > 0) {
            sharedScreen.style.setProperty('--scale', scale + 'px');
        }
    }

    function syncScreenPosition() {
        const desktopLayout = document.getElementById('desktop');
        const isDesktop = desktopLayout && getComputedStyle(desktopLayout).display !== 'none';
        const container = isDesktop
            ? document.getElementById('shared-screen-container')
            : document.getElementById('shared-mobile-screen-anchor');

        if (container && sharedScreen.parentElement !== container) {
            container.appendChild(sharedScreen);
        }
        updateScale();
    }

    window.addEventListener('resize', syncScreenPosition);

    setTimeout(syncScreenPosition, 100);

    applyGlobalSettings();
    if (window.NotificationService) {
        window.NotificationService.render();
    }

    document.querySelectorAll('.nc-clear-all').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.NotificationService) {
                window.NotificationService.clear();
            }
        });
    });

    _fpsElements = document.querySelectorAll('.fps-counter');
    const _timeElements = document.querySelectorAll('.time');

    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        _timeElements.forEach(el => el.textContent = `${hours}:${minutes}`);
    }
    setInterval(updateTime, 1000);
    updateTime();

    setTimeout(() => {
        document.querySelectorAll('.loading-screen').forEach(el => {
            el.style.opacity = '0';
            setTimeout(() => el.style.display = 'none', 300);
        });
    }, 1500);

    let currentIndex = 0;
    const settingsIndex = window.carouselApps.findIndex(a => a.id === 'settings');
    if (settingsIndex !== -1) currentIndex = settingsIndex;

    let isAppOpen = false;
    let isAnimating = false;
    let isInfoPanelOpen = false;
    let infoPanelFocusIndex = 0;
    window.activeAppOverride = null;

    function openInfoPanel(resetFocus = true, silent = false) {
        if (isAppOpen || isAnimating) return;
        const app = window.carouselApps[currentIndex];
        if (!app) return;

        isInfoPanelOpen = true;
        if (resetFocus) infoPanelFocusIndex = 0;

        if (window.sfxEnabled && !silent) window.playSfx('assets/enter-game.mp3', 0.5);

        document.querySelectorAll('.screen, .m-screen').forEach(screen => {
            const panel = screen.querySelector('.game-info-panel');
            const selector = screen.querySelector('.game-selector');
            if (!panel || !selector) return;

            const banner = panel.querySelector('.gip-banner');
            const bannerIcon = panel.querySelector('.gip-banner-icon');
            const appColor = app.color || '#3645A0';

            banner.style.backgroundImage = `url('${app.wideThumbnail || app.thumbnail}')`;
            banner.style.backgroundColor = appColor;

            bannerIcon.innerHTML = `<img src="${app.thumbnail}" alt="" style="border-radius:calc(var(--scale) * 0.02)">`;

            panel.style.borderTop = `calc(var(--scale) * 0.006) solid rgba(0, 0, 0, 0.02)`;
            if (window.darkMode) panel.style.borderTopColor = 'rgba(255, 255, 255, 0.05)';
            const title = panel.querySelector('.gip-title');
            title.textContent = app.name || app.id;

            const descEl = panel.querySelector('.gip-description');
            if (descEl) {
                descEl.textContent = app.description || 'No description available for this app.';
                descEl.style.display = app.description ? 'block' : 'none';
            }

            const playtime = panel.querySelector('.gip-playtime');
            const ms = window.AchievementService ? window.AchievementService.getPlaytime(app.id) : 0;
            playtime.textContent = '⏱ ' + (window.AchievementService ? window.AchievementService.formatPlaytime(ms) : '0m');

            const achList = panel.querySelector('.gip-achievements');
            const noAch = panel.querySelector('.gip-no-achievements');

            const definitions = app.achievements || [];
            const unlockedRecords = window.AchievementService ? window.AchievementService.getForApp(app.id) : [];

            achList.innerHTML = '';

            if (definitions.length === 0) {
                noAch.style.display = 'block';
                noAch.textContent = "This app doesn't have achievements yet.";
                achList.style.display = 'none';
            } else {
                noAch.style.display = 'none';
                achList.style.display = 'flex';
                definitions.forEach((def, i) => {
                    const record = unlockedRecords.find(r => r.id === def.id);
                    const isUnlocked = !!record;
                    const isHidden = !isUnlocked && def.hidden;
                    const trophyType = (record && record.trophy) || def.trophy || 'bronze';
                    const trophyImg = isUnlocked ? `./assets/a-${trophyType}.png` : `./assets/a-mystery.png`;

                    const el = document.createElement('div');
                    el.className = 'gip-ach-item ach-item-' + trophyType;
                    if (i === infoPanelFocusIndex) el.classList.add('gip-ach-focused');
                    if (!isUnlocked) el.classList.add('gip-ach-locked');

                    let iconContent = '';
                    if (isHidden) {
                        iconContent = `<img src="./assets/a-locked.png" style="width:100%; height:100%; object-fit:contain; opacity: 0.5;">`;
                    } else if (def.image) {
                        iconContent = `<img src="${def.image}" style="width:100%; height:100%; object-fit:contain;">`;
                    } else {
                        iconContent = `<div style="font-size:calc(var(--scale) * 0.035)">${def.icon || '🏆'}</div>`;
                    }

                    el.innerHTML = `
                        <div class="gip-ach-icon">${iconContent}</div>
                        <div class="gip-ach-info">
                            <div class="gip-ach-title">${isHidden ? '???' : def.title}</div>
                            <div class="gip-ach-desc">${isHidden ? 'Unlock this achievement to see details.' : def.description}</div>
                        </div>
                        <div class="gip-ach-trophy">
                            <img src="${trophyImg}" alt="" style="height:calc(var(--scale) * 0.045); object-fit:contain; opacity: ${isUnlocked ? 1 : 0.4}">
                        </div>
                    `;
                    achList.appendChild(el);
                });
            }

            panel.classList.add('gip-visible');
        });
    }

    function closeInfoPanel(silent = false) {
        if (!isInfoPanelOpen) return;
        isInfoPanelOpen = false;

        if (window.sfxEnabled && !silent) window.playSfx('assets/exit-game.mp3', 0.5);

        document.querySelectorAll('.screen, .m-screen').forEach(screen => {
            const panel = screen.querySelector('.game-info-panel');
            const selector = screen.querySelector('.game-selector');
            if (panel) panel.classList.remove('gip-visible');
            if (selector) selector.classList.remove('selector-shifted');
        });
    }

    function updateInfoPanelFocus() {
        document.querySelectorAll('.gip-achievements').forEach(list => {
            const container = list.closest('.gip-content');
            const items = list.querySelectorAll('.gip-ach-item');
            items.forEach((el, i) => {
                el.classList.toggle('gip-ach-focused', i === infoPanelFocusIndex);
            });

            const focused = list.querySelector('.gip-ach-focused');
            if (focused && container) {

                if (infoPanelFocusIndex === 0) {
                    container.scrollTo({ top: 0, behavior: 'smooth' });
                }

                else if (infoPanelFocusIndex === items.length - 1) {
                    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
                }

                else {
                    focused.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        });
    }

    function renderGames() {
        if(currentIndex >= window.carouselApps.length) currentIndex = window.carouselApps.length - 1;
        if(currentIndex < 0) currentIndex = 0;

        document.querySelectorAll('.game-selector').forEach(selector => {
            window.carouselApps.forEach((app, index) => {
                const el = selector.querySelector(`.game-item[data-index="${index}"]`);
                if (!el) return;

                el.classList.remove('game-active', 'game-prev', 'game-next', 'game-hidden-left', 'game-hidden-right');

                const prevIndex = currentIndex - 1;
                const nextIndex = currentIndex + 1;
                if (index === currentIndex) {
                    el.classList.add('game-active');
                } else if (index === prevIndex) {
                    el.classList.add('game-prev');
                } else if (index === nextIndex) {
                    el.classList.add('game-next');
                } else if (index < currentIndex) {
                    el.classList.add('game-hidden-left');
                } else {
                    el.classList.add('game-hidden-right');
                }
            });
        });
    }

    renderGames();

    function getActiveScreen() {
        return sharedScreen;
    }

    function openApp(...args) {
        if (isAnimating || isAppOpen) return;
        isAppOpen = true;
        window.isAppOpen = true;
        isAnimating = true;

        if (isInfoPanelOpen) {
            closeInfoPanel();
        }

        const currentApp = window.activeAppOverride || window.carouselApps[currentIndex];
        window.activeApp = currentApp;

        if (window.InputService && currentApp.inputs) {
            let leftConfig = currentApp.inputs.left;
            let rightConfig = currentApp.inputs.right;

            if (window.handedness === 'left') {
                [leftConfig, rightConfig] = [rightConfig, leftConfig];
            }

            if (leftConfig) {
                if (typeof leftConfig === 'string') window.InputService.render('left', leftConfig);
                else window.InputService.render('left', leftConfig.type, leftConfig.options);
            }
            if (rightConfig) {
                if (typeof rightConfig === 'string') window.InputService.render('right', rightConfig);
                else window.InputService.render('right', rightConfig.type, rightConfig.options);
            }

            if (!currentApp.keyMap) {
                const autoMap = {};

                function resolveType(cfg) {
                    if (!cfg) return null;
                    return typeof cfg === 'string' ? cfg : cfg.type;
                }

                const leftType  = resolveType(leftConfig);
                const rightType = resolveType(rightConfig);

                if (leftType === 'joystick') {
                    autoMap['w'] = { type: 'joystick', side: 'left', y: -1 };
                    autoMap['a'] = { type: 'joystick', side: 'left', x: -1 };
                    autoMap['s'] = { type: 'joystick', side: 'left', y:  1 };
                    autoMap['d'] = { type: 'joystick', side: 'left', x:  1 };
                } else if (leftType === 'dpad') {
                    autoMap['w'] = 'up';
                    autoMap['a'] = 'left';
                    autoMap['s'] = 'down';
                    autoMap['d'] = 'right';
                } else if (leftType === 'steering') {
                    autoMap['a'] = { type: 'steering', side: 'left', value: -1 };
                    autoMap['d'] = { type: 'steering', side: 'left', value:  1 };
                } else if (leftType === 'quad_buttons') {
                    autoMap['w'] = 'x';
                    autoMap['a'] = 'y';
                    autoMap['s'] = 'a';
                    autoMap['d'] = 'b';
                } else if (leftType === 'buttons') {
                    autoMap['s'] = 'a';
                    autoMap['d'] = 'b';
                } else if (leftType === 'trackpad') {

                }

                if (rightType === 'joystick') {
                    autoMap['i'] = { type: 'joystick', side: 'right', y: -1 };
                    autoMap['j'] = { type: 'joystick', side: 'right', x: -1 };
                    autoMap['k'] = { type: 'joystick', side: 'right', y:  1 };
                    autoMap['l'] = { type: 'joystick', side: 'right', x:  1 };
                } else if (rightType === 'dpad') {
                    autoMap['i'] = 'up';
                    autoMap['j'] = 'left';
                    autoMap['k'] = 'down';
                    autoMap['l'] = 'right';
                } else if (rightType === 'steering') {
                    autoMap['j'] = { type: 'steering', side: 'right', value: -1 };
                    autoMap['l'] = { type: 'steering', side: 'right', value:  1 };
                } else if (rightType === 'quad_buttons') {
                    autoMap['i'] = 'x';
                    autoMap['j'] = 'y';
                    autoMap['k'] = 'a';
                    autoMap['l'] = 'b';
                } else if (rightType === 'buttons') {
                    autoMap['k'] = 'a';
                    autoMap['j'] = 'b';
                }

                const mirrorSide = (leftType === 'dpad' || rightType === 'dpad')
                    ? (leftType === 'dpad' ? 'left' : 'right')
                    : (leftType === 'joystick' ? 'left' : (rightType === 'joystick' ? 'right' : null));

                if (mirrorSide === 'left') {
                    autoMap['arrowup']    = autoMap['w'];
                    autoMap['arrowleft']  = autoMap['a'];
                    autoMap['arrowdown']  = autoMap['s'];
                    autoMap['arrowright'] = autoMap['d'];
                } else if (mirrorSide === 'right') {
                    autoMap['arrowup']    = autoMap['i'];
                    autoMap['arrowleft']  = autoMap['j'];
                    autoMap['arrowdown']  = autoMap['k'];
                    autoMap['arrowright'] = autoMap['l'];
                }

                autoMap['x'] = 'pill-left';
                autoMap['n'] = 'pill-right';

                autoMap['enter'] = 'a';
                autoMap[' ']     = 'a';

                currentApp._autoKeyMap = autoMap;
                currentApp.keyMap = autoMap;
            }
        }

        if (window.AchievementService && currentApp) {
            window.AchievementService.startSession(currentApp.id);
        }

        if (window.sfxEnabled) {
            window.playSfx('assets/enter-game.mp3');
        }

        const activeScreen = getActiveScreen();

        const statusBar = activeScreen.querySelector('.status-bar');
        if (statusBar) statusBar.classList.add('status-bar-hidden');

        setTimeout(() => {
            const activeEl = activeScreen.querySelector('.game-active');
            if (activeEl) activeEl.classList.add('game-expanding');
        }, 250);

        setTimeout(() => {
            const screen = activeScreen;
            if (screen) {
                const openedAppContainer = screen.querySelector('.opened-app');
                if (openedAppContainer) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(currentApp.html || '', 'text/html');
                    doc.querySelectorAll('script').forEach(s => s.remove());

                    openedAppContainer.innerHTML = '';
                    while (doc.body.firstChild) {
                        openedAppContainer.appendChild(doc.body.firstChild);
                    }

                    openedAppContainer.style.display = 'flex';
                    void openedAppContainer.offsetWidth;
                    openedAppContainer.style.opacity = '1';
                }
            }

            try {
                if (currentApp.init) {
                    currentApp.init(...args);
                }
            } catch (e) {
            } finally {
                isAnimating = false;
            }
        }, 1600);
    }

    window.launchApp = function(appId, ...args) {
        if (isAnimating) return;
        const appToLaunch = window.apps.find(a => a.id === appId);
        if (!appToLaunch) return;

        if (isAppOpen) {
            isAnimating = true;
            if (window.sfxEnabled) window.playSfx('assets/enter-game.mp3');

            const activeScreen = getActiveScreen();
            const openedAppContainer = activeScreen ? activeScreen.querySelector('.opened-app') : null;

            if (openedAppContainer) {
                openedAppContainer.style.opacity = '0';

                setTimeout(() => {
                    if (window.activeApp && window.activeApp.cleanup) {
                        try { window.activeApp.cleanup(); } catch (e) { console.error(e); }
                    }

                    window.activeAppOverride = appToLaunch;
                    window.activeApp = appToLaunch;

                    openedAppContainer.innerHTML = appToLaunch.html || '';
                    openedAppContainer.style.background = appToLaunch.color || '#000000';

                    try {
                        if (appToLaunch.init) appToLaunch.init(...args);
                    } catch (e) {
                    }

                    void openedAppContainer.offsetWidth;
                    openedAppContainer.style.opacity = '1';

                    setTimeout(() => isAnimating = false, 600);
                }, 400);
            }
        } else {
            window.activeAppOverride = appToLaunch;
            openApp(...args);
        }
    };

    function closeApp() {
        if (!isAppOpen || isAnimating) return;

        const closingApp = window.activeApp;
        isAppOpen = false;
        window.isAppOpen = false;
        isAnimating = true;

        const activeScreen = getActiveScreen();
        if (activeScreen) {
            const openedAppContainer = activeScreen.querySelector('.opened-app');
            if (openedAppContainer) openedAppContainer.style.opacity = '0';
        }

        setTimeout(() => {
            if (window.sfxEnabled) {
                window.playSfx('assets/exit-game.mp3');
            }

            const activeEl = activeScreen.querySelector('.game-active');
            if (activeEl) activeEl.classList.remove('game-expanding');
        }, 1200);

        setTimeout(() => {
            const statusBar = activeScreen.querySelector('.status-bar');
            if (statusBar) statusBar.classList.remove('status-bar-hidden');
        }, 1200);

        setTimeout(() => {

            if (window.AchievementService) {
                window.AchievementService.endSession();
            }

            if (window.InputService) {
                window.InputService.init();
            }

            try {
                if (closingApp && closingApp.cleanup) {
                    closingApp.cleanup();
                }
            } catch (e) {
            }

            if (closingApp && closingApp._autoKeyMap) {
                delete closingApp.keyMap;
                delete closingApp._autoKeyMap;
            }

            if (activeScreen) {
                const openedAppContainer = activeScreen.querySelector('.opened-app');
                if (openedAppContainer) {
                    openedAppContainer.style.display = 'none';
                    openedAppContainer.innerHTML = '';
                }
            }
            window.activeAppOverride = null;
            isAnimating = false;
            window.dispatchEvent(new Event('appclosed'));
        }, 1200);
    }

    window.handleInputGlobal = handleInput;

    // ---- Lock Screen + Idle Screensaver (device features) ----
    (function () {
        window.isLocked = false;
        window.isScreensaver = false;
        let idleTimer = null;
        let pin = window.PocketDB.getItem('pocketjs_lock_pin') || '1234';
        window.lockEnabled = window.PocketDB.getItem('pocketjs_lock') === 'true';
        let digits = [0, 0, 0, 0];
        let digitIdx = 0;

        function screenEl() { return document.querySelector('.screen'); }

        function buildLock() {
            const s = screenEl();
            if (!s || s.querySelector('.lock-overlay')) return;
            const el = document.createElement('div');
            el.className = 'lock-overlay';
            el.innerHTML = `
                <div class="lock-clock" id="lock-clock">00:00</div>
                <div class="lock-hint">Enter PIN &middot; A confirm &middot; B clear</div>
                <div class="lock-pins" id="lock-pins">
                    <span></span><span></span><span></span><span></span>
                </div>`;
            s.appendChild(el);
            const tick = () => {
                const c = el.querySelector('#lock-clock');
                if (c) c.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            };
            tick();
            el._tick = setInterval(tick, 1000);
        }

        function renderPins() {
            const wrap = screenEl() && screenEl().querySelector('#lock-pins');
            if (!wrap) return;
            const spans = wrap.querySelectorAll('span');
            spans.forEach((sp, i) => {
                sp.textContent = digits[i];
                sp.className = (i === digitIdx) ? 'active' : '';
            });
        }

        window.lockNow = function () {
            buildLock();
            digits = [0, 0, 0, 0]; digitIdx = 0; renderPins();
            const el = screenEl().querySelector('.lock-overlay');
            el.style.display = 'flex';
            requestAnimationFrame(() => el.classList.add('show'));
            window.isLocked = true;
        };

        window.dismissLock = function () {
            const el = screenEl() && screenEl().querySelector('.lock-overlay');
            if (el) { el.classList.remove('show'); setTimeout(() => { el.style.display = 'none'; }, 300); }
            window.isLocked = false;
        };

        function lockHandle(action) {
            if (action === 'up') { digits[digitIdx] = (digits[digitIdx] + 1) % 10; renderPins(); window.playSfx('assets/move-menu.mp3', 3.5); }
            else if (action === 'down') { digits[digitIdx] = (digits[digitIdx] + 9) % 10; renderPins(); window.playSfx('assets/move-menu.mp3', 3.5); }
            else if (action === 'left' && digitIdx > 0) { digitIdx--; renderPins(); window.playSfx('assets/move-menu.mp3', 3.5); }
            else if (action === 'right' && digitIdx < 3) { digitIdx++; renderPins(); window.playSfx('assets/move-menu.mp3', 3.5); }
            else if (action === 'b') { digits[digitIdx] = 0; renderPins(); window.playSfx('assets/change-menu.mp3', 0.5); }
            else if (action === 'a') {
                const entered = digits.join('');
                if (entered === pin) {
                    window.playSfx('assets/enter-game.mp3', 0.5);
                    window.dismissLock();
                } else {
                    window.playSfx('assets/error.mp3');
                    const el = screenEl().querySelector('.lock-overlay');
                    if (el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
                    digits = [0, 0, 0, 0]; digitIdx = 0; renderPins();
                }
            }
        }

        // Screensaver
        function buildScreensaver() {
            const s = screenEl();
            if (!s || s.querySelector('.screensaver')) return;
            const el = document.createElement('div');
            el.className = 'screensaver';
            let pixels = '';
            for (let i = 0; i < 26; i++) {
                const x = Math.random() * 100, y = Math.random() * 100;
                const dur = 4 + Math.random() * 6, delay = Math.random() * 4;
                const hue = Math.floor(Math.random() * 360);
                pixels += `<div class="sa-pixel" style="left:${x}%;top:${y}%;background:hsl(${hue},80%,60%);animation-duration:${dur}s;animation-delay:${delay}s;"></div>`;
            }
            el.innerHTML = `<div class="sa-pixels">${pixels}</div><div class="sa-clock" id="sa-clock"></div>`;
            s.appendChild(el);
            const tick = () => {
                const c = el.querySelector('#sa-clock');
                if (c) c.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            };
            tick();
            el._tick = setInterval(tick, 1000);
        }

        window.showScreensaver = function () {
            buildScreensaver();
            const el = screenEl().querySelector('.screensaver');
            el.style.display = 'block';
            requestAnimationFrame(() => el.classList.add('show'));
            window.isScreensaver = true;
        };
        window.dismissScreensaver = function () {
            const el = screenEl() && screenEl().querySelector('.screensaver');
            if (el) { el.classList.remove('show'); setTimeout(() => { el.style.display = 'none'; }, 400); }
            window.isScreensaver = false;
        };

        window.resetIdle = function () {
            if (idleTimer) clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                if (window.isLocked || window.isScreensaver || window.isAppOpen) return;
                const nc = document.querySelectorAll('.notification-center');
                if (nc.length && nc[0].classList.contains('nc-visible')) return;
                if (document.body.classList.contains('kb-active')) return;
                if (window.lockEnabled) window.lockNow();
                else if (window.screensaverEnabled) window.showScreensaver();
            }, (window.sleepTimer || 30) * 1000);
        };

        window.addEventListener('appclosed', window.resetIdle);
        window.resetIdle();
    })();


    const pressedKeys = new Set();
    const activeKeyIntervals = new Map();
    let steerInterval = null;
    let joystickInterval = null;

    function handleInput(action) {
        if (!action) return;
        const actionName = typeof action === 'string' ? action : action.action;

        if (window.isLocked) { lockHandle(actionName); return; }
        if (window.isScreensaver) { window.dismissScreensaver(); window.resetIdle(); return; }
        if (window.resetIdle) window.resetIdle();

        if (window.CheatService) window.CheatService.handleInput(actionName);

        const nc = document.querySelectorAll('.notification-center');
        const isNcVisible = nc.length > 0 && nc[0].classList.contains('nc-visible');

        if (isNcVisible) {
            const ncLists = document.querySelectorAll('.nc-list');
            if (ncLists.length === 0) return;
            const ncList = ncLists[0];
            const ncItems = ncList.querySelectorAll('.nc-item');

            let currentFocus = parseInt(ncList.dataset.focusIndex);
            if (isNaN(currentFocus)) currentFocus = 0;
            let subFocus = parseInt(ncList.dataset.subFocusIndex) || 0;
            const maxFocus = ncItems.length - 1;

            if (actionName === 'pill-right') {
                nc.forEach(el => el.classList.remove('nc-visible'));
                return;
            } else if (actionName === 'up') {
                currentFocus = Math.max(currentFocus - 1, -1);
                subFocus = 0;
                ncLists.forEach(list => {
                    list.dataset.focusIndex = currentFocus;
                    list.dataset.subFocusIndex = subFocus;
                });
                window.NotificationService.updateFocus();
                return;
            } else if (actionName === 'down') {
                currentFocus = Math.min(currentFocus + 1, maxFocus);
                subFocus = 0;
                ncLists.forEach(list => {
                    list.dataset.focusIndex = currentFocus;
                    list.dataset.subFocusIndex = subFocus;
                });
                window.NotificationService.updateFocus();
                return;
            } else if (actionName === 'left' || actionName === 'right') {
                if (currentFocus === -1) return;
                const focusedItem = ncItems[currentFocus];
                if (!focusedItem) return;
                const btns = focusedItem.querySelectorAll('.nc-btn-action, .nc-btn-delete');
                if (actionName === 'left') subFocus = Math.max(subFocus - 1, 0);
                else subFocus = Math.min(subFocus + 1, btns.length - 1);
                ncLists.forEach(list => list.dataset.subFocusIndex = subFocus);
                window.NotificationService.updateFocus();
                return;
            } else if (actionName === 'a') {
                if (currentFocus === -1) {
                    const clearBtn = document.querySelector('.nc-clear-all');
                    if (clearBtn) clearBtn.click();
                } else {
                    const focusedItem = ncItems[currentFocus];
                    if (focusedItem) {
                        const btns = focusedItem.querySelectorAll('.nc-btn-action, .nc-btn-delete');
                        if (btns[subFocus]) btns[subFocus].click();
                    }
                }
                return;
            }
            return;
        }

        if (actionName === 'pill-right') {
            if (isAppOpen) {
                closeApp();
                return;
            }
            if (isInfoPanelOpen) closeInfoPanel();
            nc.forEach(el => el.classList.add('nc-visible'));
            if (window.NotificationService) window.NotificationService.render();
            setTimeout(() => {
                const ncLists = document.querySelectorAll('.nc-list');
                ncLists.forEach(list => list.dataset.focusIndex = 0);
                window.NotificationService.updateFocus();
            }, 100);
            return;
        }

        if (actionName === 'b') {
            if (document.body.classList.contains('kb-active')) {
                window.system.hideKeyboard();
                return;
            }
        }

        if (isAppOpen) {
            const detail = typeof action === 'string' ? { action } : action;
            window.dispatchEvent(new CustomEvent('appInput', { detail }));
            return;
        }
        if (isAnimating) return;
        if (actionName === 'left') {
            if (isInfoPanelOpen) closeInfoPanel();
            if (currentIndex > 0) {
                currentIndex--;
                renderGames();
                if (window.sfxEnabled) window.playSfx('assets/move-menu.mp3', 3.5);
                isAnimating = true;
                setTimeout(() => isAnimating = false, 120);
            }
        } else if (actionName === 'right') {
            if (isInfoPanelOpen) closeInfoPanel();
            if (currentIndex < window.carouselApps.length - 1) {
                currentIndex++;
                renderGames();
                if (window.sfxEnabled) window.playSfx('assets/move-menu.mp3', 3.5);
                isAnimating = true;
                setTimeout(() => isAnimating = false, 120);
            }
        } else if (actionName === 'a') {
            if (isInfoPanelOpen) {
                closeInfoPanel();
                openApp();
            } else {
                openApp();
            }
        } else if (actionName === 'pill-left') {
            const app = window.carouselApps[currentIndex];
            if (app && app.achievements && app.achievements.length > 0) {
                if (isInfoPanelOpen) closeInfoPanel();
                else openInfoPanel();
            }
        } else if (actionName === 'up' && isInfoPanelOpen) {
            const app = window.carouselApps[currentIndex];
            const definitions = app ? (app.achievements || []) : [];
            if (definitions.length > 0) {
                infoPanelFocusIndex = Math.max(0, infoPanelFocusIndex - 1);
                updateInfoPanelFocus();
                if (window.sfxEnabled) window.playSfx('assets/move-menu.mp3', 3.5);
            }
        } else if (actionName === 'down' && isInfoPanelOpen) {
            const app = window.carouselApps[currentIndex];
            const definitions = app ? (app.achievements || []) : [];
            if (definitions.length > 0) {
                infoPanelFocusIndex = Math.min(definitions.length - 1, infoPanelFocusIndex + 1);
                updateInfoPanelFocus();
                if (window.sfxEnabled) window.playSfx('assets/move-menu.mp3', 3.5);
            }
        } else if (actionName === 'b' && isInfoPanelOpen) {
            closeInfoPanel();
        }
    }

    window.addEventListener('closeApp', () => closeApp());

    window.addEventListener('blur', () => {
        document.querySelectorAll('.btn-pressed').forEach(btn => btn.classList.remove('btn-pressed'));
        activeKeyIntervals.forEach(val => {
            if (val.timeout) clearTimeout(val.timeout);
            if (val.interval) clearInterval(val.interval);
        });
        activeKeyIntervals.clear();
        pressedKeys.clear();
    });

    const keyMap = {
        'a': 'left', 'd': 'right', 'w': 'up', 's': 'down',
        'k': 'a', 'j': 'b', 'n': 'pill-left', 'm': 'pill-right',
        'arrowleft': 'left', 'arrowright': 'right', 'arrowup': 'up', 'arrowdown': 'down',
        'enter': 'a', ' ': 'a'
    };

    const keySelectors = {
        'a': '.dpad-left, .q-left',
        'd': '.dpad-right, .q-right',
        'w': '.dpad-up, .q-top',
        's': '.dpad-down, .q-bottom',
        'arrowleft': '.dpad-left, .q-left',
        'arrowright': '.dpad-right, .q-right',
        'arrowup': '.dpad-up, .q-top',
        'arrowdown': '.dpad-down, .q-bottom',
        'k': '.btn-top-right, .large-btn',
        'j': '.btn-bottom-left',
        'enter': '.large-btn, .btn-top-right',
        ' ': '.large-btn, .btn-top-right',
        'n': '.side-panel:first-child .menu-pill, .m-menu-wrap .menu-pill:first-child',
        'm': '.side-panel:last-child .menu-pill, .m-menu-wrap .menu-pill:last-child'
    };

    function animateButton(action, isPressed) {
        if (!action) return;
        const selectors = [ `[data-action="${action}"]`, `.dpad-${action}`, `.btn-${action}` ];
        if (action === 'pill-left') selectors.push('.side-panel:first-child .menu-pill, .m-menu-wrap .menu-pill:first-child');
        if (action === 'pill-right') selectors.push('.side-panel:last-child .menu-pill, .m-menu-wrap .menu-pill:last-child');
        document.querySelectorAll(selectors.join(',')).forEach(btn => {
            btn.classList.toggle('btn-pressed', isPressed);
        });
    }

    document.addEventListener('keydown', (e) => {
        if (document.body.classList.contains('kb-active')) {
            const key = e.key;
            if (key === 'Enter') handleKey('DONE');
            else if (key === 'Backspace') handleKey('BACK');
            else if (key === ' ') handleKey('SPACE');
            else if (key === 'Shift') handleKey('SHIFT');
            else if (key.length === 1) handleKey(key.toUpperCase());
            e.preventDefault();
            return;
        }

        const key = e.key.toLowerCase();
        if (pressedKeys.has(key)) return;
        pressedKeys.add(key);

        if (key === 'p' && window.AchievementService) {
            window.AchievementService.clearAll();
            if (isInfoPanelOpen) { closeInfoPanel(true); openInfoPanel(true, true); }
        }
        if (key === 'l' && isInfoPanelOpen) {
            const app = window.carouselApps[currentIndex];
            const defs = app ? (app.achievements || []) : [];
            const focusedDef = defs[infoPanelFocusIndex];
            if (focusedDef && window.AchievementService) {
                window.AchievementService.grant(app.id, focusedDef);
                openInfoPanel(false, true);
            }
        }

        let action = null;
        if (isAppOpen && window.activeApp && window.activeApp.keyMap) {
            action = window.activeApp.keyMap[key] || window.activeApp.keyMap[e.key];
        }
        if (!action) action = keyMap[key];

        if (action) {
            if (typeof action === 'string') {
                handleInput(action);
                animateButton(action, true);

                const timeout = setTimeout(() => {
                    const interval = setInterval(() => handleInput(action), 80);
                    activeKeyIntervals.set(key, { timeout: null, interval: interval });
                }, 200);
                activeKeyIntervals.set(key, { timeout: timeout, interval: null });
            } else if (action.type === 'steering') {
                if (!steerInterval) {
                    let steerVal = 0;
                    steerInterval = setInterval(() => {
                        let target = 0;
                        for (let k in window.activeApp.keyMap) {
                            if (pressedKeys.has(k) && window.activeApp.keyMap[k].type === 'steering') target += window.activeApp.keyMap[k].value;
                        }
                        target = Math.max(-1, Math.min(1, target));
                        if (target !== 0) steerVal = steerVal + (target - steerVal) * 0.2;
                        else steerVal *= 0.8;
                        window.dispatchEvent(new CustomEvent('steeringInput', { detail: { value: steerVal } }));
                    }, 30);
                }
                animateButton('steering', true);
            } else if (action.type === 'joystick') {
                if (!joystickInterval) {
                    let jX = 0, jY = 0;
                    joystickInterval = setInterval(() => {
                        let targetX = 0, targetY = 0;
                        for (let k in window.activeApp.keyMap) {
                            if (pressedKeys.has(k) && window.activeApp.keyMap[k].type === 'joystick') {
                                const m = window.activeApp.keyMap[k];
                                if (m.x !== undefined) targetX += m.x;
                                if (m.y !== undefined) targetY += m.y;
                            }
                        }
                        targetX = Math.max(-1, Math.min(1, targetX));
                        targetY = Math.max(-1, Math.min(1, targetY));
                        jX += (targetX - jX) * 0.25; jY += (targetY - jY) * 0.25;
                        window.dispatchEvent(new CustomEvent('joystickInput', { detail: { side: action.side, x: jX, y: jY, id: action.id || 'default' } }));
                    }, 30);
                }
                animateButton('joystick', true);
            } else if (action.type === 'slider') {
                window.dispatchEvent(new CustomEvent('sliderInput', { detail: { side: action.side, value: action.value, type: action.id } }));
                animateButton('slider', true);
            }
            e.preventDefault();
        }

        if (!isAppOpen && keySelectors[key]) {
            document.querySelectorAll(keySelectors[key]).forEach(btn => btn.classList.add('btn-pressed'));
        }
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        pressedKeys.delete(key);

        const state = activeKeyIntervals.get(key);
        if (state) {
            if (state.timeout) clearTimeout(state.timeout);
            if (state.interval) clearInterval(state.interval);
            activeKeyIntervals.delete(key);
        }

        if (isAppOpen && window.activeApp && window.activeApp.keyMap) {
            const mapping = window.activeApp.keyMap[key] || window.activeApp.keyMap[e.key];
            if (mapping) {
                const action = typeof mapping === 'string' ? mapping : mapping.type;
                animateButton(action, false);

                if (mapping.type === 'steering') {
                    let anySteer = false;
                    for (let k in window.activeApp.keyMap) if (pressedKeys.has(k) && window.activeApp.keyMap[k].type === 'steering') anySteer = true;
                    if (!anySteer) {
                        setTimeout(() => {
                            let stillAny = false;
                            for (let k in window.activeApp.keyMap) if (pressedKeys.has(k) && window.activeApp.keyMap[k].type === 'steering') stillAny = true;
                            if (!stillAny) { clearInterval(steerInterval); steerInterval = null; window.dispatchEvent(new CustomEvent('steeringInput', { detail: { value: 0 } })); }
                        }, 200);
                    }
                } else if (mapping.type === 'joystick') {
                    let anyJoy = false;
                    for (let k in window.activeApp.keyMap) if (pressedKeys.has(k) && window.activeApp.keyMap[k].type === 'joystick') anyJoy = true;
                    if (!anyJoy) {
                        setTimeout(() => {
                            let stillAny = false;
                            for (let k in window.activeApp.keyMap) if (pressedKeys.has(k) && window.activeApp.keyMap[k].type === 'joystick') stillAny = true;
                            if (!stillAny) { clearInterval(joystickInterval); joystickInterval = null; window.dispatchEvent(new CustomEvent('joystickInput', { detail: { side: mapping.side, x: 0, y: 0, id: mapping.id || 'default' } })); }
                        }, 200);
                    }
                } else if (mapping.type === 'slider') {
                    let anySlider = false;
                    for (let k in window.activeApp.keyMap) if (pressedKeys.has(k) && window.activeApp.keyMap[k].type === 'slider' && window.activeApp.keyMap[k].id === mapping.id) anySlider = true;
                    if (!anySlider) window.dispatchEvent(new CustomEvent('sliderInput', { detail: { side: mapping.side, value: 50, type: mapping.id } }));
                }

                return;
            }
        }

        if (keyMap[key]) animateButton(keyMap[key], false);
        if (!isAppOpen && keySelectors[key]) {
            document.querySelectorAll(keySelectors[key]).forEach(btn => btn.classList.remove('btn-pressed'));
        }
    });

    const kbLeft = document.getElementById('kb-desktop-left');
    const kbRight = document.getElementById('kb-desktop-right');
    const kbMobile = document.getElementById('kb-mobile-full');
    let kbCallback = null;

    const fullLayoutAlpha = [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L'],
        ['SHIFT','Z','X','C','V','B','N','M','BACK'],
        ['123',',','SPACE','.','DONE']
    ];

    const fullLayoutSym = [
        ['1','2','3','4','5','6','7','8','9','0'],
        ['@','#','$','_','&','-','+','(',')','/'],
        ['=','*','"',"'",':',';','!','?','BACK'],
        ['ABC',',','SPACE','.','DONE']
    ];

    const splitLayoutAlpha = {
        left: [
            ['Q','W','E','R','T'],
            ['A','S','D','F','G'],
            ['SHIFT','Z','X','C','V'],
            ['123',',','SPACE']
        ],
        right: [
            ['Y','U','I','O','P'],
            ['H','J','K','L'],
            ['B','N','M','BACK'],
            ['.','DONE']
        ]
    };

    const splitLayoutSym = {
        left: [
            ['1','2','3','4','5'],
            ['@','#','$','_','&'],
            ['=','*','"',"'",':'],
            ['ABC',',','SPACE']
        ],
        right: [
            ['6','7','8','9','0'],
            ['-','+','(',')','/'],
            [';','!','?','BACK'],
            ['.','DONE']
        ]
    };

    let shiftActive = false;
    let symActive = false;

    function createKey(key) {
        const keyEl = document.createElement('div');
        keyEl.className = 'kb-key';
        let label = key;
        if (key === 'SHIFT') {
            keyEl.classList.add('kb-key-wide');
            label = '↑';
            if (shiftActive) keyEl.classList.add('pressed');
        } else if (key === 'BACK') {
            keyEl.classList.add('kb-key-wide');
            label = '⌫';
        } else if (key === 'SPACE') {
            keyEl.classList.add('kb-key-space');
            label = 'SPACE';
        } else if (key === 'DONE') {
            keyEl.classList.add('kb-key-done');
            label = 'DONE';
        } else if (key === '123') {
            keyEl.classList.add('kb-key-wide');
            label = '123';
        } else if (key === 'ABC') {
            keyEl.classList.add('kb-key-wide');
            label = 'ABC';
        } else {
            label = shiftActive && !symActive ? key.toUpperCase() : key.toLowerCase();
        }
        keyEl.textContent = label;
        keyEl.onclick = (e) => {
            e.stopPropagation();
            handleKey(key);
        };
        return keyEl;
    }

    function renderKeyboard() {
        kbLeft.innerHTML = '';
        kbRight.innerHTML = '';
        kbMobile.innerHTML = '';

        const isDesktop = getComputedStyle(document.getElementById('desktop')).display !== 'none';
        const splitLayout = symActive ? splitLayoutSym : splitLayoutAlpha;
        const fullLayout = symActive ? fullLayoutSym : fullLayoutAlpha;

        if (isDesktop) {
            const leftHousing = document.createElement('div');
            leftHousing.className = 'kb-housing';
            const rightHousing = document.createElement('div');
            rightHousing.className = 'kb-housing';

            splitLayout.left.forEach(row => {
                const rowEl = document.createElement('div');
                rowEl.className = 'kb-row';
                row.forEach(key => rowEl.appendChild(createKey(key)));
                leftHousing.appendChild(rowEl);
            });
            splitLayout.right.forEach(row => {
                const rowEl = document.createElement('div');
                rowEl.className = 'kb-row';
                row.forEach(key => rowEl.appendChild(createKey(key)));
                rightHousing.appendChild(rowEl);
            });
            kbLeft.appendChild(leftHousing);
            kbRight.appendChild(rightHousing);
        } else {
            const fullHousing = document.createElement('div');
            fullHousing.className = 'kb-housing';
            fullLayout.forEach(row => {
                const rowEl = document.createElement('div');
                rowEl.className = 'kb-row';
                row.forEach(key => rowEl.appendChild(createKey(key)));
                fullHousing.appendChild(rowEl);
            });
            kbMobile.appendChild(fullHousing);
        }
    }

    function handleKey(key) {
        if (key === 'DONE') {
            if (kbCallback) kbCallback({ action: 'done' });
            window.system.hideKeyboard();
            return;
        }
        if (!kbCallback) return;

        if (key === 'SHIFT') {
            shiftActive = !shiftActive;
            renderKeyboard();
        } else if (key === '123') {
            symActive = true;
            renderKeyboard();
        } else if (key === 'ABC') {
            symActive = false;
            renderKeyboard();
        } else if (key === 'BACK') {
            kbCallback({ action: 'backspace' });
        } else if (key === 'SPACE') {
            kbCallback({ action: 'char', value: ' ' });
        } else {
            const val = (shiftActive && !symActive) ? key.toUpperCase() : key.toLowerCase();
            kbCallback({ action: 'char', value: val });
            if (shiftActive) {
                shiftActive = false;
                renderKeyboard();
            }
        }
    }

    window.system = window.system || {};

    window.system.showKeyboard = (placeholder, callback) => {
        kbCallback = callback;
        document.body.classList.add('kb-active');
        renderKeyboard();
    };

    window.system.hideKeyboard = () => {
        document.body.classList.remove('kb-active');
        kbCallback = null;
    };

    window.addEventListener('resize', () => {
        if (document.body.classList.contains('kb-active')) {
            renderKeyboard();
        }
    });

    setTimeout(() => {
        if (window.InputService) window.InputService.init();
    }, 300);

});
