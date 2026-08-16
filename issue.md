# Planning: Redesain Tampilan UI Undangan (Landing Page)

> **Target akhir**: Landing page (halaman pembuka sebelum tombol "Buka Undangan") tampil seperti desain referensi — kartu putih/krem dengan dekorasi bunga & daun di 4 sudut, teks Bismillah kaligrafi, nama pasangan pakai font script, dan info tanggal/lokasi rapi di tengah.
> **Dikerjakan oleh**: Junior developer / AI coding assistant gratis (Copilot, Cursor free tier, dll)
> **Prinsip planning ini**: setiap task dipecah sekecil & sekonkret mungkin, dengan path file, nama variabel, dan acceptance criteria yang jelas — supaya tidak butuh keputusan desain mandiri dari eksekutor.

---

## 0. Asset & Bahan yang Sudah Tersedia

Dari struktur folder yang di-screenshot, ini yang **sudah ada**, tidak perlu dibuat ulang:

| Asset | Lokasi | Kegunaan |
|---|---|---|
| `New-Icon-Script.otf` | `public/fonts/New-Icon-Script.otf` | Font script untuk nama pasangan ("Daniel & Marceline") |
| `bismillah.png` | `public/images/bismillah.png` | Kaligrafi Bismillah di bagian atas kartu |
| `flower-white.png` | `public/images/flower-white.png` | Bunga putih dekorasi sudut |
| `leaf-white.png` | `public/images/leaf-white.png` | Daun hijau dekorasi sudut |

Font **Fahkwang** belum ada di repo — akan di-load dari Google Fonts (ada di Google Fonts, gratis, mendukung Latin).

**File kode yang akan disentuh:**
- `index.html` — load font Fahkwang
- `src/index.css` — daftarkan font-face & CSS variable font
- `src/features/invitation/components/landing-page.jsx` — komponen utama yang diubah tampilannya
- (opsional) `src/features/invitation/components/hero.jsx` — kalau ingin konsistensi gaya di halaman utama juga

---

## 1. Analisis Desain Referensi (Baca Dulu Sebelum Coding)

Breakdown elemen dari gambar referensi, urut dari atas ke bawah:

1. **Background**: warna krem/off-white lembut, bukan putih polos.
2. **4 dekorasi sudut** (pakai `flower-white.png` + `leaf-white.png`, di-mirror/rotate dengan CSS, TIDAK perlu bikin 4 gambar terpisah):
   - Kiri atas: daun saja (leaf), memanjang dari sudut ke tengah.
   - Kanan atas: bunga + daun, lebih besar.
   - Kiri bawah: bunga + daun.
   - Kanan bawah: daun saja.
3. **Kaligrafi Bismillah** (`bismillah.png`) — di tengah atas, di bawah dekorasi.
4. **Teks "You Are Invited To The Wedding Of"** — font biasa (Fahkwang), huruf kapital di awal tiap kata, ukuran sedang, warna abu gelap.
5. **Nama pasangan** — font script (`New-Icon-Script.otf`), ukuran besar, di 2 baris terpisah dengan "&" di tengah.
6. **Blok tanggal**:
   - "DECEMBER" — huruf kapital kecil, letter-spacing lebar.
   - Baris tengah: "SATURDAY | 14 | AT 07:00 PM" — angka "14" besar & berwarna hijau tua, diapit garis vertikal tipis warna gold/coklat muda.
   - "2024" di bawahnya.
7. **Alamat** — 2 baris, center, font biasa.
8. *"Reception to follow"* — italic, font script tipis atau serif italic, di paling bawah.

**Prinsip layout**: semua center-aligned, banyak whitespace/jarak vertikal antar section, tidak ada card/border/shadow (beda dari desain lama yang pakai `backdrop-blur` + `border` + `shadow-xl`).

---

## 2. Task Breakdown

### TASK 1 — Setup Font

**1.1. Load font Fahkwang dari Google Fonts**
- Buka `index.html`
- Cari baris `<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif...`
- Tambahkan `Fahkwang` ke query string, jadi:
  ```html
  <link
    href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&family=Fahkwang:wght@300;400;500;600&display=swap"
    rel="stylesheet"
  />
  ```

**1.2. Daftarkan font lokal New-Icon-Script**
- Buka `src/index.css`
- Tambahkan `@font-face` **di atas** blok `@theme inline`:
  ```css
  @font-face {
    font-family: "New Icon Script";
    src: url("/fonts/New-Icon-Script.otf") format("opentype");
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
  ```

**1.3. Tambahkan CSS variable font baru**
- Masih di `src/index.css`, di dalam blok `@theme inline`, tambahkan setelah baris `--font-serif`:
  ```css
  --font-script: "New Icon Script", cursive;
  --font-fahkwang: "Fahkwang", sans-serif;
  ```

**Acceptance criteria Task 1:**
- Buka DevTools → Network tab → pastikan file `New-Icon-Script.otf` dan font Fahkwang ter-load tanpa error 404.
- Class Tailwind `font-script` dan `font-fahkwang` bisa dipakai di komponen (Tailwind v4 otomatis generate utility dari CSS variable `--font-*`).

