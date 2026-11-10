/* ============================================================
   content.js — data kurikulum, normalisasi konten game (cermin backend),
   contoh konten, penyusun TP & unsur pembelajaran mendalam, dan pembuat prompt.
   ============================================================ */
(function () {
  'use strict';

  var KELAS = [];
  for (var i = 1; i <= 6; i++) KELAS.push({ v: 'SD-' + i, jenjang: 'SD', kelas: i, fase: i <= 2 ? 'A' : i <= 4 ? 'B' : 'C', label: 'SD Kelas ' + i + ' (Fase ' + (i <= 2 ? 'A' : i <= 4 ? 'B' : 'C') + ')' });
  for (var j = 7; j <= 9; j++) KELAS.push({ v: 'SMP-' + j, jenjang: 'SMP', kelas: j, fase: 'D', label: 'SMP Kelas ' + j + ' (Fase D)' });

  var MAPEL = {
    SD: ['Bahasa Indonesia', 'Matematika', 'IPAS (Ilmu Pengetahuan Alam & Sosial)', 'Pendidikan Pancasila', 'Bahasa Inggris', 'Pendidikan Agama', 'PJOK', 'Seni & Budaya'],
    SMP: ['Matematika', 'IPA', 'IPS', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Informatika', 'Pendidikan Agama', 'PJOK', 'Seni & Budaya']
  };

  var ENGINE_INFO = {
    kuis:    { nama: 'Kuis Kilat Pilihan Ganda', ikon: 'timer', warna: '#1E40AF', ciri: ['Hitung mundur & combo streak', 'Umpan balik langsung (formatif)', 'Skor otomatis tercatat'], mode: 'individu', dimensi: ['Bernalar Kritis', 'Mandiri'] },
    tts:     { nama: 'Teka-Teki Silang Edukatif', ikon: 'grid', warna: '#7C3AED', ciri: ['Petunjuk berbasis materi', 'Menguatkan kosakata ilmiah', 'Cek jawaban per kata'], mode: 'individu', dimensi: ['Bernalar Kritis', 'Kreativitas'] },
    kartu:   { nama: 'Petualangan Kartu & Memori', ikon: 'cards', warna: '#0891B2', ciri: ['Cocokkan istilah & arti', 'Melatih daya ingat', 'Cocok untuk SD kelas bawah'], mode: 'individu', dimensi: ['Mandiri', 'Kreativitas'] },
    duel:    { nama: 'Duel Cepat Tanggap Tim', ikon: 'swords', warna: '#DC2626', ciri: ['Dua kelompok, satu layar', 'Tombol buzzer virtual', 'Cocok untuk Smart TV'], mode: 'kelompok', dimensi: ['Gotong Royong', 'Bernalar Kritis'] },
    balok:   { nama: 'Susun Balok Urutan Logika', ikon: 'blocks', warna: '#059669', ciri: ['Menyusun langkah proses', 'Melatih pola sebab-akibat', 'Seret atau ketuk untuk menukar'], mode: 'individu', dimensi: ['Bernalar Kritis', 'Mandiri'] },
    labirin: { nama: 'Labirin Trivia Interaktif', ikon: 'compass', warna: '#9333EA', ciri: ['Gerbang berisi pertanyaan', 'Tiga nyawa untuk bertahan', 'Gamifikasi penuh tantangan'], mode: 'individu', dimensi: ['Kreativitas', 'Mandiri'] }
  };

  /* ---------- normalisasi (cermin Kode.gs) ---------- */
  function teks(v, maks) { return String(v === undefined || v === null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, maks || 300); }
  function parseAI(text) {
    var s = String(text || '').trim();
    var f = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (f) s = f[1].trim();
    var a = s.indexOf('{'), b = s.lastIndexOf('}');
    if (a > -1 && b > a) s = s.slice(a, b + 1);
    try { return JSON.parse(s); } catch (e) { throw new Error('Teks bukan JSON yang valid. Pastikan Anda menempel seluruh balasan AI (mulai dari { sampai }).'); }
  }
  function normSoal(arr, minN) {
    if (!Array.isArray(arr) || arr.length < minN) throw new Error('Butuh minimal ' + minN + ' soal pada "questions".');
    return arr.slice(0, 30).map(function (q, i) {
      var opsi = (q.options || q.opsi || []).map(function (o) { return teks(o, 140); }).filter(Boolean).slice(0, 5);
      if (opsi.length < 2) throw new Error('Soal ' + (i + 1) + ': minimal 2 pilihan jawaban.');
      var ans = q.answer !== undefined ? q.answer : q.jawaban;
      if (typeof ans === 'string') {
        var L = ans.trim().toUpperCase();
        if (/^[A-E]$/.test(L)) ans = L.charCodeAt(0) - 65;
        else { var ix = opsi.indexOf(teks(ans, 140)); ans = ix > -1 ? ix : NaN; }
      }
      ans = Number(ans);
      if (!isFinite(ans) || ans < 0 || ans >= opsi.length) throw new Error('Soal ' + (i + 1) + ': kunci jawaban (answer) tidak cocok dengan pilihan.');
      var t = teks(q.q || q.pertanyaan || q.question, 400);
      if (!t) throw new Error('Soal ' + (i + 1) + ': teks pertanyaan kosong.');
      return { q: t, options: opsi, answer: ans, explain: teks(q.explain || q.penjelasan, 400) };
    });
  }
  function konten(engine, k) {
    if (!ENGINE_INFO[engine]) throw new Error('Jenis permainan tidak dikenal.');
    if (!k || typeof k !== 'object') throw new Error('Isi permainan kosong atau bukan JSON yang valid.');
    var out = { meta: {} }, m = k.meta || {};
    ['judul', 'mapel', 'topik', 'fase', 'tujuan'].forEach(function (f) { if (m[f]) out.meta[f] = teks(m[f], 300); });
    if (engine === 'kuis' || engine === 'duel' || engine === 'labirin') out.questions = normSoal(k.questions || k.soal, 3);
    else if (engine === 'kartu') {
      var p = k.pairs || k.pasangan;
      if (!Array.isArray(p) || p.length < 4) throw new Error('Butuh minimal 4 pasangan pada "pairs".');
      out.pairs = p.slice(0, 12).map(function (x, i) {
        var a = teks(x.a || x.kartu1, 60), b = teks(x.b || x.kartu2, 60);
        if (!a || !b) throw new Error('Pasangan ' + (i + 1) + ' belum lengkap (a dan b).');
        return { a: a, b: b };
      });
    } else if (engine === 'balok') {
      var s = k.sequences || k.urutan;
      if (!Array.isArray(s) || !s.length) throw new Error('Butuh minimal 1 urutan pada "sequences".');
      out.sequences = s.slice(0, 5).map(function (x, i) {
        var steps = (x.steps || x.langkah || []).map(function (t) { return teks(t, 120); }).filter(Boolean).slice(0, 8);
        if (steps.length < 3) throw new Error('Urutan ' + (i + 1) + ': minimal 3 langkah.');
        return { title: teks(x.title || x.judul || ('Urutan ' + (i + 1)), 120), steps: steps };
      });
    } else if (engine === 'tts') {
      var w = k.words || k.kata;
      if (!Array.isArray(w) || w.length < 4) throw new Error('Butuh minimal 4 kata pada "words".');
      out.words = w.slice(0, 12).map(function (x, i) {
        var kata = String(x.word || x.kata || '').toUpperCase().replace(/[^A-Z]/g, '');
        if (kata.length < 3 || kata.length > 12) throw new Error('Kata ' + (i + 1) + ': harus 3–12 huruf A–Z tanpa spasi.');
        var clue = teks(x.clue || x.petunjuk, 200);
        if (!clue) throw new Error('Kata ' + (i + 1) + ': petunjuk (clue) kosong.');
        return { word: kata, clue: clue };
      });
    }
    return out;
  }
  function jumlahItem(engine, k) {
    if (!k) return 0;
    if (k.questions) return k.questions.length;
    if (k.pairs) return k.pairs.length;
    if (k.sequences) return k.sequences.length;
    if (k.words) return k.words.length;
    return 0;
  }

  /* ---------- contoh konten (topik: bagian tubuh tumbuhan) ---------- */
  var SOAL_CONTOH = [
    { q: 'Bagian tumbuhan manakah yang berfungsi menyerap air dan zat hara dari dalam tanah?', options: ['Batang', 'Akar', 'Daun', 'Bunga'], answer: 1, explain: 'Akar menyerap air dan garam mineral dari tanah, lalu menyalurkannya ke bagian lain.' },
    { q: 'Proses pembuatan makanan pada tumbuhan hijau terjadi di bagian ...', options: ['Akar', 'Batang', 'Daun', 'Buah'], answer: 2, explain: 'Daun mengandung klorofil sehingga menjadi tempat fotosintesis.' },
    { q: 'Zat hijau daun yang menangkap cahaya matahari disebut ...', options: ['Klorofil', 'Stomata', 'Getah', 'Serbuk sari'], answer: 0, explain: 'Klorofil adalah pigmen hijau yang menangkap energi cahaya.' },
    { q: 'Gas yang diserap daun untuk fotosintesis adalah ...', options: ['Oksigen', 'Nitrogen', 'Karbon dioksida', 'Hidrogen'], answer: 2, explain: 'Daun menyerap karbon dioksida dari udara melalui stomata.' },
    { q: 'Gas yang dilepaskan tumbuhan saat fotosintesis adalah ...', options: ['Oksigen', 'Karbon dioksida', 'Metana', 'Uap garam'], answer: 0, explain: 'Hasil fotosintesis adalah gula (makanan) dan oksigen.' },
    { q: 'Batang pada tumbuhan berfungsi untuk ...', options: ['Menyerap sinar matahari saja', 'Mengangkut air dan zat makanan serta menopang tumbuhan', 'Menghasilkan biji', 'Menarik serangga'], answer: 1, explain: 'Batang menopang tubuh dan mengangkut air serta zat makanan.' },
    { q: 'Bagian tumbuhan yang berperan dalam perkembangbiakan generatif adalah ...', options: ['Akar', 'Batang', 'Daun', 'Bunga'], answer: 3, explain: 'Bunga menghasilkan serbuk sari dan putik untuk membentuk biji.' },
    { q: 'Biji yang ditanam dan mendapat air serta suhu cukup akan tumbuh menjadi ...', options: ['Batu', 'Tanah', 'Kecambah', 'Pupuk'], answer: 2, explain: 'Biji berkecambah menjadi tumbuhan baru.' }
  ];
  function contoh(engine) {
    var meta = { judul: 'Bagian Tubuh Tumbuhan dan Fungsinya', mapel: 'IPAS', topik: 'Bagian tubuh tumbuhan', fase: 'B' };
    if (engine === 'kartu') return { meta: meta, pairs: [{ a: 'Akar', b: 'Menyerap air' }, { a: 'Batang', b: 'Mengangkut zat' }, { a: 'Daun', b: 'Fotosintesis' }, { a: 'Bunga', b: 'Alat perkembangbiakan' }, { a: 'Buah', b: 'Pelindung biji' }, { a: 'Biji', b: 'Calon tumbuhan baru' }] };
    if (engine === 'tts') return { meta: meta, words: [{ word: 'AKAR', clue: 'Bagian tumbuhan yang menyerap air dari tanah' }, { word: 'DAUN', clue: 'Tempat terjadinya fotosintesis' }, { word: 'BATANG', clue: 'Menopang tumbuhan dan mengangkut zat' }, { word: 'BUNGA', clue: 'Alat perkembangbiakan generatif' }, { word: 'BIJI', clue: 'Calon tumbuhan baru' }, { word: 'KLOROFIL', clue: 'Zat hijau daun' }] };
    if (engine === 'balok') return { meta: meta, sequences: [{ title: 'Proses fotosintesis', steps: ['Akar menyerap air dari tanah', 'Air naik melalui batang menuju daun', 'Daun menangkap cahaya matahari dengan klorofil', 'Daun mengolah air dan karbon dioksida menjadi gula', 'Oksigen dilepaskan ke udara'] }, { title: 'Perkecambahan biji', steps: ['Biji menyerap air', 'Kulit biji pecah', 'Akar muncul menembus tanah', 'Batang dan daun pertama tumbuh'] }] };
    return { meta: meta, questions: SOAL_CONTOH };
  }

  /* ---------- TP & unsur pembelajaran mendalam (otomatis) ---------- */
  var KATA_KERJA = { A: ['mengenal', 'menyebutkan', 'menunjukkan'], B: ['mengidentifikasi', 'menjelaskan', 'menghubungkan'], C: ['menganalisis', 'menerapkan', 'membandingkan'], D: ['menganalisis', 'mengevaluasi', 'menyimpulkan'] };
  function susunTP(m) {
    var kk = KATA_KERJA[m.fase] || KATA_KERJA.B, topik = m.materi || 'materi';
    var bentuk = m.asesmen === 'sumatif' ? 'dan membuktikan pemahamannya melalui asesmen berbentuk permainan' : 'dan memperbaiki pemahamannya melalui umpan balik langsung pada permainan';
    return 'Peserta didik dapat ' + kk[0] + ' konsep "' + topik + '", ' + kk[1] + ' unsur-unsur pentingnya, serta ' + kk[2] + ' dengan konteks kehidupan sehari-hari ' + bentuk + '.';
  }
  function susunUnsur(m) {
    var info = ENGINE_INFO[m.engine] || ENGINE_INFO.kuis;
    return {
      prinsip: ['Berkesadaran: siswa tahu apa yang sedang dipelajari dan mengapa', 'Bermakna: soal dikaitkan dengan konteks nyata', 'Menggembirakan: tantangan, poin, dan umpan balik yang memotivasi'],
      pengalaman: m.asesmen === 'sumatif' ? ['Memahami', 'Mengaplikasi'] : ['Memahami', 'Mengaplikasi', 'Merefleksi'],
      dimensi: info.dimensi.concat(m.mode === 'kelompok' ? [] : [])
    };
  }
  function ringkasUnsur(u) { return 'Prinsip: Berkesadaran, Bermakna, Menggembirakan. Pengalaman belajar: ' + u.pengalaman.join(', ') + '. Dimensi profil: ' + u.dimensi.join(', ') + '.'; }

  /* ---------- pembuat prompt ---------- */
  function jumlahButir(engine, m) {
    var maks = m.jenjang === 'SD' ? 15 : 25;
    var n = Math.round((Number(m.durasi) || 15) * 0.8);
    if (engine === 'kartu') return Math.max(4, Math.min(8, Math.round((Number(m.durasi) || 10) / 2)));
    if (engine === 'tts') return Math.max(5, Math.min(10, Math.round((Number(m.durasi) || 15) / 2.5)));
    if (engine === 'balok') return Math.max(2, Math.min(4, Math.round((Number(m.durasi) || 15) / 6)));
    return Math.max(5, Math.min(maks, n));
  }
  var SKEMA_TEKS = {
    kuis: '{\n  "meta": {"judul": "...", "mapel": "...", "topik": "...", "fase": "B"},\n  "questions": [\n    {"q": "Teks pertanyaan?", "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"], "answer": 1, "explain": "Penjelasan singkat mengapa jawabannya benar."}\n  ]\n}\n"answer" = nomor urut pilihan yang benar dimulai dari 0 (0=A, 1=B, 2=C, 3=D).',
    duel: '{\n  "meta": {"judul": "...", "mapel": "...", "topik": "...", "fase": "B"},\n  "questions": [\n    {"q": "Pertanyaan singkat yang bisa dijawab cepat?", "options": ["A", "B", "C", "D"], "answer": 0, "explain": "..."}\n  ]\n}\n"answer" dimulai dari 0. Pertanyaan harus singkat (maks. 20 kata) karena dijawab rebutan.',
    labirin: '{\n  "meta": {"judul": "...", "mapel": "...", "topik": "...", "fase": "C"},\n  "questions": [\n    {"q": "Pertanyaan pos labirin?", "options": ["A", "B", "C", "D"], "answer": 2, "explain": "..."}\n  ]\n}\n"answer" dimulai dari 0. Urutkan dari mudah ke sulit.',
    kartu: '{\n  "meta": {"judul": "...", "mapel": "...", "topik": "...", "fase": "A"},\n  "pairs": [\n    {"a": "Istilah/gambar kata", "b": "Pasangan/arti singkat"}\n  ]\n}\nTiap sisi maksimal 5 kata. Tidak ada pasangan ganda.',
    balok: '{\n  "meta": {"judul": "...", "mapel": "...", "topik": "...", "fase": "C"},\n  "sequences": [\n    {"title": "Nama proses", "steps": ["Langkah 1 (urutan benar)", "Langkah 2", "Langkah 3", "Langkah 4"]}\n  ]\n}\n"steps" harus ditulis dalam URUTAN YANG BENAR (aplikasi yang mengacaknya). 3–8 langkah per urutan.',
    tts: '{\n  "meta": {"judul": "...", "mapel": "...", "topik": "...", "fase": "D"},\n  "words": [\n    {"word": "FOTOSINTESIS", "clue": "Petunjuk singkat tanpa menyebut kata jawabannya"}\n  ]\n}\n"word" huruf kapital A–Z saja, tanpa spasi/angka, 3–12 huruf.'
  };
  function buatPrompt(m) {
    var info = ENGINE_INFO[m.engine] || ENGINE_INFO.kuis, n = jumlahButir(m.engine, m), u = m.unsur || susunUnsur(m);
    var sat = m.engine === 'kartu' ? 'pasangan kartu' : m.engine === 'balok' ? 'urutan proses' : m.engine === 'tts' ? 'kata' : 'butir soal';
    var tkt = { mudah: 'Mudah (pengingatan & pemahaman dasar)', sedang: 'Sedang (pemahaman & penerapan sederhana)', bertingkat: 'Bertingkat (campuran mudah ke sulit, termasuk penalaran)' }[m.tingkat] || 'Sedang';
    return [
      '# PERINTAH PEMBUATAN KONTEN GAME PEMBELAJARAN — ' + info.nama.toUpperCase(),
      '# Format baku Kurikulum Merdeka Fase ' + m.fase,
      '',
      'Peran: Anda adalah perancang asesmen dan gamifikasi pembelajaran Kurikulum Merdeka untuk guru di Indonesia.',
      '',
      '## KONTEKS',
      '- Jenjang & kelas : ' + m.jenjang + ' Kelas ' + m.kelas + ' (Fase ' + m.fase + ')',
      '- Mata pelajaran  : ' + m.mapel,
      '- Topik utama     : "' + m.materi + '"',
      '- Jenis asesmen   : ' + (m.asesmen === 'sumatif' ? 'Sumatif (penilaian akhir, tanpa bocoran kunci)' : 'Formatif (latihan dengan umpan balik)'),
      '- Tingkat kesulitan: ' + tkt,
      '- Mode bermain    : ' + (m.mode === 'kelompok' ? 'Kelompok / tim' : 'Individu'),
      '- Durasi          : ' + m.durasi + ' menit',
      '',
      '## TUJUAN PEMBELAJARAN (TP)',
      m.tujuan,
      '',
      '## UNSUR PEMBELAJARAN MENDALAM YANG HARUS TERCERMIN',
      '- ' + u.prinsip.join('\n- '),
      '- Pengalaman belajar: ' + u.pengalaman.join(', '),
      '- Dimensi profil: ' + u.dimensi.join(', '),
      '',
      '## SPESIFIKASI GAME',
      '- Jenis game: ' + info.nama,
      '- Buat tepat ' + n + ' ' + sat + '.',
      '- Gunakan bahasa Indonesia yang sesuai usia siswa ' + m.jenjang + ' kelas ' + m.kelas + ', kalimat pendek dan jelas.',
      '- Kaitkan dengan konteks sehari-hari siswa Indonesia (lingkungan sekitar, makanan, pasar, sawah, sekolah, dsb.) bila relevan.',
      '- Pastikan seluruh fakta akurat dan sesuai kurikulum. Jika ragu, pilih fakta yang paling umum diajarkan.',
      '- Pilihan pengecoh harus masuk akal, bukan asal-asalan.',
      '',
      '## FORMAT KELUARAN (WAJIB)',
      'Keluarkan HANYA satu objek JSON valid — tanpa penjelasan, tanpa komentar, tanpa teks pembuka/penutup. Boleh dibungkus ```json ... ```.',
      'Struktur:',
      SKEMA_TEKS[m.engine] || SKEMA_TEKS.kuis
    ].join('\n');
  }

  /* ---------- kelas yang disediakan untuk siswa memilih ---------- */
  function daftarKelasSiswa(m) {
    var out = [];
    var base = String(m.kelas || '').replace(/[^0-9]/g, '');
    var huruf = ['A', 'B', 'C', 'D'];
    if (base) huruf.forEach(function (h) { out.push('Kelas ' + base + h); });
    out.push('Kelas lain');
    return out;
  }

  window.Content = { KELAS: KELAS, MAPEL: MAPEL, ENGINE_INFO: ENGINE_INFO, parseAI: parseAI, konten: konten, jumlahItem: jumlahItem, contoh: contoh,
    susunTP: susunTP, susunUnsur: susunUnsur, ringkasUnsur: ringkasUnsur, buatPrompt: buatPrompt, jumlahButir: jumlahButir, daftarKelasSiswa: daftarKelasSiswa };
})();
