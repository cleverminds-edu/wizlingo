import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    let authSession: any = null;
    let sessionUserId: string | null = null;

    // Try session first (for cookies)
    authSession = await getSession();

    // If no session, try Authorization header (for Bearer tokens)
    if (!authSession) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        try {
          const secret = process.env.JWT_SECRET || "secret";
          const verified = jwt.verify(token, secret) as any;
          authSession = verified;
          sessionUserId = verified.studentId;
        } catch (error) {
          return Response.json({ error: "Token verification failed" }, { status: 401 });
        }
      }
    } else {
      sessionUserId = authSession.id;
    }

    if (!authSession) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId } = await params;

    // Check authorization: student can only see their own progress
    if (sessionUserId && sessionUserId !== studentId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch basic student info first (no relations)
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    // Fetch class info safely
    let classInfo = null;
    if (student.classId) {
      try {
        classInfo = await prisma.class.findUnique({
          where: { id: student.classId },
          include: { school: { select: { name: true } } },
        });
      } catch (e) {
        console.log('Class relation unavailable');
      }
    }

    // Fetch progress safely
    let progress = null;
    try {
      progress = await prisma.studentProgress.findUnique({
        where: { studentId },
      });
    } catch (e) {
      console.log('Progress relation unavailable');
    }

    // Create progress if missing
    if (!progress && student.dateOfBirth) {
      try {
        const { calculateAgeBand } = await import('@/lib/age-band');
        const ageBand = calculateAgeBand(student.dateOfBirth);
        const gradeBandMap: Record<string, any> = {
          '6-8': 'BAND_1_2',
          '9-11': 'BAND_3_5',
          '12-14': 'BAND_6_8',
          '15+': 'BAND_9_10',
        };
        const gradeBand = gradeBandMap[ageBand] || 'BAND_3_5';

        progress = await prisma.studentProgress.create({
          data: {
            studentId: student.id,
            currentLevel: 2,
            gradeBand: gradeBand as any,
          },
        });
      } catch (e) {
        console.log('Could not create progress record');
      }
    }

    // Fetch sessions (both reading and speaking) safely
    let sessions: any[] = [];
    try {
      // Fetch reading sessions
      const readingSessions = await prisma.readingSession.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { passage: { select: { title: true, level: true } } },
      });
      
      // Fetch speaking sessions
      const speakingSessions = await prisma.speakingSession.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { topic: { select: { title: true, level: true } } },
      });

      // Combine and sort by date (most recent first)
      sessions = [
        ...readingSessions.map((s: any) => ({
          ...s,
          type: 'READING',
          passage: s.passage,
          topic: undefined,
        })),
        ...speakingSessions.map((s: any) => ({
          ...s,
          type: 'SPEAKING',
          passage: undefined,
          topic: s.topic,
        })),
      ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
       .slice(0, 20);
    } catch (e) {
      console.log('Sessions unavailable');
    }

    // Fetch badges safely
    let badges = [];
    try {
      badges = await prisma.badge.findMany({
        where: { studentId },
        orderBy: { earnedAt: "asc" },
      });
    } catch (e) {
      console.log('Badges unavailable');
    }

    // Fetch certificates safely
    let certificates = [];
    try {
      certificates = await prisma.certificate.findMany({
        where: { studentId },
        select: { badgeType: true, verifyCode: true, issuedAt: true },
      });
    } catch (e) {
      console.log('Certificates unavailable');
    }

    return Response.json({
      ...student,
      class: classInfo,
      progress,
      sessions,
      badges,
      certificates,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Progress API Error]', msg);
    return Response.json(
      { error: 'Failed to fetch progress', message: msg },
      { status: 500 }
    );
  }
}
