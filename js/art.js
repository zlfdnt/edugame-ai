/* ============================================================
   art.js — ilustrasi SVG buatan sendiri (tanpa gambar eksternal)
   + set ikon garis 24×24. Gambar kartu/hero dapat diganti URL
   https:// kustom dari Admin > Templat (kolom gambar).
   ============================================================ */
(function () {
  'use strict';

  var ICON = {
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6M12 2v3"/>',
    grid: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    cards: '<rect x="3" y="5" width="11" height="15" rx="2"/><path d="M17 8l3.5 1.2-3.8 10.6M7 10v5"/>',
    swords: '<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M14.5 6.5L18 3h3v3l-3.5 3.5M5 14l4 4M7 17l-3 3M3 19l2 2"/>',
    blocks: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><path d="M17 13v8M13 17h8"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    checkc: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/>',
    home: '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
    gamepad: '<path d="M6 11h4M8 9v4M15 12h.01M18 10h.01"/><path d="M17.3 5H6.7a4 4 0 00-3.9 3.2l-1.5 7.4A2.5 2.5 0 005.9 17l1.6-2h9l1.6 2a2.5 2.5 0 004.6-1.4l-1.5-7.4A4 4 0 0017.3 5z"/>',
    plusc: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    clip: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 14l2 2 4-4"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1.1-1.5 2.2M12 17h.01"/>',
    bell: '<path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15zM10 21h4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3A4 4 0 0011 18.7l1-1"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5.5 3.5-5.5 3.5z"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
    sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    trophy: '<path d="M8 4h8v6a4 4 0 01-8 0zM8 6H4v1a4 4 0 004 4M16 6h4v1a4 4 0 01-4 4M12 14v4M8 21h8M10 18h4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M18 14.5a6.5 6.5 0 013.5 5.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
    database: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6M4 11.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
    logout: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    wa: '<path d="M3 21l1.7-5A9 9 0 118 19.3z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-2-1-.9.7a4 4 0 01-1.9-1.9l.7-.9-1-2z"/>',
    sound: '<path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>',
    refresh: '<path d="M20 11a8 8 0 00-14.5-3M4 5v4h4M4 13a8 8 0 0014.5 3M20 19v-4h-4"/>',
    fire: '<path d="M12 22c4 0 7-2.8 7-6.6 0-3-2-4.9-3.5-6.9-.6 1.5-1.5 2.4-2.5 2.9.3-3.4-1-6.4-4-8.4.2 3.5-3.5 5.6-3.5 11 0 4.3 2.5 8 6.5 8z"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',
    file: '<path d="M6 3h8l5 5v13H6zM14 3v5h5"/>',
    heart: '<path d="M12 20s-8-4.7-8-10.3A4.5 4.5 0 0112 7a4.5 4.5 0 018 2.7C20 15.3 12 20 12 20z"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    balloon: '<path d="M12 3a6 6 0 016 6c0 4-3 7-6 8-3-1-6-4-6-8a6 6 0 016-6zM12 17v2l-1.5 2M12 19l1.5 2"/>',
    hammer: '<path d="M13 4l7 7-3 3-7-7zM11 9L3 17l4 4 8-8"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8c-2-4-6-3-5 0 .5 1.5 3 1 5 0zM12 8c2-4 6-3 5 0-.5 1.5-3 1-5 0z"/>',
    plane: '<path d="M2 12l20-8-8 20-3-8z"/>',
    sprout: '<path d="M12 21v-9M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 14c0-3 2-5 6-5 0 3-2 5-6 5z"/>',
    rocket: '<path d="M12 3c4 2 6 6 5 11l-3 2h-4l-3-2c-1-5 1-9 5-11zM9 18l-3 3M15 18l3 3M12 9h.01"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>'
  };

  function icon(name, size, extra) {
    var p = ICON[name] || ICON.help;
    return '<svg class="ic ' + (extra || '') + '" width="' + (size || 20) + '" height="' + (size || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }

  /* ---------- ilustrasi ---------- */
  var PAL = [
    ['#1E40AF', '#7C3AED', '#FACC15'],
    ['#0E7490', '#2563EB', '#FDE047'],
    ['#6D28D9', '#DB2777', '#FACC15']
  ];
  function uri(svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }
  function wrap(w, h, c, inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient>' +
      '<radialGradient id="r" cx=".8" cy=".1" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#g)"/><rect width="' + w + '" height="' + h + '" fill="url(#r)"/>' + inner + '</svg>';
  }
  function dots(c, v) {
    var s = '';
    for (var i = 0; i < 7; i++) {
      var x = (37 * (i + 1) * (v + 2)) % 340 + 20, y = (53 * (i + 2) * (v + 1)) % 150 + 15, r = 4 + (i * 3 + v) % 9;
      s += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" opacity="' + (0.08 + (i % 3) * 0.05) + '"/>';
    }
    return s;
  }
  var SCENES = {
    kuis: function (c, v) {
      var t = ['A', 'B', 'C', 'D'], s = '', y = 34;
      for (var i = 0; i < 4; i++) {
        var on = (i + v) % 4 === 1;
        s += '<g transform="translate(' + (150 + (i % 2) * 108) + ' ' + (y + Math.floor(i / 2) * 50) + ')"><rect width="98" height="40" rx="10" fill="' + (on ? c[2] : '#fff') + '" opacity="' + (on ? 1 : .92) + '"/><circle cx="20" cy="20" r="11" fill="' + c[0] + '"/><text x="20" y="25" font-size="13" font-weight="800" text-anchor="middle" fill="#fff" font-family="Outfit,Arial">' + t[i] + '</text><rect x="38" y="15" width="48" height="10" rx="5" fill="' + c[0] + '" opacity=".25"/></g>';
      }
      return dots(c, v) + '<g transform="translate(36 40) rotate(' + (v * 6 - 6) + ' 50 50)"><circle cx="50" cy="56" r="42" fill="#fff"/><circle cx="50" cy="56" r="34" fill="none" stroke="' + c[0] + '" stroke-width="6" stroke-dasharray="' + (150 + v * 25) + ' 300" transform="rotate(-90 50 56)"/><path d="M50 56V36M50 56l14 8" stroke="' + c[1] + '" stroke-width="6" stroke-linecap="round"/><rect x="40" y="6" width="20" height="9" rx="3" fill="' + c[2] + '"/></g>' + s;
    },
    tts: function (c, v) {
      var s = '', L = 'ENERGI'.split('');
      for (var i = 0; i < 6; i++) s += '<g transform="translate(' + (60 + i * 36) + ' ' + (50 + v * 8) + ')"><rect width="32" height="32" rx="6" fill="#fff"/><text x="16" y="23" font-size="18" font-weight="800" text-anchor="middle" fill="' + c[0] + '" font-family="Outfit,Arial">' + L[i] + '</text></g>';
      for (var j = 1; j < 4; j++) s += '<g transform="translate(' + (96 + (j % 2) * 72) + ' ' + (50 + v * 8 + j * 36) + ')"><rect width="32" height="32" rx="6" fill="' + (j === 2 ? c[2] : '#fff') + '" opacity=".95"/></g>';
      return dots(c, v) + s;
    },
    kartu: function (c, v) {
      var E = ['🌱', '🌍', '⭐', '🔬', '🧩', '📚'], s = '';
      for (var i = 0; i < 3; i++) s += '<g transform="translate(' + (50 + i * 100) + ' ' + (40 + (i % 2) * 22) + ') rotate(' + ((i - 1) * 7 + v * 3) + ' 40 55)"><rect width="82" height="108" rx="12" fill="' + (i === 1 ? c[2] : '#fff') + '"/><text x="41" y="68" font-size="38" text-anchor="middle">' + E[(i + v * 2) % 6] + '</text></g>';
      return dots(c, v) + s;
    },
    duel: function (c, v) {
      return dots(c, v) + '<g transform="translate(46 56)"><circle cx="52" cy="52" r="48" fill="#fff"/><circle cx="52" cy="52" r="34" fill="#DC2626"/><circle cx="52" cy="46" r="34" fill="#EF4444"/></g><g transform="translate(240 56)"><circle cx="52" cy="52" r="48" fill="#fff"/><circle cx="52" cy="52" r="34" fill="#2563EB"/><circle cx="52" cy="46" r="34" fill="#3B82F6"/></g><circle cx="190" cy="100" r="26" fill="' + c[2] + '"/><text x="190" y="108" font-size="22" font-weight="800" text-anchor="middle" fill="#0F172A" font-family="Outfit,Arial">VS</text><rect x="70" y="' + (22 + v * 4) + '" width="' + (100 + v * 20) + '" height="10" rx="5" fill="#fff" opacity=".8"/>';
    },
    balok: function (c, v) {
      var s = '', cols = ['#fff', c[2], '#fff', '#fff'];
      for (var i = 0; i < 4; i++) s += '<g transform="translate(' + (70 + i * 62 + (v * 6)) + ' ' + (150 - i * 30) + ')"><rect width="110" height="26" rx="8" fill="' + cols[i] + '" opacity=".95"/><circle cx="16" cy="13" r="8" fill="' + c[0] + '"/><text x="16" y="17" font-size="11" font-weight="800" text-anchor="middle" fill="#fff" font-family="Outfit,Arial">' + (i + 1) + '</text></g>';
      return dots(c, v) + s;
    },
    labirin: function (c, v) {
      var path = 'M40 140 H120 V80 H200 V140 H280 V50 H350';
      return dots(c, v) + '<path d="M30 30 H370 M30 170 H370" stroke="#fff" stroke-width="3" opacity=".25"/><path d="' + path + '" fill="none" stroke="#fff" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/><path d="' + path + '" fill="none" stroke="' + c[0] + '" stroke-width="4" stroke-dasharray="2 12" stroke-linecap="round"/><circle cx="' + (40 + v * 80) + '" cy="' + (v === 0 ? 140 : v === 1 ? 80 : 140) + '" r="13" fill="' + c[2] + '" stroke="#0F172A" stroke-width="3"/><g transform="translate(336 28)"><path d="M14 2l3.5 7.2 7.9 1.1-5.7 5.5 1.4 7.8L14 19.8 6.9 23.6l1.4-7.8L2.6 10.3l7.9-1.1z" fill="' + c[2] + '"/></g>';
    },
    hero0: function (c) {
      return '<g transform="translate(60 90)"><rect width="280" height="170" rx="16" fill="#fff"/><rect x="16" y="16" width="120" height="14" rx="7" fill="' + c[0] + '"/><rect x="16" y="44" width="248" height="10" rx="5" fill="#E2E8F0"/><rect x="16" y="64" width="190" height="10" rx="5" fill="#E2E8F0"/><g transform="translate(16 90)"><rect width="72" height="56" rx="10" fill="' + c[0] + '" opacity=".14"/><rect x="82" width="72" height="56" rx="10" fill="' + c[1] + '" opacity=".18"/><rect x="164" width="84" height="56" rx="10" fill="' + c[2] + '" opacity=".55"/></g></g><g transform="translate(300 40)"><circle r="34" fill="' + c[2] + '"/><path d="M0 -16l5 11 12 1.5-9 8 2.5 12-10.5-6-10.5 6 2.5-12-9-8 12-1.5z" fill="#0F172A" opacity=".85"/></g>';
    },
    hero1: function (c) {
      return '<g transform="translate(110 50)"><rect width="180" height="320" rx="28" fill="#0F172A"/><rect x="10" y="14" width="160" height="292" rx="20" fill="#fff"/><rect x="24" y="34" width="132" height="64" rx="12" fill="' + c[0] + '" opacity=".12"/><rect x="24" y="112" width="132" height="34" rx="10" fill="#EEF2FF"/><rect x="24" y="154" width="132" height="34" rx="10" fill="' + c[2] + '"/><rect x="24" y="196" width="132" height="34" rx="10" fill="#EEF2FF"/><rect x="24" y="250" width="132" height="38" rx="12" fill="' + c[0] + '"/></g>';
    },
    hero2: function (c) {
      return '<g transform="translate(50 120)"><rect x="110" y="30" width="80" height="150" rx="8" fill="' + c[2] + '"/><rect x="20" y="70" width="80" height="110" rx="8" fill="#fff" opacity=".95"/><rect x="200" y="100" width="80" height="80" rx="8" fill="#fff" opacity=".85"/><text x="150" y="86" font-size="40" font-weight="800" text-anchor="middle" fill="#0F172A" font-family="Outfit,Arial">1</text><text x="60" y="120" font-size="34" font-weight="800" text-anchor="middle" fill="' + c[0] + '" font-family="Outfit,Arial">2</text><text x="240" y="146" font-size="30" font-weight="800" text-anchor="middle" fill="' + c[1] + '" font-family="Outfit,Arial">3</text></g><g transform="translate(200 70)"><path d="M0 40 L-14 0 L14 0 Z" fill="none"/><path d="M-26 28h52l-6 8h-40zM-20 0h40v28h-40z" fill="' + c[2] + '"/><circle cy="-8" r="16" fill="' + c[2] + '"/></g>';
    }
  };


  var EMO = {};
  var PALG = [['#1E40AF','#7C3AED'],['#0E7490','#2563EB'],['#6D28D9','#DB2777'],['#047857','#0EA5E9'],['#B45309','#DC2626']];
  function generic(kind, v) {
    var e = EMO[kind] || '🎮', c = PALG[(kind.length + v) % PALG.length], s = '';
    for (var i = 0; i < 6; i++) s += '<text x="' + (30 + (i * 67 + v * 40) % 340) + '" y="' + (40 + (i * 53 + v * 25) % 140) + '" font-size="' + (22 + (i % 3) * 10) + '" opacity=".18">' + e + '</text>';
    var sh = '<rect width="400" height="200" fill="url(#g)"/><rect width="400" height="200" fill="url(#r)"/>' + s + '<circle cx="' + (200 + (v - 1) * 36) + '" cy="100" r="62" fill="#fff" opacity=".95"/><text x="' + (200 + (v - 1) * 36) + '" y="124" font-size="68" text-anchor="middle">' + e + '</text>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient><radialGradient id="r" cx=".8" cy=".1" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' + sh + '</svg>';
  }
  function setEmoji(map) { EMO = map; }

  /** Mengembalikan data-URI SVG. kind: engine id | hero0|hero1|hero2 ; v: variasi 0-2 */
  function scene(kind, v) {
    v = v || 0;
    if (!SCENES[kind]) return uri(generic(kind, v));
    var f = SCENES[kind], c = PAL[v % PAL.length];
    var w = kind.indexOf('hero') === 0 ? 400 : 400, h = kind.indexOf('hero') === 0 ? 420 : 200;
    return uri(wrap(w, h, c, f(c, v)));
  }
  /** Daftar gambar untuk templat: URL kustom (https) bila ada, kalau tidak 3 ilustrasi bawaan */
  function gambarTemplat(t) {
    var custom = (t.gambar || []).filter(function (u) { return /^https:\/\//.test(u); });
    if (custom.length) return custom;
    return [scene(t.engine, 0), scene(t.engine, 1), scene(t.engine, 2)];
  }

  window.Art = { icon: icon, scene: scene, gambarTemplat: gambarTemplat, setEmoji: setEmoji };
})();
