/* ============================================================
   pages-public.js — Beranda, Masuk, Main (siswa)
   ============================================================ */
(function () {
  'use strict';
  var $ = UI.$, $$ = UI.$$, ic = UI.ic, esc = UI.esc, P = App.Pages;
  var CFG = window.APP_CONFIG || {};

  /* ============================== BERANDA ============================== */
  var HERO = [
    { badge: 'AI-Powered • Gratis untuk guru SD & SMP', h: ['Bikin Game Pembelajaran Interaktif', 'Tanpa Koding', '& Tanpa Ribet'], p: 'Cukup isi materi dan capaian pembelajaran. Salin prompt siap pakai untuk AI atau buat kuis dan game langsung untuk kelas Anda.', art: 'hero0' },
    { badge: 'Siswa tanpa akun', h: ['Siswa Main Lewat Kode,', 'Nilai Masuk', 'Otomatis'], p: 'Bagikan kode atau QR ke ponsel, Chromebook, atau layar kelas. Skor dan waktu pengerjaan tercatat saat permainan selesai.', art: 'hero1' },
    { badge: 'Kurikulum Merdeka', h: ['Pantau Hasil Kelas dalam', 'Satu Dashboard', 'Rapi'], p: 'Rekap nilai per siswa atau kelompok, filter kelas dan materi, lalu unduh ke Excel atau PDF kapan saja.', art: 'hero2' }
  ];
  P.landing = function (p, ok) {
    var kelasOpt = Content.KELAS.map(function (k) { return '<option value="' + k.v + '">' + k.label + '</option>'; }).join('');
    function draw() {
      var st = App.stats, tpls = App.templat.length ? App.templat : [];
      var html = '<section class="hero" id="beranda"><div class="hero-glow"></div><div class="wrap"><div class="hero-slides" id="hs">' +
        HERO.map(function (s, i) {
          return '<div class="slide hslide"><div class="hero-text"><span class="badge badge-glass">' + ic('sparkles', 14) + ' ' + esc(s.badge) + '</span><h1>' + esc(s.h[0]) + ' <span class="hl">' + esc(s.h[1]) + '</span> ' + esc(s.h[2]) + '</h1><p>' + esc(s.p) + '</p><div class="hero-cta"><a class="btn btn-accent btn-lg glow shine" href="#/masuk">Mulai Buat Game Gratis ' + ic('arrow', 20) + '</a><a class="btn btn-glass btn-lg shine" href="#/main">' + ic('play', 20) + ' Main dengan Kode</a></div></div><div class="hero-art tilt"><img src="' + Art.scene(s.art, i) + '" alt="" loading="' + (i ? 'lazy' : 'eager') + '"><span class="float f1">' + ic('star', 22) + '</span><span class="float f2">' + ic('trophy', 22) + '</span></div></div>';
        }).join('') + '</div><div class="dots hero-dots" id="hd"></div>' +
        '<div class="stats"><div class="stat" data-reveal><b data-count="' + (st.guru || 0) + '">0</b><span>Guru terdaftar</span></div><div class="stat" data-reveal><b data-count="' + (st.game || 0) + '">0</b><span>Game dibuat</span></div><div class="stat" data-reveal><b data-count="' + (st.siswa || 0) + '">0</b><span>Hasil siswa tercatat</span></div><div class="stat" data-reveal><b data-count="' + (tpls.length || 6) + '">0</b><span>Jenis game siap pakai</span></div></div></div></section>' +

        '<section class="wrap gen-wrap" id="generator"><div class="gen card-fx shine" data-reveal><div class="gen-head"><span class="badge">' + ic('bolt', 14) + ' Generator Game Instan</span><h2>Ubah materi ajar jadi game edukasi</h2></div><form id="gf" class="gen-form"><label>Jenjang & kelas<select id="gk" class="inp">' + kelasOpt + '</select></label><label>Mata pelajaran<select id="gm" class="inp"></select></label><label>Topik / pokok bahasan<input id="gt" class="inp" required maxlength="120" placeholder="Contoh: Bagian tubuh tumbuhan"></label><button class="btn btn-primary btn-lg glow shine" type="submit">Rancang Game ' + ic('arrow', 20) + '</button></form><p class="gen-note">' + ic('checkc', 16) + ' Tujuan pembelajaran dan unsur pembelajaran mendalam disusun otomatis. Pilih <b>Salin Prompt</b> atau <b>Buat Game Langsung</b>.</p></div></section>' +

        '<section class="sec" id="cara"><div class="wrap"><div class="sec-h" data-reveal><span class="badge">Cara kerja</span><h2>Dari materi ke kelas dalam tiga langkah</h2><p>Tanpa menulis prompt panjang dan tanpa menyentuh kode.</p></div><div class="steps">' +
        [['Isi identitas & materi', 'Pilih kelas, mata pelajaran, topik, dan jenis asesmen. Sistem menyusun tujuan pembelajaran otomatis.', 'edit'], ['Pilih jenis game', 'Tentukan mode, durasi, tingkat kesulitan, dan salah satu dari enam jenis permainan.', 'gamepad'], ['Bagikan & pantau', 'Siswa main lewat kode/QR. Nilai masuk ke dashboard dan bisa diunduh.', 'share']].map(function (s, i) { return '<div class="step card-fx shine" data-reveal><span class="step-n">' + (i + 1) + '</span><div class="ic-grad">' + ic(s[2], 26) + '</div><h3>' + s[0] + '</h3><p>' + s[1] + '</p></div>'; }).join('') + '</div></div></section>' +

        '<section class="sec sec-alt" id="katalog"><div class="wrap"><div class="sec-h" data-reveal><span class="badge">Katalog templat siap pakai</span><h2>' + (tpls.length || 24) + ' jenis game pembelajaran</h2><p>Dari kuis dan teka-teki sampai petualangan arcade. Setiap templat dirancang untuk fase belajar dan mekanik bermain yang berbeda.</p></div><div class="chips-f" id="cf" role="tablist">' +
        Content.KATEGORI.map(function (k) { var n = k[0] === 'semua' ? tpls.length : tpls.filter(function (t) { return (Content.ENGINE_INFO[t.engine] || {}).kat === k[0]; }).length; return n ? '<button class="chip-f' + (k[0] === 'semua' ? ' on' : '') + '" data-kat="' + k[0] + '" role="tab">' + k[1] + ' <b>' + n + '</b></button>' : ''; }).join('') +
        '</div><div class="tpl-grid" id="tg"></div></div></section>' +

        '<section class="sec" id="kode"><div class="wrap"><div class="join card-fx shine" data-reveal><div><span class="badge badge-warm">' + ic('users', 14) + ' Untuk siswa</span><h2>Punya kode dari guru?</h2><p>Masukkan kode permainan untuk mulai bermain. Tidak perlu akun.</p></div><form id="jf" class="join-form"><input id="jk" class="inp inp-code" placeholder="PLANT-402" maxlength="20" autocapitalize="characters" aria-label="Kode permainan"><button class="btn btn-accent btn-lg glow shine" type="submit">Main Sekarang ' + ic('arrow', 20) + '</button></form></div></div></section>' +

        '<section class="wrap"><div class="cta" data-reveal><h2>Siap bikin game kelas pertama Anda?</h2><p>Gratis untuk guru SD & SMP. Mulai dalam satu menit.</p><a class="btn btn-accent btn-lg glow shine" href="#/masuk">Daftar Guru & Buat Game ' + ic('arrow', 20) + '</a></div></section>';
      var c = App.pub(html);
      // slideshow hero
      UI.rotator(c, { slideSel: '.hslide', ms: CFG.SLIDE_HERO_MS || 6000, dots: '#hd', pauseEl: $('#beranda', c) });
      // katalog: filter kategori + slideshow kartu yang dimulai hanya saat terlihat
      var katAktif = 'semua', lazyIo = ('IntersectionObserver' in window) ? new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (!x.isIntersecting) return; lazyIo.unobserve(x.target); aktifkanKartu(x.target); });
      }, { rootMargin: '120px' }) : null;
      function aktifkanKartu(m) {
        var idx = +m.getAttribute('data-i'), t = tpls[idx]; if (!t || m._on) return; m._on = 1;
        Art.gambarTemplat(t).slice(1).forEach(function (u) { m.insertAdjacentHTML('afterbegin', '<img class="slide" src="' + esc(u) + '" alt="" loading="lazy">'); });
        UI.rotator(m, { slideSel: '.slide', dots: '.dots', ms: (CFG.SLIDE_KARTU_MS || 3200) + (idx % 3) * 400, delay: (idx % 6) * 450, pauseEl: m.closest('.tpl-card') });
      }
      function isiKatalog() {
        var list = tpls.map(function (t, i) { return [t, i]; }).filter(function (x) { return katAktif === 'semua' || (Content.ENGINE_INFO[x[0].engine] || {}).kat === katAktif; });
        $('#tg', c).innerHTML = list.map(function (x) { return tplCard(x[0], x[1]); }).join('') || '<div class="empty"><p>Katalog sedang dimuat…</p></div>';
        UI.bind($('#tg', c));
        $$('.tpl-media', c).forEach(function (m) { if (lazyIo) lazyIo.observe(m); else aktifkanKartu(m); });
      }
      isiKatalog();
      $('#cf', c).addEventListener('click', function (e) { var b = e.target.closest('.chip-f'); if (!b) return; katAktif = b.getAttribute('data-kat'); $$('.chip-f', c).forEach(function (x) { x.classList.toggle('on', x === b); }); isiKatalog(); });
      // form generator
      var gk = $('#gk', c), gm = $('#gm', c);
      function mapel() { var k = Content.KELAS.filter(function (x) { return x.v === gk.value; })[0]; gm.innerHTML = Content.MAPEL[k.jenjang].map(function (m) { return '<option>' + esc(m) + '</option>'; }).join(''); }
      gk.addEventListener('change', mapel); mapel();
      $('#gf', c).addEventListener('submit', function (e) { e.preventDefault(); App.draft({ kelasV: gk.value, mapel: gm.value, materi: $('#gt', c).value.trim() }); go(); });
      $('#tg', c).addEventListener('click', function (e) { var b = e.target.closest('[data-tpl]'); if (!b) return; e.preventDefault(); var t = tpls.filter(function (x) { return x.id === b.getAttribute('data-tpl'); })[0]; App.draft(Object.assign(App.draft(), { templateId: b.getAttribute('data-tpl'), engine: t && t.engine, dipilih: true, phase: 'atur', step: App.draft().materi ? 2 : 1 })); go(); });
      $('#jf', c).addEventListener('submit', function (e) { e.preventDefault(); var k = $('#jk', c).value.trim(); if (k) App.go('/main/' + encodeURIComponent(k.toUpperCase())); });
      $$('[data-s]', c.closest('.pub')).forEach(function (a) { a.addEventListener('click', function (e) { var t = { beranda: '#beranda', cara: '#cara', katalog: '#katalog' }[a.getAttribute('data-s')]; var n = $(t); if (n) { e.preventDefault(); n.scrollIntoView({ behavior: UI.reduce ? 'auto' : 'smooth' }); $('#navl').classList.remove('open'); } }); });
    }
    function go() { App.go(App.me() ? '/guru/buat' : '/masuk'); if (!App.me()) sessionStorage.setItem('edugame_next', '/guru/buat'); }
    function tplCard(t, idx) {
      var info = Content.ENGINE_INFO[t.engine] || Content.ENGINE_INFO.kuis, imgs = Art.gambarTemplat(t), kat = (Content.KATEGORI.filter(function (k) { return k[0] === info.kat; })[0] || [0, ''])[1];
      return '<article class="tpl-card card-fx shine tilt" data-reveal style="--c:' + esc(t.warna || info.warna) + '"><div class="tpl-media" data-i="' + idx + '"><img class="slide" src="' + esc(imgs[0]) + '" alt="Contoh tampilan ' + esc(t.nama) + '" loading="lazy"><div class="dots"></div></div><div class="tpl-body"><div class="tpl-top"><span class="ic-grad">' + ic(t.ikon || info.ikon, 24) + '</span><span class="badge badge-s">' + esc(kat) + '</span></div><h3>' + esc(t.nama) + '</h3><p>' + esc(t.deskripsi) + '</p><ul class="ticks">' + info.ciri.map(function (x) { return '<li>' + ic('check', 14) + esc(x) + '</li>'; }).join('') + '</ul><div class="fase-r">Fase ' + esc(String(t.fase).replace(/,/g, ' • ')) + '</div><a href="#/masuk" class="btn btn-outline btn-block glow-soft shine" data-tpl="' + esc(t.id) + '">Pakai Templat ' + ic('arrow', 18) + '</a></div></article>';
    }
    draw();
    App.onBoot = function () { if (ok()) { var y = window.scrollY; draw(); window.scrollTo(0, y); } };
    return Promise.resolve();
  };

  /* ============================== MASUK ============================== */
  P.login = function (p, ok) {
    var me = App.me(); if (me) { App.go(me.role === 'admin' ? '/admin' : '/guru'); return; }
    var demo = !Api.LIVE;
    App.bare('<div class="login"><a class="login-back" href="#/">' + ic('back', 18) + ' Beranda</a><div class="login-card card-fx shine"><div class="login-brand"><span class="logo logo-lg">' + ic('gamepad', 28) + '</span><h1>' + esc(App.appName()) + '</h1><p>Masuk untuk membuat dan memantau permainan kelas Anda.</p></div>' +
      (demo ? '<div class="note note-warn">' + ic('bell', 18) + '<div><b>Mode demo.</b> Backend Apps Script belum terpasang, jadi data hanya tersimpan di browser ini.</div></div><button class="btn btn-primary btn-lg btn-block glow" id="dg">Masuk Demo sebagai Guru ' + ic('arrow', 20) + '</button><button class="btn btn-outline btn-block" id="da">Masuk Demo sebagai Admin</button>'
        : '<div id="gbtn" class="gbtn"></div><div id="gmsg" class="muted center"></div><p class="login-hint">Akun Google guru akan terdaftar otomatis saat pertama masuk.</p><details class="dar"><summary>Akses darurat pengelola</summary><form id="df"><label>Nama pengguna<input class="inp" id="du" autocomplete="username" required></label><label>Kata sandi<input class="inp" id="dp" type="password" autocomplete="off" required></label><button class="btn btn-outline btn-block" type="submit">Masuk darurat</button></form></details>') + '</div></div>', 'bare-login');
    function sukses(r) {
      Api.Sesi.set({ token: r.data.token, me: r.data.me }); UI.toast('Selamat datang, ' + (r.data.me.nama || 'Guru') + '!');
      var nx = sessionStorage.getItem('edugame_next'); sessionStorage.removeItem('edugame_next');
      var tujuan = nx && nx.indexOf('/guru') === 0 ? nx : (r.data.me.role === 'admin' ? '/admin' : '/guru');
      if (tujuan === '/guru') Api.call('guru.dashboard');          // dimulai sekarang; permintaan halaman digabung (dedupe)
      App.go(tujuan);
    }
    if (demo) {
      $('#dg').addEventListener('click', function () { Api.call('auth.darurat', { username: 'guru' }).then(sukses); });
      $('#da').addEventListener('click', function () { Api.call('auth.darurat', { username: 'admin' }).then(sukses); });
      return;
    }
    $('#df').addEventListener('submit', function (e) {
      e.preventDefault(); var b = e.submitter; b.disabled = true;
      Api.call('auth.darurat', { username: $('#du').value, password: $('#dp').value }).then(function (r) { b.disabled = false; $('#dp').value = ''; if (r.success) sukses(r); else UI.toast(r.message, 'err', 5000); });
    });
    function masuk(resp) {
      var m = $('#gmsg'), g = $('#gbtn'); if (!m) return;
      m.innerHTML = '<span class="spin sm"></span> Memverifikasi akun…'; g.style.opacity = '.45'; g.style.pointerEvents = 'none';
      Api.call('auth.google', { idToken: resp.credential }).then(function (rr) {
        if (rr.success) { sukses(rr); return; }
        g.style.opacity = ''; g.style.pointerEvents = '';
        m.innerHTML = '<div class="note note-err">' + esc(rr.message) + '</div>';
      });
    }
    function pasang(cid) {
      UI.loadScript('https://accounts.google.com/gsi/client').then(function () {
        if (!$('#gbtn')) return;
        google.accounts.id.initialize({ client_id: cid, callback: masuk, auto_select: false, cancel_on_tap_outside: true });
        google.accounts.id.renderButton($('#gbtn'), { theme: 'filled_blue', size: 'large', text: 'continue_with', shape: 'pill', width: 300, locale: 'id' });
        $('#gmsg').textContent = '';
      }).catch(function () { var m = $('#gmsg'); if (m) m.innerHTML = 'Gagal memuat login Google. <button class="link" id="rl" style="border:0;background:none;cursor:pointer">Muat ulang</button>'; var r = $('#rl'); if (r) r.addEventListener('click', function () { App.route(); }); });
    }
    // Client ID bersifat publik: dipakai dari cache/boot sehingga tombol Google muncul tanpa menunggu server
    if (App.googleClientId) pasang(App.googleClientId);
    else { $('#gmsg').innerHTML = '<span class="spin sm"></span> Menyiapkan…'; Api.boot().then(function () { if (App.googleClientId) pasang(App.googleClientId); else { var m = $('#gmsg'); if (m) m.innerHTML = 'Login Google belum diaktifkan admin. Gunakan akses darurat untuk mengisinya di <b>Admin › Pengaturan</b>.'; } }); }
  };

  /* ============================== MAIN (SISWA) ============================== */
  var AVATARS = [['🚀', 'Astro'], ['🐱', 'Kuro'], ['🦸', 'Juara'], ['🌱', 'Sprout']];
  P.play = function (p, ok) {
    var kode = (p.kode || '').toUpperCase(), uji = p.q && p.q.uji === '1', ctl = null, game = null;
    document.body.classList.add('is-bare');
    function shell(inner) { return App.bare('<div class="play">' + inner + '</div>', 'bare-play'); }
    function head() { return '<header class="play-head"><a class="brand" href="#/">' + '<span class="logo">' + ic('gamepad', 20) + '</span><span>' + esc(App.appName()) + '<small>Kurikulum Merdeka</small></span></a><span class="status-pill"><i></i> ' + (Api.LIVE ? 'Server siap' : 'Mode demo') + '</span></header>'; }
    if (!kode) return pageKode();

    function pageKode(msg) {
      shell(head() + '<div class="play-card card-fx"><span class="badge badge-warm">' + ic('gamepad', 14) + ' Ruang Main Siswa</span><h1>Ayo Bermain! 🚀</h1><p class="muted">Masukkan kode PIN dari Bapak/Ibu Guru untuk bergabung ke permainan kelasmu.</p><form id="kf"><label class="lbl">KODE GAME (PIN KELAS)<input id="kk" class="inp inp-code" maxlength="20" autocapitalize="characters" placeholder="PLANT-402" autofocus></label>' + (msg ? '<div class="note note-err">' + esc(msg) + '</div>' : '') + '<button class="btn btn-primary btn-lg btn-block glow shine" type="submit">Cari Permainan ' + ic('arrow', 20) + '</button></form><div class="safe">' + ic('lock', 16) + ' Aman & praktis: tanpa login. Skor tersimpan otomatis untuk guru.</div></div>');
      $('#kf').addEventListener('submit', function (e) { e.preventDefault(); var k = $('#kk').value.trim().toUpperCase(); if (k) App.go('/main/' + encodeURIComponent(k)); });
    }
    shell(head() + App.loading('Mencari permainan…'));
    return Api.call('pub.game', { kode: kode }).then(function (r) {
      if (!ok()) return;
      if (!r.success) { pageKode(r.message); return; }
      game = r.data; identitas();
    });

    function identitas() {
      var last = Api.lsGet('edugame_siswa', {}), info = Content.ENGINE_INFO[game.engine] || {}, tim = game.engine === 'duel' || game.mode === 'kelompok' && game.engine === 'duel';
      var kelasOpt = Content.daftarKelasSiswa(game).map(function (k) { return '<option' + (last.kelas === k ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('');
      var n = Content.jumlahItem(game.engine, game.konten);
      shell(head() + '<div class="play-card card-fx"><div class="found"><div class="found-top"><span>' + ic('checkc', 16) + ' MISI DITEMUKAN!</span><span class="pill">' + n + ' ' + ((info.sat || 'soal').replace('butir soal', 'soal')) + '</span></div><h2>' + esc(game.judul) + '</h2><div class="found-meta">' + (game.sekolah ? '🏫 ' + esc(game.sekolah) + ' • ' : '') + ic('user', 15) + ' ' + esc(game.guru || 'Guru') + ' • ' + ic('timer', 15) + ' ' + game.durasi + ' menit • ' + esc(info.nama || '') + '</div></div>' +
        '<h3 class="step-h"><span>2</span> Identitas Pemain</h3><form id="pf">' +
        (tim ? '<div class="grid2"><label class="lbl">Nama Tim 1<input id="t1" class="inp" maxlength="30" value="Tim Elang" required></label><label class="lbl">Nama Tim 2<input id="t2" class="inp" maxlength="30" value="Tim Harimau" required></label></div>'
          : '<label class="lbl">Nama lengkap / panggilan <em>Wajib</em><input id="nm" class="inp" maxlength="60" value="' + esc(last.nama || '') + '" required autocomplete="name"></label>') +
        '<label class="lbl">Pilih kelas / regu<select id="kl" class="inp">' + kelasOpt + '</select></label>' +
        (tim ? '' : '<div class="lbl">Pilih avatar petualang</div><div class="avs" id="avs">' + AVATARS.map(function (a, i) { return '<button type="button" class="av-b' + ((last.avatar || '🌱') === a[0] ? ' on' : '') + '" data-a="' + a[0] + '"><span>' + a[0] + '</span><small>' + a[1] + '</small></button>'; }).join('') + '</div>') +
        (uji ? '<div class="note note-warn">' + ic('eye', 16) + ' Mode uji coba guru — nilai tidak disimpan.</div>' : '') +
        '<button class="btn btn-primary btn-lg btn-block glow shine" type="submit">Mulai Main Sekarang! ' + ic('flag', 20) + '</button></form><div class="play-foot"><button class="chip-btn" id="sfx">' + ic('sound', 16) + ' Efek suara: <b>' + (Games.sfx.on() ? 'Aktif' : 'Mati') + '</b></button><a class="chip-btn" href="#/main">' + ic('help', 16) + ' Ganti kode</a></div></div>');
      var av = last.avatar || '🌱';
      $$('.av-b').forEach(function (b) { b.addEventListener('click', function () { av = b.getAttribute('data-a'); $$('.av-b').forEach(function (x) { x.classList.toggle('on', x === b); }); }); });
      $('#sfx').addEventListener('click', function () { $('#sfx b').textContent = Games.sfx.toggle() ? 'Aktif' : 'Mati'; });
      $('#pf').addEventListener('submit', function (e) {
        e.preventDefault();
        var pl = { kelas: $('#kl').value, avatar: av };
        if (tim) { pl.teams = [$('#t1').value.trim() || 'Tim 1', $('#t2').value.trim() || 'Tim 2']; pl.nama = pl.teams.join(' vs '); }
        else { pl.nama = $('#nm').value.trim(); if (!pl.nama) return; Api.lsSet('edugame_siswa', { nama: pl.nama, kelas: pl.kelas, avatar: av }); }
        main(pl);
      });
    }
    function main(pl) {
      document.body.classList.add('in-arena');
      shell(head().replace('play-head', 'play-head play-head-min') + '<div id="arena"></div>');
      var t0 = Date.now();
      if (game.engine === 'html') {
        ctl = HtmlGame.mount($('#arena'), game, pl, { preview: uji,
          submit: function (pp) { return Api.kirimHasil({ kode: game.kode, nonce: Date.now() % 100000, peserta: [pp], jawaban: [] }); },
          onQuit: function () { document.body.classList.remove('in-arena'); App.go('/main/' + encodeURIComponent(game.kode)); } });
        UI.onCleanup(function () { if (ctl) { try { ctl.destroy(); } catch (e) { /* abaikan */ } } });
        return;
      }
      ctl = Games.start($('#arena'), game, pl, function (res) { ctl.destroy(); hasil(pl, res, Math.round((Date.now() - t0) / 1000)); }, function () { document.body.classList.remove('in-arena'); App.go('/main/' + encodeURIComponent(game.kode)); });
      UI.onCleanup(function () { if (ctl) { try { ctl.destroy(); } catch (e) { /* abaikan */ } } });   // bersihkan timer & pendengar tombol saat berpindah halaman
    }
    function hasil(pl, res, dur) {
      document.body.classList.remove('in-arena');
      var rows = res.peserta, utama = rows[0], menang = rows.length > 1 ? rows.slice().sort(function (a, b) { return b.skor - a.skor; }) : null;
      var skor = utama.skor, ring = 'conic-gradient(var(--accent) ' + (skor * 3.6) + 'deg, #E2E8F0 0)';
      shell(head() + '<div class="play-card res card-fx"><div class="ring" style="background:' + ring + '"><div><b data-count="' + skor + '">0</b><small>/100</small></div></div>' +
        (menang && menang[0].skor !== menang[1].skor ? '<h1>🏆 ' + esc(menang[0].nama) + ' menang!</h1>' : menang ? '<h1>Seri! Dua tim sama kuat</h1>' : '<h1>' + (skor >= 75 ? 'Hebat, ' : 'Semangat, ') + esc(utama.nama.split(' ')[0]) + '!</h1>') +
        '<p class="muted" id="umpan">' + (skor >= 90 ? 'Luar biasa! Pemahamanmu sangat kuat.' : skor >= 75 ? 'Bagus sekali! Kamu sudah menguasai materi ini.' : skor >= 60 ? 'Cukup baik. Pelajari lagi bagian yang masih salah, ya.' : 'Jangan menyerah! Coba ulangi dan baca materinya sekali lagi.') + '</p>' +
        '<div class="res-grid">' + rows.map(function (r) { return '<div class="res-i"><b>' + esc(r.nama) + '</b><span>' + r.benar + ' / ' + r.total + ' benar • skor ' + r.skor + '</span></div>'; }).join('') + '<div class="res-i"><b>Waktu</b><span>' + UI.fmtDur(dur) + '</span></div></div>' +
        '<div id="svs" class="save-s"><div class="spin sm"></div> Menyimpan nilai…</div><div id="rk" class="rk-w"></div><div class="res-act"><button class="btn btn-primary btn-lg glow shine" id="again">Main Lagi ' + ic('refresh', 18) + '</button><a class="btn btn-outline btn-lg" href="#/main">Kode Lain</a></div></div>');
      UI.bind(root_()); if (skor >= 75) { UI.confetti(); Games.sfx.win(); }
      $('#again').addEventListener('click', function () { identitas(); });
      if (uji) { $('#svs').innerHTML = ic('eye', 16) + ' Mode uji coba — nilai tidak disimpan.'; return; }
      Api.kirimHasil({ kode: game.kode, nonce: Date.now() % 100000, peserta: rows.map(function (r) { return { nama: r.nama, kelas: r.kelas, avatar: r.avatar, skor: r.skor, benar: r.benar, total: r.total, durasi: dur }; }), jawaban: res.jawaban }).then(function (r) {
        var s = $('#svs'); if (!s) return;
        if (r.success && r.data && r.data.rank) {
          var rkEl = document.getElementById('rk');
          if (rkEl) {
            rkEl.innerHTML = Rank.html(r.data.rank, r.data.rank.me) + '<button type="button" class="btn btn-soft btn-sm" id="rkref">' + ic('refresh', 16) + ' Muat ulang peringkat</button>';
            var rb = document.getElementById('rkref');
            if (rb) rb.addEventListener('click', function () { rb.disabled = true; Api.call('pub.rank', { kode: game.kode, nama: utama.nama, kelas: utama.kelas }).then(function (rr) { var z = document.getElementById('rk'); if (rr.success && z) { z.innerHTML = Rank.html(rr.data, rr.data.me) + '<span class="muted">Peringkat diperbarui.</span>'; } else rb.disabled = false; }); });
          }
        }
        if (r.success) { s.innerHTML = '<span class="good">' + ic('checkc', 16) + ' Nilai tersimpan untuk guru.</span>'; if (r.data && r.data.hasil && r.data.hasil[0] && game.kunciTersembunyi) { var sv = r.data.hasil[0].skor, rg = $('#ring'), sk = $('#sk'), um = $('#umpan'); if (um) um.textContent = r.data.umpan; if (rg) rg.style.background = 'conic-gradient(var(--accent) ' + (sv * 3.6) + 'deg, #E2E8F0 0)'; if (sk) { sk.setAttribute('data-count', sv); UI.countUp(sk); } } }
        else if (r.queued) s.innerHTML = '<span class="warn">' + ic('bell', 16) + ' Koneksi bermasalah — nilai disimpan di perangkat dan dikirim ulang otomatis.</span>';
        else s.innerHTML = '<span class="bad">' + ic('x', 16) + ' ' + esc(r.message) + '</span>';
      });
    }
    function root_() { return document.getElementById('app'); }
  };
})();
