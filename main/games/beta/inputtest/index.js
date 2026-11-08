window.apps.push({
    id: 'inputtest',
    name: 'Input Tester',
    description: 'Test all virtual controller inputs. View all inputs and toggle left/right mode.',
    thumbnail: './assets/pocket.js.png',
    hidden: false,
    color: '#6e8efb',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M20,6H4V4H20V6M20,10H4V8H20V10M20,14H4V12H20V14M20,18H4V16H20V18Z"/>
    </svg>`,
    inputs: {
        left: 'dpad',
        right: 'buttons'
    },
    html: `
        <div class="it-wrap">
            <div class="it-header">
                <div class="it-title">Input Tester</div>
                <div class="it-toggle-mode" id="it-toggle-mode">
                    <span class="it-mode-label">Left:</span>
                    <span class="it-mode-value" id="it-left-name">D-Pad</span>
                    <span class="it-mode-divider">|</span>
                    <span class="it-mode-label">Right:</span>
                    <span class="it-mode-value" id="it-right-name">Buttons</span>
                </div>
                <div class="it-hint">Press N to switch inputs</div>
            </div>
            
            <div class="it-all-inputs">
                <div class="it-input-col it-left-col" id="it-left-col">
                    <div class="it-input-label">LEFT</div>
                    <div class="it-input-display" id="it-left-display"></div>
                </div>
                <div class="it-input-col it-right-col" id="it-right-col">
                    <div class="it-input-label">RIGHT</div>
                    <div class="it-input-display" id="it-right-display"></div>
                </div>
            </div>

            <div class="it-menu">
                <div class="it-menu-title">Switch Inputs (N or tap to toggle)</div>
                <div class="it-menu-grid" id="it-menu-grid"></div>
            </div>

            <div class="it-stats">
                <div id="it-stat-action">Press any input</div>
                <div id="it-stat-value" style="opacity: 0.7; font-size: calc(var(--scale) * 0.018);">Use physical controls or tap on-screen</div>
            </div>
        </div>
        <style>
            .it-wrap {
                width: 100%; height: 100%;
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                overflow: hidden; font-family: 'Jua', sans-serif;
                color: white; position: relative;
            }

            .it-header {
                position: absolute; top: calc(var(--scale) * 0.02);
                left: 50%; transform: translateX(-50%);
                text-align: center; z-index: 10;
            }
            .it-title { font-size: calc(var(--scale) * 0.045); font-weight: bold; color: #6e8efb; text-shadow: 0 2px 10px rgba(110,142,251,0.5); margin-bottom: 5px; }
            .it-toggle-mode { 
                background: rgba(255,255,255,0.1); padding: 8px 20px; border-radius: 20px;
                font-size: calc(var(--scale) * 0.022); backdrop-filter: blur(10px);
                display: flex; align-items: center; gap: 8px;
            }
            .it-mode-label { opacity: 0.7; }
            .it-mode-value { color: #6e8efb; font-weight: bold; }
            .it-mode-divider { opacity: 0.4; }
            .it-hint { font-size: calc(var(--scale) * 0.016); opacity: 0.5; margin-top: 8px; }

            .it-all-inputs {
                display: flex; gap: calc(var(--scale) * 0.1); width: 90%;
                justify-content: center; align-items: center;
            }
            .it-input-col {
                flex: 1; max-width: 45%;
                display: flex; flex-direction: column; align-items: center;
            }
            .it-input-label {
                font-size: calc(var(--scale) * 0.025); opacity: 0.6; margin-bottom: 10px;
                letter-spacing: 2px;
            }
            .it-input-display {
                width: 100%; aspect-ratio: 1; max-height: calc(var(--scale) * 0.35);
                display: flex; align-items: center; justify-content: center;
                background: rgba(255,255,255,0.05); border-radius: 15px;
                border: 2px solid rgba(110,142,251,0.3); overflow: hidden;
            }
            .it-input-display > div { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

            .it-menu {
                position: absolute; top: calc(var(--scale) * 0.02);
                left: 50%; transform: translateX(-50%);
                background: rgba(0,0,0,0.85);
                padding: calc(var(--scale) * 0.02);
                border-radius: calc(var(--scale) * 0.02);
                backdrop-filter: blur(15px);
                z-index: 100; width: 85%; max-width: 600px;
                display: none; border: 1px solid rgba(110,142,251,0.3);
            }
            .it-menu.visible { display: block; }
            .it-menu-title { font-size: calc(var(--scale) * 0.022); text-align: center; margin-bottom: 12px; color: #6e8efb; }
            .it-menu-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
            .it-menu-item {
                background: rgba(255,255,255,0.08);
                padding: 12px 8px; border-radius: 10px; font-size: calc(var(--scale) * 0.018);
                text-align: center; cursor: pointer; transition: all 0.2s;
                border: 2px solid transparent; color: white;
            }
            .it-menu-item.active { background: #6e8efb; border-color: white; }
            .it-menu-item:hover { background: rgba(255,255,255,0.2); }

            .it-stats {
                position: absolute; bottom: calc(var(--scale) * 0.03);
                left: 50%; transform: translateX(-50%);
                text-align: center; font-size: calc(var(--scale) * 0.025);
                text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                background: rgba(0,0,0,0.4); padding: 8px 20px; border-radius: 25px;
            }
        </style>
    `,
    init: function() {
        const statAction = document.getElementById('it-stat-action');
        const menu = document.getElementById('it-menu-grid');
        const leftDisplay = document.getElementById('it-left-display');
        const rightDisplay = document.getElementById('it-right-display');
        const leftName = document.getElementById('it-left-name');
        const rightName = document.getElementById('it-right-name');
        
        const allInputTypes = [
            { type: 'dpad', left: 'D-Pad', right: 'D-Pad' },
            { type: 'buttons', left: 'Buttons', right: 'Buttons' },
            { type: 'joystick', left: 'Joystick', right: 'Joystick' },
            { type: 'quad_buttons', left: 'Quad', right: 'Quad' },
            { type: 'large_button', left: 'Large', right: 'Large' },
            { type: 'slider', left: 'Slider', right: 'Slider' },
            { type: 'steering', left: 'Steering', right: 'Steering' },
            { type: 'trackpad', left: 'Trackpad', right: 'Trackpad' },
            { type: 'winder', left: 'Winder', right: 'Winder' },
            { type: 'dpad', left: 'D-Pad', right: 'Buttons' }
        ];

        let currentLeft = 'dpad';
        let currentRight = 'buttons';
        let menuOpen = false;
        let sideSelecting = 'left';

        const inputConfigs = {
            dpad: '<div class="dpad-module" style="transform: scale(0.6);"><svg class="dpad-cross" viewBox="0 0 669 669" fill="none"><path d="M448.769 157.231C448.769 192.025 476.975 220.231 511.769 220.231H606C640.794 220.231 669 248.438 669 283.231V385.765C669 420.559 640.794 448.765 606 448.765H511.769C476.975 448.765 448.769 476.971 448.769 511.765V606C448.769 640.794 420.562 669 385.769 669H283.235C248.441 669 220.235 640.794 220.235 606V511.765C220.235 476.971 192.029 448.765 157.235 448.765H63C28.2061 448.765 0 420.559 0 385.765V283.231C0 248.438 28.2061 220.231 63 220.231H157.235C192.029 220.231 220.235 192.025 220.235 157.231V63C220.235 28.2061 248.441 0 283.235 0H385.769C420.562 0 448.769 28.2061 448.769 63V157.231Z" fill="var(--btn-container)" /></svg><div class="dpad-btn dpad-up" data-action="up" style="position:absolute;top:5%;left:50%;transform:translateX(-50%);"><svg viewBox="0 0 239 152"><path d="M0 35.0016C0 15.6718 15.6698 0.00185387 34.9996 0.0016159L153.641 0.000155292C161.794 5.49237e-05 169.691 2.84599 175.969 8.0468L225.462 49.0456C242.359 63.0424 242.359 88.9555 225.462 102.952L175.969 143.951C169.691 149.152 161.794 151.998 153.642 151.998L35.0004 152C15.6703 152 0 136.33 0 117V35.0016Z" fill="var(--btn-color)" /></svg></div><div class="dpad-btn dpad-down" data-action="down" style="position:absolute;bottom:5%;left:50%;transform:translateX(-50%);"><svg viewBox="0 0 239 152"><path d="M0 35.0016C0 15.6718 15.6698 0.00185387 34.9996 0.0016159L153.641 0.000155292C161.794 5.49237e-05 169.691 2.84599 175.969 8.0468L225.462 49.0456C242.359 63.0424 242.359 88.9555 225.462 102.952L175.969 143.951C169.691 149.152 161.794 151.998 153.642 151.998L35.0004 152C15.6703 152 0 136.33 0 117V35.0016Z" fill="var(--btn-color)" /></svg></div><div class="dpad-btn dpad-left" data-action="left" style="position:absolute;left:5%;top:50%;transform:translateY(-50%);"><svg viewBox="0 0 239 152"><path d="M0 35.0016C0 15.6718 15.6698 0.00185387 34.9996 0.0016159L153.641 0.000155292C161.794 5.49237e-05 169.691 2.84599 175.969 8.0468L225.462 49.0456C242.359 63.0424 242.359 88.9555 225.462 102.952L175.969 143.951C169.691 149.152 161.794 151.998 153.642 151.998L35.0004 152C15.6703 152 0 136.33 0 117V35.0016Z" fill="var(--btn-color)" /></svg></div><div class="dpad-btn dpad-right" data-action="right" style="position:absolute;right:5%;top:50%;transform:translateY(-50%);"><svg viewBox="0 0 239 152"><path d="M0 35.0016C0 15.6718 15.6698 0.00185387 34.9996 0.0016159L153.641 0.000155292C161.794 5.49237e-05 169.691 2.84599 175.969 8.0468L225.462 49.0456C242.359 63.0424 242.359 88.9555 225.462 102.952L175.969 143.951C169.691 149.152 161.794 151.998 153.642 151.998L35.0004 152C15.6703 152 0 136.33 0 117V35.0016Z" fill="var(--btn-color)" /></svg></div></div>',
            buttons: '<div class="action-module" style="transform: scale(0.6);"><svg class="action-bg" viewBox="0 0 711 683"><path d="M664.871 223.853C673.822 134.473 608.621 54.7595 519.241 45.8087C474.221 41.3003 429.358 55.7484 395.43 85.6818L102.272 344.324C70.5335 372.326 50.5526 411.289 46.3351 453.404L45.8258 458.489C36.875 547.87 102.076 627.583 191.456 636.533C236.476 641.042 281.34 626.594 315.268 596.66L608.425 338.019C640.164 310.017 660.144 271.053 664.362 228.938L664.871 223.853Z" fill="var(--btn-container)" stroke="var(--btn-container)" stroke-width="90" /></svg><div class="action-btn btn-top-right" data-action="a" style="position:absolute;top:25%;right:20%;"><span class="btn-label">A</span></div><div class="action-btn btn-bottom-left" data-action="b" style="position:absolute;bottom:25%;left:20%;"><span class="btn-label">B</span></div></div>',
            joystick: '<div class="joystick-module" style="transform: scale(0.6); width:60%; aspect-ratio:1/1; position:relative;"><div style="width:100%;height:100%;position:relative;"><svg width="100%" height="100%" viewBox="0 0 757 757"><circle cx="378.5" cy="378.5" r="378.5" fill="var(--btn-container)"/></svg><div style="width:48%;height:48%;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:var(--btn-color);border-radius:50%;"></div></div></div>',
            quad_buttons: '<div class="quad-btn-module" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;"><svg class="quad-bg" viewBox="0 0 400 400" style="position:absolute;width:100%;height:100%;"><circle cx="200" cy="200" r="200" fill="var(--btn-container)"/></svg><div data-action="up" style="position:absolute;top:12%;left:50%;transform:translateX(-50%);width:30%;aspect-ratio:1/1;background:var(--btn-color);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:calc(var(--scale)*0.05);font-weight:bold;color:white;box-shadow:0 calc(var(--scale)*0.01) 0 rgba(0,0,0,0.2);">△</div><div data-action="left" style="position:absolute;left:12%;top:50%;transform:translateY(-50%);width:30%;aspect-ratio:1/1;background:var(--btn-color);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:calc(var(--scale)*0.05);font-weight:bold;color:white;box-shadow:0 calc(var(--scale)*0.01) 0 rgba(0,0,0,0.2);">□</div><div data-action="right" style="position:absolute;right:12%;top:50%;transform:translateY(-50%);width:30%;aspect-ratio:1/1;background:var(--btn-color);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:calc(var(--scale)*0.05);font-weight:bold;color:white;box-shadow:0 calc(var(--scale)*0.01) 0 rgba(0,0,0,0.2);">○</div><div data-action="down" style="position:absolute;bottom:12%;left:50%;transform:translateX(-50%);width:30%;aspect-ratio:1/1;background:var(--btn-color);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:calc(var(--scale)*0.05);font-weight:bold;color:white;box-shadow:0 calc(var(--scale)*0.01) 0 rgba(0,0,0,0.2);">×</div></div>',
            large_button: '<div class="large-btn-module" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;"><svg viewBox="0 0 400 400" style="position:absolute;width:100%;height:100%;"><circle cx="200" cy="200" r="200" fill="var(--btn-container)"/></svg><div data-action="a" style="width:70%;height:70%;border-radius:50%;background:var(--btn-color);display:flex;align-items:center;justify-content:center;font-size:calc(var(--scale)*0.12);font-weight:bold;color:white;box-shadow:inset 0 calc(var(--scale)*0.01) rgba(255,255,255,0.2),0 calc(var(--scale)*0.02) 0 rgba(0,0,0,0.2);">A</div></div>',
            slider: '<div class="slider-module" style="transform: scale(0.6); height: 80%;"><div style="width:20px;height:100%;background:var(--btn-container);border-radius:10px;position:relative;"><div style="width:100%;height:50%;background:var(--btn-color);border-radius:10px;position:absolute;bottom:0;"></div><div data-action="slider" style="width:40px;height:40px;background:var(--btn-color);border-radius:50%;position:absolute;left:50%;transform:translateX(-50%);top:25%;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div></div></div>',
            steering: '<div style="transform: scale(0.5); width:70%; aspect-ratio:1/1; border-radius:50%; background:var(--btn-container); display:flex; align-items:center; justify-content:center;"><svg viewBox="0 0 841 841" width="100%" height="100%"><circle cx="420.5" cy="420.5" r="380" fill="var(--btn-color)"/><rect x="400" y="100" width="42" height="200" fill="var(--btn-container)"/><rect x="400" y="540" width="42" height="200" fill="var(--btn-container)"/><rect x="100" y="400" width="200" height="42" fill="var(--btn-container)"/><rect x="540" y="400" width="200" height="42" fill="var(--btn-container)"/></svg></div>',
            trackpad: '<div class="trackpad-module" style="width:80%; height:80%; background:var(--btn-container); border-radius:15px; position:relative; overflow:hidden;"><div style="position:absolute; inset:10%; background-image:radial-gradient(circle,rgba(255,255,255,0.15) 1.5px,transparent 0); background-size:15% 15%;"></div><div id="it-trackpad-dot" style="position:absolute; width:10px; height:10px; background:var(--btn-color); border-radius:50%; left:50%; top:50%; transform:translate(-50%,-50%); opacity:0;"></div></div>',
            winder: '<div class="winder-module" style="width:70%; height:70%; position:relative;"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="var(--btn-container)"/><circle cx="50" cy="5" r="8" fill="var(--btn-color)" id="it-winder-handle" style="transform-origin: 50% 50%;"/></svg></div>'
        };

        const leftLabels = { dpad: 'D-Pad', buttons: 'Buttons', joystick: 'Joystick', quad_buttons: 'Quad', large_button: 'Large', slider: 'Slider', steering: 'Steering', trackpad: 'Trackpad', winder: 'Winder' };
        const rightLabels = { dpad: 'D-Pad', buttons: 'Buttons', joystick: 'Joystick', quad_buttons: 'Quad', large_button: 'Large', slider: 'Slider', steering: 'Steering', trackpad: 'Trackpad', winder: 'Winder' };

        function renderInputs() {
            leftDisplay.innerHTML = inputConfigs[currentLeft] || inputConfigs.dpad;
            rightDisplay.innerHTML = inputConfigs[currentRight] || inputConfigs.buttons;
            leftName.textContent = leftLabels[currentLeft] || currentLeft;
            rightName.textContent = rightLabels[currentRight] || currentRight;
            
            if (window.InputService) {
                let left = currentLeft;
                let right = currentRight;
                if (window.handedness === 'left') {
                    const tmp = left; left = right; right = tmp;
                }
                window.InputService.render('left', left, {}, true);
                window.InputService.render('right', right, {}, true);
            }

            document.querySelectorAll('.it-menu-item').forEach(item => {
                item.classList.toggle('active', item.dataset.left === currentLeft && item.dataset.right === currentRight);
            });
        }

        function buildMenu() {
            const combos = [
                { left: 'dpad', right: 'buttons', label: 'D-Pad + Buttons' },
                { left: 'joystick', right: 'buttons', label: 'Joystick + Buttons' },
                { left: 'dpad', right: 'large_button', label: 'D-Pad + Large' },
                { left: 'quad_buttons', right: 'quad_buttons', label: 'Dual Quad' },
                { left: 'slider', right: 'steering', label: 'Slider + Steering' },
                { left: 'large_button', right: 'slider', label: 'Large + Slider' },
                { left: 'joystick', right: 'steering', label: 'Joy + Steer' },
                { left: 'dpad', right: 'dpad', label: 'Dual D-Pad' },
                { left: 'buttons', right: 'buttons', label: 'Dual Buttons' },
                { left: 'steering', right: 'slider', label: 'Steer + Slider' },
                { left: 'slider', right: 'buttons', label: 'Slider + Buttons' },
                { left: 'joystick', right: 'joystick', label: 'Dual Joystick' }
            ];
            
            menu.innerHTML = combos.map(c => 
                `<div class="it-menu-item${c.left === currentLeft && c.right === currentRight ? ' active' : ''}" data-left="${c.left}" data-right="${c.right}">${c.label}</div>`
            ).join('');

            menu.querySelectorAll('.it-menu-item').forEach(item => {
                item.addEventListener('click', () => {
                    currentLeft = item.dataset.left;
                    currentRight = item.dataset.right;
                    renderInputs();
                    menuOpen = false;
                    document.querySelector('.it-menu').classList.remove('visible');
                    if (window.playSfx) window.playSfx('assets/enter-game.mp3', 0.5);
                });
            });
        }

        buildMenu();
        renderInputs();

        this._onInput = (e) => {
            const action = e.detail.action;
            statAction.textContent = `Action: ${action.toUpperCase()}`;
            
            if (action === 'pill-left' || action === 'n') {
                menuOpen = !menuOpen;
                document.querySelector('.it-menu').classList.toggle('visible', menuOpen);
                if (window.playSfx) window.playSfx('assets/change-menu.mp3', 0.5);
                return;
            }

            if (menuOpen) {
                if (action === 'b') {
                    menuOpen = false;
                    document.querySelector('.it-menu').classList.remove('visible');
                    if (window.playSfx) window.playSfx('assets/exit-game.mp3', 0.5);
                }
                return;
            }
        };

        this._onJoystick = (e) => {
            const { x, y } = e.detail;
            statAction.textContent = `Joystick: X:${x.toFixed(2)} Y:${y.toFixed(2)}`;
        };

        this._onSlider = (e) => {
            const val = e.detail.value;
            statAction.textContent = `Slider: ${val.toFixed(0)}`;
        };

        this._onSteering = (e) => {
            const val = e.detail.value;
            statAction.textContent = `Steering: ${val.toFixed(2)}`;
        };

        this._onTrackpad = (e) => {
            const { x, y } = e.detail;
            statAction.textContent = `Trackpad: X:${x.toFixed(2)} Y:${y.toFixed(2)}`;
            const dot = document.getElementById('it-trackpad-dot');
            if (dot) {
                dot.style.left = (x * 100) + '%';
                dot.style.top = (y * 100) + '%';
                dot.style.opacity = '1';
            }
        };

        this._onTrackpadRelease = () => {
            const dot = document.getElementById('it-trackpad-dot');
            if (dot) dot.style.opacity = '0';
        };

        this._onWinder = (e) => {
            const angle = e.detail.angle;
            statAction.textContent = `Winder: ${angle.toFixed(1)}°`;
            const handle = document.getElementById('it-winder-handle');
            if (handle) {
                handle.style.transform = `rotate(${angle}deg)`;
            }
        };

        window.addEventListener('appInput', this._onInput);
        window.addEventListener('joystickInput', this._onJoystick);
        window.addEventListener('sliderInput', this._onSlider);
        window.addEventListener('steeringInput', this._onSteering);
        window.addEventListener('trackpadInput', this._onTrackpad);
        window.addEventListener('trackpadRelease', this._onTrackpadRelease);
        window.addEventListener('winderInput', this._onWinder);
    },
    cleanup: function() {
        window.removeEventListener('appInput', this._onInput);
        window.removeEventListener('joystickInput', this._onJoystick);
        window.removeEventListener('sliderInput', this._onSlider);
        window.removeEventListener('steeringInput', this._onSteering);
        window.removeEventListener('trackpadInput', this._onTrackpad);
        window.removeEventListener('trackpadRelease', this._onTrackpadRelease);
        window.removeEventListener('winderInput', this._onWinder);
    }
});
