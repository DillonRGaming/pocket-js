window.apps.push({
    id: 'terminal',
    name: 'Terminal',
    thumbnail: './games/to-polish/terminal/assets/icon.svg',
    color: '#2ecc71',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polyline points="4 7 9 12 4 17"/><line x1="12" y1="18" x2="20" y2="18"/></svg>',
    html: `
        <div class="term-app" id="term-app">
            <div class="term-output" id="term-output"></div>
            <div class="term-input-line">
                <span class="term-prompt">&gt;</span>
                <span class="term-input" id="term-input"></span>
                <span class="term-cursor" id="term-cursor">&#9608;</span>
            </div>
        </div>
        <style>
            .term-app {
                width: 100%; height: 100%;
                background: #0b0f0a;
                color: #4af626;
                font-family: 'Courier New', monospace;
                font-size: calc(var(--scale) * 0.032);
                padding: calc(var(--scale) * 0.03);
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .term-output {
                flex: 1;
                overflow-y: auto;
                white-space: pre-wrap;
                word-break: break-word;
                line-height: 1.4;
            }
            .term-output .term-echo { color: #aaffaa; }
            .term-output .term-err { color: #ff6b6b; }
            .term-output .term-info { color: #6bd0ff; }
            .term-input-line {
                display: flex;
                align-items: center;
                gap: calc(var(--scale) * 0.01);
                flex-shrink: 0;
            }
            .term-prompt { color: #4af626; font-weight: bold; }
            .term-input { white-space: pre; }
            .term-cursor { animation: term-blink 1s step-end infinite; }
            @keyframes term-blink { 50% { opacity: 0; } }
            .term-app.dark-mode { background: #000; }
        </style>
    `,
    init: function () {
        const app = document.getElementById('term-app');
        const out = document.getElementById('term-output');
        const inputEl = document.getElementById('term-input');
        const cursor = document.getElementById('term-cursor');
        if (!app || !out || !inputEl) return;

        if (window.darkMode) app.classList.add('dark-mode');

        let buffer = '';
        let history = [];
        let histIdx = -1;
        let isTyping = false;

        function println(text, cls) {
            const div = document.createElement('div');
            if (cls) div.className = cls;
            div.textContent = text;
            out.appendChild(div);
            out.scrollTop = out.scrollHeight;
        }

        function run(cmd) {
            const args = cmd.trim().split(/\s+/);
            const name = args.shift().toLowerCase();
            switch (name) {
                case '':
                    break;
                case 'help':
                    println('Commands: help, clear, echo, date, apps, open, whoami, theme, vibe, battery, about, calc', 'term-info');
                    break;
                case 'clear':
                case 'cls':
                    out.innerHTML = '';
                    break;
                case 'echo':
                    println(args.join(' '));
                    break;
                case 'date':
                    println(new Date().toString());
                    break;
                case 'whoami':
                    println('player@pocketjs');
                    break;
                case 'apps':
                    const ids = (window.apps || []).filter(a => !a.hidden).map(a => a.id);
                    println('Installed (' + ids.length + '): ' + ids.join(', '), 'term-info');
                    break;
                case 'open':
                    const target = args[0];
                    const found = (window.apps || []).find(a => a.id === target);
                    if (found) {
                        println('Opening ' + found.name + '...', 'term-info');
                        if (window.launchApp) window.launchApp(target);
                    } else {
                        println('No app named "' + target + '". Try: apps', 'term-err');
                    }
                    break;
                case 'theme':
                    if (args[0]) {
                        const h = parseInt(args[0]);
                        if (!isNaN(h)) { window.updateHue(h); println('Hue set to ' + h); }
                    } else {
                        println('Usage: theme <0-360>', 'term-info');
                    }
                    break;
                case 'vibe':
                    if (window.vibrationEnabled && navigator.vibrate) {
                        navigator.vibrate(60);
                        println('Buzz!', 'term-info');
                    } else {
                        println('Vibration disabled.', 'term-err');
                    }
                    break;
                case 'battery':
                    if (navigator.getBattery) {
                        navigator.getBattery().then(b => {
                            println('Battery: ' + Math.round(b.level * 100) + '%' + (b.charging ? ' (charging)' : ''));
                        }).catch(() => println('Battery unavailable.', 'term-err'));
                    } else {
                        println('Battery API unavailable on this device.', 'term-err');
                    }
                    break;
                case 'about':
                    println('Pocket.js Terminal v1.0', 'term-info');
                    println('A tiny shell for your handheld.', 'term-info');
                    break;
                case 'lock':
                    println('Locking device...', 'term-info');
                    if (window.lockNow) window.lockNow();
                    break;
                case 'setpin':
                    if (args[0] && /^\d{1,8}$/.test(args[0])) {
                        window.PocketDB.setItem('pocketjs_lock_pin', args[0]);
                        println('PIN set to ' + args[0]);
                    } else {
                        println('Usage: setpin <digits>', 'term-info');
                    }
                    break;
                case 'calc':
                    try {
                        const expr = args.join('').replace(/x/g, '*');
                        println(String(eval(expr)));
                    } catch (e) {
                        println('Bad expression.', 'term-err');
                    }
                    break;
                default:
                    println('Unknown command: ' + name + '. Type "help".', 'term-err');
            }
        }

        function refresh() {
            inputEl.textContent = buffer;
            out.scrollTop = out.scrollHeight;
        }

        println('Pocket.js Terminal — type "help" for commands.', 'term-info');

        this._input = (e) => {
            const a = e.detail.action;
            if (isTyping) return;

            if (a === 'a') {
                const cmd = buffer;
                println('> ' + cmd, 'term-echo');
                if (cmd.trim() !== '') {
                    history.push(cmd);
                    histIdx = history.length;
                }
                buffer = '';
                refresh();
                run(cmd);
                return;
            }
            if (a === 'b') {
                buffer = '';
                refresh();
                return;
            }
            if (a === 'up') {
                if (history.length > 0) {
                    histIdx = Math.max(0, histIdx - 1);
                    buffer = history[histIdx] || '';
                    refresh();
                }
                window.playSfx('assets/move-menu.mp3', 3.5);
                return;
            }
            if (a === 'down') {
                if (history.length > 0) {
                    histIdx = Math.min(history.length, histIdx + 1);
                    buffer = history[histIdx] || '';
                    refresh();
                }
                window.playSfx('assets/move-menu.mp3', 3.5);
                return;
            }
            if (a === 'left') {
                // open keyboard in typing mode
                isTyping = true;
                window.system.showKeyboard(buffer, (res) => {
                    if (res.action === 'done') {
                        isTyping = false;
                        buffer = res.value !== undefined ? res.value : buffer;
                        refresh();
                    } else if (res.action === 'backspace') {
                        buffer = buffer.slice(0, -1);
                        refresh();
                    } else if (res.action === 'char') {
                        if (buffer.length < 200) { buffer += res.value; refresh(); }
                    }
                });
                return;
            }
        };

        window.addEventListener('appInput', this._input);
    },
    cleanup: function () {
        if (this._input) window.removeEventListener('appInput', this._input);
    }
});
