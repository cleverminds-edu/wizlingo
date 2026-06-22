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
          console.error('Progress API: JWT verification failed:', error instanceof Error ? error.message : error);
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
      console.warn('Authorization check failed:', { sessionUserId, studentId });
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log('Fetching student:', { studentId, sessionUserId });
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
      console.error('Student not found:', { studentId });
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    console.log('Student found, checking progress:', { studentId, hasProgress: !!student.progress });

    // Ensure progress record exists (create if missing)
    if (!student.progress) {
      try {
        console.log('Creating missing progress for student:', { studentId, dateOfBirth: student.dateOfBirth });
        const { calculateAgeBand } = await import('@/lib/age-band');
        const ageBand = calculateAgeBand(student.dateOfBirth);

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
      } catch (createError) {
        console.error('Error creating progress record:', createError instanceof Error ? createError.message : createError);
        throw createError;
      }
    }

    return Response.json(student);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Progress API error:', { message: errorMsg, stack: error instanceof Error ? error.stack : undefined });
    return Response.json(
      { error: 'Failed to fetch progress', details: errorMsg },
      { status: 500 }
    );
  }
}
