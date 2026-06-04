import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const authSession = await getSession();
  if (!authSession) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { studentId } = await params;

  if (authSession.role === "student" && authSession.id !== studentId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      class: {
        include: {
          school: { select: { name: true } }
        }
      },
      progress: true,
      sessions: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { passage: { select: { title: true, level: true } } },
      },
      badges: { orderBy: { earnedAt: "asc" } },
      certificates: { select: { badgeType: true, verifyCode: true, issuedAt: true } },
    },
  });

  if (!student) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(student);
}
