# WizLingo Manager Portal Setup Guide

## Overview

The **Manager Portal** is a global admin dashboard for managing the entire B2B/B2C platform including:
- 📊 Platform analytics and statistics
- 👥 User management across all schools
- 🏫 School tracking and management  
- 🔐 Password reset for users
- 📈 Performance metrics and reports

## Quick Start

### 1. Create the First Manager Account

Run the setup script to create the default manager account:

```bash
npm run setup-manager
```

This will create:
- **Email:** `admin@wizlingo.com`
- **Password:** `WizLingo@123`
- **Role:** `SUPER_ADMIN`

### 2. Login to Manager Portal

Visit: `https://yourapp.com/manager/login`

Use the credentials created above.

### 3. Change Your Password

After first login, it's recommended to change the default password through your profile settings.

## Features

### 📊 Dashboard Overview

Shows real-time statistics:
- Total students across all schools
- Total schools onboarded
- New signups (last 24h, 7 days, 30 days)
- Active students percentage
- Reading/Speaking session metrics
- User distribution (B2C vs B2B)
- Top performers list

### 🔐 User Password Management

Managers can reset any user's password:

1. Enter the Student ID (e.g., `WL194599` for B2C or internal ID for B2B)
2. Set a new temporary password
3. User can change it on next login

**API Endpoint:**
```
POST /api/manager/users/reset-password
Headers: 
  - Cookie: manager_token=<token>
  - Content-Type: application/json
Body:
  {
    "studentId": "WL194599",
    "newPassword": "NewPassword123"
  }
```

### 👥 User Management (Planned)

- View all users with filters (B2C, B2B, by school, by progress)
- Edit user details
- Deactivate/reactivate accounts
- Assign to schools/classes

### 🏫 School Management (Planned)

- View all onboarded schools
- Add new schools
- Manage school admins and teachers
- View school-specific metrics

### 📈 Reports & Export (Planned)

- Generate custom reports
- Export user data
- Analytics by time period
- Performance benchmarks

## API Endpoints

### Authentication

#### Manager Login
```
POST /api/manager/login
Body: {
  "email": "admin@wizlingo.com",
  "password": "WizLingo@123"
}
Response: JWT token (sent as httpOnly cookie)
```

#### Manager Logout
```
POST /api/manager/logout
Response: Clears manager_token cookie
```

### Dashboard

#### Get Dashboard Stats
```
GET /api/manager/dashboard
Headers:
  - Cookie: manager_token=<token>
Response: {
  "summary": { ... },
  "sessions": { ... },
  "studentsByType": [ ... ],
  "topPerformers": [ ... ]
}
```

### User Management

#### Reset User Password
```
POST /api/manager/users/reset-password
Headers:
  - Cookie: manager_token=<token>
  - Content-Type: application/json
Body: {
  "studentId": "WL194599",
  "newPassword": "NewPassword123"
}
```

## Database Schema

### Manager Model

```prisma
model Manager {
  id              String    @id @default(cuid())
  name            String
  email           String    @unique
  phone           String?
  passwordHash    String
  role            ManagerRole @default(MANAGER)
  organization    String?
  isActive        Boolean   @default(true)
  lastLogin       DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum ManagerRole {
  MANAGER      # Regular manager
  ADMIN        # Admin with more permissions
  SUPER_ADMIN  # Full platform access
}
```

## Security

- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ JWT tokens with 24-hour expiry
- ✅ HttpOnly cookies (not accessible to JavaScript)
- ✅ CSRF protection via SameSite=Strict
- ✅ Token verification on every protected endpoint
- ✅ Rate limiting recommended

### Required Environment Variables

```env
JWT_SECRET=your-secret-key-here
DATABASE_URL=postgresql://...
NODE_ENV=production
```

## Adding More Managers

Use the Prisma CLI or create via database:

```typescript
const hashedPassword = await hash('password123', 10);
await prisma.manager.create({
  data: {
    name: 'Manager Name',
    email: 'manager@example.com',
    phone: '+91-9999-999-999',
    passwordHash: hashedPassword,
    role: 'MANAGER', // or ADMIN, SUPER_ADMIN
    organization: 'Edvanta',
    isActive: true
  }
});
```

## Troubleshooting

### Login Not Working

1. Verify email exists in database:
   ```sql
   SELECT * FROM "Manager" WHERE email = 'admin@wizlingo.com';
   ```

2. Check password hash is correct:
   - Test locally with bcrypt comparison
   - Ensure `JWT_SECRET` is set correctly

### Dashboard Not Loading

1. Check cookie: `manager_token` should be set
2. Verify JWT_SECRET matches between login and dashboard
3. Check browser console for CORS errors
4. Ensure API endpoints are accessible

### Password Reset Fails

1. Verify Student ID exists (check database)
2. Ensure password meets minimum length (8 chars)
3. Check manager has valid token

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Role-based access control (RBAC)
- [ ] Audit logs for all admin actions
- [ ] Bulk user management
- [ ] Email notifications
- [ ] Advanced filtering and search
- [ ] Custom report builder
- [ ] API rate limiting
- [ ] IP whitelisting

## Support

For issues or questions about the Manager Portal:
- Check logs: `tail -f ~/.pm2/logs/app-error.log`
- Review database: Use your database admin tool
- Contact: support@wizlingo.com
