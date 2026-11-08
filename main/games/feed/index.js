window.apps.push({
    id: 'feed',
    name: 'Feed',
    thumbnail: './assets/feed.png',
    version: '1.0',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.902.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/></svg>',
    color: '#1DA1F2',
    html: `
        <div class="feed-app" id="feed-app">
            <div class="feed-header">
                <span>Feed</span>
            </div>
            <div class="feed-list" id="feed-list">
                <!-- Items populated via JS -->
            </div>
        </div>
    `,
    init: function () {
        const app = document.getElementById('feed-app');
        if (!app) return;

        const listEl = document.getElementById('feed-list');
        
        // Settings app saves accounts in this key
        let accounts = JSON.parse(window.PocketDB.getItem('pocketjs_accounts')) || [{ id: 'user1', name: 'Player 1', avatar: 'assets/profile1.png' }];
        let currentAccountId = window.PocketDB.getItem('pocketjs_current_account') || 'user1';
        
        let posts = JSON.parse(window.PocketDB.getItem('pocketjs_feed_posts')) || [
            { id: 1, name: 'Pocket.js', avatar: 'assets/pocket.js.png', text: 'Welcome to the feed! Start posting.', time: Date.now() - 60000 }
        ];

        let focusIndex = 0;
        let isTyping = false;
        let typeBuffer = "";

        function getCurrentAccount() {
            return accounts.find(a => a.id === currentAccountId) || accounts[0];
        }

        function savePosts() {
            window.PocketDB.setItem('pocketjs_feed_posts', JSON.stringify(posts));
        }

        function formatTime(timestamp) {
            const diff = Date.now() - timestamp;
            const min = Math.floor(diff / 60000);
            if (min < 1) return 'Just now';
            if (min < 60) return min + 'm';
            const hr = Math.floor(min / 60);
            if (hr < 24) return hr + 'h';
            return Math.floor(hr / 24) + 'd';
        }

        function renderList() {
            const acc = getCurrentAccount();
            
            let html = `
                <div class="feed-item feed-create-btn" data-index="0">
                    <img class="feed-item-icon" src="${acc.avatar}">
                    <div class="feed-item-content" style="display:flex; align-items:center;">
                        <div class="feed-item-text" id="feed-type-preview">What's happening?</div>
                    </div>
                </div>
            `;

            posts.forEach((post, idx) => {
                html += `
                    <div class="feed-item" data-index="${idx + 1}">
                        <img class="feed-item-icon" src="${post.avatar}">
                        <div class="feed-item-content">
                            <div class="feed-item-header">
                                <span class="feed-item-name">${post.name}</span>
                                <span class="feed-item-time">${formatTime(post.time)}</span>
                            </div>
                            <div class="feed-item-text">${post.text}</div>
                        </div>
                    </div>
                `;
            });

            listEl.innerHTML = html;
            updateFocus(false);
        }

        function updateFocus(smooth = true) {
            const items = listEl.querySelectorAll('.feed-item');
            if (items.length === 0) return;
            
            focusIndex = Math.max(0, Math.min(focusIndex, items.length - 1));

            items.forEach((item, idx) => {
                if (idx === focusIndex) {
                    item.classList.add('focused');
                    if (smooth) {
                        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                } else {
                    item.classList.remove('focused');
                }
            });
        }

        renderList();

        this._inputHandler = (e) => {
            if (document.body.classList.contains('kb-active')) return;
            if (isTyping) {
                isTyping = false;
                renderList();
            }

            const action = e.detail.action;

            if (action === 'up') {
                if (focusIndex > 0) {
                    focusIndex--;
                    updateFocus();
                    window.playSfx('assets/move-menu.mp3', 3.5);
                }
            } else if (action === 'down') {
                const total = posts.length + 1;
                if (focusIndex < total - 1) {
                    focusIndex++;
                    updateFocus();
                    window.playSfx('assets/move-menu.mp3', 3.5);
                }
            } else if (action === 'a') {
                if (focusIndex === 0) {
                    // Create new post
                    typeBuffer = "";
                    isTyping = true;
                    document.getElementById('feed-type-preview').textContent = "_";
                    window.system.showKeyboard(typeBuffer, (res) => {
                        if (res.action === 'done') {
                            isTyping = false;
                            if (typeBuffer.trim() !== '') {
                                const acc = getCurrentAccount();
                                posts.unshift({
                                    id: Date.now(),
                                    name: acc.name,
                                    avatar: acc.avatar,
                                    text: typeBuffer.trim(),
                                    time: Date.now()
                                });
                                savePosts();
                            }
                            renderList();
                        } else if (res.action === 'backspace') {
                            typeBuffer = typeBuffer.slice(0, -1);
                            document.getElementById('feed-type-preview').textContent = typeBuffer + "_";
                        } else if (res.action === 'char' && typeBuffer.length < 140) {
                            typeBuffer += res.value;
                            document.getElementById('feed-type-preview').textContent = typeBuffer + "_";
                        }
                    });
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
