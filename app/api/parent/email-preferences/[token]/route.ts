// API endpoint for parent email preference management

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/parent/email-preferences/[token]
 * Retrieve parent's email preferences by token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  try {
    const prefs = await prisma.parentEmailPreference.findUnique({
      where: { unsubscribeToken: token },
      select: {
        frequency: true,
        badgeEarned: true,
        weeklyProgress: true,
        monthlyMilestone: true,
        schoolRanking: true,
        sendTime: true,
        timezone: true,
      },
    });

    if (!prefs) {
      return NextResponse.json(
        { error: "Preferences not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(prefs);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/parent/email-preferences/[token]
 * Update parent's email preferences by token
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  try {
    const body = await request.json();

    const updated = await prisma.parentEmailPreference.update({
      where: { unsubscribeToken: token },
      data: {
        frequency: body.frequency || "immediate",
        badgeEarned: body.badgeEarned ?? true,
        weeklyProgress: body.weeklyProgress ?? true,
        monthlyMilestone: body.monthlyMilestone ?? true,
        schoolRanking: body.schoolRanking ?? true,
        sendTime: body.sendTime || "6pm",
        timezone: body.timezone || "Asia/Kolkata",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
