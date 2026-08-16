# Planning Lanjutan: Konsistensi Tema & Animasi (Post "landing page" commit)

> **Konteks**: Landing page (`landing-page.jsx`) sudah sesuai referensi (commit `landing page`, hash `4ae374b`). Task berikut adalah **lanjutan**, scope-nya: (1) terapkan base color & font yang sama ke **semua halaman fitur lain**, (2) tambahkan animasi "bergoyang" pada dekorasi bunga/daun saat transisi masuk/keluar, (3) buat tampilan konsisten sebagai **mobile-frame** di semua ukuran layar.
> **Dikerjakan oleh**: Junior developer / AI coding assistant gratis.
> **Prinsip**: semua instruksi berbentuk find-and-replace yang eksplisit (file, baris, class lama → class baru) — minim keputusan desain mandiri.

---

## 0. Base Color & Font yang Jadi Acuan (Sudah Terpakai di Landing Page)

Ini warna/font yang **sudah dipakai** di `landing-page.jsx` — dijadikan **satu-satunya** acuan untuk seluruh app:

| Token | Nilai | Dipakai untuk |
|---|---|---|
| Background utama | `#faf7f2` (krem) | Background semua halaman |
| Aksen hijau tua | `emerald-800` / `emerald-900` | Angka tanggal, tombol utama, judul penting |
| Aksen gold/kuning muda | `amber-400` | Garis pembatas/divider |
| Teks utama | `text-gray-800` / `text-gray-700` | Judul, isi |
| Teks sekunder | `text-gray-600` / `text-gray-500` | Deskripsi, label |
| Font display/script | `font-script` (New Icon Script) | Nama, judul besar bergaya kaligrafi |
| Font dasar | `font-fahkwang` | Semua teks body |

**Masalah saat ini**: warna ini **hanya** dipakai di landing page. Semua halaman lain (Hero, Events, Gifts, Location, Wishes, Layout, BottomBar) **masih pakai palet lama** (`rose-*`, `pink-*`) dan font lama (`font-serif` / default `font-sans` = Outfit). Ini bikin transisi landing → halaman utama terasa "pindah tema".

---

## TASK 1 — Formalkan Design Token (Supaya Tidak Hardcode Berulang)

File: `src/index.css`

**1.1.** Di dalam blok `@theme inline`, tambahkan token warna semantik baru (setelah baris `--color-rose-50`):
```css
--color-brand-bg: #faf7f2;
--color-brand-surface: #ffffff;
--color-brand-primary: #2f4a3e;      /* emerald tua — pengganti rose-500/600 untuk aksen kuat */
--color-brand-primary-hover: #23392f;
--color-brand-accent: #c9a66b;        /* gold — pengganti rose-200 untuk garis/divider */
--color-brand-accent-soft: #e8dcc4;   /* gold pucat — pengganti rose-100 untuk background lembut */
```
> Setelah ini, Tailwind v4 otomatis membuat utility class baru: `bg-brand-bg`, `text-brand-primary`, `border-brand-accent`, dll — karena project sudah punya pola yang sama (`--color-rose-50` di atasnya menghasilkan `bg-rose-50`).

**1.2.** Ganti nilai font dasar (1 baris, efeknya ke SELURUH app sekaligus karena tidak ada komponen yang eksplisit pakai class `font-sans`):
```css
/* SEBELUM */
--font-sans: "Outfit", sans-serif;
/* SESUDAH */
--font-sans: "Fahkwang", sans-serif;
```
> Karena tidak ada file yang memakai class `font-sans` secara eksplisit (dicek: hanya didefinisikan di `index.css`, dipakai implisit lewat Tailwind preflight sebagai font default `body`), mengganti nilai variable ini otomatis mengubah font seluruh halaman ke Fahkwang tanpa perlu edit satu-satu.

**1.3. Tambahkan animasi "sway" (bergoyang)** — masih di `@theme inline`, tambahkan setelah `--animate-marquee-vertical`:
```css
--animate-sway: sway 4s ease-in-out infinite;

@keyframes sway {
  0%, 100% {
    transform: rotate(-2deg);
  }
  50% {
    transform: rotate(2deg);
  }
}
```

