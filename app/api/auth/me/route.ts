import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-key");

export async function GET(request: Request) {
  let session: any = null;

  // Try session first (for cookies)
  session = await getSession();

  // If no session, try Authorization header (for localStorage tokens)
  if (!session) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const verified = await jwtVerify(token, JWT_SECRET);
        session = verified.payload;
      } catch (error) {
        // Invalid token
      }
    }
  }

  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "student") {
    const student = await prisma.student.findUnique({
      where: { id: session.id },
      include: { class: true, progress: true },
    });
    return Response.json({ ...student, role: "student" });
  }

  if (session.role === "teacher") {
    const teacher = await prisma.teacher.findUnique({
      where: { id: session.id },
      include: { classes: true },
    });
    return Response.json({ ...teacher, role: "teacher" });
  }

  const admin = await prisma.admin.findUnique({ where: { id: session.id } });
  return Response.json({ ...admin, role: "admin" });
}
