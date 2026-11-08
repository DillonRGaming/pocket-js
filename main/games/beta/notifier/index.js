window.apps.push({
    id: 'notifier',
    name: 'Notifier',
    thumbnail: './games/beta/notifier/assets/notifier.png',
    hidden: false,
    color: '#007aff',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
    </svg>`,
    html: `
        <div class="gb-app" id="notifier-app">
            <div class="gb-title">Notification Lab</div>

            <div class="gb-section">
                <div class="gb-section-title">Message Details</div>
                <div class="gb-item" data-row="0" data-col="0">
                    <div class="gb-item-content">
                        <div class="gb-label">Title</div>
                        <div class="gb-picker">
                            <span class="gb-picker-arrow">◀</span>
                            <span id="nt-title">Pocket.js</span>
                            <span class="gb-picker-arrow">▶</span>
                        </div>
                    </div>
                </div>
                <div class="gb-item" data-row="1" data-col="0">
                    <div class="gb-item-content">
                        <div class="gb-label">Message</div>
                        <div class="gb-picker">
                            <span class="gb-picker-arrow">◀</span>
                            <span id="nt-body">Hello World!</span>
                            <span class="gb-picker-arrow">▶</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="gb-section">
                <div class="gb-section-title">Source & Layout</div>
                <div class="gb-item" data-row="2" data-col="0">
                    <div class="gb-item-content">
                        <div class="gb-label">Sender App</div>
                        <div class="gb-picker">
                            <span class="gb-picker-arrow">◀</span>
                            <span id="nt-app">System</span>
                            <span class="gb-picker-arrow">▶</span>
                        </div>
                    </div>
                </div>
                <div class="gb-item" data-row="3" data-col="0">
                    <div class="gb-item-content">
                        <div class="gb-label">Action Buttons</div>
                        <div class="gb-picker">
                            <span class="gb-picker-arrow">◀</span>
                            <span id="nt-btns">None</span>
                            <span class="gb-picker-arrow">▶</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="gb-section">
                <div class="gb-section-title">Preview Card</div>
                <div class="notifier-preview-card" style="width: 100%; max-width: 90%; background: #ffffff; border: calc(var(--scale) * 0.008) solid #000; border-radius: calc(var(--scale) * 0.02); padding: calc(var(--scale) * 0.02) calc(var(--scale) * 0.035); display: flex; align-items: center; gap: calc(var(--scale) * 0.03);">
                    <div id="nt-preview-icon" style="width: calc(var(--scale) * 0.065); height: calc(var(--scale) * 0.065); background: #555; border-radius: calc(var(--scale) * 0.012); flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white;"></div>
                    <div style="flex: 1; min-width: 0;">
                        <div id="nt-preview-title" style="font-weight: 800; font-size: calc(var(--scale) * 0.032); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #1c1c1e;">Pocket.js</div>
                        <div id="nt-preview-body" style="font-size: calc(var(--scale) * 0.026); color: #636366; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Hello World!</div>
                    </div>
                </div>
            </div>

            <div class="gb-section" style="margin-top: calc(var(--scale) * 0.03);">
                <div class="gb-item" data-row="4" data-col="0" id="nt-send-btn" style="padding: 0; min-height: calc(var(--scale) * 0.1); overflow: hidden;">
                    <div style="width: 100%; height: 100%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: calc(var(--scale) * 0.04); letter-spacing: 0.1em; transition: all 0.2s;">
                        FIRE NOTIFICATION
                    </div>
                </div>
            </div>
        </div>
        <style>
            .dark-mode .notifier-preview-card { background: #1c1c1e !important; border-color: #eee !important; }
            .dark-mode #nt-preview-title { color: #f5f5f7 !important; }
            .dark-mode #nt-preview-body { color: #98989d !important; }
            .dark-mode #nt-send-btn > div { background: #fff !important; color: #000 !important; }
            #nt-send-btn.gb-focused > div { filter: brightness(1.2); letter-spacing: 0.15em; }
        </style>
    `,
    init: function () {
        const app = document.getElementById('notifier-app');
        if (!app) return;

        const titles = ['System Alert', 'New Message', 'Download Done', 'Reminder', 'Battery Low', 'Daily Goal'];
        const bodies = ['Everything is functioning normally.', 'Tap to read the full conversation.', 'Your file is ready to use.', 'Don\'t forget your next task.', 'Plug in your device soon.', 'You reached your objective!'];
        const buttonConfigs = ['None', '1 Button', '2 Buttons'];
        
        let state = {
            titleIdx: 0,
            bodyIdx: 0,
            appIdx: 0,
            btnIdx: 0,
            focusRow: 0
        };

        const availableApps = window.apps.filter(a => a.id !== 'notifier');

        const items = Array.from(app.querySelectorAll('.gb-item'));
        const rows = [...new Set(items.map(i => parseInt(i.dataset.row)))].sort((a,b) => a-b);

        function updateUI() {
            const senderApp = availableApps[state.appIdx] || { name: 'System', icon: '' };
            
            document.getElementById('nt-title').textContent = titles[state.titleIdx];
            document.getElementById('nt-body').textContent = bodies[state.bodyIdx];
            document.getElementById('nt-app').textContent = senderApp.name;
            document.getElementById('nt-btns').textContent = buttonConfigs[state.btnIdx];

            // Preview
            document.getElementById('nt-preview-title').textContent = titles[state.titleIdx];
            document.getElementById('nt-preview-body').textContent = bodies[state.bodyIdx];
            const iconEl = document.getElementById('nt-preview-icon');
            iconEl.innerHTML = senderApp.icon || '';
            iconEl.style.background = senderApp.color || '#555';

            items.forEach(item => item.classList.remove('gb-focused'));
            const focusedEl = app.querySelector(`.gb-item[data-row="${state.focusRow}"]`);
            if (focusedEl) {
                focusedEl.classList.add('gb-focused');
                
                if (state.focusRow === 0) {
                    app.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (state.focusRow === rows[rows.length-1]) {
                    app.scrollTo({ top: app.scrollHeight, behavior: 'smooth' });
                } else {
                    focusedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            }
        }

        function triggerNotification() {
            const senderApp = availableApps[state.appIdx] || { id: 'notifier' };
            const options = {
                title: titles[state.titleIdx],
                body: bodies[state.bodyIdx],
                appId: senderApp.id
            };

            if (state.btnIdx === 1) {
                options.buttons = [{ label: 'View', action: 'nt-view' }];
            } else if (state.btnIdx === 2) {
                options.buttons = [
                    { label: 'Accept', action: 'nt-yes' },
                    { label: 'Dismiss', action: 'nt-no' }
                ];
            }

            window.NotificationService.show(options);
            if (window.playSfx) window.playSfx('assets/enter-game.mp3', 0.8);
        }

        this._inputHandler = (e) => {
            const act = e.detail.action;
            if (act === 'up') {
                state.focusRow = (state.focusRow - 1 + rows.length) % rows.length;
                updateUI();
                if (window.playSfx) window.playSfx('assets/move-menu.mp3', 3.5);
            } else if (act === 'down') {
                state.focusRow = (state.focusRow + 1) % rows.length;
                updateUI();
                if (window.playSfx) window.playSfx('assets/move-menu.mp3', 3.5);
            } else if (act === 'left' || act === 'right') {
                const dir = act === 'left' ? -1 : 1;
                if (state.focusRow === 0) state.titleIdx = (state.titleIdx + dir + titles.length) % titles.length;
                else if (state.focusRow === 1) state.bodyIdx = (state.bodyIdx + dir + bodies.length) % bodies.length;
                else if (state.focusRow === 2) state.appIdx = (state.appIdx + dir + availableApps.length) % availableApps.length;
                else if (state.focusRow === 3) state.btnIdx = (state.btnIdx + dir + buttonConfigs.length) % buttonConfigs.length;
                updateUI();
                if (window.playSfx) window.playSfx('assets/change-menu.mp3', 0.6);
            } else if (act === 'a') {
                if (state.focusRow === 4) {
                    triggerNotification();
                } else {
                    if (window.playSfx) window.playSfx('assets/enter-game.mp3', 0.8);
                }
            }
        };

        window.addEventListener('appInput', this._inputHandler);
        updateUI();
    },
    cleanup: function () {
        if (this._inputHandler) window.removeEventListener('appInput', this._inputHandler);
    }
});