**Acceptance criteria Task 1:**
- Class `bg-brand-bg`, `text-brand-primary`, `border-brand-accent`, `animate-sway` bisa dipakai tanpa error di komponen manapun.
- Buka app, font body berubah jadi Fahkwang tanpa edit file lain.

---

## TASK 2 — Migrasi Warna: File per File

Prinsip mapping (pakai ini untuk semua file di bawah):

| Class lama | Class baru |
|---|---|
| `text-rose-500`, `text-rose-600` | `text-brand-primary` |
| `text-rose-400` | `text-brand-primary/80` (sedikit lebih muda) |
| `bg-rose-500`, `hover:bg-rose-600` | `bg-brand-primary`, `hover:bg-brand-primary-hover` |
| `bg-rose-50`, `bg-rose-100` | `bg-brand-accent-soft` |
| `border-rose-100`, `border-rose-200` | `border-brand-accent-soft` |
| `bg-rose-200`, `bg-rose-300` (garis divider) | `bg-brand-accent` |
| `from-rose-*`, `to-pink-*` (gradient) | `from-brand-accent-soft to-brand-accent-soft` (atau hapus gradient, pakai solid `bg-brand-surface`) |
| `text-pink-400` (dekorasi hati floating di hero) | boleh tetap dipertahankan sebagai variasi warna hati, TAPI ganti ke turunan brand, misal `text-brand-primary/60` |
| `font-serif` (judul section) | `font-script` **khusus untuk judul besar** (nama/heading utama), TETAP `font-serif` boleh dipertahankan untuk sub-judul kecil jika `font-script` terlalu sulit dibaca di ukuran kecil — **cek visual, jangan asal ganti semua** |

### 2.1 `src/features/invitation/components/hero.jsx`
- Baris 68: `border-rose-100` → `border-brand-accent-soft`
- Baris 71: `text-rose-600` → `text-brand-primary`
- Baris 89, 91: `text-rose-400` / `text-pink-400` (FloatingHearts) → boleh tetap, atau ganti ke `text-brand-primary/70` dan `text-brand-accent`
- Baris 158: `bg-rose-50 text-rose-600 border-rose-200` → `bg-brand-accent-soft text-brand-primary border-brand-accent`
- Baris 177: `from-rose-600 to-pink-600` (gradient nama pasangan) → ganti ke warna solid `text-brand-primary` (hapus gradient), DAN ganti `font-serif` → `font-script` supaya konsisten dengan landing page
- Baris 190, 196, 206, 217, 231, 243–245, 268, 276, 281: semua `rose-*` → ikuti tabel mapping di atas
- Baris 249: `font-serif italic` → boleh tetap `font-serif italic` atau ganti `font-script` (cek mana yang lebih enak dibaca untuk teks pendek "guest greeting")
- Baris 255: `text-rose-500` → `text-brand-primary`
- Baris 311: `text-rose-500` (icon Heart bawah) → `text-brand-primary`

### 2.2 `src/features/events/components/events.jsx`
- Baris 40: `text-rose-500` → `text-brand-primary`
- Baris 48: `font-serif` (judul "Events") → `font-script`
- Baris 66–70: `bg-rose-200`, `text-rose-400` → `bg-brand-accent`, `text-brand-primary`

### 2.3 `src/features/events/components/events-card.jsx`
- Baris 171, 180, 184, 191, 218: semua `text-rose-500` (icon Calendar/Clock/MapPin/Globe + link) → `text-brand-primary`

### 2.4 `src/features/gifts/components/gifts.jsx`
- Baris 50: `text-rose-500` → `text-brand-primary`
- Baris 57: `font-serif` → `font-script`
- Baris 67–69: `bg-rose-200`, `text-rose-400` → `bg-brand-accent`, `text-brand-primary`
- Baris 100–102: `bg-rose-200/50`, `bg-rose-300` → `bg-brand-accent/50`, `bg-brand-accent`
- Baris 121: `from-rose-100/50 to-pink-100/50` → `from-brand-accent-soft/50 to-brand-accent-soft/50`
- Baris 126: `border-rose-100/50` → `border-brand-accent-soft/50`
- Baris 137, 149, 168: `text-rose-500`, `text-rose-400` → `text-brand-primary`

