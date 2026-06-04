import { z } from 'zod';

// Common schemas
export const idSchema = z.string().uuid('Invalid ID format');
export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number');
export const emailSchema = z.string().email('Invalid email');
export const positiveIntSchema = z.number().int().positive();

// Auth
export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(4, 'OTP must be 4 digits').regex(/^\d+$/, 'OTP must be numeric'),
});

export const verifyOtpWithProfileSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(4, 'OTP must be 4 digits').regex(/^\d+$/, 'OTP must be numeric'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  schoolId: idSchema,
  classId: idSchema,
});

// Feedback
export const feedbackSchema = z.object({
  studentId: idSchema,
  sessionType: z.enum(['reading', 'speaking']),
  rating: z.number().int().min(1).max(5),
  selectedIssues: z.array(z.string()).optional(),
  comment: z.string().max(1000).optional(),
});

// Onboarding
export const onboardingCompleteSchema = z.object({
  studentId: idSchema,
});

// Progress
export const progressQuerySchema = z.object({
  studentId: idSchema,
});

// Reading Session
export const readingSessionSchema = z.object({
  studentId: idSchema,
  passageId: idSchema,
  wordsPerMinute: positiveIntSchema,
  accuracy: z.number().min(0).max(100),
  feedback: z.string().optional(),
});

// Speaking Session
export const speakingSessionSchema = z.object({
  studentId: idSchema,
  characterId: idSchema,
  fluencyScore: z.number().min(0).max(100),
  wordsPerMinute: positiveIntSchema,
  pronunciation: z.number().min(0).max(100),
  feedback: z.string().optional(),
});

// Badge
export const badgeShareSchema = z.object({
  studentId: idSchema,
  format: z.enum(['image', 'text']).optional(),
});

// Admin
export const adminStatsQuerySchema = z.object({
  days: z.number().int().min(1).max(365).optional().default(7),
});

export const adminDailyActiveQuerySchema = z.object({
  days: z.number().int().min(1).max(365).optional().default(30),
});

export const adminFeedbackQuerySchema = z.object({
  days: z.number().int().min(1).max(365).optional().default(7),
});

// Helper to validate request body
export async function validateBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      return { success: false, error: errors };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'Invalid JSON' };
  }
}

// Helper to validate query parameters
export function validateQuery<T>(
  query: Record<string, string | string[]>,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(query);

  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    return { success: false, error: errors };
  }

  return { success: true, data: result.data };
}
