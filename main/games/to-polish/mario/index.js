window.apps.push({
    id: 'mario',
    name: 'Super Mario Bros',
    description: 'A recreation of the classic Super Mario Bros with a level builder.',
    thumbnail: 'games/to-polish/mario/assets/mario-thumb.png',
    color: '#e45d22',
    hidden: true,
    inputs: { left: 'dpad', right: 'buttons' },
    html: `
        <div class="mario-app">
            <div class="mario-ui">
                <div class="ui-item"><span class="ui-label">MARIO</span><span class="ui-value">000000</span></div>
                <div class="ui-item"><span class="ui-label">COINS</span><span class="ui-value">x00</span></div>
                <div class="ui-item"><span class="ui-label">WORLD</span><span class="ui-value">1-1</span></div>
                <div class="ui-item"><span class="ui-label">TIME</span><span class="ui-value">400</span></div>
            </div>
            <canvas id="mario-canvas"></canvas>
            <div class="mario-overlay" id="mario-overlay"><div class="mario-msg">GAME OVER</div></div>
        </div>
        <style>
            .mario-app { width: 100%; height: 100%; background: #5c94fc; display: flex; flex-direction: column; font-family: 'Jua', sans-serif; overflow: hidden; position: relative; }
            .mario-ui { position: absolute; top: calc(var(--scale) * 0.02); left: 0; width: 100%; display: flex; justify-content: space-around; padding: 0 calc(var(--scale) * 0.04); z-index: 10; color: white; text-shadow: 2px 2px #000; }
            .ui-item { display: flex; flex-direction: column; align-items: center; }
            .ui-label { font-size: calc(var(--scale) * 0.018); letter-spacing: 0.1em; font-weight: 800; }
            .ui-value { font-size: calc(var(--scale) * 0.025); font-weight: bold; }
            #mario-canvas { width: 100%; height: 100%; image-rendering: pixelated; }
            .mario-overlay { position: absolute; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); z-index: 20; backdrop-filter: blur(2px); }
            .mario-msg { font-size: 48px; color: white; text-shadow: 4px 4px #000; }
        </style>
    `,
    init: function(testLevelData = null) {
        const canvas = document.getElementById('mario-canvas');
        canvas.width = 256; canvas.height = 240; // NES resolution
        
        const engine = new window.MarioEngine(canvas, { mode: 'play', level: testLevelData });
        
        function loop() {
            engine.update();
            engine.draw();
            this._anim = requestAnimationFrame(loop.bind(this));
        }
        
        this._inputHandler = (e) => {
            const action = e.detail.direction || e.detail.action;
            const isPressed = e.type === 'dpadHeld' || e.type === 'appInput'; // simplified
            engine.handleInput(action, true);
        };
        
        this._releaseHandler = (e) => {
            const action = e.detail.direction || e.detail.action;
            engine.handleInput(action, false);
        };

        window.addEventListener('dpadHeld', this._inputHandler);
        window.addEventListener('dpadRelease', this._releaseHandler);
        window.addEventListener('appInput', this._inputHandler);
        
        loop.call(this);
    },
    cleanup: function() {
        cancelAnimationFrame(this._anim);
        window.removeEventListener('dpadHeld', this._inputHandler);
        window.removeEventListener('dpadRelease', this._releaseHandler);
        window.removeEventListener('appInput', this._inputHandler);
    }
});
