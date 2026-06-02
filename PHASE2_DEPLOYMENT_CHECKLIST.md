# Phase 2 Production Deployment Checklist

This checklist ensures all environment setup and configuration is complete before deploying WizLingo to production.

**Start Date**: _________________
**Target Go-Live**: _________________
**Deployment Lead**: _________________

## Pre-Deployment (1-2 weeks before launch)

### AWS Account Setup

- [ ] AWS account created and verified with credit card
- [ ] IAM user "wizlingo-app" created with minimal permissions
- [ ] AWS_ACCESS_KEY_ID generated and secured
- [ ] AWS_SECRET_ACCESS_KEY generated and secured
- [ ] SES email verified: `noreply@wizlingo.com`
- [ ] SES production access requested (sandbox mode unsuitable for production)
- [ ] S3 bucket created: `wizlingo-certs-prod` in `us-east-1`
- [ ] S3 bucket versioning enabled
- [ ] S3 bucket encryption enabled (at rest)
- [ ] S3 bucket policy configured (if certificates need public access)
- [ ] CloudTrail enabled for audit logging
- [ ] AWS credentials validated with: `npm run validate:aws`

**AWS Checklist Signed-off By**: _________________

### Environment Variable Setup

#### Generate Secrets

- [ ] JWT_SECRET generated: `openssl rand -base64 32`
  - Value: _________________
  - Stored in: Vercel + password manager

- [ ] WIZADMIN_SECRET generated: `openssl rand -base64 24`
  - Value: _________________
  - Stored in: Vercel + password manager

- [ ] CRON_SECRET generated: `openssl rand -base64 32`
  - Value: _________________
  - Stored in: Vercel + password manager

#### Database Configuration

- [ ] Production PostgreSQL database provisioned
- [ ] Database: `wizlingo_prod` created
- [ ] Production user created with limited permissions
- [ ] DATABASE_URL format verified: `postgresql://user:pass@host:5432/wizlingo_prod`
- [ ] Connection tested locally: `psql [DATABASE_URL]`
- [ ] Backups configured (daily/weekly)
- [ ] Database available for Vercel deployment

**Database**: _________________
**Hosting Provider**: _________________

#### API Keys

- [ ] OpenAI API key obtained and tested
- [ ] Anthropic API key obtained and tested
- [ ] API quota checked for both providers
- [ ] API keys stored securely in password manager

### Vercel Setup

- [ ] Vercel account created/upgraded
- [ ] GitHub repository connected
- [ ] Production project created
- [ ] Domain `wizlingo.com` added (or your domain)
- [ ] Domain DNS configuration completed
- [ ] SSL/TLS certificate configured (automatic)
- [ ] Environment variables added to Production environment:

  - [ ] `NODE_ENV` = `production`
  - [ ] `DATABASE_URL` = `postgresql://...`
  - [ ] `JWT_SECRET` = `[secured value]`
  - [ ] `WIZADMIN_SECRET` = `[secured value]`
  - [ ] `OPENAI_API_KEY` = `sk-...`
  - [ ] `ANTHROPIC_API_KEY` = `sk-ant-...`
  - [ ] `AWS_REGION` = `us-east-1`
  - [ ] `AWS_ACCESS_KEY_ID` = `AKIA...`
  - [ ] `AWS_SECRET_ACCESS_KEY` = `[secured value]`
  - [ ] `EMAIL_PROVIDER` = `ses`
  - [ ] `AWS_SES_REGION` = `us-east-1`
  - [ ] `EMAIL_FROM_ADDRESS` = `noreply@wizlingo.com`
  - [ ] `EMAIL_DEFAULT_ENABLED` = `true`
  - [ ] `CERTIFICATE_STORAGE` = `s3`
  - [ ] `AWS_S3_BUCKET` = `wizlingo-certs-prod`
  - [ ] `AWS_S3_REGION` = `us-east-1`
  - [ ] `LEADERBOARD_UPDATE_ENABLED` = `true`
  - [ ] `NOTIFICATION_QUEUE_ENABLED` = `true`
  - [ ] `NEXT_PUBLIC_APP_URL` = `https://wizlingo.com`
  - [ ] `CRON_SECRET` = `[secured value]`

- [ ] `vercel.json` deployed with cron configuration
- [ ] Production domain preview tested
- [ ] Build pipeline verified (no build errors)

**Vercel Team Member**: _________________

## Local Validation (1 week before launch)

### Test Credentials with Production Values

- [ ] `.env.local` updated with production secrets (for testing ONLY)
- [ ] All validation scripts pass:

```bash
npm run validate:aws
npm run test:email
npm run test:s3
```

### Email Service Testing

- [ ] Test email sent successfully to test address
- [ ] Email received in inbox (not spam)
- [ ] Email contains correct branding and links
- [ ] Email formatting looks correct on mobile
- [ ] Parent notification emails tested
- [ ] Badge earned emails tested
- [ ] Admin notification emails tested

**Email Tested By**: _________________
**Test Recipients**: _________________

### S3 Bucket Testing

- [ ] Sample certificate uploaded to S3
- [ ] Certificate file readable from public URL (if applicable)
- [ ] File permissions correct (private by default)
- [ ] Versioning working (multiple versions visible)
- [ ] File metadata preserved

**S3 Tested By**: _________________

### Database Connection Testing

