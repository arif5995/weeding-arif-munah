# Planning Resolve Bug & Anomaly --- Vercel + Hono + Supabase PostgreSQL

## Project

-   Repository: `arif5995/weeding-arif-munah`
-   Target branch: `develop`
-   Production branch: `main`
-   Deployment platform: Vercel
-   Frontend: Vite/React
-   Backend/API: Hono
-   Database: Supabase PostgreSQL
-   Database driver: `pg`

------------------------------------------------------------------------

# 1. Tujuan

Menyelesaikan seluruh masalah deployment dan runtime pada branch
`develop`, terutama:

1.  Endpoint `/api/*` tidak ditemukan di Vercel dan menghasilkan HTTP
    404.
2.  Memastikan Vercel benar-benar mendeteksi dan menjalankan Vercel
    Function.
3.  Memastikan Hono menerima request dari Vercel dengan routing yang
    benar.
4.  Memastikan `DATABASE_URL` tersedia pada environment Preview.
5.  Memastikan koneksi PostgreSQL ke Supabase menggunakan connection
    pooling yang sesuai untuk serverless.
6.  Menghilangkan implementasi database client yang duplikat/sisa
    arsitektur Cloudflare.
7.  Memastikan endpoint `/api/health/db` dapat melakukan query sederhana
    ke PostgreSQL.
8.  Memastikan `/api/test-wedding/wishes` membaca data dari database.
9.  Memastikan frontend Wishes menampilkan data.
10. Menyiapkan architecture yang stabil untuk `develop -> Preview` dan
    `main -> Production`.

------------------------------------------------------------------------

# 2. Gejala Saat Ini

Error utama pada Vercel:

``` text
GET /api/test-wedding/wishes?limit=50&offset=0
404 (Not Found)

The page could not be found
NOT_FOUND
```

Sebelumnya terdapat error frontend:

``` text
Failed to construct 'URL': Invalid base URL
```

Masalah `Invalid base URL` sudah diperbaiki dengan menggunakan relative
API URL.

Sekarang browser sudah mengirim request yang benar:

``` text
/api/test-wedding/wishes?limit=50&offset=0
```

Tetapi Vercel masih mengembalikan:

``` text
404
```

------------------------------------------------------------------------

# 3. Diagnosis Awal

## 3.1 Layer frontend

Status:

``` text
Frontend API request       PASS
Relative URL               PASS
Request dikirim browser    PASS
```

Request sekarang:

``` text
GET /api/test-wedding/wishes?limit=50&offset=0
```

Tidak perlu kembali menggunakan:

``` js
new URL("/api/...", "")
```

------------------------------------------------------------------------


## 3.2 Layer Database

Project menggunakan:

``` text
DATABASE_URL
```

dan PostgreSQL melalui:

``` text
pg.Pool
```

Status:

``` text
Belum dapat divalidasi melalui Vercel karena endpoint API masih 404.
```

Jangan menganggap database sebagai penyebab 404 sebelum Vercel Function
terbukti berjalan.

------------------------------------------------------------------------

# 4. Target Architecture

Architecture final yang diinginkan:

``` text
                         GitHub
                           |
              +------------+------------+
              |                         |
           develop                     main
              |                         |
              v                         v
       Vercel Preview             Vercel Production
              |                         |
              +------------+------------+
                           |
                           v
                    Vercel Function
                           |
                           v
                    Hono Application
                           |
              +------------+-------------+
              |                          |
         API Routes                 Services
              |                          |
              +------------+-------------+
                           |
                           v
                     pg.Pool
                           |
                           v
               Supabase Transaction Pooler
                           |
                         :6543
                           |
                           v
                     PostgreSQL
```

Tidak ada lagi ketergantungan runtime terhadap:

``` text
Cloudflare Workers
Cloudflare Hyperdrive
```

untuk deployment Vercel.

------------------------------------------------------------------------

# 5. Phase 0 --- Backup & Baseline

## Tujuan

Memastikan kondisi branch sebelum perubahan dapat dikembalikan.

### Langkah

``` bash
git checkout develop
git pull origin develop

git status
git log -5 --oneline
```

Buat tag backup jika diperlukan:

``` bash
git tag backup/pre-vercel-db-fix
git push origin backup/pre-vercel-db-fix
```

### Acceptance Criteria

-   Working tree bersih.
-   Branch aktif adalah `develop`.
-   Commit terbaru terdokumentasi.
-   Ada recovery point sebelum refactor.

------------------------------------------------------------------------

# 6. Phase 1 --- Audit Struktur Repository

## Tujuan

Memastikan Vercel menggunakan root directory yang benar.

Periksa:

``` text
api/
src/
vercel.json
package.json
vite.config.*
.env.example
```

Struktur target minimal:

``` text
weeding-arif-munah/
├── api/
│   └── [...route].js
├── src/
│   ├── server/
│   │   ├── index.js
│   │   ├── routes/
│   │   ├── services/
│   │   └── db/
│   └── ...
├── package.json
├── vercel.json
└── vite.config.*
```

### Verifikasi Vercel

Di Vercel:

``` text
Project
→ Settings
→ Build and Deployment
```

Pastikan:

``` text
Root Directory = repository root
```

Bukan:

``` text
src
frontend
app
```

### Acceptance Criteria

-   `api/` berada pada root directory yang digunakan Vercel.
-   Vercel deployment source berasal dari repository/branch yang benar.
-   Preview deployment berasal dari `develop`.

------------------------------------------------------------------------

# 7. Phase 2 --- Verifikasi Native Vercel Function

## Tujuan

Membedakan masalah Vercel routing dengan masalah Hono/database.

Buat temporary diagnostic function:

``` text
api/health.js
```

Isi:

``` js
export function GET() {
  return Response.json({
    success: true,
    service: "vercel-function",
  });
}
```

Deploy ke `develop`.

Test:

``` text
GET /api/health
```

## Expected

``` json
{
  "success": true,
  "service": "vercel-function"
}
```

## Jika tetap 404

Fokus pada:

``` text
Vercel Root Directory
Framework Preset
Build Configuration
Deployment Source
Ignored Build Step
Function Detection
```

Jangan debug database dulu.

## Jika 200

Lanjut Phase 3.

------------------------------------------------------------------------

# 8. Phase 3 --- Verifikasi Hono Adapter

## Tujuan

Memastikan Vercel Function meneruskan request ke Hono.

File:

``` text
api/[...route].js
```

Target:

``` js
import { handle } from "hono/vercel";
import app from "../src/server/index.js";

export default handle(app);
```

Pastikan `src/server/index.js` export default:

``` js
export default app;
```

### Test

``` text
GET /api/health
```

Expected:

``` json
{
  "success": true
}
```

### Test not-found

Request:

``` text
GET /api/does-not-exist
```

Expected response berasal dari Hono, bukan Vercel generic 404.

Contoh:

``` json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND"
  }
}
```

### Acceptance Criteria

-   Request `/api/*` mencapai Hono.
-   Hono `notFound` handler aktif.
-   Tidak ada generic Vercel `NOT_FOUND` untuk route yang diproses Hono.

------------------------------------------------------------------------

# 9. Phase 4 --- Simplifikasi `vercel.json`

## Tujuan

Menghindari rewrite frontend yang mengambil alih request `/api`.

Pastikan rewrite SPA mengecualikan `/api`.

Konsep:

``` json
{
  "rewrites": [
    {
      "source": "/((?!api(?:/|$)).*)",
      "destination": "/index.html"
    }
  ]
}
```

Jangan membuat rewrite seperti:

``` text
/api/*
→ /index.html
```

karena itu dapat menyebabkan API tidak pernah mencapai Function.

### Acceptance Criteria

``` text
/api/*     → Vercel Function
/*         → SPA / index.html
```

------------------------------------------------------------------------

# 10. Phase 5 --- Audit Environment Variables

## Tujuan

Memastikan `DATABASE_URL` tersedia pada Vercel Preview.

Buka:

``` text
Vercel
→ Project
→ Settings
→ Environment Variables
```

Cari:

``` text
DATABASE_URL
```

Pastikan aktif minimal untuk:

``` text
Preview
```

dan setelah production siap:

``` text
Production
```