### 2.5 `src/features/location/components/location.jsx`
- Baris 33: `text-rose-500` → `text-brand-primary`
- Baris 40: `font-serif` → `font-script`
- Baris 50–52: `bg-rose-200`, `text-rose-400` → `bg-brand-accent`, `text-brand-primary`
- Baris 97: `font-serif` (judul card, ukuran lebih kecil) → boleh tetap `font-serif` (cek keterbacaan)
- Baris 103, 110, 117: `text-rose-500` → `text-brand-primary`

### 2.6 `src/features/wishes/components/wishes.jsx`
File ini paling banyak (27 baris) — mapping sama seperti tabel di atas, plus catatan khusus:
- Baris 178: `text-rose-500` (icon error) → `text-brand-primary` **KECUALI** ini icon untuk state error/gagal — kalau memang menandakan error, pertimbangkan tetap pakai warna merah standar (`text-red-500`) supaya makna "error" tidak hilang. **Diskusikan dulu, jangan auto-replace buta di baris ini.**
- Baris 202, 209, 219–221: sama seperti pola section header di file lain (`text-rose-500` → `text-brand-primary`, `font-serif` judul → `font-script`, `bg-rose-200` → `bg-brand-accent`)
- Baris 238, 245: `bg-rose-600`, `text-rose-600` (progress bar & pesan error form) → `bg-brand-primary`, kecuali baris 245 memang untuk pesan error → pertimbangkan tetap merah
- Baris 284, 291, 300: card wishes individual → `from-brand-accent-soft/60 to-brand-accent-soft/60`, `border-brand-accent-soft/50`, avatar gradient `from-brand-primary to-brand-primary-hover`
- Baris 340, 395, 403, 413: badge & modal header → ikuti tabel mapping
- Baris 471: `prose prose-gray` — **JANGAN diubah**, ini class dari plugin Tailwind Typography, bukan warna custom
- Baris 491, 518, 533, 544–599, 647–743: form input & tombol submit wishes → ikuti tabel mapping (`border-rose-100`→`border-brand-accent-soft`, `focus:ring-rose-200`→`focus:ring-brand-accent`, `bg-rose-500`→`bg-brand-primary`, dst)

### 2.7 `src/components/layout/layout.jsx`
- Baris 66: `border-rose-100/50` → `border-brand-accent-soft/50`
- Baris 71, 79: `text-rose-500` (icon play/pause musik) → `text-brand-primary`
- Baris 45: `bg-gradient-to-br from-gray-50 to-gray-100` (background luar frame HP) → boleh diganti `bg-brand-bg` supaya area di luar "frame HP" juga senada, atau tetap abu-abu netral supaya frame HP-nya kontras — **cek visual, ambil yang lebih enak dilihat**

### 2.8 `src/components/layout/bottom-bar.jsx`
- Baris 167, 176: `stroke-rose-500`, `text-rose-500` (navigasi aktif) → `stroke-brand-primary`, `text-brand-primary`

**Acceptance criteria Task 2:**
- `grep -rn "rose-\|pink-" src/` hanya menyisakan baris yang memang sengaja dipertahankan (state error/merah) — dicatat alasannya di komentar kode.
- Semua halaman (landing, hero, events, gifts, location, wishes) terlihat 1 tema warna yang sama saat di-scroll berurutan.

---

## TASK 3 — Konsistensi Tampilan "Mobile Frame" di Semua Ukuran Layar

**Masalah saat ini**: `Layout` (halaman setelah undangan dibuka) sudah dibungkus frame lebar mobile (`max-w-[430px]`, ada border+shadow, terlihat seperti bingkai HP di tengah layar desktop) — lihat `src/components/layout/layout.jsx` baris 43–50. Tapi `LandingPage` **tidak** dibungkus frame yang sama; dia full-width di seluruh layar. Efeknya: begitu user klik "Buka Undangan", tampilan tiba-tiba "menyempit" ke frame HP — terasa tidak konsisten.

**3.1. Buat komponen shared** `src/components/layout/phone-frame.jsx`:
```jsx
import { cn } from "@/lib/utils";

/**
 * Wrapper yang membuat konten selalu tampil sebagai "bingkai HP"
 * di tengah layar, konsisten di semua breakpoint (mobile & desktop).
 */
const PhoneFrame = ({ children, className }) => {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full bg-brand-bg flex items-center justify-center",
      )}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-[430px] min-h-screen bg-brand-bg relative overflow-hidden",
          "sm:border sm:border-gray-200 sm:shadow-lg", // border/shadow cuma muncul di layar >= sm, biar di HP asli tetap full-bleed
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default PhoneFrame;
```

