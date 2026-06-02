import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAndSaveCertificate } from '@/lib/certificate-generator';
import { getBadgeConfig } from '@/lib/badge-config';

// ═══════════════════════════════════════════════════════════════
// POST: Generate shareable badge and return share URLs
// ═══════════════════════════════════════════════════════════════

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ studentId: string; badgeType: string }>;
  }
) {
  try {
    const { studentId, badgeType } = await params;

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Verify badge earned
    const badge = await prisma.badge.findUnique({
      where: {
        studentId_type: {
          studentId,
          type: badgeType as any,
        },
      },
    });

    if (!badge) {
      return NextResponse.json(
        { error: 'Badge not earned' },
        { status: 404 }
      );
    }

    // Get or create certificate
    let certificate = await prisma.certificate.findUnique({
      where: {
        studentId_badgeType: {
          studentId,
          badgeType: badgeType as any,
        },
      },
    });

    if (!certificate) {
      certificate = await prisma.certificate.create({
        data: {
          studentId,
          badgeType: badgeType as any,
        },
      });
    }

    // Generate certificate & badge images
    const { certificateUrl, badgeUrl } = await generateAndSaveCertificate(
      badgeType as any,
      student.name,
      studentId,
      badge.earnedAt,
      certificate.verifyCode
    );

    // Get badge config
    const badgeConfig = getBadgeConfig(badgeType as any);

    // Generate share URLs
    const shareText = badgeConfig.shareText.replace(
      '[LINK]',
      `https://wiziingo.app/join?ref=${studentId}`
    );

    // WhatsApp share URL
    const whatsappText = encodeURIComponent(shareText);
    const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

    // Instagram story intent (mobile)
    // Note: Instagram doesn't have a direct share API, but we can use native sharing
    const instagramUrl = null; // Will be handled by native share sheet

    // Note: Analytics events are tracked via /api/analytics endpoint

    return NextResponse.json(
      {
        success: true,
        certificateId: certificate.id,
        badge: badgeConfig,
        shareUrls: {
          whatsapp: whatsappUrl,
          certificateUrl,
          badgeUrl,
          verifyUrl: `https://wiziingo.app/verify/${certificate.verifyCode}`,
        },
        shareText,
        nativeShare: {
          title: `I earned the ${badgeConfig.name} badge!`,
          text: shareText,
          url: `https://wiziingo.app/join?ref=${studentId}`,
          files: [
            {
              name: `${badgeConfig.name}-certificate.png`,
              url: certificateUrl,
              type: 'image/png',
            },
            {
              name: `${badgeConfig.name}-badge.png`,
              url: badgeUrl,
              type: 'image/png',
            },
          ],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Share badge error:', error);
    return NextResponse.json(
      { error: 'Failed to generate share URLs' },
      { status: 500 }
    );
  }
}
