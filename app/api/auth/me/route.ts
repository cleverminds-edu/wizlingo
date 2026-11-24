import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getTokenFromRequest, verifyStudentToken } from "@/lib/auth";
import { classInclude, primaryClass } from "@/lib/student-class";

/**
 * Who is logged in.
 *
 * 1. School portal (cookie, set by admission number / employee code + PIN login):
 *    student, teacher or admin — behaviour restored from production.
 * 2. B2C (Bearer token in the Authorization header): student only — July behaviour.
 *
 * Secrets (passwordHash, pin) are never returned.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. School portal cookie session
    const session = await getSession();
    if (session) {
      if (session.role === "teacher") {
        const teacher = await prisma.teacher.findUnique({
          where: { id: session.id },
          include: { classes: true },
        });
        if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { pin, passwordHash, ...safe } = teacher;
        return NextResponse.json({ ...safe, role: "teacher" });
      }

      if (session.role === "admin") {
        const admin = await prisma.admin.findUnique({ where: { id: session.id } });
        if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { pin, ...safe } = admin;
        return NextResponse.json({ ...safe, role: "admin" });
      }

      const student = await prisma.student.findUnique({
        where: { id: session.id },
        include: { ...classInclude, progress: true },
      });
      if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { pin, passwordHash, enrollments, ...safe } = student;
      // `class` kept in the response for the school dashboard (was Student.class before Enrollment)
      return NextResponse.json({ ...safe, class: primaryClass(student), role: "student" });
    }

    // 2. B2C Bearer token
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyStudentToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { id: decoded.studentId },
      include: { progress: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: student.id,
      name: student.name,
      email: student.email,
      currentLevel: student.currentLevel,
      totalXP: student.totalXP,
      streakDays: student.streakDays,
      progress: student.progress,
      role: "student",
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
