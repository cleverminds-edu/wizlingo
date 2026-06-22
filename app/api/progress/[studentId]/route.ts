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

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: {
          include: {
            school: { select: { name: true } }
          }
        },
        progress: true,
        badges: { orderBy: { earnedAt: "asc" } },
        certificates: { select: { badgeType: true, verifyCode: true, issuedAt: true } },
      },
    });

    // Try to fetch sessions if the table exists
    let sessionsData = [];
    if (student) {
      try {
        const sessions = await prisma.readingSession.findMany({
          where: { studentId },
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { passage: { select: { title: true, level: true } } },
        });
        sessionsData = sessions;
      } catch (e) {
        // Sessions table may not exist yet, continue without it
        console.log('ReadingSession table not available yet');
      }
    }

    if (!student) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    // Ensure progress record exists (create if missing)
    if (!student.progress) {
      const { calculateAgeBand } = await import('@/lib/age-band');
      const ageBand = student.dateOfBirth ? calculateAgeBand(student.dateOfBirth) : '9-11';

      const gradeBandMap: Record<string, any> = {
        '6-8': 'BAND_1_2',
        '9-11': 'BAND_3_5',
        '12-14': 'BAND_6_8',
        '15+': 'BAND_9_10',
      };

      const gradeBand = gradeBandMap[ageBand] || 'BAND_3_5';

      await prisma.studentProgress.create({
        data: {
          studentId: student.id,
          currentLevel: 2,
          gradeBand: gradeBand as any,
        },
      });

      student.progress = await prisma.studentProgress.findUnique({
        where: { studentId: student.id },
      });
    }

    // Attach sessions data to student object
    const studentWithSessions = {
      ...student,
      sessions: sessionsData,
    };

    return Response.json(studentWithSessions);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Progress API Error]', msg);
    return Response.json(
      { error: 'Failed to fetch progress', message: msg },
      { status: 500 }
    );
  }
}
