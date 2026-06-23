import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateUserId } from "@/lib/userid-generator";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  grade: z.number().min(1).max(12),
  dateOfBirth: z.string().datetime(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, phone, grade, dateOfBirth } = validation.data;

    // Check if phone already has max users (optional: limit to 3 per phone)
    const existingWithPhone = await prisma.student.count({
      where: { phone, accountType: "PUBLIC" }
    });

    if (existingWithPhone >= 5) {
      return NextResponse.json(
        { error: "Maximum accounts per phone number reached" },
        { status: 400 }
      );
    }

    // Generate simple UserID: WL001, WL002, etc.
    const userId = await generateUserId();

    // Hash phone as default password
    const hashedPassword = await bcrypt.hash(phone, 10);

    // Map grade to gradeBand
    const gradeNum = parseInt(grade as any);
    let gradeBand = "BAND_3_5";
    if (gradeNum <= 2) gradeBand = "BAND_1_2";
    else if (gradeNum <= 5) gradeBand = "BAND_3_5";
    else if (gradeNum <= 8) gradeBand = "BAND_6_8";
    else gradeBand = "BAND_9_10";

    // Get or create default class for public users
    let defaultClass = await prisma.class.findFirst({
      where: { grade: gradeNum, section: "Public" }
    });

    if (!defaultClass) {
      let publicSchool = await prisma.school.findFirst({
        where: { code: "PUBLIC" }
      });

      if (!publicSchool) {
        publicSchool = await prisma.school.create({
          data: {
            name: "WizLingo Public",
            code: "PUBLIC"
          }
        });
      }

      defaultClass = await prisma.class.create({
        data: {
          grade: gradeNum,
          section: "Public",
          schoolId: publicSchool.id
        }
      });
    }

    // Create student with B2C account type
    const student = await prisma.student.create({
      data: {
        userId,
        name,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        grade: gradeNum,
        passwordHash: hashedPassword,
        classId: defaultClass.id,
        accountType: "PUBLIC",
        loginType: "PHONE_ID",
        passwordChangedAt: null // Flag for force password change
      }
    });

    // Create progress record
    await prisma.studentProgress.create({
      data: {
        studentId: student.id,
        gradeBand: gradeBand as any
      }
    });

    return NextResponse.json(
      {
        message: "Signup successful. Please login to set your password.",
        userId,
        phone,
        defaultPassword: phone,
        instructions: `Your UserID: ${userId}. Login with this UserID and use your phone number as the password. You'll be prompted to change your password on first login.`
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("B2C Signup error:", error);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
