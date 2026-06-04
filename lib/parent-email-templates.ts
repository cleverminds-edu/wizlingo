// Parent-focused email templates with WhatsApp sharing support
import { BadgeType } from "@/app/generated/prisma/client";
import { BADGE_CONFIG } from "@/lib/badge-system";

export interface ParentEmailData {
  parentName: string;
  studentName: string;
  schoolName: string;
  parentEmail: string;
  whatsAppShareUrl?: string;
  referralCode?: string;
}

export interface BadgeEarnedEmailData extends ParentEmailData {
  badgeType: BadgeType;
  accuracy?: number;
  fluency?: number;
  sessionCount?: number;
  rank?: number;
  certificateUrl?: string;
  dashboardUrl: string;
}

export interface WeeklyProgressEmailData extends ParentEmailData {
  sessionsCompleted: number;
  badgesEarned: Array<{ emoji: string; name: string }>;
  accuracyThen: number;
  accuracyNow: number;
  fluencyThen: number;
  fluencyNow: number;
  nextBadgeTarget?: string;
  dashboardUrl: string;
}

export interface MonthlyAchievementEmailData extends ParentEmailData {
  badgesEarnedThisMonth: Array<{ emoji: string; name: string }>;
  rank: number;
  totalStudentsInSchool: number;
  growthPercentage: number;
  topAchievementStory: string;
  dashboardUrl: string;
}

export interface MilestoneEmailData extends ParentEmailData {
  badgeCount: number;
  allBadges: Array<{ emoji: string; name: string }>;
  congratulations: string;
  dashboardUrl: string;
}

export interface SchoolRankingEmailData {
  schoolName: string;
  totalAchievingStudents: number;
  schoolRank: number;
  totalSchools: number;
  successStories: Array<{ studentName: string; achievement: string }>;
  principalName?: string;
  dashboardUrl: string;
}

