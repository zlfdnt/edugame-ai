/* ============================================================
   app.js — router berbasis hash, kerangka halaman, inisialisasi
   ============================================================ */
(function () {
  'use strict';
  var $ = UI.$, ic = UI.ic, esc = UI.esc, CFG = window.APP_CONFIG || {};
  var root, shellKind = '', current = 0;
  var routes = [];
  var Pages = {};

  var App = {
    boot: null, settings: {}, templat: [], stats: { guru: 0, game: 0, siswa: 0 },
    me: function () { return Api.Sesi.me(); },
    go: function (path) { if (location.hash === '#' + path) route(); else location.hash = '#' + path; },
    appName: function () { return App.settings.nama_app || 'EduGame AI'; },
    waLink: function (extra) {
      var n = String(App.settings.wa_nomor || CFG.WA_NOMOR || '').replace(/[^0-9]/g, '');
      if (!n) return '';
      return 'https://wa.me/' + n + '?text=' + encodeURIComponent((App.settings.wa_pesan || CFG.WA_PESAN || '') + (extra ? '\n' + extra : ''));
    },
    baseUrl: function () { return location.origin + location.pathname.replace(/index\.html$/, ''); },
    linkGame: function (kode) { return App.baseUrl() + '#/main/' + encodeURIComponent(kode); },
    draft: function (v) { try { if (v === undefined) return JSON.parse(sessionStorage.getItem('edugame_draft') || '{}'); if (v === null) sessionStorage.removeItem('edugame_draft'); else sessionStorage.setItem('edugame_draft', JSON.stringify(v)); } catch (e) { return {}; } },
    loading: function (msg) { return '<div class="loading"><div class="spin"></div><p>' + esc(msg || 'Memuat…') + '</p></div>'; },
    err: function (msg, retry) { return '<div class="empty"><div class="empty-ic">' + ic('bell', 32) + '</div><h3>Terjadi kendala</h3><p>' + esc(msg) + '</p>' + (retry ? '<button class="btn btn-primary" data-retry>Coba lagi</button>' : '') + '</div>'; },
    applyBoot: function (d) {
      if (!d) return;
      App.boot = d; App.settings = d.pengaturan || {}; App.templat = d.templat || []; App.stats = d.stats || App.stats;
      var wa = $('#wa-float'), l = App.waLink();
      if (wa) { wa.hidden = !l; if (l) wa.href = l; }
    },
    /* ----- kerangka ----- */
    bare: function (html, cls) { shellKind = 'bare'; root.className = 'bare ' + (cls || ''); root.innerHTML = html; document.body.classList.add('is-bare'); UI.bind(root); return root; },
    pub: function (html) {
      document.body.classList.remove('is-bare'); root.className = 'pub';
      shellKind = 'pub';
      var me = App.me(), banner = App.settings.banner_aktif === '1' && App.settings.banner_teks ? '<div class="promo"><span>' + ic('sparkles', 16) + ' ' + esc(App.settings.banner_teks) + '</span><a href="#/masuk">Coba sekarang</a></div>' : '';
      root.innerHTML = banner + '<header class="nav"><div class="wrap nav-in"><a class="brand" href="#/">' + logo() + '<span>' + esc(App.appName()) + '</span></a><nav class="nav-links" id="navl"><a href="#/" data-s="beranda">Beranda</a><a href="#/" data-s="cara">Cara Kerja</a><a href="#/" data-s="katalog">Katalog Game</a><a href="#/main">Main dengan Kode</a></nav><div class="nav-act">' +
        (me ? '<a class="btn btn-outline btn-sm" href="#/' + (me.role === 'admin' ? 'admin' : 'guru') + '">Buka Panel</a>' : '<a class="btn btn-ghost btn-sm" href="#/masuk">Masuk Guru</a><a class="btn btn-primary btn-sm glow" href="#/masuk">Mulai Buat Game</a>') +
        '</div><button class="icon-btn nav-burger" id="burger" aria-label="Menu">' + ic('menu', 24) + '</button></div></header><main id="content">' + html + '</main>' +
        '<footer class="foot"><div class="wrap foot-in"><div><a class="brand brand-light" href="#/">' + logo() + '<span>' + esc(App.appName()) + '</span></a><p>Generator game interaktif untuk guru SD & SMP. Terpadu dengan Kurikulum Merdeka dan pembelajaran mendalam.</p></div><div><h4>Untuk Guru</h4><a href="#/masuk">Masuk / Daftar</a><a href="#/guru/buat">Buat Game Baru</a></div><div><h4>Untuk Siswa</h4><a href="#/main">Masukkan Kode Game</a></div></div><div class="wrap foot-bot"><span>© ' + new Date().getFullYear() + ' ' + esc(App.appName()) + '. Dibuat untuk guru Indonesia.</span>' + (Api.LIVE ? '' : '<span class="demo-tag">MODE DEMO — data hanya di browser ini</span>') + '</div></footer>';
      $('#burger', root).addEventListener('click', function () { $('#navl', root).classList.toggle('open'); });
      UI.bind(root); window.scrollTo(0, 0); return $('#content', root);
    },
    panel: function (kind, active, html) {
      document.body.classList.remove('is-bare');
      var me = App.me(); if (!me) { App.go('/masuk'); return null; }
      if (shellKind !== kind) {
        shellKind = kind; root.className = 'panel';
        var menu = kind === 'admin'
          ? [['/admin', 'database', 'Ringkasan & Templat', 'tpl'], ['/admin/guru', 'users', 'Data Guru', 'guru'], ['/admin/pengaturan', 'settings', 'Pengaturan & Rahasia', 'set'], ['/admin/migrasi', 'refresh', 'Migrasi Data', 'mig'], ['/admin/status', 'bolt', 'Status Sistem', 'sys'], ['/guru', 'gamepad', 'Panel Guru', 'guru-p']]
          : [['/guru', 'home', 'Dashboard', 'dash'], ['/guru/game', 'gamepad', 'Permainan Saya', 'game'], ['/guru/buat', 'plusc', 'Buat Game Baru', 'buat'], ['/guru/rekap', 'clip', 'Rekap Nilai', 'rekap'], ['/guru/bantuan', 'help', 'Bantuan', 'bantu']].concat(me.role === 'admin' ? [['/admin', 'settings', 'Panel Admin', 'adm']] : []);
        root.innerHTML = '<aside class="side" id="side"><a class="brand brand-light side-brand" href="#/">' + logo() + '<span>' + esc(App.appName()) + '<small>' + (kind === 'admin' ? 'PANEL ADMIN' : 'PANEL GURU') + '</small></span></a><div class="side-lbl">MENU UTAMA</div><nav>' +
          menu.map(function (m) { return '<a href="#' + m[0] + '" data-k="' + m[3] + '">' + ic(m[1], 20) + '<span>' + m[2] + '</span></a>'; }).join('') + '</nav><div class="side-foot"><div class="side-badge">SD/SMP Merdeka<small>Fase A-D Aktif</small></div><button class="side-out" id="keluar">' + ic('logout', 18) + ' Keluar</button></div></aside><div class="side-scrim" id="scrim"></div>' +
          '<div class="main"><header class="topbar"><button class="icon-btn burger" id="sb" aria-label="Menu">' + ic('menu', 24) + '</button><div class="top-t">' + ic('layers', 18) + ' <span>Ruang Guru Indonesia</span></div><div class="top-r">' + (Api.LIVE ? '' : '<span class="demo-tag">DEMO</span>') + '<button class="icon-btn" aria-label="Notifikasi">' + ic('bell', 20) + '</button><div class="who"><div class="av">' + esc((me.nama || 'G').trim().charAt(0).toUpperCase()) + '</div><div><b>' + esc(me.nama || 'Guru') + '</b><small>' + (me.role === 'admin' ? 'Administrator' : 'Guru Penggerak') + '</small></div></div></div></header><div class="page" id="content"></div></div>';
        $('#keluar', root).addEventListener('click', function () { Api.Sesi.clear(); App.go('/'); UI.toast('Anda sudah keluar.'); });
        $('#sb', root).addEventListener('click', function () { root.classList.toggle('side-open'); });
        $('#scrim', root).addEventListener('click', function () { root.classList.remove('side-open'); });
      }
      root.classList.remove('side-open');
      UI.$$('.side nav a', root).forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-k') === active); });
      var c = $('#content', root); c.innerHTML = html; UI.bind(c); window.scrollTo(0, 0); return c;
    },
    requireLogin: function (role) {
      var me = App.me();
      if (!me) { sessionStorage.setItem('edugame_next', location.hash.slice(1)); App.go('/masuk'); return false; }
      if (role === 'admin' && me.role !== 'admin') { UI.toast('Halaman ini khusus admin.', 'warn'); App.go('/guru'); return false; }
      return true;
    },
    Pages: Pages, route: route
  };
  function logo() { return '<span class="logo">' + ic('gamepad', 20) + '</span>'; }

  /* ----- router ----- */
  function add(pattern, fn) { var keys = [], re = new RegExp('^' + pattern.replace(/:([a-z]+)/g, function (_, k) { keys.push(k); return '([^/]+)'; }) + '/?$'); routes.push({ re: re, keys: keys, fn: fn }); }
  function parse() {
    var h = location.hash.replace(/^#/, '') || '/', q = {}, i = h.indexOf('?');
    if (i > -1) { h.slice(i + 1).split('&').forEach(function (p) { var kv = p.split('='); q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ''); }); h = h.slice(0, i); }
    return { path: h, q: q };
  }
  function route() {
    var r = parse(), id = ++current;
    UI.cleanup();
    for (var i = 0; i < routes.length; i++) {
      var m = r.path.match(routes[i].re);
      if (m) {
        var params = { q: r.q }; routes[i].keys.forEach(function (k, x) { params[k] = decodeURIComponent(m[x + 1]); });
        document.body.setAttribute('data-route', r.path.split('/')[1] || 'home');
        Promise.resolve(routes[i].fn(params, function () { return id === current; })).catch(function (e) { console.error(e); var c = $('#content') || root; c.innerHTML = App.err('Halaman gagal dimuat: ' + e.message); });
        return;
      }
    }
    App.pub('<section class="wrap"><div class="empty"><h3>Halaman tidak ditemukan</h3><p>Alamat yang Anda buka tidak tersedia.</p><a class="btn btn-primary" href="#/">Kembali ke Beranda</a></div></section>');
  }

  function init() {
    root = $('#app');
    App.applyBoot({ pengaturan: {}, templat: [], stats: {} });
    var cached = Api.bootCached(); if (cached) App.applyBoot(cached);
    Api.warmUp();
    // rute
    add('/', function (p, ok) { return Pages.landing(p, ok); });
    add('/masuk', function (p, ok) { return Pages.login(p, ok); });
    add('/main', function (p, ok) { return Pages.play(p, ok); });
    add('/main/:kode', function (p, ok) { return Pages.play(p, ok); });
    add('/guru', function (p, ok) { return Pages.dashboard(p, ok); });
    add('/guru/game', function (p, ok) { return Pages.games(p, ok); });
    add('/guru/buat', function (p, ok) { return Pages.buat(p, ok); });
    add('/guru/prompt', function (p, ok) { return Pages.prompt(p, ok); });
    add('/guru/hasil/:id', function (p, ok) { return Pages.hasil(p, ok); });
    add('/guru/rekap', function (p, ok) { return Pages.rekap(p, ok); });
    add('/guru/bantuan', function (p, ok) { return Pages.bantuan(p, ok); });
    add('/admin', function (p, ok) { return Pages.adminTpl(p, ok); });
    add('/admin/guru', function (p, ok) { return Pages.adminGuru(p, ok); });
    add('/admin/pengaturan', function (p, ok) { return Pages.adminSet(p, ok); });
    add('/admin/migrasi', function (p, ok) { return Pages.adminMig(p, ok); });
    add('/admin/status', function (p, ok) { return Pages.adminSys(p, ok); });
    window.addEventListener('hashchange', route);
    window.addEventListener('edugame:auth-expired', function () { UI.toast('Sesi berakhir. Silakan masuk lagi.', 'warn'); App.go('/masuk'); });
    document.addEventListener('click', function (e) { var r = e.target.closest && e.target.closest('[data-retry]'); if (r) route(); });
    UI.bind(document);
    // konten halaman dirender asinkron: ikat ulang efek (reveal, kilau, count-up) pada node baru
    new MutationObserver(UI.debounce(function () { UI.bind(root); }, 90)).observe(root, { childList: true, subtree: true });
    Api.flushPending();
    route();
    Api.boot().then(function (r) { if (r && r.success) { var was = JSON.stringify(App.boot); App.applyBoot(r.data); if (JSON.stringify(App.boot) !== was && App.onBoot) App.onBoot(); } });
  }

  window.App = App;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
