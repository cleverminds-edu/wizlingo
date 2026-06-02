import { prisma } from "@/lib/prisma";
import { BadgeType } from "@/app/generated/prisma/client";
import {
  badgeEarnedStudentTemplate,
  badgeEarnedParentTemplate,
  milestoneTemplate,
  weeklySummaryTemplate,
  leaderboardTemplate,
} from "@/lib/email-templates";
import { BADGE_CONFIG } from "@/lib/badge-system";

// Configure your email provider here (SendGrid, AWS SES, etc.)
// For now, using a simple implementation that logs to console
// Replace with actual provider when configured

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "console";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@wizlingo.com";

// Email queue for async processing
const emailQueue: Array<{
  to: string;
  subject: string;
  html: string;
  type: string;
  studentId: string;
}> = [];

// Simple in-memory queue processor
let isProcessing = false;

async function processEmailQueue() {
  if (isProcessing || emailQueue.length === 0) return;
  isProcessing = true;

  while (emailQueue.length > 0) {
    const email = emailQueue.shift();
    if (!email) break;

    try {
      await sendEmailActual(email);
    } catch (error) {
      console.error("Failed to send email:", error);
      // Log failure to database
      await prisma.sentEmail.create({
        data: {
          studentId: email.studentId,
          type: email.type,
          recipientEmail: email.to,
          subject: email.subject,
          body: email.html,
          status: "failed",
          error: String(error),
        },
      });
    }
  }

  isProcessing = false;
}

async function sendEmailActual(email: {
  to: string;
  subject: string;
  html: string;
  type: string;
  studentId: string;
}) {
  if (EMAIL_PROVIDER === "console") {
    console.log("📧 Email (simulated):", {
      to: email.to,
      subject: email.subject,
      type: email.type,
    });

    // Log to database for tracking
    await prisma.sentEmail.create({
      data: {
        studentId: email.studentId,
        type: email.type,
        recipientEmail: email.to,
        subject: email.subject,
        body: email.html,
        status: "sent",
      },
    });

    return;
  }

  // TODO: Implement actual email provider (SendGrid, AWS SES, etc.)
  // Example for SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: email.to,
  //   from: FROM_EMAIL,
  //   subject: email.subject,
  //   html: email.html,
  // });

  throw new Error("Email provider not implemented");
}

function queueEmail(email: {
  to: string;
  subject: string;
  html: string;
  type: string;
  studentId: string;
}) {
  emailQueue.push(email);
  // Process queue asynchronously (non-blocking)
  setImmediate(() => processEmailQueue());
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export async function sendBadgeEarnedEmail(
  studentId: string,
  badgeType: BadgeType,
  stats: { accuracy: number; wpm: number; duration: number }
): Promise<boolean> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) throw new Error("Student not found");

    const badgeConfig = BADGE_CONFIG[badgeType];
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/student/dashboard`;

    // Send to student
    const studentTemplate = badgeEarnedStudentTemplate({
      studentName: student.name,
      badgeType: badgeConfig.name,
      badgeEmoji: badgeConfig.emoji,
      stats,
      dashboardUrl,
    });

    queueEmail({
      to: student.admissionNumber, // In production, use student email
      subject: studentTemplate.subject,
      html: studentTemplate.html,
      type: "badge_earned",
      studentId,
    });

    // Send to parent if parent email is available
    if (student.parentEmail) {
      const prefs = await prisma.notificationPreference.findUnique({
        where: { studentId },
      });

      if (!prefs || prefs.badgeEarnedParent) {
        const parentTemplate = badgeEarnedParentTemplate({
          parentName: "Parent", // In production, get actual parent name
          studentName: student.name,
          badgeType: badgeConfig.name,
          badgeEmoji: badgeConfig.emoji,
          description: badgeConfig.description,
          progressUrl: dashboardUrl,
        });

        queueEmail({
          to: student.parentEmail,
          subject: parentTemplate.subject,
          html: parentTemplate.html,
          type: "badge_earned_parent",
          studentId,
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Error sending badge earned email:", error);
    return false;
  }
}

export async function sendMilestoneEmail(
  studentId: string,
  milestoneCount: number
): Promise<boolean> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { notificationPrefs: true },
    });

    if (!student) throw new Error("Student not found");

    const prefs = student.notificationPrefs;
    if (!prefs || !prefs.milestoneEmail) return false;

    if (!student.parentEmail) return false; // Only send to parent

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/student/dashboard`;

    const template = milestoneTemplate({
      parentName: "Parent",
      studentName: student.name,
      count: milestoneCount,
      dashboardUrl,
    });

    queueEmail({
      to: student.parentEmail,
      subject: template.subject,
      html: template.html,
      type: "milestone",
      studentId,
    });

    return true;
  } catch (error) {
    console.error("Error sending milestone email:", error);
    return false;
  }
}

