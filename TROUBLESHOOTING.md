# Troubleshooting Guide

## Common Build Errors

### 1. "Module not found: Can't resolve 'nodemailer'"

**Solution:**
```bash
npm install nodemailer
```

### 2. "Failed to fetch Inter from Google Fonts"

**Solution:** This happens when you're offline or have network restrictions. You can:

**Option A:** Use a local font instead:
```typescript
// app/layout.tsx
import localFont from "next/font/local"

const inter = localFont({
  src: "./fonts/Inter.woff2", // You'll need to download the font
  variable: "--font-inter",
})
```

**Option B:** Skip font optimization for now:
```typescript
// app/layout.tsx
// Remove the Inter import and use system fonts
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif' }}>{children}</body>
    </html>
  )
}
```

### 3. "Cannot find module '@/...'"

**Solution:** Make sure `tsconfig.json` has the correct path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### 4. "Prisma Client not generated"

**Solution:**
```bash
npx prisma generate
```

### 5. "Database connection error"

**Solution:**
1. Make sure PostgreSQL is running
2. Check your `DATABASE_URL` in `.env.local`
3. Test connection: `psql $DATABASE_URL`

### 6. "NEXTAUTH_SECRET is not set"

**Solution:**
```bash
# Generate a secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET="your-generated-secret"
```

### 7. Build fails with permission errors

**Solution:**
- Make sure you're running commands in your terminal (not in a restricted environment)
- Check file permissions
- Try: `sudo npm install` (if needed, but not recommended)

## Runtime Errors

### 1. "Email service not configured"

**Solution:** 
- Magic links require Resend API key
- Add to `.env.local`: `RESEND_API_KEY="re_..."`
- Or use email/password authentication instead

### 2. "S3 upload failed"

**Solution:**
- Check AWS credentials in `.env.local`
- Verify S3 bucket exists and is accessible
- Check IAM permissions

### 3. "Authentication failed"

**Solution:**
- Verify `NEXTAUTH_URL` matches your app URL
- Check `NEXTAUTH_SECRET` is set
- For Google OAuth, verify redirect URI matches

## Quick Fixes

### Reset everything and start fresh:

```bash
# 1. Delete node_modules and lock file
rm -rf node_modules package-lock.json

# 2. Reinstall dependencies
npm install

# 3. Generate Prisma Client
npx prisma generate

# 4. Try building again
npm run build
```

### Minimal .env.local for testing:

```env
# Required
DATABASE_URL="postgresql://postgres:password@localhost:5432/argus_dev?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production"

# Optional (can add later)
# RESEND_API_KEY=""
# AWS_ACCESS_KEY_ID=""
# GOOGLE_CLIENT_ID=""
```

## Still Not Working?

1. **Check Node.js version:**
   ```bash
   node --version  # Should be 18+
   ```

2. **Check if dependencies are installed:**
   ```bash
   ls node_modules | head -5
   ```

3. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run build
   ```

4. **Check for TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

5. **Run in development mode first:**
   ```bash
   npm run dev
   ```
   This gives better error messages than build.

## Getting Help

If you're still stuck, please provide:
1. The exact error message
2. What command you ran
3. Your Node.js version: `node --version`
4. Your OS and version
