(function() {
    window.apps.push({
        id: 'trucker',
        name: 'Trucker',
        description: 'Navigate the roads with your truck and trailer. Use A/D to steer, W/S to control speed. T to Attach/Detach, L for Lights, M for Mirrors.',
        thumbnail: './games/beta/trucker/assets/truck-1.svg',
        hidden: false,
        color: '#0a1a2f',
        icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M20,8h-3V4H3C1.9,4,1,4.9,1,6v11h2c0,1.66,1.34,3,3,3s3-1.34,3-3h6c0,1.66,1.34,3,3,3s3-1.34,3-3h2v-5L20,8z M6,18.5c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S6.83,18.5,6,18.5z M18,18.5c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5 s1.5,0.67,1.5,1.5S18.83,18.5,18,18.5z M17,12V9h3l2,3H17z"/>
        </svg>`,
        achievements:[
            { id: 'trucker-start', title: 'Hauling Freight', description: 'Begin your trucking simulation.', trophy: 'bronze' },
            { id: 'trucker-speed', title: 'Highway Speed', description: 'Reach a steady speed of 40 KM/H.', trophy: 'silver' }
        ],
        inputs: {
            left: 'steering',
            right: { type: 'slider', options: { defaultValue: 50, id: 'throttle', returnTo: 50, returnSpeed: 0.04 } }
        },
        keyMap: {
            'w': { type: 'slider', side: 'right', id: 'throttle', value: 100 },
            's': { type: 'slider', side: 'right', id: 'throttle', value: 0 },
            'a': { type: 'steering', value: -1 },
            'd': { type: 'steering', value: 1 }
        },

        TRUCK_RIGS:[
            {
                id: 'truck-1',
                name: 'Class 8 Hauler',
                sprite: './games/trucker/assets/truck-1.svg',
                mirrorSprite: './games/trucker/assets/mirror.svg',
                color: '#e45d22',
                scale: 0.25,
                layer: 1,
                spriteOffsetX: 0,
                spriteOffsetY: 0,
                fifthWheelOffset: -9,
                maxSteerAngle: 0.55,
                steerSpeed: 1.8,
                accelRate: 0.28,
                brakeRate: 0.9,
                maxSpeed: 60,
                cameraZoom: 7.5,
                cameraFollowSpeed: 4,
                wheelScale: 0.06,
                wheelSpacing: 10,
                axles:[
                    { x: 11, layer: 2, steer: true },
                    { x: -10, layer: 0, steer: false }
                ]
            }
        ],

        TRAILER_RIGS:[
            {
                id: 'trailer-1',
                name: '53ft Dry Van',
                sprite: './games/trucker/assets/trailer-1.svg',
                color: '#ffffff',
                scale: 0.25,
                layer: 1,
                spriteOffsetX: 0,
                spriteOffsetY: 0,
                kingpinOffset: 29,
                wheelScale: 0.06,
                wheelSpacing: 11,
                axles:[
                    { x: -25, layer: 0, steer: false },
                    { x: -17, layer: 0, steer: false }
                ]
            }
        ],

        html: `
            <div class="trucker-wrap">
                <canvas id="trucker-canvas"></canvas>
                
                <div id="trucker-hud" class="trucker-hud hidden">
                    <div><kbd>T</kbd> Attach/Detach</div>
                    <div><kbd>L</kbd> Lights</div>
                    <div><kbd>M</kbd> Fold Mirrors</div>
                </div>

                <div id="trucker-menu" class="trucker-menu">
                    <div class="menu-inner">
                        <div class="menu-logo"><h1>TRUCKER</h1></div>
                        <p class="menu-sub">Select your rig</p>
                        <div class="menu-sections">
                            <div class="menu-section"><div class="menu-section-label">TRUCK</div><div class="menu-cards" id="truck-cards"></div></div>
                            <div class="menu-section"><div class="menu-section-label">TRAILER</div><div class="menu-cards" id="trailer-cards"></div></div>
                        </div>
                        <button class="menu-go" id="menu-go-btn">ROLL OUT</button>
                    </div>
                </div>
                <div id="tuner-panel" class="tuner-panel hidden"></div>
                <button id="tuner-toggle" class="tuner-toggle">&#9881;</button>
            </div>
            <style>
                .trucker-wrap { width:100%; height:100%; background:#1a1a1a; position:relative; overflow:hidden; font-family:'Jua', sans-serif; }
                #trucker-canvas { width:100%; height:100%; display:block; }

                /* ── HUD ──────────────────────────────────── */
                .trucker-hud {
                    position:absolute; top:calc(var(--scale) * 0.02); left:calc(var(--scale) * 0.02); z-index:5;
                    background:rgba(0,0,0,0.4); padding:calc(var(--scale) * 0.02); border-radius:calc(var(--scale) * 0.015);
                    color:rgba(255,255,255,0.9); font-size:calc(var(--scale) * 0.022); font-family:'Jua', sans-serif;
                    pointer-events:none; text-transform:uppercase; backdrop-filter:blur(4px);
                    box-shadow:0 4px 10px rgba(0,0,0,0.3);
                }
                .dark-mode .trucker-hud { background:rgba(255,255,255,0.1); }
                .trucker-hud.hidden { display:none; }
                .trucker-hud div { margin:calc(var(--scale) * 0.01) 0; display:flex; align-items:center; gap:8px; }
                .trucker-hud kbd {
                    background:rgba(255,255,255,0.2); padding:2px 6px;
                    border-radius:4px; border:1px solid rgba(255,255,255,0.3);
                    font-weight:900; line-height:1;
                }

                /* ── MENU ─────────────────────────────────── */
                .trucker-menu { position:absolute; inset:0; display:flex; align-items:flex-end; justify-content:center; background:rgba(0,0,0,0.3); z-index:10; transition:opacity 0.4s ease, transform 0.4s ease; padding-bottom:calc(var(--scale) * 0.05); }
                .trucker-menu.hidden { opacity:0; pointer-events:none; transform:translateY(20px); }
                .menu-inner { display:flex; flex-direction:column; align-items:center; width:92%; max-height:85%; background:#f2f2f7; border-radius:calc(var(--scale) * 0.02); box-shadow:0 10px 30px rgba(0,0,0,0.3); overflow-y:auto; padding:calc(var(--scale) * 0.04); color:#000; }
                .dark-mode .menu-inner { background:#1c1c1e; color:#eee; }
                .menu-logo h1 { font-size:calc(var(--scale) * 0.06); font-weight:900; margin:0; color:inherit; }
                .menu-sub { font-size:calc(var(--scale) * 0.025); opacity:0.6; margin-bottom:calc(var(--scale) * 0.03); }
                .menu-sections { display:flex; flex-direction:column; gap:calc(var(--scale) * 0.03); width:100%; }
                .menu-section-label { font-size:calc(var(--scale) * 0.02); font-weight:800; text-transform:uppercase; opacity:0.5; letter-spacing:0.1em; margin-bottom:8px; }
                .menu-cards { display:flex; gap:calc(var(--scale) * 0.02); overflow-x:auto; padding:10px 5px; width:100%; }
                .menu-card { flex:0 0 calc(var(--scale) * 0.22); background:rgba(0,0,0,0.05); border-radius:calc(var(--scale) * 0.015); padding:calc(var(--scale) * 0.02); cursor:pointer; transition:all 0.15s; display:flex; flex-direction:column; gap:8px; border:3px solid transparent; }
                .dark-mode .menu-card { background:rgba(255,255,255,0.05); }
                .menu-card.selected { border-color:#000; background:rgba(0,0,0,0.08); }
                .dark-mode .menu-card.selected { border-color:#eee; background:rgba(255,255,255,0.1); }
                .menu-card-preview { height:calc(var(--scale) * 0.08); display:flex; align-items:center; justify-content:center; }
                .menu-card-preview img { max-width:100%; max-height:100%; object-fit:contain; image-rendering:pixelated; }
                .menu-card-name { font-size:calc(var(--scale) * 0.022); font-weight:700; text-align:center; }
                .menu-go { margin-top:calc(var(--scale) * 0.04); font-family:inherit; font-size:calc(var(--scale) * 0.04); font-weight:900; background:#000; color:#fff; border:none; padding:calc(var(--scale) * 0.02) calc(var(--scale) * 0.1); border-radius:calc(var(--scale) * 0.05); cursor:pointer; transition:transform 0.1s; }
                .dark-mode .menu-go { background:#eee; color:#000; }
                .menu-go:active { transform:scale(0.95); }

                /* ── TUNER TOGGLE ─────────────────────────── */
                .tuner-toggle { position:absolute; top:calc(var(--scale) * 0.02); right:calc(var(--scale) * 0.02); z-index:30; width:calc(var(--scale) * 0.08); height:calc(var(--scale) * 0.08); border-radius:50%; background:rgba(255,255,255,0.9); border:none; color:#000; font-size:calc(var(--scale) * 0.04); cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 10px rgba(0,0,0,0.2); transition:transform 0.3s; }
                .tuner-toggle.open { transform:rotate(60deg); }
                .dark-mode .tuner-toggle { background:#2c2c2e; color:#eee; }

                /* ── TUNER PANEL ──────────────────────────── */
                .tuner-panel {
                    position:absolute; left:0; right:0; bottom:0; z-index:20;
                    height:55%; background:#f2f2f7;
                    border-top:2px solid rgba(0,0,0,0.12);
                    overflow:hidden;
                    display:flex; flex-direction:column;
                    transition:transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                    color:#000;
                    font-family:'Jua', sans-serif;
                }
                .dark-mode .tuner-panel { background:#1c1c1e; color:#eee; border-top-color:rgba(255,255,255,0.1); }
                .tuner-panel.hidden { transform:translateY(100%); }

                /* header */
                .tuner-header {
                    flex-shrink:0;
                    display:flex; align-items:center; gap:8px;
                    padding:10px 14px 6px;
                    border-bottom:1px solid rgba(0,0,0,0.08);
                }
                .dark-mode .tuner-header { border-bottom-color:rgba(255,255,255,0.08); }
                .tuner-title { font-size:13px; font-weight:900; letter-spacing:0.12em; text-transform:uppercase; opacity:0.5; flex:1; }
                .tuner-tabs { display:flex; gap:4px; }
                .tuner-tab {
                    padding:5px 12px; border-radius:20px; border:none;
                    background:rgba(0,0,0,0.07); font-weight:800; cursor:pointer;
                    font-family:inherit; font-size:12px; transition:all 0.15s;
                    color:inherit;
                }
                .dark-mode .tuner-tab { background:rgba(255,255,255,0.1); }
                .tuner-tab.active { background:#000; color:#fff !important; }
                .dark-mode .tuner-tab.active { background:#eee; color:#000 !important; }
                .tuner-io { display:flex; gap:4px; }
                .tuner-io-btn {
                    padding:5px 10px; border-radius:8px; border:1px solid rgba(0,0,0,0.12);
                    background:transparent; font-weight:800; cursor:pointer;
                    font-family:inherit; font-size:11px; color:inherit; transition:background 0.1s;
                }
                .dark-mode .tuner-io-btn { border-color:rgba(255,255,255,0.15); }
                .tuner-io-btn:hover { background:rgba(0,0,0,0.07); }
                .dark-mode .tuner-io-btn:hover { background:rgba(255,255,255,0.1); }
                .tuner-reset-btn {
                    padding:5px 10px; border-radius:8px; border:1px solid rgba(255,80,80,0.3);
                    background:transparent; font-weight:800; cursor:pointer;
                    font-family:inherit; font-size:11px; color:#e03030; transition:background 0.1s;
                }
                .tuner-reset-btn:hover { background:rgba(255,80,80,0.1); }

                /* scrollable body */
                .tuner-body { flex:1; overflow-y:auto; padding:8px 14px 16px; }

                /* sections */
                .tuner-section-label {
                    font-size:10px; font-weight:900; text-transform:uppercase;
                    letter-spacing:0.15em; opacity:0.4;
                    margin:14px 0 6px; padding-left:2px;
                }

                /* rows */
                .tuner-row {
                    display:grid;
                    grid-template-columns: 120px 1fr 68px;
                    align-items:center; gap:10px;
                    padding:4px 2px;
                    border-bottom:1px solid rgba(0,0,0,0.04);
                }
                .dark-mode .tuner-row { border-bottom-color:rgba(255,255,255,0.04); }
                .tuner-row-label { font-size:12px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

                /* range */
                .tuner-range {
                    -webkit-appearance:none; appearance:none;
                    height:4px; border-radius:2px; outline:none; cursor:pointer;
                    background: linear-gradient(to right, #000 0%, #000 var(--pct,50%), rgba(0,0,0,0.12) var(--pct,50%));
                    width:100%;
                }
                .dark-mode .tuner-range {
                    background: linear-gradient(to right, #eee 0%, #eee var(--pct,50%), rgba(255,255,255,0.15) var(--pct,50%));
                }
                .tuner-range::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:#000; cursor:pointer; box-shadow:0 1px 4px rgba(0,0,0,0.3); }
                .dark-mode .tuner-range::-webkit-slider-thumb { background:#eee; }

                /* number input */
                .tuner-num {
                    width:100%; text-align:right;
                    border:1px solid rgba(0,0,0,0.12); border-radius:6px;
                    background:transparent; color:inherit;
                    font-size:12px; font-weight:700; font-family:inherit;
                    padding:4px 6px; box-sizing:border-box;
                }
                .dark-mode .tuner-num { border-color:rgba(255,255,255,0.15); }
                .tuner-num:focus { outline:none; border-color:#000; }
                .dark-mode .tuner-num:focus { border-color:#eee; }

                /* color row */
                .tuner-row-color {
                    grid-template-columns: 120px 1fr 40px;
                }
                .tuner-color-swatch {
                    width:100%; height:28px; border-radius:6px; border:1px solid rgba(0,0,0,0.12);
                    cursor:pointer; overflow:hidden; position:relative;
                }
                .tuner-color-input {
                    position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%;
                }
                .tuner-color-hex {
                    width:100%; text-align:right;
                    border:1px solid rgba(0,0,0,0.12); border-radius:6px;
                    background:transparent; color:inherit;
                    font-size:10px; font-weight:700; font-family:monospace;
                    padding:4px 5px; box-sizing:border-box;
                }
                .dark-mode .tuner-color-hex { border-color:rgba(255,255,255,0.15); }

                /* axle cards */
                .tuner-axles { display:flex; flex-direction:column; gap:6px; margin-top:4px; }
                .tuner-axle-card {
                    background:rgba(0,0,0,0.05); border-radius:8px;
                    padding:8px 10px; display:flex; flex-direction:column; gap:6px;
                }
                .dark-mode .tuner-axle-card { background:rgba(255,255,255,0.06); }
                .tuner-axle-header {
                    display:flex; align-items:center; gap:8px;
                    font-size:11px; font-weight:900; text-transform:uppercase; letter-spacing:0.1em;
                }
                .tuner-axle-header span { flex:1; }
                .tuner-axle-del {
                    border:none; background:none; color:#e03030; font-size:16px;
                    cursor:pointer; line-height:1; padding:0 4px;
                }
                .tuner-axle-grid {
                    display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;
                }
                .tuner-axle-field { display:flex; flex-direction:column; gap:2px; }
                .tuner-axle-field label { font-size:10px; font-weight:700; opacity:0.5; }
                .tuner-axle-field input[type=number] {
                    width:100%; text-align:right; box-sizing:border-box;
                    border:1px solid rgba(0,0,0,0.12); border-radius:6px;
                    background:transparent; color:inherit;
                    font-size:12px; font-weight:700; font-family:inherit;
                    padding:4px 6px;
                }
                .dark-mode .tuner-axle-field input[type=number] { border-color:rgba(255,255,255,0.15); }
                .tuner-axle-field label.steer-label {
                    display:flex; align-items:center; gap:5px; cursor:pointer;
                    font-size:12px; opacity:1;
                }
                .tuner-add-axle {
                    width:100%; border:2px dashed rgba(0,0,0,0.15); border-radius:8px;
                    background:transparent; color:inherit; font-family:inherit;
                    font-size:12px; font-weight:800; padding:8px; cursor:pointer;
                    transition:background 0.1s;
                }
                .dark-mode .tuner-add-axle { border-color:rgba(255,255,255,0.15); }
                .tuner-add-axle:hover { background:rgba(0,0,0,0.05); }
                .dark-mode .tuner-add-axle:hover { background:rgba(255,255,255,0.05); }
            </style>
        `,

        init: function() {
            const app = this;
            const canvas = document.getElementById('trucker-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const menu = document.getElementById('trucker-menu');
            const tunerPanel = document.getElementById('tuner-panel');
            const tunerToggle = document.getElementById('tuner-toggle');
            const hudPanel = document.getElementById('trucker-hud');

            let width, height;
            const resize = () => { width = canvas.width = canvas.clientWidth; height = canvas.height = canvas.clientHeight; };
            window.addEventListener('resize', resize);
            resize();

            const TRUCKS = JSON.parse(JSON.stringify(this.TRUCK_RIGS));
            const TRAILERS = JSON.parse(JSON.stringify(this.TRAILER_RIGS));

            // Store original defaults for reset
            const TRUCK_DEFAULTS = JSON.parse(JSON.stringify(this.TRUCK_RIGS));
            const TRAILER_DEFAULTS = JSON.parse(JSON.stringify(this.TRAILER_RIGS));

            let activeTruck = TRUCKS[0];
            let activeTrailer = TRAILERS[0];

            let gameRunning = false;
            let truck = null, trailer = null, camera = null;
            let lastTime = performance.now();

            const images = {};
            const coloredImages = {};

            const loadImage = (src) => {
                if (!src) return Promise.resolve(null);
                if (images[src]) return Promise.resolve(images[src]);
                return new Promise(resolve => {
                    const img = new Image();
                    img.onload = () => { images[src] = img; resolve(img); };
                    img.onerror = () => { images[src] = null; resolve(null); };
                    img.src = src;
                });
            };

            const invalidateColor = (src) => {
                Object.keys(coloredImages).forEach(k => { if (k.startsWith(src)) delete coloredImages[k]; });
            };

            const getColoredImage = (src, color) => {
                if (!color || color === 'transparent') return images[src];
                const key = src + color;
                if (coloredImages[key]) return coloredImages[key];
                const img = images[src];
                if (!img || !img.naturalWidth) return null;
                const c = document.createElement('canvas');
                c.width = img.naturalWidth; c.height = img.naturalHeight;
                const tctx = c.getContext('2d');
                tctx.drawImage(img, 0, 0);
                tctx.globalCompositeOperation = 'source-atop';
                tctx.fillStyle = color;
                tctx.globalAlpha = 0.7;
                tctx.fillRect(0, 0, c.width, c.height);
                tctx.globalAlpha = 1.0;
                coloredImages[key] = c;
                return c;
            };

            const preloadAssets = async () => {
                const assets =[...TRUCKS.map(t => t.sprite), ...TRUCKS.map(t => t.mirrorSprite), ...TRAILERS.map(t => t.sprite), './games/trucker/assets/wheel.svg'];
                await Promise.all(assets.filter(Boolean).map(loadImage));
            };

            const buildMenu = () => {
                const tCards = document.getElementById('truck-cards');
                const tlCards = document.getElementById('trailer-cards');
                tCards.innerHTML = ''; tlCards.innerHTML = '';
                TRUCKS.forEach((def) => {
                    const card = document.createElement('div');
                    card.className = 'menu-card' + (activeTruck === def ? ' selected' : '');
                    card.innerHTML = `<div class="menu-card-preview"><img src="${def.sprite}"></div><div class="menu-card-name">${def.name}</div>`;
                    card.onclick = () => { document.querySelectorAll('#truck-cards .menu-card').forEach(c => c.classList.remove('selected')); card.classList.add('selected'); activeTruck = def; };
                    tCards.appendChild(card);
                });
                TRAILERS.forEach((def) => {
                    const card = document.createElement('div');
                    card.className = 'menu-card' + (activeTrailer === def ? ' selected' : '');
                    card.innerHTML = `<div class="menu-card-preview"><img src="${def.sprite}"></div><div class="menu-card-name">${def.name}</div>`;
                    card.onclick = () => { document.querySelectorAll('#trailer-cards .menu-card').forEach(c => c.classList.remove('selected')); card.classList.add('selected'); activeTrailer = def; };
                    tlCards.appendChild(card);
                });
            };

            // ── TUNER ───────────────────────────────────────────────────────────

            let tunerTab = 'truck';
            let tunerOpen = false;

            const TRUCK_PARAMS =[
                { section: 'Appearance' },
                { key: 'color',           label: 'Color',         type: 'color' },
                { key: 'scale',           label: 'Body Scale',    type: 'range', min: 0.01, max: 2, step: 0.01 },
                { key: 'wheelScale',      label: 'Wheel Scale',   type: 'range', min: 0.005, max: 0.5, step: 0.005 },
                { key: 'wheelSpacing',    label: 'Axle Width',    type: 'range', min: 1, max: 60,  step: 1 },
                { key: 'spriteOffsetX',   label: 'Sprite X',      type: 'range', min: -100, max: 100, step: 1 },
                { key: 'spriteOffsetY',   label: 'Sprite Y',      type: 'range', min: -100, max: 100, step: 1 },
                { key: 'layer',           label: 'Layer',         type: 'range', min: -5,  max: 10,  step: 1 },
                { section: 'Camera' },
                { key: 'cameraZoom',      label: 'Zoom',          type: 'range', min: 0.5, max: 15, step: 0.1 },
                { key: 'cameraFollowSpeed', label: 'Follow Speed', type: 'range', min: 0.1, max: 10,  step: 0.1 },
                { section: 'Physics' },
                { key: 'maxSpeed',        label: 'Max Speed',     type: 'range', min: 1, max: 200, step: 1 },
                { key: 'maxSteerAngle',   label: 'Steer Angle',   type: 'range', min: 0.1, max: 1.5, step: 0.05 },
                { key: 'steerSpeed',      label: 'Steer Speed',   type: 'range', min: 0.1, max: 10,  step: 0.1 },
                { key: 'accelRate',       label: 'Accel Rate',    type: 'range', min: 0.01, max: 2,  step: 0.01 },
                { key: 'brakeRate',       label: 'Brake Rate',    type: 'range', min: 0.01, max: 5,  step: 0.01 },
                { key: 'fifthWheelOffset', label: '5th Wheel',    type: 'range', min: -50, max: 50,  step: 1 },
            ];

            const TRAILER_PARAMS =[
                { section: 'Appearance' },
                { key: 'color',           label: 'Color',         type: 'color' },
                { key: 'scale',           label: 'Body Scale',    type: 'range', min: 0.01, max: 2, step: 0.01 },
                { key: 'wheelScale',      label: 'Wheel Scale',   type: 'range', min: 0.005, max: 0.5, step: 0.005 },
                { key: 'wheelSpacing',    label: 'Axle Width',    type: 'range', min: 1, max: 60,  step: 1 },
                { key: 'spriteOffsetX',   label: 'Sprite X',      type: 'range', min: -100, max: 100, step: 1 },
                { key: 'spriteOffsetY',   label: 'Sprite Y',      type: 'range', min: -100, max: 100, step: 1 },
                { key: 'layer',           label: 'Layer',         type: 'range', min: -5,  max: 10,  step: 1 },
                { section: 'Physics' },
                { key: 'kingpinOffset',   label: 'Kingpin',       type: 'range', min: 0,   max: 120, step: 1 },
            ];

            const rangePct = (val, min, max) => Math.max(0, Math.min(100, (val - min) / (max - min) * 100)).toFixed(1) + '%';

            const createRangeRow = (def, key, label, min, max, step, onchange) => {
                const row = document.createElement('div');
                row.className = 'tuner-row';

                const lbl = document.createElement('div');
                lbl.className = 'tuner-row-label';
                lbl.textContent = label;

                const range = document.createElement('input');
                range.type = 'range';
                range.className = 'tuner-range';
                range.setAttribute('min', min);
                range.setAttribute('max', max);
                range.setAttribute('step', step);
                range.value = String(def[key]);
                range.style.setProperty('--pct', rangePct(def[key], min, max));

                const num = document.createElement('input');
                num.type = 'number';
                num.className = 'tuner-num';
                num.setAttribute('min', min);
                num.setAttribute('max', max);
                num.setAttribute('step', step);
                num.value = def[key];

                let updating = false;
                const apply = (v, source) => {
                    if (updating) return;
                    updating = true;
                    const clamped = Math.min(max, Math.max(min, isNaN(v) ? min : v));
                    def[key] = clamped;
                    range.setAttribute('value', clamped);
                    range.value = String(clamped);
                    range.style.setProperty('--pct', rangePct(clamped, min, max));
                    if (source !== 'num') {
                        num.value = step < 1 ? parseFloat(clamped.toFixed(4)) : Math.round(clamped);
                    }
                    if (onchange) onchange(key, clamped, def);
                    updating = false;
                };

                range.addEventListener('input', () => apply(parseFloat(range.value), 'range'));
                num.addEventListener('change', () => apply(parseFloat(num.value), 'num'));
                num.addEventListener('input', () => {
                    const v = parseFloat(num.value);
                    if (!isNaN(v) && num.value !== '' && num.value !== '-' && !num.value.endsWith('.')) {
                        apply(v, 'num');
                    }
                });

                row.appendChild(lbl); row.appendChild(range); row.appendChild(num);
                return row;
            };

            const createColorRow = (def, key, label, onchange) => {
                const row = document.createElement('div');
                row.className = 'tuner-row tuner-row-color';

                const lbl = document.createElement('div');
                lbl.className = 'tuner-row-label';
                lbl.textContent = label;

                const swatch = document.createElement('div');
                swatch.className = 'tuner-color-swatch';
                swatch.style.background = def[key];
                const colorInput = document.createElement('input');
                colorInput.type = 'color';
                colorInput.className = 'tuner-color-input';
                colorInput.value = def[key];
                swatch.appendChild(colorInput);

                const hex = document.createElement('input');
                hex.type = 'text';
                hex.className = 'tuner-color-hex';
                hex.value = def[key];
                hex.maxLength = 7;

                const set = (v) => {
                    def[key] = v;
                    colorInput.value = v;
                    swatch.style.background = v;
                    hex.value = v;
                    if (onchange) onchange(key, v, def);
                };

                colorInput.addEventListener('input', () => set(colorInput.value));
                hex.addEventListener('change', () => {
                    const v = hex.value.trim();
                    if (/^#[0-9a-fA-F]{6}$/.test(v)) set(v);
                });

                row.appendChild(lbl); row.appendChild(swatch); row.appendChild(hex);
                return row;
            };

            const onTruckChange = (key, val, def) => {
                if (key === 'color') invalidateColor(def.sprite);
                if (truck) truck.def = activeTruck; 
            };
            const onTrailerChange = (key, val, def) => {
                if (key === 'color') invalidateColor(def.sprite);
                if (trailer) trailer.def = activeTrailer;
            };

            const buildAxleCards = (def, onchange) => {
                const container = document.createElement('div');
                container.className = 'tuner-axles';

                def.axles.forEach((axle, i) => {
                    const card = document.createElement('div');
                    card.className = 'tuner-axle-card';

                    const header = document.createElement('div');
                    header.className = 'tuner-axle-header';
                    const headerTitle = document.createElement('span');
                    headerTitle.textContent = `Axle ${i + 1}`;
                    const delBtn = document.createElement('button');
                    delBtn.className = 'tuner-axle-del';
                    delBtn.textContent = '×';
                    delBtn.title = 'Delete axle';
                    delBtn.onclick = () => {
                        def.axles.splice(i, 1);
                        renderTunerBody();
                    };
                    header.appendChild(headerTitle); header.appendChild(delBtn);
                    card.appendChild(header);

                    const grid = document.createElement('div');
                    grid.className = 'tuner-axle-grid';

                    const numField = (lbl, key, step) => {
                        const f = document.createElement('div');
                        f.className = 'tuner-axle-field';
                        const label = document.createElement('label');
                        label.textContent = lbl;
                        const inp = document.createElement('input');
                        inp.type = 'number'; inp.value = axle[key]; inp.step = step;
                        inp.addEventListener('input', () => { axle[key] = parseFloat(inp.value); if (onchange) onchange(); });
                        f.appendChild(label); f.appendChild(inp);
                        return f;
                    };

                    grid.appendChild(numField('Offset X', 'x', 1));
                    grid.appendChild(numField('Layer', 'layer', 1));

                    const steerField = document.createElement('div');
                    steerField.className = 'tuner-axle-field';
                    const steerLabel = document.createElement('label');
                    steerLabel.className = 'steer-label';
                    const steerCheck = document.createElement('input');
                    steerCheck.type = 'checkbox'; steerCheck.checked = axle.steer;
                    steerCheck.onchange = (e) => { axle.steer = e.target.checked; if (onchange) onchange(); };
                    steerLabel.appendChild(steerCheck);
                    steerLabel.appendChild(document.createTextNode('Steered'));
                    steerField.appendChild(document.createElement('label')); 
                    steerField.appendChild(steerLabel);
                    grid.appendChild(steerField);

                    card.appendChild(grid);
                    container.appendChild(card);
                });

                const addBtn = document.createElement('button');
                addBtn.className = 'tuner-add-axle';
                addBtn.textContent = '+ Add Axle';
                addBtn.onclick = () => { def.axles.push({ x: 0, layer: 0, steer: false }); renderTunerBody(); };
                container.appendChild(addBtn);

                return container;
            };

            const renderTunerBody = () => {
                let body = tunerPanel.querySelector('.tuner-body');
                if (!body) return; 

                body.innerHTML = '';

                const isT = tunerTab === 'truck';
                const def = isT ? activeTruck : activeTrailer;
                const params = isT ? TRUCK_PARAMS : TRAILER_PARAMS;
                const onchange = isT ? onTruckChange : onTrailerChange;

                params.forEach(p => {
                    if (p.section) {
                        const s = document.createElement('div');
                        s.className = 'tuner-section-label';
                        s.textContent = p.section;
                        body.appendChild(s);
                    } else if (p.type === 'color') {
                        body.appendChild(createColorRow(def, p.key, p.label, onchange));
                    } else if (p.type === 'range') {
                        body.appendChild(createRangeRow(def, p.key, p.label, p.min, p.max, p.step, onchange));
                    }
                });

                const axleSection = document.createElement('div');
                axleSection.className = 'tuner-section-label';
                axleSection.textContent = 'Axles';
                body.appendChild(axleSection);
                body.appendChild(buildAxleCards(def, () => { if (isT) onTruckChange(); else onTrailerChange(); }));
            };

            const buildTuner = () => {
                tunerPanel.innerHTML = '';

                const header = document.createElement('div');
                header.className = 'tuner-header';

                const title = document.createElement('div');
                title.className = 'tuner-title';
                title.textContent = 'Tuner';

                const tabs = document.createElement('div');
                tabs.className = 'tuner-tabs';

                const tabTruck = document.createElement('button');
                tabTruck.className = 'tuner-tab' + (tunerTab === 'truck' ? ' active' : '');
                tabTruck.textContent = 'Truck';
                tabTruck.onclick = () => { tunerTab = 'truck'; buildTuner(); };

                const tabTrailer = document.createElement('button');
                tabTrailer.className = 'tuner-tab' + (tunerTab === 'trailer' ? ' active' : '');
                tabTrailer.textContent = 'Trailer';
                tabTrailer.onclick = () => { tunerTab = 'trailer'; buildTuner(); };

                tabs.appendChild(tabTruck); tabs.appendChild(tabTrailer);

                const io = document.createElement('div');
                io.className = 'tuner-io';

                const importBtn = document.createElement('button');
                importBtn.className = 'tuner-io-btn';
                importBtn.textContent = 'Import';
                importBtn.onclick = () => {
                    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
                    input.onchange = (e) => {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            try {
                                const data = JSON.parse(ev.target.result);
                                const def = tunerTab === 'truck' ? activeTruck : activeTrailer;
                                if (data.color && data.color !== def.color) invalidateColor(def.sprite);
                                Object.assign(def, data);
                                if (truck) truck.def = activeTruck;
                                if (trailer) trailer.def = activeTrailer;
                                buildTuner();
                            } catch(err) { alert('Invalid JSON: ' + err.message); }
                        };
                        reader.readAsText(e.target.files[0]);
                    };
                    input.click();
                };

                const exportBtn = document.createElement('button');
                exportBtn.className = 'tuner-io-btn';
                exportBtn.textContent = 'Export';
                exportBtn.onclick = () => {
                    const def = tunerTab === 'truck' ? activeTruck : activeTrailer;
                    const blob = new Blob([JSON.stringify(def, null, 2)], { type: 'application/json' });
                    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${def.id}.json`; a.click();
                };

                const resetBtn = document.createElement('button');
                resetBtn.className = 'tuner-reset-btn';
                resetBtn.textContent = 'Reset';
                resetBtn.onclick = () => {
                    if (!confirm('Reset to defaults?')) return;
                    if (tunerTab === 'truck') {
                        const orig = TRUCK_DEFAULTS[TRUCKS.indexOf(activeTruck)] || TRUCK_DEFAULTS[0];
                        invalidateColor(activeTruck.sprite);
                        Object.assign(activeTruck, JSON.parse(JSON.stringify(orig)));
                        if (truck) truck.def = activeTruck;
                    } else {
                        const orig = TRAILER_DEFAULTS[TRAILERS.indexOf(activeTrailer)] || TRAILER_DEFAULTS[0];
                        invalidateColor(activeTrailer.sprite);
                        Object.assign(activeTrailer, JSON.parse(JSON.stringify(orig)));
                        if (trailer) trailer.def = activeTrailer;
                    }
                    buildTuner();
                };

                io.appendChild(importBtn); io.appendChild(exportBtn); io.appendChild(resetBtn);

                header.appendChild(title); header.appendChild(tabs); header.appendChild(io);
                tunerPanel.appendChild(header);

                const body = document.createElement('div');
                body.className = 'tuner-body';
                tunerPanel.appendChild(body);

                renderTunerBody();
            };

            tunerToggle.onclick = () => {
                tunerOpen = !tunerOpen;
                tunerPanel.classList.toggle('hidden', !tunerOpen);
                tunerToggle.classList.toggle('open', tunerOpen);
                if (tunerOpen) buildTuner();
            };

            // ── GAME ────────────────────────────────────────────────────────────

            app._keyHandler = (e) => {
                if (!gameRunning) return;
                const key = e.key.toLowerCase();
                if (key === 'l' && truck) truck.lightsOn = !truck.lightsOn;
                if (key === 'm' && truck) truck.mirrorsFolded = !truck.mirrorsFolded;
                if (key === 't' && truck && trailer) {
                    if (truck.trailerAttached) {
                        truck.trailerAttached = false;
                    } else {
                        const fwX = truck.x + Math.cos(truck.angle) * truck.def.fifthWheelOffset;
                        const fwY = truck.y + Math.sin(truck.angle) * truck.def.fifthWheelOffset;
                        const dist = Math.hypot(fwX - trailer.x, fwY - trailer.y);
                        // Require to be close to the pin offset to re-attach
                        if (Math.abs(dist - trailer.def.kingpinOffset) < 12) {
                            truck.trailerAttached = true;
                        }
                    }
                }
            };
            window.addEventListener('keydown', app._keyHandler);

            const initGame = () => {
                truck = {
                    x: 0, y: 0, angle: 0, speed: 0, targetSpeed: 0,
                    steerInput: 0, steerAngle: 0, sliderVisualPos: 50,
                    def: activeTruck,
                    lightsOn: false, mirrorsFolded: false, trailerAttached: true
                };
                trailer = { x: -activeTrailer.kingpinOffset, y: 0, angle: 0, def: activeTrailer };
                camera = { x: 0, y: 0, zoom: activeTruck.cameraZoom };
                
                if (hudPanel) hudPanel.classList.remove('hidden');

                gameRunning = true; menu.classList.add('hidden'); lastTime = performance.now(); loop();
            };

            const loop = () => {
                if (!gameRunning) return;
                const now = performance.now(); const dt = Math.min(0.1, (now - lastTime) / 1000); lastTime = now;
                const def = truck.def;
                camera.zoom += (def.cameraZoom - camera.zoom) * 2 * dt;
                truck.steerAngle += (truck.steerInput * def.maxSteerAngle - truck.steerAngle) * def.steerSpeed * dt;
                const topSpeed = def.maxSpeed / 6.48;
                const accel = truck.targetSpeed > truck.speed ? def.accelRate : def.brakeRate;
                truck.speed += (truck.targetSpeed - truck.speed) * accel * dt;
                truck.sliderVisualPos += (((truck.targetSpeed / topSpeed) * 50 + 50) - truck.sliderVisualPos) * 10 * dt;
                if (Math.abs(truck.speed) > 0.01) truck.angle += (truck.speed / 40) * Math.tan(truck.steerAngle) * dt;
                
                truck.x += Math.cos(truck.angle) * truck.speed * dt;
                truck.y += Math.sin(truck.angle) * truck.speed * dt;
                
                // Trailer connection physics
                const fwX = truck.x + Math.cos(truck.angle) * def.fifthWheelOffset;
                const fwY = truck.y + Math.sin(truck.angle) * def.fifthWheelOffset;
                let dx = fwX - trailer.x;
                let dy = fwY - trailer.y;
                let dist = Math.hypot(dx, dy);

                // Prevent math singularities when exactly overlapping
                if (dist < 0.001) { dx = 0.01; dy = 0; dist = 0.01; }

                if (truck.trailerAttached) {
                    // Tightly bind to exactly the kingpin offset when attached
                    if (Math.abs(dist - trailer.def.kingpinOffset) > 0.01) {
                        const lerp = (dist - trailer.def.kingpinOffset) / dist;
                        trailer.x += dx * lerp;
                        trailer.y += dy * lerp;
                    }
                    trailer.angle = Math.atan2(fwY - trailer.y, fwX - trailer.x);
                } else {
                    // Only push it out if the truck backs into it (closer than kingpinOffset)
                    if (dist < trailer.def.kingpinOffset) {
                        const lerp = (dist - trailer.def.kingpinOffset) / dist;
                        trailer.x += dx * lerp;
                        trailer.y += dy * lerp;
                        trailer.angle = Math.atan2(fwY - trailer.y, fwX - trailer.x);
                    }
                }

                camera.x += (truck.x - camera.x) * def.cameraFollowSpeed * dt;
                camera.y += (truck.y - camera.y) * def.cameraFollowSpeed * dt;

                document.querySelectorAll('.steering-wheel').forEach(w => w.style.transform = `rotate(${(truck.steerAngle / def.maxSteerAngle) * Math.PI * 2.5}rad)`);
                document.querySelectorAll('.slider-handle').forEach(h => { h.style.top = (100 - truck.sliderVisualPos) + '%'; const f = h.closest('.slider-track')?.querySelector('.slider-fill'); if (f) f.style.height = truck.sliderVisualPos + '%'; });

                ctx.clearRect(0, 0, width, height); ctx.save(); ctx.translate(width / 2, height / 2); ctx.scale(camera.zoom, camera.zoom); ctx.translate(-camera.x, -camera.y);
                const gS = 100;
                const sx = Math.floor((camera.x - (width / 2) / camera.zoom) / gS) * gS;
                const ex = Math.ceil((camera.x + (width / 2) / camera.zoom) / gS) * gS;
                const sy = Math.floor((camera.y - (height / 2) / camera.zoom) / gS) * gS;
                const ey = Math.ceil((camera.y + (height / 2) / camera.zoom) / gS) * gS;
                for (let x = sx; x <= ex; x += gS) for (let y = sy; y <= ey; y += gS) { ctx.fillStyle = ((Math.floor(x / gS) + Math.floor(y / gS)) % 2 === 0) ? '#1a1a1a' : '#1e1e1e'; ctx.fillRect(x, y, gS, gS); }

                const ren =[];
                const addAxles = (e, d) => d.axles.forEach(a => {
                    [-d.wheelSpacing / 2, d.wheelSpacing / 2].forEach(sideY => {
                        ren.push({ layer: a.layer, type: 'wheel', x: e.x + Math.cos(e.angle) * a.x - Math.sin(e.angle) * sideY, y: e.y + Math.sin(e.angle) * a.x + Math.cos(e.angle) * sideY, angle: e.angle + (a.steer ? truck.steerAngle : 0), scale: d.wheelScale, sprite: './games/trucker/assets/wheel.svg' });
                    });
                });

                if (truck.lightsOn) {
                    ren.push({ layer: 0, type: 'lights', x: truck.x, y: truck.y, angle: truck.angle });
                }

                ren.push({ layer: truck.def.layer, type: 'body', x: truck.x, y: truck.y, angle: truck.angle, def: truck.def });
                ren.push({ layer: trailer.def.layer, type: 'body', x: trailer.x, y: trailer.y, angle: trailer.angle, def: trailer.def });
                
                if (truck.def.mirrorSprite) {
                    const mx = 7.5;
                    const baseMy = 6;
                    [-baseMy, baseMy].forEach(my => {
                        const actualMy = truck.mirrorsFolded ? (my > 0 ? baseMy * 0.4 : -baseMy * 0.4) : my;
                        const foldAngle = truck.mirrorsFolded ? (my > 0 ? -Math.PI/6 : Math.PI/6) : 0;
                        ren.push({
                            layer: truck.def.layer + 1,
                            type: 'mirror',
                            x: truck.x + Math.cos(truck.angle) * mx - Math.sin(truck.angle) * actualMy,
                            y: truck.y + Math.sin(truck.angle) * mx + Math.cos(truck.angle) * actualMy,
                            angle: truck.angle + foldAngle,
                            def: truck.def
                        });
                    });
                }
                
                addAxles(truck, truck.def); addAxles(trailer, trailer.def);
                ren.sort((a, b) => a.layer - b.layer).forEach(r => {
                    ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.angle);
                    if (r.type === 'wheel') {
                        const img = images[r.sprite];
                        if (img) ctx.drawImage(img, -img.naturalWidth * r.scale / 2, -img.naturalHeight * r.scale / 2, img.naturalWidth * r.scale, img.naturalHeight * r.scale);
                    } else if (r.type === 'lights') {
                        const grad = ctx.createLinearGradient(10, 0, 150, 0);
                        grad.addColorStop(0, 'rgba(255, 240, 150, 0.6)');
                        grad.addColorStop(1, 'rgba(255, 240, 150, 0)');
                        ctx.fillStyle = grad;
                        ctx.beginPath(); ctx.moveTo(10, -8); ctx.lineTo(150, -60); ctx.lineTo(150, -5); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(10, 8); ctx.lineTo(150, 5); ctx.lineTo(150, 60); ctx.fill();
                    } else {
                        const img = getColoredImage(r.type === 'body' ? r.def.sprite : r.def.mirrorSprite, r.def.color);
                        if (img) {
                            const s = r.type === 'body' ? r.def.scale : r.def.scale * 0.5;
                            ctx.drawImage(img, (r.type === 'body' ? r.def.spriteOffsetX : 0) - img.width * s / 2, (r.type === 'body' ? r.def.spriteOffsetY : 0) - img.height * s / 2, img.width * s, img.height * s);
                        }
                    }
                    ctx.restore();
                });
                ctx.restore(); app._anim = requestAnimationFrame(loop);
            };

            window.addEventListener('sliderInput', (e) => { if (e.detail.type === 'throttle' && truck) truck.targetSpeed = (e.detail.value - 50) / 50 * (truck.def.maxSpeed / 6.48); });
            window.addEventListener('steeringInput', (e) => { if (truck) truck.steerInput = e.detail.value; });
            preloadAssets().then(() => { buildMenu(); document.getElementById('menu-go-btn').onclick = initGame; });
        },
        cleanup: function() {
            if (this._anim) cancelAnimationFrame(this._anim);
            if (this._keyHandler) window.removeEventListener('keydown', this._keyHandler);
        }
    });
})();