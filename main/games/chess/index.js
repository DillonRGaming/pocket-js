window.apps.push({
    id: 'chess',
    name: 'Chess',
    inputs: { 
        left: 'dpad',
        right: 'buttons'
    },
    description: 'The ancient game of kings. Master the board, protect your queen, and trap the enemy king in this timeless test of strategy and foresight.',
    thumbnail: './games/chess/assets/chess.png',
    wideThumbnail: './games/chess/assets/w-chess.png',
    color: '#779556',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5,2C10,2,7.5,4,7.5,6c0,1,0.5,2,1.5,3c-1.5,1.5-2.5,3.5-3,6h11c1-2,1.5-4.5,1-7c-0.5-3-2-5-4.5-5C12.5,2,12.5,2,12.5,2z M8,17h7v2H8V17z M7,20h9v2H7V20z"/>
    </svg>`,
    achievements: [
        { id: 'chess-0', title: 'Grand Entry', description: 'Start a new game of Chess.', image: './games/chess/assets/a-1.png', trophy: 'bronze' },
        { id: 'chess-1', title: 'First Move', description: 'Make your first move of the match.', image: './games/chess/assets/a-2.png', trophy: 'bronze' },
        { id: 'chess-3', title: 'Captured!', description: 'Take an opponent\'s piece for the first time.', image: './games/chess/assets/a-4.png', trophy: 'bronze' },
        { id: 'chess-4', title: 'In Check!', description: 'Put the enemy King in immediate danger.', image: './games/chess/assets/a-1.png', trophy: 'silver' },
        { id: 'chess-5', title: 'Ascension', description: 'Promote a Pawn to a more powerful piece.', image: './games/chess/assets/a-2.png', trophy: 'silver' },
        { id: 'chess-6', title: 'Stalemate', description: 'Draw a game by having no legal moves.', image: './games/chess/assets/a-4.png', trophy: 'gold' },
        { id: 'chess-2', title: 'Checkmate', description: 'Win a match by cornering the enemy King.', image: './games/chess/assets/a-3.png', trophy: 'gold' },
        { id: 'chess-plat', title: 'Unlock all other Chess Achievements', description: 'Master every aspect of the board.', image: './games/chess/assets/a-plat.png', trophy: 'platinum' }
    ],
    html: `
        <div class="chess-wrap">
            <div class="chess-board-container">
                <div class="chess-board" id="chess-board"></div>
            </div>
            
            <div class="chess-modal" id="chess-modal">
                <h2 id="chess-modal-title"></h2>
                <p id="chess-modal-subtitle"></p>
                <div class="chess-promo-options" id="chess-promo-options"></div>
            </div>
        </div>
        <style>
            .chess-wrap {
                width: 100%;
                height: 100%;
                position: relative;
                background: #f4f4f4;
                font-family: 'Jua', sans-serif;
                user-select: none;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .dark-mode .chess-wrap { background: #1a1a1a; color: #eee; }
            
            .chess-board-container {
                width: 100%;
                aspect-ratio: 1/1;
                background: #888;
                padding: 6px;
                border-radius: 0;
            }

            .chess-board {
                width: 100%;
                aspect-ratio: 1/1;
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                grid-template-rows: repeat(8, 1fr);
            }

            .chess-square {
                width: 100%;
                aspect-ratio: 1/1;
                display: flex; align-items: center; justify-content: center;
                position: relative;
                box-sizing: border-box;
            }
            .chess-square.light { background-color: #FFFFFF; }
            .chess-square.dark { background-color: #F2F4F5; }
            /* Removing dark mode overrides for squares to respect user's specific colors */

            .chess-square img { 
                width: 85%; height: 85%; 
                object-fit: contain; 
                pointer-events: none; 
                z-index: 2; 
                position: relative; 
            }

            .chess-square.cursor::before {
                content: ''; position: absolute; inset: 0;
                box-shadow: inset 0 0 0 3px #404040;
                border-radius: 4px;
                z-index: 10; pointer-events: none;
                animation: pulse-cursor 1.5s infinite;
            }
            @keyframes pulse-cursor {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            .chess-square.selected { background-color: rgba(0, 0, 0, 0.15); }

            .chess-square.valid-move::after {
                content: ''; position: absolute;
                width: 30%; height: 30%;
                background: rgba(0, 0, 0, 0.25); border-radius: 50%;
                z-index: 5;
            }
            .chess-square.valid-move.has-piece::after {
                width: 100%; height: 100%;
                border: 4px solid rgba(0, 0, 0, 0.25);
                background: transparent; box-sizing: border-box;
            }
            .dark-mode .chess-square.valid-move::after { background: rgba(0, 0, 0, 0.4); }
            .dark-mode .chess-square.valid-move.has-piece::after { border-color: rgba(0, 0, 0, 0.4); }

            .chess-modal {
                position: absolute; inset: 0;
                background: rgba(0,0,0,0.85); display: none; flex-direction: column;
                align-items: center; justify-content: center; z-index: 20; color: white;
                text-align: center; padding: 20px; box-sizing: border-box;
            }
            .chess-modal.active { display: flex; }
            .chess-modal h2 { margin: 0; font-size: 32px; }
            .chess-modal p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.8; }
            
            .chess-promo-options { display: flex; gap: 15px; margin-top: 25px; }
            .chess-promo-options div {
                width: 60px; height: 60px;
                background: rgba(255,255,255,0.1);
                border-radius: 12px; border: 3px solid rgba(255,255,255,0.2); 
                padding: 6px;
                display: flex; align-items: center; justify-content: center;
                transition: all 0.2s ease;
            }
            .chess-promo-options div.cursor { 
                border-color: #ff3b3b; 
                background: rgba(255,255,255,0.9); 
                transform: scale(1.1);
                box-shadow: 0 0 15px rgba(255,59,59,0.5);
            }
            .chess-promo-options img { width: 100%; height: 100%; object-fit: contain; }
        </style>
    `,
    init: function() {
        let board =[];
        let cursorRow = 6, cursorCol = 4;
        let selectedSquare = null;
        let currentPlayer = 'white';
        let gameStatus = 'playing'; // playing, gameover, promoting
        let validMovesCache =[];
        let promoCursor = 0;
        let promoSquare = null;
        let moveCount = 0;
        
        const promoPieces = ['queen', 'rook', 'bishop', 'knight'];
        const ASSETS = './games/chess/assets/';

        const boardEl = document.getElementById('chess-board');
        const modal = document.getElementById('chess-modal');
        const modalTitle = document.getElementById('chess-modal-title');
        const modalSubtitle = document.getElementById('chess-modal-subtitle');
        const promoOptions = document.getElementById('chess-promo-options');

        function cloneBoard(b) {
            return b.map(row => row.map(piece => piece ? { ...piece } : null));
        }

        function initGame() {
            board = Array(8).fill(null).map(() => Array(8).fill(null));
            const pieceOrder =['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
            for (let i = 0; i < 8; i++) {
                board[0][i] = { type: pieceOrder[i], color: 'black' };
                board[1][i] = { type: 'pawn', color: 'black', hasMoved: false };
                board[6][i] = { type: 'pawn', color: 'white', hasMoved: false };
                board[7][i] = { type: pieceOrder[i], color: 'white' };
            }
            
            cursorRow = 7; 
            cursorCol = 4;
            selectedSquare = null;
            currentPlayer = 'white';
            gameStatus = 'playing';
            validMovesCache =[];
            
            if (modal) modal.classList.remove('active');
            
            if (window.AchievementService) {
                window.AchievementService.unlock('chess-0');
            }
            
            render();
        }

        function getPseudoLegalMoves(row, col, piece, b = board) {
            const moves =[];
            const addMove = (r, c) => {
                if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                    const target = b[r][c];
                    if (!target || target.color !== piece.color) moves.push({ row: r, col: c });
                }
            };
            const addLine = (dr, dc) => {
                for (let i = 1; i < 8; i++) {
                    const r = row + i * dr;
                    const c = col + i * dc;
                    if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
                    const target = b[r][c];
                    if (target) {
                        if (target.color !== piece.color) addMove(r, c);
                        break;
                    }
                    addMove(r, c);
                }
            };

            switch (piece.type) {
                case 'pawn':
                    const dir = piece.color === 'white' ? -1 : 1;
                    if (!b[row + dir]?.[col]) {
                        moves.push({row: row + dir, col: col});
                        if (!piece.hasMoved && !b[row + 2 * dir]?.[col]) {
                            moves.push({row: row + 2 * dir, col: col});
                        }
                    }
                    [-1, 1].forEach(cd => {
                        if (b[row + dir]?.[col + cd] && b[row + dir][col + cd].color !== piece.color) {
                            moves.push({row: row + dir, col: col + cd});
                        }
                    });
                    break;
                case 'rook':
                    [[0, 1],[0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => addLine(dr, dc));
                    break;
                case 'knight':
                    [[2, 1],[2, -1], [-2, 1],[-2, -1],[1, 2],[1, -2], [-1, 2], [-1, -2]].forEach(([dr, dc]) => addMove(row + dr, col + dc));
                    break;
                case 'bishop':
                    [[1, 1], [1, -1], [-1, 1],[-1, -1]].forEach(([dr, dc]) => addLine(dr, dc));
                    break;
                case 'queen':
                    [[0, 1], [0, -1],[1, 0],[-1, 0],[1, 1], [1, -1],[-1, 1],[-1, -1]].forEach(([dr, dc]) => addLine(dr, dc));
                    break;
                case 'king':
                    [[0, 1], [0, -1],[1, 0],[-1, 0],[1, 1], [1, -1],[-1, 1],[-1, -1]].forEach(([dr, dc]) => addMove(row + dr, col + dc));
                    break;
            }
            return moves;
        }

        function findKing(color, currentBoard) {
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (currentBoard[r][c] && currentBoard[r][c].type === 'king' && currentBoard[r][c].color === color) 
                        return { row: r, col: c };
                }
            }
            return null;
        }

        function isKingInCheck(kingColor, currentBoard) {
            const kingPos = findKing(kingColor, currentBoard);
            if (!kingPos) return false;
            const opponentColor = kingColor === 'white' ? 'black' : 'white';
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const piece = currentBoard[r][c];
                    if (piece && piece.color === opponentColor) {
                        const moves = getPseudoLegalMoves(r, c, piece, currentBoard);
                        if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) return true;
                    }
                }
            }
            return false;
        }

        function getLegalMoves(row, col) {
            const piece = board[row][col];
            if (!piece) return[];
            const pseudoLegalMoves = getPseudoLegalMoves(row, col, piece);
            
            return pseudoLegalMoves.filter(move => {
                const tempBoard = cloneBoard(board);
                tempBoard[move.row][move.col] = tempBoard[row][col];
                tempBoard[row][col] = null;
                return !isKingInCheck(piece.color, tempBoard);
            });
        }

        function getAllLegalMoves(color) {
            let allMoves =[];
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (board[r][c] && board[r][c].color === color) {
                        allMoves.push(...getLegalMoves(r, c));
                    }
                }
            }
            return allMoves;
        }

        function movePiece(from, to) {
            const piece = board[from.row][from.col];
            const captured = board[to.row][to.col];

            board[to.row][to.col] = piece;
            board[from.row][from.col] = null;
            if (piece.type === 'pawn' || piece.type === 'king' || piece.type === 'rook') {
                piece.hasMoved = true;
            }

            moveCount++;
            if (window.AchievementService) {
                window.AchievementService.unlock('chess-1');
                if (captured) window.AchievementService.unlock('chess-3');
            }

            selectedSquare = null;
            validMovesCache =[];
            
            if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
                gameStatus = 'promoting';
                promoSquare = {row: to.row, col: to.col};
                promoCursor = 0;
                renderPromotionModal();
            } else {
                endTurn();
            }
        }

        function endTurn() {
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            const opponent = currentPlayer === 'white' ? 'black' : 'white';
            const hasLegalMoves = getAllLegalMoves(currentPlayer).length > 0;
            const isCheck = isKingInCheck(currentPlayer, board);

            if (isCheck && window.AchievementService) {
                window.AchievementService.unlock('chess-4');
            }

            if (!hasLegalMoves) {
                gameStatus = 'gameover';
                if (window.AchievementService) {
                    if (isCheck) window.AchievementService.unlock('chess-2');
                    else window.AchievementService.unlock('chess-6');
                }
                showModal(
                    isCheck ? `${opponent.charAt(0).toUpperCase() + opponent.slice(1)} Wins!` : 'Stalemate!',
                    'Press A to Restart'
                );
            }
            render();
        }

        function showModal(title, subtitle) {
            modalTitle.textContent = title;
            modalSubtitle.textContent = subtitle;
            promoOptions.style.display = 'none';
            modal.classList.add('active');
        }

        function renderPromotionModal() {
            modalTitle.textContent = 'Promote Pawn';
            modalSubtitle.textContent = 'Select with D-Pad, press A';
            promoOptions.style.display = 'flex';
            modal.classList.add('active');
            renderPromoOptions();
        }

        function renderPromoOptions() {
            promoOptions.innerHTML = '';
            promoPieces.forEach((p, idx) => {
                const wrap = document.createElement('div');
                if (idx === promoCursor) wrap.classList.add('cursor');
                const img = document.createElement('img');
                img.src = `${ASSETS}${p}-${currentPlayer}.png`;
                wrap.appendChild(img);
                promoOptions.appendChild(wrap);
            });
        }

        function selectPromotion() {
            const type = promoPieces[promoCursor];
            board[promoSquare.row][promoSquare.col] = { type, color: currentPlayer };
            modal.classList.remove('active');
            gameStatus = 'playing';
            if (window.AchievementService) window.AchievementService.unlock('chess-5');
            endTurn();
        }

        function render() {
            if (!boardEl) return;
            boardEl.innerHTML = '';
            
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const square = document.createElement('div');
                    square.className = 'chess-square';
                    square.className += (r + c) % 2 === 0 ? ' light' : ' dark';

                    if (r === cursorRow && c === cursorCol) {
                        square.classList.add('cursor');
                    }
                    if (selectedSquare && selectedSquare.row === r && selectedSquare.col === c) {
                        square.classList.add('selected');
                    }
                    
                    const isMoveValid = validMovesCache.some(m => m.row === r && m.col === c);
                    if (isMoveValid) square.classList.add('valid-move');

                    const piece = board[r][c];
                    if (piece) {
                        if (isMoveValid) square.classList.add('has-piece'); 
                        const img = document.createElement('img');
                        img.src = `${ASSETS}${piece.type}-${piece.color}.png`;
                        square.appendChild(img);
                    }
                    
                    boardEl.appendChild(square);
                }
            }
        }

        // --- Core Input Loop ---
        initGame();

        this._input = (e) => {
            const action = e.detail.action;
            
            if (gameStatus === 'playing') {
                if (action === 'up') cursorRow = Math.max(0, cursorRow - 1);
                else if (action === 'down') cursorRow = Math.min(7, cursorRow + 1);
                else if (action === 'left') cursorCol = Math.max(0, cursorCol - 1);
                else if (action === 'right') cursorCol = Math.min(7, cursorCol + 1);
                else if (action === 'a') {
                    const piece = board[cursorRow][cursorCol];
                    if (selectedSquare) {
                        const attemptedMove = validMovesCache.find(m => m.row === cursorRow && m.col === cursorCol);
                        if (attemptedMove) {
                            movePiece(selectedSquare, {row: cursorRow, col: cursorCol});
                        } else if (piece && piece.color === currentPlayer) {
                            selectedSquare = { row: cursorRow, col: cursorCol };
                            validMovesCache = getLegalMoves(cursorRow, cursorCol);
                        } else {
                            selectedSquare = null;
                            validMovesCache =[];
                        }
                    } else {
                        if (piece && piece.color === currentPlayer) {
                            selectedSquare = { row: cursorRow, col: cursorCol };
                            validMovesCache = getLegalMoves(cursorRow, cursorCol);
                        }
                    }
                }
                else if (action === 'b') {
                    selectedSquare = null;
                    validMovesCache = [];
                }
                render();
            } else if (gameStatus === 'promoting') {
                if (action === 'left') {
                    promoCursor = (promoCursor === 0) ? promoPieces.length - 1 : promoCursor - 1;
                    renderPromoOptions();
                } else if (action === 'right') {
                    promoCursor = (promoCursor === promoPieces.length - 1) ? 0 : promoCursor + 1;
                    renderPromoOptions();
                } else if (action === 'a') {
                    selectPromotion();
                }
            } else if (gameStatus === 'gameover') {
                if (action === 'a') {
                    initGame();
                }
            }
        };

        let lastJoyX = 0, lastJoyY = 0;
        this._joystick = (e) => {
            if (gameStatus !== 'playing') return;
            const { x, y } = e.detail;
            const threshold = 0.5;
            
            if (x > threshold && lastJoyX <= threshold) cursorCol = Math.min(7, cursorCol + 1);
            else if (x < -threshold && lastJoyX >= -threshold) cursorCol = Math.max(0, cursorCol - 1);
            
            if (y > threshold && lastJoyY <= threshold) cursorRow = Math.min(7, cursorRow + 1);
            else if (y < -threshold && lastJoyY >= -threshold) cursorRow = Math.max(0, cursorRow - 1);
            
            lastJoyX = x;
            lastJoyY = y;
            render();
        };

        window.addEventListener('appInput', this._input);
        window.addEventListener('joystickInput', this._joystick);
    },
    cleanup: function() {
        window.removeEventListener('appInput', this._input);
        window.removeEventListener('joystickInput', this._joystick);
    }
});