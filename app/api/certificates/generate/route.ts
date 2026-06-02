import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BadgeType } from '@/app/generated/prisma/client';

/**
 * POST /api/certificates/generate
 * Generate a certificate for a badge
 *
 * Request body:
 * {
 *   studentId: string,
 *   badgeType: BadgeType (SPARK, WORD_WIZARD, VOICE_WIZARD, LANGUAGE_WIZARD, GRAND_WIZARD)
 * }
 *
 * Response:
 * - 200: { success: true, verifyCode: string, certificateUrl: string }
 * - 400: { error: string }
 * - 404: { error: 'Certificate not found' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, badgeType } = body;

    // Validate inputs
    if (!studentId || !badgeType) {
      return NextResponse.json(
        { error: 'Missing studentId or badgeType' },
        { status: 400 }
      );
    }

    // Validate badge type
    const validBadges = ['SPARK', 'WORD_WIZARD', 'VOICE_WIZARD', 'LANGUAGE_WIZARD', 'GRAND_WIZARD'];
    if (!validBadges.includes(badgeType)) {
      return NextResponse.json(
        { error: 'Invalid badgeType' },
        { status: 400 }
      );
    }

    // Check if student earned this badge
    const badge = await prisma.badge.findUnique({
      where: {
        studentId_type: {
          studentId,
          type: badgeType as BadgeType,
        },
      },
    });

    if (!badge) {
      return NextResponse.json(
        { error: 'Student has not earned this badge' },
        { status: 404 }
      );
    }

    // Get or create certificate
    let certificate = await prisma.certificate.findUnique({
      where: {
        studentId_badgeType: {
          studentId,
          badgeType: badgeType as BadgeType,
        },
      },
    });

    if (!certificate) {
      certificate = await prisma.certificate.create({
        data: {
          studentId,
          badgeType: badgeType as BadgeType,
        },
      });
    }

    // Get student details
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: {
          include: { school: { select: { name: true } } },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Build certificate page URL
    const certificateUrl = `/certificate/${certificate.verifyCode}`;

    return NextResponse.json({
      success: true,
      verifyCode: certificate.verifyCode,
      certificateUrl,
      downloadUrl: `/api/certificates/download?studentId=${studentId}&badgeType=${badgeType}&verifyCode=${certificate.verifyCode}`,
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}
