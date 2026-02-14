# Database & Auth Setup — Step by Step

Follow these steps in order to get the database and authentication working.

---

## 1. Install dependencies

```bash
npm install
```

---

## 2. Set up PostgreSQL

**Option A — Docker (simplest)**

```bash
docker run --name postgres-argus \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=argus \
  -p 5432:5432 \
  -d postgres:15
```

Your connection URL will be:
`postgresql://postgres:password@localhost:5432/argus?schema=public`

**Option B — Local PostgreSQL**

- Install PostgreSQL (see [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)).
- Create a database, e.g. `argus` or `argus_dev`.
- Your URL format: `postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME?schema=public`

---

## 3. Configure environment variables

Create or edit `.env.local` in the project root with at least:

```env
# Required for database
DATABASE_URL="postgresql://postgres:password@localhost:5432/argus?schema=public"

# Required for auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="REPLACE_WITH_SECRET"
```

**Generate `NEXTAUTH_SECRET`:**

```bash
openssl rand -base64 32
```

Paste the output as the value of `NEXTAUTH_SECRET` (no quotes needed if it has no spaces).

---

## 4. Create database tables

From the project root:

```bash
# Generate Prisma Client
npx prisma generate

# Create tables in the database (no migrations yet)
npx prisma db push
```

If `db push` fails, check:

- PostgreSQL is running.
- `DATABASE_URL` in `.env.local` is correct (user, password, host, port, database name).
- No firewall blocking port 5432.

---

## 5. Verify auth

1. Start the app:
   ```bash
   npm run dev
   ```

2. Open: [http://localhost:3000](http://localhost:3000)

3. **Sign up**
   - Go to **Sign up** (or `/signup`).
   - Enter email, password, optional name.
   - Submit → you should be redirected to the dashboard.

4. **Log out**
   - Click **Sign Out** in the sidebar.
   - You should land on the home page.

5. **Log in**
   - Go to **Sign in** (or `/login`).
   - Use the same email/password → redirect to dashboard.

6. **Protected route**
   - While logged out, open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).
   - You should be redirected to `/login`.

---

## 6. Optional: inspect database

```bash
npx prisma studio
```

Opens a UI at `http://localhost:5555` to view and edit `User`, `Project`, etc.

---

## 7. Optional: Google sign-in

1. In [Google Cloud Console](https://console.cloud.google.com/): create/select project → **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.
2. Application type: **Web application**.
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`.
4. Copy Client ID and Client Secret into `.env.local`:

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

5. Restart `npm run dev`. Login page should show “Continue with Google”.

---

## 8. Optional: file uploads (S3)

For project file uploads you’ll need AWS credentials and a bucket. See [S3_SETUP.md](./S3_SETUP.md). Add to `.env.local`:

```env
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

---

## Troubleshooting

| Issue | What to do |
|--------|------------|
| `Can't reach database server` | PostgreSQL not running or wrong host/port. Check `DATABASE_URL`. |
| `Invalid `prisma.user.create()` invocation` | Run `npx prisma generate` and `npx prisma db push`. |
| Login redirects to dashboard but dashboard errors | Ensure `NEXTAUTH_SECRET` is set and you’re using the JWT session strategy (already configured). |
| “Session user ID is missing” | Clear site data for localhost and sign in again. |

---

## Summary checklist

- [ ] `npm install`
- [ ] PostgreSQL running (Docker or local)
- [ ] `.env.local` with `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- [ ] `npx prisma generate`
- [ ] `npx prisma db push`
- [ ] `npm run dev` → sign up → login → dashboard works
- [ ] (Optional) Google OAuth in `.env.local`
- [ ] (Optional) S3 for file uploads

After this, the database and auth system are set up. Next you can add features (e.g. project CRUD, profile, or API routes).
