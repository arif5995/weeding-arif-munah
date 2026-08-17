# Planning: Update Lokasi Maps & Verifikasi Auto-Scroll Wishes

> **Dikerjakan oleh**: Junior developer / AI coding assistant gratis.
> **Prinsip**: Task 1 murni ganti data (bukan kode), Task 2 murni verifikasi+tuning (fiturnya sudah ada di kode, cek kenapa belum "kerasa" jalan).

---

## TASK 1 — Arahkan Location & "View Map" ke Lokasi yang Benar

### 0. Info Lokasi (Sudah Di-resolve dari Link Kamu)

Link `https://maps.app.goo.gl/EZKBfxrbutNNCLnq6` mengarah ke koordinat:
```
Latitude:  -7.5917916
Longitude: 112.7671249
```

> ⚠️ **Catatan**: nama tempat yang terdaftar di pin itu adalah *"Jasa pengetikan, desain dan pembuatan aplikasi mobile dan web MAHA"* — kelihatannya ini pin lokasi rumah/kantor, bukan nama venue pernikahan. **Sesuaikan `location` (nama tempat) dan `address` (alamat teks) secara manual** dengan nama venue yang sebenarnya — jangan pakai nama itu apa adanya. Koordinatnya tetap dipakai (itu yang menentukan titik di peta), cuma teks nama tempatnya yang perlu diganti.

### 1.1. Kenapa Ini Task Data, Bukan Kode

Cek `src/features/location/components/location.jsx` — komponen ini **sudah** pakai 2 field dari config buat nampilin map:
```jsx
<iframe src={config.maps_embed} ... />   // <- peta yang ke-embed di halaman
...
<motion.a href={config.maps_url} ...>    // <- tombol "View Map"
```
Kedua-duanya baca dari `config` (data undangan). Jadi **cukup update isi datanya**, kode tidak perlu diubah sama sekali.

### 1.2. Siapkan Nilai Baru

**`maps_url`** (dipakai tombol "View Map" — boleh pakai link pendek apa adanya):
```
https://maps.app.goo.gl/EZKBfxrbutNNCLnq6
```

**`maps_embed`** (dipakai `<iframe>` buat nampilin peta langsung di halaman — format ini **tidak butuh API key Google**, tinggal pakai koordinat):
```
https://www.google.com/maps?q=-7.5917916,112.7671249&z=17&output=embed
```

> Kalau nanti mau ganti ke lokasi lain, cukup ganti 2 angka setelah `q=` (format: `latitude,longitude`), angka `z=17` itu level zoom (boleh diubah 1–20, makin besar makin dekat/zoom-in).

### 1.3. Update Data — Pilih Sesuai Sumber Data Kamu

**Kalau data undangan kamu dari Supabase (database):**

Jalankan lewat `psql` atau Supabase SQL Editor (ganti `test-wedding` sesuai `uid` undangan kamu):
```sql
UPDATE invitations
SET
  maps_url = 'https://maps.app.goo.gl/EZKBfxrbutNNCLnq6',
  maps_embed = 'https://www.google.com/maps?q=-7.5917916,112.7671249&z=17&output=embed',
  location = 'Nama Venue Kamu',           -- GANTI sesuai nama venue asli
  address = 'Alamat lengkap venue kamu'   -- GANTI sesuai alamat asli
WHERE uid = 'test-wedding';
```

**Kalau masih pakai data statis fallback** (`src/config/config.js`):

Buka file itu, cari baris `maps_url` dan `maps_embed`, ganti jadi:
```js
maps_url: "https://maps.app.goo.gl/EZKBfxrbutNNCLnq6",
maps_embed:
  "https://www.google.com/maps?q=-7.5917916,112.7671249&z=17&output=embed",
location: "Nama Venue Kamu",       // GANTI
address: "Alamat lengkap venue",   // GANTI
```

### 1.4. Verifikasi

