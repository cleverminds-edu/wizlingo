import { BadgeType } from '@/app/generated/prisma/client';
import { BADGE_META } from './badges';

// ═══════════════════════════════════════════════════════════════
// CERTIFICATE TEMPLATE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export interface CertificateTemplate {
  title: string;
  badgeType: BadgeType;
  description: string;
  skillDescription: string;
  accoladeText: string;
}

export const CERTIFICATE_TEMPLATES: Record<BadgeType, CertificateTemplate> = {
  SPARK: {
    title: 'Reading Journey Begins Certificate',
    badgeType: 'SPARK',
    description: 'For completing your very first reading session',
    skillDescription: 'Initiated their learning journey with determination and curiosity',
    accoladeText: 'A bright spark ignites the path to fluency',
  },
  WORD_WIZARD: {
    title: 'Reading Comprehension Mastery Certificate',
    badgeType: 'WORD_WIZARD',
    description: 'For achieving 80%+ accuracy in reading comprehension',
    skillDescription: 'Demonstrated exceptional mastery of reading comprehension with outstanding accuracy and word understanding',
    accoladeText: 'Master of the written word, wielder of knowledge',
  },
  VOICE_WIZARD: {
    title: 'Speaking Fluency Master Certificate',
    badgeType: 'VOICE_WIZARD',
    description: 'For achieving 75%+ fluency in speaking',
    skillDescription: 'Exhibited remarkable fluency, clarity, and confidence in spoken English communication',
    accoladeText: 'Master of eloquence, voice of clarity',
  },
  LANGUAGE_WIZARD: {
    title: 'Consistent Learning Dedication Certificate',
    badgeType: 'LANGUAGE_WIZARD',
    description: 'For completing 10+ reading and speaking sessions',
    skillDescription: 'Demonstrated unwavering commitment and dedication through consistent practice across both reading and speaking skills',
    accoladeText: 'Master of perseverance, beacon of dedication',
  },
  GRAND_WIZARD: {
    title: 'Language Legend - Grand Wizard Certificate',
    badgeType: 'GRAND_WIZARD',
    description: 'For earning all four major achievement badges',
    skillDescription: 'Achieved the pinnacle of excellence by mastering reading comprehension, speaking fluency, consistent learning, and demonstrating extraordinary dedication to language mastery',
    accoladeText: 'Supreme master of language, legend of learning',
  },
};

export function getCertificateTemplate(badgeType: BadgeType): CertificateTemplate {
  return CERTIFICATE_TEMPLATES[badgeType];
}

// ═══════════════════════════════════════════════════════════════
// CERTIFICATE STYLING CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const CERTIFICATE_STYLES = {
  // Page dimensions (A4 @ 300 DPI)
  pageWidth: 2480, // 8.27 inches @ 300 DPI
  pageHeight: 3508, // 11.69 inches @ 300 DPI

  // Margins (in pixels)
  margin: 100,

  // Colors
  primaryGradient: {
    SPARK: { start: '#F97316', end: '#FFF7ED' },
    WORD_WIZARD: { start: '#4F46E5', end: '#EEF2FF' },
    VOICE_WIZARD: { start: '#9333EA', end: '#FAF5FF' },
    LANGUAGE_WIZARD: { start: '#059669', end: '#ECFDF5' },
    GRAND_WIZARD: { start: '#D97706', end: '#FFFBEB' },
  } as Record<BadgeType, { start: string; end: string }>,

  // Accent colors for borders
  accentColors: {
    SPARK: '#F97316',
    WORD_WIZARD: '#4F46E5',
    VOICE_WIZARD: '#9333EA',
    LANGUAGE_WIZARD: '#059669',
    GRAND_WIZARD: '#D97706',
  } as Record<BadgeType, string>,

  // Fonts
  fontSizes: {
    title: 72,
    subtitle: 48,
    heading: 36,
    body: 24,
    small: 18,
    tiny: 14,
  },
};

// ═══════════════════════════════════════════════════════════════
// CERTIFICATE TEXT GENERATION
// ═══════════════════════════════════════════════════════════════

export function generateCertificateText(
  badgeType: BadgeType,
  studentName: string,
  issuedDate: Date,
  className?: string,
  schoolName?: string
): CertificateTextContent {
  const template = getCertificateTemplate(badgeType);
  const badge = BADGE_META[badgeType];

  const dateStr = issuedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    headerText: '✨ WIZLINGO ✨',
    certificateType: 'Certificate of Achievement',
    presentedTo: 'This certifies that',
    studentName,
    studentClassInfo: className ? `Grade ${className}` : undefined,
    schoolName,
    badgeName: badge.label,
    badgeDescription: template.description,
    skillDescription: template.skillDescription,
    accoladeText: template.accoladeText,
    issuedDate: dateStr,
    footer: 'Powered by Edvanta | WizLingo',
  };
}

export interface CertificateTextContent {
  headerText: string;
  certificateType: string;
  presentedTo: string;
  studentName: string;
  studentClassInfo?: string;
  schoolName?: string;
  badgeName: string;
  badgeDescription: string;
  skillDescription: string;
  accoladeText: string;
  issuedDate: string;
  footer: string;
}
