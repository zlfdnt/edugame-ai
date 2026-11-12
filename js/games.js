/* ============================================================
   games.js — enam mesin permainan siswa:
   kuis • tts • kartu • duel • balok • labirin
   Games.start(root, game, player, onFinish, onQuit) → { destroy }
   Skor resmi dihitung ulang server untuk jenis berbasis pilihan ganda.
   ============================================================ */
(function () {
  'use strict';
  var esc = UI.esc, ic = UI.ic, $ = UI.$, $$ = UI.$$;
  var LBL = ['A', 'B', 'C', 'D', 'E'];
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------- efek suara (WebAudio, tanpa berkas) ---------- */
  var sfx = (function () {
    var ctx = null;
    function on() { return localStorage.getItem('edugame_sfx') !== 'off'; }
    function beep(f, d, type, vol, when) {
      if (!on()) return;
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + (when || 0);
        o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(vol || 0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d);
      } catch (e) { /* audio tidak tersedia */ }
    }
    return {
      on: on, toggle: function () { localStorage.setItem('edugame_sfx', on() ? 'off' : 'on'); return on(); },
      ok: function () { beep(660, 0.12, 'triangle'); beep(880, 0.16, 'triangle', 0.08, 0.1); },
      bad: function () { beep(200, 0.25, 'sawtooth', 0.06); },
      tick: function () { beep(520, 0.05, 'square', 0.03); },
      flip: function () { beep(420, 0.06, 'triangle', 0.05); },
      win: function () { [523, 659, 784, 1047].forEach(function (f, i) { beep(f, 0.2, 'triangle', 0.08, i * 0.13); }); }
    };
  })();

  function chip(icn, txt, cls) { return '<div class="ar-chip ' + (cls || '') + '">' + (icn ? ic(icn, 18) : '') + '<span>' + txt + '</span></div>'; }
  function top(g, right) {
    return '<div class="ar-top"><button class="icon-btn" data-quit aria-label="Keluar dari permainan">' + ic('back', 22) + '</button><div class="ar-title"><b>' + esc(g.judul) + '</b><small>' + esc(g.mapel) + ' • Fase ' + esc(g.fase) + '</small></div><div class="ar-right">' + right + '</div></div>';
  }
  function finish(done, list, jawaban, t0, extra) {
    var dur = Math.round((Date.now() - t0) / 1000);
    list.forEach(function (p) { p.durasi = dur; });
    done({ peserta: list, jawaban: jawaban || [], extra: extra || {} });
  }

  /* ============================================================
     1) KUIS KILAT
     ============================================================ */
  function kuis(root, g, pl, done) {
    var Q = g.konten.questions, n = Q.length, i = 0, pts = 0, streak = 0, benar = 0, ans = [], t0 = Date.now();
    var per = clamp(Math.round(g.durasi * 60 / n), 15, 60), sel = -1, kunci = false, left = per, timer = null, umpan = g.asesmen !== 'sumatif' && !g.kunciTersembunyi;
    function render() {
      var q = Q[i], pct = Math.round(i / n * 100);
      root.innerHTML = '<div class="arena">' + top(g, chip('timer', '<span id="kt">' + left + '</span> dtk', 'ar-time') + chip('star', '<span id="kp">' + pts + '</span> Poin', 'ar-pts')) +
        '<div class="ar-prog"><i style="width:' + pct + '%"></i></div><div class="ar-sub"><span class="pill">Soal ' + (i + 1) + ' / ' + n + '</span>' + (streak >= 2 ? '<span class="pill pill-fire">' + ic('fire', 14) + ' ' + streak + 'x combo</span>' : '') + '</div>' +
        '<div class="q-card card-fx shine">' + (q.emoji ? '<span class="emo big">' + esc(q.emoji) + '</span>' : '') + '<h2 class="q-text">' + esc(q.q) + '</h2></div><div class="opts" role="listbox">' +
        q.options.map(function (o, k) { return '<button class="opt card-fx" role="option" data-k="' + k + '"><span class="opt-l">' + LBL[k] + '</span><span class="opt-t">' + esc(o) + '</span><span class="opt-s"></span></button>'; }).join('') + '</div>' +
        '<div class="ar-foot"><div id="fb" class="fb"></div><button class="btn btn-primary btn-lg btn-block glow" id="go" disabled>Kirim & Lanjut ' + ic('arrow', 20) + '</button></div></div>';
      UI.bind(root); wire(); sel = -1; kunci = false; left = per; startTimer();
    }
    function wire() {
      $$('.opt', root).forEach(function (b) { b.addEventListener('click', function () { if (kunci) return; pilih(+b.getAttribute('data-k')); }); });
      $('#go', root).addEventListener('click', kirim);
    }
    function pilih(k) {
      sel = k; sfx.tick();
      $$('.opt', root).forEach(function (b) { b.classList.toggle('sel', +b.getAttribute('data-k') === k); $('.opt-s', b).innerHTML = +b.getAttribute('data-k') === k ? ic('check', 18) : ''; });
      $('#go', root).disabled = false;
      $('#fb', root).innerHTML = '<span class="lock">' + ic('lock', 18) + ' Jawaban pilihan <b>' + LBL[k] + '</b> terkunci. Klik tombol untuk melangkah!</span>';
    }
    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        left--; var t = $('#kt', root); if (t) t.textContent = left;
        var cp = $('.ar-time', root); if (cp) cp.classList.toggle('warn', left <= 5);
        if (left <= 5 && left > 0) sfx.tick();
        if (left <= 0) kirim(true);
      }, 1000);
    }
    function kirim(otomatis) {
      if (kunci) { lanjut(); return; }
      kunci = true; clearInterval(timer);
      var q = Q[i], p = sel;
      ans.push({ i: i, p: p });
      var betul = umpan ? p === q.answer : null;
      if (umpan) {
        if (betul) { benar++; streak++; var bonus = Math.round(left / per * 50) + (streak >= 2 ? 25 * (streak - 1) : 0); pts += 100 + bonus; sfx.ok(); }
        else { streak = 0; sfx.bad(); }
        $$('.opt', root).forEach(function (b) { var k = +b.getAttribute('data-k'); b.disabled = true; if (k === q.answer) b.classList.add('ok'); else if (k === p) b.classList.add('bad'); });
        $('#kp', root).textContent = pts;
        $('#fb', root).innerHTML = '<div class="explain ' + (betul ? 'good' : 'wrong') + '"><b>' + (p === -1 ? 'Waktu habis.' : betul ? 'Benar! ' + (streak >= 2 ? streak + 'x combo.' : '') : 'Belum tepat.') + '</b> ' + esc(q.explain || 'Jawaban yang benar: ' + LBL[q.answer] + '.') + '</div>';
        var go = $('#go', root); go.disabled = false; go.innerHTML = (i + 1 >= n ? 'Lihat Hasil' : 'Soal Berikutnya') + ' ' + ic('arrow', 20);
        if (otomatis === true) { /* beri waktu baca penjelasan */ }
      } else { lanjut(); }
    }
    function lanjut() {
      if (i + 1 >= n) {
        clearInterval(timer);
        var skor = Math.round((umpan ? benar : estimasiBenar()) / n * 100);
        finish(done, [{ nama: pl.nama, kelas: pl.kelas, avatar: pl.avatar, skor: skor, benar: umpan ? benar : estimasiBenar(), total: n }], ans, t0, { poin: pts });
        return;
      }
      i++; render();
    }
    function estimasiBenar() { return g.konten.questions[0] && g.konten.questions[0].answer !== undefined ? ans.filter(function (a) { var q = Q[a.i]; return q && a.p === q.answer; }).length : 0; }
    function key(e) {
      if (e.target.matches('input,textarea')) return;
      var k = e.key.toUpperCase(), ix = LBL.indexOf(k); if (ix < 0 && /^[1-5]$/.test(k)) ix = +k - 1;
      if (ix > -1 && !kunci && ix < Q[i].options.length) pilih(ix);
      else if (e.key === 'Enter') { var go = $('#go', root); if (go && !go.disabled) { e.preventDefault(); kirim(); } }
    }
    document.addEventListener('keydown', key); render();
    return { destroy: function () { clearInterval(timer); document.removeEventListener('keydown', key); } };
  }

  /* ============================================================
     2) DUEL CEPAT TANGGAP TIM  (satu layar, dua kelompok)
     ============================================================ */
  function duel(root, g, pl, done) {
    var Q = g.konten.questions, n = Q.length, i = 0, teams = (pl.teams && pl.teams.length ? pl.teams : [pl.nama || 'Tim A', 'Tim B']).slice(0, 2), t0 = Date.now();
    var sc = [0, 0], bn = [0, 0], fase = 'buzz', pemegang = -1, sudah = [], timer = null, left = 0;
    function render() {
      var q = Q[i], beda = sc[0] - sc[1], pos = clamp(50 + beda / Math.max(1, n * 10) * 50, 6, 94);
      root.innerHTML = '<div class="arena arena-wide">' + top(g, chip('flag', 'Soal ' + (i + 1) + '/' + n)) +
        '<div class="tug"><div class="tug-bar"><i style="width:' + pos + '%"></i><b style="left:' + pos + '%"></b></div><div class="tug-names"><span class="t1">' + esc(teams[0]) + ' <em>' + sc[0] + '</em></span><span class="t2"><em>' + sc[1] + '</em> ' + esc(teams[1]) + '</span></div></div>' +
        '<div class="q-card card-fx shine"><h2 class="q-text">' + esc(q.q) + '</h2><div class="duel-timer" id="dt"></div></div>' +
        '<div class="opts opts-2" id="dopts">' + q.options.map(function (o, k) { return '<button class="opt" data-k="' + k + '" disabled><span class="opt-l">' + LBL[k] + '</span><span class="opt-t">' + esc(o) + '</span></button>'; }).join('') + '</div>' +
        '<div class="buzzers"><button class="buzz b1 glow" data-t="0"><b>' + esc(teams[0]) + '</b><small>Tekan atau tombol <kbd>Q</kbd></small></button><button class="buzz b2 glow" data-t="1"><b>' + esc(teams[1]) + '</b><small>Tekan atau tombol <kbd>P</kbd></small></button></div><div id="dmsg" class="fb">Siapa tercepat? Tekan buzzer tim kamu!</div></div>';
      UI.bind(root); fase = 'buzz'; pemegang = -1; sudah = [];
      $$('.buzz', root).forEach(function (b) { b.addEventListener('click', function () { buzz(+b.getAttribute('data-t')); }); });
      $$('.opt', root).forEach(function (b) { b.addEventListener('click', function () { jawab(+b.getAttribute('data-k')); }); });
    }
    function buzz(t) {
      if (fase !== 'buzz' || sudah.indexOf(t) > -1) return;
      fase = 'jawab'; pemegang = t; sfx.tick();
      $$('.buzz', root).forEach(function (b) { b.disabled = true; b.classList.toggle('on', +b.getAttribute('data-t') === t); });
      $$('.opt', root).forEach(function (b) { b.disabled = false; });
      $('#dmsg', root).innerHTML = '<b>' + esc(teams[t]) + '</b> menjawab! Pilih jawaban dalam <span id="dl">10</span> detik.';
      left = 10; clearInterval(timer);
      timer = setInterval(function () { left--; var d = $('#dl', root); if (d) d.textContent = left; if (left <= 0) { clearInterval(timer); jawab(-1); } }, 1000);
    }
    function jawab(k) {
      if (fase !== 'jawab') return; clearInterval(timer);
      var q = Q[i], betul = k === q.answer;
      $$('.opt', root).forEach(function (b) { b.disabled = true; var kk = +b.getAttribute('data-k'); if (betul && kk === q.answer) b.classList.add('ok'); if (kk === k && !betul) b.classList.add('bad'); });
      if (betul) {
        sc[pemegang] += 10; bn[pemegang]++; sfx.ok(); fase = 'selesai';
        $('#dmsg', root).innerHTML = '<div class="explain good"><b>' + esc(teams[pemegang]) + ' benar! +10.</b> ' + esc(q.explain || '') + '</div>' + next();
      } else {
        sudah.push(pemegang); sfx.bad();
        if (sudah.length >= 2) { fase = 'selesai'; $('#dmsg', root).innerHTML = '<div class="explain wrong"><b>Kedua tim belum tepat.</b> Jawaban: ' + LBL[q.answer] + '. ' + esc(q.explain || '') + '</div>' + next(); }
        else {
          var lain = 1 - pemegang; fase = 'buzz';
          $('#dmsg', root).innerHTML = '<div class="explain wrong"><b>' + esc(teams[pemegang]) + ' belum tepat.</b> Kesempatan untuk <b>' + esc(teams[lain]) + '</b> — tekan buzzer!</div>';
          $$('.opt', root).forEach(function (b) { b.classList.remove('bad'); b.disabled = true; });
          $$('.buzz', root).forEach(function (b) { var t = +b.getAttribute('data-t'); b.disabled = t === pemegang; b.classList.remove('on'); });
        }
      }
    }
    function next() { return '<button class="btn btn-primary btn-lg glow" id="dnext" style="margin-top:12px">' + (i + 1 >= n ? 'Lihat Pemenang' : 'Soal Berikutnya') + ' ' + ic('arrow', 20) + '</button>'; }
    root.addEventListener('click', function (e) {
      if (!e.target.closest('#dnext')) return;
      if (i + 1 >= n) {
        sfx.win();
        finish(done, teams.map(function (t, x) { return { nama: t, kelas: pl.kelas, avatar: pl.avatar, skor: Math.round(bn[x] / n * 100), benar: bn[x], total: n }; }), [], t0, { sc: sc });
      } else { i++; render(); }
    });
    function key(e) { if (e.target.matches('input,textarea')) return; var k = e.key.toLowerCase(); if (k === 'q') buzz(0); else if (k === 'p') buzz(1); else if (fase === 'jawab') { var ix = LBL.indexOf(e.key.toUpperCase()); if (ix > -1 && ix < Q[i].options.length) jawab(ix); } }
    document.addEventListener('keydown', key); render();
    return { destroy: function () { clearInterval(timer); document.removeEventListener('keydown', key); } };
  }

  /* ============================================================
     3) PETUALANGAN KARTU & MEMORI
     ============================================================ */
  function kartu(root, g, pl, done) {
    var P = g.konten.pairs, n = P.length, cards = [], open = [], matched = 0, moves = 0, t0 = Date.now(), lock = false, timer = null, secs = 0;
    P.forEach(function (p, k) { cards.push({ k: k, t: p.a, side: 'a' }); cards.push({ k: k, t: p.b, side: 'b' }); });
    cards = UI.shuffle(cards);
    var cols = cards.length <= 8 ? 4 : cards.length <= 12 ? 4 : cards.length <= 16 ? 4 : 5;
    root.innerHTML = '<div class="arena">' + top(g, chip('timer', '<span id="mt">00:00</span>', 'ar-time') + chip('refresh', '<span id="mm">0</span> langkah')) +
      '<div class="ar-sub"><span class="pill">Cocokkan istilah dengan pasangannya</span><span class="pill" id="mp">0 / ' + n + ' cocok</span></div>' +
      '<div class="memo" style="--cols:' + cols + '">' + cards.map(function (c, x) { return '<button class="mcard" data-x="' + x + '" aria-label="Kartu tertutup"><span class="mc-in"><span class="mc-f">' + ic('sparkles', 28) + '</span><span class="mc-b ' + c.side + '">' + esc(c.t) + '</span></span></button>'; }).join('') + '</div><div id="fb" class="fb"></div></div>';
    UI.bind(root);
    timer = setInterval(function () { secs++; var t = $('#mt', root); if (t) t.textContent = UI.fmtDur(secs); }, 1000);
    $$('.mcard', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var x = +b.getAttribute('data-x');
        if (lock || b.classList.contains('open') || b.classList.contains('done')) return;
        b.classList.add('open'); open.push(x); sfx.flip();
        if (open.length === 2) {
          moves++; $('#mm', root).textContent = moves; lock = true;
          var a = cards[open[0]], c = cards[open[1]], A = $$('.mcard', root)[open[0]], B = $$('.mcard', root)[open[1]];
          if (a.k === c.k) {
            setTimeout(function () { A.classList.add('done'); B.classList.add('done'); matched++; $('#mp', root).textContent = matched + ' / ' + n + ' cocok'; sfx.ok(); open = []; lock = false; if (matched === n) selesai(); }, 380);
          } else { setTimeout(function () { A.classList.remove('open'); B.classList.remove('open'); open = []; lock = false; sfx.bad(); }, 900); }
        }
      });
    });
    function selesai() {
      clearInterval(timer); sfx.win();
      var skor = Math.max(20, Math.round(100 * n / Math.max(n, moves)));
      finish(done, [{ nama: pl.nama, kelas: pl.kelas, avatar: pl.avatar, skor: skor, benar: n, total: n }], [], t0, { langkah: moves });
    }
    return { destroy: function () { clearInterval(timer); } };
  }

  /* ============================================================
     4) SUSUN BALOK URUTAN LOGIKA  (seret atau ketuk-tukar)
     ============================================================ */
  function balok(root, g, pl, done) {
    var S = g.konten.sequences, r = 0, benarTot = 0, totTot = 0, t0 = Date.now(), order = [], pick = -1, dragFrom = -1, dicek = false;
    function acak(steps) { var idx = steps.map(function (_, k) { return k; }), a, tries = 0; do { a = UI.shuffle(idx); tries++; } while (a.every(function (v, k) { return v === k; }) && tries < 12); return a; }
    function render() {
      var s = S[r]; if (!order.length) order = acak(s.steps); dicek = false; pick = -1;
      root.innerHTML = '<div class="arena">' + top(g, chip('layers', 'Urutan ' + (r + 1) + '/' + S.length)) + '<div class="q-card card-fx shine"><span class="pill">Susun dengan urutan yang benar</span><h2 class="q-text">' + esc(s.title) + '</h2><p class="muted">Seret balok, atau ketuk dua balok untuk menukar posisinya.</p></div><div class="blocks" id="bl"></div><div class="ar-foot"><div id="fb" class="fb"></div><button class="btn btn-primary btn-lg btn-block glow" id="cek">Periksa Urutan ' + ic('check', 20) + '</button></div></div>';
      UI.bind(root); draw(); $('#cek', root).addEventListener('click', cek);
    }
    function draw() {
      var s = S[r], host = $('#bl', root);
      host.innerHTML = order.map(function (v, pos) { return '<div class="blk' + (pick === pos ? ' pick' : '') + '" draggable="' + (dicek ? 'false' : 'true') + '" data-p="' + pos + '" tabindex="0"><span class="blk-n">' + (pos + 1) + '</span><span class="blk-t">' + esc(s.steps[v]) + '</span></div>'; }).join('');
      $$('.blk', host).forEach(function (b) {
        var p = +b.getAttribute('data-p');
        b.addEventListener('click', function () { if (dicek) return; if (pick < 0) { pick = p; draw(); } else { if (pick !== p) swap(pick, p); pick = -1; draw(); sfx.flip(); } });
        b.addEventListener('keydown', function (e) { if (dicek) return; if (e.key === 'ArrowUp' && p > 0) { swap(p, p - 1); draw(); $$('.blk', host)[p - 1].focus(); e.preventDefault(); } if (e.key === 'ArrowDown' && p < order.length - 1) { swap(p, p + 1); draw(); $$('.blk', host)[p + 1].focus(); e.preventDefault(); } });
        b.addEventListener('dragstart', function (e) { dragFrom = p; b.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(p)); } catch (x) { /* abaikan */ } });
        b.addEventListener('dragend', function () { b.classList.remove('drag'); });
        b.addEventListener('dragover', function (e) { e.preventDefault(); b.classList.add('over'); });
        b.addEventListener('dragleave', function () { b.classList.remove('over'); });
        b.addEventListener('drop', function (e) { e.preventDefault(); if (dragFrom > -1 && dragFrom !== p) { swap(dragFrom, p); sfx.flip(); } dragFrom = -1; pick = -1; draw(); });
      });
    }
    function swap(a, b) { var t = order[a]; order[a] = order[b]; order[b] = t; }
    function cek() {
      if (dicek) { lanjut(); return; }
      dicek = true; var s = S[r], ok = 0;
      $$('.blk', root).forEach(function (b, pos) { var betul = order[pos] === pos; if (betul) ok++; b.classList.add(betul ? 'ok' : 'bad'); b.setAttribute('draggable', 'false'); });
      benarTot += ok; totTot += s.steps.length; (ok === s.steps.length ? sfx.ok : sfx.bad)();
      $('#fb', root).innerHTML = ok === s.steps.length ? '<div class="explain good"><b>Sempurna!</b> Semua langkah berurutan benar.</div>' : '<div class="explain wrong"><b>' + ok + ' dari ' + s.steps.length + ' posisi benar.</b> Urutan yang benar:<ol>' + s.steps.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol></div>';
      $('#cek', root).innerHTML = (r + 1 >= S.length ? 'Lihat Hasil' : 'Urutan Berikutnya') + ' ' + ic('arrow', 20);
    }
    function lanjut() {
      if (r + 1 >= S.length) { sfx.win(); finish(done, [{ nama: pl.nama, kelas: pl.kelas, avatar: pl.avatar, skor: Math.round(benarTot / totTot * 100), benar: benarTot, total: totTot }], [], t0); return; }
      r++; order = []; render();
    }
    render(); return { destroy: function () {} };
  }

  /* ============================================================
     5) TEKA-TEKI SILANG  (penyusun grid otomatis)
     ============================================================ */
  function susunTTS(words) {
    var list = words.slice().sort(function (a, b) { return b.word.length - a.word.length; }), cells = {}, placed = [], gagal = [];
    function key(r, c) { return r + ',' + c; }
    function cocok(w, r, c, dir) {
      var dr = dir === 'D' ? 1 : 0, dc = dir === 'A' ? 1 : 0, adaSilang = false;
      if (cells[key(r - dr, c - dc)]) return false;
      if (cells[key(r + dr * w.length, c + dc * w.length)]) return false;
      for (var i = 0; i < w.length; i++) {
        var rr = r + dr * i, cc = c + dc * i, ex = cells[key(rr, cc)];
        if (ex) { if (ex.ch !== w[i]) return false; if (ex.dir[dir]) return false; adaSilang = true; }
        else { if (cells[key(rr + dc, cc + dr)] || cells[key(rr - dc, cc - dr)]) return false; }
      }
      return adaSilang;
    }
    function taruh(w, r, c, dir) {
      var dr = dir === 'D' ? 1 : 0, dc = dir === 'A' ? 1 : 0;
      for (var i = 0; i < w.word.length; i++) { var k = key(r + dr * i, c + dc * i); if (!cells[k]) cells[k] = { ch: w.word[i], dir: {}, r: r + dr * i, c: c + dc * i }; cells[k].dir[dir] = placed.length; }
      placed.push({ word: w.word, clue: w.clue, r: r, c: c, dir: dir });
    }
    list.forEach(function (w, ix) {
      if (!ix) { taruh(w, 0, 0, 'A'); return; }
      var best = null;
      Object.keys(cells).forEach(function (k) {
        var cell = cells[k];
        for (var i = 0; i < w.word.length; i++) {
          if (w.word[i] !== cell.ch) continue;
          ['A', 'D'].forEach(function (dir) {
            var r = cell.r - (dir === 'D' ? i : 0), c = cell.c - (dir === 'A' ? i : 0);
            if (cocok(w.word, r, c, dir)) { var sk = Math.abs(r) + Math.abs(c); if (!best || sk < best.sk) best = { r: r, c: c, dir: dir, sk: sk }; }
          });
        }
      });
      if (best) taruh(w, best.r, best.c, best.dir); else gagal.push(w);
    });
    var minR = 0, minC = 0, maxR = 0, maxC = 0;
    Object.keys(cells).forEach(function (k) { var x = cells[k]; minR = Math.min(minR, x.r); minC = Math.min(minC, x.c); maxR = Math.max(maxR, x.r); maxC = Math.max(maxC, x.c); });
    placed.forEach(function (p) { p.r -= minR; p.c -= minC; });
    var nomor = {}, cnt = 0;
    placed.slice().sort(function (a, b) { return a.r - b.r || a.c - b.c; }).forEach(function (p) { var k = p.r + ',' + p.c; if (!nomor[k]) nomor[k] = ++cnt; p.no = nomor[k]; });
    return { placed: placed, gagal: gagal, rows: maxR - minR + 1, cols: maxC - minC + 1 };
  }
  function tts(root, g, pl, done) {
    var L = susunTTS(g.konten.words), t0 = Date.now(), grid = {}, sudah = false;
    L.placed.forEach(function (p) { for (var i = 0; i < p.word.length; i++) { var r = p.r + (p.dir === 'D' ? i : 0), c = p.c + (p.dir === 'A' ? i : 0), k = r + ',' + c; grid[k] = grid[k] || { ch: p.word[i], no: 0 }; if (i === 0) grid[k].no = p.no; } });
    var mend = L.placed.filter(function (p) { return p.dir === 'A'; }).sort(function (a, b) { return a.no - b.no; }), menu = L.placed.filter(function (p) { return p.dir === 'D'; }).sort(function (a, b) { return a.no - b.no; });
    var html = '';
    for (var r = 0; r < L.rows; r++) for (var c = 0; c < L.cols; c++) { var cell = grid[r + ',' + c]; html += cell ? '<div class="xc"><input maxlength="1" data-r="' + r + '" data-c="' + c + '" autocomplete="off" autocapitalize="characters" aria-label="Kotak ' + (r + 1) + ',' + (c + 1) + '">' + (cell.no ? '<i>' + cell.no + '</i>' : '') + '</div>' : '<div class="xc xb"></div>'; }
    function daftar(arr) { return arr.map(function (p) { return '<li><b>' + p.no + '.</b> ' + esc(p.clue) + ' <small>(' + p.word.length + ' huruf)</small></li>'; }).join(''); }
    root.innerHTML = '<div class="arena arena-wide">' + top(g, chip('grid', L.placed.length + (L.gagal.length ? '+' + L.gagal.length : '') + ' kata')) +
      '<div class="tts-wrap"><div class="xgrid" style="--cols:' + L.cols + '">' + html + '</div><div class="clues"><h3>Mendatar →</h3><ol>' + daftar(mend) + '</ol><h3>Menurun ↓</h3><ol>' + daftar(menu) + '</ol>' +
      (L.gagal.length ? '<h3>Kata tambahan</h3>' + L.gagal.map(function (w, i) { return '<div class="extra"><label>' + esc(w.clue) + ' <small>(' + w.word.length + ' huruf)</small></label><input class="inp" data-ex="' + i + '" maxlength="' + w.word.length + '" autocapitalize="characters"></div>'; }).join('') : '') + '</div></div>' +
      '<div class="ar-foot"><div id="fb" class="fb"></div><button class="btn btn-primary btn-lg btn-block glow" id="cek">Periksa Jawaban ' + ic('check', 20) + '</button></div></div>';
    UI.bind(root);
    var inputs = $$('.xgrid input', root);
    function geser(el, dr, dc) { var n = $('.xgrid input[data-r="' + (+el.dataset.r + dr) + '"][data-c="' + (+el.dataset.c + dc) + '"]', root); if (n) n.focus(); return !!n; }
    inputs.forEach(function (inp) {
      inp.addEventListener('input', function () { inp.value = inp.value.toUpperCase().replace(/[^A-Z]/g, ''); if (inp.value) { sfx.tick(); if (!geser(inp, 0, 1)) geser(inp, 1, 0); } });
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') geser(inp, 0, 1); else if (e.key === 'ArrowLeft') geser(inp, 0, -1); else if (e.key === 'ArrowDown') geser(inp, 1, 0); else if (e.key === 'ArrowUp') geser(inp, -1, 0);
        else if (e.key === 'Backspace' && !inp.value) { if (!geser(inp, 0, -1)) geser(inp, -1, 0); }
      });
      inp.addEventListener('focus', function () { inp.select(); });
    });
    $('#cek', root).addEventListener('click', function () {
      if (sudah) { selesai(); return; }
      sudah = true; var benar = 0;
      L.placed.forEach(function (p) {
        var ok = true;
        for (var i = 0; i < p.word.length; i++) { var r = p.r + (p.dir === 'D' ? i : 0), c = p.c + (p.dir === 'A' ? i : 0), inp = $('.xgrid input[data-r="' + r + '"][data-c="' + c + '"]', root); if ((inp.value || '') !== p.word[i]) ok = false; }
        if (ok) benar++;
        for (var j = 0; j < p.word.length; j++) { var rr = p.r + (p.dir === 'D' ? j : 0), cc = p.c + (p.dir === 'A' ? j : 0), ip = $('.xgrid input[data-r="' + rr + '"][data-c="' + cc + '"]', root); ip.parentNode.classList.add((ip.value || '') === p.word[j] ? 'ok' : 'bad'); }
      });
      $$('.extra .inp', root).forEach(function (inp) { var w = L.gagal[+inp.dataset.ex]; var ok = inp.value.toUpperCase() === w.word; if (ok) benar++; inp.classList.add(ok ? 'ok' : 'bad'); inp.value = ok ? inp.value : inp.value + ' → ' + w.word; });
      var total = L.placed.length + L.gagal.length; (benar === total ? sfx.ok : sfx.bad)();
      $$('.xgrid input', root).forEach(function (i) { i.readOnly = true; });
      $('#fb', root).innerHTML = '<div class="explain ' + (benar === total ? 'good' : 'wrong') + '"><b>' + benar + ' dari ' + total + ' kata benar.</b> Kotak merah menandai huruf yang belum tepat.</div>';
      $('#cek', root).innerHTML = 'Lihat Hasil ' + ic('arrow', 20); root._benar = benar; root._total = total;
    });
    function selesai() { sfx.win(); var b = root._benar || 0, t = root._total || (L.placed.length + L.gagal.length); finish(done, [{ nama: pl.nama, kelas: pl.kelas, avatar: pl.avatar, skor: Math.round(b / t * 100), benar: b, total: t }], [], t0); }
    return { destroy: function () {} };
  }

  /* ============================================================
     6) LABIRIN TRIVIA  (jalur ular + gerbang pertanyaan, 3 nyawa)
     ============================================================ */
  function labirin(root, g, pl, done) {
    var Q = g.konten.questions, n = Q.length, COLS = 7, k = Math.max(3, Math.ceil((3 * n + 3 - 1) / (COLS + 1)) + 0), path = [], t0 = Date.now();
    var ROWS = 2 * k - 1, walls = {};
    for (var rr = 0; rr < ROWS; rr++) {
      if (rr % 2 === 0) { var kiri = (rr / 2) % 2 === 0; for (var cc = 0; cc < COLS; cc++) path.push({ r: rr, c: kiri ? cc : COLS - 1 - cc }); }
      else { var tepi = ((rr - 1) / 2) % 2 === 0 ? COLS - 1 : 0; path.push({ r: rr, c: tepi }); }
    }
    var L = path.length, gates = [];
    for (var q = 0; q < n; q++) gates.push(Math.max(2, Math.round((q + 1) * (L - 2) / (n + 1))) + 0);
    for (var gi = 1; gi < gates.length; gi++) if (gates[gi] <= gates[gi - 1]) gates[gi] = gates[gi - 1] + 1;
    var pos = 0, qi = 0, nyawa = 3, benar = 0, ans = [], busy = false, kunci = false, umpan = g.asesmen !== 'sumatif' && !g.kunciTersembunyi;
    var onPath = {}; path.forEach(function (p, ix) { onPath[p.r + ',' + p.c] = ix; });
    var cells = '';
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var ix = onPath[r + ',' + c], cls = ix === undefined ? 'mz wall' : 'mz', inner = '';
      if (ix !== undefined) { var gq = gates.indexOf(ix); if (gq > -1) { cls += ' gate'; inner = '<span data-g="' + gq + '">?</span>'; } else if (ix === 0) inner = '<span>' + ic('flag', 16) + '</span>'; else if (ix === L - 1) { cls += ' goal'; inner = '<span>' + ic('star', 18) + '</span>'; } }
      cells += '<div class="' + cls + '" data-i="' + (ix === undefined ? '' : ix) + '">' + inner + '</div>';
    }
    root.innerHTML = '<div class="arena arena-wide">' + top(g, chip('heart', '<span id="ny">' + hati(nyawa) + '</span>', 'ar-lives') + chip('flag', '<span id="lg">0</span>/' + n + ' gerbang')) +
      '<div class="maze-wrap"><div class="maze" id="mz" style="--cols:' + COLS + ';--rows:' + ROWS + '">' + cells + '<div class="token" id="tk">' + (pl.avatar || '🙂') + '</div></div><div class="qpanel" id="qp"><div class="q-card"><p class="muted">Menuju gerbang pertama…</p></div></div></div></div>';
    UI.bind(root);
    function hati(n2) { var s = ''; for (var i = 0; i < 3; i++) s += i < n2 ? '❤️' : '🖤'; return s; }
    function geser(ix, animate) {
      var m = $('#mz', root), cell = $$('.mz', m)[path[ix].r * COLS + path[ix].c], tk = $('#tk', root);
      tk.style.left = cell.offsetLeft + 'px'; tk.style.top = cell.offsetTop + 'px'; tk.style.width = cell.offsetWidth + 'px'; tk.style.height = cell.offsetHeight + 'px';
      if (!animate) { tk.style.transition = 'none'; requestAnimationFrame(function () { tk.style.transition = ''; }); }
    }
    function maju(sampai, cb) {
      busy = true;
      (function langkah() { if (pos >= sampai) { busy = false; cb(); return; } pos++; geser(pos, true); sfx.tick(); setTimeout(langkah, 170); })();
    }
    function tanya() {
      if (qi >= n) { return maju(L - 1, selesai); }
      maju(Math.max(0, gates[qi] - 1), function () {
        var q = Q[qi]; kunci = false;
        $('#qp', root).innerHTML = '<div class="q-card card-fx shine"><span class="pill">Gerbang ' + (qi + 1) + ' dari ' + n + '</span><h2 class="q-text">' + esc(q.q) + '</h2></div><div class="opts opts-2">' + q.options.map(function (o, kk) { return '<button class="opt card-fx" data-k="' + kk + '"><span class="opt-l">' + LBL[kk] + '</span><span class="opt-t">' + esc(o) + '</span></button>'; }).join('') + '</div><div id="fb" class="fb"></div>';
        UI.bind(root);
        $$('.opt', root).forEach(function (b) { b.addEventListener('click', function () { if (!kunci) jawab(+b.getAttribute('data-k')); }); });
      });
    }
    function jawab(p) {
      kunci = true; var q = Q[qi]; ans.push({ i: qi, p: p });
      var betul = umpan ? p === q.answer : true;
      if (!umpan) { benar += 0; }
      $$('.opt', root).forEach(function (b) { b.disabled = true; var kk = +b.getAttribute('data-k'); if (umpan) { if (kk === q.answer) b.classList.add('ok'); else if (kk === p) b.classList.add('bad'); } else if (kk === p) b.classList.add('sel'); });
      var gate = $('[data-g="' + qi + '"]', root);
      if (umpan && !betul) { nyawa--; $('#ny', root).textContent = hati(nyawa); sfx.bad(); }
      else { if (umpan) { benar++; sfx.ok(); } }
      if (gate) { gate.textContent = umpan && !betul ? '✕' : '✓'; gate.parentNode.classList.add(umpan && !betul ? 'gate-bad' : 'gate-ok'); }
      $('#lg', root).textContent = qi + 1;
      $('#fb', root).innerHTML = umpan ? '<div class="explain ' + (betul ? 'good' : 'wrong') + '"><b>' + (betul ? 'Gerbang terbuka!' : 'Belum tepat — nyawa berkurang.') + '</b> ' + esc(q.explain || '') + '</div>' : '<div class="explain good"><b>Jawaban terkunci.</b> Gerbang terbuka.</div>';
      var habis = umpan && nyawa <= 0;
      setTimeout(function () {
        if (habis) { $('#fb', root).innerHTML += '<div class="explain wrong"><b>Nyawa habis.</b> Petualangan berakhir — soal tersisa dihitung belum terjawab.</div>'; setTimeout(selesai, 1800); return; }
        qi++; tanya();
      }, umpan ? 2300 : 700);
    }
    function selesai() {
      sfx.win(); var b = umpan ? benar : 0;
      finish(done, [{ nama: pl.nama, kelas: pl.kelas, avatar: pl.avatar, skor: Math.round(b / n * 100), benar: b, total: n }], ans, t0, { nyawa: nyawa });
    }
    var rz = function () { geser(pos, false); }; window.addEventListener('resize', rz);
    setTimeout(function () { geser(0, false); tanya(); }, 60);
    return { destroy: function () { window.removeEventListener('resize', rz); } };
  }

  var ENGINES = { kuis: kuis, duel: duel, kartu: kartu, balok: balok, tts: tts, labirin: labirin };
  function start(root, game, player, onFinish, onQuit) {
    var fn = ENGINES[game.engine], dead = false;
    if (!fn) { root.innerHTML = '<p class="muted">Jenis permainan belum didukung.</p>'; return { destroy: function () {} }; }
    var ctl = fn(root, game, player, function (r) { if (!dead) onFinish(r); });     // hasil terlambat dari permainan yang sudah ditinggalkan diabaikan
    function quit(e) {
      var b = e.target.closest && e.target.closest('[data-quit]'); if (!b) return;
      UI.confirm('Keluar dari permainan? Progres tidak akan tersimpan.', 'Keluar', true).then(function (y) { if (y) { dead = true; ctl.destroy(); if (onQuit) onQuit(); } });
    }
    root.addEventListener('click', quit);
    return { destroy: function () { dead = true; try { ctl.destroy(); } catch (e) { /* abaikan */ } root.removeEventListener('click', quit); } };
  }
  window.Games = { start: start, sfx: sfx, susunTTS: susunTTS, register: function (n, f) { ENGINES[n] = f; }, H: { top: top, chip: chip, finish: finish, clamp: clamp, LBL: LBL } };
})();