1. Refresh browser, scroll ke section **Location**.
2. Peta yang tampil di `<iframe>` harus nunjukkin titik yang sama persis dengan link Maps yang kamu kasih.
3. Klik tombol **"View Map"** — harus buka tab baru ke `https://maps.app.goo.gl/EZKBfxrbutNNCLnq6`, dan lokasinya sama dengan yang di-embed.
4. Cek nama venue & alamat yang tampil di section itu sudah benar (bukan nama "Jasa pengetikan..." dari pin asli).

**Acceptance criteria Task 1:**
- Peta ter-embed dan tombol "View Map" mengarah ke **titik koordinat yang sama persis**.
- Nama venue & alamat yang tertulis sudah sesuai venue pernikahan asli, bukan nama default dari pin Google Maps.

---

## TASK 2 — Verifikasi & Fine-Tuning Auto-Scroll "Wishes & Prayers"

### 2.0. Fitur Ini Sudah Ada di Kode — Jangan Bikin Ulang

Cek `src/features/wishes/components/wishes.jsx` baris ~260 — list ucapan **sudah** dibungkus komponen `<Marquee>` (`src/components/ui/marquee.jsx`) yang secara otomatis bikin konten geser terus-menerus ke **kiri** pakai animasi CSS (`translateX(0)` → `translateX(-100%)`, didefinisikan di `src/index.css` baris ~57-64).

**Kalau di screenshot/browser kamu keliatannya statis (nggak gerak), kemungkinan penyebabnya salah satu dari 4 hal di bawah** — cek satu-satu, jangan langsung nulis ulang komponennya dari nol.

### 2.1. Kemungkinan 1 — Kartu Ucapan Terlalu Sedikit

`<Marquee repeat={2}>` menduplikasi isi 2x supaya animasinya keliatan menyambung mulus (loop tanpa jeda). Tapi **kalau jumlah ucapan yang di-load cuma 1-2**, total lebar kontennya bisa lebih PENDEK dari lebar layar — akibatnya nggak ada yang perlu di-scroll, browser nggak nampilin gerakan apapun (bukan bug, cuma nggak ada ruang buat bergerak).

**Cara cek**: buka Table Editor Supabase → tabel `wishes` → hitung berapa baris data yang ada untuk `uid` yang kamu buka. Kalau cuma 1-2, itu penyebabnya.
**Fix**: tambah data ucapan dummy buat testing (submit lewat form di halaman, atau insert manual via SQL), minimal 4-5 ucapan, baru animasinya kelihatan jelas geraknya.

### 2.2. Kemungkinan 2 — Durasi Animasi Terlalu Lambat, Kelihatan Seperti Diam

Di `wishes.jsx`, `Marquee` di-set `className={cn("[--duration:60s] ...")}` — artinya **1 putaran penuh butuh 60 detik**. Kalau kamu cuma lihat sekilas (beberapa detik), pergerakannya emang nyaris nggak kerasa karena lambat banget.

**Fix (opsional, sesuai selera)**: percepat durasinya, misal ganti ke 25-30 detik supaya lebih terasa "bergulir" tapi tetap nyaman dibaca:
```jsx
// Cari baris ini di wishes.jsx (sekitar baris 263):
className={cn("[--duration:60s] [--gap:1rem] py-2")}
// Ganti jadi:
className={cn("[--duration:28s] [--gap:1rem] py-2")}
```
> Jangan diset terlalu cepat (di bawah 15 detik) — teks ucapan jadi susah kebaca kalau geraknya kebut-kebutan.

### 2.3. Kemungkinan 3 — `prefers-reduced-motion` Aktif di Sistem/Browser Kamu

Kalau setting aksesibilitas "reduce motion" aktif di OS/browser kamu (sengaja atau nggak sadar ke-enable), animasi CSS murni seperti marquee ini **tidak otomatis berhenti** (beda dengan animasi `motion/react` di komponen lain yang sudah ada logic `useReducedMotionFlag()`) — jadi ini kemungkinan kecil, tapi kalau sebaliknya (animasinya jalan padahal reduce-motion aktif), itu perlu di-fix juga untuk aksesibilitas.

