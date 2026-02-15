# Supabase Auth Setup

Auth is now handled by **Supabase Auth**. You need a Supabase project and a few env vars.

---

## 1. Create a Supabase project (if you haven’t)

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → name (e.g. `argus`), set and save the **database password**, choose region.
3. Wait for the project to be ready.

---

## 2. Get your project URL and anon key

1. In the dashboard, open your project.
2. Go to **Settings** (gear) → **API**.
3. Copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys").

---

## 3. Environment variables

In `.env.local` (and in your host’s env for production) set:

```env
# Supabase (required for auth)
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Database (same Supabase project)
DATABASE_URL="postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?schema=public"
# Or use Direct connection - see SUPABASE_SETUP.md
```

Get `DATABASE_URL` from **Settings** → **Database** → **Connection string** (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)).

You do **not** need `NEXTAUTH_URL` or `NEXTAUTH_SECRET` anymore.

---

## 4. Email auth and “Email not confirmed”

Email sign up / sign in is enabled by default. Supabase can require **email confirmation** before the first sign-in.

### Option A: Disable confirmation (simplest for dev)

So users can sign in right after signup without checking email:

1. In Supabase: **Authentication** → **Providers** → **Email**.
2. Turn **off** “Confirm email”.
3. Save.

After that, new signups can log in immediately.

### Option B: Keep confirmation (production-style)

Leave “Confirm email” **on**. After signup, users must click the link in the email to verify. If they try to log in before that, they’ll see “email unverified” and can use **Resend confirmation email** on the login page. **Tip:** Confirmation emails often land in spam — ask users to check there.

---

## 5. Enable Google sign-in (optional)

1. In Supabase: **Authentication** → **Providers** → **Google** → enable.
2. In [Google Cloud Console](https://console.cloud.google.com/): create OAuth 2.0 Client ID (Web application).
3. **Authorized redirect URIs** add:
   ```text
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
4. Copy Client ID and Client Secret into Supabase Google provider and save.

Your app’s Google button will then work (Supabase handles the redirect).

---

## 6. Apply schema and run

Your Prisma `User` table now has `supabaseId` and no longer uses NextAuth’s `Account`/`Session` tables. Push the schema and run the app:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000), sign up or sign in; you should land on the dashboard.

---

## Summary

| What           | Before     | After        |
|----------------|------------|-------------|
| Auth provider  | NextAuth   | Supabase Auth |
| Session        | JWT / DB   | Supabase (cookie) |
| User table     | NextAuth + password | `User` with `supabaseId` |
| Login/Signup   | NextAuth API | Supabase client (`signInWithPassword`, `signUp`) |
| Middleware     | NextAuth   | Supabase SSR (`getUser`) |

Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`.
