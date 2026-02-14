# Argus - AI-Powered Project Management

A modern project management application built with Next.js, TypeScript, and shadcn UI.

## Features

- ✅ Landing page
- ✅ Pricing page
- ✅ Authentication (Email/Password, Magic links, Google OAuth)
- ✅ Dashboard with project management
- ✅ Create projects with file uploads (S3)
- ✅ Protected routes with middleware
- ✅ Modern UI with shadcn components

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui
- **Authentication:** NextAuth.js v5 (Email/Password, Magic Links, Google OAuth)
- **Database:** PostgreSQL with Prisma ORM
- **File Storage:** AWS S3
- **Email:** Resend (for magic links)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- AWS S3 bucket (for file uploads)
- Resend account (for magic links)
- Google OAuth credentials (optional, for Google sign-in)

### Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

**Minimal setup (Email/Password only):**
1. Set up PostgreSQL (see [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md))
2. Install dependencies: `npm install`
3. Configure `.env` with database URL
4. Run: `npx prisma generate && npx prisma db push`
5. Start: `npm run dev`

**Full setup (with S3 and Resend):**
1. Follow [SETUP.md](./SETUP.md) for complete instructions
2. Set up S3 (see [S3_SETUP.md](./S3_SETUP.md))
3. Set up Resend for magic links
4. Configure all environment variables

## Project Structure

```
argus/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── pricing/           # Pricing page
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/                # shadcn UI components
│   └── dashboard/         # Dashboard components
├── lib/                   # Utilities
├── prisma/                # Prisma schema
└── auth.ts                # NextAuth configuration
```

## Environment Variables

See `.env.example` for all required environment variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your app URL

**For Magic Links:**
- `RESEND_API_KEY` - From Resend dashboard
- `EMAIL_FROM` - Your verified email

**For File Uploads:**
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - S3 region
- `AWS_S3_BUCKET_NAME` - S3 bucket name

**Optional:**
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - For Google OAuth

## Documentation

- [SETUP.md](./SETUP.md) - Complete setup guide
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Dev vs Production environments
- [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) - PostgreSQL installation
- [S3_SETUP.md](./S3_SETUP.md) - AWS S3 configuration

## Environment Management

### Development
- Use `.env.local` for local development
- Local PostgreSQL or Docker container
- Separate dev S3 bucket (optional)

### Production
- Set environment variables in hosting platform
- Managed PostgreSQL database
- Production S3 bucket
- See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for details

### Quick Commands

```bash
# Setup development environment
npm run setup:env

# Database commands
npm run db:generate    # Generate Prisma Client
npm run db:push        # Push schema to database (dev)
npm run db:migrate     # Create migration (dev)
npm run db:migrate:deploy  # Deploy migrations (production)
npm run db:studio      # Open Prisma Studio
```

## Next Steps

- [ ] Add project detail pages
- [ ] Implement project editing and deletion
- [ ] Add search and filtering
- [ ] Set up production deployment

## License

MIT
