# WizLingo Manager Portal - Local Development Setup

## ✅ What's Ready

Your Manager Portal is fully built and running at:
```
http://localhost:3000/manager/login
```

## 🚀 Quick Start (3 Steps)

### Step 1: Create Manager Table in Database

The Manager table has been added to your schema. If you haven't migrated yet:

```bash
# If you're using Neon (PostgreSQL):
npx prisma migrate deploy

# OR if developing locally, run migrations:
npx prisma migrate dev --name add_manager_model
```

### Step 2: Create First Manager Account

After database is ready, create the admin account:

```bash
node scripts/create-manager.js
```

**Output will be:**
```
✅ Manager account created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: admin@wizlingo.com
🔐 Password: WizLingo@123
🎯 Role: SUPER_ADMIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Login URL: http://localhost:3000/manager/login

⚠️  IMPORTANT: Change the default password immediately after first login!
```

### Step 3: Login & Test

1. Open: `http://localhost:3000/manager/login`
2. Use credentials from Step 2
3. You'll see the **Manager Dashboard** with:
   - Platform statistics
   - User management
   - Password reset tool
   - Performance metrics

## 📊 Manager Dashboard Features

### Real-Time Statistics
- 📈 Total students (B2C & B2B)
- 🏫 Total schools onboarded
- 👥 New signups (24h, 7d, 30d)
- ⚡ Active user percentage
- 📚 Reading/Speaking session counts

### User Management
- 🔐 **Reset User Password** - Enter Student ID (e.g., WL194599) and set new password
- 📋 View all users with filters
- ⭐ See top 10 performers

### User Distribution
- 🌐 B2C Users (Public signups)
- 🏢 B2B Users (School accounts)

## 🔌 Testing the APIs

### Login Endpoint
```bash
curl -X POST http://localhost:3000/api/manager/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wizlingo.com",
    "password": "WizLingo@123"
  }' \
  -c cookies.txt
```

### Get Dashboard Stats
```bash
curl -X GET http://localhost:3000/api/manager/dashboard \
  -b cookies.txt
```

### Reset User Password
```bash
curl -X POST http://localhost:3000/api/manager/users/reset-password \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "studentId": "WL194599",
    "newPassword": "NewPassword123"
  }'
```

## 🗄️ Database Schema

### Manager Table
```prisma
model Manager {
  id              String    @id @default(cuid())
  name            String
  email           String    @unique
  phone           String?
  passwordHash    String
  role            ManagerRole @default(MANAGER)  // MANAGER, ADMIN, SUPER_ADMIN
  organization    String?
  isActive        Boolean   @default(true)
  lastLogin       DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

## 🔐 Security

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with 24-hour expiry
- ✅ HttpOnly secure cookies
- ✅ CSRF protection (SameSite=Strict)
- ✅ Token verification on all protected endpoints

## 📁 Files Structure

```
/app/manager/
  ├── login/page.tsx              # Manager login page
  └── dashboard/page.tsx          # Manager dashboard

/app/api/manager/
  ├── login/route.ts              # Authentication endpoint
  ├── logout/route.ts             # Logout endpoint
  ├── dashboard/route.ts          # Stats endpoint
  └── users/reset-password/route.ts  # Password reset

/scripts/
  ├── create-manager.js           # Create first manager
  └── setup-manager.ts            # Setup script

/MANAGER_PORTAL_SETUP.md          # Full documentation
```

## 🧪 Testing Checklist

- [ ] Manager can login with email/password
- [ ] Dashboard loads with statistics
- [ ] Can see total students, schools, signups
- [ ] Password reset works (need valid student ID)
- [ ] Logout clears the session
- [ ] Token expires after 24 hours
- [ ] Can see B2C vs B2B user distribution
- [ ] Top performers list displays correctly

## 💡 What This Does For Your Platform

### For Students (via wizlingo.edvanta.co.in/login)
- Create accounts with WL + 6 digits (WL194599, etc.)
- Track their reading/speaking progress
- Earn badges and levels
- Everything stays in the WizLingo app

### For Managers (via localhost:3000/manager/login)
- See **ALL** user accounts across platform
- Track new signups in real-time
- Reset forgotten passwords instantly
- View performance metrics
- Monitor B2C & B2B user distribution

## 🚨 Important Notes

1. **Database Migration Required**: You must run `npx prisma migrate deploy` first
2. **Default Password**: Change immediately after first login
3. **Local Testing**: Works on `localhost:3000`
4. **Production**: Will deploy to `wizlingo.edvanta.co.in/manager`
5. **Multiple Managers**: Can create more manager accounts with different roles

## 🆘 Troubleshooting

### "Manager not found" error on login
→ Database migration not run. Execute:
```bash
npx prisma migrate deploy
```

### "Table 'Manager' doesn't exist" error
→ Same as above - migrations needed

### Password reset fails
→ Check Student ID exists in Student table
→ Ensure password is at least 8 characters

### Can't access /manager/login
→ Dev server not running
→ Run: `npm run dev`

## 📈 Next Features (Planned)

- [ ] View all users with advanced filtering
- [ ] Edit user details
- [ ] Deactivate/reactivate accounts
- [ ] Manage schools
- [ ] Bulk user management
- [ ] Export reports
- [ ] Audit logs
- [ ] Two-factor authentication

---

**Ready to test locally?**
1. Run migrations
2. Create manager account
3. Open `http://localhost:3000/manager/login`
4. Login with admin@wizlingo.com / WizLingo@123

Let me know if you need help with any step! 🚀
