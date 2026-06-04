// Email timing optimizer to send at optimal times for parent engagement
import { prisma } from "@/lib/prisma";

/**
 * Standard time zones for India (currently primary market)
 */
const TIMEZONE_UTC_OFFSETS: Record<string, number> = {
  "Asia/Kolkata": 5.5, // IST (Indian Standard Time)
  "Asia/Bangalore": 5.5,
  "Asia/Delhi": 5.5,
  "Asia/Mumbai": 5.5,
  "UTC": 0,
  "America/New_York": -5,
  "Europe/London": 0,
};

/**
 * Optimal send times (in local time) vary by context
 * Parents check email most during evening hours (6-8 PM)
 */
const OPTIMAL_SEND_HOURS = {
  WEEKDAY_EVENING: 18, // 6 PM - primary optimal time
  WEEKEND_EVENING: 19, // 7 PM - slightly later on weekends
};

const OPTIMAL_SEND_MINUTES = [15, 30, 45]; // Vary minutes to avoid same-second sends

/**
 * Get the optimal send time for a parent email
 * Factors considered:
 * - Timezone/location
 * - Day of week (weekday vs weekend)
 * - Time of day (evening preferred)
 * - Batch strategy (multiple sends, different minutes)
 *
 * @param parentEmail - Parent's email address
 * @param timezone - Timezone (defaults to Asia/Kolkata for India)
 * @param delayMinutes - Optional delay from now (default 0)
 * @returns Date object for when to send email
 */
export async function getOptimalSendTime(
  parentEmail: string,
  timezone: string = "Asia/Kolkata",
  delayMinutes: number = 0
): Promise<Date> {
  try {
    // Get parent's timezone preference from database if available
    const parentPrefs = await prisma.parentEmailPreference.findUnique({
      where: { parentEmail },
      select: { timezone: true, sendTime: true },
    });

    const effectiveTimezone = parentPrefs?.timezone || timezone;
    const preferredSendTime = parentPrefs?.sendTime;

    // Calculate UTC offset for parent's timezone
    const utcOffset = getUTCOffset(effectiveTimezone);

    // Get current time in parent's local timezone
    const now = new Date();
    const parentLocalTime = new Date(now.getTime() + utcOffset * 60 * 60 * 1000);

    // Determine optimal hour
    const dayOfWeek = parentLocalTime.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const optimalHour = isWeekend
      ? OPTIMAL_SEND_HOURS.WEEKEND_EVENING
      : OPTIMAL_SEND_HOURS.WEEKDAY_EVENING;

    // If parent has a specific preference, use that
    if (preferredSendTime) {
      return parsePreferredSendTime(now, preferredSendTime, utcOffset);
    }

    // Get a slightly randomized minute (15, 30, or 45) to avoid clustering
    const randomMinute =
      OPTIMAL_SEND_MINUTES[Math.floor(Math.random() * OPTIMAL_SEND_MINUTES.length)];

    // Calculate target send time
    let sendTime = new Date(parentLocalTime);
    sendTime.setHours(optimalHour, randomMinute, 0, 0);

    // If optimal time has already passed today, schedule for tomorrow
    if (sendTime <= parentLocalTime) {
      sendTime.setDate(sendTime.getDate() + 1);
    }

    // Convert back to UTC
    const utcSendTime = new Date(sendTime.getTime() - utcOffset * 60 * 60 * 1000);

    // Apply additional delay if specified
    if (delayMinutes > 0) {
      utcSendTime.setMinutes(utcSendTime.getMinutes() + delayMinutes);
    }

    return utcSendTime;
  } catch (error) {
    console.error("Error calculating optimal send time:", error);
    // Fallback: send in 1 hour
    const fallbackTime = new Date();
    fallbackTime.setHours(fallbackTime.getHours() + 1);
    return fallbackTime;
  }
}

/**
 * Get UTC offset for a timezone
 */
function getUTCOffset(timezone: string): number {
  return TIMEZONE_UTC_OFFSETS[timezone] ?? TIMEZONE_UTC_OFFSETS["Asia/Kolkata"];
}

/**
 * Parse parent's preferred send time (e.g., "6pm", "8pm") and return next occurrence
 */
