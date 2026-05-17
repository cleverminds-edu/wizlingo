import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await prisma.speakingSession.findMany({
    where: { studentId: session.id, status: "COMPLETED" },
    include: { topic: { select: { title: true, level: true, character: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return Response.json(sessions);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topicId } = await request.json();
  if (!topicId) return Response.json({ error: "topicId required" }, { status: 400 });

  const topic = await prisma.conversationTopic.findUnique({
    where: { id: topicId },
  });
  if (!topic) return Response.json({ error: "Topic not found" }, { status: 404 });

  const speakingSession = await prisma.speakingSession.create({
    data: { studentId: session.id, topicId, startedAt: new Date() },
    include: { topic: true },
  });

  return Response.json(speakingSession, { status: 201 });
}
