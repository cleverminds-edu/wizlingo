# 📱 Adding Phone & Email Login Options

**Goal:** Add both phone and email login options to WizLingo  
**Current:** Phone OTP only  
**Target:** Phone OTP + Email OTP

---

## 🎯 What We Need to Add

### **Current Flow (Phone Only)**
```
User → Enter Phone → OTP Sent → Verify → Login
```

### **New Flow (Both Options)**
```
User chooses:
├─ Phone OTP: Enter Phone → OTP Sent → Verify → Login
└─ Email OTP: Enter Email → OTP Sent → Verify → Login
```

---

## 🔧 Implementation Steps

### **Step 1: Update Database Schema**

Add email fields to Student model:

**File:** `prisma/schema.prisma`

```prisma
model Student {
  id                    String    @id @default(cuid())
  phone                 String    @unique
  email                 String?   @unique  // Add this
  name                  String
  schoolId              String
  classId               String
  level                 String    @default("beginner")
  
  // ... rest of fields
}
```

Run migration:
```bash
npx prisma migrate dev --name add_email_to_student
```

---

### **Step 2: Create Email Service**

Create email OTP sender:

**File:** `lib/email-service.ts`

```typescript
import nodemailer from 'nodemailer';

// Configure your email provider
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Or use a service like SendGrid, Resend, etc.
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmailOTP(email: string, otp: string) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'WizLingo Verification Code',
      html: `
        <h2>Welcome to WizLingo!</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #F97316; font-size: 32px; letter-spacing: 2px;">
          ${otp}
        </h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p style="color: #999; font-size: 12px;">
          Powered by Edvanta Intelligence System (AI)
        </p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send email OTP:', error);
    return false;
  }
}
```

---

### **Step 3: Create Phone/Email Selection Screen**

**File:** `app/auth/login-method/page.tsx` (NEW)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginMethodPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/wiziingo-logo.svg"
            alt="WizLingo"
            width={150}
            height={50}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-purple-200 mt-2">Choose how to login</p>
          <p className="text-xs text-orange-400 font-semibold mt-2">
            Powered by Edvanta Intelligence System (AI)
          </p>
        </div>

        {/* Login Method Cards */}
        <div className="space-y-4">
          {/* Phone Login */}
          <button
            onClick={() => router.push('/auth/phone-signup')}
            className="w-full p-6 bg-white rounded-xl hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">📱</div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-gray-900">Login with Phone</h3>
                <p className="text-sm text-gray-600">Get OTP via SMS</p>
              </div>
              <div className="text-2xl text-purple-600 group-hover:translate-x-1 transition">
                →
              </div>
            </div>
          </button>

          {/* Email Login */}
          <button
            onClick={() => router.push('/auth/email-signup')}
            className="w-full p-6 bg-white rounded-xl hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">📧</div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-gray-900">Login with Email</h3>
                <p className="text-sm text-gray-600">Get OTP via Email</p>
              </div>
              <div className="text-2xl text-purple-600 group-hover:translate-x-1 transition">
                →
              </div>
            </div>
          </button>
        </div>

        {/* Help */}
        <div className="mt-8 text-center text-purple-200 text-sm">
          <p>Already have account? Contact school admin</p>
          <p className="text-xs text-purple-300 mt-2">
            Email: support@edvanta.co.in
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### **Step 4: Update Phone Login API**

**File:** `app/api/auth/send-otp/route.ts`

Update to accept both phone and email:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { validateBody, sendOtpSchema } from '@/lib/validation';
import { sendEmailOTP } from '@/lib/email-service';

const otpStore: Record<string, { code: string; expiresAt: number; attempts: number }> = {};

function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const rateLimitKey = `otp:${clientIp}`;
    const rateLimitResult = rateLimit(rateLimitKey, RATE_LIMITS.OTP.limit, RATE_LIMITS.OTP.windowMs);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { phone, email, type } = body;

    // Validate
    if (!type || !['phone', 'email'].includes(type)) {
      return NextResponse.json({ error: 'Invalid login type' }, { status: 400 });
    }

    if (type === 'phone' && !phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    if (type === 'email' && !email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const key = type === 'phone' ? phone : email;

    otpStore[key] = { code: otp, expiresAt, attempts: 0 };

    // Send OTP
    if (type === 'phone') {
      // Send SMS via Twilio or similar
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
    } else if (type === 'email') {
      // Send Email
      await sendEmailOTP(email, otp);
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    }

    return NextResponse.json(
      {
        message: `OTP sent to ${type === 'phone' ? 'phone' : 'email'}`,
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

// Export for use in verify endpoint
export function getStoredOTP(key: string) {
  return otpStore[key];
}

export function clearOTP(key: string) {
  delete otpStore[key];
}
```