**3.2. Pakai `PhoneFrame` di `landing-page.jsx`**
- Bungkus `<motion.div className="min-h-screen relative overflow-hidden bg-[#faf7f2]">` (isi utama landing page) dengan `<PhoneFrame>`.
- Hapus `bg-[#faf7f2]` yang hardcode, ganti ke `bg-brand-bg` (sudah didefinisikan di Task 1).

**3.3. Refactor `layout.jsx` supaya pakai `PhoneFrame` yang sama** (hindari duplikasi kode frame):
- Ganti div pembungkus di baris 42–50 dengan `<PhoneFrame>`, pindahkan konten (`toggle` button, `main`, `BottomBar`, toast) sebagai children.

**Acceptance criteria Task 3:**
- Buka app di desktop (lebar >1024px): landing page dan halaman utama SAMA-SAMA tampil sebagai bingkai lebar mobile (max 430px) di tengah layar, tidak ada lagi landing page yang full-bleed lalu tiba-tiba menyempit.
- Buka app di HP asli (lebar <430px): tidak ada border/shadow aneh, tetap full-bleed natural seperti web app biasa.

---

## TASK 4 — Animasi "Bergoyang" (Sway) pada Dekorasi Bunga & Daun

Ada 2 lapis animasi yang perlu ditambahkan ke `src/features/invitation/components/corner-decoration.jsx`:

### 4.1. Idle sway (bergoyang pelan terus-menerus saat landing page tampil)
- Ubah elemen `<img>` bunga & daun dari HTML biasa menjadi `motion.img` dari `motion/react`.
- Tambahkan animasi rotate bolak-balik pelan, MASING-MASING gambar dengan durasi & delay sedikit beda supaya tidak terlihat "kaku serempak":
  ```jsx
  import { motion } from "motion/react";
  import { useReducedMotionFlag } from "@/lib/motion";

  // di dalam komponen:
  const reduceMotion = useReducedMotionFlag();

  // ganti <img src="/images/leaf-white.png" .../> jadi:
  <motion.img
    src="/images/leaf-white.png"
    alt=""
    className={cn(/* class sama seperti sebelumnya */)}
    loading="lazy"
    animate={
      reduceMotion
        ? undefined
        : { rotate: [-2, 2, -2] }
    }
    transition={
      reduceMotion
        ? undefined
        : { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
    style={{ transformOrigin: "top center" }}
  />
  ```
  - Lakukan hal sama untuk `<img src="/images/flower-white.png">`, tapi kasih `delay: 0.5` dan durasi sedikit beda (misal `duration: 5`) supaya goyangan bunga & daun tidak sinkron persis (lebih natural).
  - **Hormati reduced motion**: kalau `reduceMotion` true (user setting aksesibilitas), JANGAN animasikan sama sekali — biarkan statis. Ini sudah jadi pola di codebase (lihat `hero.jsx` bagian `FloatingHearts`), ikuti pola yang sama.

### 4.2. Animasi masuk/keluar saat transisi landing ↔ halaman utama
- Ubah `CornerDecoration` supaya elemen pembungkus (`<div>` terluar) menjadi `motion.div` dengan `variants` untuk `initial`/`animate`/`exit`, dipicu oleh `AnimatePresence` yang SUDAH ADA di `app.jsx` (bungkus landing/main).
- Tambahkan variant baru di `src/lib/motion.js` (di bagian "Variant presets", setelah `scaleIn`):
  ```js
  /** Entrance dengan sedikit rotasi & scale untuk elemen dekoratif (bunga/daun). */
  export const swayIn = {
    hidden: { opacity: 0, scale: 0.7, rotate: -8 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: DURATION.slow, ease: EASE.out },
    },
    exit: {
      opacity: 0,
      scale: 0.7,
      rotate: 8,
      transition: { duration: DURATION.base, ease: EASE.inOut },
    },
  };
  ```
  - Daftarkan juga di object `REDUCED` dan `FULL` supaya ikut sistem reduced-motion yang sudah ada (`REDUCED.swayIn = fade`, `FULL.swayIn = swayIn`), dan tambahkan `'swayIn'` di JSDoc parameter `useMotionPreset`.
