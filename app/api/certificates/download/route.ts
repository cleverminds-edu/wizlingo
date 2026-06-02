import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCertificatePDFAsHTML } from '@/lib/pdf-certificate-generator';
import { BadgeType } from '@/app/generated/prisma/client';

/**
 * GET /api/certificates/download
 * Download a certificate PDF file
 *
 * Query params:
 * - studentId: string
 * - badgeType: BadgeType
 * - verifyCode: string (optional, for verification)
 * - format: 'html' | 'pdf' (defaults to 'html' for client-side conversion)
 *
 * Response:
 * - 200: PDF or HTML file
 * - 400: { error: string }
 * - 403: { error: 'Unauthorized' }
 * - 404: { error: 'Certificate not found' }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const badgeType = searchParams.get('badgeType');
    const verifyCode = searchParams.get('verifyCode');
    const format = searchParams.get('format') || 'html';

    // Validate inputs
    if (!studentId || !badgeType) {
      return NextResponse.json(
        { error: 'Missing studentId or badgeType' },
        { status: 400 }
      );
    }

    // Verify certificate exists
    const certificate = await prisma.certificate.findUnique({
      where: {
        studentId_badgeType: {
          studentId,
          badgeType: badgeType as BadgeType,
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Verify code if provided
    if (verifyCode && verifyCode !== certificate.verifyCode) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 403 }
      );
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

    // Generate HTML certificate
    const htmlContent = await generateCertificatePDFAsHTML(
      badgeType as BadgeType,
      student.name,
      student.id,
      certificate.verifyCode,
      `${student.class.grade}-${student.class.section}`,
      student.class.school.name
    );

    if (format === 'html') {
      // Return HTML for client-side PDF generation
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="WizLingo_Certificate_${badgeType}_${studentId}.html"`,
        },
      });
    }

    // For PDF format, try to use puppeteer or return HTML as fallback
    // (In production, you'd use a service like Puppeteer Cloud, PrintNode, or similar)
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Certificate-Format': 'html-to-pdf',
        'Content-Disposition': `attachment; filename="WizLingo_Certificate_${badgeType}_${studentId}.html"`,
      },
    });
  } catch (error) {
    console.error('Error downloading certificate:', error);
    return NextResponse.json(
      { error: 'Failed to download certificate' },
      { status: 500 }
    );
  }
}