---

### TASK 2 — Siapkan Dekorasi Sudut (Reusable Component)

Supaya tidak duplikasi kode 4x, buat 1 komponen kecil untuk dekorasi sudut.

**2.1. Buat file baru** `src/features/invitation/components/corner-decoration.jsx`:
```jsx
import { cn } from "@/lib/utils";

// position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
// variant: "leaf-only" | "flower-leaf"
const CornerDecoration = ({ position, variant = "flower-leaf" }) => {
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0 scale-x-[-1]",
    "bottom-left": "bottom-0 left-0 scale-y-[-1]",
    "bottom-right": "bottom-0 right-0 scale-x-[-1] scale-y-[-1]",
  };

  return (
    <div
      className={cn(
        "absolute w-28 sm:w-36 pointer-events-none select-none z-0",
        positionClasses[position],
      )}
    >
      <img
        src="/images/leaf-white.png"
        alt=""
        className={cn("w-full h-auto")}
      />
      {variant === "flower-leaf" && (
        <img
          src="/images/flower-white.png"
          alt=""
          className={cn("w-3/4 h-auto absolute top-0 left-0")}
        />
      )}
    </div>
  );
};

export default CornerDecoration;
```

> **Catatan untuk eksekutor**: posisi/ukuran exact (`w-28`, offset gambar bunga, dll) HARUS disesuaikan sambil lihat hasil di browser — nilai di atas cuma starting point. Bandingkan terus dengan gambar referensi sampai proporsinya mirip.

**Acceptance criteria Task 2:**
- Komponen bisa di-render 4x dengan 4 posisi berbeda tanpa error.
- Gambar tidak pecah/gepeng (`object-contain` atau `h-auto` untuk jaga aspect ratio).

---

### TASK 3 — Redesain `landing-page.jsx`

File: `src/features/invitation/components/landing-page.jsx`

**3.1. Ganti background**
- Cari `bg-gradient-to-b from-white via-rose-50/30 to-white`
- Ganti ke warna krem solid, misalnya `bg-[#faf7f2]` (boleh disesuaikan sampel warna dari gambar referensi pakai color picker).

**3.2. Hapus efek blur/glow lama**
- Hapus 2 `<div>` dekorasi lama yang pakai `bg-rose-100/20 rounded-full blur-3xl` (sudah tidak relevan, diganti dekorasi bunga/daun).

**3.3. Hapus card wrapper (blur/border/shadow)**
- Cari `<div className={cn("backdrop-blur-sm bg-white/50 ... rounded-2xl border border-rose-100/50 shadow-xl")}>`
- Ganti jadi `<div>` polos tanpa card style (konten langsung di atas background, sesuai referensi).

**3.4. Tambahkan 4 `CornerDecoration`**
- Import komponen dari Task 2.
- Taruh tepat di dalam elemen pembungkus utama (`min-h-screen relative overflow-hidden`), sebelum konten:
  ```jsx
  <CornerDecoration position="top-left" variant="leaf-only" />
  <CornerDecoration position="top-right" variant="flower-leaf" />
  <CornerDecoration position="bottom-left" variant="flower-leaf" />
  <CornerDecoration position="bottom-right" variant="leaf-only" />
  ```

**3.5. Tambahkan gambar Bismillah**
- Sebelum "Top Decorative Line", tambahkan:
  ```jsx
  <div className={cn("flex justify-center mb-4")}>
    <img src="/images/bismillah.png" alt="Bismillah" className={cn("h-6 sm:h-8 w-auto")} />
  </div>
  ```

**3.6. Tambahkan teks "You Are Invited To The Wedding Of"**
- Tambahkan sebelum bagian nama pasangan:
  ```jsx
  <p className={cn("font-fahkwang text-center text-gray-700 text-sm sm:text-base mb-4")}>
    You Are Invited To<br />The Wedding Of
  </p>
  ```
  > Kalau perlu multi-bahasa, tambahkan key baru di `src/locales/en.json` & `id.json`, lalu pakai `t("landing.invitedTo")` — ikuti pola yang sudah ada di file, lihat contoh `t("landing.openInvitation")`.

**3.7. Ganti font nama pasangan ke font script**
- Cari `<h1 className={cn("text-3xl sm:text-4xl md:text-5xl font-serif text-gray-800 leading-tight")}>`
- Ganti struktur supaya nama tampil di 2 baris terpisah dengan "&" di tengah (sesuai referensi), dan ganti `font-serif` → `font-script`:
  ```jsx
  <div className={cn("font-script text-4xl sm:text-5xl md:text-6xl text-gray-800 leading-tight space-y-1")}>
    <div>{config.groomName}</div>
    <div className={cn("font-fahkwang text-lg sm:text-xl text-gray-500")}>&</div>
    <div>{config.brideName}</div>
  </div>
  ```

