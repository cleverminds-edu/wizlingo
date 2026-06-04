// Client-side badge configuration (no server imports)

// Badge types - duplicated here to avoid importing from prisma
export type BadgeType = 'SPARK' | 'WORD_WIZARD' | 'VOICE_WIZARD' | 'LANGUAGE_WIZARD' | 'GRAND_WIZARD';

// Share context type
export interface ShareContext {
  referralCode?: string;
  schoolId?: string;
  studentName?: string;
  stat?: string | number;
  grade?: number;
  section?: string;
  schoolName?: string;
  appUrl?: string;
}

interface BadgeDefinition {
  type: BadgeType;
  name: string;
  emoji: string;
  badgeImage: string;
  color: string;
  bgColor: string;
  description: string;
  requirement: string;
  message: string;
  shareText: string;
  order: number;
}

interface StreakedBadgeDefinition {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  requirement: string;
  shareText: string;
}

export const BADGE_CONFIG: Record<BadgeType, BadgeDefinition> = {
  SPARK: {
    type: 'SPARK',
    name: 'Spark',
    emoji: '✨',
    badgeImage: '/badges/spark-badge.svg',
    color: '#F97316',
    bgColor: '#FFF7ED',
    description: 'Your first step into the world of reading!',
    requirement: 'Complete 1 reading session',
    message: 'You earned the SPARK badge! 🎉 Join WizLingo and earn more badges.',
    shareText: `✨ {studentName} just earned the SPARK badge on WizLingo! 🔥
First step into AI-powered English reading — and they nailed it!
🏫 {schoolName} | {grade}-{section}
Join the Wizard's Academy 👉 {appUrl}`,
    order: 1,
  },
  WORD_WIZARD: {
    type: 'WORD_WIZARD',
    name: 'Word Wizard',
    emoji: '📚',
    badgeImage: '/badges/word-wizard-badge.svg',
    color: '#9333EA',
    bgColor: '#EEF2FF',
    description: 'Master of reading comprehension',
    requirement: 'Achieve 80%+ accuracy in reading',
    message: 'Incredible! You\'re a Word Wizard! 📚 Your reading precision is outstanding.',
    shareText: `📚 WORD WIZARD unlocked! 🧙‍♂️
{studentName} scored {stat}% reading accuracy on WizLingo — that's TOP TIER! 🎯
🏫 {schoolName} | {grade}-{section}
Can YOUR child beat this? 👉 {appUrl}`,
    order: 2,
  },
  VOICE_WIZARD: {
    type: 'VOICE_WIZARD',
    name: 'Voice Wizard',
    emoji: '🎤',
    badgeImage: '/badges/voice-wizard-badge.svg',
    color: '#F43F88',
    bgColor: '#FAF5FF',
    description: 'Master of spoken fluency',
    requirement: 'Achieve 75%+ fluency in speaking',
    message: 'Amazing! You\'re a Voice Wizard! 🎤 Your pronunciation is excellent.',
    shareText: `🎤 {studentName} is now a VOICE WIZARD on WizLingo!
{stat}% speaking fluency — AI-certified confidence! 🌟
🏫 {schoolName} | {grade}-{section}
Try the speaking challenge 👉 {appUrl}`,
    order: 3,
  },
  LANGUAGE_WIZARD: {
    type: 'LANGUAGE_WIZARD',
    name: 'Language Wizard',
    emoji: '🧙',
    badgeImage: '/badges/language-wizard-badge.svg',
    color: '#7C3AED',
    bgColor: '#ECFDF5',
    description: 'Committed learner with 10+ sessions',
    requirement: 'Complete 10 reading or speaking sessions',
    message: 'Incredible dedication! You\'re a Language Wizard! 🧙 Keep the momentum going!',
    shareText: `🧙 LANGUAGE WIZARD achieved!
{studentName} completed {stat} sessions on WizLingo — pure dedication! 💪
🏫 {schoolName} | {grade}-{section}
Start your child's journey 👉 {appUrl}`,
    order: 4,
  },
  GRAND_WIZARD: {
    type: 'GRAND_WIZARD',
    name: 'Grand Wizard',
    emoji: '👑',
    badgeImage: '/badges/grand-wizard-badge.svg',
    color: '#D97706',
    bgColor: '#FFFBEB',
    description: 'Ultimate master of reading & speaking',
    requirement: 'Earn all 4 badges above',
    message: 'LEGENDARY! You\'re a Grand Wizard! 👑 You\'ve mastered WizLingo!',
    shareText: `👑 GRAND WIZARD — the highest WizLingo title!
{studentName} from {schoolName} mastered reading + speaking. ALL badges earned! 🏆✨
Only the most dedicated students reach this level.
Join the Wizard's Academy 👉 {appUrl}
#WizLingo #GrandWizard`,
    order: 5,
  },
};

export const STREAK_BADGES: Record<string, StreakedBadgeDefinition> = {
  STREAK_7: {
    id: 'STREAK_7',
    name: '7-Day Warrior',
    emoji: '🔥',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    description: '7-day learning streak',
    requirement: 'Use WizLingo for 7 consecutive days',
    shareText: `🔥 {studentName} has a 7-DAY STREAK on WizLingo!
Learning every day to improve English skills.
🏫 {schoolName} | {grade}-{section}
Start your streak 👉 {appUrl}`,
  },
  STREAK_14: {
    id: 'STREAK_14',
    name: '14-Day Champion',
    emoji: '⚡',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    description: '14-day learning streak',
    requirement: 'Use WizLingo for 14 consecutive days',
    shareText: `⚡ {studentName} has a 14-DAY STREAK on WizLingo!
Two weeks of consistent learning. Building the habit! 💪
🏫 {schoolName} | {grade}-{section}
Join the challenge 👉 {appUrl}`,
  },
  STREAK_30: {
    id: 'STREAK_30',
    name: '30-Day Master',
    emoji: '💎',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    description: '30-day learning streak',
    requirement: 'Use WizLingo for 30 consecutive days',
    shareText: `💎 {studentName} has a 30-DAY STREAK on WizLingo!
A month of dedicated learning. That's a habit! 🎯
🏫 {schoolName} | {grade}-{section}
Join the challenge 👉 {appUrl}`,
  },
};

export function getBadgeConfig(badgeType: BadgeType) {
  return BADGE_CONFIG[badgeType];
}

export function getStreakBadgeConfig(streakId: string) {
  return STREAK_BADGES[streakId];
}

/**
 * Format share text with context variables
 */
export function formatShareText(
  shareText: string,
  context: ShareContext
): string {
  let result = shareText;

  // Replace placeholders
  result = result.replace('{studentName}', context.studentName || 'A student');
  result = result.replace('{schoolName}', context.schoolName || 'their school');
  result = result.replace('{grade}', String(context.grade || 'X'));
  result = result.replace('{section}', String(context.section || 'A'));
  result = result.replace('{stat}', String(context.stat || 'impressive'));

  // Add referral link if available
  const appUrl = context.appUrl || 'https://wizlingo.app';
  let linkUrl = appUrl;

  if (context.referralCode && context.schoolId) {
    linkUrl = `${appUrl}/r/${context.referralCode}?school=${context.schoolId}`;
  } else if (context.referralCode) {
    linkUrl = `${appUrl}/r/${context.referralCode}`;
  }

  // Replace appUrl placeholder with referral link
  result = result.replace('{appUrl}', linkUrl);

  return result;
}
