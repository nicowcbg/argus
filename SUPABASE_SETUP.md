# Using Supabase (Database + Auth)

This app uses **Supabase** for both the database and authentication.

---

## Quick start (checklist)

1. **Create project** → [supabase.com](https://supabase.com) → **New project** → set database password (save it).
2. **Get URL and anon key** → **Settings** → **API** → copy **Project URL** and **anon public** key.
3. **Get connection string** → **Settings** → **Database** → **Connection string** → **URI** → **Direct** (port 5432) → copy and replace `[YOUR-PASSWORD]`.
4. **Create `.env.local`** in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?schema=public"
   ```
5. **Run:**
   ```bash
   npm install
   npx prisma generate
   npm run db:push
   npm run dev
   ```
   (`npm run db:push` loads `DATABASE_URL` from `.env.local`. If you use `npx prisma db push` directly, Prisma won’t see `.env.local` — use a `.env` file or set `DATABASE_URL` in the shell.)
6. Open [http://localhost:3000](http://localhost:3000) → **Sign up** → you should land on the dashboard.

For auth details (Google, email confirmation), see **[SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md)**.

---

## Detailed steps

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → choose organization, name (e.g. `argus`), database password (save it), region.
3. Wait for the project to be ready.

---

## 2. Get the connection string

1. In the Supabase dashboard, open your project.
2. Go to **Settings** (gear) → **Database**.
3. Under **Connection string**, choose **URI**.
4. Copy the URI. It looks like:
   ```text
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the database password you set when creating the project.

**For Prisma** you can use either:

- **Option A — Simple (direct connection)**  
  In **Connection string** switch to **Session** or use the **Direct** connection if shown. You want a URI like:
  ```text
  postgresql://postgres:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres
  ```
  Use this as `DATABASE_URL` and you’re done.

- **Option B — Recommended for Vercel (connection pooler)**  
  Use the **Transaction** pooler URI (port **6543**). Then you need two URLs (see step 3).

---

## 3. Configure environment variables

**Local (`.env.local`):**

If you use the **direct** connection (Option A):

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-from-openssl-rand-base64-32"
```

If you use the **pooler** (Option B), add both:

```env
# For running the app (pooled)
DATABASE_URL="postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
# For migrations (direct) - get from Settings → Database → Connection string → Direct
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-from-openssl-rand-base64-32"
```

If you use Option B, Prisma needs `directUrl` (see step 4).

---

## 4. Prisma schema (only for Option B – pooler)

If you use the **pooler** (Option B), add `directUrl` to your schema so migrations and `prisma db push` use the direct connection.

Open `prisma/schema.prisma` and change the datasource to:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

If you use only the **direct** connection (Option A), you don’t need `directUrl`; keep your current `datasource db` as is.

---

## 5. Create tables and run the app

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000), sign up, and you should see the dashboard.

---

## 6. Deploy to Vercel (or another host)

1. Set **Environment Variables** in your hosting dashboard:
   - `DATABASE_URL` = your Supabase URI (direct for simplicity, or pooler + `?pgbouncer=true` if you use Option B).
   - If Option B: `DIRECT_URL` = Supabase direct connection URI.
   - `NEXTAUTH_URL` = your app URL (e.g. `https://argus-xxx.vercel.app`).
   - `NEXTAUTH_SECRET` = same as local (e.g. from `openssl rand -base64 32`).

2. Deploy. Your build already runs `prisma generate && prisma db push && next build`, so the same Supabase database will be used online.

---

## Issues table (dashboard)

The dashboard shows **issues** stored in Supabase. The `issues` table must have a **user** column so each user only sees their own issues.

### 1. Add `user_id` to `issues`

In the Supabase dashboard: **Table Editor** → **issues** → add column:

- **Name:** `user_id`
- **Type:** `uuid`
- **Default:** none (leave empty)
- **Nullable:** yes (so existing rows don’t break), or no if you only insert with `user_id` set

Or run in **SQL Editor**:

```sql
ALTER TABLE public.issues
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
```

### 2. Row Level Security (RLS)

So users can only read/insert their own issues:

1. **Table Editor** → **issues** → **Add RLS policy** (or **Authentication** → **Policies**).
2. Enable RLS on `issues` if not already.
3. Add policies:

- **SELECT:** “Users can read own issues”  
  - Expression: `auth.uid() = user_id`
- **INSERT:** “Users can insert own issues”  
  - Expression: `auth.uid() = user_id`  
  - With check: same

In SQL:

```sql
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own issues"
ON public.issues FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own issues"
ON public.issues FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

The app sets `user_id` to the signed-in Supabase user when creating an issue and filters the list by `user_id`.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Create project at [supabase.com](https://supabase.com) |
| 2 | Settings → Database → copy connection URI, replace password |
| 3 | Put `DATABASE_URL` (and `DIRECT_URL` if using pooler) in `.env.local` |
| 4 | If using pooler: add `directUrl = env("DIRECT_URL")` in `prisma/schema.prisma` |
| 5 | Run `npx prisma generate && npx prisma db push && npm run dev` |
| 6 | For deploy: add same env vars and set `NEXTAUTH_URL` to your app URL |

Yes, you can do this with Supabase: use it as your Postgres database and keep using NextAuth for login/signup as you do now.
