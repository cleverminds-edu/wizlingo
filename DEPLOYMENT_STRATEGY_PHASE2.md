# Phase 2 Production Deployment Strategy

## 🎯 Deployment Objectives

Deploy all Phase 2 features to production safely with zero downtime:
1. ✅ Database migrations
2. ✅ Environment configuration
3. ✅ Email service setup
4. ✅ Build & deploy
5. ✅ Post-deployment verification
6. ✅ Monitoring setup

---

## 📋 Pre-Deployment Checklist

### Infrastructure Requirements
- [ ] Production database backup
- [ ] Email service credentials (SendGrid/Mailgun/AWS SES)
- [ ] File storage for certificates (S3 or local)
- [ ] Cron job scheduler for nightly leaderboard updates
- [ ] Monitoring/alerting setup (for email failures, long queries)

### Code Requirements
- [ ] All Phase 2 tests passing
- [ ] No TypeScript errors
- [ ] All commits merged to main
- [ ] Environment variables documented
- [ ] Database migration reviewed

### Stakeholder Communication
- [ ] Notify admins: New features launching
- [ ] Notify teachers: Leaderboard privacy settings
- [ ] Prepare parent communication: Email notifications starting
- [ ] Document new features for help center

---

## 🔄 Deployment Plan (4 Phases)

### Phase 1: Database & Infrastructure (15 min)
```
1. Database backup
2. Run Prisma migrations
   $ npx prisma migrate deploy
3. Verify migrations successful
4. Check database schema
```

### Phase 2: Configuration (10 min)
```
1. Set environment variables:
   - EMAIL_PROVIDER (sendgrid/ses/mailgun)
   - EMAIL_API_KEY
   - EMAIL_FROM_ADDRESS
   - CERTIFICATE_STORAGE (s3/local)
   - AWS_BUCKET (if S3)
   
2. Configure email templates:
   - Test email sending
   - Verify template rendering

3. Setup cron job:
   - Add to crontab: 0 23 * * * npm run leaderboards:update
   - Or use task scheduler equivalent
```

### Phase 3: Build & Deploy (20 min)
```
1. Run full test suite
   $ npm test
   
2. Build production bundle
   $ npm run build
   
3. Deploy to production
   - Via your deployment platform (Vercel, AWS, Docker, etc)
   - Standard deployment: no special flags needed
   
4. Verify deployment:
   - Check /health endpoint
   - Verify API endpoints respond
```

### Phase 4: Post-Deployment Verification (15 min)
```
1. Test celebration effects
   - Earn a test badge on production
   - Verify particles, sounds, animations
   
2. Test certificates
   - Download a certificate
   - Verify PDF quality
   - Test QR code scan
   
3. Test leaderboards
   - View leaderboards
   - Check rankings accurate
   
4. Test emails
   - Trigger badge earned email
   - Check delivery (check spam folder)
   - Verify template rendering
   
5. Monitor system
   - Check error rates
   - Monitor email queue
   - Watch database performance
```

---

## 🔐 Critical Deployment Tasks

### Task 1: Environment Variables Setup
```bash
# Create .env.production with:
EMAIL_PROVIDER=sendgrid  # or ses, mailgun
EMAIL_API_KEY=your_key_here
EMAIL_FROM_ADDRESS=noreply@wizlingo.com
CERTIFICATE_STORAGE=s3  # or local
AWS_BUCKET=wizlingo-certificates

# Optional: email preferences defaults
EMAIL_DEFAULT_ENABLED=true
EMAIL_DEFAULT_FREQUENCY=immediate  # immediate, daily, weekly
```

### Task 2: Database Migration
```sql
-- Run all pending migrations
npx prisma migrate deploy

-- Expected changes:
- Add avgFluency to StudentProgress
- Create Leaderboard table (Phase 2)
- Create NotificationPreference table (Phase 2)
- Create SentEmail audit table (Phase 2)
- Create Certificate table (Phase 2)
- Add parentEmail to Student (Phase 2)
```

### Task 3: Email Service Configuration
Choose one email provider:

**Option A: SendGrid (Recommended)**
```bash
npm install @sendgrid/mail
# Get API key from SendGrid dashboard
# Set EMAIL_PROVIDER=sendgrid
# Set EMAIL_API_KEY=SG.xxxx
```

**Option B: AWS SES**
```bash
npm install aws-sdk
# Configure AWS credentials
# Set EMAIL_PROVIDER=ses
# Set AWS_REGION=us-east-1
```

**Option C: Mailgun**
```bash
npm install mailgun.js
# Get API key from Mailgun dashboard
# Set EMAIL_PROVIDER=mailgun
```

### Task 4: Cron Job for Leaderboard Updates
```bash
# Option A: Crontab (Linux/Mac)
0 23 * * * cd /path/to/app && npm run leaderboards:update

# Option B: systemd timer (Linux)
# Create /etc/systemd/system/wizlingo-leaderboards.timer

# Option C: Heroku scheduler / AWS Lambda
# Add nightly trigger via platform

# Option D: Node cron package
# Already integrated in app/cron/index.ts
```

