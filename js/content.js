/* ============================================================
   content.js — katalog 24 jenis game, data kurikulum, normalisasi konten
   (cermin Kode.gs), penilaian lokal, contoh, TP otomatis, pembuat prompt.
   ============================================================ */
(function () {
  'use strict';

  var CATALOG = [{"id": "TMPL-01", "engine": "kuis", "nama": "Kuis Kilat Pilihan Ganda", "deskripsi": "Balapan skor poin kompetitif dengan hitungan mundur, combo streak, dan umpan balik langsung.", "fase": "A,B,C,D", "mode": "individu", "dmin": 5, "dmax": 15, "ikon": "timer", "warna": "#1E40AF", "kat": "kuis", "tipe": "questions", "sat": "butir soal", "n": [5, 15, 0.8], "ciri": ["Hitung mundur & combo streak", "Umpan balik langsung (formatif)", "Skor otomatis tercatat"], "dimensi": ["Bernalar Kritis", "Mandiri"], "emoji": "⚡", "tampil": "Satu soal besar per layar, 4 tombol jawaban berwarna (A-D), bar waktu menyusut, poin dan combo streak, penjelasan singkat setelah menjawab."}, {"id": "TMPL-02", "engine": "tts", "nama": "Teka-Teki Silang Edukatif", "deskripsi": "Isi kotak silang dari petunjuk berbasis materi untuk menguatkan kosakata ilmiah.", "fase": "C,D", "mode": "individu", "dmin": 10, "dmax": 30, "ikon": "grid", "warna": "#7C3AED", "kat": "kata", "tipe": "words", "sat": "kata", "n": [5, 10, 0.4], "ciri": ["Petunjuk berbasis materi", "Menguatkan kosakata ilmiah", "Cek jawaban per kata"], "dimensi": ["Bernalar Kritis", "Kreativitas"], "emoji": "🔤", "tampil": "Grid silang disusun otomatis dari kata-katamu; siswa mengetik huruf di kotak, petunjuk Mendatar dan Menurun ditampilkan di samping."}, {"id": "TMPL-03", "engine": "kartu", "nama": "Petualangan Kartu & Memori", "deskripsi": "Cocokkan pasangan istilah dan artinya sambil melatih daya ingat dan asosiasi.", "fase": "A,B,C", "mode": "individu", "dmin": 5, "dmax": 20, "ikon": "cards", "warna": "#0891B2", "kat": "memori", "tipe": "pairs", "sat": "pasangan", "n": [4, 8, 0.45], "ciri": ["Cocokkan istilah & arti", "Melatih daya ingat", "Cocok untuk SD kelas bawah"], "dimensi": ["Mandiri", "Kreativitas"], "emoji": "🃏", "tampil": "Kartu tertutup yang dibalik dua-dua; kartu pasangan benar menyala hijau dan terkunci, ada penghitung langkah dan waktu."}, {"id": "TMPL-04", "engine": "duel", "nama": "Duel Cepat Tanggap Tim", "deskripsi": "Dua kelompok berebut menjawab di satu layar kelas — cocok untuk Smart TV atau proyektor.", "fase": "B,C,D", "mode": "kelompok", "dmin": 10, "dmax": 40, "ikon": "swords", "warna": "#DC2626", "kat": "tim", "tipe": "questions", "sat": "butir soal", "n": [6, 14, 0.5], "ciri": ["Dua kelompok, satu layar", "Tombol buzzer virtual", "Cocok untuk Smart TV"], "dimensi": ["Gotong Royong", "Bernalar Kritis"], "emoji": "⚔️", "tampil": "Layar bersama dengan dua buzzer besar (biru dan merah), tarik tambang skor di atas, tim tercepat boleh menjawab, lawan dapat kesempatan curi."}, {"id": "TMPL-05", "engine": "balok", "nama": "Susun Balok Urutan Logika", "deskripsi": "Susun langkah proses atau peristiwa dengan urutan yang benar untuk melatih penalaran.", "fase": "C,D", "mode": "individu", "dmin": 10, "dmax": 30, "ikon": "blocks", "warna": "#059669", "kat": "logika", "tipe": "sequences", "sat": "urutan", "n": [2, 4, 0.15], "ciri": ["Menyusun langkah proses", "Melatih pola sebab-akibat", "Seret atau ketuk untuk menukar"], "dimensi": ["Bernalar Kritis", "Mandiri"], "emoji": "🧱", "tampil": "Balok-balok langkah yang diacak; siswa menyeret atau mengetuk dua balok untuk menukar posisi lalu menekan Periksa."}, {"id": "TMPL-06", "engine": "labirin", "nama": "Labirin Trivia Interaktif", "deskripsi": "Jelajahi labirin dan buka gerbang dengan menjawab pertanyaan; tiga nyawa untuk bertahan.", "fase": "B,C,D", "mode": "individu", "dmin": 10, "dmax": 40, "ikon": "compass", "warna": "#9333EA", "kat": "petualangan", "tipe": "questions", "sat": "butir soal", "n": [6, 15, 0.6], "ciri": ["Gerbang berisi pertanyaan", "Tiga nyawa untuk bertahan", "Gamifikasi penuh tantangan"], "dimensi": ["Kreativitas", "Mandiri"], "emoji": "🧭", "tampil": "Peta labirin dengan tokoh yang berjalan; di tiap gerbang muncul satu soal, jawaban benar membuka gerbang, salah mengurangi nyawa."}, {"id": "TMPL-07", "engine": "benarsalah", "nama": "Benar atau Salah Kilat", "deskripsi": "Tentukan pernyataan benar atau salah dengan cepat; cocok untuk pemanasan dan konsep dasar.", "fase": "A,B,C,D", "mode": "individu", "dmin": 5, "dmax": 15, "ikon": "checkc", "warna": "#16A34A", "kat": "kuis", "tipe": "statements", "sat": "pernyataan", "n": [6, 15, 0.9], "ciri": ["Dua tombol besar Benar/Salah", "Pemanasan cepat sebelum belajar", "Penjelasan singkat tiap pernyataan"], "dimensi": ["Bernalar Kritis", "Mandiri"], "emoji": "✅", "tampil": "Kartu pernyataan besar dengan dua tombol raksasa BENAR (hijau) dan SALAH (merah); penjelasan singkat muncul setelah menjawab."}, {"id": "TMPL-08", "engine": "cocok", "nama": "Jodohkan: Tarik Pasangan", "deskripsi": "Hubungkan istilah di kiri dengan pasangannya di kanan, lalu periksa semuanya sekaligus.", "fase": "A,B,C,D", "mode": "individu", "dmin": 5, "dmax": 20, "ikon": "link", "warna": "#0EA5E9", "kat": "memori", "tipe": "pairs", "sat": "pasangan", "n": [4, 8, 0.45], "ciri": ["Dua kolom saling dihubungkan", "Pewarnaan pasangan otomatis", "Periksa semua sekaligus"], "dimensi": ["Bernalar Kritis", "Mandiri"], "emoji": "🔗", "tampil": "Dua kolom: istilah di kiri dan pasangan di kanan (diacak); ketuk satu dari tiap kolom untuk menjodohkan, tiap pasangan diberi warna sendiri."}, {"id": "TMPL-09", "engine": "anagram", "nama": "Acak Kata (Anagram)", "deskripsi": "Susun huruf-huruf yang teracak menjadi kata yang tepat berdasarkan petunjuk.", "fase": "B,C,D", "mode": "individu", "dmin": 5, "dmax": 20, "ikon": "edit", "warna": "#F59E0B", "kat": "kata", "tipe": "words", "sat": "kata", "n": [5, 10, 0.4], "ciri": ["Susun huruf yang diacak", "Petunjuk tiap kata", "Melatih ejaan istilah"], "dimensi": ["Kreativitas", "Mandiri"], "emoji": "🔠", "tampil": "Ubin-ubin huruf teracak; siswa mengetuk ubin untuk mengisi kotak jawaban, ada petunjuk dan emoji bantu di atasnya."}, {"id": "TMPL-10", "engine": "gantung", "nama": "Tebak Kata (Gantung)", "deskripsi": "Tebak kata rahasia huruf demi huruf sebelum kesempatan salah habis.", "fase": "B,C,D", "mode": "individu", "dmin": 5, "dmax": 20, "ikon": "bulb", "warna": "#EF4444", "kat": "kata", "tipe": "words", "sat": "kata", "n": [5, 8, 0.35], "ciri": ["Papan huruf A–Z", "Enam kesempatan salah", "Petunjuk sebagai penolong"], "dimensi": ["Bernalar Kritis", "Mandiri"], "emoji": "🎯", "tampil": "Kata rahasia ditampilkan sebagai garis bawah, papan tombol huruf A–Z, gambar tokoh bertambah tiap salah, petunjuk di atas."}, {"id": "TMPL-11", "engine": "carikata", "nama": "Cari Kata Tersembunyi", "deskripsi": "Temukan kata-kata istilah yang bersembunyi di dalam kotak huruf.", "fase": "A,B,C,D", "mode": "individu", "dmin": 10, "dmax": 25, "ikon": "search", "warna": "#14B8A6", "kat": "kata", "tipe": "words", "sat": "kata", "n": [5, 8, 0.35], "ciri": ["Grid huruf acak", "Mendatar, menurun, dan diagonal", "Daftar petunjuk di samping"], "dimensi": ["Mandiri", "Kreativitas"], "emoji": "🔎", "tampil": "Kotak huruf; ketuk huruf awal lalu huruf akhir untuk menandai kata, kata yang ditemukan menyala dan dicoret dari daftar petunjuk."}, {"id": "TMPL-12", "engine": "isian", "nama": "Isi Titik-titik (Lengkapi)", "deskripsi": "Ketik jawaban singkat untuk melengkapi kalimat; melatih mengingat tanpa pilihan jawaban.", "fase": "B,C,D", "mode": "individu", "dmin": 5, "dmax": 20, "ikon": "file", "warna": "#8B5CF6", "kat": "kuis", "tipe": "items", "sat": "kalimat", "n": [5, 12, 0.6], "ciri": ["Mengetik jawaban sendiri", "Tanpa pilihan, melatih ingatan", "Toleran huruf besar/kecil"], "dimensi": ["Bernalar Kritis", "Mandiri"], "emoji": "✏️", "tampil": "Kalimat dengan titik-titik kosong yang menyala, kolom ketik besar, penghitung huruf sebagai petunjuk, pemeriksaan tidak peka huruf besar/kecil."}, {"id": "TMPL-13", "engine": "kelompok", "nama": "Kelompokkan Kategori", "deskripsi": "Pilah item ke dalam kelompok yang tepat dengan ketuk atau seret.", "fase": "A,B,C,D", "mode": "individu", "dmin": 10, "dmax": 25, "ikon": "layers", "warna": "#F97316", "kat": "logika", "tipe": "groups", "sat": "item", "n": [2, 4, 0.2], "ciri": ["Seret atau ketuk untuk memilah", "Melatih klasifikasi konsep", "Hasil diperiksa sekaligus"], "dimensi": ["Bernalar Kritis", "Kreativitas"], "emoji": "🗂️", "tampil": "Kotak-kotak kategori berwarna dan kumpulan kartu item; seret kartu ke kategori (atau ketuk kartu lalu kategori), lalu tekan Periksa."}, {"id": "TMPL-14", "engine": "balon", "nama": "Pecahkan Balon Jawaban", "deskripsi": "Pecahkan balon yang membawa jawaban benar sebelum balon-balon melayang pergi.", "fase": "A,B,C", "mode": "individu", "dmin": 5, "dmax": 15, "ikon": "balloon", "warna": "#EC4899", "kat": "petualangan", "tipe": "questions", "sat": "butir soal", "n": [5, 12, 0.7], "ciri": ["Balon melayang bergoyang", "Pecahkan jawaban yang tepat", "Cocok untuk SD kelas bawah"], "dimensi": ["Mandiri", "Kreativitas"], "emoji": "🎈", "tampil": "Soal di atas, empat balon warna-warni melayang naik turun membawa pilihan jawaban; ketuk balon untuk memecahkannya dengan efek letusan."}, {"id": "TMPL-15", "engine": "tikus", "nama": "Pukul Tikus Tanah Kuis", "deskripsi": "Pukul tikus tanah yang membawa jawaban benar; seru dan cepat.", "fase": "A,B,C", "mode": "individu", "dmin": 5, "dmax": 15, "ikon": "hammer", "warna": "#A16207", "kat": "petualangan", "tipe": "questions", "sat": "butir soal", "n": [5, 12, 0.7], "ciri": ["Tikus muncul dari lubang", "Palu dengan efek pukulan", "Reaksi cepat sambil berpikir"], "dimensi": ["Mandiri", "Kreativitas"], "emoji": "🔨", "tampil": "Soal di atas, empat lubang tanah dengan tikus yang naik turun membawa pilihan jawaban; ketuk tikus yang benar untuk memukulnya."}, {"id": "TMPL-16", "engine": "roda", "nama": "Roda Putar Hadiah", "deskripsi": "Putar roda untuk mendapat pengali poin, lalu jawab soalnya.", "fase": "A,B,C,D", "mode": "individu", "dmin": 10, "dmax": 25, "ikon": "refresh", "warna": "#D946EF", "kat": "petualangan", "tipe": "questions", "sat": "butir soal", "n": [6, 12, 0.6], "ciri": ["Roda putar penuh warna", "Pengali poin acak", "Menggembirakan seisi kelas"], "dimensi": ["Kreativitas", "Mandiri"], "emoji": "🎡", "tampil": "Roda berputar dengan animasi sebelum tiap soal untuk menentukan pengali poin (x1, x2, x3, bonus), lalu soal pilihan ganda muncul."}, {"id": "TMPL-17", "engine": "kotak", "nama": "Buka Kotak Misteri", "deskripsi": "Pilih kotak mana saja; di dalamnya ada soal dan hadiah menunggu.", "fase": "A,B,C,D", "mode": "individu", "dmin": 10, "dmax": 25, "ikon": "gift", "warna": "#F43F5E", "kat": "petualangan", "tipe": "questions", "sat": "butir soal", "n": [6, 12, 0.6], "ciri": ["Siswa bebas memilih kotak", "Kejutan hadiah di dalam", "Mendorong rasa penasaran"], "dimensi": ["Kreativitas", "Mandiri"], "emoji": "🎁", "tampil": "Deretan kotak hadiah bernomor; siswa memilih kotak mana saja, soal muncul, jawaban benar membuka bintang, salah memunculkan ledakan."}, {"id": "TMPL-18", "engine": "pesawat", "nama": "Pesawat Penjelajah Jawaban", "deskripsi": "Terbangkan pesawat ke jalur jawaban yang benar sebelum dinding jawaban tiba.", "fase": "B,C,D", "mode": "individu", "dmin": 5, "dmax": 15, "ikon": "plane", "warna": "#0284C7", "kat": "petualangan", "tipe": "questions", "sat": "butir soal", "n": [5, 10, 0.5], "ciri": ["Pesawat berpindah jalur", "Dinding jawaban bergerak", "Kontrol panah atau ketuk"], "dimensi": ["Mandiri", "Bernalar Kritis"], "emoji": "✈️", "tampil": "Pesawat di kiri bergerak naik turun di empat jalur langit; dinding balok jawaban melaju dari kanan, jalur tempat pesawat berada saat dinding tiba adalah jawabannya."}, {"id": "TMPL-19", "engine": "katak", "nama": "Katak Loncat Sungai", "deskripsi": "Bantu katak menyeberangi sungai dengan memilih daun teratai yang benar.", "fase": "A,B,C", "mode": "individu", "dmin": 5, "dmax": 15, "ikon": "sprout", "warna": "#65A30D", "kat": "petualangan", "tipe": "questions", "sat": "butir soal", "n": [5, 12, 0.7], "ciri": ["Katak meloncat antar teratai", "Kemajuan terlihat di sungai", "Ramah untuk SD"], "dimensi": ["Mandiri", "Kreativitas"], "emoji": "🐸", "tampil": "Sungai dengan katak yang maju tiap jawaban benar; pilihan jawaban berupa daun teratai bulat, jawaban salah membuat katak tercebur."}, {"id": "TMPL-20", "engine": "roket", "nama": "Roket Meluncur", "deskripsi": "Isi bahan bakar roket dengan jawaban benar sampai siap meluncur ke angkasa.", "fase": "A,B,C,D", "mode": "individu", "dmin": 5, "dmax": 15, "ikon": "rocket", "warna": "#4F46E5", "kat": "petualangan", "tipe": "questions", "sat": "butir soal", "n": [5, 12, 0.7], "ciri": ["Bahan bakar bertambah tiap benar", "Peluncuran di akhir", "Motivasi visual yang jelas"], "dimensi": ["Mandiri", "Kreativitas"], "emoji": "🚀", "tampil": "Roket di samping dengan pengukur bahan bakar; tiap jawaban benar mengisi bahan bakar dan roket naik, di akhir roket meluncur."}, {"id": "TMPL-21", "engine": "balap", "nama": "Balap Mobil Kuis", "deskripsi": "Jawab benar untuk memajukan mobilmu melawan mobil komputer di lintasan.", "fase": "A,B,C,D", "mode": "individu", "dmin": 5, "dmax": 15, "ikon": "flag", "warna": "#E11D48", "kat": "kuis", "tipe": "questions", "sat": "butir soal", "n": [6, 15, 0.8], "ciri": ["Lintasan balap dua mobil", "Lawan komputer", "Seru dan kompetitif"], "dimensi": ["Mandiri", "Gotong Royong"], "emoji": "🏎️", "tampil": "Lintasan dua jalur: mobilmu maju tiap jawaban benar, mobil komputer maju acak; pilihan jawaban berupa tombol di bawah lintasan."}, {"id": "TMPL-22", "engine": "ulartangga", "nama": "Ular Tangga Edukasi", "deskripsi": "Jawab soal, lempar dadu, naik tangga, dan hindari ular menuju kotak terakhir.", "fase": "A,B,C", "mode": "individu", "dmin": 10, "dmax": 30, "ikon": "dice", "warna": "#0D9488", "kat": "petualangan", "tipe": "questions", "sat": "butir soal", "n": [8, 15, 0.6], "ciri": ["Papan ular tangga", "Dadu setelah jawaban benar", "Permainan yang dikenal anak"], "dimensi": ["Mandiri", "Kreativitas"], "emoji": "🎲", "tampil": "Papan 25 kotak dengan tangga dan ular; jawaban benar berhak melempar dadu 🎲 dan pion melangkah, tangga mempercepat, ular menurunkan."}, {"id": "TMPL-23", "engine": "hitung", "nama": "Hitung Cepat", "deskripsi": "Selesaikan soal hitungan dengan mengetik jawaban memakai tombol angka di layar.", "fase": "A,B,C,D", "mode": "individu", "dmin": 5, "dmax": 15, "ikon": "calc", "warna": "#2563EB", "kat": "kuis", "tipe": "problems", "sat": "soal hitung", "n": [6, 15, 0.9], "ciri": ["Tombol angka di layar", "Hitung mundur tiap soal", "Latihan berhitung terarah"], "dimensi": ["Bernalar Kritis", "Mandiri"], "emoji": "🔢", "tampil": "Soal hitungan besar di tengah, papan tombol angka 0–9 ramah jari, tombol hapus dan OK, hitung mundur dan combo benar beruntun."}, {"id": "TMPL-24", "engine": "kartukilat", "nama": "Kartu Kilat (Flashcard)", "deskripsi": "Balik kartu istilah untuk melihat artinya lalu nilai pemahamanmu sendiri.", "fase": "A,B,C,D", "mode": "individu", "dmin": 5, "dmax": 15, "ikon": "cards", "warna": "#7C3AED", "kat": "memori", "tipe": "cards", "sat": "kartu", "n": [6, 14, 0.8], "ciri": ["Balik kartu untuk melihat arti", "Penilaian mandiri", "Cocok untuk mengulang materi"], "dimensi": ["Mandiri", "Berkesadaran"], "emoji": "🗒️", "tampil": "Kartu besar yang dibalik dengan satu ketukan untuk melihat arti, lalu dua tombol: Sudah paham atau Belum, kemajuan ditampilkan di atas."}];

  var KELAS = [];
  for (var i = 1; i <= 6; i++) KELAS.push({ v: 'SD-' + i, jenjang: 'SD', kelas: i, fase: i <= 2 ? 'A' : i <= 4 ? 'B' : 'C', label: 'SD Kelas ' + i + ' (Fase ' + (i <= 2 ? 'A' : i <= 4 ? 'B' : 'C') + ')' });
  for (var j = 7; j <= 9; j++) KELAS.push({ v: 'SMP-' + j, jenjang: 'SMP', kelas: j, fase: 'D', label: 'SMP Kelas ' + j + ' (Fase D)' });

  var MAPEL = {
    SD: ['Bahasa Indonesia', 'Matematika', 'IPAS (Ilmu Pengetahuan Alam & Sosial)', 'Pendidikan Pancasila', 'Bahasa Inggris', 'Pendidikan Agama', 'PJOK', 'Seni & Budaya'],
    SMP: ['Matematika', 'IPA', 'IPS', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Informatika', 'Pendidikan Agama', 'PJOK', 'Seni & Budaya']
  };
  var KATEGORI = [['semua', 'Semua'], ['kuis', 'Kuis & Soal'], ['kata', 'Kata & Huruf'], ['memori', 'Memori & Pasangan'], ['logika', 'Logika & Urutan'], ['petualangan', 'Petualangan & Arcade'], ['tim', 'Tim']];

  var ENGINE_INFO = {};
  CATALOG.forEach(function (c) { ENGINE_INFO[c.engine] = c; });
  var TIPE = {}; CATALOG.forEach(function (c) { TIPE[c.engine] = c.tipe; });

  /* ---------- normalisasi (cermin Kode.gs) ---------- */
  function teks(v, maks) { return String(v === undefined || v === null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, maks || 300); }
  function emo(v) { return teks(v, 8); }
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
      return { q: t, options: opsi, answer: ans, explain: teks(q.explain || q.penjelasan, 400), emoji: emo(q.emoji) };
    });
  }
  function boolOf(v) { if (typeof v === 'boolean') return v; var s = String(v).trim().toLowerCase(); if (['true', 'benar', 'b', '1', 'ya'].indexOf(s) > -1) return true; if (['false', 'salah', 's', '0', 'tidak'].indexOf(s) > -1) return false; return null; }
  function konten(engine, k) {
    var tipe = TIPE[engine];
    if (!tipe) throw new Error('Jenis permainan tidak dikenal.');
    if (!k || typeof k !== 'object') throw new Error('Isi permainan kosong atau bukan JSON yang valid.');
    var out = { meta: {} }, m = k.meta || {};
    ['judul', 'mapel', 'topik', 'fase', 'tujuan'].forEach(function (f) { if (m[f]) out.meta[f] = teks(m[f], 300); });
    if (tipe === 'questions') out.questions = normSoal(k.questions || k.soal, 3);
    else if (tipe === 'pairs') {
      var p = k.pairs || k.pasangan;
      if (!Array.isArray(p) || p.length < 4) throw new Error('Butuh minimal 4 pasangan pada "pairs".');
      out.pairs = p.slice(0, 12).map(function (x, i) {
        var a = teks(x.a || x.kartu1, 60), b = teks(x.b || x.kartu2, 60);
        if (!a || !b) throw new Error('Pasangan ' + (i + 1) + ' belum lengkap (a dan b).');
        return { a: a, b: b };
      });
    } else if (tipe === 'sequences') {
      var s = k.sequences || k.urutan;
      if (!Array.isArray(s) || !s.length) throw new Error('Butuh minimal 1 urutan pada "sequences".');
      out.sequences = s.slice(0, 5).map(function (x, i) {
        var steps = (x.steps || x.langkah || []).map(function (t) { return teks(t, 120); }).filter(Boolean).slice(0, 8);
        if (steps.length < 3) throw new Error('Urutan ' + (i + 1) + ': minimal 3 langkah.');
        return { title: teks(x.title || x.judul || ('Urutan ' + (i + 1)), 120), steps: steps };
      });
    } else if (tipe === 'words') {
      var w = k.words || k.kata, maksPjg = engine === 'carikata' ? 10 : 12;
      if (!Array.isArray(w) || w.length < (engine === 'anagram' || engine === 'gantung' ? 3 : 4)) throw new Error('Butuh lebih banyak kata pada "words" (minimal ' + (engine === 'anagram' || engine === 'gantung' ? 3 : 4) + ').');
      out.words = w.slice(0, 12).map(function (x, i) {
        var kata = String(x.word || x.kata || '').toUpperCase().replace(/[^A-Z]/g, '');
        if (kata.length < 3 || kata.length > maksPjg) throw new Error('Kata ' + (i + 1) + ': harus 3–' + maksPjg + ' huruf A–Z tanpa spasi.');
        var clue = teks(x.clue || x.petunjuk, 200);
        if (!clue) throw new Error('Kata ' + (i + 1) + ': petunjuk (clue) kosong.');
        return { word: kata, clue: clue, emoji: emo(x.emoji) };
      });
    } else if (tipe === 'statements') {
      var st = k.statements || k.pernyataan;
      if (!Array.isArray(st) || st.length < 4) throw new Error('Butuh minimal 4 pernyataan pada "statements".');
      out.statements = st.slice(0, 30).map(function (x, i) {
        var t = teks(x.text || x.pernyataan, 300), b = boolOf(x.benar !== undefined ? x.benar : x.answer);
        if (!t) throw new Error('Pernyataan ' + (i + 1) + ': teks kosong.');
        if (b === null) throw new Error('Pernyataan ' + (i + 1) + ': isi "benar" dengan true atau false.');
        return { text: t, benar: b, explain: teks(x.explain || x.penjelasan, 300), emoji: emo(x.emoji) };
      });
    } else if (tipe === 'items') {
      var it = k.items || k.isian;
      if (!Array.isArray(it) || it.length < 3) throw new Error('Butuh minimal 3 butir pada "items".');
      out.items = it.slice(0, 30).map(function (x, i) {
        var q = teks(x.q || x.kalimat, 300), a = teks(x.answer || x.jawaban, 40);
        if (!q || !a) throw new Error('Butir ' + (i + 1) + ': kalimat (q) dan jawaban (answer) wajib.');
        return { q: q, answer: a, accept: (x.accept || []).map(function (v) { return teks(v, 40); }).filter(Boolean).slice(0, 6), explain: teks(x.explain, 300), emoji: emo(x.emoji) };
      });
    } else if (tipe === 'groups') {
      var g = k.groups || k.kelompok;
      if (!Array.isArray(g) || g.length < 2 || g.length > 4) throw new Error('Butuh 2–4 kelompok pada "groups".');
      var tot = 0;
      out.groups = g.map(function (x, i) {
        var items = (x.items || []).map(function (t) { return teks(t, 60); }).filter(Boolean).slice(0, 6);
        if (!teks(x.name || x.nama, 60) || items.length < 2) throw new Error('Kelompok ' + (i + 1) + ': perlu nama dan minimal 2 item.');
        tot += items.length;
        return { name: teks(x.name || x.nama, 60), items: items };
      });
      if (tot > 20) throw new Error('Total item maksimal 20.');
    } else if (tipe === 'problems') {
      var pr = k.problems || k.soal_hitung;
      if (!Array.isArray(pr) || pr.length < 4) throw new Error('Butuh minimal 4 soal pada "problems".');
      out.problems = pr.slice(0, 30).map(function (x, i) {
        var a = Number(String(x.answer !== undefined ? x.answer : x.jawaban).replace(',', '.')), q = teks(x.q || x.soal, 120);
        if (!q || !isFinite(a)) throw new Error('Soal hitung ' + (i + 1) + ': soal (q) dan jawaban angka (answer) wajib.');
        return { q: q, answer: a, emoji: emo(x.emoji) };
      });
    } else if (tipe === 'cards') {
      var cd = k.cards || k.kartu;
      if (!Array.isArray(cd) || cd.length < 4) throw new Error('Butuh minimal 4 kartu pada "cards".');
      out.cards = cd.slice(0, 20).map(function (x, i) {
        var f = teks(x.front || x.depan, 80), b = teks(x.back || x.belakang, 200);
        if (!f || !b) throw new Error('Kartu ' + (i + 1) + ': sisi depan (front) dan belakang (back) wajib.');
        return { front: f, back: b, emoji: emo(x.emoji) };
      });
    }
    return out;
  }
  function jumlahItem(engine, k) {
    if (!k) return 0;
    var a = k.questions || k.pairs || k.sequences || k.words || k.statements || k.items || k.groups || k.problems || k.cards;
    if (k.groups) return k.groups.reduce(function (s, g) { return s + g.items.length; }, 0);
    return a ? a.length : 0;
  }

  /* ---------- penilaian (cermin Kode.gs) & penyembunyian kunci ---------- */
  function normJ(s) { return String(s === undefined || s === null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function sama(engine, item, p) {
    if (engine === 'benarsalah') return Number(p) === (item.benar ? 1 : 0);
    if (engine === 'isian') { var x = normJ(p); return !!x && [item.answer].concat(item.accept || []).some(function (a) { return normJ(a) === x; }); }
    if (engine === 'hitung') { var n = Number(String(p).replace(',', '.')); return isFinite(n) && Math.abs(n - item.answer) < 1e-6; }
    return Number(p) === item.answer;
  }
  function daftarKunci(engine, k) { var t = TIPE[engine]; return t === 'questions' ? k.questions : t === 'statements' ? k.statements : t === 'items' ? k.items : t === 'problems' ? k.problems : null; }
  /** null bila jenis ini dinilai di sisi klien */
  function nilai(engine, k, jw) {
    if (engine === 'duel') return null;
    var L = daftarKunci(engine, k); if (!L) return null;
    var seen = {}, benar = 0;
    (jw || []).forEach(function (j) { var i = Number(j.i); if (seen[i] || !L[i]) return; seen[i] = 1; if (sama(engine, L[i], j.p)) benar++; });
    return { benar: benar, total: L.length };
  }
  function bisaDisembunyi(engine) { return engine !== 'duel' && !!daftarKunci(engine, { questions: [], statements: [], items: [], problems: [] }); }
  function sembunyi(engine, k) {
    var o = JSON.parse(JSON.stringify(k)), t = TIPE[engine];
    if (t === 'questions') o.questions = o.questions.map(function (q) { return { q: q.q, options: q.options, emoji: q.emoji }; });
    else if (t === 'statements') o.statements = o.statements.map(function (q) { return { text: q.text, emoji: q.emoji }; });
    else if (t === 'items') o.items = o.items.map(function (q) { return { q: q.q, emoji: q.emoji }; });
    else if (t === 'problems') o.problems = o.problems.map(function (q) { return { q: q.q, emoji: q.emoji }; });
    return o;
  }

  /* ---------- contoh konten (topik: bagian tubuh tumbuhan) ---------- */
  var SOAL_CONTOH = [
    { q: 'Bagian tumbuhan manakah yang berfungsi menyerap air dan zat hara dari dalam tanah?', options: ['Batang', 'Akar', 'Daun', 'Bunga'], answer: 1, explain: 'Akar menyerap air dan garam mineral dari tanah, lalu menyalurkannya ke bagian lain.', emoji: '🌱' },
    { q: 'Proses pembuatan makanan pada tumbuhan hijau terjadi di bagian ...', options: ['Akar', 'Batang', 'Daun', 'Buah'], answer: 2, explain: 'Daun mengandung klorofil sehingga menjadi tempat fotosintesis.', emoji: '🍃' },
    { q: 'Zat hijau daun yang menangkap cahaya matahari disebut ...', options: ['Klorofil', 'Stomata', 'Getah', 'Serbuk sari'], answer: 0, explain: 'Klorofil adalah pigmen hijau yang menangkap energi cahaya.', emoji: '☀️' },
    { q: 'Gas yang diserap daun untuk fotosintesis adalah ...', options: ['Oksigen', 'Nitrogen', 'Karbon dioksida', 'Hidrogen'], answer: 2, explain: 'Daun menyerap karbon dioksida dari udara melalui stomata.', emoji: '💨' },
    { q: 'Gas yang dilepaskan tumbuhan saat fotosintesis adalah ...', options: ['Oksigen', 'Karbon dioksida', 'Metana', 'Uap garam'], answer: 0, explain: 'Hasil fotosintesis adalah gula (makanan) dan oksigen.', emoji: '🫧' },
    { q: 'Batang pada tumbuhan berfungsi untuk ...', options: ['Menyerap sinar matahari saja', 'Mengangkut air dan zat makanan serta menopang tumbuhan', 'Menghasilkan biji', 'Menarik serangga'], answer: 1, explain: 'Batang menopang tubuh dan mengangkut air serta zat makanan.', emoji: '🌳' },
    { q: 'Bagian tumbuhan yang berperan dalam perkembangbiakan generatif adalah ...', options: ['Akar', 'Batang', 'Daun', 'Bunga'], answer: 3, explain: 'Bunga menghasilkan serbuk sari dan putik untuk membentuk biji.', emoji: '🌸' },
    { q: 'Biji yang ditanam dan mendapat air serta suhu cukup akan tumbuh menjadi ...', options: ['Batu', 'Tanah', 'Kecambah', 'Pupuk'], answer: 2, explain: 'Biji berkecambah menjadi tumbuhan baru.', emoji: '🫘' }
  ];
  function contoh(engine) {
    var meta = { judul: 'Bagian Tubuh Tumbuhan dan Fungsinya', mapel: 'IPAS', topik: 'Bagian tubuh tumbuhan', fase: 'B' }, t = TIPE[engine];
    if (t === 'pairs') return { meta: meta, pairs: [{ a: 'Akar', b: 'Menyerap air' }, { a: 'Batang', b: 'Mengangkut zat' }, { a: 'Daun', b: 'Fotosintesis' }, { a: 'Bunga', b: 'Alat perkembangbiakan' }, { a: 'Buah', b: 'Pelindung biji' }, { a: 'Biji', b: 'Calon tumbuhan baru' }] };
    if (t === 'words') return { meta: meta, words: [{ word: 'AKAR', clue: 'Bagian tumbuhan yang menyerap air dari tanah', emoji: '🌱' }, { word: 'DAUN', clue: 'Tempat terjadinya fotosintesis', emoji: '🍃' }, { word: 'BATANG', clue: 'Menopang tumbuhan dan mengangkut zat', emoji: '🌳' }, { word: 'BUNGA', clue: 'Alat perkembangbiakan generatif', emoji: '🌸' }, { word: 'BIJI', clue: 'Calon tumbuhan baru', emoji: '🫘' }, { word: 'KLOROFIL', clue: 'Zat hijau daun', emoji: '🟢' }] };
    if (t === 'sequences') return { meta: meta, sequences: [{ title: 'Proses fotosintesis', steps: ['Akar menyerap air dari tanah', 'Air naik melalui batang menuju daun', 'Daun menangkap cahaya matahari dengan klorofil', 'Daun mengolah air dan karbon dioksida menjadi gula', 'Oksigen dilepaskan ke udara'] }, { title: 'Perkecambahan biji', steps: ['Biji menyerap air', 'Kulit biji pecah', 'Akar muncul menembus tanah', 'Batang dan daun pertama tumbuh'] }] };
    if (t === 'statements') return { meta: meta, statements: [
      { text: 'Akar menyerap air dan zat hara dari tanah.', benar: true, explain: 'Itulah fungsi utama akar.', emoji: '🌱' }, { text: 'Fotosintesis terjadi di akar.', benar: false, explain: 'Fotosintesis terjadi di daun yang memiliki klorofil.', emoji: '🌿' },
      { text: 'Daun yang hijau mengandung klorofil.', benar: true, explain: 'Klorofil memberi warna hijau pada daun.', emoji: '🍃' }, { text: 'Tumbuhan menghasilkan oksigen saat fotosintesis.', benar: true, explain: 'Oksigen adalah hasil sampingan fotosintesis.', emoji: '🫧' },
      { text: 'Batang hanya berfungsi menyerap sinar matahari.', benar: false, explain: 'Batang menopang tumbuhan dan mengangkut air serta zat makanan.', emoji: '🌳' }, { text: 'Bunga adalah alat perkembangbiakan generatif.', benar: true, explain: 'Dari bunga terbentuk buah dan biji.', emoji: '🌸' },
      { text: 'Tumbuhan membuat makanan tanpa membutuhkan cahaya matahari.', benar: false, explain: 'Cahaya matahari dibutuhkan untuk fotosintesis.', emoji: '☀️' }, { text: 'Biji dapat tumbuh menjadi tumbuhan baru.', benar: true, explain: 'Biji berkecambah jika air dan suhu cukup.', emoji: '🫘' }] };
    if (t === 'items') return { meta: meta, items: [
      { q: 'Bagian tumbuhan yang menyerap air dari tanah disebut ____.', answer: 'Akar', emoji: '🌱' }, { q: 'Tempat terjadinya fotosintesis adalah ____.', answer: 'Daun', emoji: '🍃' },
      { q: 'Zat hijau daun disebut ____.', answer: 'Klorofil', emoji: '🟢' }, { q: 'Gas yang dilepaskan saat fotosintesis adalah ____.', answer: 'Oksigen', accept: ['O2'], emoji: '🫧' },
      { q: 'Alat perkembangbiakan generatif tumbuhan adalah ____.', answer: 'Bunga', emoji: '🌸' }, { q: 'Biji yang mulai tumbuh disebut ____.', answer: 'Kecambah', accept: ['Tunas'], emoji: '🌿' }] };
    if (t === 'groups') return { meta: meta, groups: [{ name: 'Akar', items: ['Menyerap air', 'Menyerap zat hara', 'Menahan tanah'] }, { name: 'Daun', items: ['Tempat fotosintesis', 'Menguapkan air', 'Menghasilkan oksigen'] }, { name: 'Batang', items: ['Menopang tumbuhan', 'Mengangkut air', 'Mengangkut zat makanan'] }] };
    if (t === 'problems') return { meta: { judul: 'Hitung Cepat Kebun Sekolah', mapel: 'Matematika', topik: 'Operasi hitung', fase: 'B' }, problems: [{ q: '3 pot × 4 tanaman = ?', answer: 12, emoji: '🪴' }, { q: '20 − 7 = ?', answer: 13 }, { q: '15 + 28 = ?', answer: 43 }, { q: '6 × 7 = ?', answer: 42 }, { q: '81 ÷ 9 = ?', answer: 9 }, { q: '100 − 36 = ?', answer: 64 }] };
    if (t === 'cards') return { meta: meta, cards: [{ front: 'Akar', back: 'Menyerap air dan zat hara dari tanah serta menahan tumbuhan', emoji: '🌱' }, { front: 'Batang', back: 'Menopang tumbuhan dan mengangkut air serta zat makanan', emoji: '🌳' }, { front: 'Daun', back: 'Tempat fotosintesis dan penguapan', emoji: '🍃' }, { front: 'Bunga', back: 'Alat perkembangbiakan generatif', emoji: '🌸' }, { front: 'Buah', back: 'Melindungi biji dan membantu penyebarannya', emoji: '🍎' }, { front: 'Biji', back: 'Calon tumbuhan baru', emoji: '🫘' }] };
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
    return { prinsip: ['Berkesadaran: siswa tahu apa yang sedang dipelajari dan mengapa', 'Bermakna: soal dikaitkan dengan konteks nyata', 'Menggembirakan: tantangan, poin, dan umpan balik yang memotivasi'],
      pengalaman: m.asesmen === 'sumatif' ? ['Memahami', 'Mengaplikasi'] : ['Memahami', 'Mengaplikasi', 'Merefleksi'], dimensi: info.dimensi.slice() };
  }
  function ringkasUnsur(u) { return 'Prinsip: Berkesadaran, Bermakna, Menggembirakan. Pengalaman belajar: ' + u.pengalaman.join(', ') + '. Dimensi profil: ' + u.dimensi.join(', ') + '.'; }

  /* ---------- pembuat prompt ---------- */
  function jumlahButir(engine, m) {
    var c = ENGINE_INFO[engine] || ENGINE_INFO.kuis, d = Number(m.durasi) || 15, mn = c.n[0], mx = c.n[1];
    if (c.tipe === 'questions' && m.jenjang === 'SMP') mx = Math.round(mx * 1.5);
    return Math.max(mn, Math.min(mx, Math.round(d * c.n[2])));
  }
  var Q4 = '"answer" = nomor urut pilihan yang benar dimulai dari 0 (0=A, 1=B, 2=C, 3=D). Buat 4 pilihan; pengecoh harus masuk akal.';
  var SKEMA = {
    questions: '{\n  "meta": {"judul": "...", "mapel": "...", "topik": "...", "fase": "B"},\n  "questions": [\n    {"q": "Teks pertanyaan?", "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"], "answer": 1, "explain": "Penjelasan singkat mengapa jawabannya benar.", "emoji": "🌱"}\n  ]\n}\n' + Q4,
    pairs: '{\n  "meta": {"judul": "...", "mapel": "...", "topik": "...", "fase": "A"},\n  "pairs": [\n    {"a": "Istilah / benda", "b": "Pasangan / arti singkat"}\n  ]\n}\nTiap sisi maksimal 5 kata. Tidak ada pasangan ganda, dan setiap "b" harus hanya cocok dengan satu "a".',
    sequences: '{\n  "meta": {"judul": "...", "mapel": "...", "topik": "...", "fase": "C"},\n  "sequences": [\n    {"title": "Nama proses", "steps": ["Langkah 1 (urutan benar)", "Langkah 2", "Langkah 3", "Langkah 4"]}\n  ]\n}\n"steps" ditulis dalam URUTAN YANG BENAR (aplikasi yang mengacaknya). 3–8 langkah per urutan.',
    words: '{\n  "meta": {"judul": "...", "mapel": "...", "topik": "...", "fase": "D"},\n  "words": [\n    {"word": "FOTOSINTESIS", "clue": "Petunjuk singkat tanpa menyebut kata jawabannya", "emoji": "🌿"}\n  ]\n}\n"word" huruf kapital A–Z saja, tanpa spasi/angka/tanda baca. Istilah dua kata digabung (mis. RANTAIMAKANAN).',
    statements: '{\n  "meta": {"judul": "...", "mapel": "...", "topik": "...", "fase": "B"},\n  "statements": [\n    {"text": "Pernyataan yang jelas benar atau salah.", "benar": true, "explain": "Penjelasan singkat.", "emoji": "🌱"}\n  ]\n}\n"benar" harus true atau false. Seimbangkan: kira-kira separuh benar, separuh salah. Hindari pernyataan ambigu.',
    items: '{\n  "meta": {"judul": "...", "mapel": "...", "topik": "...", "fase": "B"},\n  "items": [\n    {"q": "Bagian tumbuhan yang menyerap air disebut ____.", "answer": "Akar", "accept": ["akar tunggang"], "explain": "Penjelasan singkat.", "emoji": "🌱"}\n  ]\n}\n"answer" harus SATU kata atau frasa pendek (maks. 3 kata). "accept" berisi sinonim/ejaan lain yang juga benar (boleh kosong).',
    groups: '{\n  "meta": {"judul": "...", "mapel": "...", "topik": "...", "fase": "C"},\n  "groups": [\n    {"name": "Nama kelompok 1", "items": ["item a", "item b", "item c"]},\n    {"name": "Nama kelompok 2", "items": ["item d", "item e", "item f"]}\n  ]\n}\nBuat 2–4 kelompok, masing-masing 3–5 item pendek. Pastikan tiap item hanya cocok di SATU kelompok. Total item maksimal 20.',
    problems: '{\n  "meta": {"judul": "...", "mapel": "...", "topik": "...", "fase": "B"},\n  "problems": [\n    {"q": "12 × 4 = ?", "answer": 48, "emoji": "🪴"}\n  ]\n}\n"answer" berupa ANGKA (gunakan titik untuk desimal). Soal singkat, dapat dijawab di luar kepala atau dengan coretan.',
    cards: '{\n  "meta": {"judul": "...", "mapel": "...", "topik": "...", "fase": "A"},\n  "cards": [\n    {"front": "Istilah / pertanyaan singkat", "back": "Arti / jawaban singkat", "emoji": "🌱"}\n  ]\n}\nSisi depan maksimal 6 kata, sisi belakang maksimal 25 kata.'
  };
  var CATATAN = { duel: 'Pertanyaan harus singkat (maks. 18 kata) karena dijawab dengan berebut cepat; hindari soal hitungan panjang.', labirin: 'Urutkan dari mudah ke sulit.', pesawat: 'Pilihan jawaban sangat pendek (maks. 3 kata) karena tampil di balok kecil.', balon: 'Pilihan jawaban sangat pendek (maks. 3 kata) karena tampil di dalam balon.', tikus: 'Pilihan jawaban sangat pendek (maks. 3 kata).', katak: 'Pilihan jawaban sangat pendek (maks. 3 kata).', carikata: 'Kata maksimal 10 huruf; hindari kata yang terlalu mirip satu sama lain.', gantung: 'Pilih kata 4–10 huruf yang umum dikenal siswa.', anagram: 'Pilih kata 4–10 huruf; petunjuk harus cukup jelas agar bisa ditebak.', tts: 'Pilih kata yang memiliki huruf-huruf bersama agar bisa saling bersilangan.', hitung: 'Sesuaikan tingkat bilangan dengan kelas: SD kelas bawah 1–100, kelas atas hingga ribuan/pecahan sederhana, SMP boleh bilangan bulat negatif.', kelompok: 'Isi item harus konkret dan tidak ambigu.', kartukilat: 'Cocok untuk istilah dan definisi.' };
  function buatPrompt(m) {
    var info = ENGINE_INFO[m.engine] || ENGINE_INFO.kuis, n = jumlahButir(m.engine, m), u = m.unsur || susunUnsur(m), tipe = info.tipe;
    var sat = tipe === 'groups' ? 'item (total, dibagi ke 2–4 kelompok)' : info.sat;
    var tkt = { mudah: 'Mudah (pengingatan & pemahaman dasar)', sedang: 'Sedang (pemahaman & penerapan sederhana)', bertingkat: 'Bertingkat (campuran mudah ke sulit, termasuk penalaran)' }[m.tingkat] || 'Sedang';
    var sd = m.jenjang === 'SD';
    var gaya = sd ? ['Kalimat pendek (maks. 15 kata) dengan kosakata sederhana sesuai kelas ' + m.kelas + '.', 'Beri "emoji" tematik yang relevan pada tiap butir sebagai gambar bantu (satu emoji saja).', 'Gunakan konteks akrab anak: rumah, sekolah, kebun, pasar, sawah, hewan peliharaan, jajanan.', 'Pilihan jawaban singkat (maks. 4 kata).']
      : ['Kalimat jelas (maks. 25 kata); istilah ilmiah boleh dipakai bila dijelaskan konteksnya.', 'Sertakan sebagian butir bernalar (menerapkan/menganalisis), bukan hanya hafalan.', 'Emoji boleh dipakai seperlunya pada "emoji" untuk memberi petunjuk visual.', 'Gunakan konteks nyata remaja: lingkungan, teknologi, kesehatan, olahraga, media sosial yang aman.'];
    return [
      '# PERINTAH PEMBUATAN KONTEN GAME PEMBELAJARAN — ' + info.nama.toUpperCase(),
      '# Format baku Kurikulum Merdeka Fase ' + m.fase,
      '',
      'Peran: Anda adalah perancang asesmen dan gamifikasi pembelajaran Kurikulum Merdeka untuk guru di Indonesia, sekaligus perancang pengalaman bermain anak ' + (sd ? 'SD' : 'SMP') + ' yang seru.',
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
      '## JENIS GAME & TAMPILAN INTERAKTIF',
      '- Jenis game: ' + info.nama + ' (mekanik seperti game edukasi populer di internet).',
      '- Tampilan yang dirender aplikasi: ' + info.tampil,
      '- Tugas Anda hanya mengisi KONTEN (JSON) yang membuat tampilan itu hidup dan menarik; aplikasi yang membuat animasi, suara, poin, dan papan permainannya.',
      '',
      '## SPESIFIKASI KONTEN',
      '- Buat tepat ' + n + ' ' + sat + '.',
      '- ' + gaya.join('\n- '),
      '- Pastikan seluruh fakta akurat dan sesuai kurikulum. Jika ragu, pilih fakta yang paling umum diajarkan.',
      '- Variasikan bentuk butir agar permainan tidak monoton, dan buat penjelasan ("explain") yang mendidik dan ramah.',
      CATATAN[m.engine] ? '- ' + CATATAN[m.engine] : '',
      '',
      '## FORMAT KELUARAN (WAJIB)',
      'Keluarkan HANYA satu objek JSON valid — tanpa penjelasan, tanpa komentar, tanpa teks pembuka/penutup. Boleh dibungkus ```json ... ```.',
      'Struktur:',
      SKEMA[tipe]
    ].filter(function (x, i, a) { return x !== '' || a[i - 1] !== ''; }).join('\n');
  }

  function daftarKelasSiswa(m) {
    var out = [], base = String(m.kelas || '').replace(/[^0-9]/g, '');
    if (base) ['A', 'B', 'C', 'D'].forEach(function (h) { out.push('Kelas ' + base + h); });
    out.push('Kelas lain');
    return out;
  }
  /** Gabungkan templat dari backend dengan katalog bawaan (agar 24 jenis selalu lengkap) */
  function gabungKatalog(dariServer) {
    var by = {}, out = [];
    (dariServer || []).forEach(function (t) { by[t.engine + '|' + t.id] = 1; out.push(t); });
    var engineAda = {}; out.forEach(function (t) { engineAda[t.engine] = 1; });
    CATALOG.forEach(function (c) {
      if (engineAda[c.engine]) return;
      out.push({ id: c.id, nama: c.nama, engine: c.engine, deskripsi: c.deskripsi, fase: c.fase, mode: c.mode, durasiMin: c.dmin, durasiMaks: c.dmax, ikon: c.ikon, warna: c.warna, gambar: [], status: 'aktif', urutan: Number(c.id.slice(-2)), aturan: {} });
    });
    return out.sort(function (a, b) { return (a.urutan || 99) - (b.urutan || 99); });
  }

  if (window.Art && Art.setEmoji) { var em = {}; CATALOG.forEach(function (x) { em[x.engine] = x.emoji; }); Art.setEmoji(em); }
  window.Content = { KELAS: KELAS, MAPEL: MAPEL, KATEGORI: KATEGORI, CATALOG: CATALOG, ENGINE_INFO: ENGINE_INFO, TIPE: TIPE, parseAI: parseAI, konten: konten, jumlahItem: jumlahItem, contoh: contoh,
    susunTP: susunTP, susunUnsur: susunUnsur, ringkasUnsur: ringkasUnsur, buatPrompt: buatPrompt, jumlahButir: jumlahButir, daftarKelasSiswa: daftarKelasSiswa,
    nilai: nilai, sembunyi: sembunyi, bisaDisembunyi: bisaDisembunyi, sama: sama, normJ: normJ, gabungKatalog: gabungKatalog };
})();
