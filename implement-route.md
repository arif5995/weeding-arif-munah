# Migration Plan — Replace Config Data with Supabase Database

## 1. Objective

Migrasikan seluruh component frontend yang saat ini menggunakan data dari `config`, static object, mock data, hardcoded data, atau configuration file agar menggunakan data dari database Supabase melalui API.

### Target architecture

```text
BEFORE

Component
   ↓
config
   ↓
static data


AFTER

Component
   ↓
fetch()
   ↓
API Route
   ↓
Supabase
   ↓
JSON Response
   ↓
Component
```

Tujuan utama:

* Tidak ada lagi data invitation yang berasal dari `config`.
* Tidak ada hardcoded wedding data di component.
* Data invitation berasal dari Supabase.
* Data bank berasal dari Supabase.
* Data agenda berasal dari Supabase.
* Data wishes berasal dari Supabase.
* Semua component menggunakan data API.
* Dynamic `uid` digunakan untuk menentukan invitation.
* Existing UI/design tetap dipertahankan.

---

# 2. Important Rules

## Jangan lakukan

Jangan langsung melakukan:

```text
Component → Supabase
```

terutama menggunakan:

```text
SUPABASE_SERVICE_ROLE_KEY
```

Service role key hanya boleh berada di server.

Frontend harus menggunakan:

```text
Component
    ↓
fetch('/api/...')
    ↓
Backend
    ↓
Supabase
```

---

# 3. Audit Semua Penggunaan Config

Sebelum mengubah code, lakukan pencarian seluruh project.

Cari:

```text
config
```

Kemudian cari pola seperti:

```text
import ... from './config'
import ... from '../config'
import ... from '@/config'
```

Cari juga:

```text
weddingConfig
invitationConfig
siteConfig
eventConfig
bankConfig
agendaConfig
coupleConfig
wishesConfig
```

Cari hardcoded data:

```text
groom
bride
bank
account
agenda
event
location
address
wishes
```

Cari penggunaan object:

```text
config.xxx
CONFIG.xxx
settings.xxx
data.xxx
```

Cari mock/static data:

```text
mock
dummy
sample
default
fallback
```

---

# 4. Buat Data Dependency Map

Sebelum coding, buat daftar component.

Contoh:

```text
src/components/
├── Hero
├── Couple
├── Event
├── Agenda
├── BankAccount
├── Wishes
├── Gallery
├── Story
├── Gift
└── ...
```

Untuk setiap component tentukan:

| Component | Sumber sekarang | Sumber baru                |
| --------- | --------------- | -------------------------- |
| Hero      | config          | invitations API            |
| Couple    | config          | invitations API            |
| Event     | config          | agenda API                 |
| Agenda    | config          | agenda API                 |
| Bank      | config          | bank API                   |
| Wishes    | config          | wishes API                 |
| location  | config          | invitations API(Maps Url and Maps embed)           |

Jangan mengubah component sebelum mengetahui sumber database untuk data tersebut.

---

# 5. Mapping Config → Database

Buat mapping eksplisit.

Contoh:

```text
config.groomName
        ↓
invitations.groom_name

config.brideName
        ↓
invitations.bride_name

config.title
        ↓
invitations.title

config.description
        ↓
invitations.description
```

Untuk agenda:

```text
config.events
        ↓
agenda table
```

Bank:

```text
config.bankAccounts
        ↓
bank table
```

Wishes:

```text
config.wishes
        ↓
wishes table
```

Jika suatu property di `config` **belum memiliki kolom/tabel Supabase**, jangan membuat data palsu.

Catat:

```text
MISSING DATABASE FIELD
```

dan laporkan sebelum mengubah schema.

---

# 6. API Layer

Gunakan endpoint:

```text
GET /api/:uid/invitations
GET /api/:uid/bank
GET /api/:uid/agenda
GET /api/:uid/wishes
POST /api/:uid/wishes
```

Contoh:

```text
/api/test-wedding/invitations
/api/test-wedding/bank
/api/test-wedding/agenda
/api/test-wedding/wishes
```

Semua component harus menggunakan API tersebut.

---

# 7. Create Central API Client

Jangan membuat fetch berulang dengan logic berbeda di setiap component.

Buat satu API helper/service.

