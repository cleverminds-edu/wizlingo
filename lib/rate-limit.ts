// Simple in-memory rate limiter
// For production, upgrade to Redis-based solution

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitRecord>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; resetAt: Date } {
  const now = Date.now();
  const record = store.get(key);

  // Clean up expired records
  if (record && now >= record.resetTime) {
    store.delete(key);
  }

  const current = store.get(key);

  if (!current) {
    store.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      resetAt: new Date(now + windowMs),
    };
  }

  if (current.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(current.resetTime),
    };
  }

  current.count += 1;
  return {
    success: true,
    remaining: limit - current.count,
    resetAt: new Date(current.resetTime),
  };
}

// Preset limits
export const RATE_LIMITS = {
  OTP: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 min
  FEEDBACK: { limit: 50, windowMs: 60 * 60 * 1000 }, // 50 requests per hour
  LOGIN: { limit: 10, windowMs: 15 * 60 * 1000 }, // 10 requests per 15 min
  API_DEFAULT: { limit: 100, windowMs: 60 * 1000 }, // 100 requests per minute
};

// Cleanup old records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now >= record.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);
