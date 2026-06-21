import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  let session: any = null;
  let isJwtAuth = false;

  // Try session first (for cookies)
  session = await getSession();

  // If no session, try Authorization header (for localStorage tokens)
  if (!session) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const secret = process.env.JWT_SECRET || "secret";
        const verified = jwt.verify(token, secret) as any;
        session = verified;
        isJwtAuth = true;
      } catch (error) {
        console.error('JWT verification failed:', error instanceof Error ? error.message : error);
        return Response.json({ error: "Token verification failed" }, { status: 401 });
      }
    }
  }

  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // For JWT tokens (B2C), studentId is in the payload and role is always "student"
  // For session auth, id and role are in the session object
  const userId = session.studentId || session.id;
  const role = isJwtAuth ? "student" : (session.role || "student");

  if (role === "student") {
    const student = await prisma.student.findUnique({
      where: { id: userId },
      include: { class: true, progress: true },
    });
    if (!student) return Response.json({ error: "Student not found" }, { status: 404 });
    return Response.json({ ...student, role: "student" });
  }

  if (role === "teacher") {
    const teacher = await prisma.teacher.findUnique({
      where: { id: userId },
      include: { classes: true },
    });
    if (!teacher) return Response.json({ error: "Teacher not found" }, { status: 404 });
    return Response.json({ ...teacher, role: "teacher" });
  }

  const admin = await prisma.admin.findUnique({ where: { id: userId } });
  if (!admin) return Response.json({ error: "Admin not found" }, { status: 404 });
  return Response.json({ ...admin, role: "admin" });
}
