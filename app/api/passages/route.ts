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
    include: { class: true, progress: true },
  });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  const gradeBand = student.progress?.gradeBand ?? gradeToBand(student.class.grade);
  const level = student.progress?.currentLevel ?? 1;

  // All passages for this band+level
  const all = await prisma.readingPassage.findMany({
    where: { gradeBand, level },
    select: { id: true },
  });
  if (all.length === 0) return Response.json({ error: "No passage available" }, { status: 404 });

  // Passages used in the last 20 sessions
  const recent = await prisma.readingSession.findMany({
    where: { studentId: student.id },
    select: { passageId: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const recentIds = new Set((recent as { passageId: string }[]).map(r => r.passageId));

  // Prefer unused; fall back to all when every passage has been seen
  let pool = all.filter(p => !recentIds.has(p.id));
  if (pool.length === 0) pool = all;

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  const passage = await prisma.readingPassage.findUnique({ where: { id: chosen.id } });
  return Response.json(passage);
}
