window.apps.push({
    id: '2048',
    name: '2048',
    inputs: { left: 'winder', right: 'quad_buttons' },
    keyMap: {
        'w': 'up', 's': 'down', 'a': 'left', 'd': 'right',
        'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right',
        'k': 'a', 'j': 'b'
    },
    description: 'A simple yet addictive math-based puzzle. Slide tiles across the grid to merge matching numbers. Can you reach the legendary 2048 tile?',
    thumbnail: './games/2048/assets/2048.png',
    wideThumbnail: './games/2048/assets/w-2048.png',
    color: '#edc22e',
    achievements: [
        { id: '2048-v2-64', title: 'Bronze Block', description: 'Reach the 64 tile.', difficulty: 'easy', image: './games/2048/assets/a-1.png', trophy: 'bronze' },
        { id: '2048-v2-256', title: 'Silver Slider', description: 'Reach the 256 tile.', difficulty: 'medium', image: './games/2048/assets/a-2.png', trophy: 'silver' },
        { id: '2048-v2-s2000', title: 'Score Master I', description: 'Reach a score of 2000.', difficulty: 'medium', image: './games/2048/assets/a-3.png', trophy: 'silver' },
        { id: '2048-v2-s3000', title: 'Score Master II', description: 'Reach a score of 3000.', difficulty: 'hard', image: './games/2048/assets/a-4.png', trophy: 'gold' },
        { id: '2048-v2-left-key', title: 'Left Key Deficit', description: 'Get a 64 tile without using the left key.', difficulty: 'hard', image: './games/2048/assets/a-4.png', trophy: 'gold' },
        { id: '2048-v2-plat', title: 'Unlock all other 2048 Achievements', description: 'Master every challenge in 2048.', image: './games/2048/assets/a-plat.png', trophy: 'platinum' }
    ],
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#edc22e"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-weight="900" font-size="10" fill="white">2048</text>
    </svg>`,
    html: `
        <div class="app-2048" id="app-2048">
            <div class="g2048-header">
                <div class="g2048-title">2048</div>
                <div class="g2048-scores">
                    <div class="g2048-score-box">
                        <div class="g2048-score-label">SCORE</div>
                        <div class="g2048-score-value" id="g2048-score">0</div>
                    </div>
                    <div class="g2048-score-box">
                        <div class="g2048-score-label">BEST</div>
                        <div class="g2048-score-value" id="g2048-best">0</div>
                    </div>
                </div>
            </div>
            
            <div class="g2048-grid-container" id="g2048-grid">
                <div class="g2048-grid-cell"></div><div class="g2048-grid-cell"></div><div class="g2048-grid-cell"></div><div class="g2048-grid-cell"></div>
                <div class="g2048-grid-cell"></div><div class="g2048-grid-cell"></div><div class="g2048-grid-cell"></div><div class="g2048-grid-cell"></div>
                <div class="g2048-grid-cell"></div><div class="g2048-grid-cell"></div><div class="g2048-grid-cell"></div><div class="g2048-grid-cell"></div>
                <div class="g2048-grid-cell"></div><div class="g2048-grid-cell"></div><div class="g2048-grid-cell"></div><div class="g2048-grid-cell"></div>
                <div class="g2048-tile-container" id="g2048-tiles"></div>
            </div>

            <div class="g2048-msg" id="g2048-msg">
                <p></p>
                <div class="g2048-btn" id="g2048-restart">New Game</div>
            </div>
        </div>

        <style>
            .app-2048 {
                width: 100%; height: 100%;
                background: #faf8ef;
                font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: calc(var(--scale) * 0.05);
                box-sizing: border-box;
                overflow: hidden;
            }

            .dark-mode .app-2048 { background: #1a1a1a; }

            .g2048-header {
                width: 100%;
                max-width: calc(var(--scale) * 0.5);
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: calc(var(--scale) * 0.02);
            }

            .g2048-title {
                font-size: calc(var(--scale) * 0.08);
                font-weight: bold;
                color: #776e65;
            }
            .dark-mode .g2048-title { color: #eee; }

            .g2048-scores {
                display: flex;
                gap: calc(var(--scale) * 0.01);
            }

            .g2048-score-box {
                background: #bbada0;
                padding: calc(var(--scale) * 0.01) calc(var(--scale) * 0.03);
                border-radius: calc(var(--scale) * 0.01);
                text-align: center;
                min-width: calc(var(--scale) * 0.08);
            }

            .g2048-score-label {
                font-size: calc(var(--scale) * 0.015);
                font-weight: bold;
                color: #eee;
            }

            .g2048-score-value {
                font-size: calc(var(--scale) * 0.03);
                font-weight: bold;
                color: white;
            }

            .g2048-grid-container {
                position: relative;
                width: calc(var(--scale) * 0.5);
                height: calc(var(--scale) * 0.5);
                background: #bbada0;
                border-radius: calc(var(--scale) * 0.012);
                padding: calc(var(--scale) * 0.012);
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                grid-template-rows: repeat(4, 1fr);
                gap: calc(var(--scale) * 0.012);
                box-sizing: border-box;
            }

            .g2048-grid-cell {
                background: rgba(238, 228, 218, 0.35);
                border-radius: calc(var(--scale) * 0.008);
            }

            .g2048-tile-container {
                position: absolute;
                top: calc(var(--scale) * 0.012);
                left: calc(var(--scale) * 0.012);
                right: calc(var(--scale) * 0.012);
                bottom: calc(var(--scale) * 0.012);
                z-index: 2;
                pointer-events: none;
            }

            .g2048-tile {
                position: absolute;
                width: calc((100% - (calc(var(--scale) * 0.012) * 3)) / 4);
                height: calc((100% - (calc(var(--scale) * 0.012) * 3)) / 4);
                border-radius: calc(var(--scale) * 0.008);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: calc(var(--scale) * 0.05);
                transition: transform 100ms ease, opacity 100ms ease;
                z-index: 3;
                box-shadow: 0 calc(var(--scale) * 0.008) 0 var(--tile-shadow, #bbada0);
            }

            .g2048-tile-new { animation: g2048-appear 200ms ease; }
            .g2048-tile-merged { animation: g2048-pop 200ms ease; z-index: 4; }

            @keyframes g2048-appear { 
                0% { opacity: 0; transform: scale(0); }
                100% { opacity: 1; transform: scale(1); }
            }
            @keyframes g2048-pop {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            /* Tile Colors */
            .tile-2 { background: #eee4da; color: #776e65; --tile-shadow: #c2b4a5; }
            .tile-4 { background: #ede0c8; color: #776e65; --tile-shadow: #c8b99e; }
            .tile-8 { background: #f2b179; color: white; --tile-shadow: #d39157; }
            .tile-16 { background: #f59563; color: white; --tile-shadow: #d17544; }
            .tile-32 { background: #f67c5f; color: white; --tile-shadow: #cf4525; }
            .tile-64 { background: #f65e3b; color: white; --tile-shadow: #cf4525; }
            .tile-128 { background: #edcf72; color: white; --tile-shadow: #d1b447; font-size: calc(var(--scale) * 0.04); }
            .tile-256 { background: #edcc61; color: white; --tile-shadow: #d1ab33; font-size: calc(var(--scale) * 0.04); }
            .tile-512 { background: #edc850; color: white; --tile-shadow: #d1a620; font-size: calc(var(--scale) * 0.04); }
            .tile-1024 { background: #edc53f; color: white; --tile-shadow: #d1a115; font-size: calc(var(--scale) * 0.03); }
            .tile-2048 { background: #edc22e; color: white; --tile-shadow: #d19c00; font-size: calc(var(--scale) * 0.03); }

            .g2048-msg {
                position: absolute;
                inset: 0;
                background: rgba(238, 228, 218, 0.5);
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 100;
                text-align: center;
            }
            .dark-mode .g2048-msg { background: rgba(0,0,0,0.7); }

            .g2048-msg p {
                font-size: calc(var(--scale) * 0.08);
                font-weight: bold;
                color: #776e65;
                margin-bottom: calc(var(--scale) * 0.02);
            }
            .dark-mode .g2048-msg p { color: #fff; }

            .g2048-btn {
                background: #8f7a66;
                color: #fff;
                padding: calc(var(--scale) * 0.02) calc(var(--scale) * 0.05);
                border-radius: calc(var(--scale) * 0.01);
                font-weight: bold;
                font-size: calc(var(--scale) * 0.03);
                cursor: pointer;
            }

            .g2048-btn.focused {
                filter: brightness(1.2);
                transform: scale(1.1);
            }
        </style>
    `,
    init: function () {
        const app = document.getElementById('app-2048');
        const tileContainer = document.getElementById('g2048-tiles');
        const scoreEl = document.getElementById('g2048-score');
        const bestEl = document.getElementById('g2048-best');
        const msgEl = document.getElementById('g2048-msg');
        const restartBtn = document.getElementById('g2048-restart');

        let grid = Array(4).fill().map(() => Array(4).fill(0));
        let score = 0;
        let best = parseInt(window.PocketDB.getItem('g2048_best')) || 0;
        let gameOver = false;
        let leftKeyUsed = false;
        let lastWinderValue = 0;
        const WINDER_THRESHOLD = 0.6; // ~34 degrees per move

        function saveBest() {
            if (score > best) {
                best = score;
                bestEl.textContent = best;
                window.PocketDB.setItem('g2048_best', best);
            }
        }

        function addTile() {
            let empty = [];
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (grid[r][c] === 0) empty.push({ r, c });
                }
            }
            if (empty.length > 0) {
                let { r, c } = empty[Math.floor(Math.random() * empty.length)];
                grid[r][c] = Math.random() < 0.9 ? 2 : 4;
                return true;
            }
            return false;
        }

        function render() {
            tileContainer.innerHTML = '';
            scoreEl.textContent = score;
            bestEl.textContent = best;

            let maxTile = 0;
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (grid[r][c] !== 0) {
                        const val = grid[r][c];
                        if (val > maxTile) maxTile = val;
                        const tile = document.createElement('div');
                        tile.className = `g2048-tile tile-${val}`;
                        tile.textContent = val;

                        const left = (c * 25) + '%';
                        const top = (r * 25) + '%';
                        // Precision positioning + gap offset (gap/4 = 0.003 * scale)
                        tile.style.left = `calc(${left} + (var(--scale) * ${c * 0.003}))`;
                        tile.style.top = `calc(${top} + (var(--scale) * ${r * 0.003}))`;

                        tileContainer.appendChild(tile);
                    }
                }
            }

            // Achievement Checks
            if (window.AchievementService) {
                if (maxTile >= 64) {
                    window.AchievementService.unlock('2048-v2-64');
                    if (!leftKeyUsed) window.AchievementService.unlock('2048-v2-left-key');
                }
                if (maxTile >= 256) window.AchievementService.unlock('2048-v2-256');
                if (score >= 2000) window.AchievementService.unlock('2048-v2-s2000');
                if (score >= 3000) window.AchievementService.unlock('2048-v2-s3000');
            }

            if (gameOver) {
                msgEl.style.display = 'flex';
                msgEl.querySelector('p').textContent = iWin() ? 'Game Win!' : 'Game Over!';
                restartBtn.classList.add('focused');
            } else {
                msgEl.style.display = 'none';
                restartBtn.classList.remove('focused');
            }
        }

        function move(dir) {
            if (gameOver) return;
            if (dir === 'left') leftKeyUsed = true;
            let moved = false;
            let newGrid = JSON.parse(JSON.stringify(grid));

            const rotate = (g) => {
                let rg = Array(4).fill().map(() => Array(4).fill(0));
                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) rg[c][3 - r] = g[r][c];
                }
                return rg;
            };

            // Normalize move to 'left'
            let rotates = 0;
            if (dir === 'up') rotates = 3;
            if (dir === 'right') rotates = 2;
            if (dir === 'down') rotates = 1;

            for (let i = 0; i < rotates; i++) newGrid = rotate(newGrid);

            for (let r = 0; r < 4; r++) {
                let row = newGrid[r].filter(v => v !== 0);
                for (let i = 0; i < row.length - 1; i++) {
                    if (row[i] === row[i + 1]) {
                        const multiplier = (window.CheatService && window.CheatService.isActive('quadruple_merge')) ? 4 : 2;
                        row[i] *= multiplier;
                        score += row[i];
                        row.splice(i + 1, 1);
                        moved = true;
                    }
                }
                while (row.length < 4) row.push(0);
                if (JSON.stringify(newGrid[r]) !== JSON.stringify(row)) moved = true;
                newGrid[r] = row;
            }

            for (let i = 0; i < (4 - rotates) % 4; i++) newGrid = rotate(newGrid);

            if (moved) {
                grid = newGrid;
                addTile();
                saveBest();
                checkGameOver();
                render();
                if (window.playSfx) window.playSfx('assets/move-menu.mp3', 2.0);
            }
        }

        function iWin() {
            for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (grid[r][c] === 2048) return true;
            return false;
        }

        function checkGameOver() {
            if (iWin()) {
                gameOver = true;
                return;
            }
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (grid[r][c] === 0) return;
                    if (c < 3 && grid[r][c] === grid[r][c + 1]) return;
                    if (r < 3 && grid[r][c] === grid[r + 1][c]) return;
                }
            }
            gameOver = true;
        }

        function restart() {
            grid = Array(4).fill().map(() => Array(4).fill(0));
            score = 0;
            gameOver = false;
            leftKeyUsed = false;
            addTile();
            addTile();
            render();
        }

        this._inputHandler = (e) => {
            const act = e.detail.action;
            if (gameOver) {
                if (act === 'a') {
                    restart();
                    if (window.playSfx) window.playSfx('assets/enter-game.mp3', 0.8);
                }
                return;
            }

            if (['up', 'down', 'left', 'right'].includes(act)) {
                move(act);
            }
        };

        this._winderHandler = (e) => {
            const val = e.detail.value;
            const diff = val - lastWinderValue;
            
            if (Math.abs(diff) >= WINDER_THRESHOLD) {
                if (diff > 0) {
                    move('right');
                } else {
                    move('left');
                }
                lastWinderValue = val;
            }
        };

        window.addEventListener('appInput', this._inputHandler);
        window.addEventListener('winderInput', this._winderHandler);
        restart();
    },
    cleanup: function () {
        if (this._inputHandler) window.removeEventListener('appInput', this._inputHandler);
        if (this._winderHandler) window.removeEventListener('winderInput', this._winderHandler);
    }
});