// TEMPLATE 1: Badge Earned (Celebration)
export function badgeEarnedParentTemplate(
  data: BadgeEarnedEmailData
): { subject: string; html: string } {
  const badgeConfig = BADGE_CONFIG[data.badgeType];
  const badgeName = badgeConfig.name;
  const badgeEmoji = badgeConfig.emoji;
  const badgeDescription = badgeConfig.description;

  const subject = `${badgeEmoji} ${data.studentName} earned the ${badgeName} badge on WizLingo! 🎉`;

  const whatsAppButton = data.whatsAppShareUrl
    ? `
    <tr style="margin-bottom: 15px;">
      <td style="padding: 20px; text-align: center;">
        <a href="${data.whatsAppShareUrl}" style="display: inline-block; background: #25D366; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
          📱 Share Achievement on WhatsApp
        </a>
        <p style="font-size: 12px; color: #666; margin-top: 8px;">One click to share with family & friends</p>
      </td>
    </tr>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f5f5f5;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background: white;
        border-radius: 8px;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 40px 30px;
        border-radius: 8px 8px 0 0;
        text-align: center;
        margin-bottom: 0;
      }
      .header h1 {
        margin: 0;
        font-size: 32px;
        font-weight: bold;
      }
      .header p {
        margin: 10px 0 0 0;
        font-size: 16px;
        opacity: 0.95;
      }
      .badge-hero {
        background: linear-gradient(135deg, #f5f7ff 0%, #e8ecff 100%);
        padding: 40px 30px;
        text-align: center;
        border-bottom: 2px solid #e0e0e0;
      }
      .badge-emoji {
        font-size: 120px;
        margin: 20px 0;
        display: inline-block;
        animation: bounce 2s infinite;
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .badge-title {
        font-size: 28px;
        font-weight: bold;
        color: #333;
        margin: 15px 0;
      }
      .badge-subtitle {
        font-size: 16px;
        color: #666;
        margin: 0;
      }
      .content {
        padding: 30px;
      }
      .achievement-description {
        background: #f0f4ff;
        padding: 20px;
        border-left: 4px solid #667eea;
        border-radius: 4px;
        margin-bottom: 25px;
      }
      .achievement-description strong {
        display: block;
        color: #667eea;
        margin-bottom: 8px;
        font-size: 14px;
        text-transform: uppercase;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 15px;
        margin: 30px 0;
      }
      .stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        color: white;
      }
      .stat-value {
        font-size: 28px;
        font-weight: bold;
        margin: 0;
      }
      .stat-label {
        font-size: 12px;
        opacity: 0.9;
        margin: 5px 0 0 0;
      }
      .school-info {
        background: #fffacd;
        padding: 15px;
        border-radius: 4px;
        text-align: center;
        margin: 20px 0;
        font-size: 14px;
        color: #333;
      }
      .school-info strong {
        display: block;
        color: #f59e0b;
        font-size: 16px;
        margin-bottom: 5px;
      }
      .cta-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin: 30px 0;
      }
      .cta-button {
        display: block;
        text-align: center;
        padding: 14px 20px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
        font-size: 14px;
        transition: transform 0.2s;
      }
      .cta-button:hover {
        transform: translateY(-2px);
      }
      .btn-primary {
        background: #667eea;
        color: white;
      }
      .btn-secondary {
        background: #f0f4ff;
        color: #667eea;
        border: 2px solid #667eea;
      }
      .whatsapp-button {
        grid-column: 1 / -1;
        background: #25D366 !important;
        color: white !important;
        padding: 16px 20px !important;
        font-size: 16px !important;
      }
      .footer {
        text-align: center;
        color: #999;
        font-size: 12px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
      }
      .footer a {
        color: #667eea;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎉 Achievement Unlocked!</h1>
        <p>${data.studentName} just earned a badge</p>
      </div>

      <div class="badge-hero">
        <div class="badge-emoji">${badgeEmoji}</div>
        <div class="badge-title">${badgeName} Badge</div>
        <div class="badge-subtitle">Your child is a ${badgeName}!</div>
      </div>

      <div class="content">
        <div class="achievement-description">
          <strong>What it means</strong>
          <p>${badgeDescription}</p>
        </div>

        ${
          data.accuracy !== undefined ||
          data.fluency !== undefined ||
          data.sessionCount !== undefined
            ? `
        <div class="stats-grid">
          ${
            data.accuracy !== undefined
              ? `
          <div class="stat-card">
            <div class="stat-value">${data.accuracy}%</div>
            <div class="stat-label">Reading Accuracy</div>
          </div>
          `
              : ""
          }
          ${
            data.fluency !== undefined
              ? `
          <div class="stat-card">
            <div class="stat-value">${data.fluency}%</div>
            <div class="stat-label">Fluency Score</div>
          </div>
          `
              : ""
          }
          ${
            data.sessionCount !== undefined
              ? `
          <div class="stat-card">
            <div class="stat-value">${data.sessionCount}</div>
            <div class="stat-label">Sessions</div>
          </div>
          `
              : ""
          }
        </div>
        `
            : ""
        }

        ${
          data.rank !== undefined
            ? `
        <div class="school-info">
          <strong>Achievement Position</strong>
          Ranked #${data.rank} in ${data.schoolName}
        </div>
        `
            : ""
        }

        <div class="cta-buttons">
          ${
            data.certificateUrl
              ? `<a href="${data.certificateUrl}" class="cta-button btn-primary">📜 View Certificate</a>`
              : ""
          }
          <a href="${data.dashboardUrl}" class="cta-button btn-primary">📊 View Dashboard</a>
          ${
            data.whatsAppShareUrl
              ? `<a href="${data.whatsAppShareUrl}" class="cta-button whatsapp-button">📱 Share on WhatsApp</a>`
              : ""
          }
        </div>

        <p style="text-align: center; color: #666; margin-top: 25px;">
          Keep celebrating their progress! Every achievement on WizLingo is a step toward becoming a Language Wizard. 🧙‍♂️
        </p>
      </div>

      <div class="footer">
        <p>WizLingo - AI-Powered Reading & Speaking Platform</p>
        <p style="margin: 5px 0;">For schools in India</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://wizlingo.com"}/parent/email-preferences">Manage Email Preferences</a></p>
      </div>
    </div>
  </body>
</html>
  `;

  return { subject, html };
}

