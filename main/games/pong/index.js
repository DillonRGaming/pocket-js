window.apps.push({
    id: 'pong',
    name: 'Pong',
    inputs: { left: 'buttons', right: 'dpad' },
    keyMap: {
        'w': 'up',
        's': 'down',
        'ArrowUp': 'up',
        'ArrowDown': 'down'
    },
    description: 'The classic table tennis simulation. Face off against a sharp AI in a battle of reflexes and precision. First to 7 points wins!',
    thumbnail: './games/pong/assets/pong.png',
    wideThumbnail: './games/pong/assets/w-pong.png',
    color: '#1a1a2e',
    achievements: [
        { id: 'pong-1', title: 'First Win', description: 'Defeat the AI in a standard match.', difficulty: 'easy', image: './games/pong/assets/a-1.png', trophy: 'bronze' },
        { id: 'pong-2', title: 'Pro Player', description: 'Reach a total of 50 points across all games.', difficulty: 'medium', image: './games/pong/assets/a-2.png', locked: true, trophy: 'silver' },
        { id: 'pong-3', title: 'Speed Demon', description: 'Successfully hit the ball when it reaches maximum velocity.', difficulty: 'hard', image: './games/pong/assets/a-3.png', locked: true, trophy: 'gold' },
        { id: 'pong-4', title: 'Perfect Game', description: 'Win a match with a clean sheet (7-0).', difficulty: 'hard', image: './games/pong/assets/a-4.png', locked: true, trophy: 'gold' },
        { id: 'pong-plat', title: 'Pong Master', description: 'Unlock all other Pong achievements.', image: './games/pong/assets/a-plat.png', trophy: 'platinum' }
        ],
    icon: `<svg class="gear-icon" viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="16" width="6" height="32" rx="3"/>
        <rect x="50" y="16" width="6" height="32" rx="3"/>
        <circle cx="32" cy="32" r="5"/>
    </svg>`,
    html: `
        <div class="pong-wrap">
            <canvas id="pong-canvas"></canvas>
        </div>
        <style>
            .pong-wrap {
                width: 100%;
                height: 100%;
                position: relative;
                background: #000;
                overflow: hidden;
            }
            #pong-canvas {
                width: 100%;
                height: 100%;
                display: block;
            }
        </style>
    `,
    init: function() {
        const canvas = document.getElementById('pong-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function resize() {
            const wrap = canvas.parentElement;
            canvas.width = wrap.offsetWidth * window.devicePixelRatio;
            canvas.height = wrap.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            // Internal logic will use CSS pixels
            canvas.style.width = wrap.offsetWidth + 'px';
            canvas.style.height = wrap.offsetHeight + 'px';
        }
        resize();

        const getW = () => canvas.width / window.devicePixelRatio;
        const getH = () => canvas.height / window.devicePixelRatio;

        const P_WIDTH = 10;
        const P_HEIGHT = 60;
        const BALL_SIZE = 8;
        const WIN_SCORE = 7;

        let state = 'menu';
        let p1Y, p2Y;
        let ballX, ballY, ballDX, ballDY;
        let p1Score = 0, p2Score = 0;
        let upHeld = false, downHeld = false;
        let trail = [];
        let lastHit = 0;
        const hitSound = new Audio('./games/pong/assets/hit.mp3');

        function playHit() {
            if (window.sfxEnabled) {
                const volRandom = 0.85 + Math.random() * 0.15;
                const pitchRandom = 0.92 + Math.random() * 0.16;
                hitSound.volume = Math.min(1, (window.masterVolume || 1.0) * volRandom);
                hitSound.playbackRate = pitchRandom;
                hitSound.currentTime = 0;
                hitSound.play().catch(() => {});
            }
        }

        function resetBall(dir = 1) {
            ballX = getW() / 2;
            ballY = getH() / 2;
            trail = [];
            const speed = 4.5;
            const angle = (Math.random() * 0.6 - 0.3);
            ballDX = dir * speed * Math.cos(angle);
            ballDY = speed * Math.sin(angle);
        }

        function startGame() {
            p1Score = 0; p2Score = 0;
            p1Y = getH() / 2; p2Y = getH() / 2;
            resetBall(Math.random() > 0.5 ? 1 : -1);
            state = 'playing';
        }

        function update() {
            if (state !== 'playing') return;

            const h = getH();
            const w = getW();
            const speed = 5;

            if (upHeld) p1Y -= speed;
            if (downHeld) p1Y += speed;
            p1Y = Math.max(P_HEIGHT/2, Math.min(h - P_HEIGHT/2, p1Y));

            // AI
            const aiSpeed = 3.8;
            const targetY = ballY;
            if (Math.abs(targetY - p2Y) > aiSpeed) {
                p2Y += (targetY > p2Y ? 1 : -1) * aiSpeed;
            }
            p2Y = Math.max(P_HEIGHT/2, Math.min(h - P_HEIGHT/2, p2Y));

            // Trail
            trail.push({ x: ballX, y: ballY });
            if (trail.length > 10) trail.shift();

            ballX += ballDX;
            ballY += ballDY;

            // Walls
            if (ballY < 0 || ballY > h) {
                ballDY = -ballDY;
                ballY = ballY < 0 ? 0 : h;
                playHit();
            }

            // Paddles
            const margin = 20;
            if (ballDX < 0 && ballX < margin + P_WIDTH && ballY > p1Y - P_HEIGHT/2 && ballY < p1Y + P_HEIGHT/2) {
                if (Math.abs(ballDX) > 10 && window.AchievementService) {
                    window.AchievementService.unlock('pong-3');
                }
                ballDX = -ballDX * 1.05;
                ballDY += (ballY - p1Y) * 0.15;
                ballX = margin + P_WIDTH;
                playHit();
            }
            if (ballDX > 0 && ballX > w - margin - P_WIDTH && ballY > p2Y - P_HEIGHT/2 && ballY < p2Y + P_HEIGHT/2) {
                ballDX = -ballDX * 1.05;
                ballDY += (ballY - p2Y) * 0.15;
                ballX = w - margin - P_WIDTH;
                playHit();
            }

            // Scoring
            if (ballX < 0) {
                p2Score++;
                if (p2Score >= WIN_SCORE) state = 'gameover';
                else resetBall(1);
            }
            if (ballX > w) {
                p1Score++;
                // Track total points for achievement
                let totalPoints = parseInt(window.PocketDB.getItem('pong_total_points') || 0) + 1;
                window.PocketDB.setItem('pong_total_points', totalPoints);
                if (window.AchievementService && totalPoints >= 50) {
                    window.AchievementService.unlock('pong-2');
                }

                if (p1Score >= WIN_SCORE) {
                    state = 'gameover';
                    if (window.AchievementService) {
                        window.AchievementService.unlock('pong-1');
                        if (p2Score === 0) window.AchievementService.unlock('pong-4');
                    }
                }
                else resetBall(-1);
            }
        }

        function draw() {
            const w = getW();
            const h = getH();
            ctx.clearRect(0, 0, w, h);

            // Field
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(w/2, 0);
            ctx.lineTo(w/2, h);
            ctx.stroke();
            ctx.setLineDash([]);

            if (state === 'playing' || state === 'gameover' || state === 'paused') {
                // Paddles
                ctx.fillStyle = '#fff';
                const margin = 20;
                ctx.fillRect(margin, p1Y - P_HEIGHT/2, P_WIDTH, P_HEIGHT);
                ctx.fillRect(w - margin - P_WIDTH, p2Y - P_HEIGHT/2, P_WIDTH, P_HEIGHT);

                // Ball Trail
                trail.forEach((t, i) => {
                    ctx.globalAlpha = i / trail.length * 0.4;
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, BALL_SIZE/2 * (i/trail.length), 0, Math.PI*2);
                    ctx.fill();
                });
                ctx.globalAlpha = 1;

                // Ball
                ctx.beginPath();
                ctx.arc(ballX, ballY, BALL_SIZE/2, 0, Math.PI*2);
                ctx.fill();

                // Score
                ctx.font = 'bold 32px Jua';
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.textAlign = 'center';
                ctx.fillText(p1Score, w * 0.25, 40);
                ctx.fillText(p2Score, w * 0.75, 40);
            }

            if (state === 'menu') {
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.font = 'bold 48px Jua';
                ctx.fillText('PONG', w/2, h/2 - 20);
                ctx.font = '16px Jua';
                ctx.globalAlpha = (Math.sin(Date.now() / 200) + 1) / 2;
                ctx.fillText('Press A to Start', w/2, h/2 + 40);
                ctx.globalAlpha = 1;
            }

            if (state === 'gameover') {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(0,0,w,h);
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.font = 'bold 36px Jua';
                ctx.fillText(p1Score >= WIN_SCORE ? 'VICTORY' : 'DEFEAT', w/2, h/2 - 10);
                ctx.font = '16px Jua';
                ctx.fillText('Press A to Play Again', w/2, h/2 + 30);
                ctx.fillText('Press B to Quit', w/2, h/2 + 55);
            }

        }


        const self = this;
        function loop() {
            update();
            draw();
            self._frame = requestAnimationFrame(loop);
        }
        this._frame = requestAnimationFrame(loop);

        this._input = (e) => {
            const action = e.detail.action;
            if (state === 'menu' && action === 'a') startGame();
            if (state === 'gameover' && action === 'a') startGame();
        };
        window.addEventListener('appInput', this._input);

        this._held = (e) => {
            if (e.detail.direction === 'up') upHeld = true;
            if (e.detail.direction === 'down') downHeld = true;
        };
        this._release = (e) => {
            if (e.detail.direction === 'up') upHeld = false;
            if (e.detail.direction === 'down') downHeld = false;
        };
        window.addEventListener('dpadHeld', this._held);
        window.addEventListener('dpadRelease', this._release);
        
        this._keys = (e) => {
            if (e.key === 'w' || e.key === 'ArrowUp') upHeld = e.type === 'keydown';
            if (e.key === 's' || e.key === 'ArrowDown') downHeld = e.type === 'keydown';
        };
        document.addEventListener('keydown', this._keys);
        document.addEventListener('keyup', this._keys);
    },
    cleanup: function() {
        cancelAnimationFrame(this._frame);
        window.removeEventListener('appInput', this._input);
        window.removeEventListener('dpadHeld', this._held);
        window.removeEventListener('dpadRelease', this._release);
        document.removeEventListener('keydown', this._keys);
        document.removeEventListener('keyup', this._keys);
    }
});

