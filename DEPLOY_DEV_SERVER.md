# Deploy Argus to an Online Dev Server

Get your app running on a public URL (e.g. `https://argus-dev.vercel.app`) with a hosted database and auth.

---

## Option 1: Vercel + Railway (recommended)

**Vercel** hosts the Next.js app. **Railway** hosts PostgreSQL. Both have free tiers.

### Step 1: Push code to GitHub

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

### Step 2: Create the database (Railway)

1. Go to [railway.app](https://railway.app) and sign in (e.g. with GitHub).
2. **New Project** → **Deploy from GitHub repo** (or **Empty Project**).
3. If empty: **+ New** → **Database** → **PostgreSQL**.
4. Open the PostgreSQL service → **Variables** tab.
5. Copy **`DATABASE_URL`** (or **Connect** → **Postgres connection URL**).  
   It will look like:  
   `postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:5432/railway`

Keep this URL for the next step.

---

### Step 3: Deploy the app (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New** → **Project** → import your **argus** repo.
3. **Configure Project:**
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Install Command: `npm install` (default)
4. **Environment Variables** — add these (Replace with your real values):

   | Name | Value |
   |------|--------|
   | `DATABASE_URL` | Paste the Railway PostgreSQL URL from Step 2 |
   | `NEXTAUTH_URL` | `https://your-project.vercel.app` *(see below)* |
   | `NEXTAUTH_SECRET` | Output of `openssl rand -base64 32` |

   **Important:** For `NEXTAUTH_URL`:
   - First deploy without it (or use the URL Vercel shows after first deploy).
   - After the first deploy, Vercel will show your URL, e.g. `https://argus-xxx.vercel.app`.
   - Then go to **Settings → Environment Variables**, set `NEXTAUTH_URL` to that exact URL (e.g. `https://argus-xxx.vercel.app`), and **redeploy**.

5. Click **Deploy**. Wait for the build to finish.

---

### Step 4: Run database migrations on the server

Your app uses `prisma db push` for the schema. You need the schema applied to the **hosted** database.

**Option A — From your machine (easiest)**

```bash
# Use the same DATABASE_URL as on Vercel (from Railway)
DATABASE_URL="postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:5432/railway" npx prisma db push
```

**Option B — Vercel build (automatic on each deploy)**

Add to `package.json` scripts:

```json
"build": "prisma generate && prisma db push && next build"
```

Then in Vercel, the build will run `prisma generate`, `prisma db push`, and `next build`. Ensure `DATABASE_URL` is set in Vercel so `prisma db push` runs against Railway.

---

### Step 5: Set NEXTAUTH_URL and redeploy

1. Vercel project → **Settings** → **Environment Variables**.
2. Add or update:
   - `NEXTAUTH_URL` = `https://YOUR_VERCEL_DOMAIN.vercel.app` (no trailing slash).
3. **Redeploy** (Deployments → ⋮ on latest → Redeploy).

---

### Step 6: Test auth online

1. Open `https://YOUR_VERCEL_DOMAIN.vercel.app`.
2. Sign up with email/password → you should land on the dashboard.
3. Log out, then log in again → should work.
4. Open `/dashboard` while logged out → should redirect to login.

---

## Option 2: Railway (app + database together)

One place for both the Next.js app and PostgreSQL.

1. [railway.app](https://railway.app) → **New Project**.
2. **+ New** → **Database** → **PostgreSQL**.
3. **+ New** → **GitHub Repo** → select **argus**.
4. In the **argus** service:
   - **Variables** → **Add variable** → **Reference** → choose `DATABASE_URL` from the PostgreSQL service (Railway will inject it).
   - Add:
     - `NEXTAUTH_SECRET` = `openssl rand -base64 32`
     - `NEXTAUTH_URL` = `https://your-app.up.railway.app` (use the URL Railway gives after first deploy, then set this and redeploy).
5. **Settings** → **Deploy**:
   - Build Command: `npx prisma generate && npx prisma db push && npm run build`
   - Start Command: `npm start`
   - Root Directory: `/`
6. Deploy. After first deploy, set `NEXTAUTH_URL` to the real URL and redeploy.

---

## Option 3: Render

1. [render.com](https://render.com) → **New** → **PostgreSQL** (get internal `DATABASE_URL`).
2. **New** → **Web Service** → connect your GitHub repo.
   - Environment: **Node**.
   - Build: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - Start: `npm start`
3. **Environment** → add `DATABASE_URL` (from Render PostgreSQL), `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your Render URL, e.g. `https://argus.onrender.com`).
4. Deploy. Use the assigned URL for `NEXTAUTH_URL` and redeploy if you set it after first deploy.

---

## Google OAuth on the dev server

If you use “Sign in with Google”:

1. [Google Cloud Console](https://console.cloud.google.com/) → your project → **Credentials** → your OAuth client.
2. **Authorized redirect URIs** → add:
   - `https://YOUR_DEV_URL/api/auth/callback/google`  
   Example: `https://argus-xxx.vercel.app/api/auth/callback/google`
3. In Vercel/Railway/Render, add:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
4. Redeploy.

---

## Checklist for “work online on a dev server”

- [ ] Code on GitHub.
- [ ] Hosted PostgreSQL (Railway / Neon / Render) and `DATABASE_URL` in the app’s env.
- [ ] App deployed (Vercel / Railway / Render) with `NEXTAUTH_URL` = your real dev URL and `NEXTAUTH_SECRET` set.
- [ ] Schema applied: `prisma db push` (from your machine with prod `DATABASE_URL` or in build step).
- [ ] After first deploy, `NEXTAUTH_URL` updated to exact dev URL and redeploy.
- [ ] Sign up / log in / dashboard and redirects tested on the dev URL.
- [ ] (Optional) Google OAuth redirect URI and env vars set if you use Google sign-in.

Once this is done, your app works online on a dev server with database and auth.