- [ ] Production database accessible from Vercel
- [ ] All tables created by Prisma migrations
- [ ] Sample data inserted successfully
- [ ] Query performance acceptable
- [ ] Backup/restore tested

**Database Tested By**: _________________

### Cron Job Testing

- [ ] Cron endpoint `/api/cron/leaderboards` accessible
- [ ] CRON_SECRET authorization working
- [ ] Manual cron trigger successful:
  ```bash
  curl -H "Authorization: Bearer [CRON_SECRET]" https://wizlingo.com/api/cron/leaderboards
  ```
- [ ] Leaderboard update completes within timeout (< 5 minutes)
- [ ] Leaderboard data verified correct after update

**Cron Tested By**: _________________

## Deployment Day (Go-Live)

### Final Checks (2 hours before go-live)

- [ ] All systems green (AWS, Vercel, Database)
- [ ] No pending pull requests
- [ ] Latest code built successfully on main branch
- [ ] Vercel deployment logs show no errors
- [ ] Production domain accessible and responding
- [ ] 404 error page working (if custom page exists)

### Production Validation

- [ ] Login works with test user account
- [ ] Reading session can be started and completed
- [ ] Speaking session can be started and completed
- [ ] Badge earned email sent successfully
- [ ] Certificate can be generated and downloaded
- [ ] Leaderboard updates work (trigger manual cron)
- [ ] Admin dashboard accessible and functional
- [ ] API health endpoint returning success

**Validation Completed By**: _________________
**Time**: _________________

### Communication & Monitoring

- [ ] Team notified of go-live
- [ ] User communication ready (if needed)
- [ ] Monitoring dashboard opened:
  - [ ] Vercel Analytics dashboard
  - [ ] AWS CloudWatch dashboard
  - [ ] Error tracking (Sentry, if configured)
- [ ] On-call person assigned for first 24 hours
- [ ] Escalation procedures ready
- [ ] Rollback plan understood by team

**On-Call**: _________________
**Phone**: _________________

## Post-Deployment (Continuous monitoring)

### First 24 Hours

- [ ] Monitor error logs for issues
- [ ] Check email delivery rates
- [ ] Verify cron job ran successfully (if scheduled)
- [ ] Monitor database performance
- [ ] Check S3 bucket for new files
- [ ] User feedback collected
- [ ] Response time monitoring normal

### First Week

- [ ] Weekly backup verified
- [ ] Security scan completed
- [ ] Performance metrics reviewed
- [ ] AWS costs reviewed (unexpected spikes?)
- [ ] SES bounce/complaint rates acceptable
- [ ] Error rate trending downward
- [ ] Team debriefing completed

### Monthly

- [ ] AWS credentials rotation scheduled (90 days)
- [ ] Database growth monitored
- [ ] S3 bucket size monitored
- [ ] Cost optimization review
- [ ] Security audit scheduled
- [ ] Disaster recovery drilled

## Rollback Plan

If critical issues occur after go-live:

### Option 1: Revert to Previous Version (< 5 minutes)
- [ ] Identify commit to revert to
- [ ] Revert on main branch
- [ ] Verify Vercel auto-deploys
- [ ] Test critical paths
- [ ] Communicate status to users

### Option 2: Revert Environment Variables (< 2 minutes)
- [ ] Revert specific environment variable in Vercel
- [ ] Vercel auto-deploys with previous value
- [ ] Test immediately
- [ ] Investigate root cause after incident

### Option 3: Use Previous Deployment (< 1 minute)
- [ ] Go to Vercel → Deployments
- [ ] Select previous successful deployment
- [ ] Promote to production
- [ ] Verify working
- [ ] Investigate root cause

**Rollback Triggers**:
- Database connection failing
- Critical API endpoints returning 500
- Email not sending for > 1 hour
- S3 bucket inaccessible
- Authentication system down

**Rollback Authority**: _________________

## Incident Log

Document any issues that occur during deployment:

### Issue 1
- **Time**: _________________
- **Severity**: Critical / High / Medium / Low
- **Description**: _________________
- **Root Cause**: _________________
- **Resolution**: _________________
- **Time to Fix**: _________________
- **Lessons Learned**: _________________

### Issue 2
- **Time**: _________________
- **Severity**: Critical / High / Medium / Low
- **Description**: _________________
- **Root Cause**: _________________
- **Resolution**: _________________
- **Time to Fix**: _________________
- **Lessons Learned**: _________________

## Sign-Off

### Technical Lead
- **Name**: _________________
- **Date**: _________________
- **Signature**: _________________

### Product Manager
- **Name**: _________________
- **Date**: _________________
- **Signature**: _________________

### Operations Lead
- **Name**: _________________
- **Date**: _________________
- **Signature**: _________________

## Post-Launch Documentation

- [ ] Runbook created: `/docs/runbook-production.md`
- [ ] Troubleshooting guide created: `/docs/troubleshooting.md`
- [ ] Architecture diagram updated
- [ ] Environment setup guide finalized: `ENVIRONMENT_SETUP.md`
- [ ] Secrets management guide finalized: `SECRETS_MANAGEMENT.md`
- [ ] Deployment checklist updated: `PHASE2_DEPLOYMENT_CHECKLIST.md`

---

**Document Version**: 1.0
**Last Updated**: 2026-06-02
**Maintained By**: Agent 2: Environment Setup
