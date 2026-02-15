# Deploy Argus to a dev server

Get the app running on a public URL (e.g. `https://argus-xxx.vercel.app`) using your existing **Supabase** project for database and auth.

---

## Option 1: Vercel (recommended)

**Vercel** hosts the Next.js app. **Supabase** stays your database and auth (no extra DB to create).

### 1. Push code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/argus.git
git push -u origin main
```

Create the repo on [github.com](https://github.com/new) first if needed.

---

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. **Add New** → **Project** → import your **argus** repo.
3. **Configure:**
   - Framework: **Next.js**
   - Build Command: `npm run build` (already in package.json: `prisma generate && prisma db push && next build`)
   - Root: `./`
4. **Environment Variables** — add these (use the same values as in your `.env.local`):

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxxxx.supabase.co`) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
   | `DATABASE_URL` | Your Supabase Postgres connection string (same as local) |

5. Click **Deploy**. Wait for the build to finish. Note your URL, e.g. `https://argus-xxx.vercel.app`.

---

### 3. Allow your dev URL in Supabase Auth

So login/signup and redirects work on the dev domain:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. **Authentication** → **URL Configuration**.
3. Set **Site URL** to your dev URL, e.g. `https://argus-xxx.vercel.app` (no trailing slash).
4. Under **Redirect URLs**, add:
   - `https://argus-xxx.vercel.app/**`
   - `https://argus-xxx.vercel.app/auth/callback`
   (Replace with your real Vercel URL.)
5. Save.

---

### 4. Test on the dev server

1. Open `https://YOUR_VERCEL_URL.vercel.app`.
2. Sign up or log in → you should land on the dashboard.
3. Create an issue (Create Project) → it should appear in the list.
4. Log out and open `/dashboard` → should redirect to login.

---

## Option 2: Railway (app + optional separate DB)

Use this if you prefer to run the app on Railway. You can keep using Supabase for DB and auth.

1. [railway.app](https://railway.app) → **New Project**.
2. **+ New** → **GitHub Repo** → select **argus**.
3. In the **argus** service:
   - **Variables** → add:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
     - `DATABASE_URL` = your Supabase Postgres URL (same as local)
4. **Settings** → **Deploy**:
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Root: `/`
5. Deploy. Copy the public URL (e.g. `https://argus-production-xxx.up.railway.app`).
6. In **Supabase** → **Authentication** → **URL Configuration**, set **Site URL** and **Redirect URLs** to that Railway URL (same pattern as in Option 1, step 3).
7. Redeploy if needed.

---

## Option 3: Render

1. [render.com](https://render.com) → **New** → **Web Service** → connect your GitHub repo.
2. Environment: **Node**.
   - Build: `npm install && npm run build`
   - Start: `npm start`
3. **Environment** → add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL` (same as local).
4. Deploy. Use the assigned URL (e.g. `https://argus.onrender.com`) in Supabase **Authentication** → **URL Configuration** (Site URL + Redirect URLs), then redeploy if needed.

---

## Google sign-in on the dev server

If you use “Sign in with Google”:

1. [Google Cloud Console](https://console.cloud.google.com/) → your project → **Credentials** → your OAuth client.
2. **Authorized redirect URIs** → add:
   - `https://YOUR_DEV_URL/auth/callback`
   Example: `https://argus-xxx.vercel.app/auth/callback`
3. In Supabase: **Authentication** → **Providers** → **Google** → ensure Client ID and Secret are set.
4. Redeploy the app if you changed env or Supabase URLs.

---

## Checklist

- [ ] Code on GitHub.
- [ ] App deployed (Vercel / Railway / Render) with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`.
- [ ] Supabase **Authentication** → **URL Configuration**: Site URL and Redirect URLs set to your dev URL.
- [ ] Sign up, log in, create issue, and redirect to login tested on the dev URL.

After this, your app runs on a dev server with Supabase auth and issues.
