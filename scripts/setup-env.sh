#!/bin/bash

# Environment Setup Script
# Helps set up development and production environments

set -e

echo "🚀 Argus Environment Setup"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
  echo "⚠️  .env.local already exists"
  read -p "Do you want to overwrite it? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Skipping .env.local creation"
  else
    rm .env.local
  fi
fi

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local for development..."
  
  # Generate NEXTAUTH_SECRET
  NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "dev-secret-change-me")
  
  cat > .env.local << EOF
# Development Environment Variables
# Generated on $(date)

# Database - Update with your local PostgreSQL connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/argus_dev?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# Resend (for magic links)
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="onboarding@resend.dev"

# AWS S3 (for file uploads) - Use separate dev bucket
AWS_ACCESS_KEY_ID="your-dev-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-dev-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="argus-dev-uploads"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
EOF

  echo "✅ Created .env.local"
  echo "📝 Please update the values in .env.local with your actual credentials"
fi

echo ""
echo "📚 Next steps:"
echo "1. Update .env.local with your development credentials"
echo "2. Set up PostgreSQL (see POSTGRESQL_SETUP.md)"
echo "3. Run: npx prisma generate && npx prisma db push"
echo "4. Start dev server: npm run dev"
echo ""
echo "For production setup, see ENVIRONMENT_SETUP.md"
