window.apps.push({
    id: 'snake',
    name: 'Snake',
    thumbnail: './games/snake/assets/icon.svg',
    color: '#27ae60',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h3l2-4 3 8 3-10 2 6h5"/></svg>',
    html: `
        <div class="snake-app" id="snake-app">
            <canvas id="snake-canvas"></canvas>
        </div>
        <style>
            .snake-app { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#0b0f0a; }
            #snake-canvas { width: min(100%, calc(var(--scale) * 0.92)); height:auto; aspect-ratio:1/1; background:#000; border-radius: calc(var(--scale) * 0.02); image-rendering: pixelated; }
        </style>
    `,
    init: function () {
        const COLS = 17, ROWS = 17, CELL = 24;
        const canvas = document.getElementById('snake-canvas');
        canvas.width = COLS * CELL;
        canvas.height = ROWS * CELL;
        const ctx = canvas.getContext('2d');

        let snake, dir, nextDir, food, score, speed, acc, last, running, dead;

        function reset() {
            snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
            dir = { x: 1, y: 0 };
            nextDir = { x: 1, y: 0 };
            score = 0;
            speed = 140;
            dead = false;
            placeFood();
        }

        function placeFood() {
            while (true) {
                const f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
                if (!snake.some(s => s.x === f.x && s.y === f.y)) { food = f; return; }
            }
        }

        function step() {
            dir = nextDir;
            const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
            if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
                snake.some(s => s.x === head.x && s.y === head.y)) {
                dead = true;
                return;
            }
            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                score++;
                speed = Math.max(60, speed - 4);
                window.playSfx('assets/change-menu.mp3', 0.5);
                placeFood();
            } else {
                snake.pop();
            }
        }

        function draw() {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'rgba(255,255,255,0.04)';
            for (let i = 1; i < COLS; i++) {
                ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, canvas.height); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(canvas.width, i * CELL); ctx.stroke();
            }
            snake.forEach((s, i) => {
                ctx.fillStyle = i === 0 ? '#7CFC00' : '#27ae60';
                ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
            });
            ctx.fillStyle = '#ff5252';
            ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold ' + (CELL) + 'px Jua, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Score ' + score, CELL * 0.3, CELL * 0.9);

            if (dead) {
                ctx.fillStyle = 'rgba(0,0,0,0.75)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.font = 'bold ' + (CELL * 1.1) + 'px Jua, sans-serif';
                ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - CELL * 0.4);
                ctx.font = (CELL * 0.5) + 'px Jua, sans-serif';
                ctx.fillText('A to retry  Score ' + score, canvas.width / 2, canvas.height / 2 + CELL * 0.6);
            }
        }

        function loop(t) {
            if (!running) return;
            const delta = t - last;
            last = t;
            if (!dead) {
                acc += delta;
                if (acc >= speed) { acc = 0; step(); }
                draw();
            } else {
                draw();
            }
            requestAnimationFrame(loop);
        }

        reset();
        last = performance.now();
        acc = 0;
        running = true;
        requestAnimationFrame(loop);

        this._input = (e) => {
            const a = e.detail.action;
            if (dead) {
                if (a === 'a') { reset(); acc = 0; }
                return;
            }
            if (a === 'left' && dir.x === 0) nextDir = { x: -1, y: 0 };
            else if (a === 'right' && dir.x === 0) nextDir = { x: 1, y: 0 };
            else if (a === 'up' && dir.y === 0) nextDir = { x: 0, y: -1 };
            else if (a === 'down' && dir.y === 0) nextDir = { x: 0, y: 1 };
            else if (a === 'a') { step(); draw(); }
        };

        window.addEventListener('appInput', this._input);
    },
    cleanup: function () {
        if (this._input) window.removeEventListener('appInput', this._input);
    }
});
