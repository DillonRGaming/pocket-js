window.apps.push({
    id: 'flags',
    name: 'Flags',
    thumbnail: './games/flags/assets/icon.png',
    color: '#58cc02',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>',
    html: `
        <div class="duo-app" id="flags-app">
            <div class="duo-content">
                <div class="duo-question" id="flags-q"></div>
            </div>
            <div class="duo-answers" id="flags-a">
                <div class="duo-btn focused">USA</div>
                <div class="duo-btn">Canada</div>
                <div class="duo-btn">Mexico</div>
                <div class="duo-btn">UK</div>
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
        const flags = [
            { q: 'us', a: 'USA' }, { q: 'ca', a: 'Canada' }, { q: 'gb', a: 'UK' },
            { q: 'jp', a: 'Japan' }, { q: 'fr', a: 'France' }, { q: 'de', a: 'Germany' },
            { q: 'it', a: 'Italy' }, { q: 'br', a: 'Brazil' }, { q: 'au', a: 'Australia' },
            { q: 'in', a: 'India' }, { q: 'cn', a: 'China' }, { q: 'es', a: 'Spain' },
            { q: 'mx', a: 'Mexico' }, { q: 'kr', a: 'South Korea' }
        ];
        
        this.score = 0;
        this.focusIdx = 0;
        this.options = [];
        this.correctIdx = 0;
        this.locked = false;
        
        if (window.darkMode) document.getElementById('flags-app').classList.add('dark-mode');
        
        this.next = () => {
            this.locked = false;
            let current = flags[Math.floor(Math.random() * flags.length)];
            
            let others = flags.filter(f => f.a !== current.a);
            others.sort(() => Math.random() - 0.5);
            this.options = [current.a, others[0].a, others[1].a, others[2].a];
            this.options.sort(() => Math.random() - 0.5);
            this.correctIdx = this.options.indexOf(current.a);
            
            document.getElementById('flags-q').innerHTML = `<img src="https://flagcdn.com/w160/${current.q}.png" style="width: calc(var(--scale) * 0.4); border-radius: calc(var(--scale) * 0.02);">`;
            
            this.render();
        };
        
        this.render = () => {
            const container = document.getElementById('flags-a');
            if(!container) return;
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
                const btns = document.getElementById('flags-a').children;
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
            if (['left','right','up','down'].includes(a)) {
                this.render();
            }
        };
        
        window.addEventListener('appInput', this._input);
    },
    cleanup: function () {
        window.removeEventListener('appInput', this._input);
    }
});