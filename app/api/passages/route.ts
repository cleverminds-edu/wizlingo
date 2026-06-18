import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gradeToBand } from "@/lib/scoring";
import { ageBandToGradeBand } from "@/lib/age-band-mapping";
import { selectReadingPassage } from "@/lib/content-selection";

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

  // Get grade band from progress (now driven by age band) or fall back to class
  const ageBand = student.progress?.ageBand ?? "9-11";
  const gradeBand = ageBandToGradeBand(ageBand as any);
  const level = student.progress?.currentLevel ?? 2;

  // Use content selection service with age band filtering
  try {
    const { passage, metadata } = await selectReadingPassage({
      studentId: student.id,
      ageBand: ageBand as any,
      performanceLevel: level,
    });

    return Response.json({
      ...passage,
      _contentMetadata: metadata,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to select passage";
    return Response.json({ error: message }, { status: 404 });
  }
}
