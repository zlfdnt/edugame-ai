/* ============================================================
   games2.js — 18 mesin permainan tambahan (total 24 dengan games.js)
   Berbasis soal : balon • tikus • roda • pesawat • katak • roket • balap • ulartangga • kotak
   Jenis lain    : benarsalah • isian • hitung • kartukilat • cocok • kelompok • anagram • gantung • carikata
   ============================================================ */
(function () {
  'use strict';
  var G = window.Games, H = G.H, sfx = G.sfx, esc = UI.esc, ic = UI.ic, $ = UI.$, $$ = UI.$$, LBL = H.LBL, clamp = H.clamp;
  function emo(e, c) { return e ? '<span class="emo ' + (c || '') + '">' + esc(e) + '</span>' : ''; }
  function umpanOf(g) { return g.asesmen !== 'sumatif' && !g.kunciTersembunyi; }
  function qcard(q) { return '<div class="q-card card-fx shine">' + emo(q.emoji, 'big') + (q.stimulus ? '<div class="stim"><b>📖 Bacalah dengan teliti</b><p>' + esc(q.stimulus) + '</p></div>' : '') + '<h2 class="q-text">' + esc(q.q) + '</h2></div>'; }
  function frame(g, chips, pct, cls) {
    return '<div class="arena ' + (cls || '') + '">' + H.top(g, chips) + '<div class="ar-prog"><i style="width:' + Math.round(pct) + '%"></i></div><div id="stage" class="stage"></div><div id="fb" class="fb"></div><div class="ar-foot" id="nx" hidden><button class="btn btn-primary btn-lg btn-block glow" id="go"></button></div></div>';
  }
  function nextBar(root, label, fn) { var b = $('#nx', root); if (!b) return; b.hidden = false; var go = $('#go', root); go.innerHTML = label + ' ' + ic('arrow', 20); go.onclick = fn; }
  function explain(ok, t, ex) { return '<div class="explain ' + (ok ? 'good' : 'wrong') + '"><b>' + t + '</b> ' + esc(ex || '') + '</div>'; }
  function dua(list) { return list; }
  function skorAkhir(umpan, benar, n) { return umpan ? Math.round(benar / n * 100) : 0; }

  /* ---------- kerangka umum untuk game berbasis soal pilihan ganda ---------- */
  function mcq(skin) {
    return function (root, g, pl, done) {
      var Q = g.konten.questions, n = Q.length, i = 0, benar = 0, ans = [], t0 = Date.now(), umpan = umpanOf(g), S = { pts: 0, streak: 0, benar: 0, n: n, mult: 1 }, locked = false, clean = null;
      function bersih() { if (clean) { try { clean(); } catch (e) { /* abaikan */ } clean = null; } }
      function show() {
        locked = false; bersih();
        root.innerHTML = frame(g, skin.chips ? skin.chips(S, i, n) : H.chip('flag', 'Soal ' + (i + 1) + '/' + n), i / n * 100, 'sk-' + skin.id + (skin.wide ? ' arena-wide' : ''));
        UI.bind(root);
        clean = skin.mount($('#stage', root), Q[i], i, S, pick, { g: g, root: root }) || null;
      }
      function pick(k) {
        if (locked) return; locked = true;
        var q = Q[i], betul = umpan ? k === q.answer : null; ans.push({ i: i, p: k });
        if (umpan) { if (betul) { benar++; S.streak++; S.pts += 100 * (S.mult || 1); sfx.ok(); } else { S.streak = 0; sfx.bad(); } }
        S.benar = benar;
        var wait = (skin.reveal && skin.reveal($('#stage', root), q, k, betul, S, { g: g, root: root })) || 0, last = i + 1 >= n;
        if (umpan) { $('#fb', root).innerHTML = explain(betul, k === -1 ? 'Waktu habis.' : betul ? 'Benar!' : 'Belum tepat.', q.explain || ('Jawaban yang benar: ' + LBL[q.answer] + '.')); setTimeout(function () { nextBar(root, last ? 'Lihat Hasil' : 'Soal Berikutnya', next); }, Math.min(wait, 700)); }
        else setTimeout(next, 450 + wait);
      }
      function next() {
        if (i + 1 >= n) {
          bersih();
          var fin = function () { H.finish(done, [{ nama: pl.nama, kelas: pl.kelas, avatar: pl.avatar, skor: skorAkhir(umpan, benar, n), benar: umpan ? benar : 0, total: n }], ans, t0, { poin: S.pts }); };
          if (skin.end) skin.end(root, S, fin); else { sfx.win(); fin(); }
          return;
        }
        i++; show();
      }
      show();
      return { destroy: bersih };
    };
  }
  function opsiList(q, cls) { return '<div class="opts ' + (cls || '') + '">' + q.options.map(function (o, k) { return '<button class="opt" data-k="' + k + '"><span class="opt-l">' + LBL[k] + '</span><span class="opt-t">' + esc(o) + '</span></button>'; }).join('') + '</div>'; }
  function bindOpsi(st, pick) { $$('.opt', st).forEach(function (b) { b.addEventListener('click', function () { pick(+b.getAttribute('data-k')); }); }); }
  function tandaiOpsi(st, q, k, betul) { $$('.opt', st).forEach(function (b) { var kk = +b.getAttribute('data-k'); b.disabled = true; if (betul === null) { if (kk === k) b.classList.add('sel'); } else if (kk === q.answer) b.classList.add('ok'); else if (kk === k) b.classList.add('bad'); }); }

  /* --- balon --- */
  G.register('balon', mcq({ id: 'balon',
    mount: function (st, q, i, S, pick) {
      st.innerHTML = qcard(q) + '<div class="balloons">' + q.options.map(function (o, k) { return '<button class="bln c' + (k % 5) + '" data-k="' + k + '" style="--d:' + (k * 0.55) + 's"><span class="bln-b"><span>' + esc(o) + '</span></span><i></i></button>'; }).join('') + '</div>';
      $$('.bln', st).forEach(function (b) { b.addEventListener('click', function () { pick(+b.getAttribute('data-k')); }); });
    },
    reveal: function (st, q, k, betul) { $$('.bln', st).forEach(function (b) { var kk = +b.getAttribute('data-k'); b.disabled = true; if (kk === k) b.classList.add(betul === false ? 'bad' : 'pop'); else if (betul === false && kk === q.answer) b.classList.add('ok'); else b.classList.add('fade'); }); return 300; } }));

  /* --- tikus tanah --- */
  G.register('tikus', mcq({ id: 'tikus',
    mount: function (st, q, i, S, pick) {
      st.innerHTML = qcard(q) + '<div class="moles">' + q.options.map(function (o, k) { return '<div class="hole"><button class="mole" data-k="' + k + '" style="--d:' + (k * 0.35) + 's"><span class="mole-f">🐹</span><span class="mole-t">' + esc(o) + '</span></button><i class="dirt"></i></div>'; }).join('') + '</div>';
      $$('.mole', st).forEach(function (b) { b.addEventListener('click', function () { pick(+b.getAttribute('data-k')); }); });
    },
    reveal: function (st, q, k, betul) { $$('.mole', st).forEach(function (b) { var kk = +b.getAttribute('data-k'); b.disabled = true; if (kk === k) { b.classList.add('hit'); b.insertAdjacentHTML('beforeend', '<span class="hammer">🔨</span>'); if (betul) b.insertAdjacentHTML('beforeend', '<span class="star">⭐</span>'); } else if (betul === false && kk === q.answer) b.classList.add('ok'); }); return 300; } }));

  /* --- roda putar (pengali poin) --- */
  var SEG = [['×1', 1, '#3B82F6'], ['×2', 2, '#22C55E'], ['×3', 3, '#F59E0B'], ['BONUS ×5', 5, '#EF4444'], ['×2', 2, '#A855F7'], ['×1', 1, '#06B6D4']];
  G.register('roda', mcq({ id: 'roda', chips: function (S, i, n) { return H.chip('refresh', 'Soal ' + (i + 1) + '/' + n) + H.chip('star', S.pts + ' poin', 'ar-pts'); },
    mount: function (st, q, i, S, pick) {
      var conic = SEG.map(function (s, k) { return s[2] + ' ' + k * 60 + 'deg ' + (k + 1) * 60 + 'deg'; }).join(',');
      st.innerHTML = '<div class="wheel-w"><div class="wheel-pin">▼</div><div class="wheel" id="wh" style="background:conic-gradient(' + conic + ')">' + SEG.map(function (s, k) { return '<span style="transform:rotate(' + (k * 60 + 30) + 'deg) translateY(-82px)">' + s[0] + '</span>'; }).join('') + '<i class="hub"></i></div><button class="btn btn-accent btn-lg glow" id="spin">' + ic('refresh', 20) + ' Putar Roda!</button><p class="muted" id="sp-t">Putar dulu untuk mendapat pengali poin soal ini.</p></div><div id="qz"></div>';
      var b = $('#spin', st), done = false;
      b.addEventListener('click', function () {
        if (done) return; done = true; b.disabled = true; sfx.tick();
        var idx = Math.floor(Math.random() * SEG.length), rot = 360 * 5 + (360 - (idx * 60 + 30));
        $('#wh', st).style.transform = 'rotate(' + rot + 'deg)';
        setTimeout(function () {
          S.mult = SEG[idx][1]; sfx.ok(); $('#sp-t', st).innerHTML = 'Hadiah: <b>' + SEG[idx][0] + '</b> poin untuk soal ini!';
          $('#qz', st).innerHTML = qcard(q) + opsiList(q); bindOpsi(st, pick); UI.bind(st);
        }, 2700);
      });
    },
    reveal: function (st, q, k, betul) { tandaiOpsi(st, q, k, betul); return 0; } }));

  /* --- pesawat (dinding jawaban melaju, pilih jalur) --- */
  G.register('pesawat', mcq({ id: 'pesawat', wide: true,
    mount: function (st, q, i, S, pick) {
      var nL = q.options.length, lane = Math.floor(nL / 2), dur = clamp(6 + q.options.join('').length / 10, 8, 15), fin = false;
      st.innerHTML = qcard(q) + '<div class="sky" style="--n:' + nL + '"><div class="plane" id="pl">✈️</div><div class="wdw" id="wl" style="animation-duration:' + dur + 's">' + q.options.map(function (o, k) { return '<div class="wb c' + (k % 5) + '"><b>' + LBL[k] + '</b><span>' + esc(o) + '</span></div>'; }).join('') + '</div></div><div class="sky-ctl"><button class="btn btn-soft btn-lg" id="up" aria-label="Naik">▲ Naik</button><button class="btn btn-accent btn-lg" id="now">Kunci jawaban sekarang</button><button class="btn btn-soft btn-lg" id="dn" aria-label="Turun">▼ Turun</button></div>';
      var pl = $('#pl', st);
      function set(l) { lane = clamp(l, 0, nL - 1); pl.style.setProperty('--lane', lane); $$('.wb', st).forEach(function (b, k) { b.classList.toggle('aim', k === lane); }); sfx.tick(); }
      function fire() { if (fin) return; fin = true; $('#wl', st).style.animationPlayState = 'paused'; pick(lane); }
      set(lane);
      $('#up', st).addEventListener('click', function () { set(lane - 1); }); $('#dn', st).addEventListener('click', function () { set(lane + 1); }); $('#now', st).addEventListener('click', fire);
      $('#wl', st).addEventListener('animationend', fire);
      $('.sky', st).addEventListener('click', function (e) { var r = this.getBoundingClientRect(); set(Math.floor((e.clientY - r.top) / r.height * nL)); });
      function key(e) { if (e.key === 'ArrowUp') { set(lane - 1); e.preventDefault(); } else if (e.key === 'ArrowDown') { set(lane + 1); e.preventDefault(); } else if (e.key === 'Enter') fire(); }
      document.addEventListener('keydown', key);
      return function () { document.removeEventListener('keydown', key); };
    },
    reveal: function (st, q, k, betul) { $$('.wb', st).forEach(function (b, kk) { if (betul === null) { if (kk === k) b.classList.add('pickd'); } else if (kk === q.answer) b.classList.add('ok'); else if (kk === k) b.classList.add('bad'); }); return 200; } }));

  /* --- katak loncat sungai --- */
  G.register('katak', mcq({ id: 'katak',
    mount: function (st, q, i, S, pick) {
      var pct = 3 + S.benar / S.n * 84;
      st.innerHTML = '<div class="river"><div class="frog" id="fr" style="left:' + pct + '%">🐸</div><div class="river-end">🏁</div></div>' + qcard(q) + '<div class="lilies">' + q.options.map(function (o, k) { return '<button class="lily" data-k="' + k + '"><b>' + LBL[k] + '</b><span>' + esc(o) + '</span></button>'; }).join('') + '</div>';
      $$('.lily', st).forEach(function (b) { b.addEventListener('click', function () { pick(+b.getAttribute('data-k')); }); });
    },
    reveal: function (st, q, k, betul, S) {
      var fr = $('#fr', st);
      $$('.lily', st).forEach(function (b) { var kk = +b.getAttribute('data-k'); b.disabled = true; if (betul === null) { if (kk === k) b.classList.add('sel'); } else if (kk === q.answer) b.classList.add('ok'); else if (kk === k) b.classList.add('bad'); });
      if (betul) { fr.classList.add('hop'); fr.style.left = (3 + S.benar / S.n * 84) + '%'; } else if (betul === false) { fr.classList.add('splash'); fr.insertAdjacentHTML('afterend', '<span class="splash-e">💦</span>'); }
      return 300;
    } }));

  /* --- roket meluncur --- */
  G.register('roket', mcq({ id: 'roket', chips: function (S, i, n) { return H.chip('fire', 'Bahan bakar ' + Math.round(S.benar / n * 100) + '%'); },
    mount: function (st, q, i, S, pick) {
      var pct = S.benar / S.n * 100;
      st.innerHTML = '<div class="rk-w"><div class="rk-col"><div class="rk-sky"><div class="rk" id="rk" style="bottom:' + (4 + pct * 0.62) + '%">🚀</div></div><div class="fuel"><i id="fu" style="height:' + pct + '%"></i></div></div><div class="rk-q">' + qcard(q) + opsiList(q) + '</div></div>';
      bindOpsi(st, pick);
    },
    reveal: function (st, q, k, betul, S) {
      tandaiOpsi(st, q, k, betul); var rk = $('#rk', st);
      if (betul) { rk.style.bottom = (4 + S.benar / S.n * 100 * 0.62) + '%'; $('#fu', st).style.height = (S.benar / S.n * 100) + '%'; rk.classList.add('boost'); } else if (betul === false) rk.classList.add('shake');
      return 200;
    },
    end: function (root, S, fin) { var rk = $('#rk', root); sfx.win(); if (rk) { rk.classList.add('launch'); $('#fb', root).innerHTML = '<div class="explain good"><b>Peluncuran! 🚀</b> Roketmu terbang membawa ' + S.benar + ' dari ' + S.n + ' bahan bakar.</div>'; } setTimeout(fin, 1900); } }));

  /* --- balap mobil --- */
  G.register('balap', mcq({ id: 'balap', wide: true, chips: function (S, i, n) { return H.chip('flag', 'Soal ' + (i + 1) + '/' + n); },
    mount: function (st, q, i, S, pick) {
      S.bot = S.bot || 0;
      function lane(cls, car, v) { return '<div class="lane"><span class="lane-c ' + cls + '" style="left:' + (2 + v / S.n * 82) + '%">' + car + '</span><i class="fin">🏁</i></div>'; }
      st.innerHTML = '<div class="track">' + lane('me', '🏎️', S.benar) + lane('bot', '🚙', S.bot) + '</div><div class="track-l"><span>🏎️ Kamu</span><span>🚙 Komputer</span></div>' + qcard(q) + opsiList(q, 'opts-2');
      bindOpsi(st, pick);
    },
    reveal: function (st, q, k, betul, S) {
      tandaiOpsi(st, q, k, betul); if (Math.random() < 0.65) S.bot = (S.bot || 0) + 1;
      var cars = $$('.lane-c', st); if (betul) cars[0].style.left = (2 + S.benar / S.n * 82) + '%'; cars[1].style.left = (2 + S.bot / S.n * 82) + '%'; return 300;
    },
    end: function (root, S, fin) {
      var menang = S.benar > S.bot, seri = S.benar === S.bot; sfx.win();
      $('#fb', root).innerHTML = '<div class="explain ' + (menang ? 'good' : 'wrong') + '"><b>' + (seri ? 'Finish bersamaan! 🏁' : menang ? 'Kamu juara! 🏆' : 'Mobil komputer menang kali ini 🚙') + '</b> Mobilmu maju ' + S.benar + ' langkah.</div>'; setTimeout(fin, 1900);
    } }));

  /* --- ular tangga --- */
  var LAD = { 3: 11, 8: 17, 12: 22 }, SNK = { 14: 5, 19: 9, 24: 15 };
  function cellNo(r, c) { return r * 5 + (r % 2 === 0 ? c + 1 : 5 - c); }
  G.register('ulartangga', mcq({ id: 'ulartangga', wide: true, chips: function (S) { return H.chip('dice', 'Kotak ' + (S.pos || 1) + '/25'); },
    mount: function (st, q, i, S, pick) {
      S.pos = S.pos || 1; var cells = '';
      for (var r = 4; r >= 0; r--) for (var c = 0; c < 5; c++) { var no = cellNo(r, c), tag = LAD[no] ? '<em class="lad">⬆' + LAD[no] + '</em>' : SNK[no] ? '<em class="snk">🐍' + SNK[no] + '</em>' : ''; cells += '<div class="uc ' + ((r + c) % 2 ? 'a' : 'b') + (no === 25 ? ' fin' : '') + '" data-n="' + no + '"><b>' + (no === 25 ? '🏁' : no) + '</b>' + tag + (no === S.pos ? '<span class="pion">🧒</span>' : '') + '</div>'; }
      st.innerHTML = '<div class="ut-w"><div class="ut"><div class="ubd">' + cells + '</div><div class="dice" id="dc">🎲</div></div><div class="ut-q">' + qcard(q) + opsiList(q) + '</div></div>';
      bindOpsi(st, pick);
    },
    reveal: function (st, q, k, betul, S) {
      tandaiOpsi(st, q, k, betul);
      if (betul === false) return 0;
      var d = 1 + Math.floor(Math.random() * 6), dc = $('#dc', st), np = Math.min(25, S.pos + d);
      dc.classList.add('roll'); setTimeout(function () { dc.textContent = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][d]; dc.classList.remove('roll'); }, 500);
      var msg = 'Dadu: ' + d; if (LAD[np]) { msg += ' → tangga naik ke ' + LAD[np] + '! 🪜'; np = LAD[np]; } else if (SNK[np]) { msg += ' → ular turun ke ' + SNK[np] + ' 🐍'; np = SNK[np]; }
      S.pos = np; $$('.pion', st).forEach(function (p) { p.remove(); });
      var cell = $('.uc[data-n="' + np + '"]', st); if (cell) cell.insertAdjacentHTML('beforeend', '<span class="pion">🧒</span>');
      var fb = $('#fb', document); if (fb) fb.insertAdjacentHTML('beforeend', '<div class="dice-msg">🎲 ' + msg + '</div>');
      return 900;
    } }));

  window.__G2 = { mcq: mcq, frame: frame, nextBar: nextBar, emo: emo, qcard: qcard, umpanOf: umpanOf, explain: explain, skorAkhir: skorAkhir, opsiList: opsiList, bindOpsi: bindOpsi, tandaiOpsi: tandaiOpsi };
})();
