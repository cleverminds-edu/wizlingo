// Admin API for email analytics reporting

import { NextRequest, NextResponse } from "next/server";
import { generateEmailReport } from "@/lib/email-analytics";

/**
 * POST /api/admin/email-analytics
 * Generate email analytics report for date range
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const report = await generateEmailReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating email report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
