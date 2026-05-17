import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const authSession = await getSession();
  if (!authSession) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await params;
  const body = await request.json();

  if (authSession.role === "teacher" && body.teacherNote !== undefined) {
    const updated = await prisma.readingSession.update({
      where: { id: sessionId },
      data: { teacherNote: body.teacherNote, status: "NEEDS_REVIEW" },
    });
    return Response.json(updated);
  }

  if (authSession.role === "student") {
    const { transcript, wpm, accuracy, missedWords, wrongWords, durationSec } = body;
    const updated = await prisma.readingSession.update({
      where: { id: sessionId },
      data: {
        transcript,
        wpm,
        accuracy,
        missedWords: missedWords ?? [],
        wrongWords: wrongWords ?? [],
        durationSec,
        completedAt: new Date(),
        status: "COMPLETED",
      },
    });
    return Response.json(updated);
  }

  return Response.json({ error: "Forbidden" }, { status: 403 });
}
