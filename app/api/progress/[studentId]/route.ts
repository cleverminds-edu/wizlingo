import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
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
        console.error('JWT verification failed in progress route:', error instanceof Error ? error.message : error);
        return Response.json({ error: "Token verification failed" }, { status: 401 });
      }
    }
  } else {
    sessionUserId = authSession.id;
  }

  if (!authSession) return Response.json({ error: "Unauthorized" }, { status: 401 });

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
      sessions: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { passage: { select: { title: true, level: true } } },
      },
      badges: { orderBy: { earnedAt: "asc" } },
      certificates: { select: { badgeType: true, verifyCode: true, issuedAt: true } },
    },
  });

  if (!student) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(student);
}
