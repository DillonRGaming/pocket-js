window.apps.push({
    id: 'calculator',
    name: 'Calculator',
    color: '#171717',
    thumbnail: './games/calculator/assets/calculator.png',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 12h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8-4h2v2H7V8zm4 0h2v2h-2V8zm4 0h2v2h-2V8zm-8 8h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/></svg>`,
    html: `
        <div class="calc-app">
            <div class="calc-display">
                <div class="calc-expression" id="calc-exp"> </div>
                <div class="calc-result" id="calc-res">0</div>
            </div>

            <div class="calc-grid">
                <!-- Row 1 -->
                <div class="calc-btn fn" data-id="clear">C</div>
                <div class="calc-btn fn" data-id="paren">()</div>
                <div class="calc-btn fn" data-id="percent">%</div>
                <div class="calc-btn op" data-id="divide">/</div>
                
                <!-- Row 2 -->
                <div class="calc-btn num" data-id="7">7</div>
                <div class="calc-btn num" data-id="8">8</div>
                <div class="calc-btn num" data-id="9">9</div>
                <div class="calc-btn op" data-id="multiply">x</div>
                
                <!-- Row 3 -->
                <div class="calc-btn num" data-id="4">4</div>
                <div class="calc-btn num" data-id="5">5</div>
                <div class="calc-btn num" data-id="6">6</div>
                <div class="calc-btn op" data-id="subtract">-</div>
                
                <!-- Row 4 -->
                <div class="calc-btn num" data-id="1">1</div>
                <div class="calc-btn num" data-id="2">2</div>
                <div class="calc-btn num" data-id="3">3</div>
                <div class="calc-btn op" data-id="add">+</div>
                
                <!-- Row 5 -->
                <div class="calc-btn fn" data-id="backspace">DEL</div>
                <div class="calc-btn num" data-id="0">0</div>
                <div class="calc-btn num" data-id="dot">.</div>
                <div class="calc-btn op eq" data-id="equals">=</div>
            </div>
        </div>
        <style>
            .calc-app {
                width: 100%; height: 100%;
                background: #171717;
                color: white;
                font-family: 'Jua', sans-serif;
                display: flex;
                flex-direction: column;
                padding: calc(var(--scale) * 0.04);
                box-sizing: border-box;
                overflow: hidden;
            }

            .calc-display {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                justify-content: flex-end;
                padding: calc(var(--scale) * 0.02) calc(var(--scale) * 0.01);
                gap: calc(var(--scale) * 0.01);
            }

            .calc-expression {
                font-size: calc(var(--scale) * 0.035);
                color: #888;
                min-height: 1.2em;
            }

            .calc-result {
                font-size: calc(var(--scale) * 0.1);
                font-weight: 900;
                color: white;
                line-height: 1;
                margin-bottom: calc(var(--scale) * 0.02);
            }

            .calc-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                grid-template-rows: repeat(5, 1fr);
                gap: calc(var(--scale) * 0.015);
                flex: 3;
            }

            .calc-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: calc(var(--scale) * 0.02);
                font-size: calc(var(--scale) * 0.03);
                font-weight: 900;
                transition: filter 0.1s, transform 0.1s, background 0.2s;
                cursor: pointer;
            }

            .calc-btn.num { background: #3d2d1e; color: white; }
            .calc-btn.fn { background: #6e6559; color: white; }
            .calc-btn.op { background: #f39c12; color: #171717; }
            .calc-btn.op.eq { 
                background: linear-gradient(135deg, #f39c12, #e67e22);
                color: white;
            }

            .calc-btn.focused {
                filter: brightness(1.3);
                transform: scale(1.05);
            }
        </style>
    `,
    init: function () {
        const apps = document.querySelectorAll('.calc-app');
        const expEls = document.querySelectorAll('#calc-exp');
        const resEls = document.querySelectorAll('#calc-res');

        let expression = "";
        let result = "0";
        let isEvaluated = false;

        let focusX = 0;
        let focusY = 0;

        function updateDisplay() {
            const eStr = expression || " ";
            const rStr = result || "0";
            expEls.forEach(el => el.textContent = eStr);
            resEls.forEach(el => el.textContent = rStr);
        }

        function calculate() {
            try {
                const evalStr = expression.replace(/x/g, '*').replace(/÷/g, '/');
                const evalResult = eval(evalStr);
                if (isNaN(evalResult) || !isFinite(evalResult)) return;
                result = String(evalResult);
            } catch (e) {}
        }

        function handleInput(id) {
            if (id === 'clear') {
                expression = "";
                result = "0";
                isEvaluated = false;
            } else if (id === 'backspace') {
                expression = expression.slice(0, -1);
                isEvaluated = false;
            } else if (id === 'equals') {
                calculate();
                isEvaluated = true;
            } else if (id === 'percent') {
                try {
                    const val = eval(expression.replace(/x/g, '*').replace(/÷/g, '/'));
                    result = String(val / 100);
                    isEvaluated = true;
                } catch(e) {}
            } else {
                let symbol = id;
                if (id === 'multiply') symbol = 'x';
                if (id === 'divide') symbol = '/';
                if (id === 'add') symbol = '+';
                if (id === 'subtract') symbol = '-';
                if (id === 'dot') symbol = '.';
                if (id === 'paren') symbol = '('; 
                
                if (isEvaluated) {
                    if (['+', '-', 'x', '/'].includes(symbol)) {
                        expression = result + symbol;
                    } else {
                        expression = symbol;
                    }
                    isEvaluated = false;
                } else {
                    expression += symbol;
                }
            }
            
            updateDisplay();
            window.playSfx('assets/change-menu.mp3', 0.5);
        }

        function updateFocus() {
            document.querySelectorAll('.calc-btn').forEach(el => el.classList.remove('focused'));
            const gridItems = document.querySelectorAll('.calc-grid .calc-btn');
            // We have 2 grids (desktop/mobile), so we need to focus the correct buttons in both
            const itemsPerRow = 4;
            const index = (focusY * itemsPerRow) + focusX;
            
            // Query all instances across all screen containers
            document.querySelectorAll('.calc-grid').forEach(grid => {
                const buttons = grid.querySelectorAll('.calc-btn');
                if (buttons[index]) buttons[index].classList.add('focused');
            });
        }

        this._inputHandler = (e) => {
            const action = e.detail.action;
            
            if (action === 'up') {
                focusY = (focusY - 1 + 5) % 5;
                updateFocus();
                window.playSfx('assets/move-menu.mp3', 3.5);
            } else if (action === 'down') {
                focusY = (focusY + 1) % 5;
                updateFocus();
                window.playSfx('assets/move-menu.mp3', 3.5);
            } else if (action === 'left') {
                focusX = (focusX - 1 + 4) % 4;
                updateFocus();
                window.playSfx('assets/move-menu.mp3', 3.5);
            } else if (action === 'right') {
                focusX = (focusX + 1) % 4;
                updateFocus();
                window.playSfx('assets/move-menu.mp3', 3.5);
            } else if (action === 'a') {
                // Focus one button and get its ID (names/IDs are unique per grid but shared across containers)
                const gridItems = document.querySelectorAll('.calc-grid .calc-btn');
                const itemsPerRow = 4;
                const index = (focusY * itemsPerRow) + focusX;
                if (gridItems[index]) handleInput(gridItems[index].dataset.id);
            }
        };

        window.addEventListener('appInput', this._inputHandler);
        updateFocus();
        updateDisplay();
    },
    cleanup: function () {
        if (this._inputHandler) window.removeEventListener('appInput', this._inputHandler);
    }
});
