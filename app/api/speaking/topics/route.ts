import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gradeToBand } from "@/lib/scoring";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { id: session.id },
    include: { class: true, speakingProgress: true },
  });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  const gradeBand = gradeToBand(student.class.grade);
  const level = student.speakingProgress?.currentLevel ?? 1;

  const topics = await prisma.conversationTopic.findMany({
    where: { gradeBand, level },
    select: { id: true, title: true, character: true, openingLine: true, script: true, level: true, gradeBand: true },
  });

  return Response.json({ topics, gradeBand, level });
}
