import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, makeAuthCookie } from "@/lib/auth";

const DEMO = {
  student: { admissionNumber: "EDV2024001", pin: "1234" },
  teacher: { empCode: "EMP101",             pin: "3333" },
  admin:   { empCode: "EMP001",             pin: "1111" },
};

const REDIRECT = {
  student: "/student/dashboard",
  teacher: "/teacher/dashboard",
  admin:   "/admin/dashboard",
};

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const role = req.nextUrl.searchParams.get("role") as keyof typeof DEMO | null;
  if (!role || !(role in DEMO)) {
    return new Response(
      `<html><body style="font-family:sans-serif;padding:2rem">
        <h2>Dev auto-login</h2>
        <ul>
          <li><a href="/api/dev/login?role=student">Student (Arjun Kumar)</a></li>
          <li><a href="/api/dev/login?role=teacher">Teacher (Teacher Priya)</a></li>
          <li><a href="/api/dev/login?role=admin">Admin (Principal Sharma)</a></li>
        </ul>
      </body></html>`,
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  }

  let token: string;

  if (role === "student") {
    const student = await prisma.student.findUnique({
      where: { admissionNumber: DEMO.student.admissionNumber },
    });
    if (!student) return new Response("Demo student not found — run db:seed", { status: 500 });
    token = signToken({ id: student.id, role: "student", classId: student.classId });
  } else if (role === "teacher") {
    const teacher = await prisma.teacher.findUnique({
      where: { empCode: DEMO.teacher.empCode },
    });
    if (!teacher) return new Response("Demo teacher not found — run db:seed", { status: 500 });
    token = signToken({ id: teacher.id, role: "teacher", schoolId: teacher.schoolId });
  } else {
    const admin = await prisma.admin.findUnique({
      where: { empCode: DEMO.admin.empCode },
    });
    if (!admin) return new Response("Demo admin not found — run db:seed", { status: 500 });
    token = signToken({ id: admin.id, role: "admin", schoolId: admin.schoolId });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: REDIRECT[role],
      "Set-Cookie": makeAuthCookie(token),
    },
  });
}
