import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BADGE_META } from '@/lib/badges';

/**
 * GET /api/certificates/verify
 * Public endpoint to verify and get certificate details
 *
 * Query params:
 * - code: string (verification code)
 *
 * Response:
 * - 200: {
 *     success: true,
 *     certificate: {
 *       studentName: string,
 *       badgeType: string,
 *       badgeName: string,
 *       badgeEmoji: string,
 *       issuedDate: string,
 *       verifyCode: string
 *     }
 *   }
 * - 404: { error: 'Certificate not found' }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Missing verification code' },
        { status: 400 }
      );
    }

    // Find certificate by verification code
    const certificate = await prisma.certificate.findUnique({
      where: { verifyCode: code },
      include: {
        student: {
          select: { name: true, admissionNumber: true },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    const badgeMeta = BADGE_META[certificate.badgeType];

    const issuedDate = certificate.issuedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return NextResponse.json({
      success: true,
      certificate: {
        studentName: certificate.student.name,
        admissionNumber: certificate.student.admissionNumber,
        badgeType: certificate.badgeType,
        badgeName: badgeMeta.label,
        badgeEmoji: badgeMeta.emoji,
        badgeDescription: badgeMeta.description,
        issuedDate,
        verifyCode: certificate.verifyCode,
        certificateId: certificate.id,
      },
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return NextResponse.json(
      { error: 'Failed to verify certificate' },
      { status: 500 }
    );
  }
}
