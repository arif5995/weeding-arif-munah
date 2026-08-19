Target akhirnya:

Vercel
│
├── Frontend
│   └── React + Vite
│
└── Backend
    └── Hono → Vercel Functions
         │
         └── PostgreSQL / database

Dan endpoint:

GET /api/test-wedding/wishes?limit=50&offset=0

harus berjalan.

1. Arsitektur target

Saya menyarankan jangan mempertahankan struktur Cloudflare Workers lama lalu dipaksa berjalan di Vercel.

Refactor menjadi:

weeding-arif-munah/
│
├── api/
│   └── [[...route]].js
│
├── src/
│   ├── client/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── ...
│   │
│   ├── server/
│   │   ├── index.js
│   │   ├── routes/
│   │   │   ├── wishes.js
│   │   │   ├── wedding.js
│   │   │   └── ...
│   │   │
│   │   ├── services/
│   │   │   ├── wishes.service.js
│   │   │   └── ...
│   │   │
│   │   ├── db/
│   │   │   ├── client.js
│   │   │   └── ...
│   │   │
│   │   └── middleware/
│   │
│   └── ...
│
├── public/
│   └── assets/
│
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── .env.example
Prinsipnya

Frontend:

src/client/*

Backend:

src/server/*

Vercel entry point:

api/[[...route]].js

Jadi tidak ada lagi kebingungan antara:

Cloudflare Worker
Vite server
Hono server
Vercel Function
2. Jangan menggunakan Cloudflare Worker sebagai runtime

Ini salah satu pekerjaan paling penting.

Project sekarang memiliki indikasi arsitektur yang awalnya dibuat untuk:

Hono
+
Cloudflare Workers
+
Wrangler

Sedangkan target baru:

Hono
+
Vercel Functions
+
Node.js

Jadi semua dependency/API yang khusus Cloudflare harus diaudit.

Cari seluruh project:

wrangler
cloudflare
c.env
env.
ExecutionContext
DurableObject
KV
D1
R2

Kalau ditemukan, klasifikasikan:

Komponen	Action
Cloudflare-specific	Hapus/refactor
Hono standard	Pertahankan
Database	Pertahankan jika compatible
Environment variable	Refactor
Static assets	Vite/public
API route	Hono
Wrangler config	Tidak digunakan Vercel
3. Buat satu Hono App sebagai API gateway

Saya akan menjadikan:

src/server/index.js

sebagai satu-satunya root API.

Contoh konsep:

import { Hono } from 'hono'


import wishes from './routes/wishes.js'
import wedding from './routes/wedding.js'


const app = new Hono()


app.get('/health', (c) => {
  return c.json({
    success: true,
    service: 'wedding-api'
  })
})


app.route('/test-wedding', wishes)
app.route('/wedding', wedding)


export default app

Dengan begitu:

/api/health
/api/test-wedding/wishes
/api/wedding/...

semuanya melewati satu Hono application.

4. Vercel Function dibuat sangat sederhana

Saya akan membuat:

api/[[...route]].js

yang bertugas sebagai adapter saja.

Konsepnya:

import { handle } from 'hono/vercel'
import app from '../src/server/index.js'


export default handle(app)

Jangan taruh business logic di:

api/[[...route]].js

File itu hanya adapter.

Arsitekturnya:

Request
   ↓
Vercel
   ↓
api/[[...route]].js
   ↓
Hono
   ↓
src/server/routes
   ↓
service
   ↓
database
5. Pisahkan route dan business logic

Jangan membuat route seperti:

app.get('/test-wedding/wishes', async (c) => {


   // query database


   // validation


   // pagination


   // transformation


   // response


})

Lebih baik:

routes/
└── wishes.js


services/
└── wishes.service.js

Route:

wishes.get('/wishes', async (c) => {
    const result = await getWishes(...)
    return c.json(result)
})

Service:

export async function getWishes({
    limit,
    offset
}) {
    // database logic
}

Keuntungannya nanti kalau frontend berubah atau API dipakai aplikasi lain, backend tetap mudah dirawat.

6. Database layer harus dipisahkan

Buat:

src/server/db/client.js

Semua koneksi database hanya melalui file tersebut.

Misalnya menggunakan PostgreSQL:

import { Pool } from 'pg'


export const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

Jangan membuat connection baru setiap request:

app.get(... => {
   const db = new Pool(...)
})

karena serverless mempunyai lifecycle yang berbeda.

Gunakan connection pooling/serverless-compatible database jika database Anda memang PostgreSQL.

7. Environment variables

Ini juga harus dibersihkan.

Buat:

.env.example

misalnya:

DATABASE_URL=

Kemudian:

Vercel
→ Project
→ Settings
→ Environment Variables

isi:

DATABASE_URL

Jangan:

DATABASE_URL=...

di-commit ke GitHub.

8. Bedakan environment frontend dan backend

Ini penting untuk Vite.

Variable frontend:

VITE_*

misalnya:

VITE_API_URL=

Tetapi credential database:

DATABASE_URL=

tidak boleh menggunakan prefix:

VITE_DATABASE_URL

karena variable VITE_* dapat masuk ke bundle frontend.

Struktur:

Frontend
   │
   └── VITE_API_URL


Backend
   │
   ├── DATABASE_URL
   ├── SECRET_KEY
   └── ...
9. API URL frontend

Jangan hardcode:

fetch('http://localhost:3000/api/test-wedding/wishes')

atau:

fetch('https://munaharif-wedding.vercel.app/api/...')

Gunakan relative URL:

fetch('/api/test-wedding/wishes?limit=50&offset=0')

Ini jauh lebih bagus.

Development:

localhost
↓
/api

Production:

munaharif-wedding.vercel.app
↓
/api

Tidak perlu mengubah source code.

10. Vercel configuration

Saya akan menyederhanakan vercel.json.

Target:

{
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "outputDirectory": "dist"
}

Jangan langsung menambahkan rewrite SPA kalau belum diperlukan.

Kenapa?

Vercel + Vite sudah bisa menangani static output.

Kalau React Router membutuhkan fallback SPA, baru tambahkan rewrite yang tidak menangkap /api.

Contohnya:

{
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/((?!api(?:/|$)).*)",
      "destination": "/index.html"
    }
  ]
}

Dengan demikian:

/api/*

tidak terkena SPA rewrite.

11. Tambahkan health check

Saya sangat menyarankan endpoint:

GET /api/health

Response:

{
  "success": true,
  "service": "wedding-api"
}

Kemudian:

https://munaharif-wedding.vercel.app/api/health

harus selalu menjadi test pertama.

Urutan debugging:

/api/health
      ↓
/api/test-wedding/wishes
      ↓
database
      ↓
frontend

Jangan langsung debug frontend.

12. Tambahkan endpoint database health

Setelah /api/health berhasil, buat:

GET /api/health/db

Contoh response:

{
  "success": true,
  "database": "connected"
}

Jadi kita bisa membedakan:

Case A
/api/health
❌

→ Vercel Function problem.

Case B
/api/health
✅


/api/health/db
❌

→ database/environment problem.

Case C
/api/health/db
✅


/api/test-wedding/wishes
❌

→ Hono route/business logic problem.

Ini jauh lebih cepat daripada menebak-nebak.

13. Wishes API

Endpoint final:

GET /api/test-wedding/wishes

Parameter:

limit
offset

Contoh:

/api/test-wedding/wishes?limit=50&offset=0

Server harus melakukan validation:

const limit = Math.min(
    Math.max(Number(c.req.query('limit') || 20), 1),
    100
)


const offset = Math.max(
    Number(c.req.query('offset') || 0),
    0
)

Jangan membiarkan user mengirim:

limit=999999999
14. Response API dibuat konsisten

Saya sarankan semua API menggunakan format:

{
  "success": true,
  "data": [],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 100
  }
}

Error:

{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Unable to fetch wishes"
  }
}

Jangan mencampur format response antar endpoint.

15. Error handling global Hono

Tambahkan:

app.onError((err, c) => {
    console.error(err)


    return c.json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error'
        }
    }, 500)
})

Dengan demikian error backend tidak menjadi HTML error page yang membingungkan.

16. CORS

Karena frontend dan backend berada pada domain yang sama:

munaharif-wedding.vercel.app

sebenarnya tidak perlu CORS untuk komunikasi internal.

Gunakan:

fetch('/api/...')

bukan:

fetch('https://api-domain-lain...')

Ini membuat deployment jauh lebih sederhana.

17. Static assets

Assets wedding:

public/assets/images/

tetap dipertahankan.

Contoh:

public/
└── assets/
    └── images/
        ├── flower-white.png
        ├── mandala.png
        └── ...

Frontend:

<img src="/assets/images/flower-white.png" />

Jangan:

<img src="wedding-invitation/public/assets/images/..." />

Path harus berdasarkan public root.

18. Build harus bisa dijalankan lokal

Sebelum deploy:

bun install
bun run build

harus berhasil.

Kemudian:

bun run dev

Frontend harus jalan.

Dan API harus dites.

Idealnya tambahkan script:

{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "typecheck": "...",
    "test": "..."
  }
}
19. Testing wajib sebelum deploy

Saya akan membuat test matrix:

Test	Expected
/	200
/api/health	200
/api/health/db	200
/api/test-wedding/wishes	200
wishes pagination	200
empty wishes	200
invalid limit	400
unknown API	404 JSON
frontend asset	200
React route	200
production build	success