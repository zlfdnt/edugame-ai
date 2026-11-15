/* ============================================================
   api.js — komunikasi ke backend GAS (fetch) + MODE DEMO lokal
   • POST selalu text/plain;charset=utf-8 (hindari preflight CORS GAS)
   • Token sesi dikirim di body, bukan query string
   • Baca identik yang sedang berjalan digabung (dedupe) + epoch tulis
   • Hasil siswa yang gagal terkirim disimpan lokal & dikirim ulang
   ============================================================ */
(function () {
  'use strict';
  var CFG = window.APP_CONFIG || {};
  var LIVE = !!CFG.GAS_URL && !/GANTI|XXXX/.test(CFG.GAS_URL);
  var LS = { sesi: 'edugame_sesi', boot: 'edugame_boot', pending: 'edugame_pending', demo: 'edugame_demo_v1' };

  function lsGet(k, def) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* penyimpanan penuh/dinonaktifkan */ } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { /* abaikan */ } }

  /* ---------- sesi ---------- */
  var Sesi = {
    get: function () { return lsGet(LS.sesi, null); },
    set: function (s) { lsSet(LS.sesi, s); },
    clear: function () { lsDel(LS.sesi); },
    token: function () { var s = Sesi.get(); return s ? s.token : ''; },
    me: function () { var s = Sesi.get(); return s ? s.me : null; }
  };

  /* ---------- pengukur performa ---------- */
  var Perf = { log: [], add: function (a, total, srv, cached) { this.log.push({ aksi: a, total: total, server: srv, cache: !!cached }); if (this.log.length > 60) this.log.shift(); },
    table: function () { console.table(this.log); } };

  /* ---------- panggilan live ---------- */
  var inflight = {}, epoch = 0;
  var READ_PUB = /^(pub\.boot|pub\.game|pub\.rank|auth\.config|ping)$/;
  var READ_ALL = /^(me|guru\.dashboard|guru\.games|game\.get|hasil\.list|admin\.overview|admin\.guru|rahasia\.status|system\.status|konten\.validasi|batch)$/;

  function fetchJson(url, opt, ms) {
    var ctl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 30000);
    if (ctl) opt.signal = ctl.signal;
    return fetch(url, opt).then(function (r) { clearTimeout(timer); return r.json(); }, function (e) { clearTimeout(timer); throw e; });
  }
  function liveRun(action, data, useGet) {
    var t0 = performance.now();
    var p;
    if (useGet) {
      var q = ['action=' + encodeURIComponent(action)];
      Object.keys(data || {}).forEach(function (k) { q.push(encodeURIComponent(k) + '=' + encodeURIComponent(data[k])); });
      p = fetchJson(CFG.GAS_URL + '?' + q.join('&'), { method: 'GET' });
    } else {
      p = fetchJson(CFG.GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: action, token: Sesi.token(), data: data || {} }) });
    }
    return p.then(function (res) {
      Perf.add(action, Math.round(performance.now() - t0), res.ms, res.cached);
      if (res && res.code === 'AUTH') { Sesi.clear(); window.dispatchEvent(new CustomEvent('edugame:auth-expired')); }
      return res;
    }).catch(function (err) {
      var msg = err && err.name === 'AbortError' ? 'Server terlalu lama merespons. Coba lagi sebentar.' : 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      return { success: false, message: msg, code: 'NET' };
    });
  }

  function liveRunRetry(action, data, useGet) {
    return liveRun(action, data, useGet).then(function (r) {
      if (r && r.code === 'NET') return new Promise(function (res) { setTimeout(res, 900); }).then(function () { return liveRun(action, data, useGet); });
      return r;
    });
  }
  function call(action, data, opts) {
    opts = opts || {};
    data = data || {};
    if (!LIVE) return Promise.resolve(Demo.handle(action, data, Sesi.get())).then(function (r) { return delay(r, action); });
    var isRead = READ_PUB.test(action) || READ_ALL.test(action);
    if (!isRead) { epoch++; return /^auth\./.test(action) ? liveRunRetry(action, data, false) : liveRun(action, data, false); }
    var useGet = READ_PUB.test(action) && action !== 'ping';
    if (opts.fresh) data = Object.assign({ _fresh: true }, data);
    var k = epoch + '|' + action + '|' + Sesi.token() + '|' + JSON.stringify(data);
    if (inflight[k]) return inflight[k];
    var p = liveRunRetry(action, data, useGet);
    inflight[k] = p;
    p.then(function () { delete inflight[k]; }, function () { delete inflight[k]; });
    return p;
  }
  function delay(r, action) { return new Promise(function (res) { setTimeout(function () { res(r); }, /generate/.test(action) ? 50 : 60); }); }

  /* ---------- boot publik dengan SWR ---------- */
  function bootCached() { var c = lsGet(LS.boot, null); return c && c.data ? c.data : null; }
  function boot() {
    return call('pub.boot').then(function (r) { if (r && r.success) { lsSet(LS.boot, { at: Date.now(), data: r.data }); if (r.data && r.data.googleClientId) lsSet('edugame_gcid', r.data.googleClientId); } return r; });
  }
  function warmUp() {
    if (!LIVE) return;
    var k = 'edugame_warm', last = Number(sessionStorage.getItem(k) || 0);
    if (Date.now() - last < 240000) return;
    sessionStorage.setItem(k, String(Date.now()));
    try { fetch(CFG.GAS_URL + '?w=pub', { mode: 'no-cors' }); } catch (e) { /* abaikan */ }
  }

  /* ---------- kirim hasil siswa (dengan antrean ulang) ---------- */
  function kirimHasil(payload) {
    return call('pub.submit', payload).then(function (r) {
      if (r && r.success) return r;
      if (r && (r.code === 'NET' || r.code === 'BUSY')) {
        var q = lsGet(LS.pending, []); q.push({ at: Date.now(), payload: payload }); lsSet(LS.pending, q.slice(-30));
        return Object.assign({}, r, { queued: true });
      }
      return r;
    });
  }
  function flushPending() {
    var q = lsGet(LS.pending, []);
    if (!q.length) return;
    lsSet(LS.pending, []);
    q.reduce(function (p, it) {
      return p.then(function () {
        return call('pub.submit', it.payload).then(function (r) {
          if (!r.success && (r.code === 'NET' || r.code === 'BUSY')) { var n = lsGet(LS.pending, []); n.push(it); lsSet(LS.pending, n); }
        });
      });
    }, Promise.resolve());
  }
  window.addEventListener('online', flushPending);

  /* ============================================================
     MODE DEMO — meniru backend memakai localStorage.
     Hanya untuk mencoba tampilan; data TIDAK dibagikan antar perangkat.
     ============================================================ */
  var Demo = (function () {
    var TPL = Content.CATALOG.map(function (c) { return [c.id, c.nama, c.engine, c.deskripsi, c.fase, c.mode, c.dmin, c.dmax, c.ikon, c.warna]; });
    function uid(p) { return p + '_' + Math.random().toString(36).slice(2, 12); }
    function iso() { return new Date().toISOString(); }
    function db() {
      var d = lsGet(LS.demo, null);
      if (d) return d;
      d = { guru: [{ id: 'g_demo', nama: 'Ibu Rahmawati, S.Pd', instansi: 'SDN Contoh 1', email: 'demo.guru@example.com', role: 'guru', aktif: true, tanggalDaftar: iso(), terakhirMasuk: iso() }],
        games: [], hasil: [], prompts: [], settings: { nama_app: 'EduGame AI', wa_nomor: '', wa_pesan: CFG.WA_PESAN || '', banner_aktif: '1', banner_teks: 'Permainan baru tersedia: Labirin Trivia & Susun Balok Logika', tautan_komunitas: '' },
        templat: TPL.map(function (t, i) { return { id: t[0], nama: t[1], engine: t[2], deskripsi: t[3], fase: t[4], mode: t[5], durasiMin: t[6], durasiMaks: t[7], ikon: t[8], warna: t[9], gambar: [], status: 'aktif', urutan: i + 1, aturan: {} }; }) };
      // contoh permainan agar demo tidak kosong
      var k = Content.konten('kuis', Content.contoh('kuis'));
      d.games.push({ id: 'p_demo1', kode: 'PLANT-402', email_guru: 'demo.guru@example.com', judul: 'Kuis Kilat: Bagian Tubuh Tumbuhan', jenjang: 'SD', fase: 'B', kelas: '4', mapel: 'IPAS', materi: 'Bagian tubuh tumbuhan dan fungsinya', asesmen: 'formatif', engine: 'kuis', templateId: 'TMPL-01', durasi: 15, mode: 'individu', tingkat: 'sedang', tujuan: Content.susunTP({ fase: 'B', materi: 'Bagian tubuh tumbuhan dan fungsinya', asesmen: 'formatif' }), unsurPd: '', tgl: iso(), status: 'aktif', konten: k });
      lsSet(LS.demo, d); return d;
    }
    function save(d) { lsSet(LS.demo, d); }
    function ok(data, message) { return { success: true, data: data === undefined ? null : data, message: message || '', demo: true }; }
    function fail(message, extra) { return Object.assign({ success: false, message: message }, extra || {}); }
    function ringan(g, d) {
      var hs = d.hasil.filter(function (h) { return h.id_permainan === g.id; });
      var o = Object.assign({}, g); delete o.konten; delete o.email_guru;
      o.siswa = hs.length; o.rata = hs.length ? Math.round(hs.reduce(function (a, h) { return a + h.skor; }, 0) / hs.length * 10) / 10 : 0;
      o.tuntas = hs.filter(function (h) { return h.skor >= 75; }).length; return o;
    }
    function kodeBaru(d, materi) {
      var dasar = String(materi || 'GAME').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'GAME';
      for (var i = 0; i < 30; i++) { var k = dasar + '-' + (100 + Math.floor(Math.random() * 900)); if (!d.games.some(function (g) { return g.kode === k; })) return k; }
      return dasar + '-' + Date.now().toString(36).toUpperCase().slice(-4);
    }
    function rankDemo(d, g, nama, kelas) {
      var best = {};
      d.hasil.filter(function (h) { return h.id_permainan === g.id; }).forEach(function (h) { var k = (h.nama + '|' + h.kelas).toLowerCase(), b = best[k]; if (!b || h.skor > b.skor || (h.skor === b.skor && h.durasi < b.durasi)) best[k] = h; });
      var list = Object.keys(best).map(function (k) { return best[k]; }).sort(function (a, b) { return (b.skor - a.skor) || (a.durasi - b.durasi) || String(a.tanggal).localeCompare(String(b.tanggal)); });
      var me = null, key = ((nama || '') + '|' + (kelas || '')).toLowerCase();
      list.forEach(function (h, i) { if ((h.nama + '|' + h.kelas).toLowerCase() === key) me = { rank: i + 1, nama: h.nama, kelas: h.kelas, skor: h.skor, durasi: h.durasi }; });
      return { total: list.length, top: list.slice(0, 50).map(function (h, i) { return { rank: i + 1, nama: h.nama, kelas: h.kelas, skor: h.skor, durasi: h.durasi }; }), me: me };
    }
    function milik(d, s) { return d.games.filter(function (g) { return g.email_guru === s.me.email && g.status !== 'dihapus'; }); }

    function handle(action, data, sesi) {
      var d = db(), pub = /^(pub\.|auth\.|ping)/.test(action);
      if (!pub && !sesi) return fail('Sesi berakhir. Silakan masuk lagi.', { code: 'AUTH' });
      var admin = sesi && sesi.me && sesi.me.role === 'admin';
      if (/^(admin\.|tpl\.|pengaturan\.|rahasia\.|import\.|system\.)/.test(action) && !admin) return fail('Akses ditolak untuk peran Anda.', { code: 'FORBIDDEN' });
      switch (action) {
        case 'ping': return ok({ app: 'EduGame AI (demo)' });
        case 'pub.boot': return ok({ templat: d.templat.filter(function (t) { return t.status === 'aktif'; }), pengaturan: d.settings,
          stats: { guru: d.guru.length, game: d.games.filter(function (g) { return g.status !== 'dihapus'; }).length, siswa: d.hasil.length } });
        case 'auth.config': return ok({ googleClientId: '' });
        case 'auth.google': return fail('Mode demo: gunakan tombol "Masuk Demo".');
        case 'auth.darurat': {
          var me = data.username === 'admin' ? { email: 'admin.demo@example.com', role: 'admin', nama: 'Admin Demo' } : { email: 'demo.guru@example.com', role: 'guru', nama: 'Ibu Rahmawati, S.Pd', instansi: 'SDN Contoh 1' };
          return ok({ token: 'demo-' + me.role, me: me });
        }
        case 'me': return ok(sesi.me);
        case 'pub.game': {
          var kode = String(data.kode || '').toUpperCase().replace(/[^A-Z0-9-]/g, '');
          var g = d.games.filter(function (x) { return x.kode === kode && x.status === 'aktif'; })[0];
          if (!g) return fail('Kode permainan tidak ditemukan atau sudah ditutup.', { code: 'NOT_FOUND' });
          var o = ringan(g, d); var kn = JSON.parse(JSON.stringify(g.konten)); o.guru = g.namaGuru || (d.guru.filter(function (x) { return x.email === g.email_guru; })[0] || {}).nama || '';
          if (g.asesmen === 'sumatif' && Content.bisaDisembunyi(g.engine)) { kn = Content.sembunyi(g.engine, kn); o.kunciTersembunyi = true; }
          o.konten = kn; delete o.siswa; delete o.rata; delete o.tuntas; return ok(o);
        }
        case 'pub.rank': {
          var gr = d.games.filter(function (x) { return x.kode === String(data.kode || '').toUpperCase() && x.status !== 'dihapus'; })[0];
          if (!gr) return fail('Permainan tidak ditemukan.', { code: 'NOT_FOUND' });
          var rr = rankDemo(d, gr, '', ''); var me2 = data.nama ? rankDemo(d, gr, data.nama, data.kelas).me : null;
          return ok({ total: rr.total, top: rr.top, me: me2, judul: gr.judul });
        }
        case 'pub.submit': {
          var gm = d.games.filter(function (x) { return x.kode === String(data.kode || '').toUpperCase() && x.status === 'aktif'; })[0];
          if (!gm) return fail('Permainan tidak ditemukan atau sudah ditutup guru.');
          var hasil = [];
          (data.peserta || []).slice(0, 8).forEach(function (p, idx) {
            var nama = String(p.nama || '').trim().slice(0, 60); if (!nama) return;
            var total, benar, skor;
            var ns = idx === 0 ? Content.nilai(gm.engine, gm.konten, data.jawaban || []) : null;
            if (ns) { total = ns.total; benar = ns.benar; skor = Math.round(benar / total * 100); } else { total = Math.max(1, Math.min(100, parseInt(p.total, 10) || 1)); benar = Math.max(0, Math.min(total, parseInt(p.benar, 10) || 0)); skor = Math.max(0, Math.min(100, Math.round(Number(p.skor) || 0))); }
            var row = { id: uid('h'), id_permainan: gm.id, kode: gm.kode, nama: nama, kelas: String(p.kelas || '').slice(0, 30), skor: skor, benar: benar, total: total, durasi: Math.max(0, Math.min(7200, parseInt(p.durasi, 10) || 0)), tanggal: iso(), detail: idx === 0 ? { j: (data.jawaban || []).map(function (j) { return [j.i, j.p]; }) } : { tim: true } };
            d.hasil.push(row); hasil.push({ nama: nama, skor: skor, benar: benar, total: total });
          });
          if (!hasil.length) return fail('Nama peserta wajib diisi.');
          save(d);
          var sk = hasil[0].skor;
          return ok({ hasil: hasil, rank: rankDemo(d, gm, hasil[0].nama, (data.peserta[0] || {}).kelas), umpan: sk >= 90 ? 'Luar biasa! Pemahamanmu sangat kuat.' : sk >= 75 ? 'Bagus sekali! Kamu sudah menguasai materi ini.' : sk >= 60 ? 'Cukup baik. Pelajari lagi bagian yang masih salah, ya.' : 'Jangan menyerah! Coba ulangi dan baca materinya sekali lagi.' }, 'Nilai tercatat.');
        }
        case 'guru.dashboard': {
          var mine = milik(d, sesi), ids = {}; mine.forEach(function (g) { ids[g.id] = 1; });
          var hs = d.hasil.filter(function (h) { return ids[h.id_permainan]; }), pk = {}, js = {};
          hs.forEach(function (h) { var k = h.kelas || '-'; (pk[k] = pk[k] || { n: 0, j: 0 }); pk[k].n++; pk[k].j += h.skor; });
          mine.forEach(function (g) { js[g.engine] = (js[g.engine] || 0) + 1; });
          var jum = hs.reduce(function (a, h) { return a + h.skor; }, 0);
          return ok({ totalGame: mine.length, aktifGame: mine.filter(function (g) { return g.status === 'aktif'; }).length, totalSiswa: hs.length, rataSkor: hs.length ? Math.round(jum / hs.length * 10) / 10 : 0,
            tuntasPersen: hs.length ? Math.round(hs.filter(function (h) { return h.skor >= 75; }).length / hs.length * 100) : 0,
            promptCount: d.prompts.filter(function (p) { return p.email === sesi.me.email; }).length,
            perKelas: Object.keys(pk).sort().map(function (k) { return { kelas: k, rata: Math.round(pk[k].j / pk[k].n * 10) / 10, n: pk[k].n }; }),
            jenis: Object.keys(js).map(function (k) { return { engine: k, n: js[k] }; }),
            terbaru: mine.slice().reverse().slice(0, 8).map(function (g) { return ringan(g, d); }) });
        }
        case 'guru.games': return ok(milik(d, sesi).slice().reverse().map(function (g) { return ringan(g, d); }));
        case 'game.create': {
          var m = data.meta || {}, kn;
          try { kn = Content.konten(m.engine, m.engine === 'html' ? { html: data.html } : data.konten); } catch (e) { return fail(e.message); }
          if (!String(m.judul || '').trim()) return fail('Judul permainan wajib diisi.');
          var rec = { id: uid('p'), kode: kodeBaru(d, m.materi), email_guru: sesi.me.email, judul: String(m.judul).slice(0, 140), jenjang: m.jenjang === 'SMP' ? 'SMP' : 'SD', fase: m.fase || '', kelas: String(m.kelas || ''),
            mapel: m.mapel || '', materi: m.materi || '', asesmen: m.asesmen === 'sumatif' ? 'sumatif' : 'formatif', engine: m.engine, templateId: m.templateId || '', durasi: Math.min(60, Math.max(5, Number(m.durasi) || 15)),
            mode: m.mode === 'kelompok' ? 'kelompok' : 'individu', tingkat: m.tingkat || 'sedang', tujuan: m.tujuan || '', unsurPd: m.unsurPd || '', tgl: iso(), status: 'aktif', sekolah: String(m.sekolah || ''), namaGuru: String(m.namaGuru || ''), bentuk: m.bentuk === 'narasi' ? 'narasi' : 'singkat', sumber: String(m.sumber || ''), konten: kn };
          d.games.push(rec); save(d); return ok({ id: rec.id, kode: rec.kode }, 'Permainan dibuat.');
        }
        case 'game.get': {
          var gg = d.games.filter(function (x) { return x.id === data.id && x.status !== 'dihapus'; })[0];
          if (!gg) return fail('Permainan tidak ditemukan.');
          return ok(Object.assign(ringan(gg, d), { konten: gg.konten }));
        }
        case 'game.update': {
          var gu = d.games.filter(function (x) { return x.id === data.id; })[0];
          if (!gu) return fail('Permainan tidak ditemukan.');
          if (data.status) gu.status = data.status;
          if (data.judul) gu.judul = String(data.judul).slice(0, 140);
          if (data.konten) { try { gu.konten = Content.konten(gu.engine, data.konten); } catch (e2) { return fail(e2.message); } }
          save(d); return ok(null, 'Perubahan disimpan.');
        }
        case 'game.hapus': {
          var gh = d.games.filter(function (x) { return x.id === data.id; })[0];
          if (!gh) return fail('Permainan tidak ditemukan.');
          gh.status = 'dihapus'; save(d); return ok(null, 'Permainan dihapus. Nilai siswa tetap tersimpan.');
        }
        case 'hasil.list': {
          var mg = milik(d, sesi), idm = {}; mg.forEach(function (g) { idm[g.id] = 1; });
          var rows = d.hasil.filter(function (h) { return data.gameId ? h.id_permainan === data.gameId && idm[h.id_permainan] : idm[h.id_permainan]; })
            .map(function (h) { return { id: h.id, idPermainan: h.id_permainan, kode: h.kode, nama: h.nama, kelas: h.kelas, skor: h.skor, benar: h.benar, total: h.total, durasi: h.durasi, tanggal: h.tanggal, detail: h.detail }; })
            .sort(function (a, b) { return b.tanggal.localeCompare(a.tanggal); });
          return ok({ rows: rows, games: mg.map(function (g) { return ringan(g, d); }) });
        }
        case 'prompt.simpan': d.prompts.push({ email: sesi.me.email, isi: String(data.isi || '').slice(0, 2000), opsi: data.opsi, tanggal: iso() }); save(d); return ok(null, 'Riwayat prompt tersimpan.');
        case 'ai.tes': return fail('Mode demo: tes koneksi AI memerlukan backend Apps Script.');
        case 'ai.generate': return fail('Pembuatan otomatis tidak tersedia di mode demo. Gunakan "Salin Prompt", atau pasang backend Apps Script lalu isi GEMINI_API_KEY.', { code: 'NO_AI' });
        case 'konten.validasi': {
          try { var raw = typeof data.konten === 'string' ? Content.parseAI(data.konten) : data.konten; return ok(Content.konten(data.engine, raw)); } catch (e3) { return fail(e3.message); }
        }
        case 'admin.overview': {
          var aktif = d.games.filter(function (g) { return g.status !== 'dihapus'; }), pk2 = {};
          aktif.forEach(function (g) { pk2[g.engine] = (pk2[g.engine] || 0) + 1; });
          return ok({ guru: d.guru.length, guruAktif: d.guru.filter(function (g) { return g.aktif; }).length, game: aktif.length, gameAktif: aktif.filter(function (g) { return g.status === 'aktif'; }).length, siswa: d.hasil.length,
            rataSkor: d.hasil.length ? Math.round(d.hasil.reduce(function (a, h) { return a + h.skor; }, 0) / d.hasil.length * 10) / 10 : 0, pakai: pk2, templat: d.templat });
        }
        case 'tpl.save': {
          if (Object.keys({ kuis: 1, tts: 1, kartu: 1, duel: 1, balok: 1, labirin: 1 }).indexOf(data.engine) < 0) return fail('Mesin permainan tidak valid.');
          if (!String(data.nama || '').trim()) return fail('Nama templat wajib diisi.');
          var ex = d.templat.filter(function (t) { return t.id === data.id; })[0];
          var nt = { id: ex ? ex.id : 'TMPL-' + ('0' + (d.templat.length + 1)).slice(-2), nama: data.nama, engine: data.engine, deskripsi: data.deskripsi || '', fase: data.fase || 'A,B,C,D', mode: data.mode || 'individu', durasiMin: data.durasiMin || 5, durasiMaks: data.durasiMaks || 30, ikon: data.ikon || 'timer', warna: data.warna || '#1E40AF',
            gambar: (data.gambar || []).filter(function (u) { return /^https:\/\//.test(u); }), status: data.status === 'arsip' ? 'arsip' : 'aktif', urutan: data.urutan || 99, aturan: data.aturan || {} };
          if (ex) Object.assign(ex, nt); else d.templat.push(nt);
          save(d); return ok(null, 'Templat tersimpan & dipublikasikan.');
        }
        case 'tpl.hapus': { var th = d.templat.filter(function (t) { return t.id === data.id; })[0]; if (th) th.status = 'arsip'; save(d); return ok(null, 'Templat diarsipkan (tidak dihapus permanen).'); }
        case 'admin.guru': return ok(d.guru.map(function (g) { return Object.assign({}, g, { game: d.games.filter(function (x) { return x.email_guru === g.email && x.status !== 'dihapus'; }).length }); }));
        case 'admin.guruRole': { var gr = d.guru.filter(function (x) { return x.id === data.id; })[0]; if (gr) { if (data.role) gr.role = data.role; if (data.aktif !== undefined) gr.aktif = !!data.aktif; save(d); } return ok(null, 'Pengguna diperbarui.'); }
        case 'pengaturan.simpan': Object.keys(data.nilai || {}).forEach(function (k) { d.settings[k] = String(data.nilai[k]); }); save(d); return ok(null, 'Pengaturan disimpan.');
        case 'rahasia.status': return ok({ GEMINI_API_KEY: { ada: false, samar: '' }, GOOGLE_CLIENT_ID: { ada: false, samar: '' }, GEMINI_MODEL: { ada: false, samar: '' }, akses_darurat: { ada: true } });
        case 'rahasia.simpan': return fail('Mode demo: rahasia hanya bisa disimpan di backend Apps Script (Script Properties).');
        case 'import.run': return fail('Mode demo: modul migrasi memerlukan backend Apps Script.');
        case 'system.status': return ok({ versi: 'demo', sheets: [], selTerisi: 0, batasSel: 10000000, spreadsheetUrl: '', spreadsheetNama: 'Mode demo (localStorage)', trigger: 0, keepWarm: false, warmTerakhir: null, aiAktif: false, loginGoogleAktif: false });
        case 'batch': return ok((data.calls || []).map(function (c) { return handle(c.action, c.data || {}, sesi); }));
        default: return fail('Aksi tidak dikenal.');
      }
    }
    return { handle: handle, reset: function () { lsDel(LS.demo); } };
  })();

  window.Api = { LIVE: LIVE, call: call, boot: boot, bootCached: bootCached, warmUp: warmUp, kirimHasil: kirimHasil, flushPending: flushPending, Sesi: Sesi, Perf: Perf, Demo: Demo, lsGet: lsGet, lsSet: lsSet };
  window.Perf = Perf;
})();
