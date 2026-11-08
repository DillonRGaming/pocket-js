window.apps.push({
    id: 'social',
    name: 'Social',
    color: '#4f46e5',
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 64 64\'%3E%3Crect width=\'64\' height=\'64\' rx=\'14\' fill=\'%234f46e5\'/%3E%3Ccircle cx=\'24\' cy=\'26\' r=\'8\' fill=\'white\'/%3E%3Ccircle cx=\'42\' cy=\'26\' r=\'8\' fill=\'white\'/%3E%3Cpath d=\'M16 48c0-8 6-12 14-12s14 4 14 12M34 36c8 0 14 4 14 12\' stroke=\'white\' stroke-width=\'4\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E',
    wideThumbnail: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 64 64\'%3E%3Crect width=\'64\' height=\'64\' rx=\'14\' fill=\'%234f46e5\'/%3E%3Ccircle cx=\'24\' cy=\'26\' r=\'8\' fill=\'white\'/%3E%3Ccircle cx=\'42\' cy=\'26\' r=\'8\' fill=\'white\'/%3E%3Cpath d=\'M16 48c0-8 6-12 14-12s14 4 14 12M34 36c8 0 14 4 14 12\' stroke=\'white\' stroke-width=\'4\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E',
    description: 'Your pocket profile. Sign up, log in, track your stats and achievements, and add friends.',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="8" r="3.2"/><circle cx="16" cy="8" r="3.2"/><path d="M3 19c0-3.3 2.7-5 6-5s6 1.7 6 5M11 14c3.3 0 6 1.7 6 5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>`,
    html: `
        <div class="social-app" id="social-root"></div>
        <style>
            .social-app {
                width: 100%; height: 100%;
                background: #15151f;
                color: #f2f2f7;
                font-family: 'Jua', 'Clear Sans', sans-serif;
                display: flex;
                flex-direction: column;
                padding: calc(var(--scale) * 0.04);
                box-sizing: border-box;
                overflow: hidden;
            }
            .soc-title {
                font-size: calc(var(--scale) * 0.055);
                font-weight: 900;
                color: #fff;
                margin-bottom: calc(var(--scale) * 0.02);
            }
            .soc-sub { font-size: calc(var(--scale) * 0.028); color: #9a9ab0; margin-bottom: calc(var(--scale) * 0.02); }
            .soc-list { display: flex; flex-direction: column; gap: calc(var(--scale) * 0.015); margin-top: calc(var(--scale) * 0.01); }
            .soc-item {
                background: #24243a;
                border-radius: calc(var(--scale) * 0.02);
                padding: calc(var(--scale) * 0.022) calc(var(--scale) * 0.03);
                font-size: calc(var(--scale) * 0.032);
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .soc-item.focused { background: #4f46e5; color: #fff; }
            .soc-item.field .val { color: #b9b9d6; font-weight: 500; }
            .soc-item.focused.field .val { color: #e6e6ff; }
            .soc-msg { margin-top: calc(var(--scale) * 0.02); font-size: calc(var(--scale) * 0.026); color: #ff9b9b; min-height: 1.2em; }
            .soc-msg.ok { color: #8ff0a4; }
            .soc-stats { display: flex; flex-direction: column; gap: calc(var(--scale) * 0.012); margin: calc(var(--scale) * 0.02) 0; }
            .soc-stat { font-size: calc(var(--scale) * 0.03); color: #d7d7ec; }
            .soc-stat b { color: #fff; }
            .soc-spacer { flex: 1; }
        </style>
    `,
    init: function () {
        const root = document.getElementById('social-root');

        const USERS_KEY = 'pocketjs_social_users';
        const SESSION_KEY = 'pocketjs_social_session';
        const friendsKey = (u) => 'pocketjs_social_friends_' + u;

        function hash(str) {
            let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
            for (let i = 0; i < str.length; i++) {
                const ch = str.charCodeAt(i);
                h1 = Math.imul(h1 ^ ch, 2654435761);
                h2 = Math.imul(h2 ^ ch, 1597334677);
            }
            h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
            h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
            return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
        }

        function getUsers() {
            try { return JSON.parse(PocketDB.getItem(USERS_KEY) || '[]'); } catch (e) { return []; }
        }
        function saveUsers(arr) { PocketDB.setItem(USERS_KEY, JSON.stringify(arr)); }
        function getFriends(u) {
            try { return JSON.parse(PocketDB.getItem(friendsKey(u)) || '[]'); } catch (e) { return []; }
        }
        function saveFriends(u, arr) { PocketDB.setItem(friendsKey(u), JSON.stringify(arr)); }

        let screen = 'auth';
        let mode = 'login';
        let session = PocketDB.getItem(SESSION_KEY) || '';
        let focus = 0;
        let fieldUser = '';
        let fieldPass = '';
        let msg = '';
        let msgOk = false;
        let currentItems = [];

        function setMsg(text, ok) { msg = text || ''; msgOk = !!ok; }

        function fmtTime(ms) {
            const m = Math.floor(ms / 60000);
            const h = Math.floor(m / 60);
            const mm = m % 60;
            if (h > 0) return h + 'h ' + mm + 'm';
            if (m > 0) return m + 'm';
            return Math.floor(ms / 1000) + 's';
        }

        function getStats() {
            const play = PocketDB.getAllPlaytime() || {};
            let total = 0; for (const k in play) total += (play[k] || 0);
            const ach = PocketDB.getAllAchievements() || {};
            let count = 0; for (const k in ach) count += (ach[k] || []).length;
            return { play: total, achievements: count };
        }

        function render() {
            if (screen === 'auth') return renderAuth();
            if (screen === 'home') return renderHome();
            if (screen === 'profile') return renderProfile();
            if (screen === 'friends') return renderFriends();
            if (screen === 'addfriend') return renderAddFriend();
        }

        function applyFocus() {
            root.querySelectorAll('.soc-item').forEach((el, i) => {
                el.classList.toggle('focused', i === focus);
            });
        }

        function renderAuth() {
            currentItems = [
                { type: 'toggle' },
                { type: 'field', key: 'user' },
                { type: 'field', key: 'pass' },
                { type: 'button', action: 'submit' }
            ];
            const mask = (s) => s ? '•'.repeat(Math.min(s.length, 12)) : '';
            root.innerHTML = `
                <div class="soc-title">Social</div>
                <div class="soc-sub">${mode === 'login' ? 'Log in to your account' : 'Create a new account'}</div>
                <div class="soc-list">
                    <div class="soc-item" data-i="0"><span>Mode</span><span>${mode === 'login' ? 'Login ▸' : '▸ Sign Up'}</span></div>
                    <div class="soc-item field" data-i="1"><span>Username</span><span class="val">${fieldUser ? escapeHtml(fieldUser) : '—'}</span></div>
                    <div class="soc-item field" data-i="2"><span>Password</span><span class="val">${mask(fieldPass) || '—'}</span></div>
                    <div class="soc-item" data-i="3"><span>${mode === 'login' ? 'Log In' : 'Sign Up'}</span><span>Ⓐ</span></div>
                </div>
                <div class="soc-msg ${msgOk ? 'ok' : ''}">${escapeHtml(msg)}</div>
                <div class="soc-spacer"></div>
            `;
            applyFocus();
        }

        function renderHome() {
            const friends = getFriends(session);
            currentItems = [
                { type: 'button', action: 'profile' },
                { type: 'button', action: 'friends' },
                { type: 'button', action: 'logout' }
            ];
            root.innerHTML = `
                <div class="soc-title">Hi, ${escapeHtml(session)}</div>
                <div class="soc-sub">What would you like to do?</div>
                <div class="soc-list">
                    <div class="soc-item" data-i="0"><span>My Profile</span><span>Ⓐ</span></div>
                    <div class="soc-item" data-i="1"><span>Friends (${friends.length})</span><span>Ⓐ</span></div>
                    <div class="soc-item" data-i="2"><span>Log Out</span><span>Ⓐ</span></div>
                </div>
                <div class="soc-msg ${msgOk ? 'ok' : ''}">${escapeHtml(msg)}</div>
                <div class="soc-spacer"></div>
            `;
            applyFocus();
        }

        function renderProfile() {
            const stats = getStats();
            currentItems = [{ type: 'button', action: 'back' }];
            root.innerHTML = `
                <div class="soc-title">${escapeHtml(session)}</div>
                <div class="soc-sub">Your stats</div>
                <div class="soc-stats">
                    <div class="soc-stat">Total playtime: <b>${fmtTime(stats.play)}</b></div>
                    <div class="soc-stat">Achievements: <b>${stats.achievements}</b> unlocked</div>
                </div>
                <div class="soc-list">
                    <div class="soc-item" data-i="0"><span>Back</span><span>Ⓐ</span></div>
                </div>
                <div class="soc-spacer"></div>
            `;
            applyFocus();
        }

        function renderFriends() {
            const friends = getFriends(session);
            currentItems = [
                { type: 'button', action: 'add' },
                ...friends.map((f, i) => ({ type: 'button', action: 'remove', name: f })),
                { type: 'button', action: 'back' }
            ];
            let html = `
                <div class="soc-title">Friends</div>
                <div class="soc-sub">${friends.length} friend${friends.length === 1 ? '' : 's'}</div>
                <div class="soc-list">
                    <div class="soc-item" data-i="0"><span>+ Add Friend</span><span>Ⓐ</span></div>
            `;
            friends.forEach((f, i) => {
                html += `<div class="soc-item" data-i="${i + 1}"><span>${escapeHtml(f)}</span><span>Ⓐ remove</span></div>`;
            });
            html += `<div class="soc-item" data-i="${friends.length + 1}"><span>Back</span><span>Ⓐ</span></div></div>`;
            html += `<div class="soc-msg ${msgOk ? 'ok' : ''}">${escapeHtml(msg)}</div><div class="soc-spacer"></div>`;
            root.innerHTML = html;
            applyFocus();
        }

        function renderAddFriend() {
            currentItems = [
                { type: 'field', key: 'user' },
                { type: 'button', action: 'doadd' },
                { type: 'button', action: 'back' }
            ];
            root.innerHTML = `
                <div class="soc-title">Add Friend</div>
                <div class="soc-sub">Enter a username (must have an account on this device)</div>
                <div class="soc-list">
                    <div class="soc-item field" data-i="0"><span>Username</span><span class="val">${fieldUser ? escapeHtml(fieldUser) : '—'}</span></div>
                    <div class="soc-item" data-i="1"><span>Add Friend</span><span>Ⓐ</span></div>
                    <div class="soc-item" data-i="2"><span>Back</span><span>Ⓐ</span></div>
                </div>
                <div class="soc-msg ${msgOk ? 'ok' : ''}">${escapeHtml(msg)}</div>
                <div class="soc-spacer"></div>
            `;
            applyFocus();
        }

        function escapeHtml(s) {
            return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        }

        function promptField(key) {
            const current = key === 'user' ? fieldUser : fieldPass;
            window.system.showKeyboard(key === 'pass' ? 'Password' : 'Username', (val) => {
                if (key === 'user') fieldUser = val.trim().slice(0, 20);
                else fieldPass = val.slice(0, 40);
                render();
            });
        }

        function doSubmit() {
            const users = getUsers();
            if (mode === 'signup') {
                if (!fieldUser || !fieldPass) { setMsg('Enter a username and password'); render(); return; }
                if (users.find(u => u.username === fieldUser)) { setMsg('That username is taken'); render(); return; }
                users.push({ username: fieldUser, passHash: hash(fieldPass) });
                saveUsers(users);
                session = fieldUser;
                PocketDB.setItem(SESSION_KEY, session);
                setMsg('Account created. Welcome!', true);
                screen = 'home'; focus = 0; fieldPass = ''; render();
            } else {
                const u = users.find(x => x.username === fieldUser);
                if (!u || u.passHash !== hash(fieldPass)) { setMsg('Wrong username or password'); render(); return; }
                session = fieldUser;
                PocketDB.setItem(SESSION_KEY, session);
                setMsg('Logged in.', true);
                screen = 'home'; focus = 0; fieldPass = ''; render();
            }
        }

        function doAddFriend() {
            const target = fieldUser.trim();
            if (!target) { setMsg('Type a username first'); render(); return; }
            if (target === session) { setMsg("That's you!"); render(); return; }
            const users = getUsers();
            if (!users.find(u => u.username === target)) { setMsg('No account with that username'); render(); return; }
            const friends = getFriends(session);
            if (friends.includes(target)) { setMsg('Already friends'); render(); return; }
            friends.push(target);
            saveFriends(session, friends);
            setMsg('Added ' + target + '!', true);
            screen = 'friends'; focus = 0; fieldUser = ''; render();
        }

        function activate() {
            const item = currentItems[focus];
            if (!item) return;
            if (item.type === 'field') { promptField(item.key); return; }
            if (item.type === 'toggle') {
                mode = mode === 'login' ? 'signup' : 'login';
                setMsg(''); render(); return;
            }
            if (item.type === 'button') {
                if (item.action === 'submit') doSubmit();
                else if (item.action === 'profile') { screen = 'profile'; focus = 0; setMsg(''); render(); }
                else if (item.action === 'friends') { screen = 'friends'; focus = 0; setMsg(''); render(); }
                else if (item.action === 'logout') { session = ''; PocketDB.removeItem(SESSION_KEY); screen = 'auth'; mode = 'login'; focus = 0; fieldUser = ''; fieldPass = ''; setMsg(''); render(); }
                else if (item.action === 'back') { screen = 'home'; focus = 0; setMsg(''); render(); }
                else if (item.action === 'add') { screen = 'addfriend'; focus = 0; setMsg(''); render(); }
                else if (item.action === 'doadd') doAddFriend();
                else if (item.action === 'remove') {
                    const friends = getFriends(session).filter(f => f !== item.name);
                    saveFriends(session, friends);
                    setMsg('Removed ' + item.name, true);
                    screen = 'friends'; focus = 0; render();
                }
            }
        }

        function move(dir) {
            if (!currentItems.length) return;
            if (dir === 'up') focus = (focus - 1 + currentItems.length) % currentItems.length;
            else if (dir === 'down') focus = (focus + 1) % currentItems.length;
            else if (dir === 'left' || dir === 'right') {
                // toggle mode when on the Mode row
                const item = currentItems[focus];
                if (item && item.type === 'toggle') { mode = mode === 'login' ? 'signup' : 'login'; setMsg(''); render(); return; }
            }
            applyFocus();
        }

        this._dpad = (e) => {
            if (document.body.classList.contains('kb-active')) return;
            const d = e.detail.direction;
            if (d === 'up' || d === 'down' || d === 'left' || d === 'right') move(d);
        };

        this._input = (e) => {
            if (document.body.classList.contains('kb-active')) return;
            const act = e.detail.action;
            if (act === 'up') move('up');
            else if (act === 'down') move('down');
            else if (act === 'left') move('left');
            else if (act === 'right') move('right');
            else if (act === 'a') activate();
            else if (act === 'b') {
                if (screen === 'profile' || screen === 'friends' || screen === 'addfriend') { screen = 'home'; focus = 0; setMsg(''); render(); }
                else if (screen === 'auth') { mode = 'login'; setMsg(''); render(); }
            }
        };

        window.addEventListener('dpadHeld', this._dpad);
        window.addEventListener('appInput', this._input);

        screen = session ? 'home' : 'auth';
        focus = 0;
        setMsg('');
        render();
    },
    cleanup: function () {
        if (this._dpad) window.removeEventListener('dpadHeld', this._dpad);
        if (this._input) window.removeEventListener('appInput', this._input);
        if (document.body.classList.contains('kb-active')) window.system.hideKeyboard();
    }
});
