window.GolferEngine = class {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mode = options.mode || 'play';
        
        this.level = options.level || { 
            par: 3, 
            gridUnit: 60, 
            start: { x: 1, y: 1 }, 
            hole: { x: 4, y: 1 }, 
            tiles: [{ x: 0, y: 0, w: 6, h: 3, type: 'grass', z: 0 }], 
            objects: [],
            boundaryMode: 'bounce' 
        };
        
        this.camera = { x: 0, y: 0, zoom: 1 };
        
        this.ball = { x: 0, y: 0, vx: 0, vy: 0, radius: 8, z: 0 };
        this.hole = { x: 0, y: 0, radius: 14, z: 0 };
        
        this.aiming = { dx: 0, dy: 0, active: false };
        this.power = 0;
        this.strokes = 0;
        this.isMoving = this.isShrinking = this.isResetting = false;
        
        this.spriteCache = {};
        this.onLevelComplete = options.onLevelComplete || (() => {});
        this.init();
    }

    init() { 
        this.resetBall(); 
    }

    resetBall() {
        const g = this.level.gridUnit || 60;
        this.ball.x = this.level.start.x * g + g / 2;
        this.ball.y = this.level.start.y * g + g / 2;
        this.ball.vx = this.ball.vy = 0;
        this.ball.radius = 8;
        this.ball.z = 0; // Reset to ground
        
        this.hole.x = this.level.hole.x * g + g / 2;
        this.hole.y = this.level.hole.y * g + g / 2;
        
        this.isMoving = this.isShrinking = this.isResetting = false;
    }

    getSprite(name) {
        if (!name) return null;
        let url = name;
        if (!url.startsWith('http') && !url.startsWith('games/')) {
            url = `games/to-polish/golfer/${name}`;
        }
        if (this.spriteCache[url]) return this.spriteCache[url];
        const img = new Image(); 
        img.src = url;
        this.spriteCache[url] = img;
        return img;
    }

    update() {
        if (this.mode !== 'play') return;
        const time = Date.now() / 1000;
        const g = this.level.gridUnit || 60;

        // Apply patrol movements
        this.level.objects.forEach(o => {
            if (o.moveDist > 0) {
                const offset = Math.sin(time * (o.moveSpeed || 1)) * o.moveDist;
                if (o.moveDir === 'vertical') o._dy = offset;
                else o._dx = offset;
            } else { o._dx = 0; o._dy = 0; }
        });

        if (this.isShrinking) {
            this.ball.radius *= 0.85;
            if (this.ball.radius < 1) {
                if (this.isResetting) this.resetBall();
                else this.onLevelComplete();
            }
            return;
        }

        if (this.ball.vx !== 0 || this.ball.vy !== 0) {
            this.isMoving = true;
            this.ball.x += this.ball.vx;
            this.ball.y += this.ball.vy;
            
            let friction = 0.982;
            let currentTile = null;

            // 1. Determine Ball Layer (Z) based on current tile
            // We find the tile at the ball's center with the highest Z
            let maxZ = -Infinity;
            this.level.tiles.forEach(t => {
                const tx = t.x * g, ty = t.y * g, tw = t.w * g, th = t.h * g;
                if (this.ball.x >= tx && this.ball.x <= tx + tw && this.ball.y >= ty && this.ball.y <= ty + th) {
                    if ((t.z || 0) >= maxZ) {
                        maxZ = t.z || 0;
                        currentTile = t;
                    }
                }
            });

            if (currentTile) {
                this.ball.z = currentTile.z || 0;
            }

            // 2. Check Object Collisions (Only if same Z layer)
            this.level.objects.forEach(o => {
                // If the object is on a different layer than the ball, skip collision
                if ((o.z || 0) !== this.ball.z) return;

                const ox = o.x + (o._dx || 0) + o.w/2, oy = o.y + (o._dy || 0) + o.h/2;
                const name = (o.sprite || "").toLowerCase();
                const angle = o.angle || 0;
                
                const relX = this.ball.x - ox, relY = this.ball.y - oy;
                const localX = relX * Math.cos(-angle) - relY * Math.sin(-angle);
                const localY = relX * Math.sin(-angle) + relY * Math.cos(-angle);

                const isInside = Math.abs(localX) <= o.w/2 && Math.abs(localY) <= o.h/2;
                
                if (isInside) {
                    if (name.includes('sand')) friction = 0.85;
                    if (name.includes('rough')) friction = 0.945;
                    if (name.includes('water')) { 
                        this.ball.vx = this.ball.vy = 0; 
                        this.isShrinking = this.isResetting = true; 
                    }
                    if (name.includes('boost')) { 
                        const force = o.force || 0.4;
                        this.ball.vx += Math.cos(angle) * force; this.ball.vy += Math.sin(angle) * force; 
                    }
                }

                if (name.includes('log') || name.includes('rock') || name.includes('wall')) {
                    const closestX = Math.max(-o.w/2, Math.min(o.w/2, localX));
                    const closestY = Math.max(-o.h/2, Math.min(o.h/2, localY));
                    const distX = localX - closestX, distY = localY - closestY;
                    const dist = Math.sqrt(distX * distX + distY * distY);

                    if (dist < this.ball.radius && dist >= 0) {
                        const lVx = this.ball.vx * Math.cos(-angle) - this.ball.vy * Math.sin(-angle);
                        const lVy = this.ball.vx * Math.sin(-angle) + this.ball.vy * Math.cos(-angle);
                        let nX = dist === 0 ? 0 : distX / dist, nY = dist === 0 ? -1 : distY / dist;
                        
                        const dot = lVx * nX + lVy * nY;
                        const rx = (lVx - 2 * dot * nX) * 0.7, ry = (lVy - 2 * dot * nY) * 0.7;
                        
                        this.ball.vx = rx * Math.cos(angle) - ry * Math.sin(angle);
                        this.ball.vy = rx * Math.sin(angle) + ry * Math.cos(angle);
                        
                        const push = (this.ball.radius - dist + 0.5);
                        this.ball.x += (nX * Math.cos(angle) - nY * Math.sin(angle)) * push;
                        this.ball.y += (nX * Math.sin(angle) + nY * Math.cos(angle)) * push;
                    }
                }
            });

            // 3. Surface Friction & Water Logic
            if (currentTile) {
                if (currentTile.type === 'water') {
                    this.ball.vx = this.ball.vy = 0; 
                    this.isShrinking = this.isResetting = true;
                } else if (currentTile.type === 'rough') {
                    friction = Math.min(friction, 0.945);
                }
            } else {
                // Out of Bounds Logic
                if (this.level.boundaryMode === 'bounce') {
                    let bestN = {x:0, y:0}, bestD = Infinity;
                    this.level.tiles.forEach(t => {
                        const tx = t.x * g, ty = t.y * g, tw = t.w * g, th = t.h * g;
                        // Distance to tile edges
                        const dL = this.ball.x - tx, dR = (tx + tw) - this.ball.x;
                        const dT = this.ball.y - ty, dB = (ty + th) - this.ball.y;
                        
                        // We are outside, so find the deepest penetration into "emptiness"
                        const md = Math.max(-dL, -dR, -dT, -dB);
                        if (md < bestD) {
                            bestD = md;
                            if (-dL === md) bestN = {x: -1, y: 0};
                            else if (-dR === md) bestN = {x: 1, y: 0};
                            else if (-dT === md) bestN = {x: 0, y: -1};
                            else bestN = {x: 0, y: 1};
                        }
                    });

                    // If we are actually outside the bounds of ALL tiles
                    if (bestD > -this.ball.radius) {
                        const dot = this.ball.vx * bestN.x + this.ball.vy * bestN.y;
                        this.ball.vx = (this.ball.vx - 2 * dot * bestN.x) * 0.6;
                        this.ball.vy = (this.ball.vy - 2 * dot * bestN.y) * 0.6;
                        this.ball.x += bestN.x * (bestD + 1); 
                        this.ball.y += bestN.y * (bestD + 1);
                    }
                } else {
                    this.ball.vx = this.ball.vy = 0; 
                    this.isShrinking = this.isResetting = true;
                }
            }

            if (Math.hypot(this.ball.vx, this.ball.vy) < 2.0) friction *= 0.94;
            this.ball.vx *= friction; this.ball.vy *= friction;
            if (Math.abs(this.ball.vx) < 0.35) this.ball.vx = 0; if (Math.abs(this.ball.vy) < 0.35) this.ball.vy = 0;

            // 4. Check Hole (Only on same layer as ball)
            if (Math.hypot(this.ball.x - this.hole.x, this.ball.y - this.hole.y) + this.ball.radius <= this.hole.radius + 2) {
                // Determine hole layer
                let holeZ = 0;
                this.level.tiles.forEach(t => {
                    const tx = t.x * g, ty = t.y * g, tw = t.w * g, th = t.h * g;
                    if (this.hole.x >= tx && this.hole.x <= tx + tw && this.hole.y >= ty && this.hole.y <= ty + th) {
                        holeZ = Math.max(holeZ, t.z || 0);
                    }
                });

                if (holeZ === this.ball.z) {
                    this.ball.vx = this.ball.vy = 0; this.isShrinking = true; this.isResetting = false;
                    if (window.playSfx) window.playSfx('assets/achivement.mp3', 0.5);
                }
            }
        } else this.isMoving = false;

        // Adaptive Zoom
        if (this.mode === 'play') {
            const cW = this.canvas.width, cH = this.canvas.height;
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            this.level.tiles.forEach(t => {
                minX = Math.min(minX, t.x * g); maxX = Math.max(maxX, (t.x + t.w) * g);
                minY = Math.min(minY, t.y * g); maxY = Math.max(maxY, (t.y + t.h) * g);
            });
            const targetZoom = Math.min(1.8, Math.min(cW / ((maxX - minX) * 1.2), cH / ((maxY - minY) * 1.2)));
            this.camera.zoom += (Math.max(0.5, targetZoom) - this.camera.zoom) * 0.05;
            this.camera.x += (this.ball.x - (cW/this.camera.zoom)/2 - this.camera.x) * 0.1;
            this.camera.y += (this.ball.y - (cH/this.camera.zoom)/2 - this.camera.y) * 0.1;
        }
    }

    draw() {
        const cW = this.canvas.width, cH = this.canvas.height;
        this.ctx.clearRect(0, 0, cW, cH);
        this.ctx.fillStyle = this.level.boundaryMode === 'bounce' ? '#1a3310' : '#0a1a06';
        this.ctx.fillRect(0, 0, cW, cH);

        this.ctx.save();
        this.ctx.translate(-this.camera.x * this.camera.zoom, -this.camera.y * this.camera.zoom);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        
        const g = this.level.gridUnit || 60;

        // 1. Sort Layers for drawing
        const layers = [...new Set([...this.level.tiles.map(t => t.z || 0), ...this.level.objects.map(o => o.z || 0)])].sort((a,b) => a-b);
        // Helper to get the layer directly below z
        const getLayerBelow = z => {
            const idx = layers.indexOf(z);
            return idx > 0 ? layers[idx - 1] : null;
        };

        layers.forEach(z => {
            const directBelow = getLayerBelow(z);

            // Draw Tiles on this layer
            this.level.tiles.forEach(t => {
                if ((t.z || 0) !== z) return;
                const tx = Math.floor(t.x * g), ty = Math.floor(t.y * g), tw = Math.floor(t.w * g), th = Math.floor(t.h * g);
                
                // Shadow for elevated tiles (only when there's a gap - skip direct adjacent)
                if (z > 0) {
                    const shadowTarget = layers.find((lz, i) => i < layers.indexOf(z));
                    const isGap = shadowTarget !== null && directBelow !== shadowTarget;
                    if (isGap) {
                        this.ctx.save();
                        this.ctx.filter = 'blur(10px)';
                        this.ctx.fillStyle = 'rgba(0,0,0,0.22)';
                        this.ctx.fillRect(tx + 14, ty + th + 4, tw, 22);
                        this.ctx.filter = 'none';
                        this.ctx.restore();
                    }
                    // Always draw edge shadow
                    this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    this.ctx.fillRect(tx, ty + th, tw, 10);
                }

                if (t.type === 'water') {
                    this.ctx.fillStyle = '#4faec4';
                    this.ctx.fillRect(tx, ty, tw, th);
                    // Waves
                    this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                    this.ctx.lineWidth = 2;
                    for (let wx = 5; wx < tw; wx += 40) {
                        for (let wy = 5; wy < th; wy += 40) {
                            this.ctx.beginPath();
                            this.ctx.arc(tx + wx + Math.sin(Date.now()/500 + wx)*5, ty + wy, 5, 0, Math.PI);
                            this.ctx.stroke();
                        }
                    }
                } else if (t.type === 'rough') {
                    for (let lx = 0; lx < tw; lx += g) {
                        for (let ly = 0; ly < th; ly += g) {
                            const gx = tx + lx, gy = ty + ly;
                            const isDark = (Math.floor(gx / g) + Math.floor(gy / g)) % 2 !== 0;
                            this.ctx.fillStyle = isDark ? '#3a7a0d' : '#458c10';
                            this.ctx.fillRect(gx, gy, g + 0.5, g + 0.5);
                        }
                    }
                } else {
                    for (let lx = 0; lx < tw; lx += g) {
                        for (let ly = 0; ly < th; ly += g) {
                            const gx = tx + lx, gy = ty + ly;
                            const isDark = (Math.floor(gx / g) + Math.floor(gy / g)) % 2 !== 0;
                            this.ctx.fillStyle = isDark ? '#6DBE1D' : '#79C51C';
                            this.ctx.fillRect(gx, gy, g + 0.5, g + 0.5);
                        }
                    }
                }
            });

            // Draw Objects shadows (only cast if there's a layer gap below this z)
            this.level.objects.forEach(o => {
                if ((o.z || 0) !== z) return;
                // Find the layer below the object
                const objDirectBelow = getLayerBelow(z);
                if (objDirectBelow === null) return; // nothing below, no shadow
                // Check if there's a gap (i.e. there's a layer even further below that is NOT the direct below)
                const layerBelowBelow = getLayerBelow(objDirectBelow);
                if (layerBelowBelow === null && objDirectBelow === 0) return; // direct adjacent to ground, no shadow
                if (layerBelowBelow === null && z - objDirectBelow <= 1) return;
                // Cast shadow
                this.ctx.save();
                this.ctx.translate(o.x + o.w/2 + 12 + (o._dx||0), o.y + o.h/2 + 12 + (o._dy||0));
                this.ctx.rotate(o.angle || 0);
                this.ctx.filter = 'blur(8px)';
                this.ctx.fillStyle = 'rgba(0,0,0,0.22)';
                this.ctx.fillRect(-o.w/2, -o.h/2, o.w, o.h);
                this.ctx.filter = 'none';
                this.ctx.restore();
            });

            // Draw Objects on this layer
            this.level.objects.forEach(o => {
                if ((o.z || 0) !== z) return;
                const spr = this.getSprite(o.sprite);
                this.ctx.save();
                this.ctx.translate(o.x + o.w/2 + (o._dx||0), o.y + o.h/2 + (o._dy||0));
                this.ctx.rotate(o.angle || 0);
                
                // Dim effect for objects if ball is on a higher layer (going "under" things)
                if (this.ball.z > z) this.ctx.globalAlpha = 0.5;

                if (spr && spr.complete) this.ctx.drawImage(spr, -o.w/2, -o.h/2, o.w, o.h);
                else { 
                    const n = (o.sprite||"").toLowerCase();
                    this.ctx.fillStyle = n.includes('water') ? '#4faec4' : n.includes('sand') ? '#e3c68d' : 'rgba(255,255,255,0.1)';
                    this.ctx.fillRect(-o.w/2, -o.h/2, o.w, o.h);
                }
                this.ctx.restore();
            });

            // Draw Ball if on this layer
            if (this.ball.z === z) {
                if (this.mode === 'play' || this.mode === 'edit') {
                    if (this.mode === 'play' && !this.isMoving && this.aiming.active) {
                        const angle = Math.atan2(this.aiming.dy, this.aiming.dx), len = (20 + (this.power * 1.5)) / this.camera.zoom;
                        this.ctx.save(); this.ctx.translate(this.ball.x, this.ball.y); this.ctx.rotate(angle);
                        this.ctx.fillStyle = 'rgba(255,255,255,0.7)'; this.ctx.beginPath(); this.ctx.moveTo(0, -6/this.camera.zoom); this.ctx.quadraticCurveTo(len, 0, 0, 6/this.camera.zoom); this.ctx.arc(0,0,6/this.camera.zoom,Math.PI/2, -Math.PI/2); this.ctx.fill(); this.ctx.restore();
                    }
                    this.ctx.fillStyle = 'rgba(0,0,0,0.2)'; this.ctx.beginPath(); this.ctx.arc(this.ball.x, this.ball.y + 2, this.ball.radius, 0, Math.PI*2); this.ctx.fill();
                    this.ctx.fillStyle = 'white'; this.ctx.beginPath(); this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI*2); this.ctx.fill();
                }
            }
        });

        // Hole is special (usually top layer logic but can be fixed to a specific z)
        this.ctx.fillStyle = '#1a3310'; this.ctx.beginPath(); this.ctx.arc(this.hole.x, this.hole.y, this.hole.radius, 0, Math.PI*2); this.ctx.fill();

        this.ctx.restore();
    }
};