// TEMPLATE 2: Weekly Progress Email
export function weeklyProgressParentTemplate(
  data: WeeklyProgressEmailData
): { subject: string; html: string } {
  const subject = `📊 ${data.studentName}'s learning progress this week`;

  const badgesHtml = data.badgesEarned
    .map((b) => `<li style="margin: 8px 0;">${b.emoji} ${b.name}</li>`)
    .join("");

  const accuracyImprovement = data.accuracyNow - data.accuracyThen;
  const fluencyImprovement = data.fluencyNow - data.fluencyThen;

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f5f5f5;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background: white;
        border-radius: 8px;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        border-radius: 8px 8px 0 0;
        text-align: center;
        margin-bottom: 0;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
      }
      .content {
        padding: 30px;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 25px;
      }
      .stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 8px;
        color: white;
        text-align: center;
      }
      .stat-value {
        font-size: 32px;
        font-weight: bold;
        margin: 0;
      }
      .stat-label {
        font-size: 13px;
        opacity: 0.9;
        margin: 5px 0 0 0;
      }
      .progress-section {
        background: #f0f4ff;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        border-left: 4px solid #667eea;
      }
      .progress-section h3 {
        margin: 0 0 15px 0;
        color: #667eea;
      }
      .progress-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid #e0e0e0;
      }
      .progress-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }
      .progress-label {
        font-size: 14px;
        color: #666;
      }
      .progress-value {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }
      .progress-improvement {
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
        margin-left: 10px;
      }
      .improvement-positive {
        background: #dcfce7;
        color: #15803d;
      }
      .improvement-neutral {
        background: #fef3c7;
        color: #b45309;
      }
      .badges-section {
        background: #fff3cd;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        border-left: 4px solid #f59e0b;
      }
      .badges-section h3 {
        margin: 0 0 15px 0;
        color: #f59e0b;
      }
      .badges-section ul {
        margin: 0;
        padding-left: 0;
        list-style: none;
      }
      .next-challenge {
        background: #ecfdf5;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #059669;
        margin-bottom: 20px;
      }
      .next-challenge h3 {
        margin: 0 0 10px 0;
        color: #059669;
      }
      .cta-button {
        display: inline-block;
        background: #667eea;
        color: white;
        padding: 14px 32px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        color: #999;
        font-size: 12px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>📊 Weekly Progress Report</h1>
        <p>Here's how ${data.studentName} is doing this week</p>
      </div>

      <div class="content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${data.sessionsCompleted}</div>
            <div class="stat-label">Sessions Completed</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.badgesEarned.length}</div>
            <div class="stat-label">Badges Earned</div>
          </div>
        </div>

        <div class="progress-section">
          <h3>📈 Skill Progress</h3>
          <div class="progress-item">
            <div>
              <div class="progress-label">Reading Accuracy</div>
              <div class="progress-value">${data.accuracyThen}% → ${data.accuracyNow}%</div>
            </div>
            <span class="progress-improvement ${accuracyImprovement >= 0 ? "improvement-positive" : "improvement-neutral"}">
              ${accuracyImprovement >= 0 ? "+" : ""}${accuracyImprovement}%
            </span>
          </div>
          <div class="progress-item">
            <div>
              <div class="progress-label">Fluency Score</div>
              <div class="progress-value">${data.fluencyThen}% → ${data.fluencyNow}%</div>
            </div>
            <span class="progress-improvement ${fluencyImprovement >= 0 ? "improvement-positive" : "improvement-neutral"}">
              ${fluencyImprovement >= 0 ? "+" : ""}${fluencyImprovement}%
            </span>
          </div>
        </div>

        ${
          data.badgesEarned.length > 0
            ? `
        <div class="badges-section">
          <h3>🎉 Badges Earned This Week</h3>
          <ul>
            ${badgesHtml}
          </ul>
        </div>
        `
            : ""
        }

        ${
          data.nextBadgeTarget
            ? `
        <div class="next-challenge">
          <h3>🎯 Next Challenge</h3>
          <p>${data.nextBadgeTarget}</p>
        </div>
        `
            : ""
        }

        <div style="text-align: center;">
          <a href="${data.dashboardUrl}" class="cta-button">View Full Dashboard</a>
        </div>

        <p style="text-align: center; color: #666; margin-top: 20px;">
          Keep encouraging ${data.studentName}! They're making fantastic progress. 🌟
        </p>
      </div>

      <div class="footer">
        <p>WizLingo - AI-Powered Reading & Speaking Platform</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://wizlingo.com"}/parent/email-preferences" style="color: #667eea;">Manage Email Preferences</a></p>
      </div>
    </div>
  </body>
