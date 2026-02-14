# Quick Fix for nodemailer Error

## The Problem
NextAuth's Email provider requires `nodemailer` to be installed, even if you're using Resend.

## The Solution

Run this command in your terminal:

```bash
npm install nodemailer
```

Or reinstall all dependencies:

```bash
npm install
```

## After Installing

1. Clear the Next.js cache:
   ```bash
   rm -rf .next
   ```

2. Try building again:
   ```bash
   npm run build
   ```

   Or run in dev mode:
   ```bash
   npm run dev
   ```

## Why This Happens

NextAuth v5's Email provider internally imports nodemailer, even when you override `sendVerificationRequest` to use Resend. The package must be installed as a dependency.

## Alternative: Remove Email Provider Temporarily

If you only want to use email/password authentication for now, you can temporarily comment out the Email provider in `auth.ts`:

```typescript
// Email({
//   from: process.env.EMAIL_FROM || "onboarding@resend.dev",
//   ...
// }),
```

Then you can add it back later when you set up Resend.