### Jangan kirim secret

Jangan memasukkan password atau connection string lengkap ke
repository/chat.

`.env.example` hanya boleh berisi placeholder:

``` env
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

### Acceptance Criteria

Preview deployment `develop` memiliki:

``` text
process.env.DATABASE_URL !== undefined
```

------------------------------------------------------------------------

# 11. Phase 6 --- Validasi Supabase Connection Pooling

## Tujuan

Menggunakan koneksi PostgreSQL yang sesuai untuk Vercel serverless.

Untuk Vercel/serverless, gunakan Supabase Transaction Pooler.

Target:

``` text
Host: *.pooler.supabase.com
Port: 6543
Database: postgres
```

Hindari menggunakan direct connection:

``` text
db.<project-ref>.supabase.co:5432
```

sebagai connection utama serverless.

### Sumber connection string

Ambil dari:

``` text
Supabase
→ Project
→ Connect
→ Transaction Pooler
```

Jangan membuat connection string secara manual jika tidak diperlukan.

### Acceptance Criteria

`DATABASE_URL` Preview menggunakan pooler Supabase dan port `6543`.

------------------------------------------------------------------------

# 12. Phase 7 --- Standarisasi PostgreSQL Client

## Masalah

Project memiliki lebih dari satu implementasi database client:

``` text
src/server/db/client.js
src/server/db/node-pool.js
src/server/lib/db-client.js
```

Selain menyebabkan kebingungan, ini menunjukkan sisa arsitektur
Cloudflare dan Node/Vercel bercampur.

## Target

Gunakan satu database client:

``` text
src/server/db/client.js
```

Seluruh service database menggunakan client tersebut.

Target dependency:

``` text
Route
 ↓
Service
 ↓
getDbClient()
 ↓
pg.Pool
 ↓
Supabase
```

------------------------------------------------------------------------

# 13. Phase 8 --- Hapus/Isolasi Cloudflare Database Code

Audit:

``` text
src/server/lib/db-client.js
```

Jika hanya digunakan untuk Cloudflare Hyperdrive dan tidak digunakan
Vercel:

-   Hapus dari runtime Vercel, atau
-   Pindahkan ke legacy/archive jika masih diperlukan untuk referensi.

Jangan biarkan service Vercel bergantung pada:

``` text
c.env.DB
Hyperdrive
Cloudflare-specific binding
```

### Acceptance Criteria

Search repository:

``` bash
git grep "Hyperdrive"
git grep "c.env.DB"
git grep "getDbClient"
```

Tidak ada dependency runtime Vercel terhadap Cloudflare.

------------------------------------------------------------------------

# 14. Phase 9 --- Konfigurasi `pg.Pool` untuk Serverless

Gunakan pool yang konservatif.

Contoh:

``` js
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});
```

Tujuan:

-   Membatasi koneksi per function instance.
-   Menghindari connection explosion.
-   Memberikan timeout yang jelas.
-   Tetap menggunakan SSL ke Supabase.

Pool boleh dicache di module scope agar warm invocation dapat
menggunakan pool yang sama.

Jangan membuat pool baru untuk setiap request.

------------------------------------------------------------------------

# 15. Phase 10 --- Database Health Endpoint

Pastikan:

``` text
GET /api/health/db
```

melakukan query sederhana:

``` sql
SELECT NOW()
```

Response sukses:

``` json
{
  "success": true,
  "database": "connected"
}
```

Response gagal:

``` json
{
  "success": false,
  "database": "disconnected"
}
```

Jangan expose:

``` text
DATABASE_URL
password
username
host
```

### Acceptance Criteria

Preview:

``` text
/api/health/db
→ HTTP 200
```

dan query PostgreSQL berhasil.

------------------------------------------------------------------------

# 16. Phase 11 --- Test Database Schema

Setelah koneksi database berhasil, cek tabel:

``` text
wishes
```

Minimal validasi:

``` sql
SELECT COUNT(*) FROM wishes;
```

Kemudian:

``` sql
SELECT id, name, message, attendance, created_at
FROM wishes
ORDER BY created_at DESC
LIMIT 5;
```

Pastikan:

-   Table tersedia.
-   Kolom sesuai service.
-   Data dapat dibaca.
-   Tidak ada permission error.

------------------------------------------------------------------------

# 17. Phase 12 --- Validasi Wishes API

Endpoint:

``` text
GET /api/test-wedding/wishes?limit=50&offset=0
```

Expected:

``` text
HTTP 200
```

Response:

``` json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 0,
    "limit": 50,
    "offset": 0
  }
}
```

Jika ada data:

``` json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Guest",
      "message": "Congratulations",
      "attendance": "ATTENDING",
      "created_at": "..."
    }
  ]
}
```

------------------------------------------------------------------------

# 18. Phase 13 --- Audit Frontend API Contract

Pastikan frontend memanggil:

``` js
fetchWishes({
  limit: 50,
  offset: 0,
});
```

Bukan:

``` js
fetchWishes(uid);
```

Karena `fetchWishes()` menerima object options.

Target:

``` js
const response = await fetchWishes({
  limit: 50,
  offset: 0,
});
```

------------------------------------------------------------------------

# 19. Phase 14 --- Audit `checkWishSubmitted`

Pastikan parameter frontend sesuai dengan function backend.

Jika backend endpoint:

``` text
GET /api/test-wedding/wishes/check/:name
```

maka frontend:

``` js
checkWishSubmitted(guestName);
```

Bukan:

``` js
checkWishSubmitted(uid, guestName);
```

Kecuali API memang diubah untuk menerima UID.

### Acceptance Criteria

-   Tidak ada parameter yang diabaikan.
-   Frontend dan backend memiliki kontrak yang sama.
-   Test check wish berhasil.

------------------------------------------------------------------------

# 20. Phase 15 --- Test Wishes End-to-End

Urutan:

``` text
Browser
 ↓
