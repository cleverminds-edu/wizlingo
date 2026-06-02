# WizLingo Secrets Management Guide

This document outlines how to securely manage, store, rotate, and recover secrets for the WizLingo platform.

## Table of Contents
1. [Secrets Inventory](#secrets-inventory)
2. [Storage Locations](#storage-locations)
3. [Credential Generation](#credential-generation)
4. [Secret Rotation](#secret-rotation)
5. [Emergency Procedures](#emergency-procedures)
6. [Audit & Compliance](#audit--compliance)

## Secrets Inventory

### Critical Production Secrets

| Secret | Type | Provider | Expiry | Rotation |
|--------|------|----------|--------|----------|
| `DATABASE_URL` | Connection String | PostgreSQL | Provider-dependent | Update when changed |
| `JWT_SECRET` | Signing Key | Internal | 6 months | Every 6 months |
| `WIZADMIN_SECRET` | API Key | Internal | 1 year | Annually |
| `AWS_ACCESS_KEY_ID` | AWS Credential | AWS IAM | 90 days | Every 90 days |
| `AWS_SECRET_ACCESS_KEY` | AWS Credential | AWS IAM | 90 days | Every 90 days |
| `OPENAI_API_KEY` | API Key | OpenAI | Per account | Check OpenAI dashboard |
| `ANTHROPIC_API_KEY` | API Key | Anthropic | Per account | Check Anthropic dashboard |
| `CRON_SECRET` | Signing Key | Internal | 6 months | Every 6 months |

### Non-Secrets (Safe in Code)

- `NODE_ENV` (production/development)
- `AWS_REGION` (us-east-1)
- `AWS_SES_REGION` (us-east-1)
- `AWS_S3_REGION` (us-east-1)
- `EMAIL_PROVIDER` (ses)
- `EMAIL_FROM_ADDRESS` (noreply@wizlingo.com)
- `CERTIFICATE_STORAGE` (s3)
- `AWS_S3_BUCKET` (wizlingo-certs-prod)
- `NEXT_PUBLIC_APP_URL` (https://wizlingo.com)
- Feature flags (LEADERBOARD_UPDATE_ENABLED, etc.)

## Storage Locations

### Production (Vercel)

All secrets stored in Vercel's encrypted environment variable system:

1. Go to https://vercel.com
2. Select WizLingo project
3. Settings → Environment Variables
4. Add/Edit each secret with **Production** environment selected
5. Secrets are encrypted at rest and in transit

**Access Control**:
- Limited to Vercel team members with proper permissions
- All changes logged in Vercel audit log
- No secrets visible in logs or error messages

### Development (Local)

Stored in `.env.local` (git-ignored):

```bash
# .env.local - NEVER COMMIT THIS FILE
DATABASE_URL="postgresql://maddy@localhost:5432/wizlingo"
JWT_SECRET="dev-secret-change-in-production"
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
WIZADMIN_SECRET="dev-secret"
```

### Backup

Secrets should NOT be backed up to files. If needed:
- Store encrypted backups in a password-protected vault
- Use a tool like 1Password, LastPass, or Bitwarden
- Ensure only authorized team members have access

## Credential Generation

### JWT_SECRET

Generate a cryptographically secure 32-byte secret:

```bash
# Option 1: OpenSSL (recommended)
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online tool (use only in secure environment)
# https://generate-random.org/encryption-keys?count=1&bytes=32&uppercase=false&symbols=false

# Output example:
# AbCd1234EfGh5678IjKl9012MnOp3456QrSt7890UvWx=
```

### WIZADMIN_SECRET

Generate a strong password:

```bash
# Option 1: OpenSSL
openssl rand -base64 24

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"

# Requirements:
# - Minimum 24 characters
# - Mix of upper, lower, numbers, symbols
# - No dictionary words
# - Unique (not reused)
```

### CRON_SECRET

Generate same as JWT_SECRET:

```bash
openssl rand -base64 32
```

### AWS Access Keys

1. Go to AWS Console → IAM → Users
2. Select the WizLingo IAM user
3. Security credentials → Create access key
4. Save both Access Key ID and Secret Access Key
5. Use immediately (cannot view secret again)

**Never share via**:
- Email
- Slack/Chat
- Code repositories
- Unencrypted files

## Secret Rotation

### Rotation Schedule

```
Monthly:  AWS credentials
Quarterly: JWT_SECRET, CRON_SECRET
Semi-annually: Database password
Annually: WIZADMIN_SECRET, API keys
```

### AWS Access Key Rotation (Every 90 Days)

**Step-by-Step**:

1. **Generate new keys**:
   ```bash
   # AWS Console → IAM → Users → wizlingo-app
   # Security credentials → Create access key
   # Note: Copy both ID and Secret immediately
   ```

2. **Verify new keys work locally**:
   ```bash
   # Update .env.local with new keys
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...

   # Test S3 access
   npm run test:s3

   # Test SES access
   npm run test:email
   ```

3. **Deploy to Vercel**:
   ```bash
   # Update Vercel environment variables
   # 1. Go to Vercel → Settings → Environment Variables
   # 2. Update AWS_ACCESS_KEY_ID (new)
   # 3. Update AWS_SECRET_ACCESS_KEY (new)
   # 4. Click "Save changes"
   ```

4. **Monitor deployment**:
   ```bash
   # Watch Vercel deploy log for errors
   # Check application logs for any auth failures
   # Run tests to verify everything works
   ```

5. **Deactivate old keys**:
   ```bash
   # AWS Console → IAM → Users → wizlingo-app
   # Security credentials → Delete old access key
   # (wait 24 hours to be safe)
   ```

6. **Document rotation**:
   ```bash
   # Add entry to rotation log (see example below)
   # Date: 2026-06-02
   # Secret: AWS Access Keys
   # Old Key: AKIA...
   # New Key: AKIA...
   # Status: ✅ Verified and active
   ```

### JWT_SECRET Rotation (Every 6 Months)

**Considerations**:
- Invalidates all existing JWT tokens
- Users must re-login
- Schedule during low-traffic period

**Step-by-Step**:

1. **Generate new secret**:
   ```bash
   openssl rand -base64 32
   # Output: AbCd1234EfGh5678IjKl9012MnOp3456QrSt7890UvWx=
   ```

2. **Update in Vercel**:
   - Go to Vercel → Settings → Environment Variables
   - Update JWT_SECRET with new value
   - Deploy

3. **Clear user sessions**:
   ```sql
   -- Invalidate all existing tokens by clearing session table
   -- (if using session-based auth)
   -- Or users will be auto-logged-out on next request
   ```

4. **Communicate to users**:
   - Send notification: "You'll need to log back in for security"
   - Provide login link
   - Monitor login errors

### Database Password Rotation

**Step-by-Step**:

1. **Change password in database provider**:
   - PostgreSQL/Neon/RDS dashboard
   - Set new password
   - Note the new password

2. **Update DATABASE_URL**:
   ```bash
   # Old: postgresql://user:old_pass@host:5432/db
   # New: postgresql://user:new_pass@host:5432/db

   # Update in Vercel environment variables
   ```

3. **Deploy and test**:
   - Deploy to Vercel
   - Run smoke tests
   - Monitor logs for connection errors

4. **Revert if needed**:
   - If connection fails, revert DATABASE_URL immediately
   - Troubleshoot in development first

## Emergency Procedures

### Compromised Secret (Immediate Action)

**If you suspect a secret has been exposed**:

1. **Immediately revoke the credential**:
   ```bash
   # AWS: Delete the access key
   # Database: Change password
   # API: Revoke/regenerate the key
   ```

2. **Generate new credential**:
   ```bash
   # Use credential generation steps above
   ```

3. **Update Vercel**:
   ```bash
   # Update environment variable with new credential
   # Deploy immediately
   ```

4. **Monitor for abuse**:
   ```bash
   # AWS: Check CloudTrail for unauthorized API calls
   # Database: Check query logs for suspicious activity
   # Email: Check SES bounce/complaint logs
   ```

5. **Document incident**:
   ```
   Incident Report:
   - Date/Time: 2026-06-02 14:30 UTC
   - Secret: AWS Access Key AKIA...
   - Status: Revoked
   - Action: New key generated and deployed
   - Duration: 5 minutes from discovery to fix
   - Impact: None observed
   ```

### Database Connection Failure

**If production database is unreachable**:

1. **Verify connection string**:
   ```bash
   # Check DATABASE_URL format
   # postgresql://user:pass@host:port/database?sslmode=require
   ```

2. **Check database status**:
   - Database provider console (Neon, RDS, etc.)
   - Verify server is running
   - Check for maintenance windows

3. **Verify network access**:
   - Check firewall rules
   - Verify IP whitelist
   - Check VPC security groups

4. **Verify credentials**:
   ```bash
   # Test credentials locally first
   psql postgresql://user:pass@host:5432/database
   ```

5. **Rollback if needed**:
   ```bash
   # Revert DATABASE_URL to last known good value
   # Redeploy
   ```

### Lost Credentials

**If you lose track of a secret** (e.g., AWS secret access key):

1. **AWS Access Keys**:
   - Cannot be recovered
   - Must create new key
   - Deactivate old key

2. **Database password**:
   - Reset through provider console
   - Update connection string
   - Deploy new DATABASE_URL

3. **API Keys**:
   - Regenerate through provider dashboard
   - Update environment variable
   - Deploy

4. **For future prevention**:
   - Store in password manager (1Password, LastPass)
   - Document generation method
   - Set calendar reminders for rotation

## Audit & Compliance

### Access Logging

Vercel automatically logs:
- Who changed each environment variable
- When the change was made
- Old vs new values (masked)
- Deployment triggered by change

**View logs**:
1. Vercel → Settings → Audit log
2. Filter by "Environment Variables"
3. Review all changes

### Compliance Checklist

- [ ] All secrets stored in Vercel (never in code)
- [ ] Access limited to authorized team members only
- [ ] Secrets rotated on schedule (see rotation schedule)
- [ ] Compromised credentials handled immediately
- [ ] All changes logged and auditable
- [ ] Backup procedures in place
- [ ] Team trained on secret handling
- [ ] Emergency procedures documented

### Regular Audits

**Monthly**:
- Review Vercel audit log for suspicious changes
- Verify secret rotation schedule is on track
- Check for any unauthorized access attempts

**Quarterly**:
- Update rotation schedule if needed
- Review team access permissions
- Verify backup procedures work

**Annually**:
- Full security audit
- Update secrets management policies
- Train team on best practices

## Rotation Log

Track all secret rotations here:

```
Date: 2026-06-02
Secret: AWS Access Keys
Status: Created (initial setup)
Key ID: AKIA...
Verified: ✅ Yes
Deployed: ✅ Yes

Date: 2026-06-15
Secret: JWT_SECRET
Status: Generated (initial setup)
Value: [masked]
Verified: ✅ Yes
Deployed: ✅ Yes

---

[Continue adding rotation entries chronologically]
```

## Quick Reference

### Reset a Secret

```bash
# AWS Access Key
# 1. Delete old key in AWS Console
# 2. Create new key
# 3. Update AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in Vercel
# 4. Deploy
# 5. Verify with: npm run validate:aws

# JWT_SECRET
# 1. Generate: openssl rand -base64 32
# 2. Update JWT_SECRET in Vercel
# 3. Deploy
# 4. Users auto-logout

# Database Password
# 1. Change in database provider console
# 2. Update DATABASE_URL in Vercel (new password)
# 3. Deploy
# 4. Test with: npm run db:ping
```

### Verify Secrets Are Working

```bash
# Test AWS credentials
npm run validate:aws

# Test database connection
npm run db:ping

# Test email service
npm run test:email

# Test S3 access
npm run test:s3
```

---

Last Updated: 2026-06-02
Document Version: 1.0
Author: Agent 2: Environment Setup
