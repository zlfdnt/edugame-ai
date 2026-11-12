/* ============================================================
   games3.js — kotak • benarsalah • isian • hitung • kartukilat •
   cocok • kelompok • anagram • gantung • carikata
   ============================================================ */
(function () {
  'use strict';
  var G = window.Games, H = G.H, X = window.__G2, sfx = G.sfx, esc = UI.esc, ic = UI.ic, $ = UI.$, $$ = UI.$$, LBL = H.LBL, clamp = H.clamp;
  var emo = X.emo, frame = X.frame, nextBar = X.nextBar, explain = X.explain, umpanOf = X.umpanOf;
  var WARNA = ['#2563EB', '#DC2626', '#16A34A', '#D97706', '#9333EA', '#0891B2', '#DB2777', '#65A30D'];
  function res(pl, skor, benar, total) { return [{ nama: pl.nama, kelas: pl.kelas, avatar: pl.avatar, skor: skor, benar: benar, total: total }]; }

  /* ============================ BUKA KOTAK MISTERI ============================ */
  G.register('kotak', function (root, g, pl, done) {
    var Q = g.konten.questions, n = Q.length, st = [], benar = 0, ans = [], t0 = Date.now(), umpan = umpanOf(g), open = -1, selesai = 0, pts = 0;
    for (var z = 0; z < n; z++) st.push(0);
    function render() {
      var boxes = Q.map(function (q, i) { var s = st[i]; return '<button class="box s' + s + '" data-i="' + i + '"' + (s || open > -1 ? ' disabled' : '') + '>' + (s === 1 ? '⭐' : s === 2 ? '💥' : s === 3 ? '✔️' : '<span>' + (i + 1) + '</span>🎁') + '</button>'; }).join('');
      var panel = '<div class="q-card"><p class="muted center">Pilih satu kotak misteri untuk dibuka. Ada ' + (n - selesai) + ' kotak tersisa.</p></div>';
      if (open > -1) { var q = Q[open]; panel = X.qcard(q) + X.opsiList(q, 'opts-2'); }
      root.innerHTML = '<div class="arena arena-wide sk-kotak">' + H.top(g, H.chip('gift', selesai + '/' + n + ' terbuka') + H.chip('star', pts + ' poin', 'ar-pts')) + '<div class="ar-prog"><i style="width:' + Math.round(selesai / n * 100) + '%"></i></div><div class="boxes">' + boxes + '</div><div id="stage">' + panel + '</div><div id="fb" class="fb"></div><div class="ar-foot" id="nx" hidden><button class="btn btn-primary btn-lg btn-block glow" id="go"></button></div></div>';
      UI.bind(root);
      $$('.box', root).forEach(function (b) { b.addEventListener('click', function () { open = +b.getAttribute('data-i'); sfx.flip(); render(); }); });
      $$('.opt', root).forEach(function (b) { b.addEventListener('click', function () { jawab(+b.getAttribute('data-k')); }); });
    }
    function jawab(k) {
      var q = Q[open], betul = umpan ? k === q.answer : null; ans.push({ i: open, p: k });
      if (umpan) { if (betul) { benar++; pts += 100; sfx.ok(); } else sfx.bad(); st[open] = betul ? 1 : 2; X.tandaiOpsi(root, q, k, betul); } else st[open] = 3;
      selesai++; var last = selesai >= n;
      if (umpan) { $('#fb', root).innerHTML = explain(betul, betul ? 'Bintang! ⭐ +100' : 'Boom! 💥', q.explain || ('Jawaban yang benar: ' + LBL[q.answer] + '.')); nextBar(root, last ? 'Lihat Hasil' : 'Pilih Kotak Lain', lanjut); }
      else setTimeout(lanjut, 500);
      function lanjut() { if (last) { sfx.win(); H.finish(done, res(pl, umpan ? Math.round(benar / n * 100) : 0, umpan ? benar : 0, n), ans, t0, { poin: pts }); } else { open = -1; render(); } }
    }
    render(); return { destroy: function () {} };
  });

  /* ============================ BENAR ATAU SALAH ============================ */
  G.register('benarsalah', function (root, g, pl, done) {
    var L = g.konten.statements, n = L.length, i = 0, benar = 0, ans = [], t0 = Date.now(), umpan = umpanOf(g), kunci = false;
    function render() {
      var s = L[i]; kunci = false;
      root.innerHTML = '<div class="arena sk-tf">' + H.top(g, H.chip('flag', (i + 1) + '/' + n)) + '<div class="ar-prog"><i style="width:' + Math.round(i / n * 100) + '%"></i></div><div class="q-card tf-card card-fx shine">' + emo(s.emoji, 'big') + '<p class="muted">Benar atau salah?</p><h2 class="q-text">' + esc(s.text) + '</h2></div><div class="tf-btns"><button class="tf tf-t" data-v="1">' + ic('check', 30) + ' BENAR <kbd>←</kbd></button><button class="tf tf-f" data-v="0">' + ic('x', 30) + ' SALAH <kbd>→</kbd></button></div><div id="fb" class="fb"></div><div class="ar-foot" id="nx" hidden><button class="btn btn-primary btn-lg btn-block glow" id="go"></button></div></div>';
      UI.bind(root); $$('.tf', root).forEach(function (b) { b.addEventListener('click', function () { jawab(+b.getAttribute('data-v')); }); });
    }
    function jawab(v) {
      if (kunci) return; kunci = true; var s = L[i]; ans.push({ i: i, p: v }); var betul = umpan ? (v === 1) === s.benar : null, last = i + 1 >= n;
      $$('.tf', root).forEach(function (b) { b.disabled = true; var bv = +b.getAttribute('data-v'); if (betul === null) { if (bv === v) b.classList.add('sel'); } else if ((bv === 1) === s.benar) b.classList.add('ok'); else if (bv === v) b.classList.add('bad'); });
      if (umpan) { if (betul) { benar++; sfx.ok(); } else sfx.bad(); $('#fb', root).innerHTML = explain(betul, betul ? 'Tepat!' : 'Belum tepat. Pernyataan ini ' + (s.benar ? 'BENAR.' : 'SALAH.'), s.explain); nextBar(root, last ? 'Lihat Hasil' : 'Berikutnya', next); } else setTimeout(next, 450);
      function next() { if (last) { sfx.win(); H.finish(done, res(pl, umpan ? Math.round(benar / n * 100) : 0, umpan ? benar : 0, n), ans, t0); } else { i++; render(); } }
    }
    function key(e) { if (e.target.matches('input,textarea')) return; if (e.key === 'ArrowLeft') jawab(1); else if (e.key === 'ArrowRight') jawab(0); else if (e.key === 'Enter') { var go = $('#go', root); if (go && !$('#nx', root).hidden) go.click(); } }
    document.addEventListener('keydown', key); render();
    return { destroy: function () { document.removeEventListener('keydown', key); } };
  });

  /* ============================ ISI TITIK-TITIK ============================ */
  G.register('isian', function (root, g, pl, done) {
    var L = g.konten.items, n = L.length, i = 0, benar = 0, ans = [], t0 = Date.now(), umpan = umpanOf(g), sudah = false;
    function render() {
      var it = L[i], q = esc(it.q).replace(/_{2,}/g, '<span class="blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>'); sudah = false;
      root.innerHTML = frame(g, H.chip('edit', (i + 1) + '/' + n), i / n * 100, 'sk-isian');
      $('#stage', root).innerHTML = '<div class="q-card card-fx shine">' + emo(it.emoji, 'big') + '<h2 class="q-text">' + q + '</h2></div><div class="ans-row"><input id="ai" class="inp inp-ans" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="40" placeholder="Ketik jawabanmu di sini…" aria-label="Jawaban">' + (umpan && it.answer ? '<small class="muted">' + it.answer.length + ' huruf</small>' : '') + '</div><button class="btn btn-primary btn-lg btn-block glow" id="ck">Periksa Jawaban ' + ic('check', 20) + '</button>';
      UI.bind(root); var inp = $('#ai', root); inp.focus();
      $('#ck', root).addEventListener('click', cek); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') cek(); });
    }
    function cek() {
      if (sudah) return; var inp = $('#ai', root), v = inp.value.trim(); if (!v) { inp.focus(); return; }
      sudah = true; var it = L[i], last = i + 1 >= n; ans.push({ i: i, p: v }); inp.readOnly = true; $('#ck', root).hidden = true;
      if (umpan) { var betul = Content.sama('isian', it, v); if (betul) { benar++; sfx.ok(); } else sfx.bad(); inp.classList.add(betul ? 'ok' : 'bad'); $('#fb', root).innerHTML = explain(betul, betul ? 'Benar!' : 'Jawaban yang tepat: ' + esc(it.answer), it.explain); nextBar(root, last ? 'Lihat Hasil' : 'Berikutnya', next); } else setTimeout(next, 350);
      function next() { if (last) { sfx.win(); H.finish(done, res(pl, umpan ? Math.round(benar / n * 100) : 0, umpan ? benar : 0, n), ans, t0); } else { i++; render(); } }
    }
    render(); return { destroy: function () {} };
  });

  /* ============================ HITUNG CEPAT ============================ */
  G.register('hitung', function (root, g, pl, done) {
    var L = g.konten.problems, n = L.length, i = 0, benar = 0, ans = [], t0 = Date.now(), umpan = umpanOf(g), per = clamp(Math.round(g.durasi * 60 / n), 12, 45), left = per, timer = null, buf = '', kunci = false, streak = 0;
    function render() {
      var p = L[i]; buf = ''; kunci = false; left = per;
      root.innerHTML = frame(g, H.chip('timer', '<span id="ht">' + left + '</span> dtk', 'ar-time') + H.chip('fire', streak + ' beruntun'), i / n * 100, 'sk-hitung');
      $('#stage', root).innerHTML = '<div class="q-card card-fx shine">' + emo(p.emoji, 'big') + '<h2 class="q-text calc">' + esc(p.q) + '</h2><div class="disp" id="dp">&nbsp;</div></div><div class="numpad">' + ['7', '8', '9', '4', '5', '6', '1', '2', '3', ',', '0', '⌫'].map(function (k) { return '<button class="nk" data-k="' + k + '">' + k + '</button>'; }).join('') + '</div><button class="btn btn-primary btn-lg btn-block glow" id="ok">OK ' + ic('check', 20) + '</button>';
      UI.bind(root); $$('.nk', root).forEach(function (b) { b.addEventListener('click', function () { ketik(b.getAttribute('data-k')); }); }); $('#ok', root).addEventListener('click', function () { kirim(false); });
      clearInterval(timer); timer = setInterval(function () { left--; var t = $('#ht', root); if (t) t.textContent = left; if (left <= 5) { var c = $('.ar-time', root); if (c) c.classList.add('warn'); } if (left <= 0) kirim(true); }, 1000);
    }
    function ketik(k) { if (kunci) return; if (k === '⌫') buf = buf.slice(0, -1); else if (k === ',') { if (buf.indexOf(',') < 0) buf += ','; } else if (buf.length < 9) buf += k; $('#dp', root).textContent = buf || '\u00a0'; sfx.tick(); }
    function kirim(otomatis) {
      if (kunci) return; if (!buf && !otomatis) return; kunci = true; clearInterval(timer); var p = L[i], last = i + 1 >= n; ans.push({ i: i, p: buf || '' });
      $$('.nk,#ok', root).forEach(function (b) { b.disabled = true; });
      if (umpan) { var betul = Content.sama('hitung', p, buf); if (betul) { benar++; streak++; sfx.ok(); } else { streak = 0; sfx.bad(); } $('#dp', root).classList.add(betul ? 'ok' : 'bad'); $('#fb', root).innerHTML = explain(betul, betul ? 'Benar!' : (otomatis && !buf ? 'Waktu habis.' : 'Belum tepat.') + ' Jawaban: ' + String(p.answer).replace('.', ','), ''); nextBar(root, last ? 'Lihat Hasil' : 'Soal Berikutnya', next); } else setTimeout(next, 350);
      function next() { if (last) { sfx.win(); H.finish(done, res(pl, umpan ? Math.round(benar / n * 100) : 0, umpan ? benar : 0, n), ans, t0); } else { i++; render(); } }
    }
    function key(e) { if (e.target.matches('input,textarea')) return; if (/^[0-9]$/.test(e.key)) ketik(e.key); else if (e.key === ',' || e.key === '.') ketik(','); else if (e.key === 'Backspace') ketik('⌫'); else if (e.key === 'Enter') { var nx = $('#nx', root); if (nx && !nx.hidden) $('#go', root).click(); else kirim(false); } }
    document.addEventListener('keydown', key); render();
    return { destroy: function () { clearInterval(timer); document.removeEventListener('keydown', key); } };
  });

  /* ============================ KARTU KILAT ============================ */
  G.register('kartukilat', function (root, g, pl, done) {
    var C = g.konten.cards, n = C.length, i = 0, paham = 0, t0 = Date.now(), ans = [], dibalik = false;
    function render() {
      var c = C[i]; dibalik = false;
      root.innerHTML = '<div class="arena sk-fc">' + H.top(g, H.chip('cards', (i + 1) + '/' + n) + H.chip('checkc', paham + ' paham')) + '<div class="ar-prog"><i style="width:' + Math.round(i / n * 100) + '%"></i></div><button class="fcard" id="fc" aria-label="Balik kartu"><span class="fc-in"><span class="fc-f">' + emo(c.emoji, 'big') + '<b>' + esc(c.front) + '</b><small>Ketuk untuk membalik</small></span><span class="fc-b"><b>' + esc(c.back) + '</b></span></span></button><div class="fc-btns" id="fb2" hidden><button class="btn btn-outline btn-lg" id="blm">😕 Belum paham</button><button class="btn btn-primary btn-lg glow" id="sdh">😄 Sudah paham</button></div><p class="muted center">Penilaian mandiri: jujurlah pada dirimu sendiri.</p></div>';
      UI.bind(root); $('#fc', root).addEventListener('click', balik); $('#blm', root).addEventListener('click', function () { nilai(false); }); $('#sdh', root).addEventListener('click', function () { nilai(true); });
    }
    function balik() { if (dibalik) { $('#fc', root).classList.toggle('flip'); return; } dibalik = true; $('#fc', root).classList.add('flip'); $('#fb2', root).hidden = false; sfx.flip(); }
    function nilai(ya) { if (ya) { paham++; sfx.ok(); } else sfx.bad(); ans.push({ i: i, p: ya ? 1 : 0 }); if (i + 1 >= n) { sfx.win(); H.finish(done, res(pl, Math.round(paham / n * 100), paham, n), ans, t0, { mandiri: true }); } else { i++; render(); } }
    render(); return { destroy: function () {} };
  });

  /* ============================ JODOHKAN (TARIK PASANGAN) ============================ */
  G.register('cocok', function (root, g, pl, done) {
    var P = g.konten.pairs, n = P.length, kanan = UI.shuffle(P.map(function (_, k) { return k; })), link = {}, sel = -1, t0 = Date.now(), diperiksa = false;
    function warnaDari(l) { return WARNA[l % WARNA.length]; }
    function render() {
      var rUsed = {}; Object.keys(link).forEach(function (l) { rUsed[link[l]] = +l; });
      root.innerHTML = '<div class="arena arena-wide sk-cocok">' + H.top(g, H.chip('link', Object.keys(link).length + '/' + n + ' terhubung')) + '<div class="q-card"><p class="center muted">Ketuk satu istilah di kiri, lalu pasangannya di kanan. Ketuk lagi untuk melepas.</p></div><div class="match"><div class="mcol">' + P.map(function (p, l) {
        var c = link[l] !== undefined ? ' style="--c:' + warnaDari(l) + '"' : ''; var cls = 'mi' + (sel === l ? ' sel' : '') + (link[l] !== undefined ? ' on' : '') + (diperiksa ? (link[l] === l ? ' ok' : ' bad') : '');
        return '<button class="' + cls + '" data-l="' + l + '"' + c + '>' + (link[l] !== undefined ? '<i>' + (l + 1) + '</i>' : '') + esc(p.a) + '</button>'; }).join('') + '</div><div class="mcol">' + kanan.map(function (r) {
        var l = rUsed[r], cls = 'mi' + (l !== undefined ? ' on' : '') + (diperiksa ? (l === r ? ' ok' : ' bad') : '');
        return '<button class="' + cls + '" data-r="' + r + '"' + (l !== undefined ? ' style="--c:' + warnaDari(l) + '"' : '') + '>' + (l !== undefined ? '<i>' + (l + 1) + '</i>' : '') + esc(P[r].b) + '</button>'; }).join('') + '</div></div><div id="fb" class="fb"></div><div class="ar-foot"><button class="btn btn-primary btn-lg btn-block glow" id="cek"' + (!diperiksa && Object.keys(link).length < n ? ' disabled' : '') + '>' + (diperiksa ? 'Lihat Hasil' : 'Periksa Semua') + ' ' + ic('check', 20) + '</button></div></div>';
      UI.bind(root);
      if (!diperiksa) {
        $$('[data-l]', root).forEach(function (b) { b.addEventListener('click', function () { var l = +b.getAttribute('data-l'); if (link[l] !== undefined) { delete link[l]; sel = -1; } else sel = sel === l ? -1 : l; sfx.tick(); render(); }); });
        $$('[data-r]', root).forEach(function (b) { b.addEventListener('click', function () { var r = +b.getAttribute('data-r'), pakai = Object.keys(link).filter(function (l) { return link[l] === r; })[0]; if (pakai !== undefined) { delete link[pakai]; sfx.tick(); render(); return; } if (sel < 0) return; link[sel] = r; sel = -1; sfx.flip(); render(); }); });
      }
      $('#cek', root).addEventListener('click', cek);
    }
    function cek() {
      if (diperiksa) { var ok = Object.keys(link).filter(function (l) { return link[l] === +l; }).length; sfx.win(); H.finish(done, res(pl, Math.round(ok / n * 100), ok, n), [], t0); return; }
      diperiksa = true; var benar = Object.keys(link).filter(function (l) { return link[l] === +l; }).length; (benar === n ? sfx.ok : sfx.bad)(); render();
      $('#fb', root).innerHTML = explain(benar === n, benar + ' dari ' + n + ' pasangan benar.', benar === n ? 'Sempurna!' : 'Pasangan bertanda merah belum tepat.');
    }
    render(); return { destroy: function () {} };
  });

  /* ============================ KELOMPOKKAN KATEGORI ============================ */
  G.register('kelompok', function (root, g, pl, done) {
    var Gr = g.konten.groups, items = [], t0 = Date.now(), sel = -1, diperiksa = false;
    Gr.forEach(function (gr, gi) { gr.items.forEach(function (t) { items.push({ t: t, gi: gi, at: -1 }); }); });
    items = UI.shuffle(items);
    var total = items.length;
    function chip(it, k) { return '<button class="gi-chip' + (sel === k ? ' sel' : '') + (diperiksa ? (it.at === it.gi ? ' ok' : ' bad') : '') + '" draggable="' + (diperiksa ? 'false' : 'true') + '" data-k="' + k + '">' + esc(it.t) + '</button>'; }
    function render() {
      var pool = items.map(function (it, k) { return it.at === -1 ? chip(it, k) : ''; }).join(''), tersisa = items.filter(function (it) { return it.at === -1; }).length;
      root.innerHTML = '<div class="arena arena-wide sk-grp">' + H.top(g, H.chip('layers', (total - tersisa) + '/' + total + ' ditempatkan')) + '<div class="q-card"><p class="center muted">Seret kartu ke kelompok yang tepat — atau ketuk kartu lalu ketuk kelompoknya.</p><div class="pool" id="pool">' + (pool || '<span class="muted">Semua kartu sudah ditempatkan 🎉</span>') + '</div></div><div class="groups">' + Gr.map(function (gr, gi) {
        return '<div class="grp" data-g="' + gi + '" style="--c:' + WARNA[gi % WARNA.length] + '"><h3>' + esc(gr.name) + '</h3><div class="grp-i">' + items.map(function (it, k) { return it.at === gi ? chip(it, k) : ''; }).join('') + '</div></div>'; }).join('') + '</div><div id="fb" class="fb"></div><div class="ar-foot"><button class="btn btn-primary btn-lg btn-block glow" id="cek"' + (tersisa && !diperiksa ? ' disabled' : '') + '>' + (diperiksa ? 'Lihat Hasil' : 'Periksa Jawaban') + ' ' + ic('check', 20) + '</button></div></div>';
      UI.bind(root);
      if (!diperiksa) {
        $$('.gi-chip', root).forEach(function (b) {
          var k = +b.getAttribute('data-k');
          b.addEventListener('click', function (e) { e.stopPropagation(); if (items[k].at > -1) { if (sel > -1 && sel !== k && items[sel].at !== items[k].at) { items[sel].at = items[k].at; sel = -1; sfx.flip(); render(); return; } items[k].at = -1; sel = -1; sfx.tick(); render(); } else { sel = sel === k ? -1 : k; sfx.tick(); render(); } });
          b.addEventListener('dragstart', function (e) { try { e.dataTransfer.setData('text/plain', String(k)); } catch (x) { /* abaikan */ } e.dataTransfer.effectAllowed = 'move'; sel = k; });
        });
        $$('.grp', root).forEach(function (z) {
          var gi = +z.getAttribute('data-g');
          function taruh(k) { if (k < 0) return; items[k].at = gi; sel = -1; sfx.flip(); render(); }
          z.addEventListener('click', function () { taruh(sel); }); z.addEventListener('dragover', function (e) { e.preventDefault(); z.classList.add('over'); }); z.addEventListener('dragleave', function () { z.classList.remove('over'); });
          z.addEventListener('drop', function (e) { e.preventDefault(); var k = +(e.dataTransfer.getData('text/plain') || sel); taruh(k); });
        });
        $('#pool', root).addEventListener('click', function () { if (sel > -1 && items[sel].at > -1) { items[sel].at = -1; sel = -1; render(); } });
      }
      $('#cek', root).addEventListener('click', cek);
    }
    function cek() {
      var ok = items.filter(function (it) { return it.at === it.gi; }).length;
      if (diperiksa) { sfx.win(); H.finish(done, res(pl, Math.round(ok / total * 100), ok, total), [], t0); return; }
      diperiksa = true; (ok === total ? sfx.ok : sfx.bad)(); render(); $('#fb', root).innerHTML = explain(ok === total, ok + ' dari ' + total + ' kartu tepat.', ok === total ? 'Sempurna!' : 'Kartu merah berada di kelompok yang keliru.');
    }
    render(); return { destroy: function () {} };
  });

  /* ============================ ACAK KATA (ANAGRAM) ============================ */
  G.register('anagram', function (root, g, pl, done) {
    var W = g.konten.words, n = W.length, i = 0, benar = 0, t0 = Date.now(), tiles = [], slot = [], sudah = false, umpan = true;
    function acak(w) { var a, t = 0, idx = w.split('').map(function (_, k) { return k; }); do { a = UI.shuffle(idx); t++; } while (a.every(function (v, k) { return v === k; }) && t < 12); return a; }
    function render() {
      var w = W[i]; sudah = false; tiles = acak(w.word); slot = [];
      root.innerHTML = frame(g, H.chip('edit', (i + 1) + '/' + n), i / n * 100, 'sk-ana');
      $('#stage', root).innerHTML = '<div class="q-card card-fx shine">' + emo(w.emoji, 'big') + '<p class="muted">Susun huruf menjadi kata yang tepat</p><h2 class="q-text">' + esc(w.clue) + '</h2></div><div class="slots" id="sl"></div><div class="tiles" id="ti"></div><div class="ana-btn"><button class="btn btn-outline" id="del">' + ic('back', 18) + ' Hapus</button><button class="btn btn-primary btn-lg glow" id="ck">Periksa ' + ic('check', 20) + '</button></div>';
      UI.bind(root); draw(); $('#del', root).addEventListener('click', function () { if (!sudah) { slot.pop(); draw(); } }); $('#ck', root).addEventListener('click', cek);
    }
    function draw() {
      var w = W[i].word, pakai = {}; slot.forEach(function (k) { pakai[k] = 1; });
      $('#sl', root).innerHTML = w.split('').map(function (_, p) { var k = slot[p]; return '<span class="slot' + (k !== undefined ? ' f' : '') + '" data-p="' + p + '">' + (k !== undefined ? w[k] : '') + '</span>'; }).join('');
      $('#ti', root).innerHTML = tiles.map(function (k) { return '<button class="tile" data-k="' + k + '"' + (pakai[k] || sudah ? ' disabled' : '') + '>' + w[k] + '</button>'; }).join('');
      $$('.tile', root).forEach(function (b) { b.addEventListener('click', function () { if (slot.length < w.length) { slot.push(+b.getAttribute('data-k')); sfx.tick(); draw(); if (slot.length === w.length) { /* siap diperiksa */ } } }); });
      $$('.slot.f', root).forEach(function (s) { s.addEventListener('click', function () { if (!sudah) { slot.splice(+s.getAttribute('data-p'), 1); draw(); } }); });
    }
    function cek() {
      if (sudah) return; var w = W[i].word; if (slot.length < w.length) { UI.toast('Isi semua kotak huruf dulu.', 'warn'); return; }
      sudah = true; var kata = slot.map(function (k) { return w[k]; }).join(''), betul = kata === w, last = i + 1 >= n; if (betul) { benar++; sfx.ok(); } else sfx.bad();
      $$('.slot', root).forEach(function (s) { s.classList.add(betul ? 'ok' : 'bad'); }); $$('.tile', root).forEach(function (b) { b.disabled = true; }); $('#ck', root).hidden = true; $('#del', root).hidden = true;
      $('#fb', root).innerHTML = explain(betul, betul ? 'Benar!' : 'Belum tepat. Kata yang benar: ' + w, ''); nextBar(root, last ? 'Lihat Hasil' : 'Kata Berikutnya', function () { if (last) { sfx.win(); H.finish(done, res(pl, Math.round(benar / n * 100), benar, n), [], t0); } else { i++; render(); } });
    }
    render(); return { destroy: function () {} };
  });

  /* ============================ TEBAK KATA (GANTUNG) ============================ */
  var MAN = '<svg viewBox="0 0 120 150" class="hm" aria-hidden="true"><path d="M10 140h70M30 140V10h55v18" stroke="#92400E" stroke-width="6" fill="none" stroke-linecap="round"/><g stroke="#0F172A" stroke-width="5" fill="none" stroke-linecap="round"><circle id="h0" cx="85" cy="42" r="14"/><path id="h1" d="M85 56v40"/><path id="h2" d="M85 66l-18 16"/><path id="h3" d="M85 66l18 16"/><path id="h4" d="M85 96l-16 24"/><path id="h5" d="M85 96l16 24"/></g></svg>';
  G.register('gantung', function (root, g, pl, done) {
    var W = g.konten.words, n = W.length, i = 0, benar = 0, t0 = Date.now(), tebak = {}, salah = 0, selesai = false;
    function render() {
      var w = W[i]; tebak = {}; salah = 0; selesai = false;
      root.innerHTML = frame(g, H.chip('heart', '<span id="lv">❤️❤️❤️❤️❤️❤️</span>') + H.chip('flag', (i + 1) + '/' + n), i / n * 100, 'sk-hm');
      $('#stage', root).innerHTML = '<div class="hm-w">' + MAN + '<div class="hm-r"><div class="q-card card-fx">' + emo(w.emoji, 'big') + '<p class="muted">Petunjuk</p><h2 class="q-text">' + esc(w.clue) + '</h2></div><div class="word" id="wd"></div></div></div><div class="kb" id="kb">' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(function (c) { return '<button class="kbk" data-c="' + c + '">' + c + '</button>'; }).join('') + '</div>';
      UI.bind(root); $$('.kbk', root).forEach(function (b) { b.addEventListener('click', function () { tekan(b.getAttribute('data-c')); }); }); gambar();
    }
    function gambar() {
      var w = W[i].word; $('#wd', root).innerHTML = w.split('').map(function (c) { return '<span>' + (tebak[c] || selesai ? c : '') + '</span>'; }).join('');
      for (var k = 0; k < 6; k++) { var p = $('#h' + k, root); if (p) p.style.opacity = k < salah ? 1 : 0; }
      $('#lv', root).textContent = new Array(7 - salah).join('❤️') + new Array(salah + 1).join('🖤');
    }
    function tekan(c) {
      if (selesai || tebak[c] !== undefined) return; var w = W[i].word, ada = w.indexOf(c) > -1; tebak[c] = ada;
      var b = $('.kbk[data-c="' + c + '"]', root); if (b) { b.disabled = true; b.classList.add(ada ? 'ok' : 'bad'); }
      if (ada) sfx.ok(); else { salah++; sfx.bad(); }
      var menang = w.split('').every(function (x) { return tebak[x]; }), kalah = salah >= 6;
      if (menang || kalah) { selesai = true; if (menang) benar++; $$('.kbk', root).forEach(function (k) { k.disabled = true; }); gambar(); var last = i + 1 >= n;
        $('#fb', root).innerHTML = explain(menang, menang ? 'Hebat! Kata ditemukan.' : 'Kesempatan habis. Katanya: ' + w, ''); nextBar(root, last ? 'Lihat Hasil' : 'Kata Berikutnya', function () { if (last) { sfx.win(); H.finish(done, res(pl, Math.round(benar / n * 100), benar, n), [], t0); } else { i++; render(); } }); } else gambar();
    }
    function key(e) { if (e.target.matches('input,textarea')) return; var c = e.key.toUpperCase(); if (/^[A-Z]$/.test(c)) tekan(c); }
    document.addEventListener('keydown', key); render();
    return { destroy: function () { document.removeEventListener('keydown', key); } };
  });

  /* ============================ CARI KATA ============================ */
  function buatGrid(words) {
    var maxLen = Math.max.apply(null, words.map(function (w) { return w.word.length; })), N = clamp(maxLen + 2, 8, 11), grid = [], placed = [], dirs = [[0, 1], [1, 0], [1, 1]];
    for (var r = 0; r < N; r++) { grid.push([]); for (var c = 0; c < N; c++) grid[r].push(''); }
    words.slice().sort(function (a, b) { return b.word.length - a.word.length; }).forEach(function (w) {
      for (var t = 0; t < 80; t++) {
        var d = dirs[Math.floor(Math.random() * dirs.length)], r0 = Math.floor(Math.random() * N), c0 = Math.floor(Math.random() * N), ok = true;
        for (var k = 0; k < w.word.length && ok; k++) { var rr = r0 + d[0] * k, cc = c0 + d[1] * k; if (rr >= N || cc >= N || (grid[rr][cc] && grid[rr][cc] !== w.word[k])) ok = false; }
        if (!ok) continue;
        for (var q = 0; q < w.word.length; q++) grid[r0 + d[0] * q][c0 + d[1] * q] = w.word[q];
        placed.push({ w: w, r: r0, c: c0, dr: d[0], dc: d[1] }); return;
      }
    });
    var abj = 'ABCDEFGHIJKLMNOPRSTU'; for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) if (!grid[y][x]) grid[y][x] = abj[Math.floor(Math.random() * abj.length)];
    return { grid: grid, placed: placed, N: N };
  }
  G.register('carikata', function (root, g, pl, done) {
    var L = buatGrid(g.konten.words), N = L.N, found = {}, start = null, t0 = Date.now(), secs = 0, timer = null, total = L.placed.length;
    var cellsFound = {};
    function render() {
      root.innerHTML = '<div class="arena arena-wide sk-ws">' + H.top(g, H.chip('timer', '<span id="wt">' + UI.fmtDur(secs) + '</span>', 'ar-time') + H.chip('search', '<span id="wf">' + Object.keys(found).length + '</span>/' + total + ' kata')) + '<div class="ws-w"><div class="ws" style="--n:' + N + '">' + L.grid.map(function (row, r) { return row.map(function (ch, c) { return '<button class="wc" data-r="' + r + '" data-c="' + c + '">' + ch + '</button>'; }).join(''); }).join('') + '</div><div class="ws-l"><h3>Cari kata ini</h3><ul id="wl">' + L.placed.map(function (p, k) { return '<li data-k="' + k + '">' + (p.w.emoji ? esc(p.w.emoji) + ' ' : '') + esc(p.w.clue) + ' <small>(' + p.w.word.length + ' huruf)</small></li>'; }).join('') + '</ul><p class="muted">Ketuk huruf pertama lalu huruf terakhir kata. Arah: mendatar, menurun, atau diagonal ↘.</p></div></div><div id="fb" class="fb"></div><div class="ar-foot"><button class="btn btn-primary btn-lg btn-block" id="fin">Selesai ' + ic('check', 20) + '</button></div></div>';
      UI.bind(root); Object.keys(cellsFound).forEach(function (k) { var b = cel(k); if (b) b.classList.add('found'); });
      $$('.wc', root).forEach(function (b) { b.addEventListener('click', function () { tap(+b.getAttribute('data-r'), +b.getAttribute('data-c')); }); });
      $('#fin', root).addEventListener('click', akhir);
      clearInterval(timer); timer = setInterval(function () { secs++; var t = $('#wt', root); if (t) t.textContent = UI.fmtDur(secs); }, 1000);
    }
    function cel(k) { var p = k.split(','); return $('.wc[data-r="' + p[0] + '"][data-c="' + p[1] + '"]', root); }
    function tap(r, c) {
      if (!start) { start = { r: r, c: c }; cel(r + ',' + c).classList.add('st'); sfx.tick(); return; }
      var dr = r - start.r, dc = c - start.c, len = Math.max(Math.abs(dr), Math.abs(dc)) + 1, lurus = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
      cel(start.r + ',' + start.c).classList.remove('st');
      if (lurus && len > 1) {
        var sr = Math.sign(dr), sc = Math.sign(dc), s = '', pos = [];
        for (var k = 0; k < len; k++) { s += L.grid[start.r + sr * k][start.c + sc * k]; pos.push((start.r + sr * k) + ',' + (start.c + sc * k)); }
        var rev = s.split('').reverse().join(''), hit = -1;
        L.placed.forEach(function (p, ix) { if (!found[ix] && (p.w.word === s || p.w.word === rev)) hit = ix; });
        if (hit > -1) { found[hit] = 1; pos.forEach(function (q) { cellsFound[q] = 1; var b = cel(q); if (b) b.classList.add('found'); }); var li = $('#wl li[data-k="' + hit + '"]', root); if (li) { li.classList.add('ok'); li.insertAdjacentHTML('beforeend', ' <b>' + L.placed[hit].w.word + '</b>'); } $('#wf', root).textContent = Object.keys(found).length; sfx.ok(); start = null; if (Object.keys(found).length === total) akhir(); return; }
      }
      sfx.bad(); start = null;
    }
    function akhir() { clearInterval(timer); var ok = Object.keys(found).length; sfx.win(); H.finish(done, res(pl, Math.round(ok / total * 100), ok, total), [], t0); }
    render(); return { destroy: function () { clearInterval(timer); } };
  });
})();
