import { createCanvas, registerFont } from 'canvas';
// @ts-ignore
import QRCode from 'qrcode';
import { BadgeType } from '@/app/generated/prisma/client';
import { getBadgeConfig } from './badge-config';

// Register fonts (ensure they're installed on your system)
// registerFont('./public/fonts/Fredoka-Bold.ttf', { family: 'Fredoka' });
// registerFont('./public/fonts/Inter-Regular.ttf', { family: 'Inter' });

// ═══════════════════════════════════════════════════════════════
// CERTIFICATE IMAGE GENERATOR (1080×1350 PNG for Instagram Stories)
// ═══════════════════════════════════════════════════════════════

export async function generateCertificateImage(
  badgeType: BadgeType,
  studentName: string,
  earnedDate: Date,
  verifyCode: string
): Promise<Buffer> {
  const width = 1080;
  const height = 1350;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const badge = getBadgeConfig(badgeType);

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, badge.bgColor);
  gradient.addColorStop(1, '#ffffff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Decorative border
  ctx.strokeStyle = badge.color;
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Badge emoji (large)
  ctx.font = 'bold 200px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(badge.emoji, width / 2, 250);

  // Badge name
  ctx.font = 'bold 56px Fredoka, sans-serif';
  ctx.fillStyle = badge.color;
  ctx.textAlign = 'center';
  ctx.fillText(badge.name, width / 2, 380);

  // "Certificate of Achievement"
  ctx.font = '32px Inter, sans-serif';
  ctx.fillStyle = '#666';
  ctx.textAlign = 'center';
  ctx.fillText('Certificate of Achievement', width / 2, 450);

  // Student name (large and prominent)
  ctx.font = 'bold 48px Fredoka, sans-serif';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.fillText('Presented to:', width / 2, 550);

  ctx.font = 'bold 56px Fredoka, sans-serif';
  ctx.fillStyle = badge.color;
  ctx.textAlign = 'center';
  ctx.fillText(studentName, width / 2, 650);

  // Badge description
  ctx.font = '24px Inter, sans-serif';
  ctx.fillStyle = '#444';
  ctx.textAlign = 'center';
  ctx.fillText(`for earning the ${badge.name}`, width / 2, 750);

  // Requirement
  ctx.font = '20px Inter, sans-serif';
  ctx.fillStyle = '#888';
  ctx.textAlign = 'center';
  ctx.fillText(badge.requirement, width / 2, 820);

  // Date
  ctx.font = '20px Inter, sans-serif';
  ctx.fillStyle = '#999';
  ctx.textAlign = 'center';
  const dateStr = earnedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.fillText(`Issued: ${dateStr}`, width / 2, 900);

  // QR Code (for verification)
  const qrDataUrl = await QRCode.toDataURL(
    `https://wiziingo.app/verify/${verifyCode}`
  );
  const qrImage = await loadImage(qrDataUrl);
  const qrSize = 150;
  ctx.drawImage(qrImage, width / 2 - qrSize / 2, 950, qrSize, qrSize);

  // Verify code text
  ctx.font = '16px monospace';
  ctx.fillStyle = '#666';
  ctx.textAlign = 'center';
  ctx.fillText(`Verify: ${verifyCode}`, width / 2, 1130);

  // Logos (bottom)
  ctx.font = '14px Inter, sans-serif';
  ctx.fillStyle = '#999';
  ctx.textAlign = 'center';
  ctx.fillText('WizLingo | Powered by Edvanta', width / 2, 1280);

  // Signatures (visual decoration)
  ctx.font = '18px cursive';
  ctx.fillStyle = badge.color;
  ctx.textAlign = 'left';
  ctx.fillText('Verified', 80, 1300);
  ctx.textAlign = 'right';
  ctx.fillText('AI-Certified', width - 80, 1300);

  return canvas.toBuffer('image/png');
}

// ═══════════════════════════════════════════════════════════════
// SQUARE BADGE IMAGE (1080×1080 for Instagram Posts)
// ═══════════════════════════════════════════════════════════════

export async function generateSquareBadgeImage(
  badgeType: BadgeType,
  studentName: string
): Promise<Buffer> {
  const size = 1080;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const badge = getBadgeConfig(badgeType);

  // Radial gradient background
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size
  );
  gradient.addColorStop(0, badge.bgColor);
  gradient.addColorStop(1, badge.color + '20');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Border
  ctx.strokeStyle = badge.color;
  ctx.lineWidth = 12;
  ctx.strokeRect(30, 30, size - 60, size - 60);

  // Big emoji
  ctx.font = 'bold 300px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badge.emoji, size / 2, size / 3);

  // Badge name
  ctx.font = 'bold 64px Fredoka, sans-serif';
  ctx.fillStyle = badge.color;
  ctx.textAlign = 'center';
  ctx.fillText(badge.name, size / 2, (size * 2) / 3 - 80);

  // Student name
  ctx.font = 'bold 48px Fredoka, sans-serif';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.fillText(studentName, size / 2, (size * 2) / 3 + 80);

  // Watermark
  ctx.font = '20px Inter, sans-serif';
  ctx.fillStyle = badge.color + '80';
  ctx.textAlign = 'center';
  ctx.fillText('WizLingo', size / 2, size - 40);

  return canvas.toBuffer('image/png');
}

// ═══════════════════════════════════════════════════════════════
// HELP FUNCTION: Load image from data URL
// ═══════════════════════════════════════════════════════════════

function loadImage(src: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const img = new (require('canvas').Image)();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ═══════════════════════════════════════════════════════════════
// EXPORT TO S3 (FOR CLOUD STORAGE)
// ═══════════════════════════════════════════════════════════════

export async function uploadBadgeImageToS3(
  buffer: Buffer,
  badgeType: BadgeType,
  studentId: string
): Promise<string> {
  // TODO: Implement S3 upload using AWS SDK
  // For now, return local path
  // const s3 = new AWS.S3();
  // const key = `badges/${studentId}/${badgeType}-${Date.now()}.png`;
  // await s3.upload({ Bucket: 'wizlingo', Key: key, Body: buffer }).promise();
  // return `https://s3.amazonaws.com/wizlingo/${key}`;

  // Mock: return local path for development
  return `/api/badges/${studentId}/${badgeType}.png`;
}

// ═══════════════════════════════════════════════════════════════
// GENERATE AND SAVE CERTIFICATE
// ═══════════════════════════════════════════════════════════════

export async function generateAndSaveCertificate(
  badgeType: BadgeType,
  studentName: string,
  studentId: string,
  earnedDate: Date,
  verifyCode: string
) {
  try {
    // Generate certificate image (1080×1350)
    const certificateBuffer = await generateCertificateImage(
      badgeType,
      studentName,
      earnedDate,
      verifyCode
    );

    // Upload to S3 (or save locally)
    const certificateUrl = await uploadBadgeImageToS3(
      certificateBuffer,
      badgeType,
      studentId
    );

    // Generate square badge (1080×1080)
    const badgeBuffer = await generateSquareBadgeImage(badgeType, studentName);
    const badgeUrl = await uploadBadgeImageToS3(
      badgeBuffer,
      badgeType,
      studentId
    );

    return {
      certificateUrl,
      badgeUrl,
      certificateBuffer,
      badgeBuffer,
    };
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
}
