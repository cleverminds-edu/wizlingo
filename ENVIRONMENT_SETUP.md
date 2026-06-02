# WizLingo Phase 2 Environment Setup Guide

This guide covers setting up all environment variables, AWS services, and secrets for production deployment.

## Table of Contents
1. [Overview](#overview)
2. [AWS Setup](#aws-setup)
3. [Environment Variables](#environment-variables)
4. [Vercel Configuration](#vercel-configuration)
5. [Testing Services](#testing-services)
6. [Cron Job Configuration](#cron-job-configuration)
7. [Secrets Management](#secrets-management)
8. [Troubleshooting](#troubleshooting)

## Overview

Phase 2 uses these services:
- **Database**: PostgreSQL (production database)
- **Email**: AWS SES (Simple Email Service)
- **File Storage**: AWS S3 (certificate storage)
- **Hosting**: Vercel
- **Cron Jobs**: Vercel Cron or external scheduler

## AWS Setup

### Prerequisites
- AWS Account with billing enabled
- AWS IAM user credentials (not root account)

### Step 1: Create IAM User for WizLingo

1. Go to AWS Console → IAM → Users
2. Click "Create user" → Name: `wizlingo-app`
3. On the permissions page, click "Attach policies directly"
4. Search for and attach these managed policies:
   - `AmazonSESFullAccess` (for email)
   - `AmazonS3FullAccess` (for certificate storage)
5. Click "Create user"

### Step 2: Generate Access Keys

1. Click on the newly created user `wizlingo-app`
2. Go to "Security credentials" tab
3. Under "Access keys", click "Create access key"
4. Select "Application running outside AWS"
5. Copy the Access Key ID and Secret Access Key
6. **SAVE THESE SECURELY** - you won't see the secret again

### Step 3: Verify SES Email Address

1. Go to AWS Console → SES → Verified identities
2. Click "Create identity"
3. Select "Email address"
4. Enter: `noreply@wizlingo.com`
5. Click "Create identity"
6. You'll receive a verification email at that address
7. Click the verification link
8. Check that status shows "Verified"

**Note**: In SES sandbox mode, you must also verify recipient email addresses. Request production access in the console.

### Step 4: Create S3 Bucket for Certificates

1. Go to AWS Console → S3 → Buckets
2. Click "Create bucket"
3. Bucket name: `wizlingo-certs-prod` (must be globally unique)
4. Region: `us-east-1`
5. Under "Block Public Access", keep all blocked (private by default)
6. Click "Create bucket"

### Step 5: Configure S3 Bucket Policy (Optional, for public certificates)

If certificates need to be publicly accessible:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::wizlingo-certs-prod/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
```

1. Select bucket → Permissions tab
2. Paste the policy in the Bucket Policy editor
3. Click "Save"

### Step 6: Enable Versioning (Recommended)

1. Go to bucket → Properties
2. Scroll to "Versioning"
3. Click "Edit"
4. Select "Enable"
5. Click "Save changes"

## Environment Variables

### Local Development (.env.local)

Already configured in `.env.local`. Keep using:
```bash
DATABASE_URL="postgresql://maddy@localhost:5432/wizlingo"
JWT_SECRET="change-this-to-a-long-random-secret-in-production"
OPENAI_API_KEY="your-openai-api-key-here"
ANTHROPIC_API_KEY="your-anthropic-api-key-here"
WIZADMIN_SECRET="change-this-to-a-strong-secret"
```

### Production Environment Variables

Use `.env.production.template` as a reference. Here's what you need to set:

#### Required Variables
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-host:5432/wizlingo_prod

# JWT & Admin
JWT_SECRET=<generate-with-: openssl rand -base64 32>
WIZADMIN_SECRET=<strong-random-string>

# AWS Credentials (from IAM User)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Email (SES)
EMAIL_PROVIDER=ses
AWS_SES_REGION=us-east-1
EMAIL_FROM_ADDRESS=noreply@wizlingo.com
EMAIL_DEFAULT_ENABLED=true

# Certificate Storage (S3)
CERTIFICATE_STORAGE=s3
AWS_S3_BUCKET=wizlingo-certs-prod
AWS_S3_REGION=us-east-1

# Features
LEADERBOARD_UPDATE_ENABLED=true
NOTIFICATION_QUEUE_ENABLED=true

# URLs
NEXT_PUBLIC_APP_URL=https://wizlingo.com
API_BASE_URL=https://wizlingo.com/api
```

## Vercel Configuration

### Step 1: Create Vercel Project

1. Go to https://vercel.com/new
2. Import the GitHub repository
3. Select "Next.js" framework
4. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 2: Add Environment Variables

1. Go to Vercel project → Settings → Environment Variables
2. Add each variable from the table below
3. Set environment to **Production** for each

#### Environment Variables to Add

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Fixed value |
| `DATABASE_URL` | `postgresql://...` | From your production DB |
| `JWT_SECRET` | `<random>` | Generate: `openssl rand -base64 32` |
| `WIZADMIN_SECRET` | `<random>` | Strong random string |
| `OPENAI_API_KEY` | `sk-...` | Your OpenAI key |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Your Anthropic key |
| `AWS_REGION` | `us-east-1` | AWS region |
| `AWS_ACCESS_KEY_ID` | `AKIA...` | From IAM user |
| `AWS_SECRET_ACCESS_KEY` | `...` | From IAM user |
| `EMAIL_PROVIDER` | `ses` | Fixed value |
| `AWS_SES_REGION` | `us-east-1` | SES region |
| `EMAIL_FROM_ADDRESS` | `noreply@wizlingo.com` | Verified in SES |
| `EMAIL_DEFAULT_ENABLED` | `true` | Fixed value |
| `CERTIFICATE_STORAGE` | `s3` | Fixed value |
| `AWS_S3_BUCKET` | `wizlingo-certs-prod` | S3 bucket name |
| `AWS_S3_REGION` | `us-east-1` | S3 region |
| `LEADERBOARD_UPDATE_ENABLED` | `true` | Fixed value |
| `NOTIFICATION_QUEUE_ENABLED` | `true` | Fixed value |
| `NEXT_PUBLIC_APP_URL` | `https://wizlingo.com` | Your domain |

### Step 3: Configure Domains

1. Go to Settings → Domains
2. Add your domain: `wizlingo.com`
3. Follow DNS configuration instructions
4. Set SSL/TLS to "Automatic" (default)

### Step 4: Configure Git Integration

1. Go to Settings → Git
2. Select GitHub as provider
3. Connect your repository
4. Set production branch to `main`

## Testing Services

### Test Email (AWS SES)

```bash
# From your application, run:
npm run test:email

# Or create a test endpoint POST /api/test/send-email
# with body: { to: "test@example.com", subject: "Test", body: "Test email" }
```

**Checklist**:
- [ ] Email sent successfully
- [ ] Email received in inbox (check spam)
- [ ] Email has correct branding
- [ ] Links work correctly

### Test S3 Access

```bash
# Run test script (create if needed):
npm run test:s3

# Manual test:
# 1. Upload certificate via API
# 2. Check S3 console for file
# 3. Verify file is accessible
# 4. Test download link
```

**Checklist**:
- [ ] File uploads successfully
- [ ] File visible in S3 bucket
- [ ] Public link works (if enabled)
- [ ] File permissions correct

### Test Credentials

```bash
# Verify AWS credentials work:
# Run this from Node REPL:
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

console.log("✅ AWS credentials valid");
```

## Cron Job Configuration

### Nightly Leaderboard Updates

The app includes a script to update leaderboards nightly (11 PM UTC).

#### Option 1: Vercel Cron (Recommended)

1. Create `/api/cron/leaderboards` endpoint:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { updateLeaderboards } from '@/lib/leaderboard-service';

export async function GET(request: NextRequest) {
  // Verify request is from Vercel
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await updateLeaderboards();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leaderboard update failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export const config = {
  runtime: 'nodejs',
};
```

2. Add `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/leaderboards",
      "schedule": "0 23 * * *"
    }
  ]
}
```

3. Add `CRON_SECRET` to Vercel environment variables

#### Option 2: External Cron Service

Use services like EasyCron, AWS EventBridge, or GitHub Actions:

```bash
# GitHub Actions (.github/workflows/leaderboard-cron.yml):
name: Nightly Leaderboard Update
on:
  schedule:
    - cron: '0 23 * * *'

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run leaderboards:update
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          # ... other env vars
```

## Secrets Management

### Where Secrets Are Stored

| Secret | Storage | Rotation | Access |
|--------|---------|----------|--------|
| AWS Keys | Vercel Env Vars | Every 90 days | Limited IAM policy |
| JWT_SECRET | Vercel Env Vars | Every 6 months | App only |
| Database Password | Vercel Env Vars | With DB provider | App only |
| Email API Keys | Vercel Env Vars | With service | App only |

### Rotating Secrets

#### AWS Access Keys

1. Create new access key in AWS IAM
2. Test with new key
3. Update `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in Vercel
4. Deploy and verify working
5. Delete old key in AWS

#### JWT_SECRET

1. Generate new: `openssl rand -base64 32`
2. Update in Vercel
3. Deploy
4. Old tokens will be invalid (users need to re-login)

#### Database Password

1. Change in your database provider
2. Update `DATABASE_URL` in Vercel
3. Deploy and verify connections working

### Security Best Practices

✅ **DO:**
- Use Vercel's built-in environment variable system
- Rotate credentials every 90 days
- Use separate credentials for each environment
- Enable MFA on AWS account
- Log all secret access
- Review IAM permissions quarterly

❌ **DON'T:**
- Commit `.env.production` to git
- Share credentials via email or chat
- Use the same secrets across environments
- Store credentials in code comments
- Mix secrets with code

## Troubleshooting

### Email Not Sending

**Problem**: Emails queued but not sent

**Solutions**:
1. Check `EMAIL_PROVIDER` is set to `ses`
2. Verify AWS credentials in Vercel
3. Check email is verified in SES
4. Check SES is not in sandbox mode (request production access)
5. Review email logs: `SELECT * FROM SentEmail WHERE status = 'failed'`

### S3 Upload Fails

**Problem**: Certificate upload to S3 fails

**Solutions**:
1. Verify bucket exists: `AWS_S3_BUCKET`
2. Check IAM user has `s3:*` permissions
3. Check bucket is in correct region
4. Verify AWS credentials are correct
5. Check bucket policy allows uploads

### Cron Job Not Running

**Problem**: Leaderboards not updating nightly

**Solutions**:
1. Check cron endpoint is accessible
2. Verify `CRON_SECRET` is set correctly
3. Check Vercel cron logs
4. Verify database connection works
5. Check `LEADERBOARD_UPDATE_ENABLED=true`

### Database Connection Error

**Problem**: `Unable to reach database server`

**Solutions**:
1. Verify `DATABASE_URL` format is correct
2. Check database server is running
3. Verify firewall allows connection
4. Check credentials are correct
5. Verify SSL mode setting (if required)

## Monitoring & Maintenance

### Weekly Checklist

- [ ] Check error logs in Vercel
- [ ] Verify email delivery rate
- [ ] Check S3 bucket size
- [ ] Review database performance
- [ ] Check cron job execution

### Monthly Checklist

- [ ] Review AWS usage and costs
- [ ] Check credential expiration dates
- [ ] Verify backups are working
- [ ] Review security logs
- [ ] Update dependencies

### Quarterly Checklist

- [ ] Rotate AWS access keys
- [ ] Review IAM permissions
- [ ] Update JWT_SECRET
- [ ] Security audit
- [ ] Disaster recovery test

## Support

For issues with:
- **AWS**: AWS Support Console
- **Vercel**: Vercel Support Dashboard
- **Database**: Database Provider Support
- **App Code**: Check application logs and error messages

## Next Steps

1. Follow AWS Setup steps above
2. Create environment variables in Vercel
3. Deploy to production
4. Run test suite
5. Monitor logs for 24 hours
6. Enable alerts and monitoring

---

Last Updated: 2026-06-02
Document Version: 1.0
