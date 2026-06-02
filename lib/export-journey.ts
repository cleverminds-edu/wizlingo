import { prisma } from "@/lib/prisma";
import { BADGE_CONFIG } from "@/lib/badge-system";

/**
 * Generate a shareable code for the student's journey
 * Can be used to create a public link like: /shared-journey/[shareCode]
 */
export async function generateShareCode(studentId: string): Promise<string> {
  const code = Math.random().toString(36).substring(2, 15).toUpperCase();

  // TODO: Store share code in database for tracking
  // For now, just return the code
  return code;
}

/**
 * Export journey timeline as JSON
 */
export async function exportTimelineAsJSON(studentId: string): Promise<object> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        badges: {
          orderBy: { earnedAt: "asc" },
        },
        sessions: {
          where: { status: "COMPLETED" },
          select: {
            id: true,
            completedAt: true,
            accuracy: true,
            wpm: true,
            durationSec: true,
          },
          orderBy: { completedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!student) throw new Error("Student not found");

    const badgesWithDetails = student.badges.map((badge) => {
      const config = BADGE_CONFIG[badge.type];
      return {
        type: badge.type,
        name: config.name,
        emoji: config.emoji,
        earnedAt: badge.earnedAt.toISOString(),
        description: config.description,
      };
    });

    return {
      student: {
        id: student.id,
        name: student.name,
      },
      journey: {
        totalBadges: student.badges.length,
        badges: badgesWithDetails,
        recentSessions: student.sessions.map((session) => ({
          completedAt: session.completedAt?.toISOString(),
          accuracy: session.accuracy,
          wpm: session.wpm,
          duration: Math.round((session.durationSec || 0) / 60),
        })),
      },
      exportedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error exporting timeline:", error);
    throw error;
  }
}

/**
 * Generate HTML for timeline (can be saved as PNG/PDF)
 */
export async function generateTimelineHTML(studentId: string): Promise<string> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        badges: {
          orderBy: { earnedAt: "asc" },
        },
      },
    });

    if (!student) throw new Error("Student not found");

    const badgeHTML = student.badges
      .map((badge) => {
        const config = BADGE_CONFIG[badge.type];
        const dateStr = new Date(badge.earnedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return `
        <div class="badge-item" style="margin-bottom: 20px; padding: 15px; border-left: 4px solid ${config.color}; background: ${config.bgColor}; border-radius: 4px;">
          <div style="font-size: 32px; margin-bottom: 10px;">${config.emoji}</div>
          <div style="font-weight: bold; font-size: 18px; color: #333;">${config.name}</div>
          <div style="font-size: 12px; color: #666; margin-top: 5px;">Earned on ${dateStr}</div>
          <div style="font-size: 13px; color: #555; margin-top: 8px;">${config.description}</div>
        </div>
      `;
      })
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${student.name}'s Learning Journey - WizLingo</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f9f9f9;
            color: #333;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          h1 {
            text-align: center;
            color: #667eea;
            margin-bottom: 10px;
          }
          .header-info {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
          }
          .timeline {
            border-left: 3px solid #667eea;
            padding-left: 20px;
            margin-left: 10px;
          }
          .badge-item {
            position: relative;
          }
          .badge-item::before {
            content: '';
            position: absolute;
            left: -28px;
            top: 5px;
            width: 12px;
            height: 12px;
            background: #667eea;
            border-radius: 50%;
            border: 3px solid white;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🌟 ${student.name}'s Learning Journey</h1>
          <div class="header-info">
            <p>WizLingo Achievement Timeline</p>
            <p>Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
            <p>${student.badges.length} Badges Earned</p>
          </div>

          <div class="timeline">
            ${badgeHTML}
          </div>

          <div class="footer">
            <p>&copy; WizLingo - Learning Excellence</p>
            <p>Keep learning and earning badges!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  } catch (error) {
    console.error("Error generating timeline HTML:", error);
    throw error;
  }
}

/**
 * Create a certificate of achievement
 */
export async function generateAchievementCertificate(
  studentId: string,
  badgeType?: string
): Promise<string> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        badges: true,
      },
    });

    if (!student) throw new Error("Student not found");

    const certificate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate of Achievement - WizLingo</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .certificate {
            width: 1000px;
            height: 600px;
            margin: 20px auto;
            padding: 60px;
            border: 8px solid #667eea;
            border-radius: 8px;
            text-align: center;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            font-family: Georgia, serif;
            position: relative;
            overflow: hidden;
          }
          .certificate::before {
            content: '';
            position: absolute;
            top: 10px;
            right: 10px;
            width: 80px;
            height: 80px;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext x='50' y='50' font-size='80' text-anchor='middle' dominant-baseline='middle'%3E✨%3C/text%3E%3C/svg%3E");
            opacity: 0.1;
          }
          .content {
            position: relative;
            z-index: 1;
          }
          h1 {
            font-size: 48px;
            color: #667eea;
            margin: 0 0 10px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          .subtitle {
            font-size: 24px;
            color: #764ba2;
            margin-bottom: 30px;
          }
          .badge-count {
            font-size: 64px;
            color: #f5576c;
            font-weight: bold;
            margin: 20px 0;
          }
          .student-name {
            font-size: 32px;
            color: #333;
            font-weight: bold;
            margin: 30px 0;
            font-family: 'Lucida Calligraphy', cursive;
          }
          .achievement-text {
            font-size: 16px;
            color: #555;
            margin: 20px 0;
            font-style: italic;
          }
          .date {
            font-size: 14px;
            color: #777;
            margin-top: 30px;
          }
          .signature {
            margin-top: 40px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="content">
            <h1>Certificate of Achievement</h1>
            <div class="subtitle">🌟 WizLingo 🌟</div>

            <div class="badge-count">${student.badges.length}</div>
            <p class="achievement-text">Badges Earned</p>

            <div class="student-name">${student.name}</div>

            <div class="achievement-text">
              This certificate is awarded to recognize the outstanding achievement in<br/>
              English Language Learning through WizLingo's AI-powered platform.
            </div>

            <div class="achievement-text">
              Your dedication, consistency, and hard work have earned you<br/>
              ${student.badges.length} badges in reading and speaking excellence.
            </div>

            <div class="date">
              Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>

            <div class="signature">
              <p>___________________</p>
              <p>WizLingo Team</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return certificate;
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  }
}
