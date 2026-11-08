window.apps.push({
    id: 'memory-matrix',
    name: 'Memory Matrix',
    color: '#358fe5',
    thumbnail: './games/memory-matrix/assets/icon.png',
    description: 'Watch the sequence, then repeat it back. Grids grow and colors shift as it gets harder.',
    achievements: [
        { id: 'matrix-lvl-5', title: 'Spatial Scout', description: 'Reach Level 5.', difficulty: 'easy', trophy: 'bronze' },
        { id: 'matrix-lvl-10', title: 'Mind Mapper', description: 'Reach Level 10.', difficulty: 'medium', trophy: 'silver' },
        { id: 'matrix-flawless', title: 'Flawless recall', description: 'Reach Level 6 without losing a single life.', difficulty: 'hard', trophy: 'gold' },
        { id: 'matrix-plat', title: 'Matrix Master', description: 'Unlock all other Memory Matrix Achievements.', trophy: 'platinum' }
    ],
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#358fe5"/>
        <rect x="5" y="5" width="5" height="5" rx="1.5" fill="white"/>
        <rect x="14" y="5" width="5" height="5" rx="1.5" fill="white"/>
        <rect x="5" y="14" width="5" height="5" rx="1.5" fill="white"/>
        <rect x="14" y="14" width="5" height="5" rx="1.5" fill="white"/>
    </svg>`,
    html: `
        <div class="matrix-app" id="matrix-app">
            <div class="matrix-header">
                <div class="matrix-level-text">Level <span id="matrix-level-val">1</span></div>
                <div class="matrix-lives">
                    <span>Lives</span>
                    <span id="matrix-hearts-container"></span>
                </div>
            </div>

            <div class="matrix-grid-container">
                <div class="matrix-grid" id="matrix-grid"></div>
            </div>

            <div class="matrix-overlay" id="matrix-gameover-overlay" style="display: none;">
                <h2>Game Over</h2>
                <p>You reached Level <span id="matrix-final-level">1</span></p>
                <div class="matrix-btn" id="matrix-restart-btn">Try Again</div>
            </div>
        </div>

        <style>
            .matrix-app {
                --bg: #358fe5;
                --tile-off: #1f4f7a;
                --tile-pulse: #cfe6ff;
                --tile-outline: #ffffff;
                width: 100%; height: 100%;
                background: var(--bg);
                color: white;
                font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                overflow: hidden;
                position: relative;
                user-select: none;
            }

            .matrix-header {
                position: absolute;
                top: calc(var(--scale) * 0.02);
                left: 0;
                right: 0;
                padding: 0 calc(var(--scale) * 0.04);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: calc(var(--scale) * 0.038);
                font-weight: bold;
                z-index: 5;
            }

            .matrix-lives {
                display: flex;
                align-items: center;
                gap: calc(var(--scale) * 0.015);
            }

            #matrix-hearts-container {
                display: flex;
                gap: calc(var(--scale) * 0.005);
            }

            .matrix-heart {
                display: inline-block;
                font-size: calc(var(--scale) * 0.035);
                color: white;
                transition: opacity 0.2s ease, transform 0.2s ease;
            }

            .matrix-heart.lost {
                opacity: 0.2;
                transform: scale(0.8);
            }

            .matrix-grid-container {
                position: relative;
                width: calc(var(--scale) * 0.55);
                height: calc(var(--scale) * 0.55);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .matrix-grid {
                width: 100%;
                height: 100%;
                display: grid;
                gap: calc(var(--scale) * 0.015);
                box-sizing: border-box;
            }

            .matrix-tile {
                background: #ffffff;
                border-radius: calc(var(--scale) * 0.015);
                cursor: pointer;
                transition: background 0.12s ease;
                box-sizing: border-box;
            }

            .matrix-tile.selected {
                background: #cfcfcf;
            }

            .matrix-tile.off, .matrix-tile.correct {
                background: var(--tile-off);
            }

            .matrix-tile.pulse {
                background: var(--tile-pulse);
            }

            .matrix-tile.wrong {
                background: #e74c3c;
            }

            .matrix-status {
                position: absolute;
                bottom: calc(var(--scale) * 0.025);
                left: 0;
                right: 0;
                text-align: center;
                font-size: calc(var(--scale) * 0.03);
                font-weight: bold;
                opacity: 0.85;
                z-index: 5;
                pointer-events: none;
            }

            .matrix-overlay {
                position: absolute;
                inset: 0;
                background: var(--bg);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 20;
                text-align: center;
                padding: calc(var(--scale) * 0.04);
            }

            .matrix-overlay h2 {
                font-size: calc(var(--scale) * 0.07);
                margin: 0 0 calc(var(--scale) * 0.02) 0;
                font-weight: bold;
            }

            .matrix-overlay p {
                font-size: calc(var(--scale) * 0.03);
                margin: 0 0 calc(var(--scale) * 0.04) 0;
                opacity: 0.9;
                max-width: 80%;
                line-height: 1.4;
            }

            .matrix-btn {
                background: #ffffff;
                color: var(--bg);
                padding: calc(var(--scale) * 0.018) calc(var(--scale) * 0.05);
                border-radius: calc(var(--scale) * 0.012);
                font-weight: bold;
                font-size: calc(var(--scale) * 0.032);
                cursor: pointer;
            }
        </style>
    `,
    init: function () {
        const appEl = document.getElementById('matrix-app');
        const gridEl = document.getElementById('matrix-grid');
        const levelValEl = document.getElementById('matrix-level-val');
        const heartsContainer = document.getElementById('matrix-hearts-container');
        const gameoverOverlay = document.getElementById('matrix-gameover-overlay');
        const restartBtn = document.getElementById('matrix-restart-btn');
        const finalLevelEl = document.getElementById('matrix-final-level');

        let level = 1;
        let lives = 3;
        let maxLives = 3;

        let gridSize = 4;
        let round = 1;              // 1..gridSize*gridSize within a level

        let permutation = [];       // full per-level order
        let sequence = [];          // current round's sequence (prefix of permutation)
        let inputIndex = 0;
        let selectionX = 0;
        let selectionY = 0;

        let status = 'init';        // 'show', 'input', 'transition', 'gameover'
        let inputLocked = false;
        let lostAnyLivesThisRun = false;

        let hue = Math.floor(Math.random() * 360);
        const timeouts = [];

        function later(fn, ms) {
            const t = setTimeout(() => {
                const i = timeouts.indexOf(t);
                if (i >= 0) timeouts.splice(i, 1);
                fn();
            }, ms);
            timeouts.push(t);
            return t;
        }

        function clearTimeouts() {
            while (timeouts.length) clearTimeout(timeouts.pop());
        }

        function gridSizeForLevel(lvl) {
            return Math.min(8, 2 + Math.floor((lvl - 1) / 5));
        }

        function applyColor() {
            appEl.style.setProperty('--bg', `hsl(${hue}, 52%, 46%)`);
            appEl.style.setProperty('--tile-off', `hsl(${hue}, 45%, 24%)`);
            appEl.style.setProperty('--tile-pulse', `hsl(${hue}, 60%, 78%)`);
            appEl.style.setProperty('--tile-outline', `hsl(${hue}, 80%, 16%)`);
        }

        function updateHearts() {
            heartsContainer.innerHTML = '';
            for (let i = 0; i < maxLives; i++) {
                const heart = document.createElement('span');
                heart.className = 'matrix-heart' + (i >= lives ? ' lost' : '');
                heart.textContent = '❤';
                heartsContainer.appendChild(heart);
            }
        }

        function buildGrid() {
            gridEl.innerHTML = '';
            gridEl.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
            gridEl.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
            const total = gridSize * gridSize;
            for (let idx = 0; idx < total; idx++) {
                const x = idx % gridSize;
                const y = Math.floor(idx / gridSize);
                const tile = document.createElement('div');
                tile.className = 'matrix-tile';
                tile.dataset.index = idx;
                tile.addEventListener('click', () => {
                    if (status !== 'input' || inputLocked) return;
                    selectionX = x;
                    selectionY = y;
                    updateSelection();
                    confirmSelection();
                });
                gridEl.appendChild(tile);
            }
        }

        function clearSelection() {
            const sel = gridEl.querySelector('.matrix-tile.selected');
            if (sel) sel.classList.remove('selected');
        }

        function updateSelection() {
            clearSelection();
            if (status !== 'input') return;
            const idx = selectionY * gridSize + selectionX;
            const tile = gridEl.children[idx];
            if (tile) tile.classList.add('selected');
        }

        function selectIndex(idx) {
            selectionX = idx % gridSize;
            selectionY = Math.floor(idx / gridSize);
            updateSelection();
        }

        function flashTile(idx, cls, ms) {
            const tile = gridEl.children[idx];
            if (!tile) return;
            tile.classList.add(cls);
            later(() => tile.classList.remove(cls), ms);
        }

        function buildPermutation() {
            const total = gridSize * gridSize;
            const arr = Array.from({ length: total }, (_, i) => i);
            for (let i = total - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function nextHue() {
            hue = (hue + 60 + Math.floor(Math.random() * 180)) % 360;
        }

        function setupLevel() {
            gridSize = gridSizeForLevel(level);
            nextHue();
            applyColor();
            buildGrid();
            permutation = buildPermutation();
            round = 1;
            startRound();
        }

        function startRound() {
            sequence = permutation.slice(0, round);
            showSequence();
        }

        function showSequence() {
            status = 'show';
            inputLocked = true;
            clearSelection();

            // start fully white
            for (const t of gridEl.children) {
                t.classList.remove('off');
                t.classList.remove('pulse');
                t.classList.remove('wrong');
            }

            const step = 500;
            const startDelay = 400;

            // each tile simply goes empty and stays (no flash)
            sequence.forEach((idx, i) => {
                later(() => {
                    const t = gridEl.children[idx];
                    if (t) t.classList.add('off');
                }, startDelay + i * step);
            });

            // after the last tile, wait then reset everything to white for clicking
            later(() => {
                for (const t of gridEl.children) t.classList.remove('off');
                status = 'input';
                inputLocked = false;
                inputIndex = 0;
                selectIndex(sequence[0]);
            }, startDelay + sequence.length * step + 500);
        }

        function confirmSelection() {
            if (status !== 'input' || inputLocked) return;
            const idx = selectionY * gridSize + selectionX;
            if (idx === sequence[inputIndex]) {
                const t = gridEl.children[idx];
                if (t) t.classList.add('off');
                inputIndex++;
                if (window.playSfx) window.playSfx('assets/change-menu.mp3', 0.5);
                if (inputIndex >= sequence.length) {
                    status = 'transition';
                    inputLocked = true;
                    clearSelection();
                    later(() => advanceRound(), 500);
                }
            } else {
                wrongPick(idx);
            }
        }

        function advanceRound() {
            const tilesThisLevel = gridSize * gridSize;
            if (round < tilesThisLevel) {
                round++;
                later(() => startRound(), 700);
            } else {
                level++;
                levelValEl.textContent = level;
                if (window.AchievementService) {
                    if (level >= 5) window.AchievementService.unlock('matrix-lvl-5');
                    if (level >= 10) window.AchievementService.unlock('matrix-lvl-10');
                    if (level >= 6 && !lostAnyLivesThisRun) window.AchievementService.unlock('matrix-flawless');
                }
                setupLevel();
            }
        }

        function wrongPick(idx) {
            inputLocked = true;
            clearSelection();
            flashTile(idx, 'wrong', 500);
            lives--;
            lostAnyLivesThisRun = true;
            updateHearts();
            if (window.playSfx) window.playSfx('assets/error.mp3');
            if (lives <= 0) {
                later(triggerGameOver, 550);
            } else {
                later(() => {
                    inputIndex = 0;
                    inputLocked = false;
                    showSequence();
                }, 650);
            }
        }

        function startGame() {
            level = 1;
            lives = 3;
            lostAnyLivesThisRun = false;
            levelValEl.textContent = level;
            updateHearts();

            gameoverOverlay.style.display = 'none';
            hue = Math.floor(Math.random() * 360);
            status = 'init';
            clearSelection();
        }

        function triggerGameOver() {
            status = 'gameover';
            inputLocked = true;
            clearSelection();
            finalLevelEl.textContent = level;
            gameoverOverlay.style.display = 'flex';
        }

        restartBtn.addEventListener('click', startGame);

        this._dpad = (e) => {
            const dir = e.detail.direction;
            if (status !== 'input' || inputLocked) return;
            if (dir === 'up') selectionY = (selectionY - 1 + gridSize) % gridSize;
            else if (dir === 'down') selectionY = (selectionY + 1) % gridSize;
            else if (dir === 'left') selectionX = (selectionX - 1 + gridSize) % gridSize;
            else if (dir === 'right') selectionX = (selectionX + 1) % gridSize;
            updateSelection();
            if (window.playSfx) window.playSfx('assets/move-menu.mp3', 3.5);
        };

        this._input = (e) => {
            const act = e.detail.action;
            if (status === 'init') {
                if (act === 'a') setupLevel();
                return;
            }
            if (status === 'gameover') {
                if (act === 'a') startGame();
                return;
            }
            if (status === 'input' && !inputLocked) {
                if (act === 'up') { selectionY = (selectionY - 1 + gridSize) % gridSize; updateSelection(); }
                else if (act === 'down') { selectionY = (selectionY + 1) % gridSize; updateSelection(); }
                else if (act === 'left') { selectionX = (selectionX - 1 + gridSize) % gridSize; updateSelection(); }
                else if (act === 'right') { selectionX = (selectionX + 1) % gridSize; updateSelection(); }
                else if (act === 'a') { confirmSelection(); }
                else if (act === 'b') {
                    inputIndex = 0;
                    showSequence();
                }
            } else if (status === 'show' && act === 'b') {
                // allow replaying the preview
                clearTimeouts();
                showSequence();
            }
        };

        window.addEventListener('dpadHeld', this._dpad);
        window.addEventListener('appInput', this._input);

        updateHearts();
        startGame();
    },
    cleanup: function () {
        if (this._dpad) window.removeEventListener('dpadHeld', this._dpad);
        if (this._input) window.removeEventListener('appInput', this._input);
    }
});
