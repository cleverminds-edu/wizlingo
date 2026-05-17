import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { passageId } = await request.json();
  if (!passageId) return Response.json({ error: "passageId required" }, { status: 400 });

  const readingSession = await prisma.readingSession.create({
    data: {
      studentId: session.id,
      passageId,
      startedAt: new Date(),
    },
  });

  return Response.json(readingSession, { status: 201 });
}
