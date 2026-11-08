(function() {
    window.apps.push({
        id: 'cozytrain',
        name: 'Cozy Train',
        description: 'A cozy top-down train game. Relax and add more carts!',
        thumbnail: './assets/pocket.js.png', 
        color: '#78e08f',
        icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c-4 0-8 3-8 7v6h16V9c0-4-4-7-8-7zm-4 4h8v3H8V6zm-1 8h10v2H7v-2z"/></svg>`,
        inputs: {
            left: 'joystick',
            right: 'quad_buttons'
        },
        html: `
            <div class="cozytrain-app">
                <canvas id="cozytrain-canvas"></canvas>
                <div class="cozytrain-hud">
                    Speed: <span id="ct-speed">100</span><br>
                    Carts: <span id="ct-carts">3</span>
                </div>
                <div class="cozytrain-controls-hint">
                    Up: +Cart | Down: -Cart<br>
                    Left: Slow | Right: Fast<br>
                    Joystick: Move Camera (Releases follow mode.<br>Stop Joystick to snap back)
                </div>
            </div>
            <style>
                .cozytrain-app {
                    width: 100%; height: 100%;
                    overflow: hidden; background-color: #78e08f;
                    position: relative; touch-action: none;
                }
                #cozytrain-canvas {
                    display: block; width: 100%; height: 100%;
                }
                .cozytrain-hud {
                    position: absolute; top: calc(var(--scale) * 0.02); left: calc(var(--scale) * 0.02);
                    color: white; font-family: 'Jua', sans-serif;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5); 
                    font-size: calc(var(--scale) * 0.025);
                    pointer-events: none;
                    background: rgba(0,0,0,0.2);
                    padding: calc(var(--scale) * 0.01) calc(var(--scale) * 0.02);
                    border-radius: calc(var(--scale) * 0.01);
                }
                .cozytrain-controls-hint {
                    position: absolute; top: calc(var(--scale) * 0.02); right: calc(var(--scale) * 0.02);
                    color: rgba(255,255,255,0.7); font-family: 'Jua', sans-serif;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5); 
                    font-size: calc(var(--scale) * 0.015);
                    pointer-events: none; text-align: right;
                }
            </style>
        `,
        init: function() {
            const canvas = document.getElementById('cozytrain-canvas');
            const ctx = canvas.getContext('2d');
            const app = document.querySelector('.cozytrain-app');
            let width = app.clientWidth;
            let height = app.clientHeight;

            const observer = new ResizeObserver(() => {
                width = app.clientWidth;
                height = app.clientHeight;
                canvas.width = width;
                canvas.height = height;
            });
            observer.observe(app);

            let joyX = 0, joyY = 0;
            this._onJoystick = (e) => {
                joyX = e.detail.x;
                joyY = e.detail.y;
            };

            let speed = 100;
            let numCarts = 3;
            const speedEl = document.getElementById('ct-speed');
            const cartsEl = document.getElementById('ct-carts');

            this._onInput = (e) => {
                const act = e.detail.action;
                if (act === 'up') numCarts++;
                if (act === 'down') numCarts = Math.max(0, numCarts - 1);
                if (act === 'right') speed = Math.min(500, speed + 30);
                if (act === 'left') speed = Math.max(0, speed - 30);
                
                speedEl.textContent = speed;
                cartsEl.textContent = numCarts;
            };

            window.addEventListener('joystickInput', this._onJoystick);
            window.addEventListener('appInput', this._onInput);

            let camera = { x: 0, y: 0 };
            let followTrain = true;
            let trainDistance = 0;
            let cartLength = 55;

            let controlPoints = [];
            let targetPos = { x: 0, y: 0 };
            let currentAngle = 0; // Starts facing right (0 rads) Let's make it start randomly or just facing 0.
            let trackPath = [];
            let pathDistances = [];
            let totalDistance = 0;
            let lastGeneratedIndex = 0;

            function generateControlPoints(count) {
                for(let i=0; i<count; i++) {
                    controlPoints.push({ x: targetPos.x, y: targetPos.y });
                    let angleChange = (Math.random() - 0.5) * 1.5; 
                    currentAngle += angleChange;
                    let distance = 200 + Math.random() * 200;
                    targetPos.x += Math.cos(currentAngle) * distance;
                    targetPos.y += Math.sin(currentAngle) * distance;
                }
            }

            function extendSpline() {
                let p0 = controlPoints[Math.max(0, lastGeneratedIndex - 1)];
                let p1 = controlPoints[lastGeneratedIndex];
                let p2 = controlPoints[Math.min(controlPoints.length - 1, lastGeneratedIndex + 1)];
                let p3 = controlPoints[Math.min(controlPoints.length - 1, lastGeneratedIndex + 2)];

                const steps = 25;
                for(let i=0; i<steps; i++) {
                    let t = i / steps;
                    let x = 0.5 * (
                        (2 * p1.x) +
                        (-p0.x + p2.x) * t +
                        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t * t +
                        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t * t * t
                    );
                    let y = 0.5 * (
                        (2 * p1.y) +
                        (-p0.y + p2.y) * t +
                        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t * t +
                        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t * t * t
                    );
                    
                    let p = { x, y, angle: 0 };
                    if (trackPath.length > 0) {
                        let lastP = trackPath[trackPath.length - 1];
                        let dx = p.x - lastP.x;
                        let dy = p.y - lastP.y;
                        let len = Math.sqrt(dx*dx + dy*dy) || 0.001;
                        totalDistance += len;
                        p.n_dx = -dy / len;
                        p.n_dy = dx / len;
                        p.angle = Math.atan2(dy, dx);
                    } else {
                        p.n_dx = 0; p.n_dy = 1; p.angle = currentAngle;
                    }
                    trackPath.push(p);
                    pathDistances.push(totalDistance);
                }
                lastGeneratedIndex++;
            }

            generateControlPoints(20);
            for(let i=0; i<15; i++) extendSpline();

            function getPointAt(d) {
                if (d <= 0) return { pt: trackPath[0], angle: trackPath[1] ? trackPath[1].angle : 0 };
                if (d >= totalDistance) return { pt: trackPath[trackPath.length-1], angle: trackPath[trackPath.length-1].angle };
                
                let low = 0, high = pathDistances.length - 1;
                while(low <= high) {
                    let mid = Math.floor((low + high)/2);
                    if (pathDistances[mid] < d) low = mid + 1;
                    else if (pathDistances[mid] > d) high = mid - 1;
                    else { low = mid; break; }
                }
                let i = high;
                if (i < 0) i = 0;
                if (i >= pathDistances.length - 1) i = pathDistances.length - 2;
                
                let d0 = pathDistances[i];
                let d1 = pathDistances[i+1];
                let p0 = trackPath[i];
                let p1 = trackPath[i+1];
                
                let t = (d - d0) / (d1 - d0);
                let pt = { x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t };
                return { pt, angle: p1.angle };
            }

            const CHUNK_SIZE = 400;
            function xorshift(seed) {
                seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5;
                return (seed >>> 0) / 4294967296;
            }
            function hash(x, y, index) {
                return xorshift(Math.imul(x * 374761393 ^ y * 668265263, 1274126177) + index * 1274126177);
            }

            function drawBackground() {
                // Ensure width/height are positive, could be 0 shortly during load
                if (width <= 0 || height <= 0) return;
                
                let startC = Math.floor((camera.x - width/2) / CHUNK_SIZE);
                let endC = Math.floor((camera.x + width/2) / CHUNK_SIZE);
                let startR = Math.floor((camera.y - height/2) / CHUNK_SIZE);
                let endR = Math.floor((camera.y + height/2) / CHUNK_SIZE);

                for(let c = startC; c <= endC; c++) {
                    for(let r = startR; r <= endR; r++) {
                        let numItems = Math.floor(hash(c, r, 0) * 20) + 10;
                        for(let i=1; i<=numItems; i++) {
                            let rx = hash(c, r, i * 3);
                            let ry = hash(c, r, i * 3 + 1);
                            let typeRand = hash(c, r, i * 3 + 2);
                            
                            let x = c * CHUNK_SIZE + rx * CHUNK_SIZE - camera.x + width/2;
                            let y = r * CHUNK_SIZE + ry * CHUNK_SIZE - camera.y + height/2;
                            
                            if (typeRand < 0.2) {
                                ctx.fillStyle = typeRand < 0.1 ? '#ffb8b8' : '#fff200';
                                ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill();
                                ctx.fillStyle = '#ffffff';
                                ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2); ctx.fill();
                            } else if (typeRand < 0.6) {
                                ctx.fillStyle = '#1e824c';
                                let tuftSize = 1 + hash(c,r, i*4) * 2;
                                ctx.fillRect(x, y-5*tuftSize, 2*tuftSize, 10*tuftSize);
                                ctx.fillRect(x+3*tuftSize, y-2*tuftSize, 2*tuftSize, 7*tuftSize);
                            } else {
                                ctx.fillStyle = '#5bd87a';
                                ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill();
                            }
                        }
                    }
                }
            }

            function drawTrack() {
                if (width <= 0 || height <= 0) return;
                
                let viewW = width / 2 + 100;
                let viewH = height / 2 + 100;

                ctx.lineWidth = 6;
                ctx.strokeStyle = '#5c4033';
                ctx.beginPath();
                for (let i = 0; i < trackPath.length; i += 6) {
                    let p = trackPath[i];
                    if (Math.abs(p.x - camera.x) < viewW && Math.abs(p.y - camera.y) < viewH) {
                        let cx = p.x - camera.x + width/2;
                        let cy = p.y - camera.y + height/2;
                        ctx.moveTo(cx + p.n_dx * 20, cy + p.n_dy * 20);
                        ctx.lineTo(cx - p.n_dx * 20, cy - p.n_dy * 20);
                    }
                }
                ctx.stroke();

                for (let side = -1; side <= 1; side += 2) {
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = '#dcdde1';
                    ctx.beginPath();
                    for (let i = 0; i < trackPath.length; i++) {
                        let p = trackPath[i];
                        let tx = p.x - camera.x + width/2 + p.n_dx * 12 * side;
                        let ty = p.y - camera.y + height/2 + p.n_dy * 12 * side;
                        
                        if (i === 0) ctx.moveTo(tx, ty);
                        else ctx.lineTo(tx, ty);
                    }
                    ctx.stroke();
                }
            }

            function drawTrain() {
                if (width <= 0 || height <= 0) return;

                for (let i = numCarts; i >= 0; i--) {
                    let d = trainDistance - i * cartLength;
                    if (d < 0) continue;
                    
                    let { pt, angle } = getPointAt(d);
                    if (!pt) continue;
                    
                    ctx.save();
                    ctx.translate(pt.x - camera.x + width/2, pt.y - camera.y + height/2);
                    ctx.rotate(angle);
                    
                    if (i === 0) {
                        ctx.fillStyle = '#e84118';
                        ctx.fillRect(-22, -14, 44, 28);
                        ctx.fillStyle = '#2f3640';
                        ctx.fillRect(8, -12, 12, 24);
                        ctx.fillStyle = '#fbc531'; 
                        ctx.fillRect(-22, -4, 44, 8);
                        ctx.fillStyle = '#7f8fa6';
                        ctx.beginPath();
                        ctx.arc(16, 0, 6, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.fillStyle = i % 2 === 0 ? '#00a8ff' : '#9c88ff';
                        ctx.fillRect(-20, -12, 40, 24);
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                        ctx.fillRect(-15, -8, 30, 16);
                        ctx.fillStyle = '#353b48';
                        ctx.fillRect(20, -3, 10, 6);
                    }
                    
                    ctx.restore();
                }
            }

            let smokes = [];
            function drawSmoke(dt) {
                if (width <= 0 || height <= 0) return;

                if (speed > 0 && Math.random() < speed * dt * 0.05) {
                    let { pt, angle } = getPointAt(trainDistance);
                    let cx = pt.x + Math.cos(angle) * 16;
                    let cy = pt.y + Math.sin(angle) * 16;
                    smokes.push({ x: cx, y: cy, life: 1, size: 5 });
                }
                
                for (let i = smokes.length - 1; i >= 0; i--) {
                    let s = smokes[i];
                    s.life -= dt * 0.5;
                    s.size += dt * 15;
                    s.y -= dt * 20;
                    
                    if (s.life <= 0) {
                        smokes.splice(i, 1);
                        continue;
                    }
                    
                    ctx.fillStyle = `rgba(255, 255, 255, ${s.life * 0.5})`;
                    ctx.beginPath();
                    ctx.arc(s.x - camera.x + width/2, s.y - camera.y + height/2, s.size, 0, Math.PI*2);
                    ctx.fill();
                }
            }

            let lastTime = performance.now();
            let loopRaf;

            const loop = (time) => {
                let dt = (time - lastTime) / 1000;
                lastTime = time;
                if (dt > 0.1) dt = 0.1;
                
                trainDistance += speed * dt;
                
                if (trainDistance > totalDistance - 1500 && lastGeneratedIndex < controlPoints.length - 3) {
                    extendSpline();
                }
                if (trainDistance > totalDistance - 2500) {
                    generateControlPoints(5);
                }
                
                if (Math.abs(joyX) > 0.05 || Math.abs(joyY) > 0.05) {
                    followTrain = false;
                    const camSpeed = 500;
                    camera.x += joyX * camSpeed * dt;
                    camera.y += joyY * camSpeed * dt; 
                } else if (!followTrain && Math.abs(joyX) < 0.05 && Math.abs(joyY) < 0.05) {
                    followTrain = true;
                }

                if (followTrain) {
                    let { pt } = getPointAt(trainDistance);
                    if (pt) {
                        camera.x += (pt.x - camera.x) * 4 * dt;
                        camera.y += (pt.y - camera.y) * 4 * dt;
                    }
                }
                
                if (width > 0 && height > 0) {
                    ctx.clearRect(0, 0, width, height);
                    drawBackground();
                    drawTrack();
                    drawTrain();
                    drawSmoke(dt);
                }
                
                loopRaf = requestAnimationFrame(loop);
            };
            loopRaf = requestAnimationFrame(loop);

            this._cleanup = () => {
                window.removeEventListener('joystickInput', this._onJoystick);
                window.removeEventListener('appInput', this._onInput);
                observer.disconnect();
                cancelAnimationFrame(loopRaf);
            };
        },
        cleanup: function() {
            if (this._cleanup) this._cleanup();
        }
    });
})();
