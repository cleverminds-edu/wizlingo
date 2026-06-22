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
    console.log('Progress API: Session auth attempt:', { hasSession: !!authSession });

    // If no session, try Authorization header (for Bearer tokens)
    if (!authSession) {
      const authHeader = request.headers.get("Authorization");
      console.log('Progress API: No session, checking Authorization header:', { hasHeader: !!authHeader });
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        try {
          const secret = process.env.JWT_SECRET || "secret";
          const verified = jwt.verify(token, secret) as any;
          console.log('Progress API: JWT verified:', { studentId: verified.studentId });
          authSession = verified;
          sessionUserId = verified.studentId;
        } catch (error) {
          console.error('Progress API: JWT verification failed:', error instanceof Error ? error.message : error);
          return Response.json({ error: "Token verification failed" }, { status: 401 });
        }
      }
    } else {
      sessionUserId = authSession.id;
    }

    if (!authSession) {
      console.error('Progress API: No auth session found');
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId } = await params;
    console.log('Progress API: Fetching progress for studentId:', { studentId, sessionUserId });

    // Check authorization: student can only see their own progress
    if (sessionUserId && sessionUserId !== studentId) {
      console.error('Progress API: Authorization failed - student trying to access different student', { sessionUserId, studentId });
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log('Progress API: Fetching student from database...');
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: {
          include: {
            school: { select: { name: true } }
          }
        },
        progress: true,
        sessions: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { passage: { select: { title: true, level: true } } },
        },
        badges: { orderBy: { earnedAt: "asc" } },
        certificates: { select: { badgeType: true, verifyCode: true, issuedAt: true } },
      },
    });

    if (!student) {
      console.error('Progress API: Student not found:', { studentId });
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    console.log('Progress API: Student found:', { studentId, hasProgress: !!student.progress });

    // Ensure progress record exists (create if missing)
    if (!student.progress) {
      console.log('Progress API: Creating missing progress record for student:', { studentId });
      try {
        const { calculateAgeBand } = await import('@/lib/age-band');
        const ageBand = calculateAgeBand(student.dateOfBirth);
        console.log('Progress API: Calculated age band:', { ageBand, dateOfBirth: student.dateOfBirth });

        const gradeBandMap: Record<string, any> = {
          '6-8': 'BAND_1_2',
          '9-11': 'BAND_3_5',
          '12-14': 'BAND_6_8',
          '15+': 'BAND_9_10',
        };

        const gradeBand = gradeBandMap[ageBand] || 'BAND_3_5';
        console.log('Progress API: Creating progress with gradeBand:', { gradeBand });

        await prisma.studentProgress.create({
          data: {
            studentId: student.id,
            currentLevel: 2,
            gradeBand: gradeBand as any,
          },
        });

        console.log('Progress API: Progress record created successfully');
        student.progress = await prisma.studentProgress.findUnique({
          where: { studentId: student.id },
        });
      } catch (createError) {
        console.error('Progress API: Error creating progress record:', createError instanceof Error ? createError.message : createError);
        throw createError;
      }
    }

    console.log('Progress API: Returning student progress');
    return Response.json(student);
  } catch (error) {
    console.error('Progress API error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : '',
      error: error
    });
    return Response.json(
      {
        error: 'Failed to fetch progress',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}