Contoh konsep:

```js
api.getInvitation(uid)
api.getBank(uid)
api.getAgenda(uid)
api.getWishes(uid)
api.submitWish(uid, payload)
```

API client bertanggung jawab untuk:

* fetch
* JSON parsing
* HTTP error handling
* response normalization

Component bertanggung jawab untuk:

* loading
* rendering
* user interaction

---

# 8. Create Invitation Data Hook

Jika project menggunakan React, buat centralized hook.

Contoh konsep:

```js
useInvitation(uid)
```

Hook bertanggung jawab mengambil:

```text
invitation
bank
agenda
wishes
```

Jika lebih sesuai dengan struktur project, boleh dibuat beberapa hook:

```text
useInvitation()
useBank()
useAgenda()
useWishes()
```

Jangan membuat hook baru jika project sudah memiliki data-fetching abstraction yang bisa digunakan.

---

# 9. Remove Config Dependency

Setiap component yang sebelumnya:

```js
const { groomName, brideName } = config;
```

harus berubah menjadi:

```js
const { invitation } = useInvitation();
```

Kemudian gunakan:

```js
invitation.groom_name
invitation.bride_name
```

atau gunakan normalization layer agar component tetap menggunakan naming convention frontend yang konsisten.

---

# 10. Recommended Normalization

Jika database menggunakan:

```text
groom_name
bride_name
account_number
start_time
```

sedangkan frontend menggunakan:

```text
groomName
brideName
accountNumber
startTime
```

jangan mengubah semua component satu per satu hanya karena perbedaan naming.

Gunakan transformation/mapper:

```text
Supabase
   ↓
API
   ↓
Mapper
   ↓
Frontend Model
   ↓
Component
```

Contoh:

```js
{
  groom_name: "Arif",
  bride_name: "Muna"
}
```

menjadi:

```js
{
  groomName: "Arif",
  brideName: "Muna"
}
```

Dengan begitu UI component tetap clean.

---

# 11. Remove Hardcoded Invitation Data

Cari dan hapus data seperti:

```js
const groomName = "Arif";
const brideName = "Muna";
```

atau:

```js
const wedding = {
  groom: "...",
  bride: "..."
};
```

Jika data tersebut seharusnya berasal dari database.

Jangan menghapus hardcoded value yang memang merupakan:

* label UI
* icon
* translation
* constant teknis
* default styling
* configuration teknis aplikasi

Yang dipindahkan adalah **business/content data**.

---

# 12. Hero Component

Hero harus mengambil data dari invitation API.

Contoh data:

```text
title
description
groom_name
bride_name
```

Flow:

```text
Hero
 ↓
invitation data
 ↓
render
```

Tidak boleh:

```text
Hero
 ↓
config
```

---

# 13. Couple Component

Data:

```text
groom_name
bride_name
```

harus berasal dari:

```text
GET /api/:uid/invitations
```

Jika component membutuhkan foto atau informasi tambahan:

* gunakan field database jika tersedia,
* atau API response yang menyediakan field tersebut.

Jangan membuat URL/data palsu.

---

# 14. Location Component

Data:

```text
maps_embed
maps_url
location
address
wedding_date
time
```

harus berasal dari:

```text
GET /api/:uid/invitations
```
Tidak boleh lagi:

```js
config.events
```
---

# 15. Event / Agenda Components

Semua component yang menampilkan:

* tanggal acara
* waktu acara
* lokasi
* alamat
* akad
* resepsi
* event lainnya

harus menggunakan:

```text
GET /api/:uid/agenda
```

Tidak boleh lagi:

```js
config.events
```

Pastikan component mendukung lebih dari satu agenda.

---

# 16. Bank Component

Semua component yang menampilkan:

* bank
* nomor rekening
* nama pemilik rekening

harus menggunakan:

```text
GET /api/:uid/bank
```

Jangan menyimpan:

```js
const bankAccounts = [...]
```

di frontend.

---

# 17. Wishes Component

Wishes harus menggunakan:

```text
GET /api/:uid/wishes
```

Untuk submit:

```text
POST /api/:uid/wishes
```

Flow:

```text
User
 ↓
Wish Form
 ↓
POST API
 ↓
Supabase
 ↓
Success
 ↓
Refresh/update wishes
 ↓
Render
```

