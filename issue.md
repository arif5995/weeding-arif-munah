# Supabase Database Integration Plan
## Project: `weeding-arif-munah`
## Branch: `fix/wishes-api-client`

Repository:
https://github.com/arif5995/weeding-arif-munah

> Tujuan dokumen ini adalah menjadi panduan kerja untuk junior developer / free AI coding agent.
> Fokus: menghubungkan backend project dengan schema PostgreSQL/Supabase yang sudah tersedia,
> memetakan seluruh column ke response API, dan memastikan frontend mengambil data melalui API.
>
> Jangan membuat ulang schema database. Gunakan schema Supabase yang diberikan user sebagai source of truth.

---

## 1. Kondisi Database yang Sudah Ada

Database Supabase memiliki 4 tabel:

- `public.invitations`
- `public.agenda`
- `public.banks`
- `public.wishes`

Relasi utama:

```text
invitations.uid
     │
     ├── agenda.invitation_uid
     ├── banks.invitation_uid
     └── wishes.invitation_uid
```

`invitations.uid` adalah business identifier yang digunakan oleh API, bukan `invitations.id`.

### `invitations`

| Column | PostgreSQL type | Nullable | Kegunaan |
|---|---|---:|---|
| id | bigint | NO | Primary key internal |
| uid | varchar | NO | Identifier invitation, UNIQUE |
| title | varchar | NO | Judul undangan |
| description | text | YES | Deskripsi |
| groom_name | varchar | NO | Nama mempelai pria |
| bride_name | varchar | NO | Nama mempelai wanita |
| parent_groom | text | YES | Orang tua mempelai pria |
| parent_bride | text | YES | Orang tua mempelai wanita |
| wedding_date | date | YES | Tanggal acara |
| time | varchar | YES | Informasi waktu |
| location | varchar | YES | Nama lokasi |
| address | text | YES | Alamat |
| maps_url | text | YES | URL Google Maps |
| maps_embed | text | YES | Embed Maps |
| og_image | text | YES | Open Graph image |
| favicon | text | YES | Favicon |
| audio | text | YES | Audio URL |
| created_at | timestamptz | NO | Waktu dibuat |
| updated_at | timestamptz | NO | Waktu diperbarui |

### `agenda`

| Column | PostgreSQL type | Nullable | Kegunaan |
|---|---|---:|---|
| id | bigint | NO | Primary key |
| invitation_uid | varchar | NO | FK ke `invitations.uid` |
| title | varchar | NO | Nama agenda |
| date | date | YES | Tanggal |
| start_time | time | YES | Waktu mulai |
| end_time | time | YES | Waktu selesai |
| location | varchar | YES | Lokasi |
| address | text | YES | Alamat |
| order_index | integer | NO | Urutan |
| created_at | timestamptz | NO | Waktu dibuat |

### `banks`

| Column | PostgreSQL type | Nullable | Kegunaan |
|---|---|---:|---|
| id | bigint | NO | Primary key |
| invitation_uid | varchar | NO | FK ke `invitations.uid` |
| bank | varchar | NO | Nama bank |
| account_number | varchar | NO | Nomor rekening |
| account_name | varchar | NO | Nama pemilik |
| order_index | integer | NO | Urutan |
| created_at | timestamptz | NO | Waktu dibuat |

### `wishes`

| Column | PostgreSQL type | Nullable | Kegunaan |
|---|---|---:|---|
| id | bigint | NO | Primary key |
| invitation_uid | varchar | NO | FK ke `invitations.uid` |
| name | varchar | NO | Nama tamu |
| message | varchar | NO | Ucapan |
| attendance | varchar | NO | `ATTENDING`, `NOT_ATTENDING`, atau `MAYBE` |
| created_at | timestamptz | NO | Waktu dibuat |

---

Buatkan file Database.md

# 2. Source of Truth Project

Branch yang harus digunakan:

```text
fix/wishes-api-client
```

Jangan bekerja langsung berdasarkan `main` jika branch tersebut belum berisi perubahan terbaru.

Backend branch saat ini menggunakan Hono dan memiliki satu application entry point di:

```text
src/server/index.js
```

File tersebut sudah mengekspor:

```js
export default app;
```

dan saat ini memasang:

```text
/api/test-wedding/*       -> wishesRoutes
/api/wedding/*            -> weddingRoutes
```

Source code branch menunjukkan `src/server/db/client.js` menggunakan package `pg`, connection pool, dan membaca:

```text
DATABASE_URL
```

dari environment variable. SSL juga diaktifkan untuk koneksi database serverless.

Referensi:
- `src/server/index.js`
- `src/server/db/client.js`
- `src/services/api.js`

---

# 3. Arsitektur yang Harus Dicapai

Jangan membuat frontend langsung mengakses Supabase menggunakan anon key.

Gunakan:

```text
React/Vite
    │
    │ fetch()
    ▼
Vercel API / Hono
    │
    │ pg Pool
    ▼
Supabase PostgreSQL
```

Bukan:

```text
React
   │
   └── langsung SELECT Supabase
```

Dengan demikian `DATABASE_URL` tetap berada di server dan tidak masuk bundle browser.

---

# 4. Environment Variable

Backend branch saat ini menggunakan:

```env
DATABASE_URL=...
```

Pastikan variable tersebut tersedia di Vercel:

```text
Vercel
→ Project
→ Settings
→ Environment Variables
```

Minimal:

```text
DATABASE_URL
```

Gunakan connection string PostgreSQL Supabase yang sesuai untuk serverless/transaction pooling.

Jangan memasukkan:

```text
DATABASE_URL
password database
service role key
```

ke dalam file frontend atau `VITE_*`.

Jangan commit secret ke GitHub.

---

# 5. Mapping Database → Backend API

## 5.1 Invitation

Endpoint:

```http
GET /api/wedding/:uid
```

Contoh:

```http
GET /api/wedding/test-wedding
```

Backend harus mengambil:

```sql
SELECT
  id,
  uid,
  title,
  description,
  groom_name,
  bride_name,
  parent_groom,
  parent_bride,
  wedding_date,
  time,
  location,
  address,
  maps_url,
  maps_embed,
  og_image,
  favicon,
  audio,
  created_at,
  updated_at
FROM public.invitations
WHERE uid = $1
LIMIT 1;
```

Parameter:

```text
$1 = uid
```

Response harus memetakan semua column invitation yang dibutuhkan UI.

Jangan mengubah nama database column tanpa alasan.

---

# 6. Agenda

Untuk invitation:

```text
test-wedding
```

query:

```sql
SELECT
  id,
  invitation_uid,
  title,
  date,
  start_time,
  end_time,
  location,
  address,
  order_index,
  created_at
FROM public.agenda
WHERE invitation_uid = $1
ORDER BY order_index ASC, date ASC;
```

Parameter:

```text
$1 = invitation.uid
```

Response sebaiknya berupa array:

```json
{
  "id": 1,
  "invitation_uid": "test-wedding",
  "title": "Akad Nikah",
  "date": "2026-12-20",
  "start_time": "08:00:00",
  "end_time": "10:00:00",
  "location": "...",
  "address": "...",
  "order_index": 1
}
```

Frontend kemudian menampilkan agenda tanpa harus mengetahui detail SQL.

---

# 7. Banks

Query:

```sql
SELECT
  id,
  invitation_uid,
  bank,
  account_number,
  account_name,
  order_index,
  created_at
FROM public.banks
WHERE invitation_uid = $1
ORDER BY order_index ASC;
```

Response:

```json
{
  "id": 1,
  "invitation_uid": "test-wedding",
  "bank": "BCA",
  "account_number": "1234567890",
  "account_name": "Muhammad Arif",
  "order_index": 1
}
```

Jangan mengekspos credential database.

Data rekening adalah data invitation dan boleh ditampilkan sesuai kebutuhan desain undangan.

---

# 8. Wishes — PRIORITAS UTAMA

Branch ini secara khusus memperbaiki client Wishes.

Frontend saat ini memanggil:

```text
GET  /api/test-wedding/wishes?limit=50&offset=0
POST /api/test-wedding/wishes
GET  /api/test-wedding/wishes/check/:name
DELETE /api/test-wedding/wishes/:id
GET  /api/test-wedding/wishes/stats
```

Source `src/services/api.js` saat ini secara eksplisit memanggil endpoint tersebut.

