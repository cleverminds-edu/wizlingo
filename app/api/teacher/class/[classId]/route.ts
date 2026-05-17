import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const authSession = await getSession();
  if (!authSession || authSession.role !== "teacher") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classId } = await params;

  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      students: {
        include: {
          progress: true,
          speakingProgress: true,
          sessions: {
            orderBy: { createdAt: "desc" },
            take: 5,
            where: { status: { in: ["COMPLETED", "NEEDS_REVIEW"] } },
          },
        },
      },
    },
  });

  if (!classData) return Response.json({ error: "Class not found" }, { status: 404 });

  return Response.json(classData);
}
