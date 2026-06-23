import { prisma } from "./prisma";

/**
 * Generate a simple UserID for B2C signups
 * Format: WL001, WL002, WL003, etc.
 * Simple, memorable, easy to type
 */
export async function generateUserId(): Promise<string> {
  // Count total B2C users to get next number
  const totalB2CUsers = await prisma.student.count({
    where: { accountType: "PUBLIC" }
  });

  const nextNumber = totalB2CUsers + 1;
  const paddedNumber = String(nextNumber).padStart(3, "0");

  return `WL${paddedNumber}`;
}

/**
 * Verify UserID is unique (should be guaranteed by DB, but checking)
 */
export async function isUserIdTaken(userId: string): Promise<boolean> {
  const existing = await prisma.student.findUnique({
    where: { userId }
  });

  return !!existing;
}
