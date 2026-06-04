// Email open tracking pixel
// Invisible 1x1 pixel that logs when email is opened

import { NextRequest, NextResponse } from "next/server";
import { trackEmailOpen } from "@/lib/email-analytics";

// Create a 1x1 transparent PNG pixel
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

export async function GET(
  request: NextRequest,
  { params }: { params: { emailId: string } }
) {
  const { emailId } = params;

  try {
    // Track the open
    await trackEmailOpen(emailId);

    // Return a 1x1 transparent pixel
    return new NextResponse(PIXEL, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Error tracking email open:", error);

    // Return pixel anyway (don't break the email)
    return new NextResponse(PIXEL, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }
}
