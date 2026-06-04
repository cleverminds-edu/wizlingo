// Email analytics and tracking for parent emails
import { prisma } from "@/lib/prisma";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface EmailMetrics {
  sent: number;
  opened: number;
  openRate: number;
  clicked: number;
  clickRate: number;
  clicksByLink: Record<string, number>;
  conversions: number;
  uniqueOpeners: number;
  uniqueClickers: number;
  averageClicksPerEmail: number;
  unsubscribed: number;
  bounced: number;
}

export interface EmailEventMetrics {
  emailId: string;
  opens: number;
  clicks: number;
  linkClicks: Record<string, number>;
  conversions: number;
  unsubscribed: boolean;
  bounced: boolean;
}

/**
 * Track email open via pixel
 * @param emailId - Unique email ID
 * @returns True if tracked successfully
 */
export async function trackEmailOpen(emailId: string): Promise<boolean> {
  try {
    // Check if email exists in the logs
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: emailId },
    });

    if (!emailLog) {
      return false;
    }

    // Log the open event
    await prisma.emailClick.create({
      data: {
        emailId,
        eventType: "open",
        linkType: "pixel",
        timestamp: new Date(),
        userAgent: "",
        ipAddress: "",
      },
    });

    // Increment open count in email log
    await prisma.emailLog.update({
      where: { id: emailId },
      data: {
        opens: {
          increment: 1,
        },
        lastOpenedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error("Error tracking email open:", error);
    return false;
  }
}

/**
 * Track email link click
 * @param emailId - Unique email ID
 * @param linkType - Type of link clicked (view_cert, share_whatsapp, view_dashboard, signup)
 * @returns True if tracked successfully
 */
export async function trackEmailClick(
  emailId: string,
  linkType: string,
  userAgent?: string,
  ipAddress?: string
): Promise<boolean> {
  try {
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: emailId },
    });

    if (!emailLog) {
      return false;
    }

    // Log the click event
    await prisma.emailClick.create({
      data: {
        emailId,
        eventType: "click",
        linkType,
        timestamp: new Date(),
        userAgent: userAgent || "",
        ipAddress: ipAddress || "",
      },
    });

    // Increment click count in email log
    await prisma.emailLog.update({
      where: { id: emailId },
      data: {
        clicks: {
          increment: 1,
        },
        lastClickedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error("Error tracking email click:", error);
    return false;
  }
}

/**
 * Get comprehensive email metrics
 * @param emailType - Type of email (badge_earned, weekly_summary, etc)
 * @param dateRange - Date range for metrics
 * @returns Aggregated email metrics
 */
export async function getEmailMetrics(
  emailType: string,
  dateRange: DateRange
): Promise<EmailMetrics> {
  try {
    const { startDate, endDate } = dateRange;

    // Get all emails sent in date range
    const emailLogs = await prisma.emailLog.findMany({
      where: {
        type: emailType,
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        clicks: true,
      },
    });

    const totalSent = emailLogs.length;
    const opened = emailLogs.filter((e) => e.opens > 0).length;
    const clicked = emailLogs.filter((e) => e.clicks > 0).length;

    // Count unique openers
    const uniqueOpeners = new Set(
      emailLogs.filter((e) => e.opens > 0).map((e) => e.parentEmail)
    ).size;

    // Count unique clickers
    const uniqueClickers = new Set(
      emailLogs.filter((e) => e.clicks > 0).map((e) => e.parentEmail)
    ).size;

    // Aggregate link clicks
    const clicksByLink: Record<string, number> = {};
    emailLogs.forEach((email) => {
      email.clicks.forEach((click) => {
        if (click.linkType) {
          clicksByLink[click.linkType] = (clicksByLink[click.linkType] || 0) + 1;
        }
      });
    });

    // Count conversions (referral codes used)
    const conversions = await prisma.conversionFunnel.count({
      where: {
        step: "signup_complete",
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Count bounced and unsubscribed
    const bounced = emailLogs.filter((e) => e.status === "bounced").length;
    const unsubscribed = emailLogs.filter((e) => e.status === "unsubscribed")
      .length;

    return {
      sent: totalSent,
      opened,
      openRate: totalSent > 0 ? (opened / totalSent) * 100 : 0,
      clicked,
      clickRate: totalSent > 0 ? (clicked / totalSent) * 100 : 0,
      clicksByLink,
      conversions,
      uniqueOpeners,
      uniqueClickers,
      averageClicksPerEmail: clicked > 0 ? clicked / totalSent : 0,
      unsubscribed,
      bounced,
    };
  } catch (error) {
    console.error("Error getting email metrics:", error);
    return {
      sent: 0,
      opened: 0,
      openRate: 0,
      clicked: 0,
      clickRate: 0,
      clicksByLink: {},
      conversions: 0,
      uniqueOpeners: 0,
      uniqueClickers: 0,
      averageClicksPerEmail: 0,
      unsubscribed: 0,
      bounced: 0,
    };
  }
}

/**
 * Get metrics for a specific email
 */
export async function getEmailEventMetrics(
  emailId: string
): Promise<EmailEventMetrics | null> {
  try {
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: emailId },
      include: {
        clicks: true,
      },
    });

    if (!emailLog) {
      return null;
    }

    // Aggregate link clicks
    const linkClicks: Record<string, number> = {};
    emailLog.clicks.forEach((click) => {
      if (click.linkType) {
        linkClicks[click.linkType] = (linkClicks[click.linkType] || 0) + 1;
      }
    });

    // Check for conversions from this email
    const conversions = await prisma.conversionFunnel.count({
      where: {
        referralCode: emailLog.referralCode,
        step: "signup_complete",
      },
    });

    return {
      emailId,
      opens: emailLog.opens,
      clicks: emailLog.clicks.length,
      linkClicks,
      conversions,
      unsubscribed: emailLog.status === "unsubscribed",
      bounced: emailLog.status === "bounced",
    };
  } catch (error) {
    console.error("Error getting email event metrics:", error);
    return null;
  }
}

/**
 * Get parent email engagement metrics
 */
export async function getParentEngagementMetrics(parentEmail: string): Promise<{
  totalEmailsReceived: number;
  totalOpens: number;
  totalClicks: number;
  engagementRate: number; // percentage of emails opened
  preferredEmailTypes: Array<{ type: string; opens: number }>;
  mostClickedLinks: Array<{ linkType: string; clicks: number }>;
  lastEngagedAt: Date | null;
}> {
  try {
    const emailLogs = await prisma.emailLog.findMany({
      where: { parentEmail },
      include: { clicks: true },
    });

    const totalEmails = emailLogs.length;
    const engagedEmails = emailLogs.filter((e) => e.opens > 0 || e.clicks > 0);
    const totalOpens = emailLogs.reduce((sum, e) => sum + e.opens, 0);
    const totalClicks = emailLogs.reduce((sum, e) => sum + e.clicks, 0);

    // Most preferred email types (by opens)
    const emailTypeOpens = new Map<string, number>();
    emailLogs.forEach((email) => {
      const current = emailTypeOpens.get(email.type) || 0;
      emailTypeOpens.set(email.type, current + email.opens);
    });

    const preferredEmailTypes = Array.from(emailTypeOpens.entries())
      .map(([type, opens]) => ({ type, opens }))
      .sort((a, b) => b.opens - a.opens)
      .slice(0, 5);

    // Most clicked links
    const linkClicks = new Map<string, number>();
    emailLogs.forEach((email) => {
      email.clicks.forEach((click) => {
        if (click.linkType) {
          const current = linkClicks.get(click.linkType) || 0;
          linkClicks.set(click.linkType, current + 1);
        }
      });
    });

    const mostClickedLinks = Array.from(linkClicks.entries())
      .map(([linkType, clicks]) => ({ linkType, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    // Last engagement time
    const lastEngaged = engagedEmails
      .sort((a, b) => {
        const aTime = a.lastOpenedAt || a.lastClickedAt || new Date(0);
        const bTime = b.lastOpenedAt || b.lastClickedAt || new Date(0);
        return bTime.getTime() - aTime.getTime();
      })
      .at(0);

    const lastEngagedAt =
      lastEngaged?.lastOpenedAt ||
      lastEngaged?.lastClickedAt ||
      (lastEngaged?.sentAt || null);

    return {
      totalEmailsReceived: totalEmails,
      totalOpens,
      totalClicks,
      engagementRate:
        totalEmails > 0 ? (engagedEmails.length / totalEmails) * 100 : 0,
      preferredEmailTypes,
      mostClickedLinks,
      lastEngagedAt,
    };
  } catch (error) {
    console.error("Error getting parent engagement metrics:", error);
    return {
      totalEmailsReceived: 0,
      totalOpens: 0,
      totalClicks: 0,
      engagementRate: 0,
      preferredEmailTypes: [],
      mostClickedLinks: [],
      lastEngagedAt: null,
    };
  }
}

/**
 * Get A/B test results
 */
export async function getABTestResults(
  emailType: string,
  dateRange: DateRange
): Promise<
  Array<{
    variant: string;
    sent: number;
    openRate: number;
    clickRate: number;
    conversions: number;
    winner?: boolean;
  }>
> {
  try {
    const variants = await prisma.emailVariantTest.findMany({
      where: {
        type: emailType,
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
      include: {
        emailLogs: {
          include: {
            clicks: true,
          },
        },
      },
    });

    const results = variants.map((variant) => {
      const totalSent = variant.emailLogs.length;
      const opened = variant.emailLogs.filter((e) => e.opens > 0).length;
      const clicked = variant.emailLogs.filter((e) => e.clicks > 0).length;

      return {
        variant: variant.variant,
        sent: totalSent,
        openRate: totalSent > 0 ? (opened / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (clicked / totalSent) * 100 : 0,
        conversions: variant.conversions,
      };
    });

    // Determine winner (highest click rate)
    if (results.length > 1) {
      const winnerIndex = results.reduce((maxIdx, curr, idx, arr) => {
        return curr.clickRate > arr[maxIdx].clickRate ? idx : maxIdx;
      }, 0);

      results[winnerIndex].winner = true;
    }

    return results;
  } catch (error) {
    console.error("Error getting A/B test results:", error);
    return [];
  }
}

/**
 * Generate email analytics report
 */
export async function generateEmailReport(dateRange: DateRange): Promise<{
  period: string;
  totalEmailsSent: number;
  totalOpens: number;
  totalClicks: number;
  totalConversions: number;
  topPerformingEmailTypes: Array<{
    type: string;
    openRate: number;
    clickRate: number;
  }>;
  topPerformingLinks: Array<{ link: string; clicks: number }>;
  parentEngagement: {
    activeParents: number;
    averageOpenRate: number;
    averageClickRate: number;
  };
  recommendations: string[];
}> {
  try {
    const { startDate, endDate } = dateRange;

    // Get email logs
    const emailLogs = await prisma.emailLog.findMany({
      where: {
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        clicks: true,
      },
    });

    const totalSent = emailLogs.length;
    const totalOpens = emailLogs.reduce((sum, e) => sum + e.opens, 0);
    const totalClicks = emailLogs.reduce((sum, e) => sum + e.clicks, 0);

    // Get conversions
    const totalConversions = await prisma.conversionFunnel.count({
      where: {
        step: "signup_complete",
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Email types performance
    const typeMetrics = new Map<
      string,
      { sent: number; opens: number; clicks: number }
    >();
    emailLogs.forEach((email) => {
      const current = typeMetrics.get(email.type) || {
        sent: 0,
        opens: 0,
        clicks: 0,
      };
      typeMetrics.set(email.type, {
        sent: current.sent + 1,
        opens: current.opens + email.opens,
        clicks: current.clicks + email.clicks,
      });
    });

    const topPerformingEmailTypes = Array.from(typeMetrics.entries())
      .map(([type, metrics]) => ({
        type,
        openRate: metrics.sent > 0 ? (metrics.opens / metrics.sent) * 100 : 0,
        clickRate: metrics.sent > 0 ? (metrics.clicks / metrics.sent) * 100 : 0,
      }))
      .sort((a, b) => b.clickRate - a.clickRate)
      .slice(0, 5);

    // Top performing links
    const linkMetrics = new Map<string, number>();
    emailLogs.forEach((email) => {
      email.clicks.forEach((click) => {
        if (click.linkType) {
          const current = linkMetrics.get(click.linkType) || 0;
          linkMetrics.set(click.linkType, current + 1);
        }
      });
    });

    const topPerformingLinks = Array.from(linkMetrics.entries())
      .map(([link, clicks]) => ({ link, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    // Parent engagement
    const uniqueParents = new Set(emailLogs.map((e) => e.parentEmail)).size;
    const avgOpenRate =
      totalSent > 0 ? (totalOpens / totalSent / uniqueParents) * 100 : 0;
    const avgClickRate =
      totalSent > 0 ? (totalClicks / totalSent / uniqueParents) * 100 : 0;

    // Generate recommendations
    const recommendations: string[] = [];

    const topEmailType = topPerformingEmailTypes[0];
    if (topEmailType) {
      recommendations.push(
        `${topEmailType.type} emails have the highest engagement (${topEmailType.clickRate.toFixed(1)}% click rate). Consider sending these more frequently.`
      );
    }

    const topLink = topPerformingLinks[0];
    if (topLink && topLink.link === "share_whatsapp") {
      recommendations.push(
        "WhatsApp sharing is your strongest CTA. Emphasize it more in future emails."
      );
    }

    if (avgOpenRate < 20) {
      recommendations.push(
        "Email open rate is below 20%. Consider testing new subject lines."
      );
    }

    if (avgClickRate < 5) {
      recommendations.push(
        "Click-through rate is low. Try simplifying CTAs or moving them higher in the email."
      );
    }

    if (totalConversions > 0) {
      recommendations.push(
        `Your parent emails have driven ${totalConversions} referral conversions. Keep up the momentum!`
      );
    }

    return {
      period: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      totalEmailsSent: totalSent,
      totalOpens,
      totalClicks,
      totalConversions,
      topPerformingEmailTypes,
      topPerformingLinks,
      parentEngagement: {
        activeParents: uniqueParents,
        averageOpenRate: avgOpenRate,
        averageClickRate: avgClickRate,
      },
      recommendations,
    };
  } catch (error) {
    console.error("Error generating email report:", error);
    return {
      period: "",
      totalEmailsSent: 0,
      totalOpens: 0,
      totalClicks: 0,
      totalConversions: 0,
      topPerformingEmailTypes: [],
      topPerformingLinks: [],
      parentEngagement: {
        activeParents: 0,
        averageOpenRate: 0,
        averageClickRate: 0,
      },
      recommendations: [
        "Unable to generate report due to an error. Check logs for details.",
      ],
    };
  }
}
