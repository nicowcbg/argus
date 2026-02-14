# Environment Setup: Dev vs Production

## Overview

This guide explains how to set up and manage separate development and production environments for your Argus application.

---

## 🎯 Best Practices

### 1. Separate Database Instances

**Development:**
- Local PostgreSQL or Docker container
- Can use test data, reset frequently
- No production data risk

**Production:**
- Managed database (Railway, Supabase, Neon, AWS RDS)
- Backed up regularly
- Production data only

### 2. Environment Variables

Use different `.env` files for each environment:
- `.env.local` - Development (gitignored)
- `.env.production` - Production (set in hosting platform)

---

## 📁 Environment File Structure

### Development (`.env.local`)

```env
# Database - Local or Docker
DATABASE_URL="postgresql://postgres:password@localhost:5432/argus_dev?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-here"

# Resend (use test API key or same as prod)
RESEND_API_KEY="re_dev_key"
EMAIL_FROM="dev@yourdomain.com"

# AWS S3 (separate dev bucket)
AWS_ACCESS_KEY_ID="dev-access-key"
AWS_SECRET_ACCESS_KEY="dev-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="argus-dev-uploads"

# Google OAuth (can use same or separate)
GOOGLE_CLIENT_ID="dev-client-id"
GOOGLE_CLIENT_SECRET="dev-client-secret"
```

### Production (Set in hosting platform)

```env
# Database - Managed service
DATABASE_URL="postgresql://user:pass@prod-db.railway.app:5432/railway?schema=public"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-secret-key-here"

# Resend
RESEND_API_KEY="re_prod_key"
EMAIL_FROM="noreply@yourdomain.com"

# AWS S3 (production bucket)
AWS_ACCESS_KEY_ID="prod-access-key"
AWS_SECRET_ACCESS_KEY="prod-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="argus-prod-uploads"

# Google OAuth
GOOGLE_CLIENT_ID="prod-client-id"
GOOGLE_CLIENT_SECRET="prod-client-secret"
```

---

## 🗄️ Database Setup

### Development Database

**Option 1: Local PostgreSQL**
```bash
# Create dev database
createdb argus_dev

# Or using psql
psql postgres
CREATE DATABASE argus_dev;
\q
```

**Option 2: Docker (Recommended)**
```bash
# Run dev database
docker run --name postgres-argus-dev \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=argus_dev \
  -p 5432:5432 \
  -d postgres:15

# Connection string
# postgresql://postgres:devpassword@localhost:5432/argus_dev?schema=public
```

### Production Database

**Option 1: Railway**
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Copy connection string
5. Use for `DATABASE_URL` in production

**Option 2: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string

**Option 3: Neon**
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string

**Option 4: AWS RDS**
1. AWS Console → RDS
2. Create PostgreSQL instance
3. Get connection details

---

## 🪣 S3 Bucket Setup

### Development Bucket

```bash
# Create dev bucket
aws s3 mb s3://argus-dev-uploads --region us-east-1

# Or via AWS Console
# Name: argus-dev-uploads
# Region: us-east-1
```

### Production Bucket

```bash
# Create prod bucket
aws s3 mb s3://argus-prod-uploads --region us-east-1

# Or via AWS Console
# Name: argus-prod-uploads
# Region: us-east-1
```

**Best Practice:** Use different IAM users for dev/prod with bucket-specific permissions.

---

## 🔐 Managing Secrets

### Development

Create `.env.local` (already in `.gitignore`):
```bash
cp .env.example .env.local
# Edit .env.local with dev values
```

### Production

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add each variable
3. Select "Production" environment

**Railway:**
1. Go to Project → Variables
2. Add each variable

**Render:**
1. Go to Environment → Environment Variables
2. Add each variable

**AWS/Docker:**
- Use AWS Secrets Manager
- Or Docker secrets
- Or environment variables in deployment config

---

## 🚀 Deployment Platforms

### Vercel (Recommended for Next.js)

1. **Connect Repository:**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all production variables
   - Select "Production" environment

3. **Database Migration:**
   ```bash
   # Run migrations before deployment
   npx prisma migrate deploy
   ```

### Railway

1. **Connect Repository:**
   - Link GitHub repo
   - Railway auto-detects Next.js

2. **Add PostgreSQL:**
   - Add PostgreSQL service
   - Railway provides `DATABASE_URL` automatically

3. **Set Variables:**
   - Go to Variables tab
   - Add all other environment variables

### Render

1. **Create Web Service:**
   - Connect GitHub repo
   - Select "Next.js" environment

2. **Add PostgreSQL:**
   - Create PostgreSQL database
   - Use provided `DATABASE_URL`

3. **Set Environment Variables:**
   - Add all variables in Environment section

---

## 📝 Prisma Migrations

### Development

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Reset database (dev only!)
npx prisma migrate reset
```

### Production

```bash
# Deploy migrations (never use dev!)
npx prisma migrate deploy

# Or in CI/CD pipeline
npx prisma generate
npx prisma migrate deploy
```

**Important:** Never run `prisma migrate dev` in production!

---

## 🔄 CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma Client
        run: npx prisma generate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          # ... other env vars
```

---

## 🧪 Testing Different Environments

### Local Development

```bash
# Use .env.local
npm run dev
```

### Production Preview

```bash
# Use production env vars
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

### Staging Environment (Optional)

Create a staging environment:
- Separate database: `argus_staging`
- Separate S3 bucket: `argus-staging-uploads`
- Staging URL: `staging.yourdomain.com`

---

## 📊 Environment Comparison

| Feature | Development | Production |
|---------|------------|------------|
| **Database** | Local/Docker | Managed (Railway/Supabase) |
| **URL** | `localhost:3000` | `yourdomain.com` |
| **S3 Bucket** | `argus-dev-uploads` | `argus-prod-uploads` |
| **Email** | Test domain | Production domain |
| **Logging** | Console | Cloud logging |
| **Error Tracking** | Console | Sentry/Datadog |
| **Migrations** | `migrate dev` | `migrate deploy` |

---

## ✅ Checklist

### Development Setup
- [ ] Local PostgreSQL or Docker container
- [ ] `.env.local` file with dev credentials
- [ ] Dev S3 bucket (optional)
- [ ] Test email domain

### Production Setup
- [ ] Managed PostgreSQL database
- [ ] Production S3 bucket
- [ ] Verified email domain (Resend)
- [ ] Environment variables in hosting platform
- [ ] Custom domain configured
- [ ] SSL certificate (automatic with Vercel/Railway)
- [ ] Database backups enabled
- [ ] Monitoring/logging set up

---

## 🛠️ Useful Commands

```bash
# Switch between environments
# Development
cp .env.local .env

# Check current environment
echo $NODE_ENV

# Run migrations in production
DATABASE_URL="prod-url" npx prisma migrate deploy

# Test production build locally
NODE_ENV=production npm run build
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use different secrets** - Dev and prod should have different keys
3. **Rotate secrets regularly** - Especially in production
4. **Limit database access** - Use read-only users where possible
5. **Enable backups** - Always backup production database
6. **Use IAM roles** - In AWS, use IAM roles instead of access keys when possible

---

## 📚 Additional Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

*Last updated: 2024*
