# Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL

See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) for detailed instructions.

**Quick option (Docker):**
```bash
docker run --name postgres-argus \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=argus \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Set Up Resend (for Magic Links)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Verify your domain (or use `onboarding@resend.dev` for testing)

### 4. Set Up AWS S3 (for File Uploads)

See [S3_SETUP.md](./S3_SETUP.md) for detailed instructions.

**Quick summary:**
1. Create AWS account
2. Create S3 bucket
3. Create IAM user with S3 access
4. Get access key and secret

### 5. Set Up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret

### 6. Configure Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/argus?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Resend (for magic links)
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="onboarding@resend.dev"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 7. Set Up Database Schema

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 8. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Authentication Methods

The app supports three authentication methods:

1. **Email/Password** (Simplest to get started) ⭐
   - Users create account with email and password
   - No external services needed (except database)

2. **Magic Links** (via Resend)
   - Users enter email, receive magic link
   - Requires Resend API key

3. **Google OAuth** (Optional)
   - One-click sign in with Google
   - Requires Google OAuth credentials

## Recommended Setup Order

1. ✅ PostgreSQL (required)
2. ✅ Email/Password auth (simplest, works immediately)
3. ⏳ Resend (for magic links)
4. ⏳ S3 (for file uploads)
5. ⏳ Google OAuth (optional)

You can start with just PostgreSQL and email/password, then add other services later!

## Troubleshooting

### Database Connection Issues
- See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)

### S3 Upload Issues
- See [S3_SETUP.md](./S3_SETUP.md)

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your app URL
- For Google OAuth, verify redirect URI matches exactly

### Email Not Sending
- Check Resend API key is correct
- Verify email domain is verified in Resend
- Check Resend dashboard for delivery status

## Next Steps

- [ ] Set up production database
- [ ] Configure production S3 bucket
- [ ] Set up custom email domain in Resend
- [ ] Deploy to Vercel/Railway/Render
