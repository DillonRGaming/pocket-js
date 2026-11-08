window.apps.push({
    id: 'minesweeper',
    name: 'Minesweeper',
    thumbnail: './games/minesweeper/assets/icon.svg',
    color: '#8e44ad',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/></svg>',
    html: `
        <div class="ms-app" id="ms-app">
            <div class="ms-hud">
                <span id="ms-mines">Mines: 0</span>
                <span id="ms-state">Find them all</span>
            </div>
            <div class="ms-grid" id="ms-grid"></div>
        </div>
        <style>
            .ms-app { width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#1b1b2a; font-family:'Jua', sans-serif; gap: calc(var(--scale) * 0.02); box-sizing:border-box; padding: calc(var(--scale)*0.02); }
            .ms-hud { display:flex; gap: calc(var(--scale) * 0.06); font-size: calc(var(--scale) * 0.035); color:#fff; font-weight:bold; }
            .ms-grid { display:grid; gap: calc(var(--scale) * 0.004); background:#000; padding: calc(var(--scale)*0.004); border-radius: calc(var(--scale)*0.01); }
            .ms-cell { width: calc(var(--scale) * 0.055); height: calc(var(--scale) * 0.055); background:#4a4a6a; display:flex; align-items:center; justify-content:center; font-size: calc(var(--scale) * 0.035); font-weight:bold; color:#fff; border-radius: calc(var(--scale)*0.004); }
            .ms-cell.revealed { background:#2a2a3a; }
            .ms-cell.flag { background:#b9543b; }
            .ms-cell.mine { background:#e74c3c; }
            .ms-cell.focused { outline: calc(var(--scale)*0.006) solid #ffd400; }
        </style>
    `,
    init: function () {
        const COLS = 12, ROWS = 12, MINES = 22;
        const grid = document.getElementById('ms-grid');
        grid.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;

        let board, revealed, flags, fx, fy, over, won;

        function reset() {
            board = [];
            revealed = [];
            flags = [];
            over = false; won = false;
            for (let y = 0; y < ROWS; y++) {
                board.push(new Array(COLS).fill(0));
                revealed.push(new Array(COLS).fill(false));
                flags.push(new Array(COLS).fill(false));
            }
            let placed = 0;
            while (placed < MINES) {
                const x = Math.floor(Math.random() * COLS), y = Math.floor(Math.random() * ROWS);
                if (board[y][x] !== -1) { board[y][x] = -1; placed++; }
            }
            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    if (board[y][x] === -1) continue;
                    let n = 0;
                    for (let dy = -1; dy <= 1; dy++)
                        for (let dx = -1; dx <= 1; dx++) {
                            const nx = x + dx, ny = y + dy;
                            if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && board[ny][nx] === -1) n++;
                        }
                    board[y][x] = n;
                }
            }
            fx = 0; fy = 0;
            document.getElementById('ms-mines').textContent = 'Mines: ' + MINES;
            document.getElementById('ms-state').textContent = 'Find them all';
            build();
        }

        function build() {
            grid.innerHTML = '';
            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    const c = document.createElement('div');
                    c.className = 'ms-cell' + (revealed[y][x] ? ' revealed' : '') + (flags[y][x] ? ' flag' : '') + (fx === x && fy === y ? ' focused' : '');
                    if (revealed[y][x]) {
                        const v = board[y][x];
                        if (v === -1) { c.classList.add('mine'); c.textContent = '✸'; }
                        else if (v > 0) c.textContent = v;
                    } else if (flags[y][x]) {
                        c.textContent = '⚑';
                    }
                    grid.appendChild(c);
                }
            }
        }

        function reveal(x, y) {
            if (x < 0 || x >= COLS || y < 0 || y >= ROWS || revealed[y][x] || flags[y][x]) return;
            revealed[y][x] = true;
            if (board[y][x] === -1) { over = true; return; }
            if (board[y][x] === 0) {
                for (let dy = -1; dy <= 1; dy++)
                    for (let dx = -1; dx <= 1; dx++) reveal(x + dx, y + dy);
            }
        }

        function checkWin() {
            let count = 0;
            for (let y = 0; y < ROWS; y++)
                for (let x = 0; x < COLS; x++)
                    if (revealed[y][x]) count++;
            if (count === COLS * ROWS - MINES) { won = true; over = true; }
        }

        reset();

        this._input = (e) => {
            const a = e.detail.action;
            if (over) {
                if (a === 'a' || a === 'b') reset();
                return;
            }
            if (a === 'left' && fx > 0) fx--;
            else if (a === 'right' && fx < COLS - 1) fx++;
            else if (a === 'up' && fy > 0) fy--;
            else if (a === 'down' && fy < ROWS - 1) fy++;
            else if (a === 'a') {
                reveal(fx, fy);
                if (over) {
                    for (let y = 0; y < ROWS; y++)
                        for (let x = 0; x < COLS; x++)
                            if (board[y][x] === -1) revealed[y][x] = true;
                    document.getElementById('ms-state').textContent = 'Boom! A to retry';
                    window.playSfx('assets/error.mp3');
                } else {
                    checkWin();
                    if (won) {
                        document.getElementById('ms-state').textContent = 'You cleared it! A to retry';
                        window.playSfx('assets/change-menu.mp3', 0.6);
                    }
                }
            } else if (a === 'b') {
                flags[fy][fx] = !flags[fy][fx];
                window.playSfx('assets/change-menu.mp3', 0.5);
            }
            build();
        };

        window.addEventListener('appInput', this._input);
    },
    cleanup: function () {
        if (this._input) window.removeEventListener('appInput', this._input);
    }
});
