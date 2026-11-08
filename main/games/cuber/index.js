(function() {
    window.apps.push({
        id: 'cuber',
        name: "Cuber",
        description: "A minimalist, high-performance Rubik's Cube. Use the Joystick to orbit and D-Pad to rotate.",
        thumbnail: './games/cuber/assets/cuber.png',
        wideThumbnail: './games/cuber/assets/w-cuber.png',
        color: '#1a1a1a',
        hidden: false,
        achievements: [
            { id: 'cuber-solved', title: 'Solved!', description: 'Solve the cube for the first time.', difficulty: 'medium', image: './games/cuber/assets/a-1.png', trophy: 'bronze' },
            { id: 'cuber-rage-quit', title: 'Rage Quit', description: 'Leave the game after 1 minute without solving.', difficulty: 'easy', image: './games/cuber/assets/a-2.png', trophy: 'bronze' },
            { id: 'cuber-persistence', title: 'Persistence', description: 'Solve 3 cubes after a Rage Quit.', difficulty: 'hard', image: './games/cuber/assets/a-3.png', trophy: 'silver' },
            { id: 'cuber-solve-330', title: 'Speed Solver III', description: 'Solve the cube in under 3m 30s.', difficulty: 'medium', image: './games/cuber/assets/a-4.png', trophy: 'bronze' },
            { id: 'cuber-solve-230', title: 'Speed Solver II', description: 'Solve the cube in under 2m 30s.', difficulty: 'hard', image: './games/cuber/assets/a-5.png', trophy: 'silver' },
            { id: 'cuber-solve-130', title: 'Speed Solver I', description: 'Solve the cube in under 1m 30s.', difficulty: 'extreme', image: './games/cuber/assets/a-6.png', trophy: 'gold' },
            { id: 'cuber-plat', title: 'Cuber Grandmaster', description: 'Unlock all other Cuber Achievements.', difficulty: 'platinum', image: './games/cuber/assets/a-plat.png', trophy: 'platinum' }
        ],
        icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5Z"/></svg>`,
        inputs: { left: 'joystick', right: 'dpad' },
        html: `
            <div class="rubiks-simple-app">
                <div class="rs-header">
                    <div class="rs-title">Cuber</div>
                    <div class="rs-hud">
                        <div class="rs-stat">
                            <div class="rs-label">MOVES</div>
                            <div class="rs-value" id="rs-moves">0</div>
                        </div>
                        <div class="rs-stat">
                            <div class="rs-label">TIME</div>
                            <div class="rs-value" id="rs-timer">00:00</div>
                        </div>
                    </div>
                </div>
                <div class="rs-scene-container">
                    <div class="rs-scene" id="rs-scene">
                        <div class="rs-cube" id="rs-cube">
                            <!-- Cubies will be injected here -->
                        </div>
                    </div>
                </div>
                <div class="rs-solved-msg" id="rs-solved-msg">
                    <h2>CUBE SOLVED!</h2>
                    <p>New scramble (B button) to play again</p>
                </div>
            </div>

            <style>
                .rubiks-simple-app {
                    --cube-size: calc(var(--scale) * 0.35);
                    --cubie-size: calc(var(--cube-size) / 3);
                    --sticker-offset: calc(var(--cubie-size) / 2);
                    width: 100%; height: 100%;
                    background: #111111;
                    display: flex; flex-direction: column;
                    font-family: 'Jua', sans-serif; color: white;
                    overflow: hidden; perspective: 1200px;
                }
                .rs-header {
                    position: absolute; top: calc(var(--scale) * 0.03); left: 0; width: 100%;
                    display: flex; flex-direction: column; align-items: center; gap: 5px;
                    z-index: 100; pointer-events: none;
                }
                .rs-title {
                    font-size: calc(var(--scale) * 0.06);
                    font-weight: bold; color: rgba(255,255,255,0.9);
                    text-shadow: 0 4px 10px rgba(0,0,0,0.5);
                }
                .rs-hud {
                    display: flex; justify-content: center; gap: calc(var(--scale) * 0.02);
                }
                .rs-stat {
                    background: rgba(255,255,255,0.05); padding: 5px 20px;
                    border-radius: 12px; min-width: calc(var(--scale) * 0.1);
                    backdrop-filter: blur(10px); border: 1.5px solid rgba(255,255,255,0.1);
                    display: flex; flex-direction: column; align-items: center;
                }
                .rs-label {
                    font-size: calc(var(--scale) * 0.012);
                    color: rgba(255,255,255,0.5); font-weight: bold;
                }
                .rs-value {
                    font-size: calc(var(--scale) * 0.025);
                    font-weight: bold; color: #fff;
                }
                .rs-scene-container {
                    flex: 1; display: flex; align-items: center; justify-content: center;
                }
                .rs-scene {
                    width: var(--cube-size); height: var(--cube-size);
                    transform-style: preserve-3d;
                    transition: transform 0.1s linear;
                    transform: rotateX(-30deg) rotateY(45deg);
                }
                .rs-cube {
                    width: 100%; height: 100%; position: relative;
                    transform-style: preserve-3d;
                }
                .rs-cubie {
                    position: absolute; 
                    width: var(--cubie-size); height: var(--cubie-size);
                    left: calc(50% - var(--cubie-size) / 2);
                    top: calc(50% - var(--cubie-size) / 2);
                    transform-style: preserve-3d; box-sizing: border-box;
                }
                .rs-face {
                    position: absolute; width: 100%; height: 100%;
                    background: #000; border: 2.5px solid #000;
                    box-sizing: border-box; backface-visibility: hidden;
                }
                .rs-sticker {
                    position: absolute; width: 92%; height: 92%;
                    left: 4%; top: 4%; border-radius: calc(var(--scale) * 0.006);
                    box-shadow: inset 0 -3px 0 rgba(0,0,0,0.15);
                }
                .rs-face.u { transform: rotateX(90deg) translateZ(var(--sticker-offset)); }
                .rs-face.d { transform: rotateX(-90deg) translateZ(var(--sticker-offset)); }
                .rs-face.f { transform: rotateY(0deg) translateZ(var(--sticker-offset)); }
                .rs-face.b { transform: rotateY(180deg) translateZ(var(--sticker-offset)); }
                .rs-face.l { transform: rotateY(-90deg) translateZ(var(--sticker-offset)); }
                .rs-face.r { transform: rotateY(90deg) translateZ(var(--sticker-offset)); }

                .st-white { background: #FFFFFF; }
                .st-yellow { background: #E0D237; }
                .st-green { background: #60A829; }
                .st-blue { background: #1F28D3; }
                .st-orange { background: #FF8000; }
                .st-red { background: #D31F1F; }

                .rs-pivot {
                    position: absolute; 
                    width: 100%; height: 100%;
                    transform-style: preserve-3d;
                    transition: transform 0.35s cubic-bezier(0.45, 0.05, 0.55, 0.95);
                }
                .rs-solved-msg {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.85); padding: 30px; border-radius: 20px;
                    text-align: center; display: none; z-index: 1000; border: 2px solid #009B48;
                    backdrop-filter: blur(10px);
                }
                .rs-solved-msg h2 { margin: 0; color: #009B48; font-size: calc(var(--scale) * 0.05); }
                .rs-solved-msg p { margin: 10px 0 0; color: rgba(255,255,255,0.7); }
            </style>
        `,
        init: function() {
            const cubeEl = document.getElementById('rs-cube');
            const sceneEl = document.getElementById('rs-scene');
            const movesEl = document.getElementById('rs-moves');
            const timerEl = document.getElementById('rs-timer');
            const solvedMsg = document.getElementById('rs-solved-msg');

            let moves = 0;
            let timer = null;
            let startTime = null;
            let isAnimating = false;
            let isSolved = false;
            let hasScrambled = false;
            let camRot = { x: -30, y: 45 };
            let joyState = { x: 0, y: 0 };
            let loopRaf = null;

            const cubies = [];

            function createCubies() {
                cubeEl.innerHTML = '';
                cubies.length = 0;
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        for (let z = -1; z <= 1; z++) {
                            if (x === 0 && y === 0 && z === 0) continue;
                            const el = document.createElement('div');
                            el.className = 'rs-cubie';
                            
                            ['u','d','f','b','l','r'].forEach(face => {
                                const fEl = document.createElement('div');
                                fEl.className = `rs-face ${face}`;
                                
                                let st = '';
                                if (face === 'u' && y === -1) st = 'st-white';
                                else if (face === 'd' && y === 1) st = 'st-yellow';
                                else if (face === 'f' && z === 1) st = 'st-green';
                                else if (face === 'b' && z === -1) st = 'st-blue';
                                else if (face === 'l' && x === -1) st = 'st-orange';
                                else if (face === 'r' && x === 1) st = 'st-red';

                                if (st) {
                                    const s = document.createElement('div');
                                    s.className = `rs-sticker ${st}`;
                                    fEl.appendChild(s);
                                }
                                el.appendChild(fEl);
                            });

                            const c = { 
                                x, y, z, 
                                initX: x, initY: y, initZ: z,
                                el, rot: '',
                                up: { x: 0, y: 1, z: 0 },
                                front: { x: 0, y: 0, z: 1 }
                            };
                            updateCubiePos(c);
                            cubeEl.appendChild(el);
                            cubies.push(c);
                        }
                    }
                }
            }

            function updateCubiePos(c) {
                c.el.style.transform = `translate3d(calc(var(--cubie-size) * ${c.x}), calc(var(--cubie-size) * ${c.y}), calc(var(--cubie-size) * ${c.z})) ${c.rot}`;
            }

            function rotateSlice(axis, index, dir) {
                if (isAnimating) return;
                isAnimating = true;

                if (!startTime && hasScrambled) {
                    startTime = Date.now();
                    timer = setInterval(() => {
                        const s = Math.floor((Date.now() - startTime) / 1000);
                        const m = Math.floor(s / 60);
                        timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
                    }, 1000);
                }

                if (hasScrambled) {
                    moves++;
                    movesEl.textContent = moves;
                }
                if (window.playSfx) window.playSfx('assets/move-menu.mp3', 0.2);

                const slice = cubies.filter(c => {
                    if (axis === 'x') return Math.abs(c.x - index) < 0.1;
                    if (axis === 'y') return Math.abs(c.y - index) < 0.1;
                    if (axis === 'z') return Math.abs(c.z - index) < 0.1;
                    return false;
                });

                const pivot = document.createElement('div');
                pivot.className = 'rs-pivot';
                cubeEl.appendChild(pivot);
                slice.forEach(c => pivot.appendChild(c.el));

                requestAnimationFrame(() => {
                    const rotStr = axis === 'x' ? 'rotateX' : (axis === 'y' ? 'rotateY' : 'rotateZ');
                    pivot.style.transform = `${rotStr}(${90 * dir}deg)`;
                });

                setTimeout(() => {
                    slice.forEach(c => {
                        const oldX = c.x, oldY = c.y, oldZ = c.z;
                        if (axis === 'x') {
                            c.y = -oldZ * dir;
                            c.z = oldY * dir;
                        } else if (axis === 'y') {
                            c.x = oldZ * dir;
                            c.z = -oldX * dir;
                        } else if (axis === 'z') {
                            c.x = -oldY * dir;
                            c.y = oldX * dir;
                        }

                        // Update vectors for solved check
                        const rotateVec = (v, ax, d) => {
                            let { x, y, z } = v;
                            if (ax === 'x') return { x, y: -z * d, z: y * d };
                            if (ax === 'y') return { x: z * d, y, z: -x * d };
                            if (ax === 'z') return { x: -y * d, y: x * d, z };
                        };
                        c.up = rotateVec(c.up, axis, dir);
                        c.front = rotateVec(c.front, axis, dir);

                        const rotStr = axis === 'x' ? 'rotateX' : (axis === 'y' ? 'rotateY' : 'rotateZ');
                        c.rot = `${rotStr}(${90 * dir}deg) ` + c.rot;

                        cubeEl.appendChild(c.el);
                        updateCubiePos(c);
                    });
                    pivot.remove();
                    isAnimating = false;
                    if (hasScrambled) checkSolved();
                }, 360);
            }

            function checkSolved() {
                // A cube is solved if every piece is in its initial relative position AND orientation
                const solved = cubies.every(c => {
                    const posMatch = Math.abs(c.x - c.initX) < 0.1 && Math.abs(c.y - c.initY) < 0.1 && Math.abs(c.z - c.initZ) < 0.1;
                    const upMatch = Math.abs(c.up.x) < 0.1 && Math.abs(c.up.y - 1) < 0.1 && Math.abs(c.up.z) < 0.1;
                    const frontMatch = Math.abs(c.front.x) < 0.1 && Math.abs(c.front.y) < 0.1 && Math.abs(c.front.z - 1) < 0.1;
                    return posMatch && upMatch && frontMatch;
                });

                if (solved && hasScrambled && !isSolved) {
                    isSolved = true;
                    clearInterval(timer);
                    solvedMsg.style.display = 'block';
                    if (window.playSfx) window.playSfx('assets/enter-game.mp3', 0.5);

                    if (window.AchievementService) {
                        window.AchievementService.unlock('cuber-solved');
                        
                        // Persistence check
                        if (window.PocketDB.getItem('cuber_is_enraged') === 'true') {
                            let count = parseInt(window.PocketDB.getItem('cuber_solves_after_rage') || 0) + 1;
                            window.PocketDB.setItem('cuber_solves_after_rage', count);
                            if (count >= 3) {
                                window.AchievementService.unlock('cuber-persistence');
                                window.PocketDB.removeItem('cuber_is_enraged');
                                window.PocketDB.removeItem('cuber_solves_after_rage');
                            }
                        }

                        const elapsed = Date.now() - startTime;
                        if (elapsed < 90000) window.AchievementService.unlock('cuber-solve-130');
                        else if (elapsed < 150000) window.AchievementService.unlock('cuber-solve-230');
                        else if (elapsed < 210000) window.AchievementService.unlock('cuber-solve-330');
                    }
                }
            }

            function updateLoop() {
                if (Math.abs(joyState.x) > 0.05 || Math.abs(joyState.y) > 0.05) {
                    camRot.y -= joyState.x * 2.5; // Smooth continuous rotation, slower as requested
                    camRot.x += joyState.y * 2.5;
                    sceneEl.style.transform = `rotateX(${camRot.x}deg) rotateY(${camRot.y}deg)`;
                }
                loopRaf = requestAnimationFrame(updateLoop);
            }

            createCubies();
            updateLoop();

            this._onJoystick = (e) => {
                joyState.x = e.detail.x;
                joyState.y = e.detail.y;
            };

            this._onInput = (e) => {
                let act = e.detail.action;
                if (isSolved && act !== 'b') return;

                if (act === 'b') return scramble();

                let p = camRot.x % 360; 
                let y = camRot.y % 360;
                if (y < 0) y += 360;
                if (p < -180) p += 360;

                let face = 'f', axis = 'z', dir = 1;
                if (p > 45) { face = 'u'; axis = 'y'; dir = -1; }
                else if (p < -45) { face = 'd'; axis = 'y'; dir = 1; }
                else {
                    if (y >= 315 || y < 45) { face = 'f'; axis = 'z'; dir = 1; }
                    else if (y >= 45 && y < 135) { face = 'r'; axis = 'x'; dir = 1; }
                    else if (y >= 135 && y < 225) { face = 'b'; axis = 'z'; dir = -1; }
                    else if (y >= 225 && y < 315) { face = 'l'; axis = 'x'; dir = -1; }
                }

                if (act === 'a') {
                    rotateSlice(axis, dir, 1);
                    return;
                }

                if (face === 'f' || face === 'b' || face === 'l' || face === 'r') {
                    if (act === 'up') rotateSlice('y', -1, (face==='f'||face==='l')? 1 : -1);
                    if (act === 'down') rotateSlice('y', 1, (face==='f'||face==='l')? 1 : -1);
                    if (act === 'left') {
                        if (face === 'f') rotateSlice('x', -1, -1);
                        else if (face === 'r') rotateSlice('z', 1, -1);
                        else if (face === 'b') rotateSlice('x', 1, 1);
                        else if (face === 'l') rotateSlice('z', -1, 1);
                    }
                    if (act === 'right') {
                        if (face === 'f') rotateSlice('x', 1, -1);
                        else if (face === 'r') rotateSlice('z', -1, -1);
                        else if (face === 'b') rotateSlice('x', -1, 1);
                        else if (face === 'l') rotateSlice('z', 1, 1);
                    }
                } else if (face === 'u' || face === 'd') {
                    if (act === 'up') rotateSlice('z', -1, face==='u' ? -1 : 1);
                    if (act === 'down') rotateSlice('z', 1, face==='u' ? -1 : 1);
                    if (act === 'left') rotateSlice('x', -1, face==='u' ? -1 : 1);
                    if (act === 'right') rotateSlice('x', 1, face==='u' ? -1 : 1);
                }
            };

            function scramble() {
                if (isAnimating) return;
                isSolved = false;
                hasScrambled = false;
                solvedMsg.style.display = 'none';
                if (timer) clearInterval(timer);
                moves = 0; movesEl.textContent = 0;
                startTime = null; timerEl.textContent = "00:00";
                
                let count = 0;
                const sInt = setInterval(() => {
                    const axes = ['x', 'y', 'z'], indices = [-1, 0, 1], dirs = [1, -1];
                    rotateSlice(axes[Math.floor(Math.random()*3)], indices[Math.floor(Math.random()*3)], dirs[Math.floor(Math.random()*2)]);
                    count++;
                    if (count > 20) {
                        clearInterval(sInt);
                        setTimeout(() => { hasScrambled = true; moves = 0; movesEl.textContent = 0; }, 500);
                    }
                }, 400);
            }

            window.addEventListener('joystickInput', this._onJoystick);
            window.addEventListener('appInput', this._onInput);
            this._cleanup = () => {
                window.removeEventListener('joystickInput', this._onJoystick);
                window.removeEventListener('appInput', this._onInput);
                if (timer) clearInterval(timer);
                if (loopRaf) cancelAnimationFrame(loopRaf);
                
                // Rage Quit check
                if (startTime && !isSolved && hasScrambled && (Date.now() - startTime > 60000)) {
                    if (window.AchievementService) {
                        window.AchievementService.unlock('cuber-rage-quit');
                        window.PocketDB.setItem('cuber_is_enraged', 'true');
                        window.PocketDB.setItem('cuber_solves_after_rage', '0');
                    }
                }
            };
        },
        cleanup: function() {
            if (this._cleanup) this._cleanup();
        }
    });
})();
