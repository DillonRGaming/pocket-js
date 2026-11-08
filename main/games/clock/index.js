window.apps.push({
    id: 'clock',
    name: 'Clock',
    thumbnail: './games/clock/assets/clock.png',
    color: '#1a1a1a',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </svg>`,
    html: `
        <div class="clock-app">
            <div class="clock-tabs" id="clock-tabs">
                <div class="clock-tab" data-tab="0">TIME</div>
                <div class="clock-tab" data-tab="1">TIMER</div>
                <div class="clock-tab" data-tab="2">STOPWATCH</div>
            </div>
            
            <div class="clock-body">
                
                <!-- TIME PANEL -->
                <div class="clock-panel" id="c-panel-0">
                    <div class="time-huge" id="time-huge">12:00</div>
                    <div class="time-sub" id="time-sub">AM • MON, JAN 1</div>
                </div>

                <!-- TIMER PANEL -->
                <div class="clock-panel" id="c-panel-1">
                    <div class="clock-display-area">
                        <div class="clock-digital" id="timer-text">05:00</div>
                    </div>
                    <div class="clock-btn-grid timer-grid">
                        <div class="clock-btn secondary" data-action="t-sub">-1 MIN</div>
                        <div class="clock-btn secondary" data-action="t-add">+1 MIN</div>
                        <div class="clock-btn secondary" data-action="t-sub-15">-15 SEC</div>
                        <div class="clock-btn secondary" data-action="t-add-15">+15 SEC</div>
                        <div class="clock-btn primary" id="timer-toggle-btn" data-action="t-toggle">START</div>
                        <div class="clock-btn secondary" data-action="t-reset">RESET</div>
                    </div>
                </div>

                <!-- STOPWATCH PANEL -->
                <div class="clock-panel" id="c-panel-2">
                    <div class="clock-display-area">
                        <div class="clock-digital" id="sw-text">00:00.00</div>
                    </div>
                    <div class="clock-btn-grid sw-grid">
                        <div class="clock-btn primary" id="sw-toggle-btn" data-action="sw-toggle">START</div>
                        <div class="clock-btn secondary" data-action="sw-reset">RESET</div>
                    </div>
                </div>

            </div>
        </div>
        <style>
            .clock-app {
                width: 100%; height: 100%;
                background: #1a1a1a;
                color: white;
                font-family: 'Jua', sans-serif;
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
                overflow: hidden;
                user-select: none;
            }

            /* --- Tabs --- */
            .clock-tabs {
                display: flex;
                background: #2a2a2a;
                border-radius: calc(var(--scale) * 0.03);
                margin: calc(var(--scale) * 0.03);
                padding: calc(var(--scale) * 0.008);
                gap: calc(var(--scale) * 0.01);
            }

            .clock-tab {
                flex: 1;
                text-align: center;
                font-size: calc(var(--scale) * 0.024);
                color: rgba(255, 255, 255, 0.4);
                padding: calc(var(--scale) * 0.015) 0;
                border-radius: calc(var(--scale) * 0.02);
                transition: all 0.2s;
            }

            .clock-tab.selected {
                background: #3d2d1e;
                color: white;
            }

            .clock-tab.focused {
                filter: brightness(1.5);
                transform: scale(1.05);
                color: white;
            }

            /* --- Panels --- */
            .clock-body {
                flex: 1;
                position: relative;
                margin: 0 calc(var(--scale) * 0.03) calc(var(--scale) * 0.03) calc(var(--scale) * 0.03);
            }

            .clock-panel {
                position: absolute;
                inset: 0;
                display: none;
                flex-direction: column;
            }

            .clock-panel.active {
                display: flex;
            }

            /* --- Huge Time View --- */
            #c-panel-0 {
                align-items: center;
                justify-content: center;
            }
            .time-huge {
                font-size: calc(var(--scale) * 0.22);
                line-height: 0.9;
                font-weight: 900;
            }
            .time-sub {
                font-size: calc(var(--scale) * 0.04);
                color: #f39c12;
                margin-top: calc(var(--scale) * 0.02);
                letter-spacing: calc(var(--scale) * 0.005);
            }

            /* --- Timer & Stopwatch Views --- */
            .clock-display-area {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .clock-digital {
                font-size: calc(var(--scale) * 0.16);
                font-variant-numeric: tabular-nums;
                font-weight: bold;
                letter-spacing: calc(var(--scale) * 0.005);
            }

            .clock-btn-grid {
                display: grid;
                gap: calc(var(--scale) * 0.02);
                height: 45%; /* Uses space heavily like the calculator */
            }

            .timer-grid {
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 1fr 1fr 1fr;
            }

            .sw-grid {
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 1fr;
                height: 25%;
            }

            .clock-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: calc(var(--scale) * 0.03);
                font-size: calc(var(--scale) * 0.035);
                transition: transform 0.1s, filter 0.1s;
                text-align: center;
            }

            .clock-btn.secondary {
                background: #3d2d1e;
                color: white;
            }

            .clock-btn.primary {
                background: #f39c12;
                color: #1a1a1a;
            }

            .clock-btn.active-state {
                background: #e74c3c !important; /* Flat red */
                color: white !important;
            }

            .clock-btn.focused {
                filter: brightness(1.3);
                transform: scale(1.05);
                z-index: 2;
            }
        </style>
    `,
    init: function () {
        // 1. SETUP GLOBAL STATE FOR BACKGROUND RUNNING
        if (!window.__clockState) {
            window.__clockState = {
                tab: 0,
                
                // Timer variables
                tDur: 5 * 60 * 1000,
                tRem: 5 * 60 * 1000,
                tEnd: 0,
                tRun: false,
                
                // Stopwatch variables
                swStart: 0,
                swElap: 0,
                swRun: false
            };
        }
        
        // 2. SETUP GLOBAL BACKGROUND WORKER
        if (!window.__clockWorker) {
            window.__clockWorker = setInterval(() => {
                const s = window.__clockState;
                const now = Date.now();
                let didChange = false;

                if (s.tRun) {
                    s.tRem = Math.max(0, s.tEnd - now);
                    if (s.tRem === 0) {
                        s.tRun = false;
                        if (window.playSfx) window.playSfx('assets/enter-game.mp3', 1.0);
                        if (window.NotificationService) {
                            window.NotificationService.show({
                                title: 'Timer',
                                body: 'Timer finished!',
                                appId: 'clock',
                                buttons: [
                                    { label: 'Stop', action: 'clock-stop' },
                                    { label: 'Reset', action: 'clock-reset' },
                                    { label: 'Snooze', action: 'clock-snooze' },
                                    { label: '+1 Min', action: 'clock-add1' }
                                ]
                            });

                            window.NotificationService.addActionListener('clock-stop', () => {
                                s.tRun = false;
                                s.tRem = 0;
                            });
                            window.NotificationService.addActionListener('clock-reset', () => {
                                s.tRun = false;
                                s.tRem = s.tDur;
                            });
                            window.NotificationService.addActionListener('clock-snooze', () => {
                                s.tRem = 5 * 60 * 1000; // 5 min
                                s.tEnd = Date.now() + s.tRem;
                                s.tRun = true;
                            });
                            window.NotificationService.addActionListener('clock-add1', () => {
                                s.tRem = 60000; // 1 min
                                s.tEnd = Date.now() + s.tRem;
                                s.tRun = true;
                            });
                        }
                    }
                    didChange = true;
                }

                if (s.swRun) {
                    s.swElap = now - s.swStart;
                    didChange = true;
                }

                // If running, we continuously dispatch an event to update the UI
                if (didChange || true) {
                    window.dispatchEvent(new CustomEvent('sysClockUpdate'));
                }
            }, 50); // fast interval for smooth milliseconds

            // Secondary slower interval for notification updates
            setInterval(() => {
                const s = window.__clockState;
                if (s.swRun || s.swElap > 0) {
                    let ms = s.swElap;
                    let m = Math.floor(ms / 60000);
                    let sec = Math.floor((ms % 60000) / 1000);
                    const pad = (n, w = 2) => String(n).padStart(w, '0');
                    const timeStr = `${pad(m)}:${pad(sec)}`;

                    const buttons = [
                        { label: s.swRun ? 'Pause' : 'Play', action: 'sw-toggle' },
                        { label: 'Reset', action: 'sw-reset' }
                    ];

                    if (window.NotificationService) {
                        let success = false;
                        if (s.swNotifId) {
                            success = window.NotificationService.update(s.swNotifId, {
                                body: timeStr,
                                buttons: buttons
                            });
                            if (!success) s.swNotifId = null;
                        }
                        
                        if (!s.swNotifId) {
                            s.swNotifId = window.NotificationService.show({
                                title: 'Stopwatch',
                                body: timeStr,
                                appId: 'clock',
                                buttons: buttons
                            });
                        }
                    }
                }
            }, 1000);

            if (window.NotificationService) {
                window.NotificationService.addActionListener('sw-toggle', () => {
                    const s = window.__clockState;
                    if (s.swRun) {
                        s.swRun = false;
                    } else {
                        s.swStart = Date.now() - s.swElap;
                        s.swRun = true;
                    }
                    window.dispatchEvent(new CustomEvent('sysClockUpdate'));
                });
                window.NotificationService.addActionListener('sw-reset', () => {
                    const s = window.__clockState;
                    s.swRun = false;
                    s.swElap = 0;
                    window.dispatchEvent(new CustomEvent('sysClockUpdate'));
                });
                window.NotificationService.addActionListener('sw-restart', () => {
                    const s = window.__clockState;
                    s.swStart = Date.now();
                    s.swElap = 0;
                    s.swRun = true;
                    window.dispatchEvent(new CustomEvent('sysClockUpdate'));
                });
            }
        }

        const s = window.__clockState;
        
        // --- Local UI State ---
        let navArea = 'tabs'; // 'tabs' or 'content'
        let focusIdx = [0, 0, 0]; // Index of focused button per tab

        // Helpers
        const pad = (n, w = 2) => String(n).padStart(w, '0');
        
        function formatTimer(ms) {
            let totalSecs = Math.ceil(ms / 1000);
            let m = Math.floor(totalSecs / 60);
            let sec = totalSecs % 60;
            return m > 59 ? `${pad(Math.floor(m/60))}:${pad(m%60)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
        }

        function formatSW(ms) {
            let m = Math.floor(ms / 60000);
            let sec = Math.floor((ms % 60000) / 1000);
            let hd = Math.floor((ms % 1000) / 10);
            return `${pad(m)}:${pad(sec)}.${pad(hd)}`;
        }

        // --- UI Updaters ---
        const updateUI = () => {
            // Update Real Time
            const date = new Date();
            let h = date.getHours();
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            const timeStr = `${h}:${pad(date.getMinutes())}`;
            const dateStr = `${ampm} • ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}`;
            
            document.querySelectorAll('#time-huge').forEach(e => e.textContent = timeStr);
            document.querySelectorAll('#time-sub').forEach(e => e.textContent = dateStr);

            // Update Timer/SW text
            document.querySelectorAll('#timer-text').forEach(e => e.textContent = formatTimer(s.tRem));
            document.querySelectorAll('#sw-text').forEach(e => e.textContent = formatSW(s.swElap));

            // Update Button labels & colors based on state
            document.querySelectorAll('#timer-toggle-btn').forEach(btn => {
                btn.textContent = s.tRun ? 'STOP' : 'START';
                if (s.tRun) btn.classList.add('active-state');
                else btn.classList.remove('active-state');
            });

            document.querySelectorAll('#sw-toggle-btn').forEach(btn => {
                btn.textContent = s.swRun ? 'STOP' : 'START';
                if (s.swRun) btn.classList.add('active-state');
                else btn.classList.remove('active-state');
            });
        };

        const updateFocus = () => {
            document.querySelectorAll('.clock-app').forEach(app => {
                // Reset all
                app.querySelectorAll('.clock-tab').forEach(el => el.classList.remove('focused', 'selected'));
                app.querySelectorAll('.clock-panel').forEach(el => el.classList.remove('active'));
                app.querySelectorAll('.clock-btn').forEach(el => el.classList.remove('focused'));

                const tabs = app.querySelectorAll('.clock-tab');
                const panels = app.querySelectorAll('.clock-panel');

                // Set Active Tab Layout
                if (tabs[s.tab]) tabs[s.tab].classList.add('selected');
                if (panels[s.tab]) panels[s.tab].classList.add('active');

                // Apply Focus Highlight
                if (navArea === 'tabs') {
                    if (tabs[s.tab]) tabs[s.tab].classList.add('focused');
                } else if (navArea === 'content') {
                    const activePanel = panels[s.tab];
                    if (activePanel) {
                        const buttons = activePanel.querySelectorAll('.clock-btn');
                        if (buttons.length > 0 && buttons[focusIdx[s.tab]]) {
                            buttons[focusIdx[s.tab]].classList.add('focused');
                        }
                    }
                }
            });
        };

        // --- Action Handlers ---
        const handleAction = (actionId) => {
            const now = Date.now();
            switch (actionId) {
                // Timer
                case 't-add':
                    if (!s.tRun) {
                        s.tDur += 60000;
                        s.tRem = s.tDur;
                    }
                    break;
                case 't-sub':
                    if (!s.tRun) {
                        s.tDur = Math.max(0, s.tDur - 60000);
                        s.tRem = s.tDur;
                    }
                    break;
                case 't-add-15':
                    if (!s.tRun) {
                        s.tDur += 15000;
                        s.tRem = s.tDur;
                    }
                    break;
                case 't-sub-15':
                    if (!s.tRun) {
                        s.tDur = Math.max(0, s.tDur - 15000);
                        s.tRem = s.tDur;
                    }
                    break;
                case 't-toggle':
                    if (s.tRun) {
                        s.tRun = false;
                        s.tDur = s.tRem; // save paused state
                    } else {
                        if (s.tRem <= 0) s.tRem = s.tDur; // reset if finished
                        s.tEnd = now + s.tRem;
                        s.tRun = true;
                    }
                    break;
                case 't-reset':
                    s.tRun = false;
                    s.tRem = s.tDur;
                    break;
                
                // Stopwatch
                case 'sw-toggle':
                    if (s.swRun) {
                        s.swRun = false;
                    } else {
                        s.swStart = now - s.swElap;
                        s.swRun = true;
                    }
                    break;
                case 'sw-reset':
                    s.swRun = false;
                    s.swElap = 0;
                    break;
            }
            if (window.playSfx) window.playSfx('assets/change-menu.mp3', 0.5);
            updateUI();
        };

        // --- Input Handling ---
        this._inputHandler = (e) => {
            const btn = e.detail.action;

            if (navArea === 'tabs') {
                if (btn === 'left') {
                    s.tab = Math.max(0, s.tab - 1);
                    if (window.playSfx) window.playSfx('assets/move-menu.mp3', 3.5);
                    updateFocus();
                } else if (btn === 'right') {
                    s.tab = Math.min(2, s.tab + 1);
                    if (window.playSfx) window.playSfx('assets/move-menu.mp3', 3.5);
                    updateFocus();
                } else if (btn === 'down' && s.tab !== 0) { 
                    navArea = 'content';
                    if (window.playSfx) window.playSfx('assets/move-menu.mp3', 3.5);
                    updateFocus();
                }
            } else if (navArea === 'content') {
                if (btn === 'b') {
                    navArea = 'tabs';
                    if (window.playSfx) window.playSfx('assets/move-menu.mp3', 3.5);
                    updateFocus();
                    return;
                }

                // Grid Navigation Logic
                if (s.tab === 1) { // TIMER (3x2 grid)
                    if (btn === 'up') {
                        if (focusIdx[1] < 2) navArea = 'tabs';
                        else focusIdx[1] -= 2;
                        if (window.playSfx) window.playSfx('assets/move-menu.mp3', 3.5);
                    } else if (btn === 'down') {
                        if (focusIdx[1] < 4) focusIdx[1] += 2;
                        if (window.playSfx) window.playSfx('assets/move-menu.mp3', 3.5);
                    } else if (btn === 'left') {
                        if (focusIdx[1] % 2 !== 0) focusIdx[1] -= 1;
                        if (window.playSfx) window.playSfx('assets/move-menu.mp3', 3.5);
                    } else if (btn === 'right') {
                        if (focusIdx[1] % 2 === 0) focusIdx[1] += 1;
                        if (window.playSfx) window.playSfx('assets/move-menu.mp3', 3.5);
                    }
                } else if (s.tab === 2) { // STOPWATCH (1x2 grid)
                    if (btn === 'up') {
                        navArea = 'tabs';
                        if (window.playSfx) window.playSfx('assets/move-menu.mp3', 3.5);
                    } else if (btn === 'left') {
                        focusIdx[2] = 0;
                        if (window.playSfx) window.playSfx('assets/move-menu.mp3', 3.5);
                    } else if (btn === 'right') {
                        focusIdx[2] = 1;
                        if (window.playSfx) window.playSfx('assets/move-menu.mp3', 3.5);
                    }
                }

                if (btn === 'a') {
                    // Find active panel and trigger data-action
                    let activePanel;
                    document.querySelectorAll('.clock-app').forEach(app => {
                        const panels = app.querySelectorAll('.clock-panel');
                        if (panels[s.tab] && panels[s.tab].classList.contains('active')) activePanel = panels[s.tab];
                    });
                    
                    if (activePanel) {
                        const focusedBtn = activePanel.querySelectorAll('.clock-btn')[focusIdx[s.tab]];
                        if (focusedBtn && focusedBtn.dataset.action) {
                            handleAction(focusedBtn.dataset.action);
                        }
                    }
                }
                
                updateFocus();
            }
        };

        // Bind events
        this._sysClockUpdate = () => updateUI();
        window.addEventListener('sysClockUpdate', this._sysClockUpdate);
        window.addEventListener('appInput', this._inputHandler);
        
        // Initial setup
        updateFocus();
        updateUI();
    },
    cleanup: function () {
        // Remove local UI event listeners, but the background worker stays alive!
        if (this._inputHandler) window.removeEventListener('appInput', this._inputHandler);
        if (this._sysClockUpdate) window.removeEventListener('sysClockUpdate', this._sysClockUpdate);
    }
});