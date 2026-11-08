window.apps.push({
    id: 'tetris',
    name: 'Tetris',
    thumbnail: './games/to-polish/tetris/assets/icon.svg',
    color: '#9b59b6',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>',
    html: `
        <div class="tetris-app" id="tetris-app">
            <canvas id="tetris-canvas"></canvas>
        </div>
        <style>
            .tetris-app {
                width: 100%; height: 100%;
                display: flex; align-items: center; justify-content: center;
                background: #0f0f1a;
            }
            #tetris-canvas {
                width: min(100%, calc(var(--scale) * 0.92));
                height: auto;
                aspect-ratio: 1 / 1;
                background: #000;
                border-radius: calc(var(--scale) * 0.02);
                image-rendering: pixelated;
            }
        </style>
    `,
    init: function () {
        const COLS = 14, ROWS = 14, CELL = 30;

        const COLORS = [
            null,
            '#1abc9c', // I
            '#f1c40f', // O
            '#9b59b6', // T
            '#2ecc71', // S
            '#e74c3c', // Z
            '#3498db', // J
            '#e67e22'  // L
        ];

        const SHAPES = [
            { c: 1, m: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
            { c: 2, m: [[1,1],[1,1]] },
            { c: 3, m: [[0,1,0],[1,1,1],[0,0,0]] },
            { c: 4, m: [[0,1,1],[1,1,0],[0,0,0]] },
            { c: 5, m: [[1,1,0],[0,1,1],[0,0,0]] },
            { c: 6, m: [[1,0,0],[1,1,1],[0,0,0]] },
            { c: 7, m: [[0,0,1],[1,1,1],[0,0,0]] }
        ];

        function rotate(matrix) {
            const N = matrix.length, M = matrix[0].length;
            const res = [];
            for (let x = 0; x < M; x++) {
                res.push([]);
                for (let y = N - 1; y >= 0; y--) {
                    res[x].push(matrix[y][x]);
                }
            }
            return res;
        }

        const canvas = document.getElementById('tetris-canvas');
        canvas.width = COLS * CELL;
        canvas.height = ROWS * CELL;
        const ctx = canvas.getContext('2d');

        function emptyBoard() {
            const b = [];
            for (let y = 0; y < ROWS; y++) b.push(new Array(COLS).fill(0));
            return b;
        }

        let board, piece, score, lines, gameOver, dropInterval, dropCounter, lastTime, running;

        function spawn() {
            const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            const m = s.m.map(r => r.slice());
            piece = {
                matrix: m,
                color: s.c,
                x: Math.floor((COLS - m[0].length) / 2),
                y: 0
            };
            if (collide(piece)) {
                gameOver = true;
            }
        }

        function collide(p) {
            const m = p.matrix;
            for (let y = 0; y < m.length; y++) {
                for (let x = 0; x < m[y].length; x++) {
                    if (m[y][x]) {
                        const nx = p.x + x;
                        const ny = p.y + y;
                        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
                        if (ny >= 0 && board[ny][nx]) return true;
                    }
                }
            }
            return false;
        }

        function merge() {
            piece.matrix.forEach((row, y) => {
                row.forEach((v, x) => {
                    if (v) {
                        const ny = piece.y + y;
                        const nx = piece.x + x;
                        if (ny >= 0) board[ny][nx] = piece.color;
                    }
                });
            });
        }

        function clearLines() {
            let cleared = 0;
            for (let y = ROWS - 1; y >= 0; y--) {
                if (board[y].every(v => v !== 0)) {
                    board.splice(y, 1);
                    board.unshift(new Array(COLS).fill(0));
                    cleared++;
                    y++;
                }
            }
            if (cleared > 0) {
                lines += cleared;
                score += [0, 100, 300, 500, 800][cleared] || 0;
            }
        }

        function move(dx) {
            piece.x += dx;
            if (collide(piece)) piece.x -= dx;
        }

        function softDrop() {
            piece.y++;
            if (collide(piece)) {
                piece.y--;
                merge();
                clearLines();
                spawn();
            }
            dropCounter = 0;
        }

        function hardDrop() {
            while (!collide(piece)) piece.y++;
            piece.y--;
            merge();
            clearLines();
            spawn();
            dropCounter = 0;
        }

        function rotatePiece() {
            const old = piece.matrix;
            piece.matrix = rotate(piece.matrix);
            let kick = 0;
            if (collide(piece)) {
                kick = -1; piece.x += kick;
                if (collide(piece)) {
                    kick = 2; piece.x += 2;
                    if (collide(piece)) {
                        kick = -2; piece.x -= 4;
                        if (collide(piece)) {
                            piece.x += 2;
                            piece.matrix = old;
                        }
                    }
                }
            }
        }

        function drawCell(x, y, color) {
            ctx.fillStyle = color;
            ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.fillRect(x * CELL, y * CELL, CELL, CELL * 0.16);
            ctx.strokeStyle = 'rgba(0,0,0,0.35)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x * CELL, y * CELL, CELL, CELL);
        }

        function render() {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            for (let x = 1; x < COLS; x++) {
                ctx.beginPath();
                ctx.moveTo(x * CELL, 0);
                ctx.lineTo(x * CELL, canvas.height);
                ctx.stroke();
            }
            for (let y = 1; y < ROWS; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * CELL);
                ctx.lineTo(canvas.width, y * CELL);
                ctx.stroke();
            }

            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    if (board[y][x]) drawCell(x, y, COLORS[board[y][x]]);
                }
            }

            if (piece && !gameOver) {
                piece.matrix.forEach((row, y) => {
                    row.forEach((v, x) => {
                        if (v) {
                            const ny = piece.y + y;
                            if (ny >= 0) drawCell(piece.x + x, ny, COLORS[piece.color]);
                        }
                    });
                });
            }

            ctx.fillStyle = '#fff';
            ctx.font = 'bold ' + (CELL * 0.5) + 'px Jua, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Score ' + score, CELL * 0.3, CELL * 0.7);

            if (gameOver) {
                ctx.fillStyle = 'rgba(0,0,0,0.75)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.font = 'bold ' + (CELL * 0.9) + 'px Jua, sans-serif';
                ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - CELL * 0.3);
                ctx.font = (CELL * 0.45) + 'px Jua, sans-serif';
                ctx.fillText('Press A to retry', canvas.width / 2, canvas.height / 2 + CELL * 0.6);
            }
        }

        function loop(time) {
            if (!running) return;
            const delta = time - lastTime;
            lastTime = time;
            if (!gameOver) {
                dropCounter += delta;
                if (dropCounter > dropInterval) {
                    softDrop();
                }
                render();
            } else {
                render();
            }
            requestAnimationFrame(loop);
        }

        function reset() {
            board = emptyBoard();
            score = 0;
            lines = 0;
            gameOver = false;
            dropInterval = 600;
            dropCounter = 0;
            spawn();
            render();
        }

        reset();
        lastTime = performance.now();
        running = true;
        requestAnimationFrame(loop);

        this._input = (e) => {
            const a = e.detail.action;
            if (gameOver) {
                if (a === 'a' || a === 'up') reset();
                return;
            }
            if (a === 'left') move(-1);
            else if (a === 'right') move(1);
            else if (a === 'down') softDrop();
            else if (a === 'up') rotatePiece();
            else if (a === 'a') hardDrop();
            render();
        };

        window.addEventListener('appInput', this._input);
    },
    cleanup: function () {
        if (this._input) window.removeEventListener('appInput', this._input);
    }
});
