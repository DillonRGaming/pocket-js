window.apps.push({
    id: 'blocks',
    name: 'Blocks',
    inputs: { left: 'trackpad', right: 'buttons' },
    description: 'A physics-based block playground. Use the trackpad to move the cursor and grab blocks with the A button.',
    thumbnail: './assets/pocket.js.png',
    color: '#4a90e2',
    icon: `<svg viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="20" height="20" rx="2"/>
        <rect x="34" y="10" width="20" height="20" rx="2"/>
        <rect x="10" y="34" width="20" height="20" rx="2"/>
        <rect x="34" y="34" width="20" height="20" rx="2"/>
    </svg>`,
    html: `
        <div class="blocks-wrap">
            <canvas id="blocks-canvas"></canvas>
            <div id="blocks-cursor" style="position:absolute;width:22px;height:22px;border:3px solid white;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);z-index:100;display:none;box-shadow:0 0 6px rgba(0,0,0,0.5);"></div>
        </div>
        <style>
            .blocks-wrap {
                width: 100%; height: 100%;
                position: relative;
                background: linear-gradient(180deg, #87CEEB 60%, #b8d4e8 100%);
                overflow: hidden;
            }
            #blocks-canvas { width: 100%; height: 100%; display: block; }
        </style>
    `,
    init: function() {
        const canvas = document.getElementById('blocks-canvas');
        if (!canvas) return;
        const cursorEl = document.getElementById('blocks-cursor');
        const ctx = canvas.getContext('2d');
        const wrap = canvas.parentElement;

        function resize() {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = wrap.offsetWidth * dpr;
            canvas.height = wrap.offsetHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = wrap.offsetWidth + 'px';
            canvas.style.height = wrap.offsetHeight + 'px';
        }
        resize();

        const W = () => wrap.offsetWidth;
        const H = () => wrap.offsetHeight;

        // ---- Physics ----
        const GRAVITY = 900;    // px/s²
        const BOUNCE   = 0.4;
        const FRICTION = 0.88;  // horizontal friction on floor
        const DRAG     = 0.999; // air drag per second (very low)

        class Block {
            constructor(x, y, w, h, col) {
                this.x = x; this.y = y;
                this.w = w; this.h = h;
                this.col = col;
                this.vx = 0; this.vy = 0;
                this.grabbed = false;
            }

            update(dt) {
                if (this.grabbed) return;

                this.vy += GRAVITY * dt;

                // Tiny air drag
                this.vx *= Math.pow(DRAG, dt);
                this.vy *= Math.pow(DRAG, dt);

                this.x += this.vx * dt;
                this.y += this.vy * dt;

                const cw = W(), ch = H();
                const hw = this.w / 2, hh = this.h / 2;

                // Floor
                if (this.y + hh > ch) {
                    this.y = ch - hh;
                    if (this.vy > 50) {
                        this.vy = -this.vy * BOUNCE;
                        this.vx *= FRICTION;
                    } else {
                        this.vy = 0;
                        this.vx *= Math.pow(0.7, dt * 60); // rolling friction
                    }
                }
                // Ceiling
                if (this.y - hh < 0) {
                    this.y = hh;
                    this.vy = Math.abs(this.vy) * BOUNCE;
                }
                // Left wall
                if (this.x - hw < 0) {
                    this.x = hw;
                    this.vx = Math.abs(this.vx) * BOUNCE;
                }
                // Right wall
                if (this.x + hw > cw) {
                    this.x = cw - hw;
                    this.vx = -Math.abs(this.vx) * BOUNCE;
                }
            }

            hit(px, py) {
                return px >= this.x - this.w/2 && px <= this.x + this.w/2 &&
                       py >= this.y - this.h/2 && py <= this.y + this.h/2;
            }

            draw() {
                const x = this.x - this.w/2, y = this.y - this.h/2;
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.18)';
                ctx.beginPath();
                ctx.roundRect(x + 4, y + 6, this.w, this.h, 6);
                ctx.fill();

                // Block
                ctx.fillStyle = this.col;
                ctx.beginPath();
                ctx.roundRect(x, y, this.w, this.h, 6);
                ctx.fill();

                // Highlight
                ctx.strokeStyle = 'rgba(255,255,255,0.45)';
                ctx.lineWidth = this.grabbed ? 3 : 1.5;
                ctx.stroke();

                // Inner sheen
                const g = ctx.createLinearGradient(x, y, x + this.w/2, y + this.h/2);
                g.addColorStop(0, 'rgba(255,255,255,0.22)');
                g.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.roundRect(x, y, this.w, this.h, 6);
                ctx.fill();
            }
        }

        // Block-block AABB push-apart (no rotation needed)
        function resolveCollisions(blocks) {
            for (let i = 0; i < blocks.length; i++) {
                for (let j = i + 1; j < blocks.length; j++) {
                    const a = blocks[i], b = blocks[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const overlapX = (a.w + b.w) / 2 - Math.abs(dx);
                    const overlapY = (a.h + b.h) / 2 - Math.abs(dy);
                    if (overlapX <= 0 || overlapY <= 0) continue;

                    // Push along the smaller overlap axis
                    if (overlapX < overlapY) {
                        const push = overlapX / 2 * Math.sign(dx);
                        if (!a.grabbed) a.x -= push;
                        if (!b.grabbed) b.x += push;
                        // Swap x velocities
                        if (!a.grabbed && !b.grabbed) {
                            const tmp = a.vx * BOUNCE;
                            a.vx = b.vx * BOUNCE;
                            b.vx = tmp;
                        }
                    } else {
                        const push = overlapY / 2 * Math.sign(dy);
                        if (!a.grabbed) a.y -= push;
                        if (!b.grabbed) b.y += push;
                        if (!a.grabbed && !b.grabbed) {
                            const tmp = a.vy * BOUNCE;
                            a.vy = b.vy * BOUNCE;
                            b.vy = tmp;
                        }
                    }
                }
            }
        }

        // ---- Spawn blocks ----
        const COLORS = ['#FF6B6B','#4ECDC4','#FFE66D','#FF9F43','#a29bfe','#fd79a8','#55efc4','#fdcb6e'];
        const blocks = [];
        for (let i = 0; i < 8; i++) {
            const bw = 50 + Math.random() * 40;
            const bh = 50 + Math.random() * 40;
            blocks.push(new Block(
                bw/2 + Math.random() * (W() - bw),
                -(bh + i * 100),
                bw, bh,
                COLORS[i % COLORS.length]
            ));
        }

        // ---- Input state ----
        let cx = W()/2, cy = H()/2;  // cursor
        let prevCx = cx, prevCy = cy;
        let grabbed = null;
        let grabOx = 0, grabOy = 0; // offset from block center
        // Velocity estimate for throwing
        let throwVx = 0, throwVy = 0;

        // Trackpad moves cursor
        this._trackpad = (e) => {
            prevCx = cx; prevCy = cy;
            cx = e.detail.x * W();
            cy = e.detail.y * H();

            if (cursorEl) {
                cursorEl.style.display = 'block';
                cursorEl.style.left = cx + 'px';
                cursorEl.style.top = cy + 'px';
            }

            if (grabbed) {
                grabbed.x = cx - grabOx;
                grabbed.y = cy - grabOy;
            }
        };

        this._trackpadRelease = () => {
            if (cursorEl) cursorEl.style.display = 'none';
        };

        // A = grab/release toggle (works as hold: grab on press, release on appRelease)
        this._input = (e) => {
            const act = e.detail.action;
            if (act === 'a' && !grabbed) {
                // Try grab topmost block under cursor
                for (let i = blocks.length - 1; i >= 0; i--) {
                    if (blocks[i].hit(cx, cy)) {
                        grabbed = blocks[i];
                        grabbed.grabbed = true;
                        grabbed.vx = 0; grabbed.vy = 0;
                        grabOx = cx - grabbed.x;
                        grabOy = cy - grabbed.y;
                        throwVx = 0; throwVy = 0;
                        // Float to top of render stack
                        blocks.splice(i, 1);
                        blocks.push(grabbed);
                        break;
                    }
                }
            }
        };

        this._release = (e) => {
            const act = e.detail.action;
            if (act === 'a' && grabbed) {
                grabbed.grabbed = false;
                grabbed.vx = throwVx;
                grabbed.vy = throwVy;
                grabbed = null;
            }
        };

        window.addEventListener('trackpadInput',   this._trackpad);
        window.addEventListener('trackpadRelease',  this._trackpadRelease);
        window.addEventListener('appInput',         this._input);
        window.addEventListener('appRelease',       this._release);

        // ---- Loop ----
        let last = null;
        const self = this;
        function loop(ts) {
            if (!last) last = ts;
            const dt = Math.min((ts - last) / 1000, 0.05);
            last = ts;

            // Track cursor velocity for throw
            if (dt > 0) {
                const instVx = (cx - prevCx) / dt;
                const instVy = (cy - prevCy) / dt;
                throwVx = throwVx * 0.6 + instVx * 0.4;
                throwVy = throwVy * 0.6 + instVy * 0.4;
            }
            prevCx = cx; prevCy = cy;

            ctx.clearRect(0, 0, W(), H());

            // Ground line
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(0, H() - 8, W(), 8);

            // Update + collide + draw
            blocks.forEach(b => b.update(dt));
            resolveCollisions(blocks);
            blocks.forEach(b => b.draw());

            // Cursor ring
            if (grabbed && cursorEl && cursorEl.style.display !== 'none') {
                ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, 14, 0, Math.PI * 2);
                ctx.stroke();
            }

            self._frame = requestAnimationFrame(loop);
        }
        self._frame = requestAnimationFrame(loop);
    },
    cleanup: function() {
        cancelAnimationFrame(this._frame);
        window.removeEventListener('trackpadInput',  this._trackpad);
        window.removeEventListener('trackpadRelease', this._trackpadRelease);
        window.removeEventListener('appInput',        this._input);
        window.removeEventListener('appRelease',      this._release);
    }
});
