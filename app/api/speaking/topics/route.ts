import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gradeToBand } from "@/lib/scoring";
import { ageBandToGradeBand } from "@/lib/age-band-mapping";
import { selectSpeakingTopic } from "@/lib/content-selection";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { id: session.id },
    include: { class: true, progress: true, speakingProgress: true },
  });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  // Get grade band from age band in student progress
  const ageBand = student.progress?.ageBand ?? "9-11";
  const gradeBand = ageBandToGradeBand(ageBand as any);
  const level = student.speakingProgress?.currentLevel ?? 2;

  // Use content selection service with age band filtering
  try {
    const { topic, metadata } = await selectSpeakingTopic({
      studentId: student.id,
      ageBand: ageBand as any,
      performanceLevel: level,
    });

    return Response.json({
      topic,
      metadata,
      gradeBand,
      level,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to select topic";
    return Response.json({ error: message }, { status: 404 });
  }
}
