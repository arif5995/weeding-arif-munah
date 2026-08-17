# Planning: Deploy ke Vercel

> **Konteks penting**: Project ini awalnya didesain untuk Cloudflare Workers (ada `wrangler.jsonc.example`). Untuk deploy ke Vercel, kita restrukturisasi sedikit — **bukan ganti bahasa/framework**, cuma nambah 1 file "jembatan" supaya Hono app-nya bisa jalan sebagai Vercel Serverless Function.
> **Dikerjakan oleh**: Junior developer / AI coding assistant gratis.
> **Info baru**: Vercel sekarang punya dukungan native/zero-config untuk Hono (per update mereka), jadi prosesnya nggak seribet dulu — cukup 1 file entry point yang benar.

---

## 0. Gambaran Besar

```
Vercel (1 project, 2 bagian):
├── Frontend (Vite build) → static files, di-serve dari CDN Vercel
└── Backend (Hono app)    → jadi Serverless Function, jalan di /api/*
```

Database **tetap Supabase** — tidak ada yang berubah di sisi database. Vercel cuma nge-host frontend + backend-nya.

---

## TASK 1 — Buat "Jembatan" Backend ke Vercel Serverless Function

Vercel otomatis mendeteksi file di folder `/api` sebagai Serverless Function. Kita buat 1 file yang nge-re-export Hono app yang sudah ada (`src/server/index.js`), **tidak perlu duplikasi/tulis ulang route apapun**.

**1.1.** Buat folder `api` di root project (sejajar dengan `src`), buat file `api/[[...route]].js`:
```js
import { handle } from "hono/vercel";
import app from "../src/server/index.js";

// PENTING: jangan set runtime "edge" — project ini pakai library `pg`
// (koneksi database Postgres langsung), yang butuh Node.js runtime,
// tidak jalan di Edge runtime. Biarkan default (Node.js).

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
```

> **Kenapa nama filenya `[[...route]].js`?** Ini konvensi "catch-all route" Vercel — supaya SEMUA path di bawah `/api/*` (misal `/api/invitation/test-wedding`, `/api/test-wedding/wishes`) diarahkan ke function yang sama ini. Hono app kita sendiri yang nanti nentuin routing detailnya di dalam (`app.route("/api", api)` di `src/server/index.js` — ini **tidak perlu diubah**).

**1.2.** Cek `hono/vercel` sudah tersedia — ini bagian dari package `hono` yang sudah ter-install (bukan package terpisah), jadi tidak perlu `bun add` apapun.

**Acceptance criteria Task 1:**
- File `api/[[...route]].js` ada dan isinya sesuai di atas.
- `src/server/index.js` **tidak diubah sama sekali** (tetap `export default app` seperti sekarang).

---

## TASK 2 — Fix Fallback URL Frontend (Supaya Aman di Production)

Saat ini `src/lib/api.js` fallback ke `http://localhost:3000` kalau `VITE_API_URL` tidak di-set:
```js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
```
Ini **berbahaya kalau kelupaan** di production — nanti browser tamu undangan malah nyoba fetch ke `localhost:3000` **milik device mereka sendiri** (pasti gagal). Karena di Vercel, frontend dan backend jalan di **domain yang sama**, kita bisa pakai path relatif (`/api/...`) tanpa perlu nyebut domain sama sekali.

**2.1.** Edit `src/lib/api.js`, baris pertama:
```js
// SEBELUM
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// SESUDAH
const API_BASE = import.meta.env.VITE_API_URL || "";
```

**2.2.** Pastikan `.env` **local** kamu tetap eksplisit set `VITE_API_URL=http://localhost:3000` (sudah begitu dari planning sebelumnya) — supaya development lokal tidak kepengaruh perubahan ini.

**2.3.** Di Vercel nanti, **jangan set** `VITE_API_URL` sama sekali (biarkan kosong/tidak ada) — otomatis fallback ke `""`, hasilnya request jadi path relatif (`/api/invitation/xxx`), langsung ke domain yang sama, **tanpa perlu konfigurasi CORS apapun** (karena same-origin).

