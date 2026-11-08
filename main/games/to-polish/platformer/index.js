(function() {
    window.apps.push({
        id: 'platformer',
        name: 'Sky Jumper',
        description: 'A simple platforming test. Use the joystick to move left/right and the A button to jump. Collect the gold stars!',
        thumbnail: './games/to-polish/platformer/assets/platformer.png',
        color: '#3498db',
        icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M5,15H9V19H5V15M11,11H15V15H11V11M17,7H21V11H17V7M3,19V21H21V19H3Z"/>
        </svg>`,
        inputs: {
            left: { type: 'joystick', options: { autoReturn: true } },
            right: 'buttons'
        },
        keyMap: {
            'w': { type: 'joystick', side: 'left', y: -1 },
            's': { type: 'joystick', side: 'left', y: 1 },
            'a': { type: 'joystick', side: 'left', x: -1 },
            'd': { type: 'joystick', side: 'left', x: 1 },
            'k': 'a'
        },
        html: `
            <div class="plat-wrap">
                <canvas id="plat-canvas"></canvas>
                <div class="plat-ui">
                    <div id="plat-score">Stars: 0</div>
                </div>
            </div>
            <style>
                .plat-wrap {
                    width: 100%; height: 100%;
                    background: linear-gradient(to bottom, #87CEEB, #E0F6FF);
                    position: relative; overflow: hidden;
                }
                #plat-canvas { width: 100%; height: 100%; display: block; }
                .plat-ui {
                    position: absolute; top: 15px; left: 15px;
                    color: #2c3e50; font-family: 'Jua', sans-serif;
                    font-size: 20px; font-weight: bold;
                    pointer-events: none;
                }
            </style>
        `,
        init: function() {
            const canvas = document.getElementById('plat-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const scoreEl = document.getElementById('plat-score');

            let width, height;
            let player, platforms, stars;
            
            const initWorld = () => {
                width = canvas.width = canvas.clientWidth;
                height = canvas.height = canvas.clientHeight;

                player = {
                    x: width * 0.1, y: height - 100,
                    vx: 0, vy: 0,
                    w: width * 0.08, h: width * 0.08, // Scaled player
                    color: '#e67e22',
                    onGround: false,
                    moveX: 0
                };

                // Responsive platforms using percentages
                platforms = [
                    { x: 0, y: height - 40, w: width, h: 40 },
                    { x: width * 0.2, y: height * 0.75, w: width * 0.3, h: 15 },
                    { x: width * 0.6, y: height * 0.6, w: width * 0.3, h: 15 },
                    { x: width * 0.1, y: height * 0.45, w: width * 0.3, h: 15 },
                    { x: width * 0.5, y: height * 0.3, w: width * 0.3, h: 15 }
                ];

                stars = [
                    { x: width * 0.35, y: height * 0.65, r: 8, active: true },
                    { x: width * 0.75, y: height * 0.5, r: 8, active: true },
                    { x: width * 0.25, y: height * 0.35, r: 8, active: true },
                    { x: width * 0.65, y: height * 0.2, r: 8, active: true }
                ];
            };

            window.addEventListener('resize', initWorld);
            initWorld();

            let score = 0;
            const gravity = 0.5;
            const friction = 0.85;
            const jumpPower = -12;

            let animationFrame;

            const syncUI = (nx, ny) => {
                document.querySelectorAll('.joystick-handle').forEach(handle => {
                    const visualRange = 28;
                    handle.style.left = (50 + (nx * visualRange)) + '%';
                    handle.style.top = (50 + (ny * visualRange)) + '%';
                });
            };

            const update = () => {
                // Apply Joystick horizontal movement
                player.vx += player.moveX * 1.5;
                player.vx *= friction;
                
                player.vy += gravity;
                player.x += player.vx;
                player.y += player.vy;

                // Ground/Platform Collisions
                player.onGround = false;
                platforms.forEach(p => {
                    if (player.x < p.x + p.w && player.x + player.w > p.x &&
                        player.y + player.h > p.y && player.y + player.h < p.y + p.h + player.vy) {
                        player.y = p.y - player.h;
                        player.vy = 0;
                        player.onGround = true;
                    }
                });

                // Boundary Collisions
                if (player.x < 0) player.x = 0;
                if (player.x + player.w > width) player.x = width - player.w;
                if (player.y > height) { 
                    player.x = width * 0.1;
                    player.y = height - 100;
                    player.vy = 0;
                }

                // Star Collection
                stars.forEach(s => {
                    if (s.active) {
                        const dx = (player.x + player.w/2) - s.x;
                        const dy = (player.y + player.h/2) - s.y;
                        if (Math.sqrt(dx*dx + dy*dy) < player.w/2 + s.r) {
                            s.active = false;
                            score++;
                            if (scoreEl) scoreEl.textContent = `Stars: ${score}`;
                            if (window.sfxEnabled) window.playSfx('assets/achivement.mp3', 0.3);
                        }
                    }
                });

                draw();
                animationFrame = requestAnimationFrame(update);
            };

            const draw = () => {
                ctx.clearRect(0, 0, width, height);

                // Platforms
                ctx.fillStyle = '#2c3e50';
                platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

                // Stars
                ctx.fillStyle = '#f1c40f';
                stars.forEach(s => {
                    if (s.active) {
                        ctx.beginPath();
                        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });

                // Player
                ctx.fillStyle = player.color;
                ctx.fillRect(player.x, player.y, player.w, player.h);
                ctx.fillStyle = 'white';
                const eyeOffset = player.vx >= 0 ? player.w * 0.6 : player.w * 0.1;
                ctx.fillRect(player.x + eyeOffset, player.y + player.h * 0.2, player.w * 0.2, player.h * 0.2);
            };

            this._onJoystick = (e) => {
                player.moveX = e.detail.x;
                syncUI(e.detail.x, e.detail.y);
            };

            this._onInput = (e) => {
                if (e.detail.action === 'a' && player.onGround) {
                    player.vy = jumpPower;
                }
            };

            window.addEventListener('joystickInput', this._onJoystick);
            window.addEventListener('appInput', this._onInput);
            
            animationFrame = requestAnimationFrame(update);

            this._cleanup = () => {
                window.removeEventListener('joystickInput', this._onJoystick);
                window.removeEventListener('appInput', this._onInput);
                window.removeEventListener('resize', initWorld);
                cancelAnimationFrame(animationFrame);
            };
        },
        cleanup: function() {
            if (this._cleanup) this._cleanup();
        }
    });
})();
