# AWS S3 Setup Guide

## Quick Setup

### 1. Create AWS Account
- Go to [aws.amazon.com](https://aws.amazon.com)
- Sign up for an account (free tier available)

### 2. Create S3 Bucket

1. Go to AWS Console → S3
2. Click "Create bucket"
3. Configure:
   - **Bucket name**: `argus-uploads` (must be globally unique)
   - **Region**: Choose closest region (e.g., `us-east-1`)
   - **Block Public Access**: Uncheck if you want public URLs (recommended: keep checked, use presigned URLs)
   - **Versioning**: Optional
   - Click "Create bucket"

### 3. Create IAM User for S3 Access

1. Go to AWS Console → IAM → Users
2. Click "Add users"
3. Set username: `argus-s3-user`
4. Select "Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach policies directly"
7. Search and select: `AmazonS3FullAccess` (or create custom policy for specific bucket)
8. Click "Next" → "Create user"
9. **IMPORTANT**: Copy the Access Key ID and Secret Access Key (you won't see the secret again!)

### 4. Configure Bucket CORS (if needed for direct browser uploads)

1. Go to your S3 bucket → Permissions → CORS
2. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 5. Update Environment Variables

Add to your `.env`:

```env
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="argus-uploads"
```

## Alternative: Use Cloud Storage Services

### Cloudinary (Easier, includes image processing)

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your API credentials
3. Update code to use Cloudinary SDK instead of S3

### DigitalOcean Spaces (S3-compatible, simpler pricing)

1. Create Space at [digitalocean.com](https://digitalocean.com)
2. Use S3-compatible API (same code works!)

### Backblaze B2 (Cheaper alternative)

1. Sign up at [backblaze.com](https://backblaze.com)
2. Create bucket
3. Use S3-compatible API

## Security Best Practices

1. **Never commit AWS credentials** to git
2. **Use IAM roles** in production (instead of access keys)
3. **Limit permissions** - only give S3 access to specific bucket
4. **Enable bucket versioning** for important files
5. **Set up lifecycle policies** to delete old files automatically

## Custom IAM Policy (More Secure)

Instead of `AmazonS3FullAccess`, create a custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## Testing S3 Upload

After setup, test by creating a project with a file upload in your app.

## Troubleshooting

### "Access Denied"
- Check IAM user has correct permissions
- Verify bucket name matches `AWS_S3_BUCKET_NAME`
- Check region matches `AWS_REGION`

### "Bucket does not exist"
- Verify bucket name is correct
- Check you're using the right AWS account/region

### Files not accessible
- Check bucket permissions
- Verify CORS configuration if uploading from browser
- Check if bucket is public or use presigned URLs
