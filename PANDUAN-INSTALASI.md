# Panduan Instalasi — EduGame AI (v1.2)

> ## Sudah memasang versi sebelumnya? Perbarui dengan langkah ini (±10 menit)
> 1. **Backend:** buka proyek Apps Script → ganti seluruh isi berkas `Kode` dengan `Kode.gs` yang baru → **Save**.
> 2. Pilih fungsi **`setupAppEnvironment`** → **Run**. Aman diulang: menambah sheet `GameHtml`, empat kolom baru di sheet `Permainan` (sekolah, nama guru, bentuk soal, sumber), dan templat yang belum ada (total 24). Data dan rahasia Anda tidak dihapus.
> 3. *(disarankan)* Jalankan **`nyalakanKeepWarm`** sekali agar server tetap hangat dan login terasa cepat.
> 4. **Deploy → Manage deployments → ikon pensil → Version: New version → Deploy.** URL `/exec` tidak berubah.
> 5. **Frontend:** ekstrak `edugame-frontend.zip`, **salin `js/config.js` lama Anda** (yang berisi `GAS_URL`) menimpa `js/config.js` baru, lalu dari folder itu: `git add .` → `git commit -m "v1.2"` → `git push`.
> 6. Buka situs, tekan **Ctrl+F5**, lalu coba **Buat Game Baru**.
>
> **Baru di v1.2:** prompt AI yang membuat **game langsung jadi** (bukan JSON) + **papan peringkat** seluruh siswa pada kode yang sama • musik latar berbeda untuk tiap game + latar bertema + maskot & combo • kolom **nama sekolah & guru** • pilihan **bentuk soal** (singkat / narasi-analisis).

Aplikasi ini terdiri dari **dua bagian** yang dipasang terpisah:

| Bagian | Isi | Dipasang di |
|---|---|---|
| **Backend** | `Kode.gs` + `appsscript.json` | Google Apps Script (akun Google Anda) |
| **Frontend** | folder ini (`index.html`, `css/`, `js/`) | GitHub Pages |

Urutannya: **A. Backend → B. Hubungkan → C. Frontend ke GitHub Pages → D. Aktifkan login & AI**.
Total waktu sekitar 30–45 menit untuk pemula.

> Ingin mencoba tampilan dulu tanpa memasang apa pun? Buka `index.html` lewat server lokal atau GitHub Pages **sebelum** mengisi `GAS_URL`. Aplikasi otomatis masuk **MODE DEMO** (data hanya di browser). Mode demo tidak membagikan data antar perangkat.

---

## A. Pasang Backend (Google Apps Script)

1. Buka <https://script.google.com> dan masuk dengan akun Google yang akan menjadi pemilik data.
2. Klik **Proyek baru**. Ubah nama proyek menjadi `EduGame AI`.
3. Ganti seluruh isi berkas `Code.gs` dengan isi berkas **`Kode.gs`** yang Anda unduh (salin–tempel). Ubah nama berkas menjadi `Kode`.
4. Buka **Project Settings (ikon roda gigi)** → centang **Show "appsscript.json" manifest file in editor**. Kembali ke editor, buka `appsscript.json`, ganti isinya dengan berkas **`appsscript.json`** yang diunduh. Simpan (Ctrl+S).
5. Di dropdown fungsi (atas editor) pilih **`setupAppEnvironment`**, lalu klik **Run**.
   - Saat diminta izin: **Review permissions → pilih akun → Advanced → Go to EduGame AI (unsafe) → Allow**. (Peringatan ini normal untuk skrip pribadi Anda.)
6. Buka **Execution log**. Anda akan melihat:
   - alamat **spreadsheet database** dan **folder Drive** yang dibuat otomatis;
   - **AKSES DARURAT**: `Nama pengguna: darurat` dan `Kata sandi: …`.
   - ⚠️ **Catat kata sandi darurat sekarang.** Hanya tampil sekali. Bila hilang, jalankan fungsi `resetAksesDarurat`.
7. Klik **Deploy → New deployment** → ikon roda gigi **Select type → Web app**:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
   - Klik **Deploy**, lalu **salin URL Web app** (berakhiran `/exec`).

Menjalankan `setupAppEnvironment` lagi aman: tidak menghapus data dan tidak menimpa rahasia.

---

## B. Hubungkan Frontend ke Backend

