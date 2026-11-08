window.apps.push({
    id: 'lockpick',
    name: 'Locksmith',
    description: 'A cozy lockpicking game. Select your tool with the shoulder buttons, use the joystick to navigate, and press X to try and set each pin. Feel the lock!',
    thumbnail: './games/to-polish/lockpick/assets/thumb.png',
    color: '#2d3748',
    icon: `<svg viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 4C24.268 4 18 10.268 18 18v6H12a4 4 0 00-4 4v28a4 4 0 004 4h40a4 4 0 004-4V28a4 4 0 00-4-4H46v-6c0-7.732-6.268-14-14-14zm0 6a8 8 0 018 8v6H24v-6a8 8 0 018-8zm0 22a6 6 0 110 12 6 6 0 010-12z"/>
    </svg>`,
    inputs: {
        left: { type: 'joystick', options: { autoReturn: true } },
        right: 'quad_buttons'
    },
    keyMap: {
        'a': { type: 'joystick', side: 'left', x: -1 },
        'd': { type: 'joystick', side: 'left', x: 1 },
        'w': { type: 'joystick', side: 'left', y: -1 },
        's': { type: 'joystick', side: 'left', y: 1 },
        'x': 'x',
        'z': 'b',
        'ArrowLeft': { type: 'joystick', side: 'left', x: -1 },
        'ArrowRight': { type: 'joystick', side: 'left', x: 1 },
    },
    achievements: [
        { id: 'lp-1', title: 'First Click', description: 'Successfully pick your first lock.', difficulty: 'easy', trophy: 'bronze' },
        { id: 'lp-2', title: 'Smooth Criminal', description: 'Pick a lock without a single false set.', difficulty: 'medium', trophy: 'silver' },
        { id: 'lp-3', title: 'Master Locksmith', description: 'Pick 10 locks in a row.', difficulty: 'hard', trophy: 'gold' },
        { id: 'lp-plat', title: 'The Skeleton Key', description: 'Unlock all Locksmith achievements.', trophy: 'platinum' }
    ],
    html: `
    <div id="lp-root">
        <canvas id="lp-canvas"></canvas>
        <div id="lp-ui">
            <div id="lp-tool-indicator">
                <div class="lp-tool-btn" id="lp-tool-tension">
                    <svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
                        <rect x="16" y="0" width="8" height="65" rx="4" fill="currentColor"/>
                        <rect x="4" y="55" width="32" height="12" rx="6" fill="currentColor"/>
                    </svg>
                    <span>Tension</span>
                </div>
                <div class="lp-tool-btn" id="lp-tool-pick">
                    <svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="16" width="60" height="8" rx="4" fill="currentColor"/>
                        <path d="M55 20 Q68 8 76 20 Q68 32 55 20Z" fill="currentColor"/>
                    </svg>
                    <span>Pick</span>
                </div>
            </div>
            <div id="lp-hint"></div>
            <div id="lp-progress-wrap">
                <div id="lp-streak-label"></div>
            </div>
        </div>
    </div>
    <style>
        #lp-root {
            width: 100%;
            height: 100%;
            position: relative;
            background: #1a1a2a;
            overflow: hidden;
            font-family: 'Jua', sans-serif;
        }
        #lp-canvas {
            width: 100%;
            height: 100%;
            display: block;
        }
        #lp-ui {
            position: absolute;
            inset: 0;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        #lp-tool-indicator {
            display: flex;
            gap: 12px;
            padding: 10px 18px;
            background: rgba(0,0,0,0.45);
            border-radius: 0 0 20px 20px;
            align-items: center;
        }
        .lp-tool-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            color: rgba(255,255,255,0.3);
            transition: color 0.25s, transform 0.25s;
            font-size: 11px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .lp-tool-btn svg {
            width: 36px;
            height: 24px;
        }
        .lp-tool-btn.active {
            color: #f6c860;
            transform: scale(1.15);
        }
        #lp-hint {
            margin-top: auto;
            margin-bottom: 18px;
            font-size: 13px;
            color: rgba(255,255,255,0.45);
            letter-spacing: 0.5px;
            background: rgba(0,0,0,0.3);
            padding: 6px 16px;
            border-radius: 20px;
            transition: opacity 0.4s;
        }
        #lp-streak-label {
            position: absolute;
            top: 12px;
            right: 14px;
            font-size: 13px;
            color: rgba(255,255,255,0.45);
        }
        #lp-progress-wrap {
            position: absolute;
            inset: 0;
            pointer-events: none;
        }
    </style>
    `,
    init: function () {
        const canvas = document.getElementById('lp-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const hintEl = document.getElementById('lp-hint');
        const tensionBtn = document.getElementById('lp-tool-tension');
        const pickBtn = document.getElementById('lp-tool-pick');
        const streakLabel = document.getElementById('lp-streak-label');

        // ── State ────────────────────────────────────────────────────
        let W, H;
        let state = 'menu';  // menu | playing | success | fail
        let currentTool = 'pick'; // 'tension' | 'pick'
        let pickX = 0;      // normalised -1..1 from joystick
        let joyVelX = 0;
        let falseSetCount = 0;
        let streak = parseInt(window.PocketDB.getItem('lp_streak') || 0);
        let totalLocks = parseInt(window.PocketDB.getItem('lp_total') || 0);
        let shakeTimer = 0;
        let shakeIntensity = 0;
        let flashTimer = 0;
        let flashColor = '';
        let successTimer = 0;
        let menuPulse = 0;
        let particles = [];
        let bgParticles = [];
        let tension = 0;  // 0..1 how much wrench is rotated
        let tensionDir = 0; // -1, 0, 1
        let hintTimer = 0;
        let lastHint = '';

        // ── Pin system ───────────────────────────────────────────────
        const NUM_PINS = 5;
        let pins = [];   // { height, set, binding, lift, bounce }
        let bindingPin = -1;

        function generateLock() {
            pins = [];
            falseSetCount = 0;
            tension = 0;
            pickX = 0;
            joyVelX = 0;
            currentTool = 'pick';
            updateToolUI();

            // Randomly determine binding order (which pin will bind first given tension)
            const order = Array.from({ length: NUM_PINS }, (_, i) => i);
            // Shuffle to get binding priority
            for (let i = order.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [order[i], order[j]] = [order[j], order[i]];
            }

            for (let i = 0; i < NUM_PINS; i++) {
                pins.push({
                    height: 0.3 + Math.random() * 0.55,  // target shear height, normalised
                    set: false,
                    binding: false,
                    lift: 0,        // current lift 0..1
                    targetLift: 0,
                    bounce: 0,
                    bindOrder: order.indexOf(i),  // lower = binds sooner
                    wobble: 0,
                });
            }
            bindingPin = -1;
            updateBindingPin();
        }

        function updateBindingPin() {
            // The current binding pin is the unseated pin with lowest bindOrder
            let lowest = Infinity;
            bindingPin = -1;
            for (let i = 0; i < pins.length; i++) {
                if (!pins[i].set && pins[i].bindOrder < lowest) {
                    lowest = pins[i].bindOrder;
                    bindingPin = i;
                }
            }
            // Mark binding on each pin object
            for (let i = 0; i < pins.length; i++) {
                pins[i].binding = (i === bindingPin);
            }
        }

        function resize() {
            const wrap = canvas.parentElement;
            W = wrap.offsetWidth;
            H = wrap.offsetHeight;
            canvas.width = W * devicePixelRatio;
            canvas.height = H * devicePixelRatio;
            canvas.style.width = W + 'px';
            canvas.style.height = H + 'px';
            ctx.scale(devicePixelRatio, devicePixelRatio);
            spawnBgParticles();
        }

        function spawnBgParticles() {
            bgParticles = [];
            for (let i = 0; i < 28; i++) {
                bgParticles.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    r: 1 + Math.random() * 2.5,
                    alpha: 0.04 + Math.random() * 0.12,
                    speed: 0.1 + Math.random() * 0.25,
                    drift: (Math.random() - 0.5) * 0.3,
                });
            }
        }

        // ── Toolpick cursor position in lock space  ──────────────────
        // Lock drawn centred; pins are arranged horizontally
        function getLockDims() {
            const lockW = Math.min(W * 0.72, 340);
            const lockH = Math.min(H * 0.6, 260);
            const lockX = (W - lockW) / 2;
            const lockY = (H - lockH) / 2 - H * 0.04;
            return { lockW, lockH, lockX, lockY };
        }

        function getPinX(i) {
            const { lockW, lockX } = getLockDims();
            const spacing = lockW / (NUM_PINS + 1);
            return lockX + spacing * (i + 1);
        }

        function getPickCursorX() {
            const { lockW, lockX } = getLockDims();
            return lockX + (pickX * 0.5 + 0.5) * lockW;
        }

        // ── Update ───────────────────────────────────────────────────
        function update(dt) {
            menuPulse += dt * 0.002;

            // Bg particles float upward
            bgParticles.forEach(p => {
                p.y -= p.speed;
                p.x += p.drift;
                if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
            });

            // Particles
            particles = particles.filter(p => p.life > 0);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.12;
                p.life -= dt * 0.003;
                p.r *= 0.97;
            });

            if (shakeTimer > 0) shakeTimer -= dt;
            if (flashTimer > 0) flashTimer -= dt;
            if (hintTimer > 0) hintTimer -= dt;

            if (state !== 'playing') {
                if (state === 'success') successTimer -= dt;
                return;
            }

            // Smooth pick X from joystick input
            pickX += joyVelX * dt * 0.006;
            pickX = Math.max(-1, Math.min(1, pickX));

            // Pins physics
            const cursorX = getPickCursorX();
            pins.forEach((pin, i) => {
                const px = getPinX(i);
                const dist = Math.abs(cursorX - px);
                const { lockW } = getLockDims();
                const spacing = lockW / (NUM_PINS + 1);
                const influence = Math.max(0, 1 - dist / (spacing * 0.7));

                if (!pin.set) {
                    // Lift pin based on proximity AND if pick tool is active
                    if (currentTool === 'pick') {
                        pin.targetLift = influence * 0.85;
                    } else {
                        pin.targetLift = pin.targetLift * 0.95; // slowly drop
                    }

                    // Smooth lift
                    pin.lift += (pin.targetLift - pin.lift) * 0.18;

                    // Wobble
                    pin.wobble *= 0.88;
                } else {
                    // Set pins stay up
                    pin.lift += (1.0 - pin.lift) * 0.1;
                    pin.wobble *= 0.9;
                }

                pin.bounce *= 0.85;
            });

            // Tension bar – if tool is tension, tension builds
            if (currentTool === 'tension') {
                // Visual tension indicator builds slowly
                tension = Math.min(1, tension + dt * 0.0004);
            }
        }

        // ── Try to pick (X button pressed) ──────────────────────────
        function tryPick() {
            if (state !== 'playing') return;
            if (currentTool !== 'pick') {
                showHint('Switch to pick tool to pick pins!');
                return;
            }

            const cursorX = getPickCursorX();
            const { lockW } = getLockDims();
            const spacing = lockW / (NUM_PINS + 1);

            // Find the pin we're closest to
            let closestPin = -1;
            let closestDist = Infinity;
            for (let i = 0; i < pins.length; i++) {
                if (pins[i].set) continue;
                const dist = Math.abs(cursorX - getPinX(i));
                if (dist < closestDist) {
                    closestDist = dist;
                    closestPin = i;
                }
            }

            if (closestPin === -1) return; // all set

            const pin = pins[closestPin];
            const isBinding = closestPin === bindingPin;

            // The pin must be near the shear line (lift ≈ height)
            const liftDiff = Math.abs(pin.lift - pin.height);
            const tolerance = 0.14 + (isBinding ? 0.04 : 0); // binding pin easier to find

            // Must be close to pin spatially
            if (closestDist > spacing * 0.65) {
                showHint('Move the pick closer to a pin.');
                doShake(2, 80);
                return;
            }

            if (isBinding && liftDiff < tolerance) {
                // SUCCESS - pin sets!
                pin.set = true;
                pin.lift = 1.0;
                pin.wobble = 8;
                spawnParticles(getPinX(closestPin), getShearY(), '#f6c860', 12);
                playClick(true);
                updateBindingPin();

                // Check if all set
                if (pins.every(p => p.set)) {
                    triggerSuccess();
                } else {
                    showHint(getSuccessHint());
                }
            } else if (!isBinding && liftDiff < tolerance) {
                // False set - pin pushes up but springs back
                pin.wobble = 18;
                pin.targetLift = 0.4;
                falseSetCount++;
                doShake(3, 150);
                playClick(false);
                showHint('That pin isn\'t binding yet...');
            } else {
                // Wrong height
                pin.wobble = 10;
                doShake(2, 100);
                playClick(false);
                if (isBinding) {
                    if (pin.lift < pin.height) showHint('Lift a bit more...');
                    else showHint('Too high — ease off a little.');
                } else {
                    showHint('Find the binding pin first.');
                }
            }
        }

        function triggerSuccess() {
            state = 'success';
            successTimer = 2800;
            totalLocks++;
            if (falseSetCount === 0) {
                if (window.AchievementService) window.AchievementService.unlock('lp-2');
            }
            streak++;
            window.PocketDB.setItem('lp_streak', streak);
            window.PocketDB.setItem('lp_total', totalLocks);
            if (totalLocks >= 1 && window.AchievementService) window.AchievementService.unlock('lp-1');
            if (streak >= 10 && window.AchievementService) window.AchievementService.unlock('lp-3');
            updateStreakLabel();
            spawnParticles(W / 2, H / 2, '#f6c860', 50);
            spawnParticles(W / 2, H / 2, '#a8edea', 30);
            flashTimer = 400;
            flashColor = 'rgba(246,200,96,0.18)';
            showHint('✨ Lock picked!');
            setTimeout(() => {
                generateLock();
                state = 'playing';
            }, 2800);
        }

        function doShake(intensity, duration) {
            shakeIntensity = intensity;
            shakeTimer = duration;
        }

        function playClick(success) {
            if (!window.sfxEnabled) return;
            const vol = (window.masterVolume || 1) * 0.7;
            // Use existing sfx player
            if (success) {
                window.playSfx && window.playSfx('assets/achivement.mp3', vol * 0.35);
            } else {
                window.playSfx && window.playSfx('assets/notification.mp3', vol * 0.2);
            }
        }

        function spawnParticles(x, y, color, count) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.5 + Math.random() * 4;
                particles.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 2,
                    r: 2 + Math.random() * 4,
                    color,
                    life: 0.7 + Math.random() * 0.5,
                });
            }
        }

        function showHint(msg) {
            if (hintEl) hintEl.textContent = msg;
            hintTimer = 2500;
            lastHint = msg;
        }

        function getSuccessHint() {
            const remaining = pins.filter(p => !p.set).length;
            if (remaining === 0) return '✨ Lock picked!';
            return `${remaining} pin${remaining > 1 ? 's' : ''} left — find the binding pin!`;
        }

        function updateToolUI() {
            tensionBtn && tensionBtn.classList.toggle('active', currentTool === 'tension');
            pickBtn && pickBtn.classList.toggle('active', currentTool === 'pick');
        }

        function updateStreakLabel() {
            if (streakLabel) streakLabel.textContent = streak > 0 ? `🔓 Streak: ${streak}` : '';
        }

        // ── Shear line Y ────────────────────────────────────────────
        function getShearY() {
            const { lockH, lockY } = getLockDims();
            return lockY + lockH * 0.42;
        }

        // ── Draw ─────────────────────────────────────────────────────
        function draw() {
            ctx.clearRect(0, 0, W, H);

            // Shake offset
            let ox = 0, oy = 0;
            if (shakeTimer > 0) {
                ox = (Math.random() - 0.5) * shakeIntensity;
                oy = (Math.random() - 0.5) * shakeIntensity;
            }

            // Background gradient
            const bg = ctx.createLinearGradient(0, 0, 0, H);
            bg.addColorStop(0, '#0f0f1a');
            bg.addColorStop(1, '#1a1a2e');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            // Background floating particles
            bgParticles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(246,200,96,${p.alpha})`;
                ctx.fill();
            });

            // Flash overlay
            if (flashTimer > 0) {
                ctx.fillStyle = flashColor;
                ctx.fillRect(0, 0, W, H);
            }

            ctx.save();
            ctx.translate(ox, oy);

            if (state === 'menu') {
                drawMenu();
            } else {
                drawLock();
                drawPick();
                drawTensionWrench();
            }

            // Foreground particles
            particles.forEach(p => {
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            ctx.restore();

            if (state === 'menu') drawMenuUI();
        }

        function drawMenu() {
            // Decorative lock illustration at center
            const cx = W / 2, cy = H / 2 - H * 0.06;
            const glow = (Math.sin(menuPulse) + 1) / 2;
            ctx.save();

            // Glow ring
            const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 90);
            grad.addColorStop(0, `rgba(246,200,96,${0.12 + glow * 0.1})`);
            grad.addColorStop(1, 'rgba(246,200,96,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, 90, 0, Math.PI * 2);
            ctx.fill();

            // Lock body
            ctx.fillStyle = '#2d3748';
            ctx.strokeStyle = '#4a5568';
            ctx.lineWidth = 2;
            const bw = 60, bh = 48;
            roundRect(ctx, cx - bw / 2, cy, bw, bh, 10);
            ctx.fill();
            ctx.stroke();

            // Lock shackle
            ctx.strokeStyle = '#718096';
            ctx.lineWidth = 7;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(cx, cy, 22, Math.PI, 0, false);
            ctx.stroke();

            // Keyhole
            ctx.fillStyle = '#f6c860';
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(cx, cy + 18, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(cx - 3, cy + 18, 6, 14);
            ctx.globalAlpha = 1;

            ctx.restore();
        }

        function drawMenuUI() {
            const cx = W / 2;
            ctx.textAlign = 'center';

            ctx.fillStyle = '#f6c860';
            ctx.font = `bold ${Math.min(32, W * 0.08)}px Jua`;
            ctx.fillText('Locksmith', cx, H / 2 + H * 0.28);

            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = `${Math.min(14, W * 0.038)}px Jua`;
            const pulse = (Math.sin(menuPulse * 2.5) + 1) / 2;
            ctx.globalAlpha = 0.4 + pulse * 0.6;
            ctx.fillText('Press X to Start', cx, H / 2 + H * 0.36);
            ctx.globalAlpha = 1;
        }

        function drawLock() {
            const { lockW, lockH, lockX, lockY } = getLockDims();
            const shearY = getShearY();

            // Lock housing shadow
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 24;

            // Lock body
            const bodyGrad = ctx.createLinearGradient(lockX, lockY, lockX + lockW, lockY + lockH);
            bodyGrad.addColorStop(0, '#2d3748');
            bodyGrad.addColorStop(1, '#1a202c');
            ctx.fillStyle = bodyGrad;
            roundRect(ctx, lockX, lockY, lockW, lockH, 18);
            ctx.fill();

            ctx.shadowBlur = 0;

            // Lock body border
            ctx.strokeStyle = '#4a5568';
            ctx.lineWidth = 2;
            roundRect(ctx, lockX, lockY, lockW, lockH, 18);
            ctx.stroke();

            // Shear line
            ctx.strokeStyle = 'rgba(246,200,96,0.35)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 5]);
            ctx.beginPath();
            ctx.moveTo(lockX + 8, shearY);
            ctx.lineTo(lockX + lockW - 8, shearY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Label
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.font = `bold ${Math.min(11, lockW * 0.04)}px Jua`;
            ctx.textAlign = 'center';
            ctx.fillText('SHEAR LINE', lockX + lockW / 2, shearY - 6);

            // Draw pins
            const pinW = Math.min(22, lockW * 0.06);
            const gapTop = lockY + 12;

            pins.forEach((pin, i) => {
                const px = getPinX(i);
                const maxPinH = shearY - gapTop - 4;
                const pinBodyH = maxPinH;

                // Pin chamber (slot)
                ctx.fillStyle = 'rgba(0,0,0,0.4)';
                roundRect(ctx, px - pinW / 2 - 1, gapTop - 2, pinW + 2, pinBodyH + 6, 4);
                ctx.fill();

                // Driver pin (above shear) — the spring-loaded upper part
                const driverH = 18 + (1 - pin.height) * (maxPinH * 0.4);
                // Key pin height + driver pin height fills the chamber
                const keyPinH = pin.height * (maxPinH * 0.7);

                const lift = pin.lift;
                const wobble = Math.sin(Date.now() * 0.04 + i) * pin.wobble * 0.4;

                // Key pin position — lifts up
                const keyY = shearY - keyPinH * lift + wobble;
                const driverY = keyY - driverH - 2;

                if (!pin.set) {
                    // Driver pin (grey, above shear when not set)
                    const driverColor = pin.binding ? '#e2e8f0' : '#a0aec0';
                    ctx.fillStyle = driverColor;
                    roundRect(ctx, px - pinW / 2, driverY, pinW, driverH, 4);
                    ctx.fill();

                    // Binding highlight
                    if (pin.binding) {
                        ctx.strokeStyle = 'rgba(246,200,96,0.6)';
                        ctx.lineWidth = 2;
                        roundRect(ctx, px - pinW / 2, driverY, pinW, driverH, 4);
                        ctx.stroke();
                    }

                    // Key pin (warm amber colour)
                    const keyGrad = ctx.createLinearGradient(px - pinW / 2, keyY, px + pinW / 2, keyY + keyPinH);
                    keyGrad.addColorStop(0, '#f6c860');
                    keyGrad.addColorStop(1, '#d69e2e');
                    ctx.fillStyle = keyGrad;
                    roundRect(ctx, px - pinW / 2, keyY, pinW, keyPinH, 4);
                    ctx.fill();
                } else {
                    // Pin is set — both pins above shear line, glowy
                    const setGrad = ctx.createLinearGradient(px - pinW / 2, gapTop, px + pinW / 2, shearY);
                    setGrad.addColorStop(0, '#68d391');
                    setGrad.addColorStop(1, '#38a169');
                    ctx.fillStyle = setGrad;
                    roundRect(ctx, px - pinW / 2, gapTop + wobble, pinW, maxPinH - 4, 4);
                    ctx.fill();

                    // Glow
                    ctx.shadowColor = '#68d391';
                    ctx.shadowBlur = 10;
                    roundRect(ctx, px - pinW / 2, gapTop + wobble, pinW, maxPinH - 4, 4);
                    ctx.stroke();
                    ctx.shadowBlur = 0;

                    // Check mark
                    ctx.fillStyle = 'white';
                    ctx.font = `bold ${pinW * 0.7}px Jua`;
                    ctx.textAlign = 'center';
                    ctx.fillText('✓', px, gapTop + (maxPinH / 2) + 4);
                }
            });

            // Tension bar at bottom of lock
            const tbW = lockW * 0.85;
            const tbH = 8;
            const tbX = lockX + (lockW - tbW) / 2;
            const tbY = lockY + lockH - 22;
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            roundRect(ctx, tbX, tbY, tbW, tbH, 4);
            ctx.fill();

            const tensionColor = tension < 0.4 ? '#68d391' : tension < 0.75 ? '#f6c860' : '#fc8181';
            ctx.fillStyle = tensionColor;
            roundRect(ctx, tbX, tbY, tbW * tension, tbH, 4);
            ctx.fill();

            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.font = '9px Jua';
            ctx.textAlign = 'left';
            ctx.fillText('TENSION', tbX, tbY - 3);

            // Success overlay
            if (state === 'success') {
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = '#f6c860';
                ctx.textAlign = 'center';
                ctx.font = `bold ${Math.min(28, W * 0.07)}px Jua`;
                ctx.fillText('🔓 Lock Picked!', W / 2, H / 2 + 8);
                ctx.fillStyle = 'rgba(255,255,255,0.55)';
                ctx.font = `${Math.min(13, W * 0.036)}px Jua`;
                ctx.fillText('Generating next lock...', W / 2, H / 2 + 32);
            }
        }

        function drawPick() {
            if (currentTool !== 'pick') return;
            const { lockH, lockY } = getLockDims();
            const shearY = getShearY();
            const cx = getPickCursorX();

            // Pick tool — enters from bottom
            const pickyStart = shearY + 30;
            const pickyEnd = shearY - 8;

            ctx.strokeStyle = '#cbd5e0';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(cx, pickyStart);
            ctx.lineTo(cx, pickyEnd + 14);
            ctx.stroke();

            // Hooked tip
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, pickyEnd + 14);
            ctx.quadraticCurveTo(cx, pickyEnd, cx + 8, pickyEnd - 4);
            ctx.stroke();

            // Glow dot at tip
            ctx.beginPath();
            ctx.arc(cx + 8, pickyEnd - 4, 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(246,200,96,0.8)';
            ctx.fill();
        }

        function drawTensionWrench() {
            const { lockW, lockH, lockX, lockY } = getLockDims();
            const keyhole = { x: lockX + lockW / 2, y: lockY + lockH * 0.95 };

            // Tension wrench at bottom — rotates slightly
            ctx.save();
            ctx.translate(keyhole.x, keyhole.y);
            ctx.rotate((tension - 0.5) * 0.15);

            ctx.strokeStyle = currentTool === 'tension' ? '#f6c860' : '#718096';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(0, 24);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(-10, 24);
            ctx.lineTo(10, 24);
            ctx.stroke();

            ctx.restore();
        }

        // ── Helpers ──────────────────────────────────────────────────
        function roundRect(ctx, x, y, w, h, r) {
            r = Math.min(r, w / 2, h / 2);
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.arcTo(x + w, y, x + w, y + r, r);
            ctx.lineTo(x + w, y + h - r);
            ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
            ctx.lineTo(x + r, y + h);
            ctx.arcTo(x, y + h, x, y + h - r, r);
            ctx.lineTo(x, y + r);
            ctx.arcTo(x, y, x + r, y, r);
            ctx.closePath();
        }

        // ── Game loop ────────────────────────────────────────────────
        let last = performance.now();
        const loop = () => {
            const now = performance.now();
            const dt = Math.min(now - last, 50);
            last = now;
            update(dt);
            draw();

            // Fade hint
            if (hintEl) {
                hintEl.style.opacity = hintTimer > 0 ? Math.min(1, hintTimer / 400) : '0';
            }

            this._frame = requestAnimationFrame(loop);
        };

        resize();
        this._resize = resize;
        window.addEventListener('resize', resize);
        generateLock();
        updateStreakLabel();
        updateToolUI();

        state = 'menu';
        showHint('Use joystick to aim · X to pick');
        this._frame = requestAnimationFrame(loop);

        // ── Input Handlers ───────────────────────────────────────────
        this._onJoystick = (e) => {
            joyVelX = e.detail.x;
        };

        this._onInput = (e) => {
            const action = e.detail.action;

            if (state === 'menu') {
                if (action === 'x' || action === 'a') {
                    state = 'playing';
                    generateLock();
                    showHint('Find the binding pin — press X to set it!');
                }
                return;
            }

            if (state === 'playing') {
                if (action === 'x') {
                    tryPick();
                }
                // Y to switch tool
                if (action === 'y') {
                    currentTool = currentTool === 'pick' ? 'tension' : 'pick';
                    updateToolUI();
                    showHint(currentTool === 'pick' ? 'Pick selected — navigate to pins' : 'Tension wrench selected');
                }
                // B to reset
                if (action === 'b') {
                    generateLock();
                    streak = 0;
                    window.PocketDB.setItem('lp_streak', 0);
                    updateStreakLabel();
                    showHint('Lock reset.');
                }
            }
        };

        window.addEventListener('joystickInput', this._onJoystick);
        window.addEventListener('appInput', this._onInput);
    },

    cleanup: function () {
        cancelAnimationFrame(this._frame);
        window.removeEventListener('resize', this._resize);
        window.removeEventListener('joystickInput', this._onJoystick);
        window.removeEventListener('appInput', this._onInput);
    }
});