</html>
  `;

  return { subject, html };
}

// TEMPLATE 3: Monthly Achievement Summary
export function monthlyAchievementParentTemplate(
  data: MonthlyAchievementEmailData
): { subject: string; html: string } {
  const subject = `🌟 ${data.studentName} is a Language Star! See their amazing progress`;

  const badgesHtml = data.badgesEarnedThisMonth
    .map((b) => `<li style="margin: 8px 0;">${b.emoji} ${b.name}</li>`)
    .join("");

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f5f5f5;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background: white;
        border-radius: 8px;
      }
      .header {
        background: linear-gradient(135deg, #f5af19 0%, #f12711 100%);
        color: white;
        padding: 40px 30px;
        border-radius: 8px 8px 0 0;
        text-align: center;
        margin-bottom: 0;
      }
      .header h1 {
        margin: 0;
        font-size: 32px;
        font-weight: bold;
      }
      .header p {
        margin: 10px 0 0 0;
        opacity: 0.95;
      }
      .content {
        padding: 30px;
      }
      .hero-section {
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        padding: 30px;
        border-radius: 8px;
        text-align: center;
        margin-bottom: 25px;
      }
      .hero-section h2 {
        margin: 0;
        font-size: 28px;
        color: #333;
      }
      .hero-section p {
        margin: 10px 0 0 0;
        color: #666;
      }
      .month-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 25px;
      }
      .stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 8px;
        color: white;
        text-align: center;
      }
      .stat-value {
        font-size: 32px;
        font-weight: bold;
        margin: 0;
      }
      .stat-label {
        font-size: 13px;
        opacity: 0.9;
        margin: 5px 0 0 0;
      }
      .rank-card {
        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        margin-bottom: 25px;
        border: 2px solid #f59e0b;
      }
      .rank-card h3 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 16px;
      }
      .rank-display {
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
      .rank-item {
        text-align: center;
      }
      .rank-emoji {
        font-size: 40px;
        margin-bottom: 5px;
      }
      .rank-number {
        font-size: 24px;
        font-weight: bold;
        color: #333;
      }
      .rank-label {
        font-size: 12px;
        color: #666;
      }
      .growth-card {
        background: #dcfce7;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 25px;
        border-left: 4px solid #15803d;
      }
      .growth-card h3 {
        margin: 0 0 10px 0;
        color: #15803d;
      }
      .growth-percentage {
        font-size: 28px;
        font-weight: bold;
        color: #15803d;
        margin: 10px 0;
      }
      .badges-section {
        background: #fff3cd;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 25px;
        border-left: 4px solid #f59e0b;
      }
      .badges-section h3 {
        margin: 0 0 15px 0;
        color: #f59e0b;
      }
      .badges-section ul {
        margin: 0;
        padding-left: 0;
        list-style: none;
      }
      .story-section {
        background: #f0f4ff;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 25px;
        border-left: 4px solid #667eea;
      }
      .story-section h3 {
        margin: 0 0 10px 0;
        color: #667eea;
      }
      .cta-button {
        display: inline-block;
        background: #f12711;
        color: white;
        padding: 14px 32px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
        margin: 20px auto;
        display: block;
        text-align: center;
      }
      .footer {
        text-align: center;
        color: #999;
        font-size: 12px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🌟 Monthly Achievement Summary</h1>
      </div>

      <div class="content">
        <div class="hero-section">
          <h2>${data.studentName} is Rising! 🚀</h2>
          <p>See their incredible progress this month</p>
        </div>

        <div class="month-stats">
          <div class="stat-card">
            <div class="stat-value">${data.badgesEarnedThisMonth.length}</div>
            <div class="stat-label">Badges Earned</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">#${data.rank}</div>
            <div class="stat-label">School Rank</div>
          </div>
        </div>

        <div class="rank-card">
          <h3>Achievement Position in School</h3>
          <div class="rank-display">
            <div class="rank-item">
              <div class="rank-emoji">📊</div>
              <div class="rank-number">#${data.rank}</div>
              <div class="rank-label">in school</div>
            </div>
            <div style="font-size: 24px; color: #999;">•</div>
            <div class="rank-item">
              <div class="rank-emoji">👥</div>
              <div class="rank-number">${data.totalStudentsInSchool}</div>
              <div class="rank-label">total students</div>
            </div>
          </div>
        </div>

        <div class="growth-card">
          <h3>🎯 Monthly Growth</h3>
          <div class="growth-percentage">+${data.growthPercentage}%</div>
          <p style="margin: 0;">Compared to last month</p>
        </div>

        ${
          data.badgesEarnedThisMonth.length > 0
            ? `
        <div class="badges-section">
          <h3>🎉 All Badges Earned This Month</h3>
          <ul>
            ${badgesHtml}
          </ul>
        </div>
        `
            : ""
        }

        ${
          data.topAchievementStory
            ? `
        <div class="story-section">
          <h3>✨ Top Achievement Story</h3>
          <p>${data.topAchievementStory}</p>
        </div>
        `
            : ""
        }

        <div style="text-align: center;">
          <a href="${data.dashboardUrl}" class="cta-button">📊 View Full Dashboard</a>
        </div>

        <p style="text-align: center; color: #666; margin-top: 20px;">
          Your consistent support is making all the difference. Keep celebrating their wins! 🎉
        </p>
      </div>

      <div class="footer">
        <p>WizLingo - AI-Powered Reading & Speaking Platform</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://wizlingo.com"}/parent/email-preferences" style="color: #667eea;">Manage Email Preferences</a></p>
      </div>
    </div>
  </body>
</html>
  `;

  return { subject, html };
}

