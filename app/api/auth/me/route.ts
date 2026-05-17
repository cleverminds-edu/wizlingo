import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
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
