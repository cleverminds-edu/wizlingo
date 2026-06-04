import { BadgeType } from '@/app/generated/prisma/client';
import { BADGE_META } from './badges';
import {
  CERTIFICATE_TEMPLATES,
  CERTIFICATE_STYLES,
  generateCertificateText,
} from './certificate-templates';

// @ts-ignore
import QRCode from 'qrcode';

// ═══════════════════════════════════════════════════════════════
// SERVERLESS PDF GENERATION USING PUPPETEER OR SIMILAR
// For now, we'll use a simplified approach that generates a PNG
// and can be converted to PDF on the frontend or via a service
// ═══════════════════════════════════════════════════════════════

/**
 * Generate certificate as an HTML string that can be:
 * 1. Rendered on frontend with print-to-PDF
 * 2. Converted via headless browser on backend
 * 3. Rendered as an image via canvas
 */
export async function generateCertificatePDFAsHTML(
  badgeType: BadgeType,
  studentName: string,
  studentId: string,
  verifyCode: string,
  className?: string,
  schoolName?: string
): Promise<string> {
  const badge = BADGE_META[badgeType];
  const template = CERTIFICATE_TEMPLATES[badgeType];
  const accentColor = CERTIFICATE_STYLES.accentColors[badgeType];

  const certText = generateCertificateText(
    badgeType,
    studentName,
    new Date(),
    className,
    schoolName
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${appUrl}/certificate/${verifyCode}`;
  const qrCodeImage = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 200,
    margin: 1,
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WizLingo Certificate - ${badgeType}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: white;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }

    @media print {
      body {
        background: white;
        padding: 0;
        margin: 0;
      }
      .certificate {
        box-shadow: none;
        max-width: 100%;
        margin: 0;
      }
    }

    .certificate {
      width: 100%;
      max-width: 900px;
      aspect-ratio: 8.5 / 11;
      background: white;
      border: 8px solid ${accentColor};
      border-radius: 20px;
      padding: 60px 50px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
    }

    .top-accent {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, ${accentColor} 0%, ${accentColor}cc 100%);
      border-radius: 20px 20px 0 0;
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
    }

    .header-title {
      font-size: 32px;
      font-weight: bold;
      color: #000;
      margin-bottom: 5px;
    }

    .certificate-type {
      font-size: 20px;
      color: #666;
      margin-bottom: 10px;
    }

    .content {
      text-align: center;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .presented-to {
      font-size: 16px;
      color: #555;
      margin-bottom: 15px;
      font-style: italic;
    }

    .student-name {
      font-size: 48px;
      font-weight: bold;
      color: ${accentColor};
      margin-bottom: 10px;
      font-family: Georgia, serif;
    }

    .student-info {
      font-size: 13px;
      color: #888;
      margin-bottom: 20px;
    }

    .badge-section {
      margin: 30px 0;
    }

    .badge-emoji {
      font-size: 80px;
      line-height: 1;
      margin-bottom: 15px;
    }

    .badge-name {
      font-size: 28px;
      font-weight: bold;
      color: ${accentColor};
      margin-bottom: 8px;
    }

    .badge-description {
      font-size: 13px;
      color: #666;
      margin-bottom: 20px;
      line-height: 1.4;
    }

    .skill-description {
      font-size: 13px;
      color: #555;
      line-height: 1.6;
      margin-bottom: 20px;
      font-style: italic;
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 15px;
      margin: 25px 0;
    }

    .divider-line {
      flex: 1;
      height: 1px;
      background: ${accentColor}80;
    }

    .divider-icon {
      font-size: 24px;
    }

    .accolade {
      font-size: 15px;
      color: ${accentColor};
      font-style: italic;
      margin-bottom: 20px;
    }

    .qr-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 20px 0;
    }

    .qr-code {
      width: 100px;
      height: 100px;
      margin-bottom: 10px;
    }

    .verify-code {
      font-size: 11px;
      color: #999;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid #ddd;
      padding-top: 20px;
      margin-top: 20px;
      font-size: 12px;
    }

    .footer-date {
      text-align: left;
      color: #888;
    }

    .footer-signature {
      text-align: center;
      color: #999;
    }

    .footer-auth {
      text-align: right;
    }

    .footer-auth-line {
      border-top: 2px solid #ddd;
      width: 120px;
      margin-bottom: 4px;
    }

    .footer-auth-text {
      font-size: 10px;
      color: #aaa;
    }

    .bottom-accent {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, ${accentColor}cc 0%, ${accentColor} 100%);
      border-radius: 0 0 20px 20px;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="top-accent"></div>

    <div class="header">
      <div class="header-title">✨ WIZLINGO ✨</div>
      <div class="certificate-type">${certText.certificateType}</div>
    </div>

    <div class="content">
      <div class="presented-to">${certText.presentedTo}</div>
      <div class="student-name">${studentName}</div>
      <div class="student-info">
        ${certText.studentClassInfo ? certText.studentClassInfo + '<br/>' : ''}
        ${certText.schoolName || ''}
      </div>

      <div class="badge-section">
        <div class="badge-emoji">${badge.emoji}</div>
        <div class="badge-name">${certText.badgeName}</div>
        <div class="badge-description">${certText.badgeDescription}</div>
        <div class="skill-description">${certText.skillDescription}</div>
      </div>

      <div class="divider">
        <div class="divider-line"></div>
        <div class="divider-icon">🌟</div>
        <div class="divider-line"></div>
      </div>

      <div class="accolade">"${certText.accoladeText}"</div>

      <div class="qr-section">
        <img src="${qrCodeImage}" alt="QR Code" class="qr-code">
        <div class="verify-code">Verify: ${verifyCode.substring(0, 12).toUpperCase()}...</div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-date">
        <strong>Date Issued</strong><br>
        ${certText.issuedDate}
      </div>
      <div class="footer-signature">
        WizLingo<br>
        Powered by Edvanta
      </div>
      <div class="footer-auth">
        <div class="footer-auth-line"></div>
        <div class="footer-auth-text">Authorised by<br>WizLingo</div>
      </div>
    </div>

    <div class="bottom-accent"></div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate certificate PDF (currently returns HTML)
 * Note: For production use, consider integrating with:
 * - Puppeteer Cloud
 * - PrintNode API
 * - Google Cloud Print
 * - WeasyPrint API
 */
export async function generateCertificatePDF(
  badgeType: BadgeType,
  studentName: string,
  studentId: string,
  verifyCode: string,
  className?: string,
  schoolName?: string
): Promise<Buffer> {
  // Generate HTML
  const htmlContent = await generateCertificatePDFAsHTML(
    badgeType,
    studentName,
    studentId,
    verifyCode,
    className,
    schoolName
  );

  // Return HTML as buffer (will be converted to PDF on client-side via html2pdf.js)
  return Buffer.from(htmlContent, 'utf-8');
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION CODE GENERATOR
// ═══════════════════════════════════════════════════════════════

export function createVerificationCode(): string {
  // Generate a unique, readable code (alphanumeric, no confusing chars)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed I, O, 0, 1 to avoid confusion
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

