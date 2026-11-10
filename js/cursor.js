/* ============================================================
   cursor.js — kursor "Precision Select" (+ kecil)
   • Tanda tambah mengikuti pointer tepat (tanpa jeda) = presisi
   • Trail: ekor bergradasi yang menyusul dengan easing
   • Particles: percikan kecil yang melayang, jatuh pelan, memudar
   • Klik = ledakan percikan + cincin; hover elemen interaktif = plus membesar & berputar
   • Layar sentuh: tanpa kursor, hanya percikan saat ditekan
   • prefers-reduced-motion: plus saja, tanpa trail & partikel
   ============================================================ */
(function () {
  'use strict';
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS = ['#FACC15', '#A78BFA', '#60A5FA', '#FFFFFF', '#F472B6'];
  var TEXTUAL = 'input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]),textarea,[contenteditable="true"]';
  var INTERACTIVE = 'a,button,[role=button],select,summary,label[for],input[type=checkbox],input[type=radio],input[type=range],.card,.tpl-card,[data-cursor]';

  var canvas, ctx, plus, W = 0, H = 0, dpr = 1;
  var mx = -100, my = -100, hx = -100, hy = -100, lastX = -100, lastY = -100;
  var trail = [], parts = [], rings = [];
  var running = false, visible = false;

  function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'cursor-fx';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize, { passive: true });

    if (fine) {
      plus = document.createElement('div');
      plus.id = 'cursor-plus';
      plus.setAttribute('aria-hidden', 'true');
      plus.innerHTML = '<svg width="26" height="26" viewBox="-13 -13 26 26"><path d="M0 -10V10M-10 0H10" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle r="1.6" fill="#fff"/></svg>';
      document.body.appendChild(plus);
      document.documentElement.classList.add('has-cursor');

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerdown', onDown, { passive: true });
      window.addEventListener('pointerup', function () { plus.classList.remove('is-down'); }, { passive: true });
      document.addEventListener('mouseover', onOver, { passive: true });
      document.documentElement.addEventListener('mouseleave', function () { visible = false; plus.style.opacity = 0; });
      document.documentElement.addEventListener('mouseenter', function () { visible = true; plus.style.opacity = 1; });
    } else {
      window.addEventListener('pointerdown', function (e) { burst(e.clientX, e.clientY, 10); start(); }, { passive: true });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function onMove(e) {
    mx = e.clientX; my = e.clientY;
    if (!visible) { visible = true; hx = mx; hy = my; plus.style.opacity = 1; }
    plus.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    if (reduce) return;
    var dx = mx - lastX, dy = my - lastY, sp = Math.sqrt(dx * dx + dy * dy);
    lastX = mx; lastY = my;
    var n = Math.min(3, Math.floor(sp / 9));
    for (var i = 0; i < n; i++) spawn(mx, my, dx, dy);
    start();
  }
  function onDown(e) {
    plus.classList.add('is-down');
    if (reduce) return;
    burst(e.clientX, e.clientY, 16);
    rings.push({ x: e.clientX, y: e.clientY, r: 4, a: 0.7 });
    start();
  }
  function onOver(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var txt = !!t.closest(TEXTUAL);
    document.documentElement.classList.toggle('cur-text', txt);
    plus.classList.toggle('is-hover', !txt && !!t.closest(INTERACTIVE));
  }

  function spawn(x, y, dx, dy) {
    if (parts.length > 150) parts.shift();
    var a = Math.random() * Math.PI * 2, s = 0.3 + Math.random() * 1.3;
    parts.push({
      x: x + (Math.random() - 0.5) * 4, y: y + (Math.random() - 0.5) * 4,
      vx: Math.cos(a) * s - dx * 0.04, vy: Math.sin(a) * s - dy * 0.04 - 0.2,
      life: 1, decay: 0.012 + Math.random() * 0.016,
      size: 1.2 + Math.random() * 2.4, color: COLORS[(Math.random() * COLORS.length) | 0],
      shape: Math.random() < 0.28 ? 'plus' : 'dot', rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2, ph: Math.random() * 6
    });
  }
  function burst(x, y, n) {
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 + Math.random() * 0.4, s = 1.5 + Math.random() * 3.2;
      parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, decay: 0.016 + Math.random() * 0.014, size: 1.6 + Math.random() * 3,
        color: COLORS[(Math.random() * COLORS.length) | 0], shape: Math.random() < 0.4 ? 'plus' : 'dot', rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, ph: Math.random() * 6 });
    }
  }

  function start() { if (!running) { running = true; requestAnimationFrame(frame); } }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    // --- trail: kepala menyusul pointer dengan easing, titik memudar ---
    if (fine && !reduce && visible) {
      hx += (mx - hx) * 0.38; hy += (my - hy) * 0.38;
      trail.push({ x: hx, y: hy, t: 1 });
    }
    for (var i = trail.length - 1; i >= 0; i--) { trail[i].t -= 0.06; if (trail[i].t <= 0) trail.splice(i, 1); }
    if (trail.length > 1) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (var k = 1; k < trail.length; k++) {
        var p0 = trail[k - 1], p1 = trail[k], a = Math.max(0, p1.t);
        var g = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
        g.addColorStop(0, 'rgba(124,58,237,' + (a * 0.55) + ')');
        g.addColorStop(1, 'rgba(250,204,21,' + (a * 0.75) + ')');
        ctx.strokeStyle = g; ctx.lineWidth = 1 + a * 4.5;
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
      }
    }
    // --- cincin klik ---
    for (var r = rings.length - 1; r >= 0; r--) {
      var rg = rings[r]; rg.r += 3.2; rg.a -= 0.035;
      if (rg.a <= 0) { rings.splice(r, 1); continue; }
      ctx.strokeStyle = 'rgba(250,204,21,' + rg.a + ')'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r, 0, 6.2832); ctx.stroke();
    }
    // --- partikel: melayang dengan turbulensi halus, jatuh pelan, memudar ---
    for (var j = parts.length - 1; j >= 0; j--) {
      var p = parts[j];
      p.ph += 0.12;
      p.vx += Math.sin(p.ph) * 0.02; p.vy += 0.018;
      p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= p.decay;
      if (p.life <= 0) { parts.splice(j, 1); continue; }
      var al = Math.min(1, p.life * 1.4);
      ctx.globalAlpha = al; ctx.fillStyle = p.color; ctx.strokeStyle = p.color;
      ctx.shadowColor = p.color; ctx.shadowBlur = 6;
      if (p.shape === 'plus') {
        var s = p.size * 1.7;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.lineWidth = Math.max(1, p.size * 0.5);
        ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke(); ctx.restore();
      } else {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.55 + p.life * 0.45), 0, 6.2832); ctx.fill();
      }
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;

    if (parts.length || trail.length || rings.length) requestAnimationFrame(frame);
    else running = false;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.CursorFX = { burst: function (x, y, n) { if (!reduce && canvas) { burst(x, y, n || 24); start(); } } };
})();
