/* ============================================================
   ui.js — helper tampilan: escape, toast, modal, rotator (slideshow),
   efek interaktif (kilau, spotlight, tilt, ripple, reveal, count-up),
   confetti, pemuat pustaka CDN, ekspor Excel/PDF/CSV, QR.
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cleanups = [];

  function esc(s) { return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function ic(n, s, x) { return Art.icon(n, s, x); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtDur(sec) { sec = Math.max(0, Math.round(sec || 0)); return pad(Math.floor(sec / 60)) + ':' + pad(sec % 60); }
  function fmtTgl(iso) { try { return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } }
  function fmtJam(iso) { try { return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }
  function fmtNum(n) { return Number(n || 0).toLocaleString('id-ID'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }

  /* ---------- toast ---------- */
  function toast(msg, type, ms) {
    var host = $('#toasts');
    if (!host) { host = el('<div id="toasts" role="status" aria-live="polite"></div>'); document.body.appendChild(host); }
    var t = el('<div class="toast toast-' + (type || 'ok') + '">' + ic(type === 'err' ? 'x' : type === 'warn' ? 'bell' : 'checkc', 20) + '<span>' + esc(msg) + '</span></div>');
    host.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('in'); });
    setTimeout(function () { t.classList.remove('in'); setTimeout(function () { t.remove(); }, 300); }, ms || 3800);
  }

  /* ---------- modal ---------- */
  function modal(o) {
    var wrap = el('<div class="modal-wrap" role="dialog" aria-modal="true"><div class="modal ' + (o.wide ? 'modal-wide' : '') + '"><div class="modal-head"><h3>' + esc(o.title || '') + '</h3><button class="icon-btn" data-x aria-label="Tutup">' + ic('x', 20) + '</button></div><div class="modal-body"></div><div class="modal-foot"></div></div></div>');
    var body = $('.modal-body', wrap), foot = $('.modal-foot', wrap);
    if (typeof o.body === 'string') body.innerHTML = o.body; else if (o.body) body.appendChild(o.body);
    function close() { wrap.classList.remove('in'); setTimeout(function () { wrap.remove(); }, 200); document.removeEventListener('keydown', onKey); if (o.onClose) o.onClose(); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    (o.actions || []).forEach(function (a) {
      var b = el('<button class="btn ' + (a.cls || 'btn-outline') + '">' + esc(a.label) + '</button>');
      b.addEventListener('click', function () { var r = a.onClick ? a.onClick(close, wrap) : close(); if (r !== false && !a.keep) { /* a.onClick bertanggung jawab menutup bila perlu */ } });
      foot.appendChild(b);
    });
    if (!(o.actions || []).length) foot.remove();
    $('[data-x]', wrap).addEventListener('click', close);
    wrap.addEventListener('mousedown', function (e) { if (e.target === wrap) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add('in'); });
    bind(wrap);
    return { close: close, el: wrap, body: body };
  }
  function confirmBox(msg, label, danger) {
    return new Promise(function (res) {
      var m = modal({ title: 'Konfirmasi', body: '<p style="margin:0">' + esc(msg) + '</p>', actions: [
        { label: 'Batal', cls: 'btn-outline', onClick: function (c) { c(); res(false); } },
        { label: label || 'Ya, lanjutkan', cls: danger ? 'btn-danger' : 'btn-primary', onClick: function (c) { c(); res(true); } }], onClose: function () { res(false); } });
      return m;
    });
  }

  /* ---------- rotator (slideshow otomatis) ---------- */
  function rotator(root, opt) {
    opt = opt || {};
    var slides = $$(opt.slideSel || '.slide', root), idx = 0, timer = null, paused = false, visible = true, dotsEl = opt.dots ? $(opt.dots, root) : null;
    if (slides.length < 2) { if (slides[0]) slides[0].classList.add('is-active'); return { destroy: function () {}, go: function () {} }; }
    var dots = [];
    if (dotsEl) {
      dotsEl.innerHTML = slides.map(function (s, i) { return '<button type="button" aria-label="Slide ' + (i + 1) + '"></button>'; }).join('');
      dots = $$('button', dotsEl);
      dots.forEach(function (b, i) { b.addEventListener('click', function () { go(i, true); }); });
    }
    function go(i, manual) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === idx); s.setAttribute('aria-hidden', k === idx ? 'false' : 'true'); });
      dots.forEach(function (b, k) { b.classList.toggle('on', k === idx); b.setAttribute('aria-current', k === idx ? 'true' : 'false'); });
      if (manual) restart();
    }
    function tick() { if (!paused && visible && !document.hidden) go(idx + 1); }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(tick, opt.ms || 4000); }
    var pe = opt.pauseEl || root;
    pe.addEventListener('mouseenter', function () { paused = true; });
    pe.addEventListener('mouseleave', function () { paused = false; });
    pe.addEventListener('focusin', function () { paused = true; });
    pe.addEventListener('focusout', function () { paused = false; });
    var io = null;
    if ('IntersectionObserver' in window) { io = new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.2 }); io.observe(root); }
    go(opt.start || 0);
    setTimeout(restart, opt.delay || 0);                  // jeda awal acak agar kartu tidak berganti bersamaan
    var c = { go: go, destroy: function () { clearInterval(timer); if (io) io.disconnect(); } };
    cleanups.push(c.destroy);
    return c;
  }
  function cleanup() { cleanups.forEach(function (f) { try { f(); } catch (e) { /* abaikan */ } }); cleanups = []; }

  /* ---------- efek interaktif ---------- */
  var io = null, cntIo = null;
  function bind(root) {
    root = root || document;
    $$('.shine,.card-fx', root).forEach(function (n) {
      if (n._fx) return; n._fx = 1;
      n.addEventListener('pointermove', function (e) { var r = n.getBoundingClientRect(); n.style.setProperty('--mx', (e.clientX - r.left) + 'px'); n.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    });
    if (!reduce) $$('.tilt', root).forEach(function (n) {
      if (n._tilt) return; n._tilt = 1;
      n.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; var r = n.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; n.style.transform = 'perspective(800px) rotateX(' + (-y * 5) + 'deg) rotateY(' + (x * 6) + 'deg) translateY(-3px)'; });
      n.addEventListener('pointerleave', function () { n.style.transform = ''; });
    });
    $$('.btn,.ripple', root).forEach(function (b) {
      if (b._rp) return; b._rp = 1;
      b.addEventListener('pointerdown', function (e) {
        var r = b.getBoundingClientRect(), s = document.createElement('span'), d = Math.max(r.width, r.height) * 2;
        s.className = 'rip'; s.style.width = s.style.height = d + 'px'; s.style.left = (e.clientX - r.left - d / 2) + 'px'; s.style.top = (e.clientY - r.top - d / 2) + 'px';
        b.appendChild(s); setTimeout(function () { s.remove(); }, 650);
      });
    });
    if ('IntersectionObserver' in window) {
      if (!io) io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { threshold: 0.12 });
      $$('[data-reveal]:not(.in)', root).forEach(function (n) { io.observe(n); });
      if (!cntIo) cntIo = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { countUp(x.target); cntIo.unobserve(x.target); } }); }, { threshold: 0.4 });
      $$('[data-count]', root).forEach(function (n) { if (!n._cnt) { n._cnt = 1; cntIo.observe(n); } });
    } else { $$('[data-reveal]', root).forEach(function (n) { n.classList.add('in'); }); $$('[data-count]', root).forEach(countUp); }
  }
  function countUp(n) {
    var to = Number(n.getAttribute('data-count')) || 0, dec = Number(n.getAttribute('data-dec')) || 0, suf = n.getAttribute('data-suf') || '', t0 = performance.now(), dur = reduce ? 1 : 1100;
    function f(t) { var p = Math.min(1, (t - t0) / dur), v = to * (1 - Math.pow(1 - p, 3)); n.textContent = (dec ? v.toFixed(dec).replace('.', ',') : fmtNum(Math.round(v))) + suf; if (p < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }

  /* ---------- confetti ---------- */
  function confetti() {
    if (reduce) return;
    var c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
    var x = c.getContext('2d'), W = c.width = innerWidth, H = c.height = innerHeight, cols = ['#FACC15', '#7C3AED', '#1E40AF', '#16A34A', '#F472B6', '#38BDF8'];
    var ps = []; for (var i = 0; i < 140; i++) ps.push({ x: W / 2 + (Math.random() - 0.5) * 120, y: H * 0.35, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 13 - 3, s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[i % cols.length] });
    var n = 0;
    (function f() { x.clearRect(0, 0, W, H); ps.forEach(function (p) { p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx *= 0.99; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.6); x.restore(); });
      if (++n < 150) requestAnimationFrame(f); else c.remove(); })();
  }

  /* ---------- pemuat pustaka CDN (lazy, disematkan versi) ---------- */
  var loaded = {};
  function loadScript(url) {
    if (loaded[url]) return loaded[url];
    loaded[url] = new Promise(function (res, rej) { var s = document.createElement('script'); s.src = url; s.onload = res; s.onerror = function () { delete loaded[url]; rej(new Error('Gagal memuat pustaka: ' + url)); }; document.head.appendChild(s); });
    return loaded[url];
  }
  var CDN = { xlsx: 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', jspdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    autotable: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js', qr: 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js' };

  function unduh(blob, nama) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nama; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function csv(head, rows) { var q = function (v) { return '"' + String(v === undefined || v === null ? '' : v).replace(/"/g, '""') + '"'; }; return '\ufeff' + [head].concat(rows).map(function (r) { return r.map(q).join(','); }).join('\r\n'); }
  function exportXlsx(head, rows, nama, sheet) {
    return loadScript(CDN.xlsx).then(function () {
      var wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet([head].concat(rows));
      ws['!cols'] = head.map(function (h, i) { return { wch: Math.max(String(h).length, 12) + (i === 0 ? 10 : 0) }; });
      XLSX.utils.book_append_sheet(wb, ws, (sheet || 'Rekap').slice(0, 30)); XLSX.writeFile(wb, nama + '.xlsx');
    }).catch(function () { unduh(new Blob([csv(head, rows)], { type: 'text/csv;charset=utf-8' }), nama + '.csv'); toast('Pustaka Excel tidak termuat — berkas diunduh sebagai CSV (bisa dibuka di Excel).', 'warn', 5200); });
  }
  function exportPdf(judul, head, rows, nama) {
    return loadScript(CDN.jspdf).then(function () { return loadScript(CDN.autotable); }).then(function () {
      var J = window.jspdf.jsPDF, doc = new J({ orientation: 'landscape' });
      doc.setFontSize(14); doc.text(judul, 14, 16); doc.setFontSize(9); doc.text('Dibuat ' + new Date().toLocaleString('id-ID'), 14, 22);
      doc.autoTable({ head: [head], body: rows, startY: 27, styles: { fontSize: 8 }, headStyles: { fillColor: [30, 64, 175] } });
      doc.save(nama + '.pdf');
    }).catch(function () { toast('Pustaka PDF tidak termuat. Coba lagi saat online, atau gunakan unduhan Excel.', 'err', 5200); });
  }
  function qr(node, text, size) {
    node.innerHTML = '';
    return loadScript(CDN.qr).then(function () { new QRCode(node, { text: text, width: size || 160, height: size || 160, correctLevel: QRCode.CorrectLevel.M }); })
      .catch(function () { node.innerHTML = '<div class="qr-fallback">QR tidak termuat.<br>Gunakan kode / tautan.</div>'; });
  }
  function salin(text) {
    function fb() { var t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) { /* abaikan */ } t.remove(); return ok; }
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fb(); });
    return Promise.resolve(fb());
  }

  window.UI = { esc: esc, $: $, $$: $$, el: el, ic: ic, fmtDur: fmtDur, fmtTgl: fmtTgl, fmtJam: fmtJam, fmtNum: fmtNum, shuffle: shuffle, debounce: debounce, toast: toast, modal: modal, confirm: confirmBox,
    rotator: rotator, cleanup: cleanup, onCleanup: function (f) { cleanups.push(f); }, bind: bind, countUp: countUp, confetti: confetti, loadScript: loadScript, unduh: unduh, csv: csv, exportXlsx: exportXlsx, exportPdf: exportPdf, qr: qr, salin: salin, reduce: reduce };
})();