**3.8. Redesain blok tanggal**
- Ganti 2 blok "Date and Time" yang sekarang (pakai icon Calendar/Clock terpisah) dengan format seperti referensi: bulan di atas, lalu baris `HARI | TANGGAL-BESAR | JAM`, lalu tahun.
- Ambil nama bulan, hari, tanggal, tahun dari `config.date` (cek utility `src/lib/format-event-date.js` — kemungkinan perlu ditambah fungsi baru `formatEventDateParts(date)` yang mengembalikan `{ day: "Saturday", date: "14", month: "December", year: "2024" }` supaya gampang dipakai di JSX).
- Contoh struktur JSX (sesuaikan dengan hasil fungsi format tanggal):
  ```jsx
  <div className={cn("text-center space-y-2")}>
    <p className={cn("font-fahkwang text-xs tracking-[4px] uppercase text-gray-600")}>
      {month}
    </p>
    <div className={cn("flex items-center justify-center gap-4")}>
      <span className={cn("font-fahkwang text-sm uppercase text-gray-600")}>{day}</span>
      <span className={cn("border-l border-amber-300 h-6")} />
      <span className={cn("font-fahkwang text-3xl font-semibold text-emerald-800")}>{date}</span>
      <span className={cn("border-r border-amber-300 h-6")} />
      <span className={cn("font-fahkwang text-sm uppercase text-gray-600")}>AT {config.time}</span>
    </div>
    <p className={cn("font-fahkwang text-sm text-gray-600")}>{year}</p>
  </div>
  ```

**3.9. Tambahkan alamat**
- Setelah blok tanggal:
  ```jsx
  <p className={cn("font-fahkwang text-center text-sm text-gray-600 mt-4")}>
    {config.address}
  </p>
  ```

**3.10. Tambahkan "Reception to follow"**
- Paling bawah, sebelum tombol buka undangan:
  ```jsx
  <p className={cn("font-script italic text-center text-lg text-gray-500 mt-4")}>
    Reception to follow
  </p>
  ```

**3.11. Sesuaikan tombol "Buka Undangan"**
- Tombol tetap dipertahankan (tidak ada di gambar referensi karena itu contoh undangan cetak, tapi web version tetap butuh tombol trigger buka). Cukup selaraskan warna supaya tidak bentrok — misalnya ganti `bg-rose-500` jadi warna hijau tua/gold yang senada dengan aksen di desain (`bg-emerald-800` atau sesuai hasil color-pick).

**Acceptance criteria Task 3:**
- Landing page tampil mirip referensi: background krem, 4 sudut ada dekorasi, Bismillah muncul, nama pasangan pakai font script besar, blok tanggal format hari/tanggal/bulan/tahun, alamat & "Reception to follow" muncul.
- Tidak ada elemen lama yang "nyangkut" (card blur, shadow, icon Calendar/Clock lama) kecuali memang sengaja dipertahankan.
- Responsive: cek tampilan di lebar layar 375px (mobile) dan 768px+ (tablet/desktop) — teks tidak overflow, gambar dekorasi tidak menutupi teks.

---

### TASK 4 — QA & Cleanup

- [ ] Jalankan `bun run dev`, buka di browser, bandingkan langsung side-by-side dengan gambar referensi.
- [ ] Jalankan `bun run lint` — pastikan tidak ada warning/error baru.
- [ ] Cek console browser — pastikan tidak ada 404 untuk font/gambar.
- [ ] Cek dark mode (kalau ada toggle) — pastikan warna teks tetap terbaca (opsional, tergantung apakah dark mode dipakai di project ini).
- [ ] Test di 3 ukuran layar: mobile kecil (360px), mobile besar (430px), desktop (1280px).
- [ ] Commit dengan pesan jelas, misal: `feat(landing): redesign landing page to match floral invitation reference`

---

## 3. Catatan untuk Eksekutor (Junior Dev / AI Model)

- **Jangan ubah `hero.jsx` dulu** kecuali diminta eksplisit — scope task ini hanya `landing-page.jsx` (halaman sebelum undangan dibuka). Kalau ingin konsistensi ke halaman dalam (`hero.jsx`), itu task terpisah setelah landing page di-approve.
- **Semua warna di planning ini adalah tebakan awal** (`#faf7f2`, `emerald-800`, dll) — kalau AI model tidak bisa color-pick dari gambar, gunakan nilai berikut sebagai patokan aman:
  - Background: `#FAF6F0`
  - Teks utama: `#3F3F3F` (abu gelap, bukan hitam pekat)
  - Aksen hijau (angka tanggal): `#2F4A3E`
  - Aksen garis pembatas: `#C9A66B` (gold muda)
- **Jangan hardcode teks bahasa Inggris permanen** kalau project ini punya sistem i18n (`src/locales/`) — ikuti pola yang sudah ada, tambahkan key baru di kedua file locale (`en.json` & `id.json`).
- Kalau ukuran/posisi gambar dekorasi di Task 2 terlihat aneh setelah di-render, itu **wajar** — nilai Tailwind (`w-28`, `scale-x-[-1]`, dst) memang harus dikalibrasi ulang sambil lihat hasil visual, bukan dihitung di atas kertas.
- Setelah Task 3 selesai, **screenshot hasilnya dan taruh berdampingan dengan gambar referensi** untuk review sebelum PR di-submit.