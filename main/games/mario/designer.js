window.apps.push({
    id: 'mario-designer',
    name: 'Mario Designer',
    description: 'Create your own Super Mario levels.',
    thumbnail: 'games/mario/assets/designer-thumb.png',
    color: '#333',
    hidden: true,
    inputs: { left: 'dpad', right: 'buttons' },
    html: `
        <div class="mario-designer">
            <div class="ds-toolbar">
                <button id="ds-save">SAVE</button>
                <button id="ds-play">PLAY</button>
                <div class="ds-tool-group">
                    <button class="ds-tool active" data-tool="brush">🖌️</button>
                    <button class="ds-tool" data-tool="erase">🧹</button>
                    <button class="ds-tool" data-tool="select">🎯</button>
                </div>
            </div>
            <div class="ds-main">
                <div class="ds-canvas-container">
                    <canvas id="ds-canvas"></canvas>
                </div>
                <div class="ds-sidebar">
                    <div class="ds-section-title">ASSETS</div>
                    <div class="ds-asset-list" id="ds-asset-list">
                        <!-- Tiles will be loaded here -->
                    </div>
                    <div class="ds-inspector" id="ds-inspector">
                        <div class="ds-section-title">INSPECTOR</div>
                        <div id="ds-inspector-content">Select an object</div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .mario-designer { width: 100%; height: 100%; background: #222; color: #fff; display: flex; flex-direction: column; font-family: 'Jua', sans-serif; overflow: hidden; }
            .ds-toolbar { height: 50px; background: #333; display: flex; align-items: center; padding: 0 15px; gap: 10px; border-bottom: 2px solid #444; }
            .ds-main { flex: 1; display: flex; overflow: hidden; }
            .ds-canvas-container { flex: 1; position: relative; overflow: auto; background: #1a1a1a; display: flex; align-items: center; justify-content: center; }
            #ds-canvas { background: #5c94fc; box-shadow: 0 0 20px rgba(0,0,0,0.5); image-rendering: pixelated; }
            .ds-sidebar { width: 250px; background: #2a2a2a; border-left: 2px solid #444; display: flex; flex-direction: column; }
            .ds-section-title { padding: 10px; font-size: 14px; background: #333; color: #aaa; letter-spacing: 1px; }
            .ds-asset-list { flex: 1; padding: 10px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; overflow-y: auto; }
            .ds-asset { aspect-ratio: 1; background: #444; border: 2px solid transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 4px; }
            .ds-asset.active { border-color: #e45d22; background: #555; }
            .ds-inspector { height: 200px; border-top: 2px solid #444; padding: 10px; font-size: 13px; }
            button { background: #444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-family: inherit; font-size: 14px; }
            button:hover { background: #555; }
            button.active { background: #e45d22; }
            .ds-tool-group { display: flex; gap: 5px; margin-left: 15px; border-left: 1px solid #555; padding-left: 15px; }
        </style>
    `,
    init: function(levelData = null) {
        const canvas = document.getElementById('ds-canvas');
        const assetList = document.getElementById('ds-asset-list');
        const inspector = document.getElementById('ds-inspector-content');
        
        // Ensure default level
        const defaultLevel = { width: 64, height: 15, tiles: Array(64 * 15).fill(0) };
        const level = levelData || defaultLevel;
        
        const engine = new window.MarioEngine(canvas, { mode: 'edit', level: level });
        
        let currentTool = 'brush';
        let currentTile = 1;
        let isMouseDown = false;

        // Populate Asset List
        const assets = [
            { id: 1, name: 'Ground', color: '#8a4b08' },
            { id: 2, name: 'Brick', color: '#b04a00' },
            { id: 3, name: 'Block', color: '#ffcc33' },
            { id: 4, name: 'Pipe', color: '#00aa00' }
        ];

        assets.forEach(asset => {
            const el = document.createElement('div');
            el.className = 'ds-asset' + (asset.id === currentTile ? ' active' : '');
            el.style.backgroundColor = asset.color;
            el.title = asset.name;
            el.onclick = () => {
                document.querySelectorAll('.ds-asset').forEach(a => a.classList.remove('active'));
                el.classList.add('active');
                currentTile = asset.id;
            };
            assetList.appendChild(el);
        });

        // Tool Logic
        document.querySelectorAll('.ds-tool').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.ds-tool').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTool = btn.dataset.tool;
            };
        });

        const getMousePos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height);
            return { x, y };
        };

        const handleDraw = (e) => {
            const pos = getMousePos(e);
            const gx = Math.floor(pos.x / engine.gridSize);
            const gy = Math.floor(pos.y / engine.gridSize);
            
            if (gx >= 0 && gx < engine.level.width && gy >= 0 && gy < engine.level.height) {
                if (currentTool === 'brush') {
                    engine.level.tiles[gy * engine.level.width + gx] = currentTile;
                } else if (currentTool === 'erase') {
                    engine.level.tiles[gy * engine.level.width + gx] = 0;
                }
            }
        };

        canvas.onmousedown = (e) => { isMouseDown = true; handleDraw(e); };
        window.onmousemove = (e) => { if (isMouseDown) handleDraw(e); };
        window.onmouseup = () => { isMouseDown = false; };

        document.getElementById('ds-play').onclick = () => {
            window.launchApp('mario', engine.level);
        };

        document.getElementById('ds-save').onclick = () => {
            const blob = new Blob([JSON.stringify(engine.level)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mario-level.json';
            a.click();
        };
        
        function loop() {
            engine.draw();
            this._anim = requestAnimationFrame(loop.bind(this));
        }
        loop.call(this);
    },
    cleanup: function() {
        cancelAnimationFrame(this._anim);
    }
});