Wishes component
 ↓
React Query
 ↓
fetchWishes()
 ↓
GET /api/test-wedding/wishes
 ↓
Vercel Function
 ↓
Hono
 ↓
wishes route
 ↓
wishes service
 ↓
pg.Pool
 ↓
Supabase
 ↓
PostgreSQL
 ↓
JSON response
 ↓
React Query
 ↓
Wishes cards
```

Acceptance Criteria:

-   HTTP 200.
-   `success === true`.
-   `data` array diterima.
-   Tidak ada error Console.
-   Wishes card muncul.
-   Pagination bekerja.
-   Empty state tetap tampil jika database kosong.

------------------------------------------------------------------------

# 21. Phase 16 --- Test Write Operation

Setelah GET berhasil, test POST.

Endpoint:

``` text
POST /api/test-wedding/wishes
```

Test payload sesuai schema project.

Pastikan:

``` text
POST
 ↓
Hono
 ↓
Validation
 ↓
Service
 ↓
INSERT
 ↓
Supabase
 ↓
200/201
```

Kemudian lakukan GET:

``` text
GET /api/test-wedding/wishes
```

Pastikan record baru muncul.

------------------------------------------------------------------------

# 22. Phase 17 --- Test Health, Database, API

Checklist minimum Preview:

  Test                                           Expected
  ---------------------------------------------- ---------------
  `/`                                            200
  `/api/health`                                  200
  `/api/health/db`                               200
  `/api/test-wedding/wishes?limit=50&offset=0`   200
  POST wishes                                    200/201
  check wish                                     200
  wishes stats                                   200
  invalid API route                              Hono JSON 404

------------------------------------------------------------------------

# 23. Phase 18 --- Vercel Environment Separation

Development:

``` text
develop
 ↓
Vercel Preview
 ↓
Preview DATABASE_URL
```

Production:

``` text
main
 ↓
Vercel Production
 ↓
