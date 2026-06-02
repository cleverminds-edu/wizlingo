#!/usr/bin/env node

/**
 * Email Service Test Script
 *
 * Tests AWS SES email sending capability and configuration.
 * Run to verify email service is working before going to production.
 *
 * Usage:
 *   npm run test:email
 *   npm run test:email -- --recipient test@example.com
 */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const emailProvider = process.env.EMAIL_PROVIDER || "console";
const sesRegion = process.env.AWS_SES_REGION || "us-east-1";
const fromEmail = process.env.EMAIL_FROM_ADDRESS || "noreply@wizlingo.com";
const testRecipient = process.argv[2] || "test@example.com";

interface TestResult {
  name: string;
  status: "✅ PASS" | "⚠️  WARNING" | "❌ FAIL";
  message: string;
  details?: Record<string, any>;
}

const results: TestResult[] = [];

async function testEmailService() {
  console.log("📧 Testing Email Service Configuration...\n");

  // Check environment variables
  console.log("📋 Checking Configuration...");
  const checks = [
    { name: "EMAIL_PROVIDER", value: emailProvider, required: true },
    { name: "AWS_SES_REGION", value: sesRegion, required: true },
    { name: "EMAIL_FROM_ADDRESS", value: fromEmail, required: true },
    { name: "AWS_ACCESS_KEY_ID", value: process.env.AWS_ACCESS_KEY_ID ? "***" : undefined, required: emailProvider === "ses" },
    { name: "AWS_SECRET_ACCESS_KEY", value: process.env.AWS_SECRET_ACCESS_KEY ? "***" : undefined, required: emailProvider === "ses" },
  ];

  for (const check of checks) {
    if (check.required && !check.value) {
      results.push({
        name: check.name,
        status: "❌ FAIL",
        message: `${check.name} is not configured`,
      });
    } else if (check.value) {
      results.push({
        name: check.name,
        status: "✅ PASS",
        message: `${check.name} is configured`,
        details: { value: check.value },
      });
    }
  }

  // If configuration failed, stop here
  const configFailed = results.some(r => r.status === "❌ FAIL");
  if (configFailed) {
    printResults();
    process.exit(1);
  }

  // Test email provider
  console.log("\n🚀 Testing Email Provider...");

  if (emailProvider === "console") {
    console.log("ℹ️ Using console email provider (development mode)");
    results.push({
      name: "Email Provider",
      status: "✅ PASS",
      message: "Console email provider active (emails logged to console)",
      details: {
        provider: "console",
        note: "In production, set EMAIL_PROVIDER=ses",
      },
    });

    // Log sample email
    const sampleEmail = generateSampleEmail(fromEmail, testRecipient);
    console.log("\n📧 Sample Email (would be logged in real execution):");
    console.log(JSON.stringify(sampleEmail, null, 2));
  } else if (emailProvider === "ses") {
    console.log("📤 Testing AWS SES...");

    try {
      const ses = new SESClient({ region: sesRegion });

      // Test sending a sample email
      const testEmail = generateSampleEmail(fromEmail, testRecipient);

      console.log(`\n📮 Sending test email to: ${testRecipient}`);
      console.log(`📤 From: ${fromEmail}`);
      console.log(`📋 Subject: ${testEmail.subject}`);

      const command = new SendEmailCommand({
        Source: fromEmail,
        Destination: {
          ToAddresses: [testRecipient],
        },
        Message: {
          Subject: {
            Data: testEmail.subject,
          },
          Body: {
            Html: {
              Data: testEmail.html,
            },
          },
        },
      });

      const response = await ses.send(command);

      results.push({
        name: "AWS SES",
        status: "✅ PASS",
        message: "Test email sent successfully",
        details: {
          messageId: response.MessageId,
          region: sesRegion,
          recipient: testRecipient,
          from: fromEmail,
          note: "Check spam folder if email doesn't arrive in 5 minutes",
        },
      });

      results.push({
        name: "Email Delivery",
        status: "⚠️  WARNING",
        message: "Email sent to SES - check inbox in 1-5 minutes",
        details: {
          messageId: response.MessageId,
          recipient: testRecipient,
          action: "If not received: check spam folder, verify email is in SES sandbox, or check SES bounce/complaint logs",
        },
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      if (errorMsg.includes("MessageRejected")) {
        results.push({
          name: "AWS SES",
          status: "❌ FAIL",
          message: "Email rejected by SES",
          details: {
            error: errorMsg,
            action: `Verify ${fromEmail} is verified in SES`,
          },
        });
      } else if (errorMsg.includes("InvalidParameterValue")) {
        results.push({
          name: "AWS SES",
          status: "❌ FAIL",
          message: "Invalid email format",
          details: {
            error: errorMsg,
            recipient: testRecipient,
            action: "Use valid email format",
          },
        });
      } else if (errorMsg.includes("Throttling")) {
        results.push({
          name: "AWS SES",
          status: "⚠️  WARNING",
          message: "SES rate limit exceeded",
          details: {
            error: errorMsg,
            action: "Wait a moment and try again",
          },
        });
      } else {
        results.push({
          name: "AWS SES",
          status: "❌ FAIL",
          message: `SES test failed: ${errorMsg}`,
          details: {
            region: sesRegion,
            from: fromEmail,
            recipient: testRecipient,
          },
        });
      }
    }
  }

  // Email service integration test
  console.log("\n🔗 Testing Email Service Integration...");

  try {
    const { sendBadgeEarnedEmail } = await import("@/lib/email-service");
    results.push({
      name: "Email Service Module",
      status: "✅ PASS",
      message: "Email service module loaded successfully",
      details: {
        path: "@/lib/email-service",
        functions: "sendBadgeEarnedEmail, sendMilestoneEmail, sendWeeklySummaryEmail, sendLeaderboardEmail",
      },
    });
  } catch (error) {
    results.push({
      name: "Email Service Module",
      status: "❌ FAIL",
      message: "Failed to load email service module",
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  // Print results
  printResults();

  // Exit with appropriate code
  const failed = results.filter(r => r.status === "❌ FAIL").length;
  process.exit(failed > 0 ? 1 : 0);
}

function generateSampleEmail(from: string, to: string) {
  return {
    from,
    to,
    subject: "🎉 Test Email from WizLingo",
    html: `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666; }
            .button { background: #667eea; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>WizLingo Test Email</h1>
            </div>
            <div class="content">
              <p>Hello!</p>
              <p>This is a test email to verify that the WizLingo email service is working correctly.</p>
              <p>Email sent to: <strong>${to}</strong></p>
              <p>From: <strong>${from}</strong></p>
              <p>Timestamp: <strong>${new Date().toISOString()}</strong></p>
              <p><a href="https://wizlingo.com" class="button">Visit WizLingo</a></p>
            </div>
            <div class="footer">
              <p>&copy; 2026 WizLingo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

function printResults() {
  console.log("\n" + "=".repeat(60));
  console.log("EMAIL SERVICE TEST RESULTS");
  console.log("=".repeat(60) + "\n");

  for (const result of results) {
    console.log(`${result.status} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      for (const [key, value] of Object.entries(result.details)) {
        console.log(`   • ${key}: ${value}`);
      }
    }
    console.log();
  }

  const passed = results.filter(r => r.status === "✅ PASS").length;
  const warnings = results.filter(r => r.status === "⚠️  WARNING").length;
  const failed = results.filter(r => r.status === "❌ FAIL").length;

  console.log("=".repeat(60));
  console.log(`SUMMARY: ${passed} passed, ${warnings} warnings, ${failed} failed`);
  console.log("=".repeat(60) + "\n");

  if (failed > 0) {
    console.log("❌ Email service test FAILED. Please fix the issues above.\n");
  } else if (warnings > 0) {
    console.log("⚠️  Email service test completed with warnings. Review above.\n");
  } else {
    console.log("✅ Email service test PASSED. Ready to use in production.\n");
  }
}

// Run tests
testEmailService().catch((error) => {
  console.error("❌ Test script error:", error);
  process.exit(1);
});