Backend harus menggunakan tabel:

```text
public.wishes
```

dengan:

```text
invitation_uid = 'test-wedding'
```

---

## 8.1 GET Wishes

Endpoint:

```http
GET /api/test-wedding/wishes?limit=50&offset=0
```

SQL:

```sql
SELECT
  id,
  invitation_uid,
  name,
  message,
  attendance,
  created_at
FROM public.wishes
WHERE invitation_uid = $1
ORDER BY created_at DESC
LIMIT $2
OFFSET $3;
```

Parameter:

```text
$1 = "test-wedding"
$2 = limit
$3 = offset
```

Validasi:

```text
limit:
1 - 100

offset:
>= 0
```

Jangan memasukkan nilai query string langsung ke SQL string.

Gunakan parameterized query.

---

# 9. POST Wish

Endpoint:

```http
POST /api/test-wedding/wishes
Content-Type: application/json
```

Body:

```json
{
  "name": "Budi",
  "message": "Selamat menempuh hidup baru!",
  "attendance": "ATTENDING"
}
```

SQL:

```sql
INSERT INTO public.wishes (
  invitation_uid,
  name,
  message,
  attendance
)
VALUES (
  $1,
  $2,
  $3,
  $4
)
RETURNING
  id,
  invitation_uid,
  name,
  message,
  attendance,
  created_at;
```

Parameter:

```text
$1 = "test-wedding"
$2 = name
$3 = message
$4 = attendance
```

Valid attendance:

```text
ATTENDING
NOT_ATTENDING
MAYBE
```

Jangan menerima nilai lain.

---

# 10. Check Duplicate Wish

Endpoint:

```http
GET /api/test-wedding/wishes/check/:name
```

Query:

```sql
SELECT
  id
FROM public.wishes
WHERE invitation_uid = $1
  AND LOWER(name) = LOWER($2)
LIMIT 1;
```

Response:

Jika ditemukan:

```json
{
  "success": true,
  "data": {
    "hasSubmitted": true
  }
}
```

Jika tidak ditemukan:

```json
{
  "success": true,
  "data": {
    "hasSubmitted": false
  }
}
```

Jangan menganggap nama tamu sebagai unique global. Scope uniqueness harus berdasarkan:

```text
invitation_uid + name
```

---

# 11. DELETE Wish

Endpoint:

```http
DELETE /api/test-wedding/wishes/:id
```

SQL:

```sql
DELETE FROM public.wishes
WHERE id = $1
  AND invitation_uid = $2
RETURNING id;
```

Parameter:

```text
$1 = wish id
$2 = "test-wedding"
```

Penting:

Jangan membuat DELETE yang hanya:

```sql
DELETE FROM wishes WHERE id = $1
```

karena dapat menghapus wish milik invitation lain jika ID diketahui.

---

# 12. Wishes Statistics

Endpoint frontend saat ini:

```text
GET /api/test-wedding/wishes/stats
```

Gunakan:

```sql
SELECT
  COUNT(*)::integer AS total,
  COUNT(*) FILTER (
    WHERE attendance = 'ATTENDING'
  )::integer AS attending,
  COUNT(*) FILTER (
    WHERE attendance = 'NOT_ATTENDING'
  )::integer AS not_attending,
  COUNT(*) FILTER (
    WHERE attendance = 'MAYBE'
  )::integer AS maybe
FROM public.wishes
WHERE invitation_uid = $1;
```

Response:

```json
{
  "success": true,
  "data": {
    "total": 10,
    "attending": 7,
    "not_attending": 1,
    "maybe": 2
  }
}
```

Sesuaikan nama response dengan contract yang sudah dipakai component frontend. Jangan mengubah frontend hanya untuk menyesuaikan SQL jika backend bisa mempertahankan contract yang sudah ada.

---

# 13. Sangat Penting: Jangan Salah Endpoint

Branch `fix/wishes-api-client` saat ini menggunakan:

```text
/api/test-wedding/wishes
```

bukan:

```text
/api/:uid/wishes
```

untuk client yang sedang diperbaiki.

Backend saat ini juga memasang:

```text
/api/test-wedding
```

untuk wishes.

Jangan mengubah endpoint menjadi `/api/wishes` tanpa kebutuhan.