Tidak boleh menggunakan:

```js
config.wishes
```

sebagai source utama.

---


# 18. Search Again After Migration

Setelah semua component selesai, lakukan pencarian ulang.

Cari:

```text
config.
```

Cari:

```text
weddingConfig
```

Cari:

```text
mock
```

Cari:

```text
dummy
```

Cari:

```text
sample
```

Cari property wedding yang masih hardcoded.

Target:

```text
No business data from config
```

---

# 19. Remove Unused Config

Jangan langsung menghapus file config.

Pertama pastikan:

```text
config import count = 0
```

Jika sudah tidak digunakan:

1. hapus import,
2. hapus file config jika memang khusus wedding data,
3. jalankan build,
4. jalankan lint,
5. test frontend.

Jika config masih digunakan untuk application settings, **jangan dihapus**.

Pisahkan:

```text
application config
```

dengan:

```text
wedding content data
```

---

# 20. Loading State

Karena data sekarang asynchronous, semua component harus menangani:

```text
loading
success
empty
error
```

Contoh:

```text
LOADING
   ↓
SUCCESS → render data

LOADING
   ↓
EMPTY → empty state

LOADING
   ↓
ERROR → error state
```

Jangan mengakses:

```js
invitation.groomName
```

sebelum data tersedia.

---

# 21. Prevent Component Crash

Hindari langsung:

```js
data.items.map(...)
```

jika data belum tersedia.

Gunakan state yang aman atau conditional rendering.

Contoh konsep:

```text
if loading
    render loading

if error
    render error

if empty
    render empty state

otherwise
    render component
```

---

# 22. UID Handling

UID tidak boleh hardcoded.

Contoh yang salah:

```js
fetch('/api/test-wedding/invitations')
```

Untuk production component harus mengambil UID dari:

```text
URL parameter
route parameter
query parameter
atau mechanism existing project
```

Contoh:

```text
/wedding/test-wedding
```

maka:

```text
uid = test-wedding
```

kemudian:

```text
/api/test-wedding/invitations
```

---

# 23. Do Not Break Existing UI

Migrasi data **bukan redesign UI**.

Jangan mengubah:

* layout
* typography
* animation
* color
* spacing
* responsive behavior
* component structure

kecuali diperlukan untuk asynchronous data.

Target:

```text
UI BEFORE
     ↓
same UI
     ↓
different data source
```

---

# 24. Test With Local Vercel

Gunakan:

```bash
bunx vercel dev
```

Kemudian buka invitation menggunakan UID yang tersedia.

Contoh:

```text
test-wedding
```

Pastikan browser network menunjukkan request:

```text
GET /api/test-wedding/invitations
GET /api/test-wedding/bank
GET /api/test-wedding/agenda
GET /api/test-wedding/wishes
```

---

# 25. Postman Test

Sebelum menyalahkan frontend, test API menggunakan Postman.

### Invitations

```http
GET /api/test-wedding/invitations
```

Expected:

```text
200
```

### Bank

```http
GET /api/test-wedding/bank
```

Expected:

```text
200
```

### Agenda

```http
GET /api/test-wedding/agenda
```

Expected:

```text
200
```

### Wishes

```http
GET /api/test-wedding/wishes
```

Expected:

```text
200
```

### Submit Wish

```http
POST /api/test-wedding/wishes
```

Body:

```json
{
  "name": "Postman Test",
  "message": "Testing migration"
}
```

Expected:

```text
201
```

---

# 25. Test Database Changes

Setelah POST wishes berhasil:

```text
POST wishes
    ↓
Supabase
    ↓
GET wishes
```

Pastikan data baru muncul.

Jangan hanya melihat response POST.

---

# 26. Frontend Regression Test

Test semua section:

* [ ] Hero
* [ ] Couple
* [ ] Countdown
* [ ] Event
* [ ] Agenda
* [ ] Bank
* [ ] Gallery
* [ ] Story
* [ ] Gift
* [ ] Wishes
* [ ] Footer
* [ ] Semua component lain yang sebelumnya menggunakan config

Untuk setiap component:

```text
Data benar
Loading benar
Empty state benar
Error tidak crash
Mobile benar
Desktop benar
```