export async function sendWeeklySummaryEmail(
  studentId: string,
  summaryData: {
    sessionsCompleted: number;
    badgesEarned: Array<{ emoji: string; name: string }>;
    accuracyImprovement: { from: number; to: number };
    nextChallenge?: string;
  }
): Promise<boolean> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { notificationPrefs: true },
    });

    if (!student) throw new Error("Student not found");

    const prefs = student.notificationPrefs;
    if (!prefs || !prefs.weeklySummary) return false;

    if (!student.parentEmail) return false; // Only send to parent

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/student/dashboard`;

    const template = weeklySummaryTemplate({
      parentName: "Parent",
      studentName: student.name,
      sessionsCompleted: summaryData.sessionsCompleted,
      badgesEarned: summaryData.badgesEarned,
      accuracyImprovement: summaryData.accuracyImprovement,
      nextChallenge: summaryData.nextChallenge,
      dashboardUrl,
    });

    queueEmail({
      to: student.parentEmail,
      subject: template.subject,
      html: template.html,
      type: "weekly_summary",
      studentId,
    });

    return true;
  } catch (error) {
    console.error("Error sending weekly summary email:", error);
    return false;
  }
}

export async function sendLeaderboardEmail(
  studentId: string,
  leaderboardData: {
    rank: number;
    totalStudents: number;
    topStudents: Array<{ name: string; badgeCount: number; rank: number }>;
  }
): Promise<boolean> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { notificationPrefs: true },
    });

    if (!student) throw new Error("Student not found");

    const prefs = student.notificationPrefs;
    if (!prefs || !prefs.leaderboardUpdate) return false;

    if (!student.parentEmail) return false; // Only send to parent

    const leaderboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/leaderboard`;

    const template = leaderboardTemplate({
      parentName: "Parent",
      studentName: student.name,
      rank: leaderboardData.rank,
      totalStudents: leaderboardData.totalStudents,
      topStudents: leaderboardData.topStudents,
      leaderboardUrl,
    });

    queueEmail({
      to: student.parentEmail,
      subject: template.subject,
      html: template.html,
      type: "leaderboard",
      studentId,
    });

    return true;
  } catch (error) {
    console.error("Error sending leaderboard email:", error);
    return false;
  }
}

export async function getEmailQueue(): Promise<number> {
  return emailQueue.length;
}

export async function flushEmailQueue(): Promise<void> {
  await processEmailQueue();
}

// Initialize notification preferences for new students
export async function initializeNotificationPreferences(
  studentId: string
): Promise<void> {
  const existing = await prisma.notificationPreference.findUnique({
    where: { studentId },
  });

  if (!existing) {
    await prisma.notificationPreference.create({
      data: {
        studentId,
        badgeEarnedStudent: true,
        badgeEarnedParent: true,
        milestoneEmail: true,
        weeklySummary: true,
        leaderboardUpdate: true,
      },
    });
  }
}

export async function updateNotificationPreferences(
  studentId: string,
  preferences: {
    badgeEarnedStudent?: boolean;
    badgeEarnedParent?: boolean;
    milestoneEmail?: boolean;
    weeklySummary?: boolean;
    leaderboardUpdate?: boolean;
    emailFrequency?: "IMMEDIATE" | "DAILY" | "WEEKLY" | "NEVER";
  }
): Promise<void> {
  await prisma.notificationPreference.upsert({
    where: { studentId },
    update: preferences,
    create: {
      studentId,
      ...preferences,
    },
  });
}

export async function getNotificationPreferences(studentId: string) {
  return prisma.notificationPreference.findUnique({
    where: { studentId },
  });
}
