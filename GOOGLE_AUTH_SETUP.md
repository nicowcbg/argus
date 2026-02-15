# Google Sign-in / Sign-up Setup

Your app already has "Continue with Google" on login and signup. To make it work:

1. **Configure Google Cloud** (get Client Secret + redirect URI).
2. **Configure Supabase** (enable Google, add Client ID + Secret).
3. **No code changes** – after that, Google auth works and users are synced to your DB.

---

## 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → your project (or create one).
2. **APIs & Services** → **Credentials**.
3. Find your OAuth 2.0 Client ID:  
   `502104916598-etkovts233hub82g7pqla5rejrne1en3.apps.googleusercontent.com`  
   (or create an **OAuth 2.0 Client ID** for "Web application").
4. **Authorized redirect URIs** → **Add URI**:
   ```text
   https://grkycgjhhtnvokbwtgzq.supabase.co/auth/v1/callback
   ```
   (Use your real Supabase project ref if different: **Supabase** → **Settings** → **API** → **Project URL**; the ref is the subdomain before `.supabase.co`.)
5. Copy the **Client ID** and **Client Secret** (you need both for Supabase).

---

## 2. Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. **Authentication** → **Providers** → **Google**.
3. Enable **Google**.
4. Paste:
   - **Client ID:** `502104916598-etkovts233hub82g7pqla5rejrne1en3.apps.googleusercontent.com`
   - **Client Secret:** (from Google Cloud Console, same OAuth client).
5. **Save**.

---

## 3. Redirect URLs (Supabase)

So Google sign-in works on your **deployed** app:

1. **Authentication** → **URL Configuration**.
2. **Redirect URLs** must include your app URLs, for example:
   - `https://argus-delta.vercel.app/**`
   - `https://argus-delta.vercel.app/auth/callback`
   (Replace with your real Vercel/production URL.)
3. **Site URL** = your main app URL (e.g. `https://argus-delta.vercel.app`).

---

## How it works in your app

- **Login / Signup:** "Continue with Google" calls Supabase OAuth with `redirectTo: your-site/auth/callback`.
- **Callback:** `/auth/callback` exchanges the code for a session and redirects to `/dashboard`.
- **DB sync:** When a user hits the dashboard, `getCurrentUser()` runs: it reads the Supabase user (including Google `name`, `email`, `picture` from `user_metadata`) and **finds or creates** a row in your Prisma **User** table with `supabaseId`, `email`, `name`, `image`. So every Google sign-in is automatically in your DB.

No extra code is required; just complete the two config steps above.
