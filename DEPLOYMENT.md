# 🚀 WizLingo Deployment Guide

**Version:** 1.0  
**Last Updated:** June 4, 2026  
**Status:** Ready for Production

---

## Quick Start

### Local Testing
```bash
# Build Docker image locally
docker build -t wizlingo:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host/db" \
  -e ANTHROPIC_API_KEY="sk-..." \
  -e JWT_SECRET="your-secret-key" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  wizlingo:latest
```

---

## Deployment Options

### 🚄 Option 1: Railway (Recommended for Schools)

Railway is the simplest option for school deployments. Zero infrastructure knowledge required.

#### Prerequisites
- Railway account (free tier available)
- GitHub account with this repo
- Environment variables prepared

#### Step-by-Step

**1. Connect GitHub Repository**
```bash
# In Railway dashboard:
# 1. Click "New Project"
# 2. Select "GitHub Repo"
# 3. Authorize Railway access
# 4. Select this repository
```

**2. Configure Database**
```bash
# In Railway dashboard:
# 1. Click "Add Service"
# 2. Select "PostgreSQL"
# 3. Railway auto-creates DATABASE_URL
```

**3. Set Environment Variables**
```bash
# In Railway Service Settings → Variables:

NEXT_PUBLIC_APP_URL=https://your-app.railway.app
DATABASE_URL=$DATABASE_URL (auto-set by Railway)
JWT_SECRET=generate-with: openssl rand -base64 32
ANTHROPIC_API_KEY=your-anthropic-api-key
WIZADMIN_SECRET=generate-with: openssl rand -base64 32
NODE_ENV=production
```

**4. Configure Build Settings**
```bash
# In Railway Service Settings → Build:
Build Command: npm run build
Start Command: npm start
```

**5. Deploy**
```bash
# Push to GitHub main branch:
git push origin main

# Railway auto-deploys on push
# Watch deployment logs in Railway dashboard
```

**6. Verify Deployment**
```bash
curl https://your-app.railway.app/api/health
# Should return: { "status": "healthy" }
```

#### Railway Pricing
- **Free Tier:** $5/month credit (perfect for 100-150 students)
- **Pro Tier:** $20/month (for scaling beyond 500 students)
- **Database:** PostgreSQL 10GB free with Pro

---

### ☁️ Option 2: AWS (For Scale)

For larger deployments (500+ students) or advanced requirements.

#### Architecture
```
Route 53 (DNS)
    ↓
CloudFront (CDN)
    ↓
Application Load Balancer
    ↓
ECS Cluster (Auto-scaling)
    ↓
RDS PostgreSQL
```

#### Prerequisites
- AWS account
- AWS CLI installed and configured
- Docker knowledge

#### Step-by-Step

**1. Create ECR Repository**
```bash
# Create private Docker registry
aws ecr create-repository --repository-name wizlingo \
  --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

**2. Build and Push Docker Image**
```bash
# Build
docker build -t wizlingo:latest .

# Tag for ECR
docker tag wizlingo:latest \
  <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/wizlingo:latest

# Push
docker push <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/wizlingo:latest
```

**3. Create RDS Database**
```bash
aws rds create-db-instance \
  --db-instance-identifier wizlingo-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password <STRONG_PASSWORD> \
  --allocated-storage 20 \
  --backup-retention-period 30 \
  --multi-az \
  --storage-encrypted
```

**4. Create ECS Cluster**
```bash
# Create cluster
aws ecs create-cluster --cluster-name wizlingo-prod

# Register task definition (see below)
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster wizlingo-prod \
  --service-name wizlingo \
  --task-definition wizlingo:1 \
  --desired-count 2 \
  --launch-type FARGATE