Production DATABASE_URL
```

Jangan menggunakan environment variable frontend:

``` text
VITE_DATABASE_URL
```

Database credential harus hanya berada di server.

Jangan pernah expose database URL ke browser bundle.

------------------------------------------------------------------------

# 24. Phase 19 --- Cleanup

Setelah semua test berhasil:

Audit file:

``` text
src/server/db/client.js
src/server/db/node-pool.js
src/server/lib/db-client.js
```

Target akhir:

``` text
src/server/db/client.js
```

sebagai satu-satunya PostgreSQL client runtime.

Audit dependency:

``` bash
bun pm ls
```

Hapus dependency yang hanya diperlukan Cloudflare jika benar-benar tidak
digunakan.

Audit script:

``` text
package.json
```

Pastikan tidak ada script deployment yang masih menganggap target utama:

``` text
Cloudflare Workers
```

jika Vercel sudah menjadi target utama.

------------------------------------------------------------------------

# 25. Phase 20 --- Documentation Cleanup

Perbarui README:

``` text
Deployment: Vercel
API: Hono
Database: Supabase PostgreSQL
Connection: Supabase Transaction Pooler
```

Dokumentasikan:

``` text
Local Development
Preview Deployment
Production Deployment
Environment Variables
Database Setup
API Health Check
Troubleshooting
```

------------------------------------------------------------------------

# 26. Git Workflow

Gunakan branch:

``` text
main
develop
feature/*
fix/*
```

Untuk pekerjaan ini:

``` bash
git checkout develop
git pull origin develop

git checkout -b fix/vercel-supabase-api
```

Commit secara bertahap:

``` text
fix: verify native Vercel function
fix: configure Hono Vercel adapter
fix: standardize PostgreSQL client
fix: configure Supabase transaction pooler
fix: add database health check
fix: resolve wishes API contract
chore: remove legacy Cloudflare database client
```

Push:

``` bash
git push -u origin fix/vercel-supabase-api
```

Kemudian:

``` text
feature/fix
      ↓
develop
      ↓
Vercel Preview
      ↓
QA
      ↓
main
      ↓
Vercel Production
```

------------------------------------------------------------------------

# 27. Jangan Melakukan Perubahan Berikut Sebelum Routing Berhasil

Jangan dulu:

-   Mengubah SQL Wishes.
-   Mengubah schema database.
-   Mengganti Supabase project.
-   Menghapus tabel.
-   Mengubah Hono routes.
-   Mengganti adapter Hono berkali-kali.
-   Mengubah frontend UI.
-   Mengubah React Query.
-   Mengganti database provider.

Urutan debugging harus berdasarkan layer:

``` text
1. Vercel Function
2. Hono
3. Environment Variable
4. PostgreSQL connection
5. Database schema
6. API service
7. Frontend
```

------------------------------------------------------------------------

# 28. Troubleshooting Matrix

## A. `/api/health` = 404 Vercel

Kemungkinan:

``` text
Root Directory salah
api directory tidak terdeteksi
deployment bukan dari commit terbaru
Vercel project terhubung ke repository/branch yang salah
configuration routing salah
```

Fokus:

``` text
Vercel Build & Deployment Settings
```

------------------------------------------------------------------------

## B. `/api/health` = 200 tetapi `/api/health/db` = 500

Kemungkinan:

``` text
DATABASE_URL tidak tersedia
DATABASE_URL salah
Supabase pooler salah
password salah
SSL problem
connection timeout
```

Fokus:

``` text
Vercel Environment Variables
Supabase Connect
pg.Pool
```

------------------------------------------------------------------------

## C. `/api/health/db` = 200 tetapi Wishes = 500

Kemungkinan:

``` text
tabel wishes tidak ada
schema berbeda
column berbeda
SQL error
service error
```

Fokus:

``` text
wishes.service.js
database schema
```

------------------------------------------------------------------------

## D. API Wishes = 200 tetapi UI kosong

Kemungkinan:

``` text
response mapping salah
React Query select/queryFn salah
response.data salah
empty-state condition salah
```

Fokus:

``` text
src/services/api.js
Wishes component
React Query
```

------------------------------------------------------------------------

# 29. Definition of Done

Bug dianggap selesai jika semua kondisi berikut terpenuhi:

### Vercel

-   [ ] `develop` menghasilkan Preview Deployment.
-   [ ] `/api/health` = 200.
-   [ ] Tidak ada generic Vercel `NOT_FOUND` untuk `/api/*`.

### Hono

-   [ ] Hono Function berjalan.
-   [ ] `/api/health` berjalan.
-   [ ] Hono custom 404 berjalan.
-   [ ] `/api/test-wedding/wishes` ter-route dengan benar.

### Environment

-   [ ] `DATABASE_URL` tersedia pada Preview.
-   [ ] `DATABASE_URL` tersedia pada Production.
-   [ ] Secret tidak masuk Git.
-   [ ] Secret tidak masuk frontend bundle.

### Supabase

-   [ ] PostgreSQL aktif.
-   [ ] Transaction Pooler digunakan untuk serverless.
-   [ ] Connection menggunakan port `6543`.
-   [ ] SSL aktif.
-   [ ] Pool memiliki batas koneksi.
-   [ ] Connection timeout tersedia.

### Database

-   [ ] `/api/health/db` = 200.
-   [ ] `SELECT NOW()` berhasil.
-   [ ] Table `wishes` tersedia.
-   [ ] Query Wishes berhasil.

### Frontend

-   [ ] Wishes GET = 200.
-   [ ] Data Wishes tampil.
-   [ ] Tidak ada `Invalid base URL`.
-   [ ] Tidak ada API 404.
-   [ ] Tidak ada error Console.
-   [ ] POST Wishes berhasil.
-   [ ] Check wish berhasil.

### Architecture

-   [ ] Tidak ada runtime dependency Cloudflare.
-   [ ] PostgreSQL client tidak duplikat.
-   [ ] Vercel menjadi deployment target utama.
-   [ ] `develop` digunakan untuk Preview.
-   [ ] `main` digunakan untuk Production.

------------------------------------------------------------------------

# 30. Prioritas Eksekusi

Kerjakan dalam urutan berikut:

``` text
P0 — CRITICAL
│
├── Verify Vercel Root Directory
├── Verify api/[...route].js detection
├── Test /api/health
└── Test Hono adapter
│
▼
P1 — DATABASE
│
├── Verify DATABASE_URL Preview
├── Verify Supabase Transaction Pooler
├── Verify port 6543
├── Configure pg.Pool
└── Test /api/health/db
│
▼
P2 — API
│
├── Test wishes GET
├── Test wishes POST
├── Test check wish
└── Test wishes stats
│
▼
P3 — FRONTEND
│
├── Verify fetchWishes contract
├── Verify checkWishSubmitted contract
├── Verify React Query
└── Verify Wishes rendering
│
▼
P4 — CLEANUP
│
├── Remove duplicate DB clients
├── Remove Cloudflare runtime code
├── Cleanup package.json
└── Update README
│
▼
P5 — PRODUCTION
│
├── Merge develop → main
├── Verify Production DATABASE_URL
├── Test Production health
└── Final smoke test
```

------------------------------------------------------------------------

# 31. Final Expected State

``` text
GitHub
│
├── develop
│      │
│      └── Vercel Preview
│              │
│              ├── /api/health
│              ├── /api/health/db
│              └── /api/test-wedding/wishes
│                       │
│                       ▼
│                    Hono
│                       │
│                       ▼
│                    pg.Pool
│                       │
│                       ▼
│             Supabase Pooler :6543
│                       │
│                       ▼
│                  PostgreSQL
│
└── main
       │
       └── Vercel Production
```

Target akhir:

``` text
Frontend
    ↓
/api/test-wedding/wishes
    ↓
Vercel Function
    ↓
Hono
    ↓
Wishes Service
    ↓
Single PostgreSQL Client
    ↓
Supabase Transaction Pooler
    ↓
PostgreSQL
    ↓
JSON
    ↓
React Query
    ↓
Wishes tampil
```

## Prinsip utama

**Jangan memperbaiki semua layer sekaligus.**

Validasi satu layer sampai `PASS`, kemudian lanjut ke layer berikutnya:

``` text
Vercel
  ↓ PASS
Hono
  ↓ PASS
DATABASE_URL
  ↓ PASS
Supabase Pooler
  ↓ PASS
PostgreSQL
  ↓ PASS
Wishes API
  ↓ PASS
Frontend
  ↓ PASS
Production
```

Dengan pendekatan ini, setiap error dapat langsung dipetakan ke layer
penyebabnya dan kita menghindari trial-and-error pada kode yang
sebenarnya sudah benar.