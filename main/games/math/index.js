window.apps.push({
    id: 'math',
    name: 'Math',
    thumbnail: './games/math/assets/icon.png',
    color: '#58cc02',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>',
    html: `
        <div class="duo-app" id="math-app">
            <div class="duo-content">
                <div class="duo-question" id="math-q">2 + 2</div>
            </div>
            <div class="duo-answers" id="math-a">
                <div class="duo-btn focused">4</div>
                <div class="duo-btn">5</div>
                <div class="duo-btn">6</div>
                <div class="duo-btn">3</div>
            </div>
        </div>
        <style>
            .duo-app {
                display: flex; flex-direction: column; height: 100%;
                background: #ffffff; color: #3c3c3c; font-family: 'Jua', sans-serif;
            }
            .duo-content {
                flex: 1; display: flex; align-items: center; justify-content: center;
            }
            .duo-question {
                font-size: calc(var(--scale) * 0.13); font-weight: 900; color: #3c3c3c;
                text-align: center;
            }
            .duo-answers {
                display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;
                gap: calc(var(--scale) * 0.02); padding: calc(var(--scale) * 0.04);
                height: 40%;
            }
            .duo-btn {
                background: #ffffff; border: calc(var(--scale) * 0.005) solid #e5e5e5;
                border-bottom-width: calc(var(--scale) * 0.01);
                border-radius: calc(var(--scale) * 0.03);
                display: flex; align-items: center; justify-content: center;
                font-size: calc(var(--scale) * 0.04); font-weight: bold; color: #4b4b4b;
                transition: transform 0.1s;
                text-align: center;
            }
            .duo-btn.focused {
                border-color: #a0a0a0; background: #f9f9f9;
                outline: calc(var(--scale) * 0.005) solid #a0a0a0;
                transform: scale(1.02);
            }
            .duo-btn.correct {
                border-color: #58cc02 !important; background: #d7ffb8 !important; color: #58cc02 !important;
                outline: none !important;
            }
            .duo-btn.wrong {
                border-color: #ea2b2b !important; background: #ffdfe0 !important; color: #ea2b2b !important;
                outline: none !important;
            }
            .duo-app.dark-mode { background: #1a1a1a; color: #fff; }
            .duo-app.dark-mode .duo-btn { background: #2a2a2a; border-color: #444; color: #fff; }
            .duo-app.dark-mode .duo-btn.focused { background: #333; border-color: #777; outline-color: #777; color: #fff; }
        </style>
    `,
    init: function () {
        this.score = 0;
        this.focusIdx = 0;
        this.options = [];
        this.correctIdx = 0;
        this.locked = false;

        if (window.darkMode) document.getElementById('math-app').classList.add('dark-mode');

        this.next = () => {
            this.locked = false;
            let op = Math.random();
            let a, b, ans, q;
            if (op < 0.5) {
                a = Math.floor(Math.random() * 20) + 1;
                b = Math.floor(Math.random() * 20) + 1;
                ans = a + b;
                q = `${a} + ${b}`;
            } else if (op < 0.8) {
                a = Math.floor(Math.random() * 20) + 10;
                b = Math.floor(Math.random() * a);
                ans = a - b;
                q = `${a} - ${b}`;
            } else {
                a = Math.floor(Math.random() * 10) + 2;
                b = Math.floor(Math.random() * 10) + 2;
                ans = a * b;
                q = `${a} × ${b}`;
            }

            let others = new Set();
            while (others.size < 3) {
                let off = Math.floor(Math.random() * 10) - 5;
                if (off === 0) off = 1;
                let wrong = ans + off;
                if (wrong > 0) others.add(wrong);
            }
            let oArr = Array.from(others);

            this.options = [ans, oArr[0], oArr[1], oArr[2]];
            this.options.sort(() => Math.random() - 0.5);
            this.correctIdx = this.options.indexOf(ans);

            document.getElementById('math-q').textContent = q;

            this.render();
        };

        this.render = () => {
            const container = document.getElementById('math-a');
            if (!container) return;
            container.innerHTML = '';
            this.options.forEach((opt, i) => {
                const el = document.createElement('div');
                el.className = 'duo-btn' + (this.focusIdx === i ? ' focused' : '');
                el.textContent = opt;
                container.appendChild(el);
            });
        };

        this.next();

        this._input = (e) => {
            if (this.locked) return;
            const a = e.detail.action;
            if (a === 'left' && this.focusIdx % 2 !== 0) this.focusIdx--;
            else if (a === 'right' && this.focusIdx % 2 === 0) this.focusIdx++;
            else if (a === 'up' && this.focusIdx > 1) this.focusIdx -= 2;
            else if (a === 'down' && this.focusIdx < 2) this.focusIdx += 2;
            else if (a === 'a') {
                this.locked = true;
                window.playSfx('assets/change-menu.mp3', 0.5);
                const btns = document.getElementById('math-a').children;
                if (this.focusIdx === this.correctIdx) {
                    btns[this.focusIdx].classList.add('correct');
                    this.score++;
                } else {
                    window.playSfx('assets/error.mp3');
                    btns[this.focusIdx].classList.add('wrong');
                    btns[this.correctIdx].classList.add('correct');
                    this.score = 0;
                }
                setTimeout(() => this.next(), 1500);
            }
            if (['left', 'right', 'up', 'down'].includes(a)) {
                this.render();
            }
        };

        window.addEventListener('appInput', this._input);
    },
    cleanup: function () {
        window.removeEventListener('appInput', this._input);
    }
});
