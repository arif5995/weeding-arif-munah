1. Jangan melakukan refactor besar.
2. Jangan mengganti framework.
3. Jangan mengganti database.
4. Jangan menghapus API existing.
5. Jangan mengubah schema database.
6. Jangan mengubah frontend sebelum API 404 selesai.
7. Jangan mengubah authentication.
8. Jangan mengubah environment variable value.
9. Jangan commit file .env.
10. Setiap perubahan harus dijelaskan alasannya.
11. Setelah setiap perubahan jalankan git diff.
12. Perubahan maksimal 1-3 file per iterasi.
13. Test lokal sebelum commit.
14. Jika solusi tidak terbukti, rollback perubahan tersebut.

You are debugging a React/Vite + Hono + Vercel application.

Repository:
https://github.com/arif5995/weeding-arif-munah

Problem:

The application works locally, but after deployment to Vercel the frontend receives:

GET /api/invitation/test-wedding 404 (Not Found)

The browser also shows:

Minified React error #31

Important:
The API works in the local development environment.
The problem only occurs after deployment to Vercel.

Your task is to diagnose and fix the Vercel deployment issue.

DO NOT immediately refactor the project.

First inspect:

- package.json
- vercel.json
- api/[...route].js
- src/server/index.js
- src/server/server.js
- src/server/routes/*
- vite.config.*
- .env.example

Determine:

1. What file is the Hono application entry point?
2. What file starts the local development server?
3. How is the API exposed locally?
4. How is the API supposed to be exposed as a Vercel Function?
5. Whether Vercel recognizes api/[...route].js as a serverless function.
6. Whether vercel.json rewrites /api/* incorrectly.
7. Whether the API uses environment variables that are missing on Vercel.
8. Whether the Vercel runtime is compatible with the current server implementation.

The first objective is ONLY to fix:

GET /api/invitation/test-wedding → 404

Do not fix React error #31 until the API endpoint works.

Preferred architecture:

Frontend:
Vite/React

API:
Vercel Function
    ↓
api/[...route].js
    ↓
src/server/index.js
    ↓
Hono
    ↓
database

If api/[...route].js is incorrectly configured, make the smallest possible change.

For Hono + Vercel, verify whether the correct handler is:

import { handle } from "hono/vercel";
import app from "../src/server/index.js";

export default handle(app);

Do not assume this is the solution. Verify it against the existing project structure before changing it.

After every change:

1. Run git diff.
2. Run the relevant build/test command.
3. Explain why the change should fix the Vercel 404.
4. Do not modify unrelated files.

Do not expose secrets from .env files.

After the code fix, explain:

- root cause
- files changed
- why it works locally but failed on Vercel
- how to verify the API after deployment
- what to investigate if the response changes from 404 to 500

Success criteria:

https://munaharif-wedding.vercel.app/api/invitation/test-wedding

must reach the Hono API instead of returning a Vercel NOT_FOUND 404.

Only after this succeeds should you investigate React error #31.