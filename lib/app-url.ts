// Centralized app URL helper to avoid hardcoded domains
export function getAppUrl(): string {
  // For client-side code
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  }

  // For server-side code
  return process.env.NEXT_PUBLIC_APP_URL || 'https://wizlingo.app';
}

// For Next.js API routes and server components
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // In production, use NEXT_PUBLIC_APP_URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Fallback for development
  return 'http://localhost:3000';
}
