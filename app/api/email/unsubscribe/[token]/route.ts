// Safe unsubscribe endpoint using token
// Allows parents to unsubscribe or modify preferences without exposing email

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;
  const action = request.nextUrl.searchParams.get("action") || "view";

  try {
    // Find parent by unsubscribe token
    const prefs = await prisma.parentEmailPreference.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!prefs) {
      return NextResponse.json(
        { error: "Invalid unsubscribe token" },
        { status: 404 }
      );
    }

    if (action === "unsubscribe") {
      // Mark as unsubscribed
      await prisma.parentEmailPreference.update({
        where: { unsubscribeToken: token },
        data: {
          unsubscribedAt: new Date(),
        },
      });

      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 40px 20px;
                text-align: center;
                background: #f5f5f5;
              }
              .container {
                max-width: 500px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                border-radius: 8px;
              }
              h1 {
                color: #333;
                margin-bottom: 10px;
              }
              p {
                color: #666;
                line-height: 1.6;
              }
              .success {
                color: #059669;
                background: #dcfce7;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
              }
              a {
                color: #667eea;
                text-decoration: none;
                margin-top: 20px;
                display: inline-block;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✓ Unsubscribed</h1>
              <div class="success">
                You have been unsubscribed from WizLingo emails.
              </div>
              <p>We'll miss you! If you change your mind, you can resubscribe anytime.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/parent/email-preferences">Manage Preferences</a>
            </div>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        }
      );
    }

    if (action === "preferences") {
      // Redirect to preferences page (would need authentication)
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 40px 20px;
                text-align: center;
                background: #f5f5f5;
              }
              .container {
                max-width: 500px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                border-radius: 8px;
              }
              h1 {
                color: #333;
                margin-bottom: 10px;
              }
              p {
                color: #666;
                line-height: 1.6;
                margin-bottom: 20px;
              }
              .prefs {
                background: #f0f4ff;
                padding: 20px;
                border-radius: 6px;
                text-align: left;
                margin: 20px 0;
              }
              .pref-item {
                display: flex;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #e0e0e0;
              }
              .pref-item:last-child {
                border-bottom: none;
              }
              input[type="checkbox"] {
                margin-right: 10px;
                width: 18px;
                height: 18px;
              }
              label {
                cursor: pointer;
                flex: 1;
              }
              button {
                background: #667eea;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
              }
              button:hover {
                background: #764ba2;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>📧 Email Preferences</h1>
              <p>Customize which types of emails you'd like to receive from WizLingo:</p>

              <form method="POST">
                <div class="prefs">
                  <div class="pref-item">
                    <input type="checkbox" id="badge" name="badge" checked>
                    <label for="badge">Badge earned notifications</label>
                  </div>
                  <div class="pref-item">
                    <input type="checkbox" id="weekly" name="weekly" checked>
                    <label for="weekly">Weekly progress reports</label>
                  </div>
                  <div class="pref-item">
                    <input type="checkbox" id="monthly" name="monthly" checked>
                    <label for="monthly">Monthly achievement summaries</label>
                  </div>
                  <div class="pref-item">
                    <input type="checkbox" id="school" name="school" checked>
                    <label for="school">School ranking updates</label>
                  </div>
                </div>

                <button type="submit">Save Preferences</button>
              </form>

              <p style="margin-top: 20px; color: #999; font-size: 12px;">
                We'll only send you emails based on your preferences.
              </p>
            </div>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        }
      );
    }

    // Default: show current status
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px 20px;
              text-align: center;
              background: #f5f5f5;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 8px;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              line-height: 1.6;
            }
            .button-group {
              margin-top: 30px;
              display: flex;
              gap: 10px;
              justify-content: center;
            }
            a {
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: bold;
              display: inline-block;
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
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📧 Email Management</h1>
            <p>You are subscribed to WizLingo parent emails.</p>
            <p>You can manage your email preferences or unsubscribe below.</p>

            <div class="button-group">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/parent/email-preferences?token=${token}" class="btn-primary">
                Manage Preferences
              </a>
              <a href="?action=unsubscribe" class="btn-secondary">
                Unsubscribe
              </a>
            </div>

            <p style="margin-top: 30px; color: #999; font-size: 12px;">
              You can change your mind anytime. We'll continue to send updates about your child's progress.
            </p>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      }
    );
  } catch (error) {
    console.error("Error processing unsubscribe request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
