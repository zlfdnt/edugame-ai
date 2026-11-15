/* ============================================================
   htmlgame.js — menjalankan game HTML buatan AI dengan aman
   • iframe sandbox="allow-scripts" (tanpa akses ke halaman ini, penyimpanan, atau navigasi)
   • CSP di dalam dokumen: tanpa jaringan, tanpa pustaka/gambar/font luar
   • Jembatan postMessage: init (nama siswa) → finish (skor) → rank (peringkat)
   • Rank: papan peringkat dipakai bersama oleh semua jenis game
   ============================================================ */
(function () {
  'use strict';
  var esc = UI.esc, ic = UI.ic, $ = UI.$;
  var CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; media-src data: blob:; font-src data:; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'";

  /* ---------- papan peringkat ---------- */
  var MEDAL = ['🥇', '🥈', '🥉'];
  function rankHtml(data, me) {
    if (!data) return '';
    var rows = data.top || [], meTop = false;
    var li = rows.map(function (r) {
      var saya = me && r.nama === me.nama && r.kelas === me.kelas; if (saya) meTop = true;
      return '<li class="' + (saya ? 'me' : '') + '"><b class="rnk-n">' + (r.rank <= 3 ? MEDAL[r.rank - 1] : r.rank) + '</b><span class="rnk-nm">' + esc(r.nama) + (r.kelas ? ' <small>' + esc(r.kelas) + '</small>' : '') + '</span><span class="rnk-sk">' + r.skor + '</span><small class="rnk-wk">' + UI.fmtDur(r.durasi) + '</small></li>';
    }).join('');
    var luar = me && !meTop ? '<li class="me gap"><b class="rnk-n">' + me.rank + '</b><span class="rnk-nm">' + esc(me.nama) + (me.kelas ? ' <small>' + esc(me.kelas) + '</small>' : '') + '</span><span class="rnk-sk">' + me.skor + '</span><small class="rnk-wk">' + UI.fmtDur(me.durasi) + '</small></li>' : '';
    return '<div class="rank"><div class="rank-h"><h3>🏆 Papan Peringkat</h3><span class="pill">' + data.total + ' siswa</span></div><p class="muted">Skor terbaik setiap siswa pada kode permainan yang sama. Skor sama → yang lebih cepat di atas.</p>' + (li ? '<ol>' + li + luar + '</ol>' : '<p class="muted center">Belum ada hasil. Jadilah yang pertama!</p>') + '</div>';
  }
  function rankModal(kode, me) {
    var m = UI.modal({ title: 'Papan Peringkat', body: App.loading('Memuat peringkat…'), actions: [{ label: 'Tutup', cls: 'btn-outline', onClick: function (c) { c(); } }] });
    Api.call('pub.rank', { kode: kode, nama: me && me.nama || '', kelas: me && me.kelas || '' }).then(function (r) {
      m.body.innerHTML = r.success ? rankHtml(r.data, r.data.me || me) : '<div class="note note-err">' + esc(r.message) + '</div>';
    });
    return m;
  }

  /* ---------- tuan rumah game HTML ---------- */
  function bangun(html) {
    html = String(html || '').replace(/^\uFEFF/, '');
    var meta = '<meta http-equiv="Content-Security-Policy" content="' + CSP + '">';
    if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, function (m) { return m + meta; });
    if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, function (m) { return m + '<head>' + meta + '</head>'; });
    return '<!doctype html><html><head><meta charset="utf-8">' + meta + '<meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + html + '</body></html>';
  }
  function bersihkanKode(teks) {            // ambil blok ```html bila tertempel utuh dari chat AI
    var s = String(teks || '').trim(), f = s.match(/```(?:html|HTML)?\s*\n([\s\S]*?)```/);
    if (f) s = f[1].trim();
    var a = s.search(/<!doctype html|<html[\s>]/i); if (a > 0) s = s.slice(a);
    var z = s.toLowerCase().lastIndexOf('</html>'); if (z > -1) s = s.slice(0, z + 7);
    return s;
  }
  function periksa(html) {
    var h = String(html || ''), info = { ok: true, msg: [], warn: [] };
    if (h.length < 300) { info.ok = false; info.msg.push('Kode terlalu pendek untuk sebuah game.'); }
    if (h.length > 350000) { info.ok = false; info.msg.push('Kode terlalu besar (maksimal ±350.000 karakter).'); }
    if (!/<(html|body|script|canvas|div)/i.test(h)) { info.ok = false; info.msg.push('Isi tidak terlihat seperti berkas HTML. Salin dari <!DOCTYPE html> sampai </html>.'); }
    if (!/EduGame\.finish\s*\(/.test(h)) info.warn.push('Game belum memanggil EduGame.finish(...) — nilai siswa TIDAK akan tercatat. Minta AI: "Tambahkan pemanggilan EduGame.finish di akhir permainan."');
    if (!/EduGame\.onRank\s*\(/.test(h)) info.warn.push('Belum ada panel peringkat (EduGame.onRank). Peringkat tetap tampil lewat tombol 🏆 dari aplikasi.');
    if (/https?:\/\/[^"'\s)]+\.(js|css|png|jpg|jpeg|gif|woff2?)/i.test(h) || /<script[^>]+src=|<link[^>]+href=["']https?:/i.test(h)) info.warn.push('Terdeteksi sumber luar (pustaka/gambar/font). Itu diblokir di kotak aman, sehingga tampilan bisa rusak. Minta AI membuat versi mandiri tanpa sumber luar.');
    if (/\b(fetch|XMLHttpRequest|WebSocket)\s*\(/.test(h)) info.warn.push('Terdeteksi permintaan jaringan; diblokir di kotak aman.');
    return info;
  }

  function mount(root, game, player, opt) {
    opt = opt || {};
    var dead = false, kirim = false, t0 = Date.now(), terakhir = 0, rankData = null, frame;
    var sek = game.sekolah ? '<span>🏫 ' + esc(game.sekolah) + '</span>' : '', gur = game.guru ? '<span>👩‍🏫 ' + esc(game.guru) + '</span>' : '';
    root.innerHTML = '<div class="hg"><div class="hg-bar"><div class="hg-id"><b>' + esc(game.judul) + '</b><small>' + sek + gur + '<span>' + esc(player.avatar || '🙂') + ' ' + esc(player.nama) + '</span></small></div><div class="hg-act"><button type="button" class="btn btn-soft btn-sm" data-rank>' + ic('trophy', 16) + ' Peringkat</button><button type="button" class="btn btn-soft btn-sm" data-fs aria-label="Layar penuh">⛶</button><button type="button" class="btn btn-outline btn-sm" data-keluar>' + ic('back', 16) + ' Keluar</button></div></div>' +
      '<iframe class="hframe" sandbox="allow-scripts" title="' + esc(game.judul) + '" referrerpolicy="no-referrer"></iframe><div class="hg-res" id="hgres" hidden></div></div>';
    frame = $('iframe', root); frame.srcdoc = bangun(game.konten.html);
    function post(m) { try { frame.contentWindow.postMessage(m, '*'); } catch (e) { /* abaikan */ } }
    function init() { post({ edugame: 1, type: 'init', info: { nama: player.nama, kelas: player.kelas, avatar: player.avatar || '🙂', kode: game.kode, sekolah: game.sekolah || '', guru: game.guru || '', judul: game.judul } }); }
    frame.addEventListener('load', init);
    function contoh() { var n = ['Aisyah', 'Rafi', 'Nadia', 'Bima', 'Citra']; return { total: 6, top: n.map(function (x, i) { return { rank: i + 1, nama: x, kelas: player.kelas, skor: 98 - i * 7, durasi: 80 + i * 10 }; }) }; }
    function tampilHasil(skor, benar, total, resp) {
      var el = $('#hgres', root); el.hidden = false;
      var rk = resp && resp.rank ? resp.rank : null, me = rk && rk.me;
      el.innerHTML = '<div class="hg-ok"><b>' + (resp === 'preview' ? '🧪 Uji coba' : resp && resp.success === false ? '⚠️ Nilai belum terkirim' : '✅ Nilai tersimpan') + '</b> • Skor <b>' + skor + '</b> (' + benar + '/' + total + ')' + (me ? ' • Peringkat <b>#' + me.rank + '</b> dari ' + rk.total : '') + '<span class="hg-b"><button type="button" class="btn btn-primary btn-sm" data-rank>' + ic('trophy', 16) + ' Lihat Peringkat</button><button type="button" class="btn btn-accent btn-sm" data-ulang>' + ic('refresh', 16) + ' Main Lagi</button></span></div>';
    }
    function onMsg(e) {
      if (dead || e.source !== frame.contentWindow) return; var d = e.data || {}; if (!d.edugame) return;
      if (d.type === 'ready') init();
      if (d.type === 'finish') {
        if (kirim || Date.now() - terakhir < 2500) return; kirim = true; terakhir = Date.now();
        var skor = Math.max(0, Math.min(100, Math.round(+d.skor || 0))), total = Math.max(1, Math.round(+d.total || 1)), benar = Math.max(0, Math.min(total, Math.round(+d.benar || 0))), dur = Math.round((Date.now() - t0) / 1000);
        tampilHasil(skor, benar, total, null); $('#hgres .hg-ok', root).insertAdjacentHTML('afterbegin', '<span class="spin sm"></span> ');
        if (opt.preview) { var r0 = contoh(); post({ edugame: 1, type: 'rank', rows: r0.top, me: { rank: 6, nama: player.nama, kelas: player.kelas, skor: skor } }); tampilHasil(skor, benar, total, 'preview'); return; }
        Promise.resolve(opt.submit({ nama: player.nama, kelas: player.kelas, avatar: player.avatar, skor: skor, benar: benar, total: total, durasi: dur })).then(function (r) {
          if (r && r.success && r.data && r.data.rank) { rankData = r.data.rank; post({ edugame: 1, type: 'rank', rows: rankData.top, me: rankData.me }); tampilHasil(skor, benar, total, r.data); }
          else if (r && r.queued) tampilHasil(skor, benar, total, { success: false });
          else if (r && r.success) { tampilHasil(skor, benar, total, r.data); fetchRank(); }
          else tampilHasil(skor, benar, total, { success: false });
        });
      }
    }
    function fetchRank() { Api.call('pub.rank', { kode: game.kode, nama: player.nama, kelas: player.kelas }).then(function (r) { if (r.success) { rankData = r.data; post({ edugame: 1, type: 'rank', rows: r.data.top, me: r.data.me }); } }); }
    window.addEventListener('message', onMsg);
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-rank')) { if (opt.preview) UI.modal({ title: 'Papan Peringkat (contoh)', body: rankHtml(contoh(), { rank: 6, nama: player.nama, kelas: player.kelas, skor: 0, durasi: 0 }) }); else rankModal(game.kode, { nama: player.nama, kelas: player.kelas }); }
      else if (b.hasAttribute('data-fs')) { var el = $('.hg', root); if (el.requestFullscreen) el.requestFullscreen().catch(function () { }); }
      else if (b.hasAttribute('data-ulang')) { kirim = false; t0 = Date.now(); $('#hgres', root).hidden = true; frame.srcdoc = bangun(game.konten.html); }
      else if (b.hasAttribute('data-keluar')) { UI.confirm('Keluar dari permainan?', 'Keluar', true).then(function (y) { if (y && opt.onQuit) opt.onQuit(); }); }
    });
    return { destroy: function () { dead = true; window.removeEventListener('message', onMsg); } };
  }

  window.HtmlGame = { mount: mount, bangun: bangun, periksa: periksa, bersihkanKode: bersihkanKode };
  window.Rank = { html: rankHtml, modal: rankModal };
})();