**Acceptance criteria Task 2:**
- `bun run dev` di local tetap jalan normal seperti biasa (karena `.env` lokal masih eksplisit).
- Kode `api.js` sudah tidak ada lagi hardcode `localhost:3000` sebagai fallback.

---

## TASK 3 — Buat `vercel.json`

File ini ngasih tau Vercel cara build project + gimana handle routing SPA (supaya buka `namadomain.vercel.app/test-wedding` langsung tanpa 404, bukan cuma `namadomain.vercel.app/`).

**3.1.** Buat file `vercel.json` di root project:
```json
{
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

**Penjelasan `rewrites`:** aturan ini bilang "path apapun yang **BUKAN** diawali `/api/` → arahkan ke `index.html`". Ini penting karena aplikasi ini baca `uid` undangan dari path URL secara manual di sisi client (`invitation-context.jsx`) — jadi semua path selain `/api/*` harus tetap memuat aplikasi React yang sama, baru nanti React-nya yang parse `uid`-nya.

**Acceptance criteria Task 3:**
- File `vercel.json` ada di root, isinya sesuai di atas.

---

## TASK 4 — Commit & Push ke GitHub

```bash
git add api/ src/lib/api.js vercel.json
git commit -m "feat(deploy): add Vercel serverless function entry + SPA rewrite config"
git push origin main
```

> Vercel deploy berdasarkan repo Git (GitHub/GitLab/Bitbucket) — pastikan semua perubahan di atas sudah ke-push duluan sebelum lanjut ke Task 5.

---

## TASK 5 — Import Project ke Vercel

**5.1.** Buka `https://vercel.com`, login/daftar (bisa langsung pakai akun GitHub).

**5.2.** Klik **Add New** → **Project**.

**5.3.** Pilih **Import** repo `arif5995/weeding-arif-munah` dari daftar (kalau belum muncul, klik **Adjust GitHub App Permissions** dulu, kasih akses ke repo ini).

**5.4.** Di halaman konfigurasi sebelum deploy:
- **Framework Preset**: biasanya otomatis kedeteksi **Vite** — biarkan (kalaupun salah deteksi, Build/Install Command dari `vercel.json` yang menang).
- **Root Directory**: biarkan default (`.`), kecuali project kamu ada di subfolder repo.

**5.5.** Buka bagian **Environment Variables**, tambahkan:

| Key | Value | Catatan |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.dqypfsartczbkywjhbso:asW892b2llAVLx14@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require` | Persis yang di `.env` local kamu — connection string Supabase (Transaction Pooler) |
| `VITE_INVITATION_UID` | `test-wedding` (opsional) | Kalau mau domain utama (`namadomain.vercel.app/`) langsung nampilin undangan spesifik ini tanpa perlu path |

> **JANGAN** tambahkan `VITE_API_URL` di sini — biarkan kosong sesuai Task 2.
> **JANGAN** tambahkan `PORT` — itu cuma relevan buat `bun run server` di local, Vercel serverless function tidak butuh itu.

**5.6.** Klik **Deploy**.

**Acceptance criteria Task 5:**
- Build sukses (bar hijau "Ready"), tidak ada error merah di build log.

---

## TASK 6 — Verifikasi Setelah Deploy

**6.1.** Buka domain yang Vercel kasih (biasanya `nama-project-xxxx.vercel.app`).

**6.2.** Test endpoint API langsung dulu di browser/curl:
```
https://nama-project-xxxx.vercel.app/api/invitation/test-wedding
```
Harus keluar JSON `{"success": true, "data": {...}}` — **bukan** 404 atau 500.

**6.3.** Buka domain tanpa path (`/`) — kalau kamu set `VITE_INVITATION_UID` di Task 5.5, harus langsung tampil undangan. Kalau tidak, buka `/test-wedding` secara eksplisit.

**6.4.** Test fitur yang butuh nulis data — submit form ucapan/wishes lewat UI, pastikan berhasil masuk (cek lagi via `psql` atau Supabase Table Editor kalau perlu).

**6.5.** Buka DevTools → Network tab, pastikan **tidak ada error CORS** (harusnya nggak ada sama sekali, karena sekarang same-origin — beda dari waktu development local yang butuh CORS karena port beda).

**Acceptance criteria Task 6:**
- Semua endpoint & fitur (baca + tulis data) jalan normal di domain Vercel, tanpa error CORS/404/500.

---

## TASK 7 — (Opsional) Custom Domain

Kalau nanti punya domain sendiri (misal dari Hostinger/Niagahoster/dll):
1. Di dashboard project Vercel → **Settings** → **Domains** → **Add**.
2. Masukkan domain kamu, Vercel kasih instruksi DNS record (biasanya `CNAME` atau `A` record) yang perlu ditambahin di pengaturan DNS domain kamu.
3. Tunggu propagasi DNS (bisa beberapa menit sampai beberapa jam).

---

## Troubleshooting

| Gejala | Kemungkinan Penyebab | Fix |
|---|---|---|
| Build gagal, log nyebut `bun: command not found` | Vercel belum di-set pakai Bun | Di Project Settings → General → cek "Install Command"/"Build Command" eksplisit terisi `bun install`/`bun run build` sesuai `vercel.json`; kalau masih gagal, ganti sementara ke `npm install`/`npm run build` di `vercel.json` |
| `/api/invitation/test-wedding` return 404 | File `api/[[...route]].js` salah nama/lokasi | Pastikan persis di `api/[[...route]].js` (bukan `src/api/...` atau nama file beda) |
| `/api/...` return 500, pesan `No database connection available` | `DATABASE_URL` belum ke-set di Environment Variables Vercel, atau salah | Cek ulang Task 5.5, pastikan value-nya persis sama dengan yang jalan di local |
| Buka `/test-wedding` malah 404 halaman putih dari Vercel (bukan dari React) | `vercel.json` rewrites belum ke-apply / belum ke-push sebelum deploy | Pastikan `vercel.json` ada di root repo yang di-deploy, redeploy setelah push |
| Data lama (sebelum update) masih muncul | Cache browser / cache Vercel Edge | Hard refresh (`Ctrl+Shift+R`), atau redeploy manual dari dashboard Vercel |

---

## Ringkasan Urutan Kerja

```
1. Buat api/[[...route]].js (jembatan Hono app → Vercel Serverless Function)   (Task 1)
2. Fix fallback API_BASE di src/lib/api.js dari localhost → string kosong      (Task 2)
3. Buat vercel.json (build config + SPA rewrite)                               (Task 3)
4. git commit + push ke GitHub                                                 (Task 4)
5. Import project di dashboard Vercel, set DATABASE_URL, Deploy                (Task 5)
6. Verifikasi: test API endpoint, test baca+tulis data, cek no CORS error      (Task 6)
7. (Opsional) Pasang custom domain                                             (Task 7)
```

## Catatan untuk Eksekutor

- **Jangan hapus/ubah `wrangler.jsonc.example`** — biarkan tetap ada di repo, siapa tau nanti mau coba deploy ke Cloudflare Workers juga sebagai alternatif; ini tidak mengganggu deploy Vercel sama sekali (Vercel cuma baca `vercel.json`, mengabaikan file `wrangler.jsonc.example`).
- Koneksi database yang dipakai sekarang (**Transaction Pooler**, port `6543`) itu **sudah pas** buat lingkungan serverless seperti Vercel Functions — jangan ganti balik ke Direct Connection, karena serverless function bisa spin-up banyak instance sekaligus saat traffic ramai, dan Direct Connection nggak dirancang buat pola koneksi seperti itu.
- Setiap kali push commit baru ke branch `main`, Vercel **otomatis re-deploy** — tidak perlu ulang Task 5 dari awal untuk update berikutnya.