// Mario Engine
window.MarioEngine = class {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mode = options.mode || 'play';
        
        // Physics constants (scaled to pixels per frame)
        this.GRAVITY_LOW = 0.2;
        this.GRAVITY_HIGH = 0.5;
        this.WALK_ACCEL = 0.1;
        this.RUN_ACCEL = 0.2;
        this.MAX_WALK_SPEED = 1.5;
        this.MAX_RUN_SPEED = 2.5;
        this.FRICTION = 0.08;
        this.JUMP_IMPULSE = -5;
        this.TERMINAL_VELOCITY = 4.5;
        
        this.gridSize = 16;
        this.level = options.level || this.createDefaultLevel();
        
        this.mario = {
            x: 32,
            y: 0,
            vx: 0,
            vy: 0,
            width: 12,
            height: 16,
            onGround: false,
            facingRight: true,
            runDelay: 0,
            animFrame: 0,
            animTimer: 0
        };
        
        this.camera = { x: 0, y: 0 };
        this.inputs = { left: false, right: false, up: false, down: false, a: false, b: false };
    }
    
    createDefaultLevel() {
        const width = 128, height = 15;
        const tiles = Array(width * height).fill(0);
        for (let x = 0; x < width; x++) {
            tiles[(height - 1) * width + x] = 1;
            tiles[(height - 2) * width + x] = 1;
        }
        return { width, height, tiles };
    }
    
    handleInput(action, isPressed) {
        if (action === 'left') this.inputs.left = isPressed;
        if (action === 'right') this.inputs.right = isPressed;
        if (action === 'up') this.inputs.up = isPressed;
        if (action === 'down') this.inputs.down = isPressed;
        if (action === 'a') this.inputs.a = isPressed;
        if (action === 'b') this.inputs.b = isPressed;
    }
    
    update() {
        if (this.mode === 'edit') return;
        
        // Horizontal
        if (this.inputs.b) this.mario.runDelay = 10;
        else if (this.mario.runDelay > 0) this.mario.runDelay--;

        const isRunning = this.mario.runDelay > 0;
        const accel = isRunning ? this.RUN_ACCEL : this.WALK_ACCEL;
        const maxSpeed = isRunning ? this.MAX_RUN_SPEED : this.MAX_WALK_SPEED;
        
        if (this.inputs.left) {
            this.mario.vx -= accel;
            this.mario.facingRight = false;
        } else if (this.inputs.right) {
            this.mario.vx += accel;
            this.mario.facingRight = true;
        } else {
            if (Math.abs(this.mario.vx) < this.FRICTION) this.mario.vx = 0;
            else this.mario.vx -= Math.sign(this.mario.vx) * this.FRICTION;
        }
        
        if (Math.abs(this.mario.vx) > maxSpeed) {
            this.mario.vx = Math.sign(this.mario.vx) * maxSpeed;
        }
        
        // Vertical
        const gravity = (this.inputs.a && this.mario.vy < 0) ? this.GRAVITY_LOW : this.GRAVITY_HIGH;
        if (!this.mario.onGround) {
            this.mario.vy += gravity;
            if (this.mario.vy > this.TERMINAL_VELOCITY) this.mario.vy = this.TERMINAL_VELOCITY;
        } else if (this.inputs.a) {
            this.mario.vy = this.JUMP_IMPULSE;
            this.mario.onGround = false;
        }
        
        // Apply & Collide
        this.mario.x += this.mario.vx;
        this.checkCollisions(true);
        this.mario.y += this.mario.vy;
        this.checkCollisions(false);
        
        // Animation
        if (!this.mario.onGround) {
            this.mario.state = 'jump';
        } else if (this.mario.vx !== 0) {
            this.mario.state = isRunning ? 'run' : 'walk';
            this.mario.animTimer += Math.abs(this.mario.vx) * 0.1;
            this.mario.animFrame = Math.floor(this.mario.animTimer) % 3;
        } else {
            this.mario.state = 'idle';
            this.mario.animFrame = 0;
        }

        this.camera.x = Math.max(this.camera.x, this.mario.x - 100);
    }
    
    checkCollisions(horizontal) {
        const left = Math.floor(this.mario.x / this.gridSize);
        const right = Math.floor((this.mario.x + this.mario.width - 1) / this.gridSize);
        const top = Math.floor(this.mario.y / this.gridSize);
        const bottom = Math.floor((this.mario.y + this.mario.height - 1) / this.gridSize);
        
        for (let r = top; r <= bottom; r++) {
            for (let c = left; c <= right; c++) {
                const tile = this.getTile(c, r);
                if (tile > 0) {
                    if (horizontal) {
                        if (this.mario.vx > 0) this.mario.x = c * this.gridSize - this.mario.width;
                        else if (this.mario.vx < 0) this.mario.x = (c + 1) * this.gridSize;
                        this.mario.vx = 0;
                    } else {
                        if (this.mario.vy > 0) {
                            this.mario.y = r * this.gridSize - this.mario.height;
                            this.mario.onGround = true;
                            this.mario.vy = 0;
                        } else if (this.mario.vy < 0) {
                            this.mario.y = (r + 1) * this.gridSize;
                            this.mario.vy = 0;
                        }
                    }
                }
            }
        }
        
        if (!horizontal && this.mario.vy !== 0) {
            const groundY = Math.floor((this.mario.y + this.mario.height) / this.gridSize);
            const midX = Math.floor((this.mario.x + this.mario.width / 2) / this.gridSize);
            if (this.getTile(midX, groundY) === 0) this.mario.onGround = false;
        }
    }
    
    getTile(c, r) {
        if (c < 0 || c >= this.level.width || r < 0 || r >= this.level.height) return 0;
        return this.level.tiles[r * this.level.width + c];
    }
    
    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#5c94fc';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        const tileColors = { 1: '#8a4b08', 2: '#b04a00', 3: '#ffcc33', 4: '#00aa00' };
        for (let r = 0; r < this.level.height; r++) {
            for (let c = 0; c < this.level.width; c++) {
                const tile = this.level.tiles[r * this.level.width + c];
                if (tile > 0) {
                    ctx.fillStyle = tileColors[tile];
                    ctx.fillRect(c * this.gridSize, r * this.gridSize, this.gridSize, this.gridSize);
                    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                    ctx.strokeRect(c * this.gridSize, r * this.gridSize, this.gridSize, this.gridSize);
                }
            }
        }
        
        // Mario
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.mario.x, this.mario.y, this.mario.width, this.mario.height);
        // Eyes
        ctx.fillStyle = '#000';
        const eyeX = this.mario.facingRight ? this.mario.x + 8 : this.mario.x + 2;
        ctx.fillRect(eyeX, this.mario.y + 2, 2, 2);
        
        ctx.restore();
    }
};
