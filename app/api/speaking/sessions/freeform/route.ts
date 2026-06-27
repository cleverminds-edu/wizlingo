import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all available topics for this student's level
  const student = await prisma.student.findUnique({
    where: { id: session.id },
    select: { gradeBand: true },
  });

  if (!student) {
    return Response.json({ error: "Student not found" }, { status: 404 });
  }

  // Fetch all topics for the student's grade band
  const topics = await prisma.conversationTopic.findMany({
    where: { gradeBand: student.gradeBand },
    select: { id: true },
  });

  if (topics.length === 0) {
    return Response.json({ error: "No topics available" }, { status: 404 });
  }

  // Pick a random topic
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];

  // Create session with random topic
  const speakingSession = await prisma.speakingSession.create({
    data: {
      studentId: session.id,
      topicId: randomTopic.id,
      startedAt: new Date(),
    },
    include: { topic: true },
  });

  return Response.json(speakingSession, { status: 201 });
}
