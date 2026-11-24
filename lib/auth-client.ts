/**
 * Client-side authentication utilities
 * For use in browser/client components only
 */

const TOKEN_KEY = 'token'

/**
 * Get token from localStorage (client-side only)
 */
export function getTokenFromStorage(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

/**
 * Save token to localStorage (client-side only)
 */
export function saveTokenToStorage(token: string): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    console.error('Failed to save token')
  }
}

/**
 * Remove token from localStorage (client-side only)
 */
export function clearTokenFromStorage(): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    console.error('Failed to clear token')
  }
}

/**
 * Check if user is authenticated (client-side only)
 */
export function isAuthenticated(): boolean {
  return getTokenFromStorage() !== null
}
