window.apps.push({
    id: 'recorder',
    name: 'Voice Recorder',
    thumbnail: './games/recorder/assets/recorder.png',
    color: '#b91d1d',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>`,
    html: `
        <div class="recorder-app">
            <div class="recorder-display">
                <div class="recorder-timer" id="recorder-timer">00:00</div>
                <div class="recorder-wave-container" id="recorder-wave">
                    <!-- 13 bars for a richer visualizer -->
                    <div class="recorder-bar"></div>
                    <div class="recorder-bar"></div>
                    <div class="recorder-bar"></div>
                    <div class="recorder-bar"></div>
                    <div class="recorder-bar"></div>
                    <div class="recorder-bar"></div>
                    <div class="recorder-bar"></div>
                    <div class="recorder-bar"></div>
                    <div class="recorder-bar"></div>
                    <div class="recorder-bar"></div>
                    <div class="recorder-bar"></div>
                    <div class="recorder-bar"></div>
                    <div class="recorder-bar"></div>
                </div>
            </div>
            
            <div class="recorder-footer">
                <div class="recorder-actions">
                    <div class="recorder-btn-unit" data-id="toggle">
                        <div class="recorder-btn" id="recorder-toggle">
                            <div class="recorder-btn-inner"></div>
                        </div>
                        <div class="recorder-btn-label">Record</div>
                    </div>

                    <div class="recorder-btn-unit secondary" data-id="export" id="export-zone" style="opacity: 0.1; pointer-events: none;">
                        <div class="recorder-export-btn">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/>
                            </svg>
                        </div>
                        <div class="recorder-btn-label">Export</div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .recorder-app {
                width: 100%; height: 100%;
                background: #b91d1d;
                color: white;
                font-family: 'Jua', sans-serif;
                display: flex;
                flex-direction: column;
                padding: calc(var(--scale) * 0.03);
                box-sizing: border-box;
                overflow: hidden;
            }

            .recorder-display {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .recorder-timer {
                font-size: calc(var(--scale) * 0.06);
                font-weight: 900;
                font-variant-numeric: tabular-nums;
                margin-bottom: calc(var(--scale) * 0.02);
                opacity: 0.9;
            }

            .recorder-wave-container {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: calc(var(--scale) * 0.01);
                height: calc(var(--scale) * 0.2);
                width: 100%;
            }

            .recorder-bar {
                width: calc(var(--scale) * 0.012);
                height: calc(var(--scale) * 0.03);
                background: white;
                border-radius: calc(var(--scale) * 0.02);
                opacity: 0.2;
                transition: height 0.08s ease;
            }

            .recorder-bar:nth-child(7) { background: #fff; }

            .recorder-footer {
                padding-bottom: calc(var(--scale) * 0.03);
                width: 100%;
            }

            .recorder-actions {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: calc(var(--scale) * 0.05);
                width: 100%;
            }

            .recorder-btn-unit {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: calc(var(--scale) * 0.01);
                padding: calc(var(--scale) * 0.015) calc(var(--scale) * 0.02);
                border-radius: calc(var(--scale) * 0.03);
                transition: background 0.2s;
            }

            .recorder-btn-unit.focused {
                background: rgba(255,255,255,0.12);
            }

            .recorder-btn {
                width: calc(var(--scale) * 0.07);
                height: calc(var(--scale) * 0.07);
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .recorder-btn-inner {
                width: calc(var(--scale) * 0.03);
                height: calc(var(--scale) * 0.03);
                background: #b91d1d;
                border-radius: 50%;
                transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }

            .is-recording .recorder-btn-inner {
                border-radius: calc(var(--scale) * 0.008);
                width: calc(var(--scale) * 0.025);
                height: calc(var(--scale) * 0.025);
            }

            .recorder-export-btn {
                width: calc(var(--scale) * 0.07);
                height: calc(var(--scale) * 0.07);
                background: rgba(255,255,255,0.15);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }

            .recorder-export-btn svg {
                width: 50%;
                height: 50%;
            }

            .recorder-btn-label {
                font-size: calc(var(--scale) * 0.012);
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: calc(var(--scale) * 0.001);
                opacity: 0.8;
            }
        </style>
    `,
    init: function () {
        const apps = document.querySelectorAll('.recorder-app');
        const timerEls = document.querySelectorAll('#recorder-timer');
        const barEls = document.querySelectorAll('.recorder-bar');
        const exportZones = document.querySelectorAll('#export-zone');

        const scale = parseFloat(getComputedStyle(document.body).getPropertyValue('--scale')) || 900;

        let mediaRecorder = null;
        let audioChunks = [];
        let audioBlob = null;
        let isRecording = false;
        let startTime = 0;
        let timerInterval = null;
        let animationFrame = null;
        let focusedId = 'toggle';

        let audioCtx, analyser, dataArray;

        async function startStreaming() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioCtx.createAnalyser();
                const source = audioCtx.createMediaStreamSource(stream);
                source.connect(analyser);
                
                analyser.fftSize = 64; 
                dataArray = new Uint8Array(analyser.frequencyBinCount);

                mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
                mediaRecorder.onstop = () => {
                    audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    audioChunks = [];
                    exportZones.forEach(zone => {
                        zone.style.opacity = '1';
                        zone.style.pointerEvents = 'auto';
                    });
                };

                mediaRecorder.start();
                isRecording = true;
                apps.forEach(app => app.classList.add('is-recording'));
                startTime = Date.now();
                timerInterval = setInterval(updateTimer, 1000);
                visualize();
            } catch (err) {
                console.error("Mic Access Denied", err);
            }
        }

        function stopStreaming() {
            if (mediaRecorder && isRecording) {
                mediaRecorder.stop();
                mediaRecorder.stream.getTracks().forEach(t => t.stop());
                isRecording = false;
                apps.forEach(app => app.classList.remove('is-recording'));
                clearInterval(timerInterval);
                cancelAnimationFrame(animationFrame);
                barEls.forEach(b => { 
                    b.style.height = `calc(var(--scale) * 0.03)`; 
                    b.style.opacity = '0.2'; 
                });
            }
        }

        function visualize() {
            if (!isRecording) return;
            animationFrame = requestAnimationFrame(visualize);
            analyser.getByteFrequencyData(dataArray);

            const barsPerApp = barEls.length / apps.length;
            const centerIdx = Math.floor(barsPerApp / 2);
            
            barEls.forEach((bar, i) => {
                const localIdx = i % barsPerApp;
                const dist = Math.abs(localIdx - centerIdx); 
                const freqIdx = dist * 2;
                const val = dataArray[freqIdx] || 0;
                
                const taper = 1 - (dist / centerIdx) * 0.4; 
                const h = (scale * 0.025) + (val / 255) * (scale * 0.12) * taper;
                
                bar.style.height = `${h}px`;
                bar.style.opacity = (0.2 + (val / 255) * 0.8) * taper;
            });
        }

        function updateTimer() {
            const ms = Date.now() - startTime;
            const s = Math.floor(ms / 1000);
            const timeStr = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
            timerEls.forEach(el => el.textContent = timeStr);
        }

        function exportAudio() {
            if (!audioBlob) return;
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = function() {
                const base64data = reader.result;
                let recs = JSON.parse(window.PocketDB.getItem('pocketjs_recordings')) || [];
                recs.push({ id: Date.now(), name: `Recording ${recs.length + 1}.wav`, data: base64data });
                window.PocketDB.setItem('pocketjs_recordings', JSON.stringify(recs));
                
                window.playSfx('assets/enter-game.mp3', 0.5);
                
                if (window.NotificationService) {
                    window.NotificationService.show({ title: 'Recorder', body: 'Saved to Files', appId: 'recorder' });
                }
            }
        }

        function updateFocus() {
            document.querySelectorAll('.recorder-btn-unit').forEach(u => u.classList.toggle('focused', u.dataset.id === focusedId));
        }

        this._inputHandler = (e) => {
            const action = e.detail.action;
            
            if ((action === 'right' || action === 'left') && audioBlob) {
                focusedId = focusedId === 'toggle' ? 'export' : 'toggle';
                window.playSfx('assets/move-menu.mp3', 3.5);
                updateFocus();
            } else if (action === 'a') {
                if (focusedId === 'toggle') {
                    if (!isRecording) { window.playSfx('assets/change-menu.mp3'); startStreaming(); }
                    else { window.playSfx('assets/exit-game.mp3', 0.5); stopStreaming(); }
                } else if (focusedId === 'export') exportAudio();
            }
        };

        window.addEventListener('appInput', this._inputHandler);
        updateFocus();
    },
    cleanup: function () {
        if (this._inputHandler) window.removeEventListener('appInput', this._inputHandler);
        clearInterval(this.timerInterval);
        cancelAnimationFrame(this.animationFrame);
    }
});