Buka berkas `js/config.js` di folder frontend dengan Notepad/VS Code:

```js
GAS_URL: 'https://script.google.com/macros/s/ID_DEPLOYMENT_ANDA/exec',
WA_NOMOR: '6281234567890',   // opsional; bisa juga diisi nanti dari Admin
```

Simpan berkas. **Jangan** menaruh API key, sandi, atau token apa pun di berkas ini — berkas ini publik.

---

## C. Pasang Frontend ke GitHub Pages

> ⚠️ Gunakan **terminal**, bukan tombol "Upload files" di web GitHub. Upload web meratakan folder sehingga `css/` dan `js/` hilang dan tampilan rusak (404).

### C1. Siapkan alat dan akun (sekali saja)
1. Pasang **Git**: <https://git-scm.com/downloads>
2. Buat akun di <https://github.com>.
3. Di GitHub: klik **+ → New repository**, nama misalnya `edugame-ai`, pilih **Public**, **jangan** centang README/gitignore, klik **Create repository**.
4. Buat **Personal Access Token** (pengganti sandi saat push): GitHub → **Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token**, centang `repo`, simpan token-nya.

### C2. Masuk ke folder yang benar — BAGIAN PALING PENTING
Ekstrak `edugame-frontend.zip`. **Folder hasil ekstraksi itulah yang di-`git init`** (tidak ada folder pembungkus).

Buka terminal (Windows: PowerShell; Mac: Terminal), masuk ke folder hasil ekstraksi, lalu cek isinya:

```bash
ls            # Windows PowerShell: dir
```

Yang harus terlihat **di baris teratas**: `index.html`, folder `css`, folder `js`. Jika yang terlihat justru folder `frontend` atau `backend`, Anda satu level terlalu tinggi — masuk satu folder lagi **sebelum** lanjut.

### C3. Kirim ke GitHub
Ganti `USERNAME` dengan nama pengguna GitHub Anda:

```bash
git init
git add .
git commit -m "EduGame AI pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/edugame-ai.git
git push -u origin main
```

Saat diminta: **Username** = nama pengguna GitHub, **Password** = *token* dari langkah C1 (bukan sandi akun).

Buka repo di browser dan pastikan `index.html` terlihat **di root**, bersama folder `css/` dan `js/`.

### C4. Aktifkan Pages
GitHub → repo → **Settings → Pages** → **Source: Deploy from a branch** → Branch **main**, folder **/ (root)** → **Save**. Tunggu 1–3 menit; alamat situs: `https://USERNAME.github.io/edugame-ai/`.

### C5. Memperbarui nanti
Setelah mengubah berkas:
```bash
git add .
git commit -m "pembaruan"
git push
```

---

## D. Aktifkan Login Google, AI, dan WhatsApp

1. Buka situs Anda → **Masuk Guru → Akses darurat pengelola** → masuk dengan `darurat` + kata sandi dari langkah A6.
2. Buka **Admin → Pengaturan & Rahasia**.

### D1. Login Google (disarankan; guru tidak perlu sandi)
1. Buka <https://console.cloud.google.com> → buat proyek → **APIs & Services → OAuth consent screen** (External, isi nama aplikasi & email).
2. **Credentials → Create credentials → OAuth client ID → Web application**.
3. **Authorized JavaScript origins**: `https://USERNAME.github.io` (tanpa garis miring di akhir).
4. Salin **Client ID** (berakhiran `.apps.googleusercontent.com`) → tempel di **Admin → Pengaturan → Google OAuth Client ID → Simpan**.
5. **Pengguna Google pertama** yang masuk (bila belum ada admin) otomatis menjadi **admin**. Guru berikutnya menjadi **guru**. Admin dapat mengubah peran di **Admin → Data Guru**.

### D2. Tombol "Buat Game Langsung" (AI otomatis, opsional)
1. Dapatkan API key Gemini di <https://aistudio.google.com/apikey>.
2. Tempel di **Admin → Pengaturan → Gemini API Key → Simpan**. Kunci disimpan di *Script Properties* dan **tidak pernah** dikirim ke browser.
3. **Biarkan kotak Model Gemini kosong.** Mulai v1.1, aplikasi mencari sendiri model Gemini *flash* terbaru yang tersedia untuk kunci Anda. Isi hanya jika Anda ingin memaksa model tertentu.
4. Klik **Tes koneksi AI** di halaman yang sama. Hasilnya menampilkan model yang dipakai, atau pesan galat asli dari Google bila gagal.
5. Batas bawaan 30 pembuatan/guru/hari (ubah lewat Script Property `AI_BATAS_HARIAN`).

