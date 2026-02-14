#!/bin/bash

echo "Installing dependencies..."
npm install

echo ""
echo "Checking if nodemailer is installed..."
if [ -d "node_modules/nodemailer" ]; then
  echo "✅ nodemailer is installed"
else
  echo "❌ nodemailer is NOT installed"
  echo "Installing nodemailer..."
  npm install nodemailer
fi

echo ""
echo "Clearing Next.js cache..."
rm -rf .next

echo ""
echo "✅ Done! Try running: npm run dev"