### Task 5: File Storage for Certificates
```bash
# Option A: Local storage
CERTIFICATE_STORAGE=local
CERTIFICATE_PATH=/var/www/certificates/

# Option B: AWS S3
CERTIFICATE_STORAGE=s3
AWS_BUCKET=wizlingo-certs
AWS_REGION=us-east-1

# Option C: CloudFlare R2
CERTIFICATE_STORAGE=r2
R2_BUCKET=wizlingo-certs
```

---

## ✅ Deployment Verification Checklist

### Immediate Post-Deployment (5 min)
- [ ] App loads without errors
- [ ] Dashboard displays
- [ ] No console errors
- [ ] API endpoints respond

### Celebration Effects (5 min)
- [ ] Test badge celebration shows
- [ ] Particles render smoothly
- [ ] Sound plays (on desktop)
- [ ] Animation completes
- [ ] Modal auto-closes

### Certificates (5 min)
- [ ] Certificate generated on badge earn
- [ ] PDF downloads correctly
- [ ] QR code scans to verification page
- [ ] Verification page displays correctly

### Leaderboards (5 min)
- [ ] All 5 leaderboard types load
- [ ] Rankings display correctly
- [ ] Student appears on leaderboard
- [ ] Mobile responsive

### Emails (10 min)
- [ ] Trigger badge earned event
- [ ] Email sent within 5 minutes
- [ ] Email arrives (check spam)
- [ ] Email template renders correctly
- [ ] Links in email work
- [ ] Parent email sent as well

### Database (5 min)
- [ ] New tables exist
- [ ] avgFluency field present
- [ ] No migration errors
- [ ] Data intact from Phase 1

### Performance (5 min)
- [ ] Page load < 2 seconds
- [ ] API response < 500ms
- [ ] Database queries performant
- [ ] Memory usage normal

---

## 🚨 Rollback Plan

If anything goes wrong:

```bash
# Option 1: Revert database
npm run db:rollback

# Option 2: Revert to previous deployment
# Via your deployment platform

# Option 3: Manual rollback
- Revert to last working commit
- Redeploy previous version
- Notify team

# Option 4: Disable affected features
- Disable email notifications: EMAIL_ENABLED=false
- Disable leaderboards: LEADERBOARDS_ENABLED=false
- Disable certificates: CERTIFICATES_ENABLED=false
```

---

## 📊 Monitoring Setup

### Key Metrics to Monitor
```
1. Email sending:
   - Emails sent per hour
   - Email failures
   - Email delivery rate
   - Queue depth

2. Leaderboard:
   - Update job completion
   - Query performance
   - Ranking accuracy

3. Certificates:
   - PDFs generated per day
   - Generation time
   - Verification QR scans

4. General:
   - API error rate
   - Page load time
   - Database query time
   - Memory usage
```

### Alerting Thresholds
```
Critical:
- Email failure rate > 5%
- API error rate > 2%
- Database query > 5 seconds
- Leaderboard job failed

Warning:
- Email queue depth > 100
- API error rate > 0.5%
- Database query > 1 second
- Certificate generation > 5 seconds
```

---

## 🎯 Deployment Options

### Option A: Manual Deployment (Recommended for First Time)
1. Run through each phase manually
2. Test each section thoroughly
3. Monitor closely post-deployment

### Option B: Scripted Deployment
```bash
./scripts/deploy-phase2.sh production
```

### Option C: Platform-Specific
- **Vercel:** Auto-deploy on push to main
- **AWS:** Use CloudFormation/SAM
- **Docker:** Use Docker Compose
- **Heroku:** Use Procfile + buildpacks

---

## 📞 Support Plan

### During Deployment
- Have team on standby
- Monitor error logs in real-time
- Keep rollback plan ready

### Post-Deployment
- Monitor for 24 hours
- Check email delivery daily
- Monitor leaderboard job nightly
- Be ready to roll back if issues

### Communication
- Notify stakeholders once deployed
- Announce new features to users
- Send parent welcome email about notifications

---

## 🎊 Success Criteria

Deployment is successful when:
- ✅ All Phase 2 features working
- ✅ No critical errors in logs
- ✅ Email delivery confirmed
- ✅ Leaderboards calculating correctly
- ✅ Certificates generating
- ✅ Performance metrics normal
- ✅ User feedback positive

---

## 📅 Deployment Timeline

| Phase | Task | Duration | Owner |
|-------|------|----------|-------|
| 1 | Database & Backup | 5 min | DBA |
| 2 | Migrations & Config | 10 min | DevOps |
| 3 | Build & Deploy | 20 min | Engineer |
| 4 | Verification | 15 min | QA |
| 5 | Monitoring | Ongoing | DevOps |

**Total:** ~60 minutes from start to full verification

---

## 🚀 Ready to Deploy?

This deployment strategy ensures safe, verifiable Phase 2 launch.

**Next Steps:**
1. Review environment variables needed
2. Set up email provider
3. Configure database migration
4. Test in staging environment (optional)
5. Execute deployment following this plan
6. Verify all features working
7. Monitor for 24 hours

**Questions to Answer Before Deployment:**
- [ ] Which email provider will you use?
- [ ] Where will certificates be stored (S3 or local)?
- [ ] How will nightly leaderboard updates run?
- [ ] Do you have all required API keys?
- [ ] Is production database backed up?
