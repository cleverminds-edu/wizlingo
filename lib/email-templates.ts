// Email template utilities for sending congratulatory and progress emails

interface BadgeEarnedStudentTemplateData {
  studentName: string;
  badgeType: string;
  badgeEmoji: string;
  stats: {
    accuracy: number;
    wpm: number;
    duration: number;
  };
  dashboardUrl: string;
}

interface BadgeEarnedParentTemplateData {
  parentName: string;
  studentName: string;
  badgeType: string;
  badgeEmoji: string;
  description: string;
  progressUrl: string;
}

interface MilestoneEmailData {
  parentName: string;
  studentName: string;
  count: number;
  dashboardUrl: string;
}

interface WeeklySummaryEmailData {
  parentName: string;
  studentName: string;
  sessionsCompleted: number;
  badgesEarned: Array<{ emoji: string; name: string }>;
  accuracyImprovement: {
    from: number;
    to: number;
  };
  nextChallenge?: string;
  dashboardUrl: string;
}

interface LeaderboardEmailData {
  parentName: string;
  studentName: string;
  rank: number;
  totalStudents: number;
  topStudents: Array<{
    name: string;
    badgeCount: number;
    rank: number;
  }>;
  leaderboardUrl: string;
}

// Badge Earned Email for Student
export function badgeEarnedStudentTemplate(
  data: BadgeEarnedStudentTemplateData
): { subject: string; html: string } {
  const subject = `🎉 You earned the ${data.badgeEmoji} ${data.badgeType} badge!`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; }
          .badge-section { text-align: center; padding: 30px; background: #f8f9ff; border-radius: 8px; margin-bottom: 30px; }
          .badge-emoji { font-size: 80px; margin: 20px 0; }
          .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 25px; }
          .stat { background: white; padding: 15px; border-radius: 6px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
          .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
          .next-challenge { background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 30px; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; font-weight: bold; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Congratulations ${data.studentName}!</h1>
            <p>You just earned a new badge</p>
          </div>

          <div class="badge-section">
            <div class="badge-emoji">${data.badgeEmoji}</div>
            <h2>${data.badgeType} Badge</h2>
            <p>You completed your first reading session on WizLingo. That took courage, and we're proud of you!</p>

            <div class="stats">
              <div class="stat">
                <div class="stat-value">${data.stats.accuracy}%</div>
                <div class="stat-label">Reading Accuracy</div>
              </div>
              <div class="stat">
                <div class="stat-value">${data.stats.wpm}</div>
                <div class="stat-label">Words Per Min</div>
              </div>
              <div class="stat">
                <div class="stat-value">${data.stats.duration}m</div>
                <div class="stat-label">Time</div>
              </div>
            </div>
          </div>

          <div class="next-challenge">
            <strong>🚀 Next Challenge:</strong>
            <p>Achieve 80%+ accuracy to become a WORD WIZARD!</p>
          </div>

          <div style="text-align: center;">
            <a href="${data.dashboardUrl}" class="cta-button">View Your Progress</a>
          </div>

          <div class="footer">
            <p>Keep up the amazing work on WizLingo!</p>
            <p>&copy; WizLingo - Learning Excellence</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}

// Badge Earned Email for Parent
export function badgeEarnedParentTemplate(
  data: BadgeEarnedParentTemplateData
): { subject: string; html: string } {
  const subject = `${data.badgeEmoji} Your child earned a badge on WizLingo!`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .achievement { background: #f0f4ff; padding: 25px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #667eea; }
          .achievement-emoji { font-size: 60px; margin-bottom: 15px; }
          .action-items { background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .action-items ul { margin: 10px 0; padding-left: 20px; }
          .action-items li { margin: 10px 0; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Achievement Unlocked! 🎉</h1>
            <p>${data.studentName} just earned a badge</p>
          </div>

          <div class="achievement">
            <div class="achievement-emoji">${data.badgeEmoji}</div>
            <h2>${data.badgeType} Badge</h2>
            <p><strong>${data.studentName}</strong> just earned the <strong>${data.badgeType}</strong> badge on WizLingo!</p>
            <p>${data.description}</p>
          </div>

          <div class="action-items">
            <strong>What you can do:</strong>
            <ul>
              <li>✅ Celebrate with them!</li>
              <li>✅ Encourage more reading sessions</li>
              <li>✅ Check their progress dashboard</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${data.progressUrl}" class="cta-button">View Progress</a>
          </div>

          <div class="footer">
            <p>WizLingo - AI-Powered Reading & Speaking Platform</p>
            <p>&copy; 2026 WizLingo. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}

// Milestone Email (5, 10, 15, 20 badges)
export function milestoneTemplate(
  data: MilestoneEmailData
): { subject: string; html: string } {
  const subject = `🏆 Milestone: ${data.studentName} earned ${data.count} badges!`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 32px; }
          .milestone { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
          .milestone-number { font-size: 64px; font-weight: bold; color: #f5576c; }
          .cta-button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 Congratulations!</h1>
          </div>

          <div class="milestone">
            <div class="milestone-number">${data.count}</div>
            <h2>Badges Earned!</h2>
            <p>
              <strong>${data.studentName}</strong> has reached a major milestone!
              <br/>With ${data.count} badges earned, they are building incredible reading and speaking skills!
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <p>Keep this momentum going! Your child is making fantastic progress.</p>
            <a href="${data.dashboardUrl}" class="cta-button">View Dashboard</a>
          </div>

          <div class="footer">
            <p>&copy; WizLingo - Celebrating Learning Excellence</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}

// Weekly Summary Email
export function weeklySummaryTemplate(
  data: WeeklySummaryEmailData
): { subject: string; html: string } {
  const subject = `📊 ${data.studentName}'s Weekly Progress on WizLingo`;

  const badgesHtml = data.badgesEarned
    .map((badge) => `<li>${badge.emoji} ${badge.name}</li>`)
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
          .stat-card { background: #f0f4ff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
          .stat-value { font-size: 28px; font-weight: bold; color: #667eea; }
          .stat-label { font-size: 13px; color: #666; margin-top: 5px; }
          .badges-section { background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .badges-section ul { margin: 10px 0; padding-left: 20px; }
          .badges-section li { margin: 8px 0; }
          .progress-bar { background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden; margin: 10px 0; }
          .progress-fill { background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; transition: width 0.3s ease; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Weekly Progress Report 📊</h1>
            <p>Here's how ${data.studentName} is doing this week</p>
          </div>

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

          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3>📈 Accuracy Progress</h3>
            <p>From <strong>${data.accuracyImprovement.from}%</strong> → <strong>${data.accuracyImprovement.to}%</strong></p>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${data.accuracyImprovement.to}%;"></div>
            </div>
          </div>

          ${
            data.badgesEarned.length > 0
              ? `
          <div class="badges-section">
            <h3>🎉 Badges Earned This Week:</h3>
            <ul>
              ${badgesHtml}
            </ul>
          </div>
          `
              : ""
          }

          ${
            data.nextChallenge
              ? `
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #059669;">
            <h3>🎯 Next Challenge</h3>
            <p>${data.nextChallenge}</p>
          </div>
          `
              : ""
          }

          <div style="text-align: center;">
            <a href="${data.dashboardUrl}" class="cta-button">View Full Dashboard</a>
          </div>

          <div class="footer">
            <p>Keep encouraging ${data.studentName}! They're making great progress!</p>
            <p>&copy; WizLingo - Learning Excellence</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}

// Leaderboard Update Email
export function leaderboardTemplate(
  data: LeaderboardEmailData
): { subject: string; html: string } {
  const subject = `🏅 Leaderboard Update: ${data.studentName} is ranked #${data.rank}`;

  const topStudentsHtml = data.topStudents
    .map(
      (student) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">#${student.rank}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${student.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${student.badgeCount} badges</td>
    </tr>
  `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; }
          .rank-card { background: linear-gradient(135deg, #fffacd 0%, #ffd700 100%); padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
          .rank-badge { font-size: 48px; margin: 10px 0; }
          .rank-text { font-size: 18px; font-weight: bold; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          table th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
          .cta-button { display: inline-block; background: #f12711; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏅 Leaderboard Update</h1>
          </div>

          <div class="rank-card">
            <div class="rank-badge">🏆</div>
            <div class="rank-text">${data.studentName}</div>
            <div style="font-size: 32px; font-weight: bold; color: #f12711; margin: 10px 0;">#${data.rank}</div>
            <p>out of ${data.totalStudents} students</p>
          </div>

          <h3>Top 10 Performers</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 20%;">Rank</th>
                <th style="width: 50%;">Student</th>
                <th style="width: 30%;">Badges</th>
              </tr>
            </thead>
            <tbody>
              ${topStudentsHtml}
            </tbody>
          </table>

          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <p>Keep earning badges to climb the leaderboard! Every badge gets you closer to the top.</p>
          </div>

          <div style="text-align: center;">
            <a href="${data.leaderboardUrl}" class="cta-button">View Leaderboard</a>
          </div>

          <div class="footer">
            <p>Friendly competition drives learning! Keep pushing to the top.</p>
            <p>&copy; WizLingo - Learning Excellence</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}
