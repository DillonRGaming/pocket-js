window.apps.push({
    id: 'settings',
    name: 'Settings',
    thumbnail: './games/settings/assets/settings.png',
    version: '2.0',
    icon: '<svg class="gear-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>',
    color: '#000000ff',
    html: `
        <div class="gb-app" id="settings-app">
            <div class="gb-title">System Settings</div>

            <div class="gb-section">
                <div class="gb-section-title">Profile & Accounts</div>
                <div class="gb-row">
                    <div class="gb-item" data-row="0" data-col="0" style="flex: 1; display: flex; align-items: center; gap: calc(var(--scale) * 0.02); padding: calc(var(--scale) * 0.01);">
                        <img id="gb-avatar-img" src="assets/profile1.png" style="width: calc(var(--scale) * 0.08); height: calc(var(--scale) * 0.08); border-radius: 50%; object-fit: cover; background: #333;">
                        <div style="display: flex; flex-direction: column;">
                            <div id="gb-profile-name" style="font-size: calc(var(--scale) * 0.035); font-weight: bold;">Player 1</div>
                            <div style="font-size: calc(var(--scale) * 0.025); opacity: 0.7;">Current Account</div>
                        </div>
                    </div>
                </div>
                <div class="gb-row">
                    <div class="gb-item" data-row="1" data-col="0">
                        <div class="gb-item-content" style="align-items: center; justify-content: center;">
                            <div class="gb-label" style="margin:0;">Change Name</div>
                        </div>
                    </div>
                    <div class="gb-item" data-row="1" data-col="1">
                        <div class="gb-item-content" style="align-items: center; justify-content: center;">
                            <div class="gb-label" style="margin:0;">Change Avatar</div>
                        </div>
                    </div>
                </div>
                <div class="gb-row">
                    <div class="gb-item" data-row="2" data-col="0">
                        <div class="gb-item-content" style="align-items: center; justify-content: center;">
                            <div class="gb-label" style="margin:0;">New Account</div>
                        </div>
                    </div>
                    <div class="gb-item" data-row="2" data-col="1">
                        <div class="gb-item-content" style="align-items: center; justify-content: center;">
                            <div class="gb-label" style="margin:0;">Switch Account</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="gb-section">
                <div class="gb-section-title">Display & Personalization</div>
                <div class="gb-item" data-row="3" data-col="0">
                    <div class="gb-item-content">
                        <div class="gb-label">Device Hue</div>
                        <div class="gb-slider" id="gb-hue">
                            <div class="gb-slider-fill"></div>
                            <div class="gb-slider-thumb"></div>
                        </div>
                    </div>
                </div>
                <div class="gb-item" data-row="4" data-col="0">
                    <div class="gb-item-content">
                        <div class="gb-label">Saturation</div>
                        <div class="gb-slider" id="gb-sat">
                            <div class="gb-slider-fill"></div>
                            <div class="gb-slider-thumb"></div>
                        </div>
                    </div>
                </div>
                <div class="gb-item" data-row="5" data-col="0">
                    <div class="gb-item-content">
                        <div class="gb-label">Brightness</div>
                        <div class="gb-slider" id="gb-bri">
                            <div class="gb-slider-fill"></div>
                            <div class="gb-slider-thumb"></div>
                        </div>
                    </div>
                </div>
                <div class="gb-row">
                    <div class="gb-item" data-row="6" data-col="0">
                        <div class="gb-check" id="gb-darkMode">
                            <div class="gb-check-box">
                                <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </div>
                            <div class="gb-check-label">Dark Mode</div>
                        </div>
                    </div>
                    <div class="gb-item" data-row="6" data-col="1">
                        <div class="gb-check" id="gb-fullscreen">
                            <div class="gb-check-box">
                                <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </div>
                            <div class="gb-check-label">Fullscreen</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="gb-section">
                <div class="gb-section-title">Audio & Sound</div>
                <div class="gb-item" data-row="7" data-col="0">
                    <div class="gb-item-content">
                        <div class="gb-label">Master Volume</div>
                        <div class="gb-slider" id="gb-vol">
                            <div class="gb-slider-fill"></div>
                            <div class="gb-slider-thumb"></div>
                        </div>
                    </div>
                </div>
                <div class="gb-row">
                    <div class="gb-item" data-row="8" data-col="0">
                        <div class="gb-check" id="gb-sfx">
                            <div class="gb-check-box">
                                <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </div>
                            <div class="gb-check-label">SFX</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="gb-section">
                <div class="gb-section-title">Hardware & Inputs</div>
                <div class="gb-item" data-row="9" data-col="0">
                    <div class="gb-item-content">
                        <div class="gb-label">D-pad Sensitivity</div>
                        <div class="gb-slider" id="gb-sens">
                            <div class="gb-slider-fill"></div>
                            <div class="gb-slider-thumb"></div>
                        </div>
                    </div>
                </div>
                <div class="gb-item" data-row="10" data-col="0">
                    <div class="gb-item-content">
                        <div class="gb-label">Vibration Amount</div>
                        <div class="gb-slider" id="gb-vib-amount">
                            <div class="gb-slider-fill"></div>
                            <div class="gb-slider-thumb"></div>
                        </div>
                    </div>
                </div>
                <div class="gb-row">
                    <div class="gb-item" data-row="11" data-col="0">
                        <div class="gb-check" id="gb-shake">
                            <div class="gb-check-box">
                                <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </div>
                            <div class="gb-check-label">Vibration</div>
                        </div>
                    </div>
                    <div class="gb-item" data-row="11" data-col="1">
                        <div class="gb-check" id="gb-colored">
                            <div class="gb-check-box">
                                <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </div>
                            <div class="gb-check-label">Colored Inputs</div>
                        </div>
                    </div>
                </div>
                <div class="gb-row">
                    <div class="gb-item" data-row="12" data-col="0">
                        <div class="gb-check" id="gb-leftHand">
                            <div class="gb-check-box">
                                <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </div>
                            <div class="gb-check-label">Left Hand</div>
                        </div>
                    </div>
                    <div class="gb-item" data-row="12" data-col="1">
                        <div class="gb-check" id="gb-rightHand">
                            <div class="gb-check-box">
                                <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </div>
                            <div class="gb-check-label">Right Hand</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="gb-section">
                <div class="gb-section-title">System & Gaming</div>
                <div class="gb-row">
                    <div class="gb-item" data-row="13" data-col="0">
                        <div class="gb-check" id="gb-mp">
                            <div class="gb-check-box">
                                <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </div>
                            <div class="gb-check-label">Multiplayer</div>
                        </div>
                    </div>
                    <div class="gb-item" data-row="13" data-col="1">
                        <div class="gb-check" id="gb-fps">
                            <div class="gb-check-box">
                                <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </div>
                            <div class="gb-check-label">Show FPS</div>
                        </div>
                    </div>
                </div>
                <div class="gb-row">
                    <div class="gb-item" data-row="14" data-col="0">
                        <div class="gb-check" id="gb-autoSave">
                            <div class="gb-check-box">
                                <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </div>
                            <div class="gb-check-label">Auto-Save</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="gb-section">
                <div class="gb-section-title">Notifications</div>
                <div class="gb-row">
                    <div class="gb-item" data-row="15" data-col="0">
                        <div class="gb-check" id="gb-notif">
                            <div class="gb-check-box">
                                <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </div>
                            <div class="gb-check-label">Notifications</div>
                        </div>
                    </div>
                    <div class="gb-item" data-row="15" data-col="1">
                        <div class="gb-check" id="gb-notifSound">
                            <div class="gb-check-box">
                                <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </div>
                            <div class="gb-check-label">Notif Sound</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="gb-section">
                <div class="gb-section-title">Power & Sleep</div>
                <div class="gb-item" data-row="16" data-col="0">
                    <div class="gb-item-content">
                        <div class="gb-label">Sleep Timer</div>
                        <div class="gb-slider" id="gb-sleep">
                            <div class="gb-slider-fill"></div>
                            <div class="gb-slider-thumb"></div>
                        </div>
                    </div>
                </div>
                <div class="gb-row">
                    <div class="gb-item" data-row="17" data-col="0">
                        <div class="gb-check" id="gb-screensaver">
                            <div class="gb-check-box">
                                <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </div>
                            <div class="gb-check-label">Screensaver</div>
                        </div>
                    </div>
                    <div class="gb-item" data-row="17" data-col="1">
                        <div class="gb-check" id="gb-wifi">
                            <div class="gb-check-box">
                                <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </div>
                            <div class="gb-check-label">Wi-Fi (mock)</div>
                        </div>
                    </div>
                </div>
                <div class="gb-row">
                    <div class="gb-item" data-row="17" data-col="0" style="display:none;"></div>
                </div>
            </div>

            <div class="gb-section">
                <div class="gb-section-title">Security</div>
                <div class="gb-row">
                    <div class="gb-item" data-row="19" data-col="0">
                        <div class="gb-check" id="gb-lock">
                            <div class="gb-check-box">
                                <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </div>
                            <div class="gb-check-label">Lock Screen</div>
                        </div>
                    </div>
                    <div class="gb-item" data-row="19" data-col="1">
                        <div class="gb-item-content" style="align-items: center; justify-content: center;">
                            <div class="gb-label" style="margin:0;">Set PIN</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="gb-section">
                <div class="gb-section-title">System</div>
                <div class="gb-row">
                    <div class="gb-item" data-row="18" data-col="0">
                        <div class="gb-item-content" style="align-items: center; justify-content: center;">
                            <div class="gb-label" style="margin:0;">Reset Settings</div>
                        </div>
                    </div>
                    <div class="gb-item" data-row="18" data-col="1">
                        <div class="gb-item-content" style="align-items: center; justify-content: center;">
                            <div class="gb-label" style="margin:0;">Reset Account</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    init: function () {
        const app = document.getElementById('settings-app');
        if (!app) return;

        const items = Array.from(app.querySelectorAll('.gb-item'));

        // Build 2D grid map from data-row/data-col
        const grid = {};
        items.forEach(item => {
            const row = parseInt(item.dataset.row);
            const col = parseInt(item.dataset.col);
            if (!grid[row]) grid[row] = [];
            grid[row].push({ el: item, row, col });
        });
        Object.keys(grid).forEach(r => grid[r].sort((a, b) => a.col - b.col));
        const rows = Object.keys(grid).map(Number).sort((a, b) => a - b);

        let focusRow = 0;
        let focusCol = 0;
        
        // Profile Management Logic
        let accounts = JSON.parse(window.PocketDB.getItem('pocketjs_accounts')) || [{ id: 'user1', name: 'Player 1', avatar: 'assets/profile1.png' }];
        let currentAccountId = window.PocketDB.getItem('pocketjs_current_account') || 'user1';
        let isTyping = false;
        let typeBuffer = "";
        
        function saveAccounts() {
            window.PocketDB.setItem('pocketjs_accounts', JSON.stringify(accounts));
            window.PocketDB.setItem('pocketjs_current_account', currentAccountId);
        }

        function getCurrentAccount() {
            return accounts.find(a => a.id === currentAccountId) || accounts[0];
        }

        function updateProfileUI() {
            const acc = getCurrentAccount();
            const avatarImg = document.getElementById('gb-avatar-img');
            const nameEl = document.getElementById('gb-profile-name');
            if (avatarImg) avatarImg.src = acc.avatar;
            if (nameEl) nameEl.textContent = acc.name;
        }

        // Initialize profile UI
        updateProfileUI();

        function getFocusedItem() {
            const rowItems = grid[rows[focusRow]];
            const clamped = Math.min(focusCol, rowItems.length - 1);
            return rowItems[clamped];
        }

        const sliders = {
            'gb-hue':  { value: window.currentHue, min: 0, max: 360, onChange: (v) => window.updateHue(v) },
            'gb-sat':  { value: window.currentSat, min: 0, max: 200, onChange: (v) => window.updateSat(v) },
            'gb-bri':  { value: window.currentBri, min: 70, max: 130, onChange: (v) => window.updateBri(v) },
            'gb-vol':  {
                value: Math.round(window.masterVolume * 100), min: 0, max: 100,
                onChange: (v) => {
                    window.masterVolume = v / 100;
                    window.PocketDB.setItem('pocketjs_vol', window.masterVolume);
                }
            },
            'gb-sens': {
                value: window.dpadSensitivity, min: 0, max: 100,
                onChange: (v) => { 
                    window.dpadSensitivity = v; 
                    window.PocketDB.setItem('pocketjs_sens', v);
                }
            },
            'gb-vib-amount': {
                value: window.vibrationAmount, min: 1, max: 100,
                onChange: (v) => {
                    window.vibrationAmount = Math.round(v);
                    window.PocketDB.setItem('pocketjs_vib_amount', window.vibrationAmount);
                }
            },
            'gb-sleep': {
                value: window.sleepTimer || 30, min: 5, max: 120,
                onChange: (v) => {
                    window.sleepTimer = Math.round(v);
                    window.PocketDB.setItem('pocketjs_sleep', window.sleepTimer);
                }
            }
        };

        const checks = {
            'gb-mp':       window.multiplayerEnabled,
            'gb-sfx':      window.sfxEnabled,
            'gb-shake':    window.vibrationEnabled,
            'gb-fps':      window.fpsEnabled,
            'gb-autoSave': window.autoSaveEnabled,
            'gb-darkMode': window.darkMode,
            'gb-colored':  window.coloredButtons,
            'gb-fullscreen': !!document.fullscreenElement,
            'gb-leftHand': window.handedness === 'left',
            'gb-rightHand': window.handedness === 'right',
            'gb-notif': window.notificationsEnabled,
            'gb-notifSound': window.notifSoundEnabled,
            'gb-screensaver': window.screensaverEnabled,
            'gb-wifi': window.wifiEnabled,
            'gb-lock': window.lockEnabled
        };

        const toggleFullscreen = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        };

        function updateSliderProgress(id) {} // Placeholder if needed

        function updateSliderVisual(id) {
            const el = document.getElementById(id);
            if (!el) return;
            const cfg = sliders[id];
            const pct = ((cfg.value - cfg.min) / (cfg.max - cfg.min)) * 100;
            el.querySelector('.gb-slider-fill').style.width = pct + '%';
            el.querySelector('.gb-slider-thumb').style.left = pct + '%';
        }

        function updateCheckVisual(id) {
            const el = document.getElementById(id);
            if (!el) return;
            if (checks[id]) el.classList.add('checked');
            else el.classList.remove('checked');
        }

        function updateFocus() {
            items.forEach(item => item.classList.remove('gb-focused'));
            const focused = getFocusedItem();
            if (focused) {
                focused.el.classList.add('gb-focused');
                
                // If focusing the first row, scroll to absolute top to see the title/header
                if (focusRow === 0) {
                    app.scrollTo({ top: 0, behavior: 'smooth' });
                } 
                // If focusing the last row, scroll to absolute bottom
                else if (focusRow === rows.length - 1) {
                    app.scrollTo({ top: app.scrollHeight, behavior: 'smooth' });
                }
                // Otherwise, perform standard scroll to keep item visible
                else {
                    focused.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            }
        }

        Object.keys(sliders).forEach(updateSliderVisual);
        Object.keys(checks).forEach(updateCheckVisual);
        updateFocus();

        this._inputHandler = (e) => {
            if (document.body.classList.contains('kb-active')) return;
            if (isTyping) {
                isTyping = false;
                updateProfileUI();
            }

            const action = e.detail.action;
            const focused = getFocusedItem();

            if (action === 'up') {
                focusRow = (focusRow - 1 + rows.length) % rows.length;
                focusCol = Math.min(focusCol, grid[rows[focusRow]].length - 1);
                updateFocus();
                window.playSfx('assets/move-menu.mp3', 3.5);
            } else if (action === 'down') {
                focusRow = (focusRow + 1) % rows.length;
                focusCol = Math.min(focusCol, grid[rows[focusRow]].length - 1);
                updateFocus();
                window.playSfx('assets/move-menu.mp3', 3.5);
            } else if (action === 'left' || action === 'right') {
                const slider = focused.el.querySelector('.gb-slider');
                if (slider) {
                    const id = slider.id;
                    const cfg = sliders[id];
                    const step = (cfg.max - cfg.min) / 100;
                    if (action === 'left') cfg.value = Math.max(cfg.min, cfg.value - step);
                    if (action === 'right') cfg.value = Math.min(cfg.max, cfg.value + step);
                    updateSliderVisual(id);
                    cfg.onChange(cfg.value);
                    window.playSfx('assets/change-menu.mp3', 0.6);
                } else {
                    const rowItems = grid[rows[focusRow]];
                    if (action === 'left' && focusCol > 0) { 
                        focusCol--; 
                        updateFocus();
                        window.playSfx('assets/move-menu.mp3', 3.5);
                    }
                    else if (action === 'right' && focusCol < rowItems.length - 1) { 
                        focusCol++; 
                        updateFocus();
                        window.playSfx('assets/move-menu.mp3', 3.5);
                    }
                }
            } else if (action === 'a') {
                const row = focused.row;
                const col = focused.col;

                if (row === 1 && col === 0) { // Change Name
                    typeBuffer = getCurrentAccount().name;
                    isTyping = true;
                    document.getElementById('gb-profile-name').textContent = typeBuffer + "_";
                    window.system.showKeyboard(typeBuffer, (res) => {
                        if (res.action === 'done') {
                            isTyping = false;
                            if (typeBuffer.trim() !== '') {
                                getCurrentAccount().name = typeBuffer.trim();
                                saveAccounts();
                            }
                            updateProfileUI();
                        } else if (res.action === 'backspace') {
                            typeBuffer = typeBuffer.slice(0, -1);
                            document.getElementById('gb-profile-name').textContent = typeBuffer + "_";
                        } else if (res.action === 'char' && typeBuffer.length < 15) {
                            typeBuffer += res.value;
                            document.getElementById('gb-profile-name').textContent = typeBuffer + "_";
                        }
                    });
                    return;
                }

                if (row === 1 && col === 1) { // Change Avatar
                    const acc = getCurrentAccount();
                    let match = acc.avatar.match(/profile(\d+)\.png/);
                    let idx = match ? parseInt(match[1]) : 1;
                    idx = (idx % 10) + 1; // 1 to 10
                    acc.avatar = `assets/profile${idx}.png`;
                    saveAccounts();
                    updateProfileUI();
                    window.playSfx('assets/change-menu.mp3');
                    return;
                }

                if (row === 2 && col === 0) { // New Account
                    typeBuffer = "New User";
                    isTyping = true;
                    document.getElementById('gb-profile-name').textContent = typeBuffer + "_";
                    window.system.showKeyboard(typeBuffer, (res) => {
                        if (res.action === 'done') {
                            isTyping = false;
                            if (typeBuffer.trim() !== '') {
                                let newAcc = { 
                                    id: 'user' + Date.now(), 
                                    name: typeBuffer.trim(), 
                                    avatar: 'assets/profile1.png' 
                                };
                                accounts.push(newAcc);
                                currentAccountId = newAcc.id;
                                saveAccounts();
                            }
                            updateProfileUI();
                        } else if (res.action === 'backspace') {
                            typeBuffer = typeBuffer.slice(0, -1);
                            document.getElementById('gb-profile-name').textContent = typeBuffer + "_";
                        } else if (res.action === 'char' && typeBuffer.length < 15) {
                            typeBuffer += res.value;
                            document.getElementById('gb-profile-name').textContent = typeBuffer + "_";
                        }
                    });
                    return;
                }

                if (row === 2 && col === 1) { // Switch Account
                    let idx = accounts.findIndex(a => a.id === currentAccountId);
                    idx = (idx + 1) % accounts.length;
                    currentAccountId = accounts[idx].id;
                    saveAccounts();
                    updateProfileUI();
                    window.playSfx('assets/change-menu.mp3');
                    return;
                }

                if (row === 18 && col === 0) { // Reset Settings
                    const keys = ['pocketjs_hue','pocketjs_sat','pocketjs_bri','pocketjs_vol','pocketjs_sfx','pocketjs_vib','pocketjs_vib_amount','pocketjs_sens','pocketjs_mp','pocketjs_fps','pocketjs_autosave','pocketjs_fullscreen','pocketjs_notif','pocketjs_notif_sound','pocketjs_screensaver','pocketjs_wifi','pocketjs_sleep','pocketjs_dark','pocketjs_colored','pocketjs_handedness'];
                    keys.forEach(k => window.PocketDB.removeItem(k));
                    window.playSfx('assets/change-menu.mp3');
                    if (window.NotificationService) window.NotificationService.show({ title: 'Settings', body: 'All settings reset. Restart to apply.' });
                    return;
                }

                if (row === 18 && col === 1) { // Reset Account
                    window.PocketDB.removeItem('pocketjs_accounts');
                    window.PocketDB.removeItem('pocketjs_current_account');
                    window.playSfx('assets/change-menu.mp3');
                    if (window.NotificationService) window.NotificationService.show({ title: 'Account', body: 'Account data reset.' });
                    return;
                }

                if (row === 19 && col === 1) { // Set PIN
                    typeBuffer = window.PocketDB.getItem('pocketjs_lock_pin') || '1234';
                    isTyping = true;
                    window.system.showKeyboard(typeBuffer, (res) => {
                        if (res.action === 'done') {
                            isTyping = false;
                            if (/^\d{1,8}$/.test(typeBuffer.trim())) {
                                window.PocketDB.setItem('pocketjs_lock_pin', typeBuffer.trim());
                                if (window.NotificationService) window.NotificationService.show({ title: 'PIN', body: 'PIN updated.' });
                            }
                        } else if (res.action === 'backspace') {
                            typeBuffer = typeBuffer.slice(0, -1);
                        } else if (res.action === 'char' && typeBuffer.length < 8) {
                            typeBuffer += res.value;
                        }
                    });
                    return;
                }

                const check = focused.el.querySelector('.gb-check');
                if (check) {
                    const id = check.id;
                    checks[id] = !checks[id];
                    updateCheckVisual(id);
                    window.playSfx('assets/change-menu.mp3');

                    if (id === 'gb-darkMode') {
                        window.toggleDarkMode(checks[id]);
                    } else if (id === 'gb-colored') {
                        window.toggleColoredButtons(checks[id]);
                    } else if (id === 'gb-fullscreen') {
                        toggleFullscreen();
                        window.PocketDB.setItem('pocketjs_fullscreen', checks[id]);
                    } else if (id === 'gb-mp') {
                        window.multiplayerEnabled = checks[id];
                        window.PocketDB.setItem('pocketjs_mp', checks[id]);
                    } else if (id === 'gb-sfx') {
                        window.sfxEnabled = checks[id];
                        window.PocketDB.setItem('pocketjs_sfx', checks[id]);
                    } else if (id === 'gb-shake') {
                        window.vibrationEnabled = checks[id];
                        window.PocketDB.setItem('pocketjs_vib', checks[id]);
                        if (checks[id] && navigator.vibrate) navigator.vibrate(20);
                    } else if (id === 'gb-fps') {
                        window.fpsEnabled = checks[id];
                        window.PocketDB.setItem('pocketjs_fps', checks[id]);
                        document.querySelectorAll('.fps-counter').forEach(el => {
                            el.style.display = checks[id] ? 'block' : 'none';
                        });
                    } else if (id === 'gb-autoSave') {
                        window.autoSaveEnabled = checks[id];
                        window.PocketDB.setItem('pocketjs_autosave', checks[id]);
                    } else if (id === 'gb-leftHand' || id === 'gb-rightHand') {
                        // Radio button behavior
                        if (id === 'gb-leftHand') {
                            checks['gb-leftHand'] = true;
                            checks['gb-rightHand'] = false;
                            window.toggleHandedness('left');
                        } else {
                            checks['gb-leftHand'] = false;
                            checks['gb-rightHand'] = true;
                            window.toggleHandedness('right');
                        }
                        updateCheckVisual('gb-leftHand');
                        updateCheckVisual('gb-rightHand');
                    } else if (id === 'gb-notif') {
                        window.notificationsEnabled = checks[id];
                        window.PocketDB.setItem('pocketjs_notif', checks[id]);
                    } else if (id === 'gb-notifSound') {
                        window.notifSoundEnabled = checks[id];
                        window.PocketDB.setItem('pocketjs_notif_sound', checks[id]);
                    } else if (id === 'gb-screensaver') {
                        window.screensaverEnabled = checks[id];
                        window.PocketDB.setItem('pocketjs_screensaver', checks[id]);
                    } else if (id === 'gb-wifi') {
                        window.wifiEnabled = checks[id];
                        window.PocketDB.setItem('pocketjs_wifi', checks[id]);
                    } else if (id === 'gb-lock') {
                        window.lockEnabled = checks[id];
                        window.PocketDB.setItem('pocketjs_lock', checks[id]);
                    }
                }
            }
        };

        this._fsHandler = () => {
            checks['gb-fullscreen'] = !!document.fullscreenElement;
            updateCheckVisual('gb-fullscreen');
        };
        document.addEventListener('fullscreenchange', this._fsHandler);

        window.addEventListener('appInput', this._inputHandler);
    },
    cleanup: function () {
        if (this._inputHandler) {
            window.removeEventListener('appInput', this._inputHandler);
        }
        if (this._fsHandler) {
            document.removeEventListener('fullscreenchange', this._fsHandler);
        }
    }
});
