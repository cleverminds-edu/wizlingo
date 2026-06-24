# Manager Portal - Deployment Guide

## 🚀 Deploying to wizlingo.edvanta.co.in

Your Manager Portal is **ready to deploy** to production!

### What's Included

✅ Manager Login Page  
✅ Manager Dashboard  
✅ User Password Reset  
✅ Platform Statistics  
✅ Automatic Table Creation  
✅ Security Features  

### Deployment Steps

#### Step 1: Push Latest Code

Code is already committed and pushed. Verify:

```bash
git log --oneline | head -5
# Should show: "Fix: Manager init endpoint..."
```

#### Step 2: Deploy to Production

Your deployment process (Railway, Vercel, etc.):

```bash
# Option A: If using Railway
railway deploy

# Option B: If using git push
git push production main

# Option C: Rebuild from GitHub
# Go to your deployment dashboard and trigger rebuild
```

#### Step 3: Initialize Manager Table & Account

Once deployed, hit this endpoint **once** to create the table and admin account:

```bash
curl -X POST https://wizlingo.edvanta.co.in/api/manager/init
```

**Response will be:**
```json
{
  "success": true,
  "message": "Manager table and account created successfully",
  "manager": {
    "email": "admin@wizlingo.com",
    "role": "SUPER_ADMIN",
    "password": "WizLingo@123 (default)"
  }
}
```

#### Step 4: Login to Manager Portal

Visit: `https://wizlingo.edvanta.co.in/manager/login`

**Credentials:**
- Email: `admin@wizlingo.com`
- Password: `WizLingo@123`

### ✅ Testing Checklist

- [ ] `/manager/login` page loads
- [ ] Can login with admin@wizlingo.com / WizLingo@123
- [ ] Dashboard shows statistics
- [ ] Can reset user password
- [ ] Logout works
- [ ] Can't access dashboard without login (redirects to login)

### 🔐 Security Notes

After successful login:

1. **Change Default Password Immediately**
   - Login and update password
   - (Feature to add: Change password page)

2. **Keep JWT_SECRET Secure**
   - Make sure it's set in production environment variables
   - Don't commit secrets to git

3. **Enable HTTPS**
   - All cookies use `secure: true` in production
   - Requires HTTPS connection

### 🔧 Environment Variables Needed

In production, ensure these are set:

```env
DATABASE_URL=postgresql://...your-prod-database...
JWT_SECRET=your-super-secret-key-here
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://wizlingo.edvanta.co.in
```

### 📋 Manager Portal URLs

Once deployed:

- **Login:** `https://wizlingo.edvanta.co.in/manager/login`
- **Dashboard:** `https://wizlingo.edvanta.co.in/manager/dashboard`
- **Init (setup):** `https://wizlingo.edvanta.co.in/api/manager/init`
- **Login API:** `https://wizlingo.edvanta.co.in/api/manager/login`
- **Dashboard API:** `https://wizlingo.edvanta.co.in/api/manager/dashboard`
- **Password Reset:** `https://wizlingo.edvanta.co.in/api/manager/users/reset-password`

### 🆘 Troubleshooting

**"Table doesn't exist" error**
→ Hit `/api/manager/init` endpoint to create table

**"Invalid email or password"**
→ Check credentials: admin@wizlingo.com / WizLingo@123
→ Hit `/api/manager/init` if table wasn't created

**Dashboard shows no data**
→ Data will populate as users signup
→ Check if Student table is populated

**Login redirects to login page**
→ Check JWT_SECRET is same in code and production

### 📚 Next Steps

After deployment:

1. Test login on production domain
2. Share feedback on UI/UX
3. Add more manager accounts if needed
4. Request feature additions (user filtering, bulk ops, etc.)
5. Monitor for any issues

### 🎯 What Users See vs What Managers See

**Regular Users (via student login):**
- Login at `/login`
- Dashboard with progress
- Reading & Speaking sessions
- Badges

**Managers (via manager login):**
- Login at `/manager/login`
- Dashboard with ALL users' statistics
- Password reset capability
- Platform analytics
- User tracking

---

## Quick Deployment Command

If you're on Railway or similar:

```bash
# From your deployment dashboard, redeploy with latest code
# Or run:
railway up

# Then test:
curl https://wizlingo.edvanta.co.in/api/manager/init
```

---

**Ready to deploy?** 
1. Deploy the code
2. Run init endpoint
3. Login at `/manager/login`
4. Let me know results!
