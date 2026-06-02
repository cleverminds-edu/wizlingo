# Phase 2 Environment Setup - Quick Reference

Quick commands and checklists for setting up Phase 2 production environment.

## One-Time Setup (AWS)

```bash
# 1. Generate secrets
openssl rand -base64 32  # JWT_SECRET & CRON_SECRET
openssl rand -base64 24  # WIZADMIN_SECRET

# 2. Create S3 bucket
aws s3api create-bucket --bucket wizlingo-certs-prod --region us-east-1

# 3. Enable versioning on bucket
aws s3api put-bucket-versioning \
  --bucket wizlingo-certs-prod \
  --versioning-configuration Status=Enabled

# 4. Verify SES email
aws ses verify-email-identity \
  --email-address noreply@wizlingo.com \
  --region us-east-1
```

## Environment Variables Setup (Vercel)

```bash
# Copy to Vercel Settings → Environment Variables (Production)

NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<from-openssl>
WIZADMIN_SECRET=<from-openssl>
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
EMAIL_PROVIDER=ses
AWS_SES_REGION=us-east-1
EMAIL_FROM_ADDRESS=noreply@wizlingo.com
EMAIL_DEFAULT_ENABLED=true
CERTIFICATE_STORAGE=s3
AWS_S3_BUCKET=wizlingo-certs-prod
AWS_S3_REGION=us-east-1
LEADERBOARD_UPDATE_ENABLED=true
NOTIFICATION_QUEUE_ENABLED=true
NEXT_PUBLIC_APP_URL=https://wizlingo.com
CRON_SECRET=<from-openssl>
```

## Pre-Deployment Tests

```bash
# Validate AWS credentials
npm run validate:aws

# Test email service
npm run test:email

# Test S3 access
npm run test:s3

# Run full test suite
npm test

# Build for production
npm run build

# Start production server (local test)
npm run start
```

## Deployment

```bash
# 1. Push to main branch
git push origin main

# 2. Vercel auto-deploys (watch dashboard)
# https://vercel.com/[team]/wizlingo

# 3. Run validation tests
npm run validate:aws
npm run test:email
npm run test:s3

# 4. Monitor logs
# Vercel → Deployments → View Logs

# 5. Test critical paths
# - Login as test user
# - Start reading session
# - Complete session and get badge
# - Download certificate
# - Check email received
```

## Troubleshooting

### Email Not Sending
```bash
# Check SES status
npm run test:email

# Check SES logs in AWS
aws ses get-account-sending-enabled --region us-east-1

# Verify sender
aws ses list-verified-email-addresses --region us-east-1

# Check Vercel logs for EMAIL_PROVIDER setting
# Must be: EMAIL_PROVIDER=ses
```

### S3 Upload Failing
```bash
# Check bucket exists
npm run test:s3

# Verify bucket permissions
aws s3 ls s3://wizlingo-certs-prod

# Check IAM user has S3 permissions
aws iam get-user-policy --user-name wizlingo-app --policy-name S3Access
```

### Database Connection Error
```bash
# Test connection locally
psql postgresql://user:pass@host:5432/wizlingo_prod

# Check Vercel logs for DATABASE_URL
# Format: postgresql://user:password@host:port/dbname?sslmode=require

# Verify credentials are correct
# Test with psql first before deploying
```

### Cron Job Not Running
```bash
# Check Vercel cron configuration
# Must have: vercel.json with cron schedule

# Manually trigger cron
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://wizlingo.com/api/cron/leaderboards

# Check Vercel logs for errors
# Check database for leaderboard updates

# Verify LEADERBOARD_UPDATE_ENABLED=true
```

## Emergency Commands

```bash
# Rollback to previous deployment
# 1. Go to Vercel → Deployments
# 2. Click "..." on previous deployment
# 3. Select "Promote to Production"

# Rollback database (if available)
# Contact database provider for restore options

# Rotate AWS credentials (if compromised)
aws iam delete-access-key --access-key-id AKIA...
aws iam create-access-key --user-name wizlingo-app

# Revoke JWT tokens (force all users to logout)
# Change JWT_SECRET in Vercel
# Deploy immediately

# Clear S3 bucket (if corrupted)
# aws s3 rm s3://wizlingo-certs-prod --recursive
# (use with extreme caution!)
```

## Monitoring Commands

```bash
# Check deployment status
git log --oneline -n 10

# View Vercel deployments
open https://vercel.com/[team]/wizlingo/deployments

# Monitor AWS costs
open https://console.aws.amazon.com/cost-management

# Check SES sending stats
aws ses get-account-sending-enabled --region us-east-1

# List S3 objects
aws s3 ls s3://wizlingo-certs-prod --recursive

# Check database size
psql -c "SELECT pg_size_pretty(pg_database_size('wizlingo_prod'))"
```

## Files to Know

| File | Purpose |
|------|---------|
| `.env.production.template` | Template for production secrets |
| `ENVIRONMENT_SETUP.md` | Detailed setup guide |
| `SECRETS_MANAGEMENT.md` | Secret rotation and recovery |
| `PHASE2_DEPLOYMENT_CHECKLIST.md` | Pre-launch checklist |
| `vercel.json` | Vercel configuration + cron jobs |
| `scripts/validate-aws-credentials.ts` | Validate AWS setup |
| `scripts/test-email-service.ts` | Test SES email |
| `scripts/test-s3-service.ts` | Test S3 access |
| `app/api/cron/leaderboards/route.ts` | Nightly leaderboard update |

## Useful Links

| Service | Dashboard |
|---------|-----------|
| Vercel | https://vercel.com/[team]/wizlingo |
| AWS Console | https://console.aws.amazon.com |
| AWS SES | https://console.aws.amazon.com/ses |
| AWS S3 | https://s3.console.aws.amazon.com |
| AWS IAM | https://console.aws.amazon.com/iam |
| Database | (Your provider's console) |

## Team Contact

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Deployment Lead | | | |
| AWS Admin | | | |
| Database Admin | | | |
| On-Call Support | | | |

## Rotation Reminders

```
Every 90 days: Rotate AWS Access Keys
Every 6 months: Rotate JWT_SECRET, CRON_SECRET
Annually: Rotate WIZADMIN_SECRET, database password
```

Set calendar reminders for:
- 2026-09-02: AWS Key Rotation
- 2026-12-02: JWT Secret Rotation
- 2027-03-02: AWS Key Rotation
- 2027-06-02: JWT Secret & WIZADMIN Rotation

---

**For detailed guides, see**: 
- `ENVIRONMENT_SETUP.md` — Full setup guide
- `SECRETS_MANAGEMENT.md` — Secret rotation procedures
- `PHASE2_DEPLOYMENT_CHECKLIST.md` — Pre-launch checklist