**Tambahkan ini** ke `src/index.css`, di luar blok `@theme inline` (taruh di bagian bawah file, dekat CSS lain yang bukan theme token):
```css
@media (prefers-reduced-motion: reduce) {
  .animate-marquee,
  .animate-marquee-vertical {
    animation: none;
  }
}
```
Ini memastikan marquee berhenti otomatis untuk user yang butuh reduce-motion, tanpa mempengaruhi user lain.

### 2.4. Kemungkinan 4 — `pauseOnHover` Membuat Kamu Kira Animasinya Mati

`<Marquee pauseOnHover={true}>` artinya **animasi berhenti saat mouse/kursor ada di atas kartu-kartunya**. Kalau kamu lagi nge-screenshot atau nge-inspect elemen (kursor otomatis "nempel" di area itu), animasinya emang sengaja berhenti — ini **fitur, bukan bug**. Coba gerakkan mouse keluar dari area kartu wishes, tunggu beberapa detik, baru animasinya lanjut jalan lagi.

### 2.5. Test Akhir

1. Pastikan ada minimal 4-5 data ucapan (Task 2.1).
2. Refresh browser, scroll ke section Wishes & Prayers.
3. **Jangan taruh kursor di atas kartu-kartunya** (supaya tidak ke-pause).
4. Amati minimal 10-15 detik — kartu-kartu harus terlihat geser pelan ke kiri secara terus-menerus, lalu loop lagi dari awal tanpa "patah"/lompat.

**Acceptance criteria Task 2:**
- Dengan ≥4 data ucapan dan kursor tidak menyentuh area kartu, kartu-kartu wishes terlihat bergeser otomatis ke kiri, loop mulus tanpa jeda/lompatan.
- Hover mouse di atas kartu manapun → animasi pause; mouse keluar area → animasi lanjut lagi.
- Kalau `prefers-reduced-motion` diaktifkan di OS, animasi berhenti total (statis).

---

## Ringkasan Urutan Kerja

```
TASK 1 (Location & Map):
1. Siapkan maps_url + maps_embed dari koordinat yang sudah di-resolve
2. Update via SQL (Supabase) ATAU src/config/config.js (fallback statis)
3. Ganti juga "location" (nama venue) & "address" — JANGAN pakai nama pin asli
4. Verifikasi: peta embed & tombol "View Map" mengarah ke titik yang sama

TASK 2 (Auto-scroll Wishes):
1. Cek jumlah data wishes — tambah dummy data kalau cuma 1-2
2. (Opsional) percepat --duration dari 60s ke ~28s biar lebih terasa
3. Tambahkan CSS prefers-reduced-motion fallback untuk aksesibilitas
4. Test ulang: amati 10-15 detik tanpa hover mouse di kartu
```

## Catatan untuk Eksekutor

- **Jangan tulis ulang komponen Marquee atau logic auto-scroll dari nol** — itu sudah ada dan sudah benar arahnya (ke kiri). Task di sini murni debugging kenapa belum "kerasa", bukan pengembangan fitur baru.
- Kalau setelah semua langkah Task 2 tetap tidak ada pergerakan sama sekali (bukan cuma "kurang berasa"), kemungkinan ada masalah lain di luar dugaan planning ini (misal CSS ke-override komponen lain, atau versi Tailwind config berbeda dari yang diasumsikan) — screenshot hasil inspect element (`animate-marquee` class + computed style `animation`) dan laporkan untuk didiagnosis lebih lanjut.
- Untuk Task 1, koordinat yang saya kasih (`-7.5917916, 112.7671249`) diambil dari resolve otomatis link short URL kamu — **cross-check sendiri sekali lagi** di Google Maps (paste koordinat itu ke search box Maps) untuk mastiin itu benar-benar titik venue pernikahan yang dimaksud, bukan cuma percaya ke hasil resolve otomatis.