import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateBody, onboardingCompleteSchema } from '@/lib/validation';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const validation = await validateBody(req, onboardingCompleteSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { studentId } = validation.data;

    // Authenticate: try session first, then JWT bearer token
    let authUserId: string | null = null;
    let session = await getSession();

    if (session) {
      authUserId = session.id;
    } else {
      // Try JWT token
      const authHeader = req.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        try {
          const secret = process.env.JWT_SECRET || "secret";
          const verified = jwt.verify(token, secret) as any;
          authUserId = verified.studentId;
        } catch (error) {
          console.error('JWT verification failed:', error instanceof Error ? error.message : error);
          return NextResponse.json({ error: "Token verification failed" }, { status: 401 });
        }
      }
    }

    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Authorization: only allow updating own onboarding status
    if (authUserId !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const student = await prisma.student.update({
      where: { id: studentId },
      data: { hasSeenOnboarding: true },
    });

    return NextResponse.json(
      { message: 'Onboarding marked as complete', student },
      { status: 200 }
    );
  } catch (error) {
    console.error('Onboarding complete error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