---

# 14. Error Handling API

Semua error API harus menghasilkan JSON.

Contoh:

```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Database connection failed"
  }
}
```

Jangan mengembalikan HTML:

```html
<!doctype html>
<html>
...
```

Ini penting karena frontend melakukan:

```js
response.json()
```

Jika Vercel mengembalikan HTML, browser akan menghasilkan:

```text
Unexpected token '<', "<!doctype "... is not valid JSON
```

Jadi error handling backend harus konsisten JSON.

---

# 15. Cegah React Error #31

Frontend tidak boleh merender object `Error` langsung.

Salah:

```jsx
<div>{error}</div>
```

Benar:

```jsx
<div>{error?.message || "Failed to load wishes"}</div>
```

Namun jangan melakukan perubahan ini sebelum memastikan API benar-benar mengembalikan JSON.

Error React sebelumnya kemungkinan merupakan efek dari API response yang salah.

---

# 16. Database Health Check

Backend branch sudah menyediakan:

```http
GET /api/health
```

Expected:

```json
{
  "success": true,
  "service": "wedding-api"
}
```

Database health:

```http
GET /api/health/db
```

Expected:

```json
{
  "success": true,
  "database": "connected"
}
```

Jika hasilnya:

```text
503
DATABASE_ERROR
```

maka jangan mengubah query Wishes.

Periksa:

```text
DATABASE_URL
```

terlebih dahulu.

---

# 17. Urutan Implementasi

Junior developer / AI harus mengikuti urutan ini.

## Phase 1 — Inspect

Periksa:

```text
src/server/index.js
src/server/db/client.js
src/routes/wishes.js
src/routes/wedding.js
src/services/api.js
package.json
vercel.json
api/[...route].js
```

Cari semua:

```text
SELECT
INSERT
UPDATE
DELETE
FROM invitations
FROM agenda
FROM banks
FROM wishes
```

Tujuannya memastikan nama column yang digunakan query benar-benar cocok dengan Supabase.

---

## Phase 2 — Database Connection

Pastikan:

```text
DATABASE_URL
```

terbaca backend.

Tambahkan/test:

```text
GET /api/health/db
```

Jangan log password atau connection string lengkap.

---

## Phase 3 — Invitation

Implementasikan:

```text
GET /api/wedding/:uid
```

Pastikan response mengambil:

```text
invitations
agenda
banks
```

dan memetakan:

```text
invitations.uid
    ↓
agenda.invitation_uid
banks.invitation_uid
```

---

## Phase 4 — Wishes GET

Implementasikan:

```text
GET /api/test-wedding/wishes?limit=50&offset=0
```

Test langsung dengan Postman.

Response harus JSON.

---

## Phase 5 — Wishes POST

Implementasikan:

```text
POST /api/test-wedding/wishes
```

Body:

```json
{
  "name": "Test User",
  "message": "Test wish",
  "attendance": "ATTENDING"
}
```

Pastikan row masuk ke Supabase.

---

## Phase 6 — Check

Test:

```text
GET /api/test-wedding/wishes/check/Test%20User
```

---

## Phase 7 — Stats

Test:

```text
GET /api/test-wedding/wishes/stats
```

---

## Phase 8 — Delete

Test DELETE hanya pada data test.

---

# 18. Test Database Langsung di Supabase

Sebelum debugging frontend, jalankan:

```sql
SELECT * 
FROM public.invitations
WHERE uid = 'test-wedding';

SELECT *
FROM public.agenda
WHERE invitation_uid = 'test-wedding'
ORDER BY order_index;

SELECT *
FROM public.banks
WHERE invitation_uid = 'test-wedding'
ORDER BY order_index;

SELECT *
FROM public.wishes
WHERE invitation_uid = 'test-wedding'
ORDER BY created_at DESC;
```

Semua query harus dapat dijalankan.

---

# 19. Test dengan Postman

## Health

```http
GET https://YOUR_DOMAIN/api/health
```

## DB

```http
GET https://YOUR_DOMAIN/api/health/db
```

## Invitation

```http
GET https://YOUR_DOMAIN/api/wedding/test-wedding
```

## Wishes GET

```http
GET https://YOUR_DOMAIN/api/test-wedding/wishes?limit=50&offset=0
```

