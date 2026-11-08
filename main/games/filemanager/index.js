window.apps.push({
    id: 'filemanager',
    name: 'Files',
    thumbnail: './games/filemanager/assets/icon.png',
    color: '#f3f3f3',
    icon: '<svg viewBox="0 0 24 24" fill="#f39c12" xmlns="http://www.w3.org/2000/svg"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
    html: `
        <div class="fm-layout" id="fm-app">
            <div class="fm-sidebar">
                <div class="fm-nav-item focused" data-tab="home">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    Home
                </div>
                <div class="fm-nav-item" data-tab="local">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Documents
                </div>
                <div class="fm-nav-item" data-tab="recordings">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                    Recordings
                </div>
                <div class="fm-nav-item" data-tab="games">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="17" cy="12" r="1"/><circle cx="14" cy="12" r="1"/><path d="M6 12h4"/><path d="M8 10v4"/></svg>
                    Games
                </div>
            </div>
            <div class="fm-main">
                <div class="fm-header" id="fm-header">Home</div>
                <div class="fm-content" id="fm-content">
                    <!-- Grid items -->
                </div>
            </div>
        </div>
        <style>
            .fm-layout {
                display: flex; height: 100%; background: #f3f3f3; color: #1a1a1a;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .fm-sidebar {
                width: 35%; background: #e3e3e3; padding: calc(var(--scale) * 0.02);
                display: flex; flex-direction: column; gap: calc(var(--scale) * 0.01);
                border-right: 1px solid #d0d0d0;
            }
            .fm-nav-item {
                display: flex; align-items: center; gap: calc(var(--scale) * 0.02);
                padding: calc(var(--scale) * 0.02); border-radius: calc(var(--scale) * 0.015);
                font-size: calc(var(--scale) * 0.035); opacity: 0.7; transition: background 0.1s;
            }
            .fm-nav-item svg { width: calc(var(--scale) * 0.04); height: calc(var(--scale) * 0.04); }
            .fm-nav-item.selected { opacity: 1; font-weight: bold; }
            .fm-nav-item.focused { background: rgba(0,0,0,0.1); outline: calc(var(--scale) * 0.005) solid #0078d4; }
            
            .fm-main {
                flex: 1; display: flex; flex-direction: column;
            }
            .fm-header {
                padding: calc(var(--scale) * 0.03); font-size: calc(var(--scale) * 0.05);
                font-weight: bold; border-bottom: 1px solid #e0e0e0; background: #fafafa;
            }
            .fm-content {
                flex: 1; padding: calc(var(--scale) * 0.03); overflow-y: auto;
                display: grid; grid-template-columns: repeat(3, 1fr); gap: calc(var(--scale) * 0.02);
                align-content: start;
            }
            
            .fm-grid-item {
                display: flex; flex-direction: column; align-items: center; gap: calc(var(--scale) * 0.01);
                padding: calc(var(--scale) * 0.02); border-radius: calc(var(--scale) * 0.015);
                text-align: center;
            }
            .fm-grid-item.focused {
                background: #e5f3ff; outline: calc(var(--scale) * 0.005) solid #0078d4;
            }
            .fm-grid-item svg, .fm-grid-item img {
                width: calc(var(--scale) * 0.08); height: calc(var(--scale) * 0.08);
                object-fit: contain;
            }
            .fm-grid-item-label {
                font-size: calc(var(--scale) * 0.025); word-break: break-word;
                display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
            }
            
            .fm-layout.dark-mode { background: #202020; color: #fff; }
            .fm-layout.dark-mode .fm-sidebar { background: #1a1a1a; border-right-color: #333; }
            .fm-layout.dark-mode .fm-nav-item.focused { background: rgba(255,255,255,0.1); outline-color: #4daafc; }
            .fm-layout.dark-mode .fm-header { background: #252525; border-bottom-color: #333; }
            .fm-layout.dark-mode .fm-grid-item.focused { background: #333; outline-color: #4daafc; }
        </style>
    `,
    init: function () {
        if (window.darkMode) document.getElementById('fm-app').classList.add('dark-mode');
        
        this.navArea = 'sidebar'; // 'sidebar' or 'content'
        this.currentTab = 'home';
        this.navIdx = 0;
        this.contentIdx = 0;
        this.items = [];
        this.isTyping = false;
        
        const tabs = ['home', 'local', 'recordings', 'games'];
        const tabTitles = { home: 'Home', local: 'Documents', recordings: 'Recordings', games: 'Games' };
        
        this.loadData = () => {
            if (this.currentTab === 'home') {
                this.items = [
                    { id: 'local', type: 'folder', name: 'Documents', icon: '<svg viewBox="0 0 24 24" fill="#f39c12"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>' },
                    { id: 'recordings', type: 'folder', name: 'Recordings', icon: '<svg viewBox="0 0 24 24" fill="#f39c12"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>' },
                    { id: 'games', type: 'folder', name: 'Games', icon: '<svg viewBox="0 0 24 24" fill="#f39c12"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>' }
                ];
            } else if (this.currentTab === 'local') {
                let fs = JSON.parse(window.PocketDB.getItem('pocketjs_fs')) || [];
                this.items = [{ id: 'new', type: 'action', name: 'New File', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>' }];
                fs.forEach((f, i) => {
                    this.items.push({ id: f.id, type: 'file', name: f.name, data: f.content, icon: '<svg viewBox="0 0 24 24" fill="#0078d4"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>' });
                });
            } else if (this.currentTab === 'recordings') {
                let recs = JSON.parse(window.PocketDB.getItem('pocketjs_recordings')) || [];
                this.items = recs.map(r => ({
                    id: r.id, type: 'audio', name: r.name, data: r.data, icon: '<svg viewBox="0 0 24 24" fill="#e74c3c"><path d="M12 2v20M17 5v14M7 5v14M22 10v4M2 10v4"/></svg>'
                }));
            } else if (this.currentTab === 'games') {
                this.items = window.apps.filter(a => a.id !== 'filemanager' && a.id !== 'settings').map(a => ({
                    id: a.id, type: 'app', name: a.name, icon: `<img src="${a.thumbnail}">`
                }));
            }
        };
        
        this.render = () => {
            // Update Sidebar
            const navs = document.querySelectorAll('.fm-nav-item');
            navs.forEach((el, i) => {
                el.classList.remove('selected', 'focused');
                if (tabs[i] === this.currentTab) el.classList.add('selected');
                if (this.navArea === 'sidebar' && i === this.navIdx) el.classList.add('focused');
            });
            
            // Update Header
            document.getElementById('fm-header').textContent = tabTitles[this.currentTab];
            
            // Update Content
            const content = document.getElementById('fm-content');
            content.innerHTML = '';
            this.items.forEach((item, i) => {
                const el = document.createElement('div');
                el.className = 'fm-grid-item' + (this.navArea === 'content' && this.contentIdx === i ? ' focused' : '');
                el.innerHTML = `
                    ${item.icon}
                    <div class="fm-grid-item-label">${item.name}</div>
                `;
                content.appendChild(el);
            });
            
            // Scroll into view
            if (this.navArea === 'content' && content.children[this.contentIdx]) {
                content.children[this.contentIdx].scrollIntoView({ block: 'nearest' });
            }
        };
        
        this.loadData();
        this.render();
        
        this._input = (e) => {
            if (this.isTyping) return;
            const a = e.detail.action;
            
            if (this.navArea === 'sidebar') {
                if (a === 'up') {
                    this.navIdx = Math.max(0, this.navIdx - 1);
                    this.currentTab = tabs[this.navIdx];
                    this.contentIdx = 0;
                    this.loadData();
                    window.playSfx('assets/move-menu.mp3', 3.5);
                } else if (a === 'down') {
                    this.navIdx = Math.min(tabs.length - 1, this.navIdx + 1);
                    this.currentTab = tabs[this.navIdx];
                    this.contentIdx = 0;
                    this.loadData();
                    window.playSfx('assets/move-menu.mp3', 3.5);
                } else if (a === 'right' || a === 'a') {
                    if (this.items.length > 0) {
                        this.navArea = 'content';
                        window.playSfx('assets/move-menu.mp3', 3.5);
                    }
                }
                this.render();
            } else if (this.navArea === 'content') {
                if (a === 'left') {
                    if (this.contentIdx % 3 === 0) {
                        this.navArea = 'sidebar';
                    } else {
                        this.contentIdx--;
                    }
                    window.playSfx('assets/move-menu.mp3', 3.5);
                } else if (a === 'right') {
                    if ((this.contentIdx + 1) % 3 !== 0 && this.contentIdx < this.items.length - 1) {
                        this.contentIdx++;
                        window.playSfx('assets/move-menu.mp3', 3.5);
                    }
                } else if (a === 'up') {
                    if (this.contentIdx >= 3) this.contentIdx -= 3;
                    window.playSfx('assets/move-menu.mp3', 3.5);
                } else if (a === 'down') {
                    if (this.contentIdx + 3 < this.items.length) this.contentIdx += 3;
                    else this.contentIdx = this.items.length - 1;
                    window.playSfx('assets/move-menu.mp3', 3.5);
                } else if (a === 'b') {
                    this.navArea = 'sidebar';
                    window.playSfx('assets/move-menu.mp3', 3.5);
                } else if (a === 'a') {
                    const item = this.items[this.contentIdx];
                    if (!item) return;
                    
                    window.playSfx('assets/change-menu.mp3', 0.6);
                    
                    if (item.type === 'folder') {
                        this.currentTab = item.id;
                        this.navIdx = tabs.indexOf(item.id);
                        this.contentIdx = 0;
                        this.loadData();
                    } else if (item.type === 'action' && item.id === 'new') {
                        this.isTyping = true;
                        window.system.showKeyboard("File name", (res) => {
                            if (res.action === 'done') {
                                this.isTyping = false;
                                let fs = JSON.parse(window.PocketDB.getItem('pocketjs_fs')) || [];
                                fs.push({ id: Date.now(), name: 'file.txt', content: '' });
                                window.PocketDB.setItem('pocketjs_fs', JSON.stringify(fs));
                                this.loadData();
                                this.render();
                            }
                        });
                        return;
                    } else if (item.type === 'file') {
                        this.isTyping = true;
                        const initialContent = item.data || '';
                        let tempContent = initialContent;
                        window.system.showKeyboard(tempContent, (res) => {
                            if (res.action === 'done') {
                                this.isTyping = false;
                                let fs = JSON.parse(window.PocketDB.getItem('pocketjs_fs')) || [];
                                let f = fs.find(x => x.id === item.id);
                                if (f) { f.content = tempContent; window.PocketDB.setItem('pocketjs_fs', JSON.stringify(fs)); }
                                this.loadData();
                                this.render();
                            } else if (res.action === 'backspace') {
                                tempContent = tempContent.slice(0, -1);
                                let fs = JSON.parse(window.PocketDB.getItem('pocketjs_fs')) || [];
                                let f = fs.find(x => x.id === item.id);
                                if (f) { f.content = tempContent; window.PocketDB.setItem('pocketjs_fs', JSON.stringify(fs)); }
                            } else if (res.action === 'char') {
                                tempContent += res.value;
                                let fs = JSON.parse(window.PocketDB.getItem('pocketjs_fs')) || [];
                                let f = fs.find(x => x.id === item.id);
                                if (f) { f.content = tempContent; window.PocketDB.setItem('pocketjs_fs', JSON.stringify(fs)); }
                            }
                        });
                        return;
                    } else if (item.type === 'audio') {
                        if (window.NotificationService) {
                            window.NotificationService.show({ title: 'Playing', body: item.name, appId: 'filemanager' });
                        }
                        const audio = new Audio(item.data);
                        audio.play();
                    }
                }
                this.render();
            }
        };
        
        window.addEventListener('appInput', this._input);
    },
    cleanup: function () {
        window.removeEventListener('appInput', this._input);
    }
});