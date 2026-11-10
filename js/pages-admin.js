/* ============================================================
   pages-admin.js — Templat & Jenis Game, Data Guru, Pengaturan & Rahasia,
   Migrasi Data, Status Sistem
   ============================================================ */
(function () {
  'use strict';
  var $ = UI.$, $$ = UI.$$, ic = UI.ic, esc = UI.esc, P = App.Pages;
  var ENG = ['kuis', 'tts', 'kartu', 'duel', 'balok', 'labirin'];
  var IKON = ['timer', 'grid', 'cards', 'swords', 'blocks', 'compass', 'star', 'bolt', 'bulb', 'flag'];
  function einfo(e) { return Content.ENGINE_INFO[e] || Content.ENGINE_INFO.kuis; }
  function head(t, sub, act) { return '<div class="page-h"><div><span class="badge">ADMIN</span><h1>' + t + '</h1><p>' + sub + '</p></div><div class="page-act">' + (act || '') + '</div></div>'; }
  function guard(ok) { if (!App.requireLogin('admin')) return null; return true; }

  /* ---------- Templat ---------- */
  P.adminTpl = function (p, ok) {
    if (!guard()) return;
    var c = App.panel('admin', 'tpl', App.loading('Memuat templat…'));
    function load() {
      return Api.call('admin.overview').then(function (r) {
        if (!ok()) return;
        if (!r.success) { c.innerHTML = App.err(r.message, true); return; }
        var d = r.data, T = d.templat, top = Object.keys(d.pakai).sort(function (a, b) { return d.pakai[b] - d.pakai[a]; })[0];
        c.innerHTML = head('Kelola Templat & Jenis Game', 'Atur mekanik, jenjang fase, durasi, dan gambar slideshow katalog. Setiap templat memakai salah satu dari 6 mesin permainan.', '<button class="btn btn-primary glow shine" id="nt">' + ic('plusc', 18) + ' Tambah Templat</button>') +
          '<div class="metrics"><div class="metric card-fx"><span class="m-l">TOTAL TEMPLAT AKTIF</span><b class="m-v">' + T.filter(function (t) { return t.status === 'aktif'; }).length + '<small> / ' + T.length + '</small></b></div><div class="metric card-fx"><span class="m-l">GURU TERDAFTAR</span><b class="m-v">' + d.guru + '</b><span class="m-f">' + d.guruAktif + ' aktif</span></div><div class="metric card-fx"><span class="m-l">PERMAINAN DIBUAT</span><b class="m-v">' + d.game + '</b><span class="m-f">Terpopuler: ' + (top ? esc(einfo(top).nama) : '—') + '</span></div><div class="metric card-fx"><span class="m-l">HASIL SISWA</span><b class="m-v">' + UI.fmtNum(d.siswa) + '</b><span class="m-f">Rata-rata skor ' + String(d.rataSkor).replace('.', ',') + '</span></div></div>' +
          '<section class="card"><div class="tbl-w"><table class="tbl"><thead><tr><th>Nama Templat & Mekanik</th><th>Mesin</th><th>Fase</th><th>Mode & Durasi</th><th>Dipakai</th><th>Status</th><th class="r">Aksi</th></tr></thead><tbody>' +
          T.map(function (t) { return '<tr><td><div class="gcell"><span class="gi" style="--c:' + esc(t.warna) + '">' + ic(t.ikon, 20) + '</span><div><b>' + esc(t.nama) + '</b><small><code>' + esc(t.id) + '</code> — ' + esc(t.deskripsi).slice(0, 70) + '</small></div></div></td><td><code>' + esc(t.engine) + '</code></td><td>' + esc(String(t.fase).replace(/,/g, ' / ')) + '</td><td>' + esc(t.mode) + '<small>' + t.durasiMin + '–' + t.durasiMaks + ' menit</small></td><td><b>' + (d.pakai[t.engine] || 0) + '</b> game <small>(mesin)</small></td><td>' + (t.status === 'aktif' ? '<span class="st st-on">● Aktif</span>' : '<span class="st st-off">● Arsip</span>') + '</td><td class="r act"><button class="icon-btn" data-e="' + esc(t.id) + '" title="Ubah">' + ic('edit', 18) + '</button>' + (t.status === 'aktif' ? '<button class="icon-btn danger" data-a="' + esc(t.id) + '" title="Arsipkan">' + ic('trash', 18) + '</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div></section>' +
          '<div class="note">' + ic('bulb', 18) + '<div><b>Catatan:</b> penambahan templat baru memetakan nama/deskripsi/gambar ke salah satu mesin yang sudah ada. Mekanik permainan yang benar-benar baru memerlukan penambahan kode mesin di <code>js/games.js</code>.</div></div>';
        $('#nt', c).addEventListener('click', function () { form(null); });
        $$('[data-e]', c).forEach(function (b) { b.addEventListener('click', function () { form(T.filter(function (t) { return t.id === b.getAttribute('data-e'); })[0]); }); });
        $$('[data-a]', c).forEach(function (b) { b.addEventListener('click', function () { UI.confirm('Arsipkan templat ini? Templat tidak tampil di katalog, tetapi permainan yang sudah ada tetap berjalan.', 'Arsipkan', true).then(function (y) { if (y) Api.call('tpl.hapus', { id: b.getAttribute('data-a') }).then(function (r2) { UI.toast(r2.message, r2.success ? 'ok' : 'err'); Api.boot(); load(); }); }); }); });
      });
    }
    function form(t) {
      t = t || { nama: '', engine: 'kuis', deskripsi: '', fase: 'A,B,C,D', mode: 'individu', durasiMin: 5, durasiMaks: 30, ikon: 'timer', warna: '#1E40AF', gambar: [], status: 'aktif' };
      var f = String(t.fase).split(','), b = document.createElement('div');
      b.innerHTML = '<form id="tf"><div class="grid-2f"><label class="lbl">Nama templat *<input class="inp" id="tn" required maxlength="80" value="' + esc(t.nama) + '"></label><label class="lbl">Mesin permainan *<select class="inp" id="te">' + ENG.map(function (e) { return '<option value="' + e + '"' + (t.engine === e ? ' selected' : '') + '>' + esc(einfo(e).nama) + '</option>'; }).join('') + '</select></label></div><label class="lbl">Deskripsi<textarea class="inp" id="td" rows="2" maxlength="300">' + esc(t.deskripsi) + '</textarea></label><div class="lbl">Fase sasaran</div><div class="chk-row">' + ['A', 'B', 'C', 'D'].map(function (x) { return '<label class="chk"><input type="checkbox" value="' + x + '"' + (f.indexOf(x) > -1 ? ' checked' : '') + '> Fase ' + x + '</label>'; }).join('') + '</div><div class="grid-3f"><label class="lbl">Mode<select class="inp" id="tm"><option' + (t.mode === 'individu' ? ' selected' : '') + '>individu</option><option' + (t.mode === 'kelompok' ? ' selected' : '') + '>kelompok</option></select></label><label class="lbl">Durasi min (mnt)<input class="inp" id="t1" type="number" min="5" max="60" value="' + t.durasiMin + '"></label><label class="lbl">Durasi maks (mnt)<input class="inp" id="t2" type="number" min="5" max="60" value="' + t.durasiMaks + '"></label></div><div class="grid-2f"><label class="lbl">Ikon<select class="inp" id="ti">' + IKON.map(function (i) { return '<option' + (t.ikon === i ? ' selected' : '') + '>' + i + '</option>'; }).join('') + '</select></label><label class="lbl">Warna<input class="inp" id="tw" type="color" value="' + esc(t.warna) + '"></label></div><label class="lbl">Gambar slideshow kartu (URL https, satu per baris, maks 6). Kosongkan untuk ilustrasi bawaan.<textarea class="inp mono" id="tg" rows="3">' + esc((t.gambar || []).join('\n')) + '</textarea></label><div id="tm2"></div></form>';
      UI.modal({ title: t.id ? 'Ubah Templat ' + t.id : 'Konfigurasi Templat Baru', wide: true, body: b, actions: [{ label: 'Batal', cls: 'btn-outline', onClick: function (x) { x(); } }, { label: 'Simpan & Publikasikan', cls: 'btn-primary', onClick: function (x) {
        var fase = $$('input[type=checkbox]:checked', b).map(function (i) { return i.value; }).join(',');
        if (!fase) { $('#tm2', b).innerHTML = '<div class="note note-err">Pilih minimal satu fase.</div>'; return; }
        Api.call('tpl.save', { id: t.id, nama: $('#tn', b).value, engine: $('#te', b).value, deskripsi: $('#td', b).value, fase: fase, mode: $('#tm', b).value, durasiMin: +$('#t1', b).value, durasiMaks: +$('#t2', b).value, ikon: $('#ti', b).value, warna: $('#tw', b).value, gambar: $('#tg', b).value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean), status: t.status, urutan: t.urutan }).then(function (r) {
          if (r.success) { UI.toast(r.message); x(); Api.boot(); load(); } else $('#tm2', b).innerHTML = '<div class="note note-err">' + esc(r.message) + '</div>';
        });
      } }] });
    }
    return load();
  };

  /* ---------- Guru ---------- */
  P.adminGuru = function (p, ok) {
    if (!guard()) return;
    var c = App.panel('admin', 'guru', App.loading('Memuat data guru…'));
    function load() {
      return Api.call('admin.guru').then(function (r) {
        if (!ok()) return; if (!r.success) { c.innerHTML = App.err(r.message, true); return; }
        c.innerHTML = head('Data Guru & Sekolah', 'Kelola peran dan status akun guru. Admin tidak dapat mengubah nilai siswa.') +
          '<section class="card"><div class="tbl-w"><table class="tbl"><thead><tr><th>Guru</th><th>Instansi</th><th>Peran</th><th>Game</th><th>Terakhir masuk</th><th>Status</th><th class="r">Aksi</th></tr></thead><tbody>' +
          (r.data.length ? r.data.map(function (g) { return '<tr><td><div class="gcell"><span class="avs-i">' + esc((g.nama || '?').slice(0, 2).toUpperCase()) + '</span><div><b>' + esc(g.nama) + '</b><small>' + esc(g.email) + '</small></div></div></td><td>' + esc(g.instansi || '—') + '</td><td><span class="pill">' + esc(g.role) + '</span></td><td>' + g.game + '</td><td>' + UI.fmtTgl(g.terakhirMasuk) + '</td><td>' + (g.aktif ? '<span class="st st-on">● Aktif</span>' : '<span class="st st-off">● Nonaktif</span>') + '</td><td class="r act"><button class="btn btn-soft btn-sm" data-r="' + esc(g.id) + '" data-v="' + (g.role === 'admin' ? 'guru' : 'admin') + '">Jadikan ' + (g.role === 'admin' ? 'guru' : 'admin') + '</button> <button class="btn btn-outline btn-sm" data-t="' + esc(g.id) + '" data-v="' + (g.aktif ? '0' : '1') + '">' + (g.aktif ? 'Nonaktifkan' : 'Aktifkan') + '</button></td></tr>'; }).join('') : '<tr><td colspan="7" class="center muted">Belum ada guru terdaftar.</td></tr>') + '</tbody></table></div></section>';
        $$('[data-r]', c).forEach(function (b) { b.addEventListener('click', function () { Api.call('admin.guruRole', { id: b.getAttribute('data-r'), role: b.getAttribute('data-v') }).then(function (x) { UI.toast(x.message, x.success ? 'ok' : 'err'); load(); }); }); });
        $$('[data-t]', c).forEach(function (b) { b.addEventListener('click', function () { Api.call('admin.guruRole', { id: b.getAttribute('data-t'), aktif: b.getAttribute('data-v') === '1' }).then(function (x) { UI.toast(x.message, x.success ? 'ok' : 'err'); load(); }); }); });
      });
    }
    return load();
  };

  /* ---------- Pengaturan & rahasia ---------- */
  P.adminSet = function (p, ok) {
    if (!guard()) return;
    var c = App.panel('admin', 'set', App.loading('Memuat pengaturan…'));
    return Promise.all([Api.call('rahasia.status'), Api.boot()]).then(function (res) {
      if (!ok()) return;
      var rs = res[0].success ? res[0].data : {}, s = App.settings;
      function rahasia(k, label, ph, help) { var v = rs[k] || {}; return '<div class="sec-row"><div><b>' + label + '</b><small>' + help + '</small></div><div class="sec-in"><span class="st ' + (v.ada ? 'st-on' : 'st-off') + '">' + (v.ada ? '● Terisi: ' + esc(v.samar || '') : '● Belum diisi') + '</span><input class="inp mono" type="password" autocomplete="off" data-k="' + k + '" placeholder="' + ph + '"><button class="btn btn-primary btn-sm" data-sv="' + k + '">Simpan</button>' + (v.ada ? '<button class="btn btn-outline btn-sm" data-rm="' + k + '">Hapus</button>' : '') + '</div></div>'; }
      c.innerHTML = head('Pengaturan & Rahasia', 'Pengaturan tampilan publik dan kredensial. Rahasia disimpan di Script Properties dan tidak pernah dikirim kembali ke browser.') +
        '<section class="card pad"><h2 class="h-sm">Tampilan publik</h2><form id="pf" class="grid-2f"><label class="lbl">Nama aplikasi<input class="inp" data-p="nama_app" value="' + esc(s.nama_app || '') + '" maxlength="60"></label><label class="lbl">Nomor WhatsApp (tombol chat)<input class="inp" data-p="wa_nomor" value="' + esc(s.wa_nomor || '') + '" placeholder="6281234567890"></label><label class="lbl" style="grid-column:1/-1">Pesan awal WhatsApp<input class="inp" data-p="wa_pesan" value="' + esc(s.wa_pesan || '') + '" maxlength="200"></label><label class="lbl">Teks banner promo<input class="inp" data-p="banner_teks" value="' + esc(s.banner_teks || '') + '" maxlength="140"></label><label class="lbl">Banner aktif<select class="inp" data-p="banner_aktif"><option value="1"' + (s.banner_aktif === '1' ? ' selected' : '') + '>Tampil</option><option value="0"' + (s.banner_aktif !== '1' ? ' selected' : '') + '>Sembunyikan</option></select></label><div style="grid-column:1/-1"><button class="btn btn-primary" type="submit">Simpan pengaturan</button></div></form></section>' +
        '<section class="card pad"><h2 class="h-sm">' + ic('lock', 20) + ' Rahasia & integrasi</h2><p class="muted">Nilai tidak ditampilkan ulang. Kosongkan lalu klik Hapus untuk mencabut.</p>' +
        rahasia('GOOGLE_CLIENT_ID', 'Google OAuth Client ID', 'xxxx.apps.googleusercontent.com', 'Untuk tombol "Masuk dengan Google". Buat di Google Cloud Console; tambahkan alamat situs ini ke Authorized JavaScript origins.') +
        rahasia('GEMINI_API_KEY', 'Gemini API Key', 'AIza…', 'Mengaktifkan tombol "Buat Game Langsung". Dipanggil dari server (UrlFetchApp), tidak dari browser.') +
        rahasia('GEMINI_MODEL', 'Model Gemini (opsional)', 'gemini-2.0-flash', 'Ganti bila model berubah. Kosong = bawaan.') + '</section>';
      $('#pf', c).addEventListener('submit', function (e) { e.preventDefault(); var v = {}; $$('[data-p]', c).forEach(function (i) { v[i.getAttribute('data-p')] = i.value; }); Api.call('pengaturan.simpan', { nilai: v }).then(function (r) { UI.toast(r.message, r.success ? 'ok' : 'err'); Api.boot(); }); });
      $$('[data-sv]', c).forEach(function (b) { b.addEventListener('click', function () { var k = b.getAttribute('data-sv'), i = $('[data-k="' + k + '"]', c); Api.call('rahasia.simpan', { kunci: k, nilai: i.value }).then(function (r) { i.value = ''; UI.toast(r.message, r.success ? 'ok' : 'err', 5000); if (r.success) App.route(); }); }); });
      $$('[data-rm]', c).forEach(function (b) { b.addEventListener('click', function () { UI.confirm('Hapus nilai ini dari Script Properties?', 'Hapus', true).then(function (y) { if (y) Api.call('rahasia.simpan', { kunci: b.getAttribute('data-rm'), nilai: '__HAPUS__' }).then(function (r) { UI.toast(r.message, r.success ? 'ok' : 'err'); App.route(); }); }); }); });
    });
  };

  /* ---------- Migrasi ---------- */
  P.adminMig = function (p, ok) {
    if (!guard()) return;
    var SH = ['Templat', 'Guru', 'Permainan', 'RiwayatPrompt', 'HasilSiswa'];
    var c = App.panel('admin', 'mig', head('Migrasi Data', 'Impor dari spreadsheet lama/cadangan. Sumber hanya dibaca, aman diulang, dan mendukung simulasi (dry-run).') +
      '<section class="card pad"><label class="lbl">URL atau ID spreadsheet sumber<input id="src" class="inp" placeholder="https://docs.google.com/spreadsheets/d/…"></label><small class="muted">Hanya dibaca — spreadsheet sumber tidak diubah. Harus milik akun Google yang sama dengan pemilik skrip.</small><div class="lbl">Sheet yang diimpor</div><div class="chk-row">' + SH.map(function (s) { return '<label class="chk"><input type="checkbox" value="' + s + '"' + (s === 'HasilSiswa' ? '' : ' checked') + '> ' + s + '</label>'; }).join('') + '</div><label class="chk"><input type="checkbox" id="ow"> Timpa data yang sudah ada (templat & permainan)</label><div class="form-act"><span class="muted">Mulai dengan <b>Pindai</b> untuk melihat dampaknya tanpa menulis apa pun.</span><span><button class="btn btn-outline" id="sc">' + ic('search', 18) + ' Pindai (Dry-run)</button> <button class="btn btn-primary glow shine" id="rn">' + ic('download', 18) + ' Jalankan Import</button></span></div><div id="mr"></div></section>' +
      '<div class="note">' + ic('bulb', 18) + '<div>Kunci pencocokan: templat = ID, guru = email, permainan = kode, nilai & riwayat = ID. Menjalankan import dua kali tidak menggandakan baris. Sesi login tidak ikut dipindah.</div></div>');
    function run(dry) {
      var src = $('#src', c).value.trim(); if (!src) { UI.toast('Isi URL/ID spreadsheet sumber.', 'err'); return; }
      var sheets = $$('input[type=checkbox]:checked', c).filter(function (i) { return i.id !== 'ow'; }).map(function (i) { return i.value; });
      var go = function () {
        $('#mr', c).innerHTML = App.loading(dry ? 'Memindai…' : 'Mengimpor…');
        Api.call('import.run', { source: src, sheets: sheets, dryRun: dry, overwrite: $('#ow', c).checked }).then(function (r) {
          if (!r.success) { $('#mr', c).innerHTML = '<div class="note note-err">' + esc(r.message) + '</div>'; return; }
          var d = r.data;
          $('#mr', c).innerHTML = '<h3 class="h-sm" style="margin-top:18px">' + (d.dryRun ? 'Hasil pindai (belum ada yang ditulis)' : 'Import selesai') + ' — ' + esc(d.source.name) + '</h3><div class="tbl-w"><table class="tbl"><thead><tr><th>Data</th><th>Di sumber</th><th>Ditambah</th><th>Diperbarui</th><th>Dilewati</th></tr></thead><tbody>' + Object.keys(d.report).map(function (k) { var x = d.report[k]; return '<tr><td><b>' + esc(k) + '</b></td><td>' + x.source + '</td><td>' + x.inserted + '</td><td>' + x.updated + '</td><td>' + x.skipped + '</td></tr>'; }).join('') + '</tbody></table></div>' + (d.warnings.length ? '<div class="note note-warn">' + ic('bell', 18) + '<div><b>Peringatan:</b><ul>' + d.warnings.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul></div></div>' : '');
          if (!dry) UI.toast('Import selesai.');
        });
      };
      if (dry) go(); else UI.confirm('Jalankan import sungguhan ke database aplikasi ini? Disarankan memindai dulu.', 'Jalankan import').then(function (y) { if (y) go(); });
    }
    $('#sc', c).addEventListener('click', function () { run(true); }); $('#rn', c).addEventListener('click', function () { run(false); });
  };

  /* ---------- Status ---------- */
  P.adminSys = function (p, ok) {
    if (!guard()) return;
    var c = App.panel('admin', 'sys', App.loading('Memuat status…'));
    return Api.call('system.status').then(function (r) {
      if (!ok()) return; if (!r.success) { c.innerHTML = App.err(r.message, true); return; }
      var d = r.data, pct = d.batasSel ? d.selTerisi / d.batasSel * 100 : 0;
      c.innerHTML = head('Status Sistem', 'Ringkasan kesehatan backend Apps Script dan Google Sheets.', '<button class="btn btn-outline" id="rf">' + ic('refresh', 18) + ' Segarkan</button>') +
        '<div class="metrics"><div class="metric"><span class="m-l">VERSI BACKEND</span><b class="m-v">' + esc(d.versi) + '</b></div><div class="metric"><span class="m-l">PEMBUATAN OTOMATIS (AI)</span><b class="m-v">' + (d.aiAktif ? 'Aktif' : 'Belum') + '</b></div><div class="metric"><span class="m-l">LOGIN GOOGLE</span><b class="m-v">' + (d.loginGoogleAktif ? 'Aktif' : 'Belum') + '</b></div><div class="metric"><span class="m-l">TRIGGER TERPASANG</span><b class="m-v">' + d.trigger + '</b><span class="m-f">keepWarm: ' + (d.keepWarm ? 'diizinkan' : 'dimatikan') + '</span></div></div>' +
        '<section class="card pad"><h2 class="h-sm">Spreadsheet induk</h2><p>' + esc(d.spreadsheetNama) + ' ' + (d.spreadsheetUrl ? '<a class="link" target="_blank" rel="noopener" href="' + esc(d.spreadsheetUrl) + '">Buka ' + ic('arrow', 14) + '</a>' : '') + '</p><div class="meter"><i style="width:' + Math.max(1, pct) + '%"></i></div><small class="muted">' + UI.fmtNum(d.selTerisi) + ' dari ' + UI.fmtNum(d.batasSel) + ' sel terisi (' + pct.toFixed(2).replace('.', ',') + '%)</small><div class="tbl-w"><table class="tbl"><thead><tr><th>Sheet</th><th>Baris data</th></tr></thead><tbody>' + (d.sheets.length ? d.sheets.map(function (s) { return '<tr><td>' + esc(s.nama) + '</td><td>' + UI.fmtNum(s.baris) + '</td></tr>'; }).join('') : '<tr><td colspan="2" class="muted">Tidak tersedia pada mode demo.</td></tr>') + '</tbody></table></div></section>' +
        '<section class="card pad"><h2 class="h-sm">Waktu respons (sesi ini)</h2><div class="tbl-w"><table class="tbl"><thead><tr><th>Aksi</th><th>Total (ms)</th><th>Server (ms)</th><th>Cache</th></tr></thead><tbody>' + (Perf.log.slice(-10).reverse().map(function (x) { return '<tr><td>' + esc(x.aksi) + '</td><td>' + x.total + '</td><td>' + (x.server === undefined ? '—' : x.server) + '</td><td>' + (x.cache ? '✓' : '') + '</td></tr>'; }).join('') || '<tr><td colspan="4" class="muted">Belum ada data.</td></tr>') + '</tbody></table></div></section>';
      $('#rf', c).addEventListener('click', function () { App.route(); });
    });
  };
})();