## Wishes POST

```http
POST https://YOUR_DOMAIN/api/test-wedding/wishes
Content-Type: application/json
```

Body:

```json
{
  "name": "Postman Test",
  "message": "Testing Supabase wishes",
  "attendance": "ATTENDING"
}
```

## Wishes Check

```http
GET https://YOUR_DOMAIN/api/test-wedding/wishes/check/Postman%20Test
```

## Wishes Stats

```http
GET https://YOUR_DOMAIN/api/test-wedding/wishes/stats
```

---

# 20. Test Production

Urutan wajib:

```text
1. /api/health
2. /api/health/db
3. /api/wedding/test-wedding
4. /api/test-wedding/wishes
5. POST /api/test-wedding/wishes
6. /api/test-wedding/wishes/check/:name
7. /api/test-wedding/wishes/stats
8. Frontend Open Invitation
9. Wishes tampil
10. Submit Wishes
```

Jangan langsung menguji frontend.

---

# 21. Acceptance Criteria

Implementasi dianggap selesai jika:

### Database

- [ ] `invitations` terbaca
- [ ] `agenda` terbaca
- [ ] `banks` terbaca
- [ ] `wishes` terbaca
- [ ] foreign key menggunakan `invitation_uid → invitations.uid`

### Backend

- [ ] `/api/health` menghasilkan JSON
- [ ] `/api/health/db` menghasilkan connected
- [ ] `/api/wedding/test-wedding` menghasilkan JSON
- [ ] `/api/test-wedding/wishes` menghasilkan JSON
- [ ] POST wishes berhasil
- [ ] duplicate check berhasil
- [ ] stats berhasil
- [ ] DELETE berhasil
- [ ] error response selalu JSON

### Frontend

- [ ] Invitation berhasil dibuka
- [ ] data groom/bride tampil
- [ ] agenda tampil
- [ ] bank tampil
- [ ] wishes tampil
- [ ] form wish berhasil submit
- [ ] attendance tersimpan
- [ ] tidak ada `Unexpected token '<'`
- [ ] tidak ada React error #31
- [ ] tidak merender object Error secara langsung

### Production

- [ ] Vercel Function terdeteksi
- [ ] API tidak mengembalikan Vercel `NOT_FOUND`
- [ ] API tidak mengembalikan `<!doctype html>`
- [ ] `DATABASE_URL` hanya tersedia di server
- [ ] tidak ada secret yang masuk Git
- [ ] production API berhasil dites via Postman

---

# 22. Hal yang TIDAK BOLEH Dilakukan

Junior/AI harus berhenti dan meminta review sebelum:

- Mengubah schema Supabase.
- Menghapus tabel.
- Mengubah nama column.
- Mengubah `uid`.
- Mengubah foreign key.
- Mengubah API contract tanpa alasan.
- Mengganti `DATABASE_URL` dengan credential hardcoded.
- Menaruh password Supabase di frontend.
- Menggunakan `VITE_DATABASE_URL`.
- Menyalin seluruh logic database ke React.
- Membuat API kedua yang menduplikasi Hono.
- Mengatasi error API dengan hardcoded mock data.
- Mengembalikan `index.html` untuk request `/api/*`.

---

# 23. Prinsip Implementasi

Gunakan prinsip:

```text
Supabase PostgreSQL
        ↓
     pg Pool
        ↓
      Hono
        ↓
    API JSON
        ↓
React/Vite
```

Database adalah source of truth untuk data.

Hono adalah source of truth untuk business/API logic.

React hanya bertugas mengambil dan menampilkan data.

---

# 24. Final Deliverables

Setelah selesai, junior/AI harus memberikan:

1. Daftar file yang diubah.
2. SQL/query yang digunakan.
3. Mapping column database → API response.
4. Endpoint yang berhasil.
5. Screenshot/hasil Postman.
6. Hasil `bun run build`.
7. Hasil test production.
8. Penjelasan jika ada column database yang tidak digunakan.
9. Penjelasan jika ada perbedaan antara API contract lama dan schema baru.

Jangan mengklaim selesai hanya karena build berhasil.

**Definition of Done adalah API production berhasil membaca dan menulis data Supabase.**