---

# 27. Search-Based Verification

Sebelum selesai jalankan pencarian source code.

### Search 1

```text
config.
```

### Search 2

```text
weddingConfig
```

### Search 3

```text
mock
```

### Search 4

```text
dummy
```

### Search 5

```text
sample wedding data
```

### Search 6

```text
hardcoded groom/bride/bank/event data
```

Setiap hasil harus diperiksa satu per satu.

Jangan sekadar menghapus semua `config`.

---

# 28. Build & Lint

Jalankan:

```bash
bun run build
```

Kemudian:

```bash
bun run lint
```

Keduanya harus berhasil.

Jika ada error sebelum migration, catat sebagai:

```text
PRE-EXISTING ERROR
```

Jika error muncul karena perubahan migration, wajib diperbaiki.

---

# 29. Final Architecture

Target akhir:

```text
                    ┌───────────────┐
                    │   Supabase    │
                    │   PostgreSQL  │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   API Layer   │
                    │               │
                    │ invitations   │
                    │ bank          │
                    │ agenda        │
                    │ wishes        │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  API Client   │
                    │ / Data Hooks  │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Components  │
                    │               │
                    │ Hero          │
                    │ Couple        │
                    │ Agenda        │
                    │ Bank          │
                    │ Wishes        │
                    │ etc.          │
                    └───────────────┘
```

---

# 30. Definition of Done

Migration dianggap selesai jika:

* [ ] Semua component sudah diaudit.
* [ ] Semua penggunaan wedding `config` sudah diidentifikasi.
* [ ] Semua business/content data sudah menggunakan API.
* [ ] Invitation menggunakan Supabase.
* [ ] Couple menggunakan Supabase.
* [ ] Event menggunakan Supabase.
* [ ] Agenda menggunakan Supabase.
* [ ] Bank menggunakan Supabase.
* [ ] Wishes menggunakan Supabase.
* [ ] Wishes dapat di-submit.
* [ ] Tidak ada business data wedding yang hardcoded.
* [ ] Tidak ada direct Supabase service-role access dari frontend.
* [ ] UID bersifat dynamic.
* [ ] Loading state tersedia.
* [ ] Empty state tersedia.
* [ ] Error state tersedia.
* [ ] Existing UI tidak berubah secara tidak perlu.
* [ ] `bunx vercel dev` berhasil.
* [ ] Semua API berhasil di-test dengan Postman.
* [ ] `bun run build` berhasil.
* [ ] `bun run lint` berhasil.
* [ ] Tidak ada regression.

---

# 31. Required Final Report

Developer/AI harus memberikan laporan:

```text
# Migration Report

## Config Audit

Total component diperiksa:
...

Component yang sebelumnya menggunakan config:
...

## Migrated Components

- Hero: DONE
- Couple: DONE
- Event: DONE
- Agenda: DONE
- Bank: DONE
- Wishes: DONE
- Other: DONE

## API

- Invitations: PASS
- Bank: PASS
- Agenda: PASS
- Wishes GET: PASS
- Wishes POST: PASS

## Config Dependency

Remaining wedding config usage:
NONE

atau:

- file/path
- alasan masih digunakan

## Testing

bunx vercel dev: PASS
Postman: PASS
bun run build: PASS
bun run lint: PASS

## Changed Files

- ...
- ...
- ...

## Issues

- None
```

# 32. Critical Instruction for AI Developer

**Jangan langsung mengubah seluruh project dalam satu langkah.**

Kerjakan secara bertahap:

```text
PHASE 1
Audit config
↓
PHASE 2
Verify database schema
↓
PHASE 3
Verify/create API
↓
PHASE 4
Test API with Postman
↓
PHASE 5
Create API client/hooks
↓
PHASE 6
Migrate components
↓
PHASE 7
Remove config dependency
↓
PHASE 8
Frontend testing
↓
PHASE 9
Build + lint
↓
PHASE 10
Final regression test
```

Setelah setiap phase selesai, periksa hasilnya sebelum melanjutkan ke phase berikutnya.

**Jangan membuat asumsi terhadap schema Supabase. Jika sebuah data yang ada di `config` tidak memiliki representasi di database, laporkan terlebih dahulu daripada membuat field/database palsu.**
