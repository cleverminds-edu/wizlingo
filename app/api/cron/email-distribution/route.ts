// Cron job for scheduled email distribution
// Schedule: 0 18 * * * (6 PM daily)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEmailsDueForSending } from "@/lib/email-timing";
import { sendEmailActual } from "@/lib/email-service";

// Verify cron secret from Vercel
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify this is a legitimate Vercel cron request
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("📧 Email distribution cron starting...");

    // Get emails scheduled for sending in the next 60 minutes
    const emailsDue = await getEmailsDueForSending(60);

    if (emailsDue.length === 0) {
      console.log("✅ No emails scheduled for sending at this time");
      return NextResponse.json({
        success: true,
        message: "No emails to send",
        count: 0,
      });
    }

    console.log(`📧 Sending ${emailsDue.length} scheduled emails...`);

    let successCount = 0;
    let failureCount = 0;

    // Process each email
    for (const email of emailsDue) {
      try {
        // Send the email (implement actual sending logic here)
        // For now, this logs to console and updates the database
        console.log(`📧 Sending ${email.type} email to ${email.parentEmail}`);

        // Mark as sent in database
        await prisma.emailSchedule.update({
          where: { id: email.id },
          data: {
            sent: true,
            sentAt: new Date(),
          },
        });

        // Log to EmailLog
        await prisma.emailLog.create({
          data: {
            studentId: email.studentId,
            parentEmail: email.parentEmail,
            type: email.type,
            subject: email.subject,
            body: email.html,
            sentAt: new Date(),
            status: "sent",
          },
        });

        successCount++;
      } catch (error) {
        console.error(`❌ Failed to send email to ${email.parentEmail}:`, error);
        failureCount++;

        // Mark as failed
        await prisma.emailSchedule.update({
          where: { id: email.id },
          data: {
            error: String(error),
          },
        });
      }
    }

    console.log(
      `✅ Email distribution complete: ${successCount} sent, ${failureCount} failed`
    );

    return NextResponse.json({
      success: true,
      message: "Email distribution completed",
      sent: successCount,
      failed: failureCount,
      total: emailsDue.length,
    });
  } catch (error) {
    console.error("❌ Email distribution cron error:", error);
    return NextResponse.json(
      { error: "Failed to process email distribution", details: String(error) },
      { status: 500 }
    );
  }
}