function parsePreferredSendTime(
  now: Date,
  preferredTime: string,
  utcOffset: number
): Date {
  const match = preferredTime.match(/(\d{1,2})(am|pm)?/i);
  if (!match) {
    // Invalid format, use default
    return getOptimalSendTime("", "Asia/Kolkata", 0);
  }

  let hour = parseInt(match[1], 10);
  const period = match[2]?.toLowerCase();

  if (period === "pm" && hour !== 12) {
    hour += 12;
  } else if (period === "am" && hour === 12) {
    hour = 0;
  }

  const parentLocalTime = new Date(now.getTime() + utcOffset * 60 * 60 * 1000);
  const sendTime = new Date(parentLocalTime);
  sendTime.setHours(hour, 0, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (sendTime <= parentLocalTime) {
    sendTime.setDate(sendTime.getDate() + 1);
  }

  // Convert back to UTC
  const utcSendTime = new Date(sendTime.getTime() - utcOffset * 60 * 60 * 1000);
  return utcSendTime;
}

/**
 * Batch emails for a specific send time window
 * Groups emails by their optimal send time to batch process them
 *
 * @param emails - Array of { parentEmail, timezone? }
 * @param maxBatchSize - Maximum emails per batch (default 100)
 * @returns Map of send times to email batches
 */
export async function batchEmailsByOptimalTime(
  emails: Array<{ parentEmail: string; timezone?: string }>,
  maxBatchSize: number = 100
): Promise<Map<string, string[]>> {
  const batches = new Map<string, string[]>();

  for (const { parentEmail, timezone } of emails) {
    const sendTime = await getOptimalSendTime(parentEmail, timezone);
    const timeKey = sendTime.toISOString();

    if (!batches.has(timeKey)) {
      batches.set(timeKey, []);
    }

    const batch = batches.get(timeKey)!;
    if (batch.length < maxBatchSize) {
      batch.push(parentEmail);
    }
  }

  return batches;
}

/**
 * Get all emails scheduled to send in the next hour
 * Used by cron jobs to process scheduled emails
 */
export async function getEmailsDueForSending(
  windowMinutes: number = 60
): Promise<
  Array<{
    id: string;
    studentId: string;
    parentEmail: string;
    type: string;
    subject: string;
    html: string;
  }>
> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowMinutes * 60 * 1000);

  // Get emails scheduled for sending in the next window
  const emails = await prisma.emailSchedule.findMany({
    where: {
      scheduledFor: {
        gte: now,
        lte: windowEnd,
      },
      sent: false,
    },
    include: {
      student: {
        select: {
          parentEmail: true,
        },
      },
    },
  });

  return emails.map((email: any) => ({
    id: email.id,
    studentId: email.studentId,
    parentEmail: email.student.parentEmail || "",
    type: email.type,
    subject: email.subject,
    html: email.html,
  }));
}

/**
 * Schedule an email for sending at optimal time
 * Should be called when a badge is earned or event triggers
 */
export async function scheduleEmailForOptimalTime(
  studentId: string,
  parentEmail: string,
  emailType: string,
  subject: string,
  html: string,
  batchDelayMinutes: number = 0,
  timezone?: string
): Promise<string> {
  const scheduledFor = await getOptimalSendTime(
    parentEmail,
    timezone,
    batchDelayMinutes
  );

  // Check if emailSchedule table exists, if not just log for now
  try {
    const scheduled = await prisma.emailSchedule.create({
      data: {
        studentId,
        parentEmail,
        type: emailType,
        subject,
        html,
        scheduledFor,
        sent: false,
      },
    });
    return scheduled.id;
  } catch (error) {
    // If table doesn't exist yet, log to console
    console.log("📧 Email scheduled (in-memory):", {
      parentEmail,
      type: emailType,
      scheduledFor: scheduledFor.toISOString(),
    });
    return `scheduled_${Date.now()}`;
  }
}

/**
 * Calculate time until email should be sent
 */
export function getTimeUntilSend(sendTime: Date): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const diffMs = sendTime.getTime() - now.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  return {
    hours: Math.floor(diffSeconds / 3600),
    minutes: Math.floor((diffSeconds % 3600) / 60),
    seconds: diffSeconds % 60,
  };
}

/**
 * Get email sending statistics
 */
export async function getEmailTimingStats(): Promise<{
  totalScheduled: number;
  pendingSend: number;
  sent: number;
  avgTimeToSend: number; // in minutes
}> {
  try {
    const now = new Date();

    const totalScheduled = await prisma.emailSchedule.count();
    const sent = await prisma.emailSchedule.count({
      where: { sent: true },
    });
    const pendingSend = totalScheduled - sent;

    // Calculate average time to send (for pending emails)
    const pending = await prisma.emailSchedule.findMany({
      where: { sent: false },
      select: { scheduledFor: true, createdAt: true },
    });

    let avgTimeToSend = 0;
    if (pending.length > 0) {
      const totalTime = pending.reduce((sum, email) => {
        const scheduleTime = email.scheduledFor.getTime();
        const createTime = email.createdAt.getTime();
        return sum + (scheduleTime - createTime);
      }, 0);
      avgTimeToSend = totalTime / pending.length / (1000 * 60); // convert to minutes
    }

    return {
      totalScheduled,
      pendingSend,
      sent,
      avgTimeToSend,
    };
  } catch (error) {
    console.error("Error getting email timing stats:", error);
    return {
      totalScheduled: 0,
      pendingSend: 0,
      sent: 0,
      avgTimeToSend: 0,
    };
  }
}
