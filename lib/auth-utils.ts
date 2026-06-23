import { getSession } from "@/lib/auth";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  studentId?: string;
  id?: string;
  role?: string;
  isJwt: boolean;
}

/**
 * Get auth from both session (cookies) and Authorization header (JWT)
 * B2C users use JWT tokens in Authorization header
 * School users use session-based auth (cookies)
 */
export async function getAuth(request: Request): Promise<AuthPayload | null> {
  // Try session first (cookie-based auth for school users)
  const session = await getSession();
  if (session) {
    return {
      ...session,
      isJwt: false,
    };
  }

  // Try JWT from Authorization header (for B2C users with localStorage tokens)
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const secret = process.env.JWT_SECRET || "secret";
      const verified = jwt.verify(token, secret) as AuthPayload;
      return {
        ...verified,
        isJwt: true,
      };
    } catch (error) {
      console.error("Auth: JWT verification failed", error instanceof Error ? error.message : error);
      return null;
    }
  }

  return null;
}

/**
 * Get student ID from auth payload
 */
export function getStudentIdFromAuth(auth: AuthPayload): string {
  return auth.studentId || auth.id || "";
}
