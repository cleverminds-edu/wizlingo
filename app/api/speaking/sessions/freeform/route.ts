import { getSession } from "@/lib/auth";
import { SERVABLE_TOPIC } from '@/lib/content-status';
import { ageBandToGradeBand } from '@/lib/age-band-mapping';
import type { AgeBand } from '@/lib/age-band';
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getSession();
    console.log('🎤 Freeform session request:', { sessionId: session?.id, role: session?.role });

    if (!session || session.role !== "student") {
      console.error('❌ Unauthorized:', { hasSession: !!session, role: session?.role });
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student info
    const student = await prisma.student.findUnique({
      where: { id: session.id },
      select: { userId: true, progress: { select: { gradeBand: true, ageBand: true } } },
    });
    // Student has no gradeBand column: take it from progress, else derive it from the age band.
    const gradeBand = student
      ? student.progress?.gradeBand ?? ageBandToGradeBand((student.progress?.ageBand ?? '9-11') as AgeBand)
      : null;

    console.log('📚 Student lookup:', { studentId: session.id, found: !!student, gradeBand });

    if (!student || !gradeBand) {
      console.error('❌ Student not found:', session.id);
      return Response.json({ error: "Student not found" }, { status: 404 });
    }

    // Fetch all topics for the student's grade band
    const topics = await prisma.speakingTopic.findMany({
      where: { gradeBand, ...SERVABLE_TOPIC },
      select: { id: true, title: true },
      take: 100,
    });

    console.log('📖 Topics found:', { count: topics.length, gradeBand });

    if (topics.length === 0) {
      console.error('❌ No topics for grade band:', gradeBand);
      return Response.json({ error: "No topics available for your level" }, { status: 404 });
    }

    // Pick a random topic
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    console.log('🎯 Selected topic:', { id: randomTopic.id, title: randomTopic.title });

    // Create session with random topic
    const speakingSession = await prisma.speakingSession.create({
      data: {
        studentId: session.id,
        topicId: randomTopic.id,
        startedAt: new Date(),
      },
      include: { topic: true },
    });

    console.log('✅ Freeform session created:', { id: speakingSession.id, topicId: randomTopic.id });
    return Response.json(speakingSession, { status: 201 });
  } catch (error) {
    console.error('❌ Freeform endpoint error:', error instanceof Error ? error.message : error);
    return Response.json(
      { error: "Failed to create session", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
