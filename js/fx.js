/* ============================================================
   fx.js — suasana permainan (membungkus Games.start tanpa mengubah mesin):
   • Music : musik latar prosedural, parameter UNIK untuk tiap game (Content.BGM)
   • Scene : latar bertema (langit/angkasa/laut/hutan/…) dengan dekorasi bergerak
   • Juice : maskot bereaksi, combo beruntun, getar layar saat salah
   • Tombol 🎵/🔊 untuk mematikan musik/efek (tersimpan di perangkat)
   ============================================================ */
(function () {
  'use strict';
  var G = window.Games, sfx = G.sfx, esc = UI.esc;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- musik latar ---------- */
  var SK = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10], pent: [0, 2, 4, 7, 9], dor: [0, 2, 3, 5, 7, 9, 10], lyd: [0, 2, 4, 6, 7, 9, 11], blues: [0, 3, 5, 6, 7, 10], mixo: [0, 2, 4, 5, 7, 9, 10], hira: [0, 2, 3, 7, 8] };
  var PROG = [[0, 3, 4, 3], [0, 5, 3, 4], [0, 2, 3, 4], [0, 4, 5, 3]];
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function rnd(s) { return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
  var Music = (function () {
    var C = null, master = null, timer = null, cfg = null, on = localStorage.getItem('edugame_bgm') !== 'off';
    function ctx() {
      if (!C) { try { C = new (window.AudioContext || window.webkitAudioContext)(); master = C.createGain(); master.gain.value = 0; master.connect(C.destination); } catch (e) { return null; } }
      if (C.state === 'suspended') C.resume();
      return C;
    }
    function note(f, d, when, v, w) {
      var o = C.createOscillator(), g = C.createGain();
      o.type = w; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, when); g.gain.linearRampToValueAtTime(v, when + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, when + d);
      o.connect(g); g.connect(master); o.start(when); o.stop(when + d + 0.05);
    }
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
    function play(engine) {
      stopTimer(); var b = Content.BGM[engine]; if (!b) return; cfg = engine;
      if (!on) return; var c = ctx(); if (!c) return;
      var bpm = b[0], root = b[1], sk = SK[b[2]] || SK.maj, wave = b[3], r = rnd(b[4] * 7919 + 13), step = 60 / bpm / 2;
      var prog = PROG[b[4] % PROG.length], pats = [], bass = [];
      for (var v = 0; v < 2; v++) { var p = [], last = Math.floor(sk.length / 2); for (var k = 0; k < 16; k++) { if (r() < (k % 4 === 0 ? 0.08 : 0.3)) { p.push(-1); continue; } last = Math.max(0, Math.min(sk.length * 2 - 1, last + Math.floor(r() * 5) - 2)); p.push(last); } pats.push(p); }
      for (var q = 0; q < 16; q++) bass.push(q % 4 === 0 ? 0 : (q % 8 === 6 && r() < 0.6 ? 2 : -1));
      var t0 = c.currentTime + 0.15, i = 0;
      master.gain.cancelScheduledValues(c.currentTime); master.gain.setValueAtTime(master.gain.value, c.currentTime); master.gain.linearRampToValueAtTime(0.9, c.currentTime + 1.2);
      timer = setInterval(function () {
        if (!on || !C) return;
        while (t0 < C.currentTime + 0.35) {
          var bar = Math.floor(i / 16) % 4, st = i % 16, pat = pats[Math.floor(i / 64) % 2 === 0 ? (bar % 2) : ((bar + 1) % 2)], ak = root + sk[prog[bar] % sk.length];
          if (bass[st] >= 0) note(hz(ak - 12 + (bass[st] === 2 ? 7 : 0)), step * 3.2, t0, 0.05, 'triangle');
          var d = pat[st]; if (d >= 0) { var oct = d >= sk.length ? 12 : 0; note(hz(ak + sk[d % sk.length] + oct), step * 0.85, t0, 0.032, wave); }
          if (st % 2 === 1 && (b[4] + st) % 3 === 0) note(hz(ak + 24), 0.04, t0, 0.012, 'square');       // hi-hat tipis
          t0 += step; i++;
        }
      }, 100);
    }
    function stop(fast) {
      stopTimer();
      if (C && master) { var t = C.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0.0001, t + (fast ? 0.15 : 0.6)); }
    }
    return {
      play: play, stop: stop, isOn: function () { return on; },
      toggle: function () { on = !on; localStorage.setItem('edugame_bgm', on ? 'on' : 'off'); if (on) play(cfg); else stop(true); return on; },
      pause: function () { if (C && C.state === 'running') C.suspend(); }, resume: function () { if (C && on && C.state === 'suspended') C.resume(); }
    };
  })();
  document.addEventListener('visibilitychange', function () { if (document.hidden) Music.pause(); else Music.resume(); });

  /* ---------- latar bertema ---------- */
  var THEMES = {
    sky: { bg: 'linear-gradient(180deg,#38BDF8 0%,#BAE6FD 62%,#DCFCE7 100%)', gnd: '#4ADE80', d: [['☁️', 8, 10, 54, 70], ['☁️', 55, 22, 40, 95], ['☁️', 30, 6, 34, 120], ['☀️', 86, 6, 52, 0], ['🌳', 6, 86, 48, 0], ['🌳', 90, 88, 40, 0], ['🐦', 20, 30, 24, 40]] },
    space: { bg: 'radial-gradient(circle at 70% 20%,#4338CA 0%,#1E1B4B 45%,#0B1229 100%)', gnd: '#312E81', d: [['⭐', 10, 12, 20, 0], ['✨', 40, 8, 22, 0], ['⭐', 80, 18, 18, 0], ['🪐', 86, 62, 60, 0], ['🌙', 8, 70, 44, 0], ['☄️', 30, 28, 36, 60], ['✨', 60, 50, 18, 0]] },
    sea: { bg: 'linear-gradient(180deg,#67E8F9 0%,#0EA5E9 55%,#075985 100%)', gnd: '#FDE68A', d: [['🫧', 10, 80, 24, 26], ['🫧', 34, 90, 18, 34], ['🫧', 70, 85, 28, 30], ['🐠', 20, 40, 38, 80], ['🐟', 75, 55, 32, 100], ['🪸', 8, 90, 44, 0], ['🐙', 88, 82, 44, 0]] },
    forest: { bg: 'linear-gradient(180deg,#BBF7D0 0%,#86EFAC 55%,#16A34A 100%)', gnd: '#15803D', d: [['🌲', 5, 84, 56, 0], ['🌳', 92, 84, 56, 0], ['🦋', 25, 25, 28, 55], ['🦋', 70, 40, 24, 70], ['🍄', 14, 94, 28, 0], ['☀️', 82, 6, 44, 0], ['🐿️', 88, 70, 30, 0]] },
    candy: { bg: 'linear-gradient(180deg,#FBCFE8 0%,#FDE68A 55%,#DDD6FE 100%)', gnd: '#F9A8D4', d: [['🍭', 8, 14, 44, 0], ['🍬', 80, 20, 36, 0], ['🧁', 12, 82, 44, 0], ['🍩', 88, 78, 44, 0], ['⭐', 50, 8, 26, 0], ['🌈', 70, 6, 56, 0], ['🍪', 40, 90, 30, 0]] },
    night: { bg: 'linear-gradient(180deg,#0F172A 0%,#1E3A8A 70%,#312E81 100%)', gnd: '#1E293B', d: [['🌙', 84, 8, 54, 0], ['⭐', 12, 10, 18, 0], ['✨', 36, 18, 18, 0], ['⭐', 60, 12, 16, 0], ['🦉', 8, 82, 40, 0], ['🌲', 92, 86, 52, 0], ['✨', 22, 55, 16, 0]] },
    desert: { bg: 'linear-gradient(180deg,#FDE68A 0%,#FDBA74 60%,#FB923C 100%)', gnd: '#F59E0B', d: [['☀️', 84, 8, 64, 0], ['🌵', 6, 86, 52, 0], ['🌵', 92, 88, 44, 0], ['🐪', 70, 88, 40, 0], ['☁️', 20, 14, 38, 110], ['🪨', 40, 94, 26, 0]] },
    ice: { bg: 'linear-gradient(180deg,#E0F2FE 0%,#BAE6FD 60%,#F0F9FF 100%)', gnd: '#FFFFFF', d: [['❄️', 10, 8, 24, 30], ['❄️', 40, 4, 18, 38], ['❄️', 70, 10, 26, 34], ['⛄', 8, 84, 52, 0], ['🐧', 90, 86, 40, 0], ['🏔️', 76, 70, 60, 0]] },
    arena: { bg: 'linear-gradient(90deg,#1D4ED8 0%,#EEF2FF 45%,#FEE2E2 55%,#B91C1C 100%)', gnd: '#475569', d: [['🔦', 20, 6, 36, 0], ['🔦', 78, 6, 36, 0], ['🎉', 8, 84, 40, 0], ['🎊', 90, 84, 40, 0], ['🏆', 50, 90, 32, 0]] },
    paper: { bg: 'linear-gradient(180deg,#FEF3C7 0%,#FFFBEB 70%,#FDE68A 100%)', gnd: '#D97706', d: [['📚', 8, 86, 44, 0], ['✏️', 90, 80, 38, 0], ['📐', 86, 16, 34, 0], ['🔬', 12, 18, 34, 0], ['💡', 50, 8, 30, 0], ['🧮', 76, 90, 32, 0]] }
  };
  var Scene = {
    show: function (engine) {
      this.hide(); var key = Content.TEMA[engine] || 'sky', t = THEMES[key]; if (!t) return;
      var el = document.createElement('div'); el.id = 'scene'; el.className = 'scene th-' + key; el.style.background = t.bg; el.setAttribute('aria-hidden', 'true');
      el.innerHTML = t.d.map(function (d, i) { return '<i style="left:' + d[1] + '%;top:' + d[2] + '%;font-size:' + d[3] + 'px;' + (d[4] && !reduce ? 'animation:drift ' + d[4] + 's linear infinite;animation-delay:-' + (i * 13) % d[4] + 's' : (reduce ? '' : 'animation:bobb ' + (3 + i % 3) + 's ease-in-out infinite;animation-delay:-' + i + 's')) + '">' + d[0] + '</i>'; }).join('') + '<b class="gnd" style="background:' + t.gnd + '"></b>';
      document.body.insertBefore(el, document.body.firstChild); document.body.classList.add('has-scene');
    },
    hide: function () { var e = document.getElementById('scene'); if (e) e.remove(); document.body.classList.remove('has-scene'); }
  };

  /* ---------- maskot, combo, tombol suara ---------- */
  var SAY_OK = ['Mantap!', 'Keren!', 'Tepat sekali!', 'Hebat!', 'Pintar!', 'Yes!', 'Luar biasa!'], SAY_BAD = ['Ayo coba lagi!', 'Hampir!', 'Semangat!', 'Jangan menyerah!'];
  var Juice = {
    streak: 0, face: '🙂', base: '🙂', root: null, tm: null,
    init: function (root, pl) {
      this.destroy(); this.streak = 0; this.base = this.face = (pl && pl.avatar) || '🙂'; this.root = root;
      var m = document.createElement('div'); m.id = 'mascot'; m.setAttribute('aria-hidden', 'true'); m.innerHTML = '<span class="m-say"></span><span class="m-face">' + esc(this.base) + '</span>';
      document.body.appendChild(m);
      var s = document.createElement('div'); s.id = 'snd'; s.innerHTML = '<button type="button" data-m title="Musik latar" aria-label="Musik latar"></button><button type="button" data-s title="Efek suara" aria-label="Efek suara"></button>';
      document.body.appendChild(s); this.paint();
      s.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (b.hasAttribute('data-m')) Music.toggle(); else sfx.toggle(); Juice.paint(); });
    },
    paint: function () { var s = document.getElementById('snd'); if (!s) return; s.querySelector('[data-m]').textContent = Music.isOn() ? '🎵' : '🔇'; s.querySelector('[data-s]').textContent = sfx.on() ? '🔊' : '🔈'; s.querySelector('[data-m]').classList.toggle('off', !Music.isOn()); s.querySelector('[data-s]').classList.toggle('off', !sfx.on()); },
    say: function (face, text) {
      var m = document.getElementById('mascot'); if (!m) return; var f = m.querySelector('.m-face'), t = m.querySelector('.m-say');
      f.textContent = face; t.textContent = text; m.classList.remove('hop'); void m.offsetWidth; m.classList.add('hop'); m.classList.add('talk');
      clearTimeout(this.tm); this.tm = setTimeout(function () { var mm = document.getElementById('mascot'); if (mm) { mm.classList.remove('talk'); mm.querySelector('.m-face').textContent = Juice.base; } }, 1300);
    },
    good: function () {
      this.streak++; this.say(this.streak >= 5 ? '🤩' : '😄', SAY_OK[Math.floor(Math.random() * SAY_OK.length)]);
      var m = document.getElementById('mascot'); if (m && window.CursorFX && !reduce) { var r = m.getBoundingClientRect(); CursorFX.burst(r.left + r.width / 2, r.top, this.streak >= 3 ? 26 : 12); }
      if ([3, 5, 8, 12, 16].indexOf(this.streak) > -1) this.combo(this.streak);
    },
    bad: function () {
      this.streak = 0; this.say('😵', SAY_BAD[Math.floor(Math.random() * SAY_BAD.length)]);
      var a = document.querySelector('#arena .arena'); if (a && !reduce) { a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); }
    },
    combo: function (n) {
      var c = document.createElement('div'); c.className = 'combo'; c.textContent = '🔥 COMBO x' + n + '!'; document.body.appendChild(c); setTimeout(function () { c.remove(); }, 1500);
      if (n >= 5) UI.confetti();
    },
    destroy: function () { ['mascot', 'snd'].forEach(function (id) { var e = document.getElementById(id); if (e) e.remove(); }); document.querySelectorAll('.combo').forEach(function (e) { e.remove(); }); clearTimeout(this.tm); }
  };

  /* ---------- sambungkan ke efek suara & siklus permainan ---------- */
  ['ok', 'bad'].forEach(function (k) { var f = sfx[k]; sfx[k] = function () { f.apply(sfx, arguments); try { Juice[k === 'ok' ? 'good' : 'bad'](); } catch (e) { /* abaikan */ } }; });
  var win0 = sfx.win; sfx.win = function () { Music.stop(true); win0.apply(sfx, arguments); };
  var start0 = G.start;
  G.start = function (root, game, player, onFinish, onQuit) {
    Scene.show(game.engine); Juice.init(root, player); Music.play(game.engine);
    function tutup() { Music.stop(); Juice.destroy(); Scene.hide(); }
    var ctl = start0(root, game, player, function (r) { Music.stop(true); onFinish(r); }, function () { tutup(); if (onQuit) onQuit(); });
    return { destroy: function () { tutup(); ctl.destroy(); } };
  };
  G.Music = Music; G.Scene = Scene; G.Juice = Juice;
})();
