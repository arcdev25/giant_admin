# Job Manager

Separate Next.js app to manage the jobs shown on the company career page.
Login → add / edit / delete jobs → enable or disable each one. Disabled jobs never appear on the career page.

Job fields: title, department, location, type, **About us**, **What you'll do**, **What we're looking for**, **Nice to have**, **What we offer**.

## 1. Run locally

```bash
npm install
npm run dev        # http://localhost:4000
```

Without Supabase configured, jobs are saved to `data/jobs.json` (dev only).

## 2. Free database: Supabase

1. Create a free project at https://supabase.com
2. SQL Editor → paste `supabase/schema.sql` → Run
3. Project Settings → API → copy **Project URL** and the **service_role** key
4. Put them in `.env.local` (and in Vercel env vars):
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

The service_role key is server-only — never expose it in the company website.

## 3. Login

Set in `.env.local` / Vercel:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH` — create with `npm run hash -- "YourPassword"`
- `SESSION_SECRET` — any random 32+ character string

Change the password before going live if it was ever shared in plain text.

## 4. Deploy (Vercel)

Push this folder to its own Git repo, import it in Vercel, add the env vars above plus
`ALLOWED_ORIGIN=https://your-company-site.com`, deploy.

## 5. Connect the company website

In the company site's `.env`:

```
VITE_API_URL=https://<your-job-manager>.vercel.app
```

The site's existing code calls `GET /api/jobs/list` and reads `{ jobs: [...] }` — this app serves exactly that,
returning **only enabled jobs**. (`GET /api/jobs` returns the same list as a plain array.)

## API

| Route | Auth | Purpose |
| --- | --- | --- |
| `GET /api/jobs/list`, `GET /api/jobs` | public | enabled jobs only |
| `GET/POST /api/admin/jobs` | admin | list all / create |
| `PUT/PATCH/DELETE /api/admin/jobs/:id` | admin | edit / enable-disable / delete |