```

**5. Task Definition (task-definition.json)**
```json
{
  "family": "wizlingo",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "wizlingo",
      "image": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/wizlingo:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "NEXT_PUBLIC_APP_URL",
          "value": "https://your-domain.com"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT>:secret:wizlingo/db:DATABASE_URL::"
        },
        {
          "name": "ANTHROPIC_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT>:secret:wizlingo/api:ANTHROPIC_API_KEY::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/wizlingo",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

**6. Setup Load Balancer**
```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name wizlingo-alb \
  --subnets subnet-xxx subnet-yyy \
  --scheme internet-facing

# Create target group
aws elbv2 create-target-group \
  --name wizlingo-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxx

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:... \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:...
```

**7. Configure CloudFront**
```bash
# Create distribution pointing to ALB
aws cloudfront create-distribution \
  --distribution-config file://cf-config.json
```

#### AWS Pricing (Estimate for 500 students)
- **ECS Fargate:** ~$20/month (2 tasks)
- **RDS PostgreSQL:** ~$30/month (db.t3.micro)
- **Load Balancer:** ~$16/month
- **CloudFront:** ~$5-15/month
- **Total:** ~$70-80/month

---

## Post-Deployment Checklist

### Immediate (Within 1 hour)
- [ ] Health check passes: `curl /api/health` → 200
- [ ] Login works with test phone number
- [ ] Can complete reading session
- [ ] Can complete speaking session
- [ ] Feedback submission works
- [ ] Dashboard displays correctly
- [ ] Admin dashboard accessible (`/admin/beta-dashboard`)

### Day 1
- [ ] Monitor error logs (Sentry)
- [ ] Check rate limiting is working (test 6 OTP requests)
- [ ] Verify database backups are enabled
- [ ] Test certificate verification page
- [ ] Test badge sharing functionality

### Week 1
- [ ] Monitor uptime (should be 99%+)
- [ ] Review CloudWatch/logs for errors
- [ ] Check database performance metrics
- [ ] Verify email notifications sending (if enabled)
- [ ] Monitor API response times

### Week 2
- [ ] Analyze student usage patterns
- [ ] Review feedback from students
- [ ] Check for any security alerts
- [ ] Optimize slow queries if found
- [ ] Update documentation based on learnings

---

## Monitoring & Maintenance

### Health Checks
```bash
# Check application health
curl https://your-app.domain/api/health

# Should return:
{
  "status": "healthy",
  "timestamp": "2026-06-04T...",
  "uptime": 12345.67,
  "environment": "production"
}
```

### Database Backups

**Railway:** Automatic daily backups (14 days retention)

**AWS:** 
```bash
# View backup policy
aws rds describe-db-instances \
  --db-instance-identifier wizlingo-prod \
  --query 'DBInstances[0].[BackupRetentionPeriod,PreferredBackupWindow]'

# Manual backup
aws rds create-db-snapshot \
  --db-instance-identifier wizlingo-prod \
  --db-snapshot-identifier wizlingo-backup-$(date +%Y%m%d)
```

### Logs & Monitoring

**Railway:**
- Logs visible in dashboard → Deployments → Logs
- Auto-integration with most monitoring tools

**AWS:**
- CloudWatch Logs: `/ecs/wizlingo`
- View in AWS Console or CLI:
```bash
aws logs tail /ecs/wizlingo --follow
```

### Scaling

**Railway:** Auto-scales based on load (no configuration needed)

**AWS:** 
```bash
# Setup auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/wizlingo-prod/wizlingo \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --policy-name cpu-scaling \
  --service-namespace ecs \
  --resource-id service/wizlingo-prod/wizlingo \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

---

## Troubleshooting

### App Won't Start
```bash
# Check logs
# Railway: Dashboard → Logs
# AWS: aws logs tail /ecs/wizlingo --follow

# Common issues:
# 1. Missing DATABASE_URL
# 2. Invalid ANTHROPIC_API_KEY
# 3. Database migration failed
# 4. Port 3000 already in use
```

### Database Connection Failed
```bash
# Test connection locally
psql postgres://user:pass@host:5432/wizlingo

# Check credentials in environment variables
# Verify database is running and accessible
# Check security groups/firewall rules
```

### High CPU/Memory Usage
```bash
# Check which routes are slow
# View CloudWatch metrics
# Look for N+1 query problems
# Scale up instance if needed
```

### SSL/HTTPS Issues
```bash
# Railway: Auto-configured with *.railway.app
# Custom domain: Use Route 53 + ACM

# For CloudFront:
aws cloudfront create-distribution-with-tags \
  --distribution-config-with-tags file://cf-with-cert.json
```

---

## Rollback Procedure

### Railway
```bash
# In Railway dashboard:
# 1. Click "Deployments"
# 2. Click previous version
# 3. Click "Redeploy"
# Takes ~2 minutes
```

### AWS ECS
```bash
# Revert to previous task definition
aws ecs update-service \
  --cluster wizlingo-prod \
  --service wizlingo \
  --task-definition wizlingo:1
```

---

## Disaster Recovery

### Backup Restore

**Railway:**
1. Dashboard → Postgres → Backups
2. Select backup date
3. Click "Restore"

**AWS:**
```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier wizlingo-restored \
  --db-snapshot-identifier wizlingo-backup-20260604
```

### Data Export
```bash
# Export student data for compliance
pg_dump "postgresql://user:pass@host:5432/wizlingo" > backup.sql

# Or via Prisma
npx prisma db seed
```

---

## Security Best Practices

- ✅ Never commit secrets (use environment variables)
- ✅ Rotate JWT_SECRET and WIZADMIN_SECRET every 6 months
- ✅ Enable database encryption (RDS)
- ✅ Use WAF for DDoS protection (optional)
- ✅ Monitor for rate limit abuse
- ✅ Regular security updates (npm audit)
- ✅ Enable HTTPS/TLS everywhere

---

## Performance Optimization

### Database
```bash
# Enable connection pooling
# Railway: Automatic
# AWS: Use RDS Proxy

# Monitor slow queries
EXPLAIN ANALYZE SELECT ...
```

### Caching
```bash
# Next.js built-in static generation for pages
# Database query caching via Prisma
# Browser caching via CloudFront/CDN
```

### CDN
```bash
# Railway: Built-in
# AWS: Use CloudFront
# Serve static assets from /public via CDN
```

---

## Cost Optimization

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| Railway | Pro | $20/mo | Includes DB & deployment |
| AWS | ECS + RDS | $70/mo | More control, steeper learning curve |
| Vercel | Hobby | Free | No database, limited to API routes |

**Recommendation for Schools:** Use Railway for first year (simple, affordable), migrate to AWS if scaling beyond 1000 students.

---

## Support & Documentation

- **Railway Docs:** https://docs.railway.app
- **AWS Docs:** https://docs.aws.amazon.com
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Prisma Deployment:** https://www.prisma.io/docs/orm/deployment

---

**Last Updated:** June 4, 2026  
**Next Review:** After first school goes live (June 15, 2026)