Tanpa kunci ini, guru tetap bisa memakai **Salin Prompt → tempel ke AI favorit → impor hasilnya**.

### D3. WhatsApp mengambang
Isi nomor di **Admin → Pengaturan → Nomor WhatsApp** (format `6281234567890`). Tombol hijau muncul di pojok kanan bawah.

### D4. Gambar slideshow katalog
Secara bawaan kartu memakai ilustrasi bawaan (3 gambar bergantian otomatis). Untuk foto sendiri: **Admin → Ubah templat → Gambar slideshow** (URL `https://…`, satu per baris, maksimal 6).

---

### D5. Login Google tetap terasa lambat?
- Jalankan `nyalakanKeepWarm` (lihat kotak pembaruan di atas). Tanpa itu, permintaan pertama setelah server lama tidak dipakai bisa memerlukan beberapa detik (cold start Apps Script); ini perilaku bawaan Google.
- Mulai v1.1, guru yang sudah terdaftar masuk lewat jalur cepat (tanpa membaca spreadsheet), dan tombol Google muncul tanpa menunggu server.
- Pastikan guru memilih akun di jendela Google satu kali saja; tombol dinonaktifkan sementara saat verifikasi berlangsung.

### D6. Cara memakai prompt "Game langsung jadi" (disarankan)
1. **Buat Game Baru** → isi identitas (termasuk **nama sekolah & guru**) → pilih game → atur **bentuk soal** (singkat / narasi-analisis) → **Salin Prompt untuk AI**.
2. Di halaman prompt, tab **🎮 Game langsung jadi** sudah aktif. Klik **Salin Seluruh Prompt**.
3. Tempel ke ChatGPT / Gemini / Claude lalu tekan **Enter**. AI membuat **satu berkas HTML = game utuh**, bukan JSON. Banyak AI menampilkan pratinjau yang bisa langsung dimainkan (mis. fitur Canvas atau Artifacts bila tersedia di akun Anda); nama dan ketersediaan fitur ini dapat berbeda antar AI dan antar waktu.
4. Belum puas? Minta AI memperbaiki ("buat lebih meriah", "perbaiki bug ..."). Prompt sudah memuat aturan agar tetap kompatibel.
5. Salin **seluruh balasan** (boleh beserta blok ```html) → tempel di kotak "Sudah punya game dari AI?" (atau unggah `.html`) → **Uji Coba** → **Terbitkan Game**.
6. Bagikan **kode / QR**. Siswa memasukkan nama, bermain, dan nilai langsung masuk **Rekap Nilai**. Di akhir, semua siswa melihat **Papan Peringkat** seluruh peserta kode itu.
- **Tidak punya waktu / AI gagal?** Tombol **Muat contoh game** mengisi kotak dengan contoh game yang sudah benar untuk melihat hasil yang diharapkan.
- Tab **📋 Format data (JSON)** tetap ada untuk memakai 24 mesin bawaan; dan tombol **Buat Game Langsung** (Gemini) bekerja di balik layar tanpa Anda melihat JSON.

## E. Daftar Uji Cepat
- [ ] Beranda terbuka, slideshow hero bergerak, kartu templat bergantian gambar.
- [ ] Masuk (Google/darurat) berhasil → Dashboard tampil.
- [ ] **Buat Game Baru** → **Salin Prompt** → tempel balasan AI → game terbuat → muncul kode.
- [ ] Buka kode di ponsel (`#/main/KODE`) → bermain sampai selesai.
- [ ] **Rekap Nilai** menampilkan hasil (±20 detik) → unduh Excel/PDF.

## F. Mengubah Backend Nanti
Setelah mengedit `Kode.gs`: **Deploy → Manage deployments → ikon pensil → Version: New version → Deploy**. URL `/exec` tidak berubah.

## G. Pemecahan Masalah

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| Situs 404 di GitHub Pages | `index.html` tidak di root repo | Buka repo di browser: jika root berisi `frontend/`, ulangi C2–C3 dari folder yang benar (`git push --force` aman untuk repo baru yang salah) |
| Tampilan polos tanpa gaya | `css/` `js/` rata di root (upload via web) | Ulangi C2–C3 via terminal |
| Banner "MODE DEMO" muncul | `GAS_URL` belum diisi | Isi `js/config.js` (langkah B) lalu push |
| "Tidak dapat terhubung ke server" | Deployment bukan *Anyone*, URL salah, atau pertama kali lambat | Pastikan *Who has access = Anyone*; salin ulang URL `/exec`; coba lagi (cold start bisa beberapa detik) |
| Tombol Google tidak muncul | Client ID belum diisi atau origin belum didaftarkan | Langkah D1; pastikan origin persis `https://USERNAME.github.io` |
| "Pembuatan otomatis belum aktif" | Gemini key belum diisi | Langkah D2 atau pakai Salin Prompt |
| Setelah ubah kode, perilaku lama | Belum deploy versi baru | Bagian F |
| QR / Excel / PDF tidak muncul | Pustaka CDN diblokir jaringan | Cek koneksi; Excel otomatis jatuh ke CSV |
| Lupa kata sandi darurat | — | Jalankan `resetAksesDarurat` di editor Apps Script |
| Game HTML tampil kosong / tidak bisa diklik | Kode terpotong saat disalin, atau memakai pustaka/gambar dari internet | Salin ulang dari `<!DOCTYPE html>` sampai `</html>`; minta AI: "buat versi mandiri tanpa sumber eksternal" |
| Nilai siswa tidak masuk dari game HTML | Game tidak memanggil `EduGame.finish(...)` | Minta AI menambahkannya (aplikasi memberi peringatan saat Anda menempel kodenya) |
| Peringkat belum menampilkan siswa terbaru | Cache peringkat 15 detik | Klik **Muat ulang peringkat** |

## H. Batasan yang Perlu Diketahui
- **24 mesin permainan** tersedia: kuis kilat, teka-teki silang, kartu memori, duel tim, susun balok, labirin, benar/salah, jodohkan, anagram, tebak kata (gantung), cari kata, isi titik-titik, kelompokkan, pecahkan balon, pukul tikus, roda putar, kotak misteri, pesawat, katak loncat, roket, balap mobil, ular tangga, hitung cepat, dan kartu kilat. Templat tambahan di Admin memetakan nama/gambar ke salah satu mesin ini.
- **Dua cara membuat game:** (1) *Game langsung jadi* — AI menulis game HTML utuh yang dijalankan di kotak aman (iframe sandbox, tanpa internet); kualitas dan bug bergantung pada AI yang dipakai, jadi selalu **Uji Coba** sebelum menerbitkan. (2) *Mesin bawaan* — AI/Gemini hanya mengisi data, game dirender oleh 24 mesin aplikasi yang sudah diuji.
- Skor game HTML dan banyak jenis game bawaan dilaporkan dari perangkat siswa (bisa dimanipulasi siswa yang mahir teknis); gunakan untuk latihan/formatif. Hanya game berbasis soal, benar/salah, isian, dan hitung yang dinilai ulang oleh server.
- Satu berkas game HTML maksimal ±350.000 karakter; penyimpanan memakai sheet `GameHtml` (dipotong per 45.000 karakter).
- Peringkat memakai skor terbaik tiap siswa (nama + kelas) pada kode yang sama; skor sama → yang lebih cepat di atas. Siswa dengan nama berbeda ejaan dihitung berbeda.
- Musik latar dibuat prosedural di browser (tanpa berkas audio) dan berbeda untuk tiap game; ada tombol 🎵/🔊 untuk mematikannya. Browser baru mengizinkan suara setelah siswa menekan tombol Mulai.
- Pada asesmen **sumatif**, kunci jawaban disembunyikan dari siswa dan skor dihitung ulang server untuk semua game berbasis soal, benar/salah, isian, dan hitung. Game lain (memori, kata, urutan, kelompok, dll.) menilai di sisi siswa sehingga lebih cocok untuk formatif. **Duel** juga dinilai di sisi layar bersama.
- **Kartu Kilat** adalah penilaian mandiri siswa (jujur-jujuran), bukan skor objektif.
- Siswa tanpa login: nama bisa diisi siapa pun. Gunakan sebagai alat belajar, bukan bukti identitas.
- Kuota Apps Script harian berlaku (siswa banyak serentak ditangani lewat antrean kunci dan pengiriman ulang otomatis di sisi siswa).
