import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone, gradeCategory, dob } = body;

    // Validate: Must have name
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // TWO SIGNUP FLOWS:
    // 1. B2B Schools: Email + Password (for school students with email)
    // 2. B2C Tier 2/3: Phone only (for students without email)

    if (email) {
      // FLOW 1: Email-based signup (B2B/B2C with email)
      if (!password) {
        return NextResponse.json(
          { error: "Password is required for email signup" },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }

      // Check if email exists
      const existing = await prisma.student.findUnique({
        where: { email },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create student
      const student = await prisma.student.create({
        data: {
          email,
          name,
          passwordHash,
          currentLevel: 2,
          gradeCategory: gradeCategory || 'GR_1_3',
          dateOfBirth: dob ? new Date(dob) : null,
          progress: {
            create: {},
          },
          journeyProgress: {
            create: {
              currentPillar: 'SOUND_FOUNDATION',
              currentStage: 'STAGE_1',
              stageProgress: 0,
            },
          },
        },
      });

      // Create token
      const token = createToken(student.id);

      return NextResponse.json({
        studentId: student.id,
        userId: null,
        token,
        signupType: "email",
        message: "Welcome to WizLingo! 🎉",
      });
    } else if (phone) {
      // FLOW 2: Phone-based signup (B2C Tier 2/3 without email)
      // Validate phone: 10 digits
      if (!/^\d{10}$/.test(phone)) {
        return NextResponse.json(
          { error: "Phone must be 10 digits" },
          { status: 400 }
        );
      }

      // Check if phone already has a student
      const existing = await prisma.student.findFirst({
        where: { phone },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Phone number already registered. Use login instead." },
          { status: 409 }
        );
      }

      // Generate UserID: WL + 6 random digits
      // Example: WL123456, WL987654
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const userId = `WL${randomNum}`;

      // Use phone as default password (hashed)
      const passwordHash = await hashPassword(phone);

      // Create student with phone-based signup
      const student = await prisma.student.create({
        data: {
          email: null,
          name,
          phone,
          passwordHash,
          userId,
          currentLevel: 2,
          gradeCategory: gradeCategory || 'GR_1_3',
          dateOfBirth: dob ? new Date(dob) : null,
          progress: {
            create: {},
          },
          journeyProgress: {
            create: {
              currentPillar: 'SOUND_FOUNDATION',
              currentStage: 'STAGE_1',
              stageProgress: 0,
            },
          },
        },
      });

      // Create token
      const token = createToken(student.id);

      return NextResponse.json({
        studentId: student.id,
        userId: userId,
        token,
        signupType: "phone",
        message: `Welcome to WizLingo! Your ID is ${userId}. Your password is your phone number. Change it on first login.`,
      });
    } else {
      return NextResponse.json(
        { error: "Please provide either email or phone number" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