// TEMPLATE 4: Milestone Celebration (5 badges)
export function milestoneParentTemplate(
  data: MilestoneEmailData
): { subject: string; html: string } {
  const subject = `🏆 ${data.studentName} earned their ${data.badgeCount} badge! Major milestone!`;

  const badgesHtml = data.allBadges
    .map((b) => `<li style="margin: 8px 0;">${b.emoji} ${b.name}</li>`)
    .join("");

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f5f5f5;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background: white;
        border-radius: 8px;
      }
      .header {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 40px 30px;
        border-radius: 8px 8px 0 0;
        text-align: center;
        margin-bottom: 0;
      }
      .header h1 {
        margin: 0;
        font-size: 32px;
        font-weight: bold;
      }
      .content {
        padding: 30px;
      }
      .milestone-hero {
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        padding: 40px 30px;
        border-radius: 8px;
        text-align: center;
        margin-bottom: 25px;
      }
      .milestone-number {
        font-size: 96px;
        font-weight: bold;
        color: #f5576c;
        margin: 0;
        line-height: 1;
      }
      .milestone-text {
        font-size: 18px;
        color: #333;
        margin: 15px 0 0 0;
      }
      .celebration-message {
        background: #fff3cd;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 25px;
        border-left: 4px solid #f59e0b;
        text-align: center;
      }
      .celebration-message p {
        margin: 0;
        font-size: 16px;
        color: #333;
      }
      .badges-collection {
        background: #f0f4ff;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 25px;
        border-left: 4px solid #667eea;
      }
      .badges-collection h3 {
        margin: 0 0 15px 0;
        color: #667eea;
      }
      .badges-collection ul {
        margin: 0;
        padding-left: 0;
        list-style: none;
      }
      .achievement-club {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 25px;
        border-radius: 8px;
        text-align: center;
        margin-bottom: 25px;
      }
      .achievement-club h3 {
        margin: 0 0 10px 0;
        font-size: 20px;
      }
      .achievement-club p {
        margin: 5px 0;
      }
      .cta-button {
        display: inline-block;
        background: #f5576c;
        color: white;
        padding: 14px 32px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
        margin: 20px auto;
        display: block;
        text-align: center;
      }
      .footer {
        text-align: center;
        color: #999;
        font-size: 12px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🏆 MILESTONE ACHIEVED!</h1>
      </div>

      <div class="content">
        <div class="milestone-hero">
          <div class="milestone-number">${data.badgeCount}</div>
          <div class="milestone-text">BADGES EARNED!</div>
        </div>

        <div class="celebration-message">
          <p style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
            🎉 Congratulations, ${data.studentName}! 🎉
          </p>
          <p>You've reached an incredible milestone!</p>
          <p>${data.congratulations}</p>
        </div>

        <div class="badges-collection">
          <h3>✨ All Badges Earned</h3>
          <ul>
            ${badgesHtml}
          </ul>
        </div>

        <div class="achievement-club">
          <h3>Welcome to the Achievements Club! 🎓</h3>
          <p>Your child has joined an exclusive group of high-achievers on WizLingo</p>
          <p>This shows dedication, hard work, and remarkable growth</p>
        </div>

        <div style="text-align: center;">
          <a href="${data.dashboardUrl}" class="cta-button">📊 View All Achievements</a>
        </div>

        <p style="text-align: center; color: #666; margin-top: 20px;">
          The journey continues! Help them reach even greater heights. 🚀
        </p>
      </div>

      <div class="footer">
        <p>WizLingo - AI-Powered Reading & Speaking Platform</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://wizlingo.com"}/parent/email-preferences" style="color: #667eea;">Manage Email Preferences</a></p>
      </div>
    </div>
  </body>
</html>
  `;

  return { subject, html };
}

// TEMPLATE 5: School Ranking Notification
export function schoolRankingTemplate(
  data: SchoolRankingEmailData
): { subject: string; html: string } {
  const subject = `📚 ${data.schoolName} is Rising! ${data.totalAchievingStudents} students achieving on WizLingo`;

  const successStoriesHtml = data.successStories
    .map((s) => `<li style="margin: 10px 0;"><strong>${s.studentName}:</strong> ${s.achievement}</li>`)
    .join("");

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f5f5f5;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background: white;
        border-radius: 8px;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 40px 30px;
        border-radius: 8px 8px 0 0;
        text-align: center;
        margin-bottom: 0;
      }
      .header h1 {
        margin: 0;
        font-size: 32px;
        font-weight: bold;
      }
      .content {
        padding: 30px;
      }
      .school-hero {
        background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
        padding: 40px 30px;
        border-radius: 8px;
        text-align: center;
        margin-bottom: 25px;
      }
      .school-name {
        font-size: 28px;
        font-weight: bold;
        color: #333;
        margin: 0;
      }
      .school-tagline {
        font-size: 16px;
        color: #666;
        margin: 10px 0 0 0;
      }
      .achievement-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 25px;
      }
      .stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 25px;
        border-radius: 8px;
        color: white;
        text-align: center;
      }
      .stat-value {
        font-size: 40px;
        font-weight: bold;
        margin: 0;
      }
      .stat-label {
        font-size: 13px;
        opacity: 0.9;
        margin: 10px 0 0 0;
      }
      .rank-card {
        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
        padding: 25px;
        border-radius: 8px;
        text-align: center;
        margin-bottom: 25px;
      }
      .rank-emoji {
        font-size: 48px;
        margin-bottom: 10px;
      }
      .rank-text {
        font-size: 18px;
        color: #333;
        margin: 0;
      }
      .rank-subtext {
        font-size: 14px;
        color: #666;
        margin: 5px 0 0 0;
      }
      .stories-section {
        background: #f0f4ff;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 25px;
        border-left: 4px solid #667eea;
      }
      .stories-section h3 {
        margin: 0 0 15px 0;
        color: #667eea;
      }
      .stories-section ul {
        margin: 0;
        padding-left: 0;
        list-style: none;
      }
      .message-section {
        background: #ecfdf5;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 25px;
        border-left: 4px solid #059669;
      }
      .message-section h3 {
        margin: 0 0 10px 0;
        color: #059669;
      }
      .cta-button {
        display: inline-block;
        background: #667eea;
        color: white;
        padding: 14px 32px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
        margin: 20px auto;
        display: block;
        text-align: center;
      }
      .footer {
        text-align: center;
        color: #999;
        font-size: 12px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>📚 Your School is Rising!</h1>
      </div>

      <div class="content">
        <div class="school-hero">
          <div class="school-name">${data.schoolName}</div>
          <div class="school-tagline">Leading the way in AI-powered learning</div>
        </div>

        <div class="achievement-stats">
          <div class="stat-card">
            <div class="stat-value">${data.totalAchievingStudents}</div>
            <div class="stat-label">Students Achieving</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">#${data.schoolRank}</div>
            <div class="stat-label">Ranked Among Schools</div>
          </div>
        </div>

        <div class="rank-card">
          <div class="rank-emoji">🏆</div>
          <div class="rank-text">Ranked #${data.schoolRank} out of ${data.totalSchools} schools</div>
          <div class="rank-subtext">Your school's commitment to excellence is paying off!</div>
        </div>

        ${
          data.successStories.length > 0
            ? `
        <div class="stories-section">
          <h3>✨ Success Stories</h3>
          <ul>
            ${successStoriesHtml}
          </ul>
        </div>
        `
            : ""
        }

        <div class="message-section">
          <h3>🎓 What's Next?</h3>
          <p>Your school is building a culture of excellence. Every parent who sees their child's achievement is becoming an ambassador for WizLingo.</p>
          <p>Help us spread the word and inspire more families to join the learning revolution!</p>
        </div>

        <div style="text-align: center;">
          <a href="${data.dashboardUrl}" class="cta-button">📊 View School Dashboard</a>
        </div>

        <p style="text-align: center; color: #666; margin-top: 20px;">
          Together, we're transforming education. Keep up the amazing work! 🚀
        </p>
      </div>

      <div class="footer">
        <p>WizLingo - AI-Powered Reading & Speaking Platform</p>
        <p>For schools in India</p>
      </div>
    </div>
  </body>
</html>
  `;

  return { subject, html };
}
