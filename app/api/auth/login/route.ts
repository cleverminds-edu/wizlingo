import { prisma } from "@/lib/prisma";
import { signToken, makeAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
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
      include: { class: true },
    });
    if (!student || student.pin !== pin) {
      return Response.json({ error: "Invalid admission number or PIN" }, { status: 401 });
    }
    const token = signToken({ id: student.id, role: "student", classId: student.classId });
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
    if (!teacher || teacher.pin !== pin) {
      return Response.json({ error: "Invalid employee code or PIN" }, { status: 401 });
    }
    const token = signToken({ id: teacher.id, role: "teacher", schoolId: teacher.schoolId });
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
