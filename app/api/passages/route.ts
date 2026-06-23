import { getAuth, getStudentIdFromAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { gradeToBand } from "@/lib/scoring";
import { ageBandToGradeBand } from "@/lib/age-band-mapping";
import { selectReadingPassage } from "@/lib/content-selection";
import { ensurePassagesSeeded } from "@/lib/seed-passages";

export async function GET(request: Request) {
  console.log('📚 GET /api/passages - Starting');

  // Check seeding status
  await ensurePassagesSeeded();

  // Debug: Count passages in database
  const passageCount = await prisma.readingPassage.count();
  console.log(`📊 Database has ${passageCount} passages`);
  if (passageCount === 0) {
    console.error('❌ NO PASSAGES IN DATABASE - This should have been seeded at startup!');
    return Response.json({
      error: 'No reading passages available in database. System is not properly initialized.',
      debug: { passageCount }
    }, { status: 503 });
  }

  const auth = await getAuth(request);
  console.log('🔐 Auth check:', { hasAuth: !!auth, role: auth?.role });
  if (!auth || auth.role !== "student") {
    console.error('❌ Auth failed:', { auth });
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const studentId = getStudentIdFromAuth(auth);
  console.log('👤 Student ID:', studentId);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: true, progress: true },
  });
  if (!student) {
    console.error('❌ Student not found:', studentId);
    return Response.json({ error: "Student not found" }, { status: 404 });
  }

  // Get grade band from progress (now driven by age band) or fall back to class
  const ageBand = student.progress?.ageBand ?? "9-11";
  const gradeBand = ageBandToGradeBand(ageBand as any);
  const level = student.progress?.currentLevel ?? 2;
  console.log('📖 Student level:', { ageBand, gradeBand, level });

  // Use content selection service with age band filtering
  try {
    const { passage, metadata } = await selectReadingPassage({
      studentId: student.id,
      ageBand: ageBand as any,
      performanceLevel: level,
    });

    console.log('✅ Passage selected:', { passageId: passage?.id, title: passage?.title });
    return Response.json({
      ...passage,
      _contentMetadata: metadata,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to select passage";
    console.error('❌ Passage selection failed:', message);
    return Response.json({ error: message }, { status: 404 });
  }
}
