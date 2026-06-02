// Client-side badge configuration (no server imports)
import { BadgeType } from '@/app/generated/prisma/client';

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
    shareText: `I just earned the ✨ SPARK badge on WizLingo!
I'm starting my reading journey with AI-powered sessions.
Join me → [LINK]`,
    order: 1,
  },
  WORD_WIZARD: {
    type: 'WORD_WIZARD',
    name: 'Word Wizard',
    emoji: '📚',
    badgeImage: '/badges/word-wizard-badge.svg',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    description: 'Master of reading comprehension',
    requirement: 'Achieve 80%+ accuracy in reading',
    message: 'Incredible! You\'re a Word Wizard! 📚 Your reading precision is outstanding.',
    shareText: `I just became a 📚 WORD WIZARD on WizLingo!
80%+ reading accuracy unlocked. Can you beat my score?
Join the challenge → [LINK]`,
    order: 2,
  },
  VOICE_WIZARD: {
    type: 'VOICE_WIZARD',
    name: 'Voice Wizard',
    emoji: '🎤',
    badgeImage: '/badges/voice-wizard-badge.svg',
    color: '#9333EA',
    bgColor: '#FAF5FF',
    description: 'Master of spoken fluency',
    requirement: 'Achieve 75%+ fluency in speaking',
    message: 'Amazing! You\'re a Voice Wizard! 🎤 Your pronunciation is excellent.',
    shareText: `I just became a 🎤 VOICE WIZARD on WizLingo!
My speaking fluency reached 75%+. Try the speaking challenge!
Join → [LINK]`,
    order: 3,
  },
  LANGUAGE_WIZARD: {
    type: 'LANGUAGE_WIZARD',
    name: 'Language Wizard',
    emoji: '🧙',
    badgeImage: '/badges/language-wizard-badge.svg',
    color: '#059669',
    bgColor: '#ECFDF5',
    description: 'Committed learner with 10+ sessions',
    requirement: 'Complete 10 reading or speaking sessions',
    message: 'Incredible dedication! You\'re a Language Wizard! 🧙 Keep the momentum going!',
    shareText: `I just became a 🧙 LANGUAGE WIZARD on WizLingo!
10+ sessions completed and my skills are improving daily.
Join me on this journey → [LINK]`,
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
    shareText: `I just became a 👑 GRAND WIZARD on WizLingo!
All badges unlocked! I\'ve mastered reading & speaking fluency.
Can you become a Grand Wizard too? → [LINK]`,
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
    shareText: `I have a 🔥 7-DAY STREAK on WizLingo!
Learning every day to improve my English skills.
Start your streak → [LINK]`,
  },
  STREAK_14: {
    id: 'STREAK_14',
    name: '14-Day Champion',
    emoji: '⚡',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    description: '14-day learning streak',
    requirement: 'Use WizLingo for 14 consecutive days',
    shareText: `I have a ⚡ 14-DAY STREAK on WizLingo!
Two weeks of consistent learning. Feeling awesome!
Join the challenge → [LINK]`,
  },
  STREAK_30: {
    id: 'STREAK_30',
    name: '30-Day Master',
    emoji: '💎',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    description: '30-day learning streak',
    requirement: 'Use WizLingo for 30 consecutive days',
    shareText: `I have a 💎 30-DAY STREAK on WizLingo!
A month of dedicated learning. I'm a learning champion!
Join me → [LINK]`,
  },
};

export function getBadgeConfig(badgeType: BadgeType) {
  return BADGE_CONFIG[badgeType];
}

export function getStreakBadgeConfig(streakId: string) {
  return STREAK_BADGES[streakId];
}
