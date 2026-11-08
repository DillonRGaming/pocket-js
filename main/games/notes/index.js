(function() {
    window.apps.push({
        id: 'notes',
        name: 'Notes',
        thumbnail: './games/notes/assets/notes.png',
        html: `
            <div class="notes-app">
                <div class="notes-header">
                    <div class="notes-title">Quick Notes</div>
                    <div class="notes-kb-hint">Press <span>A</span> to type</div>
                </div>
                <div class="notes-body">
                    <div id="notes-content"><span id="notes-cursor">|</span></div>
                </div>
            </div>
            <style>
                .notes-app {
                    width: 100%; height: 100%;
                    background: #fff; color: #000;
                    display: flex; flex-direction: column;
                    font-family: 'Jua', 'Segoe UI', sans-serif;
                }
                .dark-mode .notes-app { background: #1a1a1b; color: #eee; }
                
                .notes-header {
                    padding: calc(var(--scale) * 0.04);
                    border-bottom: 1px solid rgba(0,0,0,0.06);
                    display: flex; align-items: center; justify-content: space-between;
                }
                .notes-title { font-size: calc(var(--scale) * 0.045); font-weight: 800; }
                .notes-kb-hint { font-size: calc(var(--scale) * 0.028); opacity: 0.5; }
                .notes-kb-hint span { 
                    background: #000; color: #fff; 
                    padding: 0 4px; border-radius: 4px; 
                }
                .dark-mode .notes-kb-hint span { background: #eee; color: #000; }

                .notes-body {
                    flex: 1; padding: calc(var(--scale) * 0.04);
                    font-size: calc(var(--scale) * 0.04); line-height: 1.4;
                }
                #notes-content { white-space: pre-wrap; word-break: break-all; display: inline; }
                #notes-cursor { 
                    animation: notes-blink 1s step-end infinite; 
                    color: #1a73e8; font-weight: bold;
                    display: inline;
                }
                @keyframes notes-blink { 50% { opacity: 0; } }
            </style>
        `,
        init: function() {
            const content = document.getElementById('notes-content');
            let text = window.PocketDB.getItem('pocketjs_notes_content') || '';
            content.innerHTML = text + '<span id="notes-cursor">|</span>';

            this._inputHandler = (e) => {
                if (e.detail.action === 'a') {
                    window.system.showKeyboard("Edit Note", (msg) => {
                        if (msg.action === 'char') {
                            text += msg.value;
                        } else if (msg.action === 'backspace') {
                            text = text.slice(0, -1);
                        }
                        content.innerHTML = text + '<span id="notes-cursor">|</span>';
                        window.PocketDB.setItem('pocketjs_notes_content', text);
                    });
                }
            };

            window.addEventListener('appInput', this._inputHandler);
        },
        cleanup: function() {
            if (this._inputHandler) {
                window.removeEventListener('appInput', this._inputHandler);
            }
            if (window.system && window.system.hideKeyboard) {
                window.system.hideKeyboard();
            }
        }
    });
})();
