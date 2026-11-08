window.apps.push({
    id: 'library',
    name: 'Game Library',
    thumbnail: './games/library/assets/library.png',
    version: '1.0',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4 3C2.895 3 2 3.895 2 5v14c0 1.105.895 2 2 2h16c1.105 0 2-.895 2-2V5c0-1.105-.895-2-2-2H4zm16 2v14H4V5h16zm-5 2v10h4V7h-4zm-6 0v10h4V7H9z"/></svg>',
    color: '#0A0A0A',
    html: `
        <div class="gb-app" id="lib-app">
            <div class="gb-title">Game Library</div>
            <div class="gb-section" style="flex: 1; overflow-y: auto; padding-bottom: calc(var(--scale) * 0.1);" id="lib-list">
                <!-- Items -->
            </div>
        </div>
    `,
    init: function () {
        const app = document.getElementById('lib-app');
        if (!app) return;
        
        const listEl = document.getElementById('lib-list');
        
        let focusRow = 0;
        const appsToShow = window.apps.filter(a => a.id !== 'library');
        
        function renderList() {
            listEl.innerHTML = appsToShow.map((a, i) => `
                <div class="gb-row">
                    <div class="gb-item" data-row="${i}" data-col="0" data-id="${a.id}">
                        <div class="gb-item-content" style="flex-direction: row; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: calc(var(--scale) * 0.03)">
                                <img src="${a.thumbnail}" style="width: calc(var(--scale)*0.13); height: calc(var(--scale)*0.13); border-radius: 15%; object-fit: cover; border: calc(var(--scale)*0.008) solid rgba(128, 128, 128, 0.2);">
                                <span class="gb-label" style="margin: 0; align-self: center; transform: translateY(calc(var(--scale)*0.01));">${a.name}</span>
                            </div>
                            <div class="gb-check ${window.pinnedAppIds.includes(a.id) ? 'checked' : ''}" style="margin-right: calc(var(--scale)*0.01)">
                                <div class="gb-check-box">
                                    <svg class="gb-check-mark" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            updateFocus();
        }
        
        function updateFocus() {
            const items = listEl.querySelectorAll('.gb-item');
            
            items.forEach((item, i) => {
                if (i === focusRow) {
                    item.classList.add('gb-focused');
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    item.classList.remove('gb-focused');
                }
            });
        }
        
        function updatePinnedIcons() {
            listEl.querySelectorAll('.gb-item').forEach((item, i) => {
                const id = appsToShow[i].id;
                const checkBlock = item.querySelector('.gb-check');
                const isPinned = window.pinnedAppIds.includes(id);
                
                if (checkBlock) {
                    if (isPinned) checkBlock.classList.add('checked');
                    else checkBlock.classList.remove('checked');
                }
            });
        }
        
        renderList();
        
        this._inputHandler = (e) => {
            if (document.body.classList.contains('kb-active')) return;
            
            const action = e.detail.action;
            
            if (action === 'up') {
                if (focusRow > 0) {
                    focusRow--;
                    updateFocus();
                    window.playSfx('assets/move-menu.mp3', 3.5);
                }
            } else if (action === 'down') {
                if (focusRow < appsToShow.length - 1) {
                    focusRow++;
                    updateFocus();
                    window.playSfx('assets/move-menu.mp3', 3.5);
                }
            } else if (action === 'a') {
                if (appsToShow.length > 0) {
                    const appId = appsToShow[focusRow].id;
                    if (window.togglePin) window.togglePin(appId);
                    updatePinnedIcons();
                    window.playSfx('assets/move-menu.mp3', 3.5);
                }
            }
        };
        
        window.addEventListener('appInput', this._inputHandler);
    },
    cleanup: function () {
        if (this._inputHandler) {
            window.removeEventListener('appInput', this._inputHandler);
        }
    }
});