- Di `corner-decoration.jsx`, pakai preset ini di elemen pembungkus:
  ```jsx
  const swayIn = useMotionPreset("swayIn");

  <motion.div
    variants={swayIn}
    initial="hidden"
    animate="visible"
    exit="exit"
    className={cn(/* class posisi seperti sebelumnya */)}
    style={{ /* style offset seperti sebelumnya */ }}
  >
    {/* motion.img leaf & flower dari 4.1 di sini */}
  </motion.div>
  ```
- **Penting**: supaya `exit` animation ini benar-benar jalan, `CornerDecoration` harus punya `key` unik dan berada di dalam `AnimatePresence` — cek lagi apakah `landing-page.jsx` di-render dalam `AnimatePresence mode="wait"` di `app.jsx` (sudah ada, lihat baris 162 `app.jsx`). Karena `LandingPage` sendiri adalah children dari `motion.div key="landing"` yang sudah exit-animated, dekorasi di dalamnya otomatis ikut ter-unmount saat parent exit — tambahan `variants={swayIn}` di atas membuat unmount-nya tidak instan-hilang tapi "goyang lalu memudar".

**Acceptance criteria Task 4:**
- Saat landing page pertama kali muncul, bunga & daun di 4 sudut goyang pelan terus-menerus (loop).
- Saat user klik "Buka Undangan", dekorasi bunga/daun di landing page menghilang dengan animasi (rotate + fade), bukan hilang instan.
- Kalau browser/OS user set "prefers-reduced-motion", semua animasi sway ini otomatis nonaktif (fallback ke fade biasa atau statis).

---

## TASK 5 — QA & Cleanup

- [ ] `grep -rn "rose-\|pink-" src/` — pastikan hanya baris yang sengaja dipertahankan (dengan komentar alasan) yang tersisa.
- [ ] `bun run lint` — 0 error baru.
- [ ] `bun run test` — semua test masih lulus (terutama `routes.spec.js`, `invitation.schema.spec.js` — seharusnya tidak kesentuh karena ini murni perubahan UI).
- [ ] Cek visual di 3 breakpoint: 360px (HP kecil), 430px (HP besar/frame limit), 1280px (desktop) — pastikan frame HP konsisten dari Task 3.
- [ ] Cek animasi sway di halaman landing — pastikan tidak bikin CPU/GPU berat (buka DevTools → Performance, rekam 5 detik, pastikan tidak ada frame drop signifikan).
- [ ] Test `prefers-reduced-motion` (di Chrome DevTools → Rendering tab → Emulate CSS media feature `prefers-reduced-motion: reduce`) — pastikan semua animasi baru ikut nonaktif.
- [ ] Commit terpisah per task supaya gampang di-review, contoh:
  - `feat(theme): add centralized brand color & font tokens`
  - `refactor(ui): migrate rose/pink palette to brand tokens across features`
  - `feat(layout): consistent mobile-frame wrapper for landing & main content`
  - `feat(animation): add sway animation for corner decorations`

---

## Catatan untuk Eksekutor

- **Jangan replace `rose-*`/`pink-*` secara membabi-buta pakai find-replace global** — ada beberapa tempat (state error, badge notifikasi) yang warna merahnya punya makna semantik, bukan sekadar styling. Baca komentar di Task 2.6 baris 178 & 245.
- **Urutan pengerjaan disarankan**: Task 1 (token) → Task 2 (migrasi warna) → Task 3 (mobile frame) → Task 4 (animasi). Task 4 paling terakhir karena bergantung pada struktur `CornerDecoration` yang stabil dari task sebelumnya.
- Kalau AI model/junior dev ragu apakah suatu elemen harus pakai `font-script` atau tetap `font-serif`, patokan sederhana: **judul besar (nama, judul section) → `font-script`. Teks kecil/panjang/paragraf → tetap `font-fahkwang` biasa (jangan pakai font script untuk teks panjang, sulit dibaca).**
- Setelah semua task selesai, ambil screenshot tiap halaman (landing, hero, events, gifts, location, wishes) dan bandingkan berdampingan — pastikan semua terasa 1 keluarga desain, bukan campuran 2 tema.