---

### **Step 5: Create Email Login Page**

**File:** `app/auth/email-signup/page.tsx` (NEW)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function EmailSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'email' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      // Redirect to verify page
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}&type=email`);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/wiziingo-logo.svg"
            alt="WizLingo"
            width={150}
            height={50}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-white">Login with Email</h1>
          <p className="text-purple-200 mt-2">We'll send you a verification code</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSendOTP} className="bg-white rounded-xl p-8 shadow-lg space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/auth/login-method')}
            className="text-purple-200 hover:text-white text-sm"
          >
            ← Back to Login Methods
          </button>
        </div>

        {/* Branding */}
        <p className="text-xs text-orange-400 font-semibold text-center mt-6">
          Powered by Edvanta Intelligence System (AI)
        </p>
      </div>
    </div>
  );
}
```

---

### **Step 6: Update Verify OTP API**

**File:** `app/api/auth/verify-otp/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { validateBody, verifyOtpSchema } from '@/lib/validation';
import { getStoredOTP, clearOTP } from '../send-otp/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const rateLimitKey = `otp-verify:${clientIp}`;
    const rateLimitResult = rateLimit(rateLimitKey, RATE_LIMITS.LOGIN.limit, RATE_LIMITS.LOGIN.windowMs);

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
    }

    const validation = await validateBody(request, verifyOtpSchema);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { phone, email, otp, type } = await request.json();

    if (!type || !['phone', 'email'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const key = type === 'phone' ? phone : email;
    const storedData = getStoredOTP(key);

    if (!storedData) {
      return NextResponse.json({ error: 'OTP not found' }, { status: 400 });
    }

    if (Date.now() > storedData.expiresAt) {
      clearOTP(key);
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    if (storedData.attempts >= 3) {
      clearOTP(key);
      return NextResponse.json({ error: 'Too many attempts' }, { status: 400 });
    }

    if (storedData.code !== otp) {
      storedData.attempts += 1;
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // OTP verified
    clearOTP(key);

    // Find or create student
    let student;
    if (type === 'phone') {
      student = await prisma.student.findUnique({ where: { phone } });
    } else {
      student = await prisma.student.findUnique({ where: { email } });
    }

    if (!student) {
      // Need to create - redirect to profile creation
      return NextResponse.json({
        verified: true,
        newUser: true,
        contact: type === 'phone' ? phone : email,
        type,
      });
    }

    // Set session
    // ... (existing session logic)

    return NextResponse.json({
      verified: true,
      newUser: false,
      studentId: student.id,
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
```

---

## 📝 Updated Validation Schema

**File:** `lib/validation.ts`

Add email validation:

```typescript
export const sendOtpSchema = z.object({
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  type: z.enum(['phone', 'email']),
}).refine(
  (data) => data.phone || data.email,
  'Either phone or email is required'
);

export const verifyOtpSchema = z.object({
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  otp: z.string().length(4),
  type: z.enum(['phone', 'email']),
});
```

---

## 🔗 Updated Navigation Flow

**Current:**
```
/ → /auth/phone-signup → /auth/verify-otp → /student/dashboard
```

**New:**
```
/ → /auth/login-method
     ├→ /auth/phone-signup → /auth/verify-otp → /student/dashboard
     └→ /auth/email-signup → /auth/verify-otp → /student/dashboard
```

---

## 📦 Dependencies to Add

```bash
npm install nodemailer
# Or use a service:
npm install @sendgrid/mail  # For SendGrid
npm install resend           # For Resend (recommended)
```

**For .env.local:**
```
# Email Service (choose one)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# OR SendGrid
SENDGRID_API_KEY=sg_...

# OR Resend
RESEND_API_KEY=re_...
```

---

## ✅ Checklist

- [ ] Add email field to Student model
- [ ] Run Prisma migration
- [ ] Create email service (email-service.ts)
- [ ] Create login method selector page
- [ ] Create email signup page
- [ ] Update send-otp API to handle both phone & email
- [ ] Update verify-otp API to handle both types
- [ ] Update validation schemas
- [ ] Test phone login flow
- [ ] Test email login flow
- [ ] Update navigation links
- [ ] Add environment variables for email service
- [ ] Test OTP expiry for both methods
- [ ] Build and verify

---

## 🎯 Benefits of Dual Options

✅ **Better UX:** Students choose their preferred method  
✅ **Accessibility:** Some prefer email, some prefer SMS  
✅ **Flexibility:** Teachers can help via email if SMS fails  
✅ **Data:** Phone + Email for better student records  
✅ **Recovery:** If one method fails, use the other

---

**Implementation Time:** 2-3 hours  
**Testing Time:** 1-2 hours  
**Total:** ~4-5 hours

