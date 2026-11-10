/* ============================================================
   pages-guru.js — Dashboard, Permainan Saya, Buat Game (3 langkah),
   Prompt, Hasil & Bagikan, Rekap Nilai, Bantuan
   ============================================================ */
(function () {
  'use strict';
  var $ = UI.$, $$ = UI.$$, ic = UI.ic, esc = UI.esc, P = App.Pages;
  var KKM = 70;
  var ENG_COLOR = { kuis: '#1E40AF', tts: '#7C3AED', kartu: '#0891B2', duel: '#DC2626', balok: '#059669', labirin: '#9333EA' };
  function einfo(e) { return Content.ENGINE_INFO[e] || Content.ENGINE_INFO.kuis; }
  function stat(g) { return g.status === 'aktif' ? '<span class="st st-on">● Aktif</span>' : '<span class="st st-off">● ' + (g.status === 'draft' ? 'Draft' : 'Nonaktif') + '</span>'; }
  function metric(icn, cls, label, value, foot, tag) {
    return '<div class="metric card-fx shine" data-reveal><div class="m-top"><span class="m-ic ' + cls + '">' + ic(icn, 22) + '</span>' + (tag ? '<span class="tag">' + tag + '</span>' : '') + '</div><span class="m-l">' + label + '</span><b class="m-v">' + value + '</b><span class="m-f">' + foot + '</span></div>';
  }

  /* ============================== DASHBOARD ============================== */
  P.dashboard = function (p, ok) {
    if (!App.requireLogin()) return;
    var me = App.me();
    var c = App.panel('guru', 'dash', App.loading('Memuat dashboard…'));
    return Api.call('guru.dashboard').then(function (r) {
      if (!ok()) return;
      if (!r.success) { c.innerHTML = App.err(r.message, true); return; }
      var d = r.data, maks = Math.max(100, Math.max.apply(null, d.perKelas.map(function (k) { return k.rata; }).concat([0])));
      var tot = d.jenis.reduce(function (a, j) { return a + j.n; }, 0), acc = 0, stops = [];
      d.jenis.forEach(function (j) { var from = acc / Math.max(1, tot) * 360; acc += j.n; stops.push((ENG_COLOR[j.engine] || '#999') + ' ' + from + 'deg ' + (acc / Math.max(1, tot) * 360) + 'deg'); });
      c.innerHTML = '<div class="page-h"><div><span class="badge">KURIKULUM MERDEKA</span><h1>Dashboard Guru</h1><p>Selamat datang kembali, ' + esc((me.nama || 'Guru').split(',')[0]) + '! Pantau efektivitas modul gamifikasi kelas Anda.</p></div><div class="page-act"><a class="btn btn-outline" href="#/guru/rekap">' + ic('download', 18) + ' Unduh Laporan</a><a class="btn btn-primary glow shine" href="#/guru/buat">' + ic('plusc', 18) + ' Buat Game Baru</a></div></div>' +
        '<div class="metrics">' + metric('gamepad', 'm-blue', 'Total Permainan Dibuat', d.totalGame + ' Game', d.aktifGame + ' aktif saat ini', '') + metric('users', 'm-violet', 'Total Hasil Siswa', UI.fmtNum(d.totalSiswa) + ' Hasil', 'dari seluruh permainan Anda', '') + metric('trophy', 'm-green', 'Rata-rata Skor', String(d.rataSkor).replace('.', ','), d.totalSiswa ? d.tuntasPersen + '% siswa mencapai skor ≥ 75' : 'Belum ada hasil masuk', d.rataSkor >= 75 ? 'Baik sekali' : '') + metric('sparkles', 'm-amber', 'Prompt AI Disalin', d.promptCount + ' Kali', 'Riwayat tersimpan di akun Anda', 'Prompt AI') + '</div>' +
        '<div class="grid-2"><section class="card pad" data-reveal><h2 class="h-sm">Nilai Rata-rata per Kelas</h2><p class="muted">Rata-rata skor dari permainan yang diselesaikan siswa.</p>' +
        (d.perKelas.length ? '<div class="bars">' + d.perKelas.map(function (k) { return '<div class="bar"><b>' + String(k.rata).replace('.', ',') + '</b><i style="height:' + Math.max(4, k.rata / maks * 100) + '%"></i><span>' + esc(k.kelas) + '</span></div>'; }).join('') + '</div>' : '<div class="empty sm"><p>Belum ada hasil siswa. Bagikan kode permainan agar nilai mulai masuk.</p></div>') + '</section>' +
        '<section class="card pad" data-reveal><h2 class="h-sm">Sebaran Jenis Permainan</h2>' + (tot ? '<div class="donut-w"><div class="donut" style="background:conic-gradient(' + stops.join(',') + ')"><div><b>' + tot + '</b><small>TOTAL</small></div></div><ul class="legend">' + d.jenis.map(function (j) { return '<li><i style="background:' + ENG_COLOR[j.engine] + '"></i>' + esc(einfo(j.engine).nama) + '<b>' + j.n + '</b></li>'; }).join('') + '</ul></div>' : '<div class="empty sm"><p>Belum ada permainan.</p></div>') + '</section></div>' +
        '<section class="card" data-reveal><div class="card-h"><div><h2 class="h-sm">Permainan Terbaru</h2><p class="muted">Modul kuis interaktif yang baru dibuat atau sedang berjalan.</p></div><a class="link" href="#/guru/game">Lihat Semua ' + ic('arrow', 16) + '</a></div>' + tabelGame(d.terbaru) + '</section>' +
        '<section class="promo-dark" data-reveal><div><span class="badge badge-y">' + ic('bolt', 14) + ' Akselerasi AI Pengajaran</span><h2>Butuh materi game instan untuk jam pelajaran berikutnya?</h2><p>Salin struktur prompt berbasis capaian pembelajaran untuk ChatGPT/Gemini/Claude, atau bagikan kode permainan langsung ke siswa.</p></div><div class="promo-btns"><a class="btn btn-glass shine" href="#/guru/buat">' + ic('copy', 18) + ' Salin Prompt AI</a><a class="btn btn-accent glow shine" href="#/guru/game">' + ic('share', 18) + ' Bagikan Kode Siswa</a></div></section>';
      wireGameRows(c);
    });
  };
  function tabelGame(list) {
    if (!list.length) return '<div class="empty sm"><p>Belum ada permainan. <a href="#/guru/buat">Buat game pertama Anda</a>.</p></div>';
    return '<div class="tbl-w"><table class="tbl"><thead><tr><th>Judul Permainan</th><th>Mapel & Kelas</th><th>Mode</th><th>Siswa</th><th>Rata-rata</th><th>Status</th><th class="r">Aksi</th></tr></thead><tbody>' +
      list.map(function (g) {
        return '<tr><td><div class="gcell"><span class="gi" style="--c:' + ENG_COLOR[g.engine] + '">' + ic(einfo(g.engine).ikon, 20) + '</span><div><b>' + esc(g.judul) + '</b><small>Kode: <code>' + esc(g.kode) + '</code></small></div></div></td><td>' + esc(g.mapel) + '<small>Kelas ' + esc(g.kelas) + ' (Fase ' + esc(g.fase) + ')</small></td><td><span class="pill">' + (g.mode === 'kelompok' ? 'Kelompok' : 'Individu') + '</span></td><td><b>' + g.siswa + '</b> siswa</td><td><b>' + (g.siswa ? String(g.rata).replace('.', ',') : '—') + '</b>' + (g.siswa ? ' <small class="inl">/ 100</small>' : '') + '</td><td>' + stat(g) + '</td><td class="r act"><a class="icon-btn" title="Uji coba main" href="#/main/' + encodeURIComponent(g.kode) + '?uji=1" target="_blank" rel="noopener">' + ic('play', 18) + '</a><button class="icon-btn" title="Salin tautan" data-copy="' + esc(App.linkGame(g.kode)) + '">' + ic('link', 18) + '</button><a class="icon-btn" title="Buka halaman bagikan" href="#/guru/hasil/' + esc(g.id) + '">' + ic('eye', 18) + '</a></td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  function wireGameRows(c) {
    $$('[data-copy]', c).forEach(function (b) { b.addEventListener('click', function () { UI.salin(b.getAttribute('data-copy')).then(function (o) { UI.toast(o ? 'Tautan permainan disalin.' : 'Gagal menyalin. Salin manual dari halaman bagikan.', o ? 'ok' : 'err'); }); }); });
  }

  /* ============================== PERMAINAN SAYA ============================== */
  P.games = function (p, ok) {
    if (!App.requireLogin()) return;
    var c = App.panel('guru', 'game', App.loading('Memuat permainan…'));
    function load() {
      return Api.call('guru.games').then(function (r) {
        if (!ok()) return;
        if (!r.success) { c.innerHTML = App.err(r.message, true); return; }
        var L = r.data;
        c.innerHTML = '<div class="page-h"><div><h1>Permainan Saya</h1><p>Kelola status, tautan, dan hasil setiap permainan.</p></div><div class="page-act"><a class="btn btn-primary glow shine" href="#/guru/buat">' + ic('plusc', 18) + ' Buat Game Baru</a></div></div>' +
          (L.length ? '<div class="gcards">' + L.map(function (g) {
            return '<article class="card pad gcard card-fx shine" data-reveal style="--c:' + ENG_COLOR[g.engine] + '"><div class="gc-top"><span class="gi">' + ic(einfo(g.engine).ikon, 22) + '</span>' + stat(g) + '</div><h3>' + esc(g.judul) + '</h3><p class="muted">' + esc(g.mapel) + ' • Kelas ' + esc(g.kelas) + ' • ' + esc(einfo(g.engine).nama) + '</p><div class="gc-meta"><span>Kode <code>' + esc(g.kode) + '</code></span><span><b>' + g.siswa + '</b> siswa</span><span>Rata-rata <b>' + (g.siswa ? String(g.rata).replace('.', ',') : '—') + '</b></span></div><div class="gc-act"><a class="btn btn-primary btn-sm" href="#/guru/hasil/' + esc(g.id) + '">' + ic('share', 16) + ' Bagikan</a><a class="btn btn-outline btn-sm" href="#/guru/rekap?game=' + esc(g.id) + '">' + ic('clip', 16) + ' Nilai</a><button class="btn btn-outline btn-sm" data-tg="' + esc(g.id) + '" data-st="' + (g.status === 'aktif' ? 'nonaktif' : 'aktif') + '">' + (g.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan') + '</button><button class="icon-btn danger" data-del="' + esc(g.id) + '" title="Hapus">' + ic('trash', 18) + '</button></div></article>';
          }).join('') + '</div>' : '<div class="empty"><div class="empty-ic">' + ic('gamepad', 32) + '</div><h3>Belum ada permainan</h3><p>Buat permainan pertama dalam beberapa klik.</p><a class="btn btn-primary" href="#/guru/buat">Buat Game Baru</a></div>');
        UI.bind(c);
        $$('[data-tg]', c).forEach(function (b) { b.addEventListener('click', function () { Api.call('game.update', { id: b.getAttribute('data-tg'), status: b.getAttribute('data-st') }).then(function (r2) { UI.toast(r2.message, r2.success ? 'ok' : 'err'); load(); }); }); });
        $$('[data-del]', c).forEach(function (b) { b.addEventListener('click', function () { UI.confirm('Hapus permainan ini? Kode tidak dapat dimainkan lagi, tetapi nilai siswa tetap tersimpan.', 'Hapus', true).then(function (y) { if (y) Api.call('game.hapus', { id: b.getAttribute('data-del') }).then(function (r2) { UI.toast(r2.message, r2.success ? 'ok' : 'err'); load(); }); }); }); });
      });
    }
    return load();
  };

  /* ============================== BUAT GAME ============================== */
  P.buat = function (p, ok) {
    if (!App.requireLogin()) return;
    var S = App.draft(); S.step = S.step || 1;
    if (!S.kelasV) S.kelasV = 'SD-4';
    if (!S.asesmen) S.asesmen = 'formatif';
    if (!S.mode) S.mode = 'individu';
    if (!S.durasi) S.durasi = 15;
    if (!S.tingkat) S.tingkat = 'sedang';
    var tpls = (App.templat.length ? App.templat : []).filter(function (t) { return t.status !== 'arsip'; });
    if (!S.templateId && tpls[0]) { S.templateId = tpls[0].id; S.engine = tpls[0].engine; }
    var tplSel = tpls.filter(function (t) { return t.id === S.templateId; })[0]; if (tplSel) S.engine = tplSel.engine;
    function kelasInfo() { return Content.KELAS.filter(function (k) { return k.v === S.kelasV; })[0] || Content.KELAS[3]; }
    function meta() {
      var k = kelasInfo(), info = einfo(S.engine);
      var m = { jenjang: k.jenjang, kelas: k.kelas, fase: k.fase, mapel: S.mapel, materi: S.materi, asesmen: S.asesmen, mode: S.engine === 'duel' ? 'kelompok' : S.mode, durasi: S.durasi, tingkat: S.tingkat, engine: S.engine, templateId: S.templateId };
      m.judul = (S.judul || (info.nama.split(' ').slice(0, 2).join(' ') + ': ' + S.materi)).slice(0, 140);
      m.tujuan = S.tujuan || Content.susunTP(m); m.unsur = Content.susunUnsur(m); m.unsurPd = Content.ringkasUnsur(m.unsur);
      return m;
    }
    function simpan() { App.draft(S); }
    var c;
    function render() {
      simpan(); var k = kelasInfo();
      var stp = function (n, t, s) { var st = S.step > n ? 'done' : S.step === n ? 'on' : ''; return '<div class="stp ' + st + '"><span>' + (S.step > n ? ic('check', 18) : n) + '</span><div><small>LANGKAH ' + n + (S.step > n ? ' • SELESAI' : S.step === n ? ' • AKTIF' : '') + '</small><b>' + t + '</b></div></div>'; };
      var head = '<div class="page-h"><div><h1>Buat Game Baru</h1><p>Tiga langkah singkat: identitas, karakteristik, lalu hasil.</p></div></div><div class="stepper">' + stp(1, 'Identitas & Kurikulum') + stp(2, 'Karakteristik & Jenis Game') + stp(3, 'Hasil & Publikasi') + '</div>';
      c = App.panel('guru', 'buat', head + '<div id="stepbody"></div>');
      step1or2();
    }
    function step1or2() {
      var k = kelasInfo(), body = $('#stepbody', c), m = meta();
      if (S.step === 1) {
        body.innerHTML = '<form class="card pad" id="f1"><h2 class="h-sec"><i></i> 1. Identitas Pembelajaran</h2><p class="muted">Parameter kurikulum disesuaikan otomatis dengan Kurikulum Merdeka.</p><div class="grid-2f"><label class="lbl">Jenjang & Fase *<select id="kv" class="inp">' + Content.KELAS.map(function (x) { return '<option value="' + x.v + '"' + (x.v === S.kelasV ? ' selected' : '') + '>' + x.label + '</option>'; }).join('') + '</select></label><label class="lbl">Mata Pelajaran *<select id="mp" class="inp">' + Content.MAPEL[k.jenjang].map(function (x) { return '<option' + (x === S.mapel ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '</select></label></div>' +
          '<label class="lbl">Topik / Pokok Bahasan *<input id="tp" class="inp" maxlength="120" required value="' + esc(S.materi || '') + '" placeholder="Contoh: Bagian tubuh tumbuhan dan fungsinya"></label>' +
          '<div class="lbl">Tipe Asesmen Kelas</div><div class="radios"><label class="radio' + (S.asesmen === 'formatif' ? ' on' : '') + '"><input type="radio" name="as" value="formatif"' + (S.asesmen === 'formatif' ? ' checked' : '') + '><div><b>Formatif (Latihan Interaktif)</b><small>Umpan balik langsung & remedi saat jam ajar</small></div></label><label class="radio' + (S.asesmen === 'sumatif' ? ' on' : '') + '"><input type="radio" name="as" value="sumatif"' + (S.asesmen === 'sumatif' ? ' checked' : '') + '><div><b>Sumatif (Ulangan Harian)</b><small>Skor formal tanpa bocoran kunci di awal</small></div></label></div>' +
          '<div class="auto-box" id="auto"></div><div class="form-act"><span></span><button class="btn btn-primary btn-lg glow shine" type="submit">Lanjut: Karakteristik & Jenis ' + ic('arrow', 20) + '</button></div></form>';
        var kv = $('#kv', body), mp = $('#mp', body), tpc = $('#tp', body);
        function auto() { S.kelasV = kv.value; S.mapel = mp.value; S.materi = tpc.value.trim(); S.asesmen = ($('input[name=as]:checked', body) || {}).value || 'formatif'; var mm = meta(); if (!S.tujuanManual) S.tujuan = Content.susunTP(mm); mm = meta();
          $('#auto', body).innerHTML = '<div class="auto-h">' + ic('sparkles', 18) + ' DISUSUN OTOMATIS OLEH ' + esc(App.appName().toUpperCase()) + '</div><div class="grid-2f"><div><small class="lbl-s">CAPAIAN & TUJUAN PEMBELAJARAN (TP) — bisa Anda ubah</small><textarea id="tj" class="inp" rows="4" maxlength="500">' + esc(S.tujuan) + '</textarea></div><div><small class="lbl-s">UNSUR PEMBELAJARAN MENDALAM</small><div class="chips">' + mm.unsur.prinsip.map(function (x) { return '<span class="chip">' + esc(x.split(':')[0]) + '</span>'; }).join('') + '</div><small class="lbl-s">DIMENSI PROFIL</small><div class="chips">' + mm.unsur.dimensi.map(function (x) { return '<span class="chip chip-y">' + esc(x) + '</span>'; }).join('') + '</div></div></div>';
          $('#tj', body).addEventListener('input', function (e) { S.tujuan = e.target.value; S.tujuanManual = true; simpan(); }); simpan(); }
        kv.addEventListener('change', function () { S.kelasV = kv.value; S.mapel = ''; S.tujuanManual = false; render(); });
        mp.addEventListener('change', auto); tpc.addEventListener('input', UI.debounce(function () { S.tujuanManual = false; auto(); }, 250));
        $$('input[name=as]', body).forEach(function (r) { r.addEventListener('change', function () { $$('.radio', body).forEach(function (l) { l.classList.toggle('on', l.querySelector('input').checked); }); S.tujuanManual = false; auto(); }); });
        if (!S.mapel) S.mapel = mp.value; mp.value = S.mapel; auto();
        $('#f1', body).addEventListener('submit', function (e) { e.preventDefault(); auto(); if (!S.materi) { UI.toast('Topik wajib diisi.', 'err'); return; } S.step = 2; render(); });
      } else {
        var t = tplSel || tpls[0] || { durasiMin: 5, durasiMaks: 60 }, dmin = t.durasiMin || 5, dmax = t.durasiMaks || 60;
        S.durasi = Math.min(dmax, Math.max(dmin, S.durasi));
        var cards = (tpls.length ? tpls : Object.keys(Content.ENGINE_INFO).map(function (e) { return { id: e, engine: e, nama: einfo(e).nama, deskripsi: einfo(e).ciri.join(' • '), fase: 'A,B,C,D' }; })).map(function (x) {
          var f = k.fase, cocok = String(x.fase).split(',').indexOf(f) > -1;
          return '<button type="button" class="eng card-fx shine' + (x.id === S.templateId ? ' on' : '') + '" data-t="' + esc(x.id) + '" style="--c:' + (x.warna || ENG_COLOR[x.engine]) + '"><span class="eng-ic">' + ic(x.ikon || einfo(x.engine).ikon, 22) + '</span><span class="pill' + (cocok ? '' : ' pill-mute') + '">' + (cocok ? 'Cocok • Fase ' + f : 'Fase ' + String(x.fase).replace(/,/g, '/')) + '</span><b>' + esc(x.nama) + '</b><small>' + esc(x.deskripsi) + '</small><span class="eng-ck">' + ic('check', 16) + '</span></button>';
        }).join('');
        body.innerHTML = '<div class="card pad"><h2 class="h-sec"><i class="v"></i> 2. Karakteristik & Mekanik Game</h2><label class="lbl">Judul permainan<input id="jd" class="inp" maxlength="140" value="' + esc(m.judul) + '"></label><div class="grid-3f"><div><div class="lbl">Mode bermain</div><div class="seg" id="seg-m"><button type="button" data-v="individu" class="' + (m.mode === 'individu' ? 'on' : '') + '"' + (S.engine === 'duel' ? ' disabled' : '') + '>' + ic('user', 16) + ' Individu</button><button type="button" data-v="kelompok" class="' + (m.mode === 'kelompok' ? 'on' : '') + '">' + ic('users', 16) + ' Kelompok / Tim</button></div>' + (S.engine === 'duel' ? '<small class="muted">Duel selalu berkelompok.</small>' : '') + '</div><div><div class="lbl">Durasi sesi <b class="pill" id="dv">' + S.durasi + ' Menit</b></div><input type="range" id="dr" min="' + dmin + '" max="' + dmax + '" step="1" value="' + S.durasi + '"><div class="range-l"><span>' + dmin + ' mnt</span><span>' + dmax + ' mnt</span></div></div><div><div class="lbl">Tingkat kesulitan</div><div class="seg" id="seg-t">' + [['mudah', 'Mudah'], ['sedang', 'Sedang'], ['bertingkat', 'Bertingkat']].map(function (x) { return '<button type="button" data-v="' + x[0] + '" class="' + (S.tingkat === x[0] ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div></div></div>' +
          '<h2 class="h-sec" style="margin-top:28px"><i class="y"></i> 3. Pilih Jenis Permainan <span class="muted right">' + (tpls.length || 6) + ' TEMPLAT SIAP PAKAI</span></h2><div class="engs">' + cards + '</div></div>' +
          '<div class="sticky-bar"><button class="btn btn-outline" id="b1">' + ic('back', 18) + ' Kembali</button><button class="btn btn-soft" id="bp">' + ic('copy', 18) + ' Salin Prompt untuk AI</button><button class="btn btn-accent btn-lg glow shine" id="bg">' + ic('bolt', 18) + ' Buat Game Langsung ' + ic('arrow', 18) + '</button></div>';
        UI.bind(body);
        $('#jd', body).addEventListener('input', function (e) { S.judul = e.target.value; simpan(); });
        $$('#seg-m button', body).forEach(function (b) { b.addEventListener('click', function () { S.mode = b.getAttribute('data-v'); $$('#seg-m button', body).forEach(function (x) { x.classList.toggle('on', x === b); }); simpan(); }); });
        $$('#seg-t button', body).forEach(function (b) { b.addEventListener('click', function () { S.tingkat = b.getAttribute('data-v'); $$('#seg-t button', body).forEach(function (x) { x.classList.toggle('on', x === b); }); simpan(); }); });
        $('#dr', body).addEventListener('input', function (e) { S.durasi = +e.target.value; $('#dv', body).textContent = S.durasi + ' Menit'; simpan(); });
        $$('.eng', body).forEach(function (b) { b.addEventListener('click', function () { S.templateId = b.getAttribute('data-t'); var tt = tpls.filter(function (x) { return x.id === S.templateId; })[0]; S.engine = tt ? tt.engine : S.templateId; S.judul = ''; if (S.engine === 'duel') S.mode = 'kelompok'; render(); }); });
        $('#b1', body).addEventListener('click', function () { S.step = 1; render(); });
        $('#bp', body).addEventListener('click', function () { var mm = meta(); S.prompt = Content.buatPrompt(mm); S.promptSaved = false; simpan(); App.go('/guru/prompt'); });
        $('#bg', body).addEventListener('click', langsung);
      }
    }
    function langsung() {
      var mm = meta(), prompt = Content.buatPrompt(mm), m = UI.modal({ title: 'Membuat permainan…', body: App.loading('AI menyusun ' + einfo(S.engine).nama + '. Ini bisa memakan waktu 10–30 detik.') });
      Api.call('ai.generate', { engine: S.engine, prompt: prompt }).then(function (r) {
        m.close();
        if (r.success) { simpanPrompt(prompt, 'langsung'); S.promptSaved = true; Pages_.buatGame(mm, r.data.konten); return; }
        if (r.code === 'NO_AI') { sediaModal(mm, prompt, r.message); return; }
        UI.toast(r.message, 'err', 6000);
      });
    }
    function sediaModal(mm, prompt, msg) {
      var b = document.createElement('div');
      b.innerHTML = '<p>' + esc(msg) + '</p><div class="opt-cards"><button class="opt-c" id="o1"><b>' + ic('copy', 18) + ' Salin Prompt & Impor Hasil</b><small>Cara utama: tempel prompt ke ChatGPT, Gemini, atau Claude, lalu impor balasannya ke sini.</small></button><button class="opt-c" id="o2"><b>' + ic('play', 18) + ' Coba dengan konten contoh</b><small>Membuat game dari contoh bawaan (topik bagian tubuh tumbuhan) untuk mencoba tampilan. Isi soal TIDAK sesuai topik Anda.</small></button></div>';
      var m = UI.modal({ title: 'Pembuatan otomatis belum aktif', body: b });
      $('#o1', b).addEventListener('click', function () { m.close(); S.prompt = prompt; S.promptSaved = false; simpan(); App.go('/guru/prompt'); });
      $('#o2', b).addEventListener('click', function () { m.close(); Pages_.buatGame(mm, Content.contoh(mm.engine)); });
    }
    function simpanPrompt(isi, opsi) { Api.call('prompt.simpan', { isi: isi, opsi: opsi }); }
    var Pages_ = { buatGame: function (mm, konten, done) {
      return Api.call('game.create', { meta: mm, konten: konten, tautanDasar: App.baseUrl() }).then(function (r) {
        if (r.success) { App.draft(null); UI.toast('Permainan berhasil dibuat!'); App.go('/guru/hasil/' + r.data.id); } else UI.toast(r.message, 'err', 6000);
        return r;
      });
    } };
    P._buatGame = Pages_.buatGame;
    P._meta = meta;
    render();
  };

  /* ============================== PROMPT ============================== */
  P.prompt = function (p, ok) {
    if (!App.requireLogin()) return;
    var S = App.draft();
    if (!S.prompt) { App.go('/guru/buat'); return; }
    if (!S.promptSaved) { S.promptSaved = true; App.draft(S); Api.call('prompt.simpan', { isi: S.prompt, opsi: 'salin' }); }
    var mm = P._metaFrom ? null : null, eng = S.engine || 'kuis';
    var c = App.panel('guru', 'buat', '<div class="stepper"><div class="stp done"><span>' + ic('check', 18) + '</span><div><small>LANGKAH 1 • SELESAI</small><b>Identitas & Capaian</b></div></div><div class="stp done"><span>' + ic('check', 18) + '</span><div><small>LANGKAH 2 • SELESAI</small><b>Karakteristik & Mekanik</b></div></div><div class="stp on"><span>3</span><div><small>LANGKAH 3 • AKTIF</small><b>Hasil Salin Prompt AI</b></div></div></div>' +
      '<div class="page-h"><div><h1>Prompt AI Siap Digunakan ✨</h1><p>Salin prompt ini ke ChatGPT, Gemini, Claude, atau AI favorit Anda untuk mendapatkan konten game secara instan.</p></div><div class="page-act"><a class="btn btn-outline" href="#/guru/buat" id="ep">' + ic('settings', 18) + ' Edit Parameter</a><button class="btn btn-primary glow shine" id="cp">' + ic('copy', 18) + ' Salin Seluruh Prompt</button></div></div>' +
      '<div class="grid-main"><section class="card"><div class="term-h"><i></i><i></i><i></i><b>Prompt Pembelajaran Terstruktur</b><span class="pill">' + S.prompt.length.toLocaleString('id-ID') + ' karakter</span></div><pre class="term" id="pt"></pre><div class="term-f"><button class="btn btn-primary" id="cp2">' + ic('copy', 18) + ' Salin Seluruh Prompt ke Clipboard</button><button class="btn btn-outline" id="dl">' + ic('download', 18) + ' Unduh .md</button></div></section>' +
      '<aside><section class="card pad"><h3 class="h-sm">Cara Menggunakan Prompt</h3><ol class="how"><li><b>Salin prompt</b><span>Klik tombol salin di panel ini.</span></li><li><b>Tempel ke AI favorit</b><span>Buka ChatGPT, Gemini, atau Claude, lalu tempel dan kirim.</span></li><li><b>Impor kembali ke sini</b><span>Salin balasan AI, tempel di kolom bawah, lalu validasi.</span></li></ol></section>' +
      '<section class="card pad"><h3 class="h-sm">AI yang Dapat Dipakai</h3><div class="ai-list"><a class="ai card-fx shine" href="https://chatgpt.com" target="_blank" rel="noopener"><span class="ai-i g">GPT</span><div><b>ChatGPT</b><small>OpenAI</small></div>' + ic('arrow', 16) + '</a><a class="ai card-fx shine" href="https://gemini.google.com" target="_blank" rel="noopener"><span class="ai-i b">GEM</span><div><b>Google Gemini</b><small>Terintegrasi Google</small></div>' + ic('arrow', 16) + '</a><a class="ai card-fx shine" href="https://claude.ai" target="_blank" rel="noopener"><span class="ai-i o">CLD</span><div><b>Claude</b><small>Anthropic</small></div>' + ic('arrow', 16) + '</a></div></section></aside></div>' +
      '<section class="card pad" id="imp"><div class="card-h"><div><h2 class="h-sm">' + ic('bolt', 20) + ' Sudah punya jawaban dari AI?</h2><p class="muted">Tempelkan seluruh balasan AI di bawah ini untuk divalidasi dan dijadikan game.</p></div><button class="btn btn-outline btn-sm" id="ex">' + ic('file', 16) + ' Lihat Contoh JSON</button></div><textarea id="ai" class="inp mono" rows="9" placeholder=\'Tempel balasan AI di sini, misalnya: { "meta": {...}, "questions": [...] }\'></textarea><div id="imsg"></div><div class="form-act"><span class="muted">' + ic('checkc', 16) + ' Pembaca otomatis mendukung JSON murni maupun blok kode ```json … ```.</span><span><button class="btn btn-soft" id="cl">Bersihkan</button> <button class="btn btn-primary btn-lg glow shine" id="vb">' + ic('bolt', 18) + ' Validasi & Buat Game</button></span></div></section>');
    $('#pt', c).textContent = S.prompt;
    function salin() { UI.salin(S.prompt).then(function (o) { UI.toast(o ? 'Prompt disalin. Tempel ke AI pilihan Anda.' : 'Gagal menyalin otomatis. Blok teks lalu salin manual.', o ? 'ok' : 'err'); }); }
    $('#cp', c).addEventListener('click', salin); $('#cp2', c).addEventListener('click', salin);
    $('#dl', c).addEventListener('click', function () { UI.unduh(new Blob([S.prompt], { type: 'text/markdown;charset=utf-8' }), 'prompt-' + eng + '.md'); });
    $('#cl', c).addEventListener('click', function () { $('#ai', c).value = ''; $('#imsg', c).innerHTML = ''; });
    $('#ex', c).addEventListener('click', function () {
      var json = JSON.stringify(Content.contoh(eng), null, 2);
      var m = UI.modal({ title: 'Contoh format JSON', wide: true, body: '<pre class="term small"></pre>', actions: [{ label: 'Tutup', cls: 'btn-outline', onClick: function (x) { x(); } }, { label: 'Pakai contoh ke kolom impor', cls: 'btn-primary', onClick: function (x) { $('#ai', c).value = json; x(); } }] });
      $('pre', m.body).textContent = json;
    });
    $('#vb', c).addEventListener('click', function () {
      var raw = $('#ai', c).value.trim(), msg = $('#imsg', c), btn = $('#vb', c);
      if (!raw) { msg.innerHTML = '<div class="note note-err">Kolom masih kosong. Tempel balasan AI terlebih dahulu.</div>'; return; }
      var obj; try { obj = Content.parseAI(raw); Content.konten(eng, obj); } catch (e) { msg.innerHTML = '<div class="note note-err">' + ic('x', 18) + '<div><b>Belum valid:</b> ' + esc(e.message) + '<br><small>Minta AI memperbaiki: "Perbaiki JSON agar sesuai format dan kirim ulang HANYA JSON-nya."</small></div></div>'; return; }
      btn.disabled = true;
      Api.call('konten.validasi', { engine: eng, konten: obj }).then(function (v) {
        if (!v.success) { btn.disabled = false; msg.innerHTML = '<div class="note note-err">' + esc(v.message) + '</div>'; return; }
        var m = P._meta ? null : null;
        var k = Content.KELAS.filter(function (x) { return x.v === S.kelasV; })[0] || Content.KELAS[3], info = einfo(eng), unsur = Content.susunUnsur({ engine: eng, asesmen: S.asesmen, mode: S.mode });
        var meta = { jenjang: k.jenjang, kelas: k.kelas, fase: k.fase, mapel: S.mapel, materi: S.materi, asesmen: S.asesmen, mode: eng === 'duel' ? 'kelompok' : S.mode, durasi: S.durasi, tingkat: S.tingkat, engine: eng, templateId: S.templateId, judul: S.judul || (info.nama.split(' ').slice(0, 2).join(' ') + ': ' + S.materi), tujuan: S.tujuan || '', unsurPd: Content.ringkasUnsur(unsur) };
        Api.call('game.create', { meta: meta, konten: v.data, tautanDasar: App.baseUrl() }).then(function (r) {
          btn.disabled = false;
          if (r.success) { App.draft(null); UI.toast('Permainan berhasil dibuat dari hasil AI!'); App.go('/guru/hasil/' + r.data.id); } else msg.innerHTML = '<div class="note note-err">' + esc(r.message) + '</div>';
        });
      });
    });
  };

  /* ============================== HASIL & BAGIKAN ============================== */
  function previewHtml(g) {
    var k = g.konten || {}, info = einfo(g.engine);
    var head = '<div class="pv-top"><span class="gi" style="--c:' + ENG_COLOR[g.engine] + '">' + ic(info.ikon, 18) + '</span><div><b>' + esc(g.judul) + '</b><small>Fase ' + esc(g.fase) + ' • ' + esc(g.mapel) + '</small></div><span class="pill">' + g.durasi + ' mnt</span></div>';
    if (k.questions && k.questions[0]) { var q = k.questions[0]; return head + '<div class="pv-q"><span class="pill">Pertanyaan 1 / ' + k.questions.length + '</span><h4>' + esc(q.q) + '</h4></div><div class="pv-opts">' + q.options.map(function (o, i) { return '<div class="pv-o' + (i === q.answer && !g.kunciTersembunyi ? ' hit' : '') + '"><b>' + 'ABCDE'[i] + '</b>' + esc(o) + '</div>'; }).join('') + '</div>'; }
    if (k.pairs) return head + '<div class="pv-pairs">' + k.pairs.slice(0, 6).map(function (x) { return '<div><span>' + esc(x.a) + '</span><i>↔</i><span>' + esc(x.b) + '</span></div>'; }).join('') + '</div>';
    if (k.sequences) return head + '<div class="pv-q"><h4>' + esc(k.sequences[0].title) + '</h4></div><ol class="pv-seq">' + k.sequences[0].steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>';
    if (k.words) return head + '<ul class="pv-seq">' + k.words.slice(0, 5).map(function (w) { return '<li><b>' + w.word.length + ' huruf</b> — ' + esc(w.clue) + '</li>'; }).join('') + '</ul>';
    return head;
  }
  P.hasil = function (p, ok) {
    if (!App.requireLogin()) return;
    var c = App.panel('guru', 'buat', App.loading('Memuat permainan…'));
    return Api.call('game.get', { id: p.id }).then(function (r) {
      if (!ok()) return;
      if (!r.success) { c.innerHTML = App.err(r.message); return; }
      var g = r.data, link = App.linkGame(g.kode), n = Content.jumlahItem(g.engine, g.konten), info = einfo(g.engine);
      var wa = 'https://wa.me/?text=' + encodeURIComponent('Ayo main "' + g.judul + '"!\nKode: ' + g.kode + '\nBuka: ' + link);
      var gc = 'https://classroom.google.com/share?url=' + encodeURIComponent(link) + '&title=' + encodeURIComponent(g.judul);
      c.innerHTML = '<div class="crumb"><a href="#/guru/buat">Buat Permainan Baru</a> › <span>Langkah 3: Game Berhasil Dibuat & Siap Dimainkan!</span><span class="live-pill"><i></i> ' + (Api.LIVE ? 'SINKRONISASI CLOUD AKTIF' : 'MODE DEMO') + '</span></div>' +
        '<div class="success-b" data-reveal><div class="sb-ic">' + ic('sparkles', 34) + '</div><div><h2>🎉 Permainan Interaktif Berhasil Diterbitkan!</h2><p>Game kini aktif dan siap dimainkan siswa di kelas maupun di rumah.</p></div><span class="sb-id">' + ic('bolt', 16) + ' Kode: ' + esc(g.kode) + '</span></div>' +
        '<div class="grid-main2"><div><div class="card pad"><div class="card-h"><h2 class="h-sm">' + ic('eye', 20) + ' Pratinjau Tampilan Siswa</h2><span class="st st-on">● ' + (g.status === 'aktif' ? 'AKTIF (Siap Menerima Siswa)' : 'NONAKTIF') + '</span></div><div class="device"><div class="pv card-fx">' + previewHtml(g) + '</div></div>' +
        '<div class="chips mt"><span class="chip">' + n + ' ' + (g.engine === 'kartu' ? 'Pasang' : g.engine === 'balok' ? 'Urutan' : g.engine === 'tts' ? 'Kata' : 'Butir Soal') + '</span><span class="chip">' + (g.asesmen === 'sumatif' ? 'Sumatif' : 'Formatif') + '</span><span class="chip">' + esc(info.nama) + '</span><span class="chip">' + esc(g.jenjang) + ' Kelas ' + esc(g.kelas) + ' (Fase ' + esc(g.fase) + ')</span></div>' +
        '<div class="form-act"><a class="btn btn-primary btn-lg glow shine" target="_blank" rel="noopener" href="#/main/' + encodeURIComponent(g.kode) + '?uji=1">' + ic('play', 18) + ' Uji Coba Main Sebagai Siswa</a><button class="btn btn-outline" id="ed">' + ic('edit', 18) + ' Edit / Review Butir Soal</button></div></div></div>' +
        '<aside><section class="card pad share"><div class="card-h"><div><small class="lbl-s">AKSES LANGSUNG KELAS</small><h3 class="h-sm">Bagikan ke Murid</h3></div></div><div class="pin-box card-fx shine"><small>KODE AKSES GAME (PIN KELAS)</small><div class="pin"><b>' + esc(g.kode) + '</b><button class="btn btn-accent btn-sm" id="cpin" title="Salin kode">' + ic('copy', 18) + '</button></div><p>Siswa cukup membuka <b>' + esc(location.host + location.pathname.replace(/\/$/, '')) + '</b> lalu memasukkan kode ini.</p></div>' +
        '<small class="lbl-s">TAUTAN CEPAT PERMAINAN</small><div class="linkrow"><input class="inp mono" readonly value="' + esc(link) + '" id="lk"><button class="btn btn-primary btn-sm" id="clk">Salin</button></div>' +
        '<div class="qr-box"><div id="qr" class="qr"></div><div><b>Pindai untuk Smart TV / Proyektor Kelas</b><p class="muted">Tampilkan di depan kelas agar seluruh siswa memindai lewat tablet atau Chromebook.</p><button class="btn btn-outline btn-sm" id="proj">' + ic('eye', 16) + ' Mode Proyektor</button></div></div>' +
        '<small class="lbl-s">BAGIKAN SEKALI KLIK</small><div class="share-b"><a class="btn btn-wa shine" target="_blank" rel="noopener" href="' + wa + '">' + ic('wa', 18) + ' Kirim ke WhatsApp</a><a class="btn btn-outline shine" target="_blank" rel="noopener" href="' + gc + '">' + ic('layers', 18) + ' Tugaskan di Google Classroom</a></div></section>' +
        '<section class="card pad joined"><span class="m-ic m-green">' + ic('users', 22) + '</span><div><b id="jn">0 Siswa Selesai</b><small id="jt">Menunggu siswa menyelesaikan permainan…</small></div><button class="icon-btn" id="rf" title="Segarkan">' + ic('refresh', 18) + '</button></section></aside></div>' +
        '<div class="card pad foot-nav"><a class="btn btn-ghost" href="#/guru/buat">' + ic('back', 18) + ' Buat Permainan Lain</a><span><a class="btn btn-soft" href="#/guru">' + ic('home', 18) + ' Pantau di Dashboard Guru</a> <a class="btn btn-primary glow shine" href="#/guru/rekap?game=' + esc(g.id) + '">Lihat Rekap Nilai Masuk ' + ic('arrow', 18) + '</a></span></div>';
      UI.bind(c);
      UI.qr($('#qr', c), link, 150);
      $('#cpin', c).addEventListener('click', function () { UI.salin(g.kode).then(function () { UI.toast('Kode disalin.'); }); });
      $('#clk', c).addEventListener('click', function () { UI.salin(link).then(function (o) { UI.toast(o ? 'Tautan disalin.' : 'Salin manual dari kolom.', o ? 'ok' : 'warn'); }); });
      $('#proj', c).addEventListener('click', function () {
        var o = UI.el('<div class="proj"><button class="icon-btn" aria-label="Tutup">' + ic('x', 28) + '</button><h2>' + esc(g.judul) + '</h2><p>Buka halaman ini atau pindai QR, lalu masukkan kode:</p><div class="proj-code">' + esc(g.kode) + '</div><div id="pq" class="qr big"></div><small>' + esc(link) + '</small></div>');
        document.body.appendChild(o); UI.qr($('#pq', o), link, 220); function x() { o.remove(); document.removeEventListener('keydown', k); } function k(e) { if (e.key === 'Escape') x(); } document.addEventListener('keydown', k); $('button', o).addEventListener('click', x);
        if (o.requestFullscreen) o.requestFullscreen().catch(function () { });
      });
      $('#ed', c).addEventListener('click', function () { editor(g); });
      function poll() { Api.call('hasil.list', { gameId: g.id }, { fresh: true }).then(function (rr) { if (!rr.success) return; var n2 = rr.data.rows.length, a = $('#jn'); if (!a) return; a.textContent = n2 + ' Siswa Selesai'; $('#jt').textContent = n2 ? 'Terakhir: ' + rr.data.rows[0].nama + ' (skor ' + rr.data.rows[0].skor + ')' : 'Menunggu siswa menyelesaikan permainan…'; }); }
      $('#rf', c).addEventListener('click', poll); poll();
      var tm = setInterval(function () { if (!document.hidden) poll(); }, 15000); UI.onCleanup(function () { clearInterval(tm); });
    });
  };
  function editor(g) {
    var b = document.createElement('div');
    b.innerHTML = '<p class="muted">Edit isi permainan dalam format JSON. Perubahan divalidasi sebelum disimpan.</p><textarea class="inp mono" rows="16" id="ej"></textarea><div id="em"></div>';
    $('#ej', b).value = JSON.stringify(g.konten, null, 2);
    UI.modal({ title: 'Edit / Review Isi Permainan', wide: true, body: b, actions: [{ label: 'Batal', cls: 'btn-outline', onClick: function (x) { x(); } }, { label: 'Simpan Perubahan', cls: 'btn-primary', onClick: function (x) {
      var obj; try { obj = JSON.parse($('#ej', b).value); Content.konten(g.engine, obj); } catch (e) { $('#em', b).innerHTML = '<div class="note note-err">' + esc(e.message) + '</div>'; return; }
      Api.call('game.update', { id: g.id, konten: obj }).then(function (r) { if (r.success) { UI.toast('Isi permainan diperbarui.'); x(); App.route(); } else $('#em', b).innerHTML = '<div class="note note-err">' + esc(r.message) + '</div>'; });
    } }] });
  }

  /* ============================== REKAP NILAI ============================== */
  P.rekap = function (p, ok) {
    if (!App.requireLogin()) return;
    var c = App.panel('guru', 'rekap', App.loading('Memuat rekap nilai…')), data = null, gameCache = {}, page = 1, PER = 10;
    return Api.call('hasil.list', p.q.game ? { gameId: p.q.game } : {}, { fresh: true }).then(function (r) {
      if (!ok()) return;
      if (!r.success) { c.innerHTML = App.err(r.message, true); return; }
      data = r.data; var kelasSet = {}; data.rows.forEach(function (x) { kelasSet[x.kelas || '-'] = 1; });
      c.innerHTML = '<div class="page-h"><div><span class="badge">ANALISIS PEMBELAJARAN & EVALUASI</span><h1>Rekap Nilai Siswa</h1><p>Pantau hasil pengerjaan, analisis ketuntasan, dan unduh laporan nilai.</p></div><div class="page-act"><button class="btn btn-outline" id="xx">' + ic('file', 18) + ' Unduh Excel (.xlsx)</button><button class="btn btn-primary glow shine" id="xp">' + ic('download', 18) + ' Unduh Rekap PDF</button></div></div>' +
        '<div class="card pad filters"><div class="search">' + ic('search', 18) + '<input id="q" class="inp" placeholder="Cari nama siswa atau kelompok…"></div><label>Game<select id="fg" class="inp"><option value="">Semua permainan</option>' + data.games.map(function (g) { return '<option value="' + esc(g.id) + '"' + (p.q.game === g.id ? ' selected' : '') + '>' + esc(g.judul) + '</option>'; }).join('') + '</select></label><label>Kelas<select id="fk" class="inp"><option value="">Semua kelas</option>' + Object.keys(kelasSet).sort().map(function (k) { return '<option>' + esc(k) + '</option>'; }).join('') + '</select></label><label>Rentang tanggal<select id="fd" class="inp"><option value="0">Semua waktu</option><option value="7">7 hari terakhir</option><option value="30">30 hari terakhir</option></select></label><label>KKM<input id="kkm" class="inp" type="number" min="0" max="100" value="' + KKM + '"></label></div>' +
        '<div id="sum"></div><section class="card" id="tbl"></section>';
      ['q', 'fg', 'fk', 'fd', 'kkm'].forEach(function (id) { $('#' + id, c).addEventListener(id === 'q' || id === 'kkm' ? 'input' : 'change', UI.debounce(function () { page = 1; draw(); }, 120)); });
      $('#xx', c).addEventListener('click', function () { var f = filt(); UI.exportXlsx(head(), tabelRows(f), 'rekap-nilai-' + new Date().toISOString().slice(0, 10), 'Rekap Nilai'); });
      $('#xp', c).addEventListener('click', function () { var f = filt(); UI.exportPdf('Rekap Nilai Siswa — ' + App.appName(), head(), tabelRows(f), 'rekap-nilai-' + new Date().toISOString().slice(0, 10)); });
      draw();
    });
    function head() { return ['Nama', 'Kelas', 'Permainan', 'Skor', 'Benar', 'Total', 'Waktu', 'Status', 'Tanggal']; }
    function judulOf(id) { var g = data.games.filter(function (x) { return x.id === id; })[0]; return g ? g.judul : '-'; }
    function tabelRows(f) { var k = +$('#kkm', c).value || KKM; return f.map(function (x) { return [x.nama, x.kelas, judulOf(x.idPermainan), x.skor, x.benar, x.total, UI.fmtDur(x.durasi), x.skor >= k ? 'Lulus' : 'Remedial', UI.fmtJam(x.tanggal)]; }); }
    function filt() {
      var q = $('#q', c).value.trim().toLowerCase(), g = $('#fg', c).value, k = $('#fk', c).value, d = +$('#fd', c).value, lim = d ? Date.now() - d * 86400000 : 0;
      return data.rows.filter(function (x) { return (!q || x.nama.toLowerCase().indexOf(q) > -1) && (!g || x.idPermainan === g) && (!k || x.kelas === k) && (!lim || new Date(x.tanggal).getTime() >= lim); });
    }
    function draw() {
      var f = filt(), kk = +$('#kkm', c).value || KKM, n = f.length, avg = n ? f.reduce(function (a, x) { return a + x.skor; }, 0) / n : 0, tuntas = f.filter(function (x) { return x.skor >= kk; }).length;
      var best = f.slice().sort(function (a, b) { return b.skor - a.skor || a.durasi - b.durasi; })[0], butuh = f.filter(function (x) { return x.skor < kk; }).length;
      $('#sum', c).innerHTML = '<div class="metrics m3">' + '<div class="metric card-fx"><div class="m-top"><span class="m-ic m-blue">' + ic('star', 22) + '</span></div><span class="m-l">RATA-RATA NILAI</span><b class="m-v">' + (n ? avg.toFixed(1).replace('.', ',') : '—') + '<small> / 100</small></b><span class="m-f"><span class="st st-on">Ketuntasan ' + (n ? Math.round(tuntas / n * 100) : 0) + '%</span> ' + tuntas + ' dari ' + n + ' tuntas</span></div>' +
        '<div class="metric card-fx top-y"><div class="m-top"><span class="m-ic m-amber">' + ic('trophy', 22) + '</span></div><span class="m-l">SKOR TERTINGGI</span><b class="m-v">' + (best ? best.skor : '—') + '</b><span class="m-f">' + (best ? esc(best.nama) + ' • ' + UI.fmtDur(best.durasi) : 'Belum ada data') + '</span></div>' +
        '<div class="metric card-fx"><div class="m-top"><span class="m-ic m-red">' + ic('bell', 22) + '</span></div><span class="m-l">PERLU PENDAMPINGAN</span><b class="m-v red">' + butuh + '<small> siswa</small></b><span class="m-f">Kriteria skor &lt; ' + kk + '</span></div></div>';
      var tot = Math.max(1, Math.ceil(n / PER)); page = Math.min(page, tot); var pg = f.slice((page - 1) * PER, page * PER);
      $('#tbl', c).innerHTML = '<div class="card-h"><h2 class="h-sm"><i class="dot"></i> Daftar Hasil Belajar Siswa</h2><span class="pill">' + n + ' hasil</span></div>' +
        (n ? '<div class="tbl-w"><table class="tbl"><thead><tr><th>Nama Siswa</th><th>Kelas</th><th>Skor Akhir</th><th>Waktu Tempuh</th><th>Akurasi Soal</th><th>Status</th><th class="r">Tindakan</th></tr></thead><tbody>' + pg.map(function (x) {
          var cls = x.skor >= 90 ? 'sk-a' : x.skor >= kk ? 'sk-b' : x.skor >= kk - 10 ? 'sk-c' : 'sk-d';
          return '<tr><td><div class="gcell"><span class="avs-i">' + esc(x.nama.slice(0, 2).toUpperCase()) + '</span><div><b>' + esc(x.nama) + '</b><small>' + esc(judulOf(x.idPermainan)) + '</small></div></div></td><td>' + esc(x.kelas) + '</td><td><span class="sk ' + cls + '">' + x.skor + '</span></td><td>' + UI.ic('timer', 14) + ' ' + UI.fmtDur(x.durasi) + '</td><td><b>' + x.benar + '</b>/' + x.total + ' Benar</td><td>' + (x.skor >= kk ? '<span class="st st-on">✓ Lulus</span>' : '<span class="st st-warn">⚠ Remedial</span>') + '</td><td class="r"><button class="btn btn-soft btn-sm" data-ans="' + esc(x.id) + '">Lihat Jawaban ' + ic('eye', 14) + '</button></td></tr>';
        }).join('') + '</tbody></table></div><div class="pager"><span>Menampilkan ' + ((page - 1) * PER + 1) + '–' + Math.min(page * PER, n) + ' dari ' + n + ' hasil</span><div>' + (function () { var s = ''; for (var i = 1; i <= tot; i++) if (i === 1 || i === tot || Math.abs(i - page) <= 1) s += '<button class="pg' + (i === page ? ' on' : '') + '" data-pg="' + i + '">' + i + '</button>'; else if (Math.abs(i - page) === 2) s += '<span>…</span>'; return s; })() + '</div></div>' : '<div class="empty sm"><p>Belum ada hasil yang cocok. Bagikan kode permainan agar nilai siswa masuk ke sini.</p></div>');
      $$('[data-pg]', c).forEach(function (b) { b.addEventListener('click', function () { page = +b.getAttribute('data-pg'); draw(); }); });
      $$('[data-ans]', c).forEach(function (b) { b.addEventListener('click', function () { jawaban(data.rows.filter(function (x) { return x.id === b.getAttribute('data-ans'); })[0]); }); });
    }
    function jawaban(row) {
      var load = gameCache[row.idPermainan] ? Promise.resolve({ success: true, data: gameCache[row.idPermainan] }) : Api.call('game.get', { id: row.idPermainan });
      load.then(function (r) {
        var body = '<p class="muted">' + esc(row.nama) + ' • ' + esc(row.kelas) + ' • skor ' + row.skor + ' (' + row.benar + '/' + row.total + ' benar)</p>';
        if (r.success) {
          gameCache[row.idPermainan] = r.data; var g = r.data, qs = g.konten.questions, j = row.detail && row.detail.j;
          if (qs && j && j.length) body += '<div class="ans-list">' + j.map(function (pr) { var q = qs[pr[0]]; if (!q) return ''; var bn = pr[1] === q.answer; return '<div class="ans ' + (bn ? 'ok' : 'bad') + '"><b>' + (pr[0] + 1) + '. ' + esc(q.q) + '</b><span>Jawaban siswa: ' + (pr[1] >= 0 ? esc(q.options[pr[1]] || '-') : '<em>tidak menjawab</em>') + '</span>' + (bn ? '' : '<span>Kunci: ' + esc(q.options[q.answer]) + '</span>') + '</div>'; }).join('') + '</div>';
          else body += '<div class="note">Jenis permainan ini mencatat skor keseluruhan, bukan jawaban per butir.</div>';
        } else body += '<div class="note note-warn">Permainan sumber tidak tersedia (mungkin sudah dihapus).</div>';
        UI.modal({ title: 'Jawaban Siswa', wide: true, body: body, actions: [{ label: 'Tutup', cls: 'btn-outline', onClick: function (x) { x(); } }] });
      });
    }
  };

  /* ============================== BANTUAN ============================== */
  P.bantuan = function (p, ok) {
    if (!App.requireLogin()) return;
    var faq = [['Bagaimana siswa bergabung?', 'Bagikan kode (mis. PLANT-402), tautan, atau QR dari halaman Bagikan. Siswa tidak perlu akun.'], ['Apa bedanya formatif dan sumatif?', 'Formatif menampilkan umpan balik dan kunci setelah menjawab. Sumatif tidak menampilkan kunci ke siswa, dan pada kuis/duel/labirin skor dihitung ulang oleh server.'], ['Bagaimana memakai AI favorit saya?', 'Pilih Salin Prompt, tempel ke ChatGPT/Gemini/Claude, lalu tempel balasan JSON ke kolom impor. Sistem memvalidasi sebelum membuat game.'], ['Kapan nilai muncul di rekap?', 'Setelah siswa menyelesaikan permainan. Rekap diperbarui otomatis dalam ±20 detik; gunakan tombol segarkan bila perlu.'], ['Apakah nilai bisa diunduh?', 'Ya, dari Rekap Nilai: Excel (.xlsx) atau PDF.'], ['Bagaimana bila koneksi siswa terputus?', 'Nilai disimpan di perangkat siswa dan dikirim ulang otomatis saat koneksi kembali.']];
    App.panel('guru', 'bantu', '<div class="page-h"><div><h1>Bantuan</h1><p>Jawaban singkat untuk pertanyaan yang sering muncul.</p></div></div><div class="faq">' + faq.map(function (f) { return '<details class="card pad"><summary>' + esc(f[0]) + ic('chevron', 18) + '</summary><p>' + esc(f[1]) + '</p></details>'; }).join('') + '</div>' + (App.waLink() ? '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + App.waLink() + '">' + ic('wa', 18) + ' Tanya via WhatsApp</a>' : ''));
  };
})();
