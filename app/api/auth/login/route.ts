import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken, signToken, makeAuthCookie } from "@/lib/auth";
import { primaryClassId } from "@/lib/student-class";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // SCHOOL LOGIN (admission number / employee code + PIN), restored from production.
    // The school login form on /login sends `role`; B2C logins never do.
    if (body.role) {
      return schoolPinLogin(body);
    }

    const { email, phone, userId, password } = body;

    // Validate: Must have password
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    let student;

    // TWO LOGIN FLOWS:
    // 1. Email login: email + password
    // 2. Phone/UserID login: (phone OR userId) + password

    if (email) {
      // FLOW 1: Email-based login
      student = await prisma.student.findUnique({
        where: { email },
      });

      if (!student) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
    } else if (userId) {
      // FLOW 2a: UserID login (WL123456)
      student = await prisma.student.findFirst({
        where: { userId },
      });

      if (!student) {
        return NextResponse.json(
          { error: "Invalid UserID or password" },
          { status: 401 }
        );
      }
    } else if (phone) {
      // FLOW 2b: Phone login (10 digits)
      if (!/^\d{10}$/.test(phone)) {
        return NextResponse.json(
          { error: "Invalid phone number" },
          { status: 400 }
        );
      }

      student = await prisma.student.findFirst({
        where: { phone },
      });

      if (!student) {
        return NextResponse.json(
          { error: "Phone number not registered. Please signup first." },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Please provide email, UserID, or phone number" },
        { status: 400 }
      );
    }

    // Verify password
    const valid = await verifyPassword(password, student.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Create token
    const token = createToken(student.id);

    return NextResponse.json({
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email || null,
        phone: student.phone || null,
        userId: student.userId || null,
        currentLevel: student.currentLevel,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * School portal login — same behaviour as production (git HEAD) before the schema replacement:
 * student: admissionNumber + PIN (SCHOOL accounts only); teacher/admin: empCode + PIN.
 * Sets the auth cookie. Field map row 1, signed off 2026-11-19.
 */
async function schoolPinLogin(body: {
  role?: string;
  admissionNumber?: string;
  empCode?: string;
  pin?: string;
}) {
  const { role, admissionNumber, empCode, pin } = body;

  if (!pin) {
    return Response.json({ error: "PIN is required" }, { status: 400 });
  }

  if (role === "student") {
    if (!admissionNumber) {
      return Response.json({ error: "Admission number is required" }, { status: 400 });
    }
    const student = await prisma.student.findUnique({
      where: { admissionNumber },
      include: { enrollments: { take: 1, orderBy: { enrolledAt: "asc" } } },
    });
    // School portal only accepts SCHOOL accounts; B2C/PUBLIC accounts use the password login
    if (!student || student.pin !== pin || student.accountType !== "SCHOOL") {
      return Response.json({ error: "Invalid admission number or PIN" }, { status: 401 });
    }
    const token = signToken({
      id: student.id,
      role: "student",
      classId: primaryClassId(student) ?? undefined,
    });
    return Response.json(
      { ok: true, name: student.name },
      { headers: { "Set-Cookie": makeAuthCookie(token) } }
    );
  }

  if (role === "teacher") {
    if (!empCode) {
      return Response.json({ error: "Employee code is required" }, { status: 400 });
    }
    const teacher = await prisma.teacher.findUnique({ where: { empCode } });
    if (!teacher || !teacher.pin || teacher.pin !== pin) {
      return Response.json({ error: "Invalid employee code or PIN" }, { status: 401 });
    }
    const token = signToken({ id: teacher.id, role: "teacher", schoolId: teacher.schoolId ?? undefined });
    return Response.json(
      { ok: true, name: teacher.name },
      { headers: { "Set-Cookie": makeAuthCookie(token) } }
    );
  }

  if (role === "admin") {
    if (!empCode) {
      return Response.json({ error: "Employee code is required" }, { status: 400 });
    }
    const admin = await prisma.admin.findUnique({ where: { empCode } });
    if (!admin || admin.pin !== pin) {
      return Response.json({ error: "Invalid employee code or PIN" }, { status: 401 });
    }
    const token = signToken({ id: admin.id, role: "admin", schoolId: admin.schoolId });
    return Response.json(
      { ok: true, name: admin.name, adminRole: admin.role },
      { headers: { "Set-Cookie": makeAuthCookie(token) } }
    );
  }

  return Response.json({ error: "Invalid role" }, { status: 400 });
}
