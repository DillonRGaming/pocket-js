window.apps.push({
    id: 'golfer',
    name: 'Putt Putt GOLF',
    description: 'A cozy top-down mini golf experience.',
    thumbnail: 'https://img.icons8.com/color/512/golf-ball.png',
    hidden: false,
    color: '#76b947',
    inputs: { left: 'joystick', right: 'buttons' },
    html: `
        <div class="golfer-app">
            <div class="golfer-ui">
                <div class="ui-item"><span class="ui-label">LEVEL</span><span class="ui-value" id="golfer-level-num">1</span></div>
                <div class="ui-item"><span class="ui-label">STROKES</span><span class="ui-value" id="golfer-strokes">0</span></div>
                <div class="ui-item"><span class="ui-label">PAR</span><span class="ui-value" id="golfer-par">3</span></div>
            </div>
            <canvas id="golfer-canvas"></canvas>
            <div class="golfer-overlay" id="golfer-overlay"><div class="golfer-msg">Nice Shot!</div></div>
        </div>
        <style>
            .golfer-app { width: 100%; height: 100%; background: #79C51C; display: flex; flex-direction: column; font-family: 'Jua', sans-serif; overflow: hidden; position: relative; }
            .golfer-ui { position: absolute; top: calc(var(--scale) * 0.03); left: 50%; transform: translateX(-50%); display: flex; gap: calc(var(--scale) * 0.04); background: rgba(255, 255, 255, 0.9); padding: calc(var(--scale) * 0.01) calc(var(--scale) * 0.04); border-radius: calc(var(--scale) * 0.06); box-shadow: 0 4px 15px rgba(0,0,0,0.1); z-index: 10; border: 2px solid #79C51C; backdrop-filter: blur(5px); }
            .ui-item { display: flex; flex-direction: column; align-items: center; min-width: calc(var(--scale) * 0.08); }
            .ui-label { font-size: calc(var(--scale) * 0.014); color: #888; letter-spacing: 0.1em; font-weight: 800; }
            .ui-value { font-size: calc(var(--scale) * 0.03); color: #2d5a27; font-weight: bold; }
            #golfer-canvas { width: 100%; height: 100%; touch-action: none; }
            .golfer-overlay { position: absolute; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); z-index: 20; backdrop-filter: blur(2px); }
            .golfer-msg { background: white; padding: 20px 40px; border-radius: 20px; font-size: 32px; color: #76b947; box-shadow: 0 10px 0 #5a8d36; }
        </style>
    `,
    init: function(testLevelData = null) {
        const canvas = document.getElementById('golfer-canvas');
        canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
        let currentLevelIdx = 0, levels =[];
        const engine = new window.GolferEngine(canvas, { mode: 'play', level: testLevelData, onLevelComplete: () => { if (testLevelData) engine.resetBall(); else { currentLevelIdx++; loadLevel(); } } });
        async function fetchLevels() { if (testLevelData) return; let idx = 1; while (true) { try { const res = await fetch(`games/beta/golfer/levels/level${idx}.json`); if (!res.ok) break; levels.push(await res.json()); idx++; } catch (e) { break; } } loadLevel(); }
        function loadLevel() { 
            if (levels.length > 0) { 
                engine.level = levels[currentLevelIdx % levels.length]; 
                // Defaults for safety
                if (!engine.level.tiles) engine.level.tiles = [{x:0, y:0, w:10, h:10}];
                if (!engine.level.gridUnit) engine.level.gridUnit = 60;
                engine.resetBall(); 
                document.getElementById('golfer-level-num').textContent = currentLevelIdx + 1; 
                document.getElementById('golfer-par').textContent = engine.level.par || 3; 
                engine.strokes = 0; 
                document.getElementById('golfer-strokes').textContent = '0'; 
            } 
        }
        function loop() { engine.update(); engine.draw(); this._anim = requestAnimationFrame(loop.bind(this)); }
        this._joystickHandler = (e) => { if (engine.isMoving || engine.isShrinking) return; const dist = Math.hypot(e.detail.x, e.detail.y); if (dist > 0.05) { engine.aiming.active = true; engine.aiming.dx = e.detail.x; engine.aiming.dy = e.detail.y; engine.power = dist * 100; } else { engine.aiming.active = false; engine.power = 0; } };
        this._joystickReleaseHandler = () => { if (engine.isMoving || engine.isShrinking || engine.power < 5) return; const norm = Math.hypot(engine.aiming.dx, engine.aiming.dy); engine.ball.vx = -(engine.aiming.dx / norm) * (engine.power / 5); engine.ball.vy = -(engine.aiming.dy / norm) * (engine.power / 5); engine.strokes++; document.getElementById('golfer-strokes').textContent = engine.strokes; engine.power = 0; engine.aiming.active = false; if (window.playSfx) window.playSfx('assets/move-menu.mp3', 0.5); };
        window.addEventListener('joystickInput', this._joystickHandler);
        window.addEventListener('joystickRelease', this._joystickReleaseHandler);
        fetchLevels(); loop.call(this);
    },
    cleanup: function() { cancelAnimationFrame(this._anim); window.removeEventListener('joystickInput', this._joystickHandler); window.removeEventListener('joystickRelease', this._joystickReleaseHandler); }
});