// WhatsApp share URL generator for parent emails
import { BadgeType } from "@/app/generated/prisma/client";
import { BADGE_CONFIG } from "@/lib/badge-system";

// Badge emoji and achievement descriptions for WhatsApp messages
const WHATSAPP_MESSAGES: Record<BadgeType, { emoji: string; title: string; description: string }> = {
  SPARK: {
    emoji: "✨",
    title: "SPARK Badge",
    description: "Started their learning journey with their first reading session.",
  },
  WORD_WIZARD: {
    emoji: "🧙",
    title: "WORD WIZARD Badge",
    description: "Achieved 80%+ reading accuracy - a true master of words!",
  },
  VOICE_WIZARD: {
    emoji: "🎤",
    title: "VOICE WIZARD Badge",
    description: "Demonstrated excellent speaking fluency and confidence.",
  },
  LANGUAGE_WIZARD: {
    emoji: "💬",
    title: "LANGUAGE WIZARD Badge",
    description: "Mastered both reading and speaking - a true language expert!",
  },
  GRAND_WIZARD: {
    emoji: "👑",
    title: "GRAND WIZARD Badge",
    description: "Achieved the ultimate mastery - the highest honor on WizLingo!",
  },
};

/**
 * Generate a WhatsApp share URL with pre-filled message
 * @param studentName - Name of the student
 * @param badgeType - Type of badge earned
 * @param schoolName - Name of the school
 * @param referralCode - Unique referral code for tracking
 * @param rank - Optional rank in school
 * @returns WhatsApp share URL
 */
export function generateWhatsAppShareURL(
  studentName: string,
  badgeType: BadgeType,
  schoolName: string,
  referralCode: string,
  rank?: number
): string {
  const badgeConfig = WHATSAPP_MESSAGES[badgeType];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wizlingo.com";

  let message = `🎉 ${studentName} just earned the ${badgeConfig.emoji} ${badgeConfig.title} badge on WizLingo!\n\n`;
  message += `${badgeConfig.description}\n\n`;

  if (rank) {
    message += `📊 Ranked #${rank} in ${schoolName}\n\n`;
  }

  message += `🧙‍♂️ Join the Wizard's Academy:\n`;
  message += `${appUrl}/join?ref=${referralCode}\n\n`;
  message += `#WizLingo #${badgeType.replace("_", "")} #LearningExcellence`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a WhatsApp share URL for weekly progress
 */
export function generateWeeklyProgressWhatsAppURL(
  studentName: string,
  schoolName: string,
  badgesCount: number,
  referralCode: string,
  accuracyImprovement?: number
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wizlingo.com";

  let message = `📊 Great news! ${studentName}'s learning progress on WizLingo:\n\n`;
  message += `🎉 ${badgesCount} badge${badgesCount !== 1 ? "s" : ""} earned this week\n`;

  if (accuracyImprovement) {
    message += `📈 Reading accuracy improved by ${accuracyImprovement}%\n`;
  }

  message += `\n🏫 ${schoolName}\n\n`;
  message += `Join WizLingo for your child:\n`;
  message += `${appUrl}/join?ref=${referralCode}\n\n`;
  message += `#WizLingo #LearningProgress #AI-Powered`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a WhatsApp share URL for milestone achievement
 */
export function generateMilestoneWhatsAppURL(
  studentName: string,
  badgeCount: number,
  schoolName: string,
  referralCode: string
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wizlingo.com";

  const milestoneEmoji = badgeCount >= 5 ? "🏆" : badgeCount >= 3 ? "⭐" : "🌟";

  let message = `${milestoneEmoji} MILESTONE! ${studentName} earned ${badgeCount} badges on WizLingo!\n\n`;
  message += `Your child is now part of our Achievements Club!\n`;
  message += `📚 ${schoolName}\n\n`;
  message += `Ready to celebrate your child's success?\n`;
  message += `${appUrl}/join?ref=${referralCode}\n\n`;
  message += `#WizLingo #MilestoneAchieved #LanguageWizard`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a WhatsApp share URL for monthly achievement
 */
export function generateMonthlyAchievementWhatsAppURL(
  studentName: string,
  schoolName: string,
  rank: number,
  growthPercentage: number,
  referralCode: string
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wizlingo.com";

  let message = `🌟 ${studentName} is making amazing progress on WizLingo!\n\n`;
  message += `📊 Monthly Growth: +${growthPercentage}%\n`;
  message += `🏅 School Ranking: #${rank}\n`;
  message += `📚 ${schoolName}\n\n`;
  message += `See how AI is transforming education:\n`;
  message += `${appUrl}/join?ref=${referralCode}\n\n`;
  message += `#WizLingo #EducationTransformation #LanguageLearning`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a WhatsApp share URL for school ranking notification
 */
export function generateSchoolRankingWhatsAppURL(
  schoolName: string,
  totalAchievingStudents: number,
  schoolRank: number,
  referralCode: string
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wizlingo.com";

  let message = `🏆 ${schoolName} is rising on WizLingo!\n\n`;
  message += `📚 ${totalAchievingStudents} students achieving excellence\n`;
  message += `🌟 Ranked #${schoolRank} among partner schools\n\n`;
  message += `Join the learning revolution:\n`;
  message += `${appUrl}/join?ref=${referralCode}\n\n`;
  message += `#WizLingo #SchoolSuccess #EducationExcellence`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Encode a custom message for WhatsApp
 */
export function encodeWhatsAppMessage(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Parse WhatsApp referral code from URL
 */
export function parseWhatsAppReferralCode(url: string): string | null {
  const match = url.match(/ref=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
