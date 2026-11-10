/* ============================================================
   EduGame AI — konfigurasi frontend
   HANYA nilai publik di sini. Rahasia (API key, token) TIDAK PERNAH
   boleh ditaruh di berkas ini — simpan di Script Properties (backend).
   ============================================================ */
window.APP_CONFIG = {
  // Tempel URL Web App Apps Script (berakhiran /exec) di bawah ini.
  // Selama masih berisi GANTI_..., aplikasi berjalan dalam MODE DEMO (data di browser saja).
  GAS_URL: 'https://script.google.com/macros/s/AKfycby1r_5okXcduXBI315t2pyVPdfO02JGdphCQuqabWI5C6-tX2qXiiktYZZFbGXSRJ2fIA/exec',

  // Nomor WhatsApp untuk tombol chat mengambang (format internasional tanpa +).
  // Admin juga bisa mengubahnya dari Admin > Pengaturan (menimpa nilai ini).
  WA_NOMOR: '6281371164131',
  WA_PESAN: 'Halo Ms Zulfa, saya ingin bertanya tentang pembuatan game pembelajaran di EduGame AI.',

  // Interval otomatis slideshow (milidetik)
  SLIDE_HERO_MS: 6000,
  SLIDE_KARTU_MS: 3200
};
