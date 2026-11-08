window.apps.push({
    id: 'draw',
    name: 'Draw',
    inputs: { left: 'trackpad', right: 'buttons' },
    description: 'Draw with trackpad. A to draw, B for palette.',
    thumbnail: './assets/pocket.js.png',
    color: '#171717',
    icon: '<svg viewBox="0 0 64 64" fill="currentColor"><path d="M12 52l4-16 28-28 12 12-28 28-16 4zM44 12l8 8"/></svg>',
    html: `
        <div class="dr">
            <div class="dr-w">
                <canvas class="dr-cv"></canvas>
                <div class="dr-cr idle"></div>
            </div>
            <div class="dr-o"></div>
            <div class="dr-p">
                <div class="dr-ph">Palette</div>
                <div class="dr-b"></div>
            </div>
        </div>
        <style>
            .dr { width:100%; height:100%; background:#171717; overflow:hidden; position:relative; font-family:'Jua',sans-serif; }
            .dr-w { width:100%; height:100%; position:relative; }
            .dr-cv { width:100%; height:100%; display:block; }
            .dr-cr { position:absolute; border-radius:50%; pointer-events:none; transform:translate(-50%,-50%); z-index:10; left:50%; top:50%; border-style:solid; }
            .dr-cr.idle { background:rgba(255,255,255,0.6); }
            .dr-cr.dn { background:rgba(0,0,0,0.4); border-color:transparent; }
            .dr-o { position:absolute; inset:0; background:rgba(0,0,0,0.5); z-index:20; display:none; }
            .dr-o.on { display:block; }
            .dr-p { position:absolute; bottom:0; left:0; right:0; background:#222; border-radius:calc(var(--scale) * 0.04) calc(var(--scale) * 0.04) 0 0; z-index:25; display:none; flex-direction:column; padding:calc(var(--scale) * 0.025) calc(var(--scale) * 0.035); max-height:70%; min-height:30%; overflow-y:auto; }
            .dr-p.on { display:flex; }
            .dr-ph { font-size:calc(var(--scale) * 0.038); font-weight:900; color:#fff; text-align:center; margin-bottom:calc(var(--scale) * 0.02); letter-spacing:.03em; }
            .dr-s { margin-bottom:calc(var(--scale) * 0.02); }
            .dr-sl { font-size:calc(var(--scale) * 0.022); font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:.08em; margin-bottom:calc(var(--scale) * 0.01); padding-left:calc(var(--scale) * 0.005); }
            .dr-ov { display:flex; flex-wrap:wrap; gap:calc(var(--scale) * 0.01); }
            .dr-ob { padding:calc(var(--scale) * 0.008) calc(var(--scale) * 0.02); border-radius:calc(var(--scale) * 0.015); border:2px solid rgba(255,255,255,0.12); background:transparent; font-size:calc(var(--scale) * 0.028); font-weight:700; color:#fff; font-family:'Jua',sans-serif; cursor:pointer; transition:.08s; user-select:none; -webkit-tap-highlight-color:transparent; }
            .dr-ob.sel { border-color:#f39c12; background:rgba(243,156,18,0.1); }
            .dr-ob.foc { filter:brightness(1.3); transform:scale(1.05); border-color:#fff; }
            .dr-c { width:calc(var(--scale) * 0.065); height:calc(var(--scale) * 0.065); border-radius:50%; padding:0; border-width:2px; }
            .dr-c.sel { border-color:#f39c12; }
            .dr-c.foc { filter:brightness(1.3); transform:scale(1.15); border-color:#fff; }
        </style>
    `,
    init: function() {
        var cv = document.querySelector('.dr-cv');
        var wr = document.querySelector('.dr-w');
        var cr = document.querySelector('.dr-cr');
        var ov = document.querySelector('.dr-o');
        var pl = document.querySelector('.dr-p');
        var pb = document.querySelector('.dr-b');
        if (!cv || !wr) return;
        var cx = cv.getContext('2d');

        var s = { c: '#e74c3c', z: 4, b: 'pen' };
        var st = [];
        var dn = false;
        var cu = null;
        var px = 0.5, py = 0.5;
        var po = false;
        var pr = 0, pc = 0;
        var sm = [];

        var cs = [
            { l: 'Colors', t: 'c', o: ['#000000','#ffffff','#e74c3c','#3498db','#2ecc71','#f1c40f','#e67e22','#9b59b6','#e91e63','#95a5a6','#1abc9c','#8B4513'] },
            { l: 'Width', t: 'z', o: [2,4,6,10,16,24] },
            { l: 'Brush', t: 'b', o: ['pen','marker','eraser'] },
            { l: 'Action', t: 'x', o: ['Undo','Clear','New'] }
        ];

        function ld() { try { var d = JSON.parse(window.PocketDB.getItem('pjs_d')); if (d) { if (d.s) st = d.s; if (d.p) { if (d.p.c) s.c = d.p.c; if (d.p.z) s.z = d.p.z; if (d.p.b) s.b = d.p.b; } } } catch(e) {} }
        function sv() { window.PocketDB.setItem('pjs_d', JSON.stringify({s:st,p:{c:s.c,z:s.z,b:s.b}})); }

        function rz() {
            var dpr = window.devicePixelRatio || 1;
            cv.width = wr.offsetWidth * dpr;
            cv.height = wr.offsetHeight * dpr;
            cx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function rd() {
            cx.clearRect(0, 0, wr.offsetWidth, wr.offsetHeight);
            st.forEach(function(v) { dw(v); });
        }

        function dw(v) {
            if (!v.p || v.p.length < 1) return;
            var er = v.b === 'eraser';
            var al = v.b === 'marker' ? 0.35 : 1;
            cx.globalCompositeOperation = er ? 'destination-out' : 'source-over';
            cx.globalAlpha = al;
            cx.strokeStyle = er ? 'rgba(0,0,0,1)' : v.c;
            cx.lineWidth = v.z;
            cx.lineCap = 'round'; cx.lineJoin = 'round';
            var pts = v.p;
            var w = wr.offsetWidth, h = wr.offsetHeight;
            if (pts.length === 1) { cx.beginPath(); cx.arc(pts[0].x*w, pts[0].y*h, v.z/2, 0, Math.PI*2); cx.fill(); }
            else if (pts.length === 2) { cx.beginPath(); cx.moveTo(pts[0].x*w, pts[0].y*h); cx.lineTo(pts[1].x*w, pts[1].y*h); cx.stroke(); }
            else {
                cx.beginPath(); cx.moveTo(pts[0].x*w, pts[0].y*h);
                for (var j = 1; j < pts.length - 1; j++) {
                    cx.quadraticCurveTo(pts[j].x*w, pts[j].y*h, ((pts[j].x+pts[j+1].x)/2)*w, ((pts[j].y+pts[j+1].y)/2)*h);
                }
                cx.lineTo(pts[pts.length-1].x*w, pts[pts.length-1].y*h); cx.stroke();
            }
            cx.globalCompositeOperation = 'source-over'; cx.globalAlpha = 1;
        }

        function uc() {
            var sz = s.b === 'eraser' ? Math.max(s.z*2, 16) : Math.max(s.z, 8);
            var col = s.b === 'eraser' ? 'rgba(255,255,255,0.25)' : s.c;
            cr.style.width = sz + 'px'; cr.style.height = sz + 'px';
            cr.style.borderWidth = dn ? '0px' : '2px';
            cr.style.borderColor = col;
            cr.style.background = dn ? col : 'rgba(255,255,255,0.55)';
            if (dn) cr.className = 'dr-cr dn'; else cr.className = 'dr-cr idle';
        }

        function ag(pts) {
            var n = pts.length;
            if (n < 1) return null;
            var sx = 0, sy = 0;
            for (var i = 0; i < n; i++) { sx += pts[i].x; sy += pts[i].y; }
            return { x: sx/n, y: sy/n };
        }

        function sp() {
            if (dn && cu) {
                dn = false;
                if (cu && cu.p.length > 0) { st.push(cu); sv(); rd(); }
                cu = null; sm = []; uc();
            }
            po = true;
            ov.classList.add('on'); pl.classList.add('on');
            window.InputService.render('left', 'dpad', {}, true);
            window.InputService.render('right', 'buttons', {}, true);
            pr = 0; pc = 0; rp();
        }

        function hp() {
            po = false;
            ov.classList.remove('on'); pl.classList.remove('on');
            window.InputService.render('left', 'trackpad', {}, true);
            window.InputService.render('right', 'buttons', {}, true);
            uc();
        }

        function rp() {
            var h = '';
            for (var ri = 0; ri < cs.length; ri++) {
                var cat = cs[ri];
                h += '<div class="dr-s"><div class="dr-sl">' + cat.l + '</div><div class="dr-ov">';
                for (var oi = 0; oi < cat.o.length; oi++) {
                    var v = cat.o[oi];
                    var foc = (pr === ri && pc === oi);
                    var sel = (cat.t === 'c' && v === s.c) || (cat.t === 'z' && v === s.z) || (cat.t === 'b' && v === s.b);
                    h += '<div class="dr-ob' + (foc?' foc':'') + (sel?' sel':'') + (cat.t==='c'?' dr-c':'') + '"' + (cat.t==='c'?' style="background:'+v+'"':'') + '>' + (cat.t==='z'?v+'px':cat.t==='c'?'':v) + '</div>';
                }
                h += '</div></div>';
            }
            pb.innerHTML = h;
        }

        this._tp = function(e) {
            px = e.detail.x; py = e.detail.y;
            cr.style.display = 'block';
            cr.style.left = (px * wr.offsetWidth) + 'px';
            cr.style.top = (py * wr.offsetHeight) + 'px';

            sm.push({x:px, y:py});
            if (sm.length > 5) sm.shift();

            if (dn && cu) {
                var p = ag(sm) || {x:px, y:py};
                cu.p.push(p);
                dw(cu);
            }
        };

        this._in = function(e) {
            var a = e.detail.action || e.detail.direction;
            if (po) {
                if (a === 'b') { hp(); return; }
                if (a === 'up') { if (pr > 0) { pr--; pc = Math.min(pc, cs[pr].o.length-1); rp(); } }
                else if (a === 'down') { if (pr < cs.length-1) { pr++; pc = Math.min(pc, cs[pr].o.length-1); rp(); } }
                else if (a === 'left') { if (pc > 0) { pc--; rp(); } }
                else if (a === 'right') { if (pc < cs[pr].o.length-1) { pc++; rp(); } }
                else if (a === 'a') {
                    var v = cs[pr].o[pc];
                    if (cs[pr].t === 'x') {
                        if (v === 'Undo') { if (st.length) { st.pop(); rd(); sv(); } hp(); }
                        else if (v === 'Clear') { st = []; rd(); sv(); hp(); }
                        else if (v === 'New') { st = []; rd(); sv(); hp(); }
                    } else {
                        if (cs[pr].t === 'c') s.c = v;
                        else if (cs[pr].t === 'z') s.z = v;
                        else if (cs[pr].t === 'b') { s.b = v; if (v === 'eraser') s.c = '#ffffff'; }
                        uc(); rp();
                    }
                }
                return;
            }
            if (a === 'b') { sp(); return; }
            if (a === 'a' && !dn) {
                dn = true;
                sm = [{x:px, y:py}];
                cu = { p: [{x:px, y:py}], c: s.c, z: s.z, b: s.b };
                uc();
                dw(cu);
            }
        };

        this._rel = function(e) {
            if (e.detail.action === 'a' && dn) {
                dn = false;
                if (cu && cu.p.length > 0) { st.push(cu); sv(); rd(); }
                cu = null; sm = []; uc();
            }
        };

        this._rsz = function() { rz(); rd(); };

        this._sv = function() {
            if (dn && cu && cu.p.length > 0) { st.push(cu); sv(); }
            sv();
        };

        window.addEventListener('trackpadInput', this._tp);
        window.addEventListener('appInput', this._in);
        window.addEventListener('appRelease', this._rel);
        window.addEventListener('resize', this._rsz);

        ld(); rz(); rd(); uc();
        window.InputService.render('left', 'trackpad', {}, true);
        window.InputService.render('right', 'buttons', {}, true);
    },
    cleanup: function() {
        if (this._sv) this._sv();
        window.removeEventListener('trackpadInput', this._tp);
        window.removeEventListener('appInput', this._in);
        window.removeEventListener('appRelease', this._rel);
        window.removeEventListener('resize', this._rsz);
    }
});
