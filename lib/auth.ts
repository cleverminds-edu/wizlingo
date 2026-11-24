import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export type UserRole = "student" | "teacher" | "admin";

export interface AuthPayload {
  id: string;
  role: UserRole;
  schoolId?: string;
  classId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "reading_app_token";

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT token functions
export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function createToken(studentId: string): string {
  return jwt.sign({ studentId }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function verifyStudentToken(token: string): { studentId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { studentId: string };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export function makeAuthCookie(token: string): string {
  const maxAge = 8 * 60 * 60;
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict`;
}

export function clearAuthCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`;
}

// Server-only (route handlers / server components): reads the school-portal login cookie.
// Restored from production — the July rewrite had stubbed this to always return null,
// which logged out every cookie-based school session. Clients use lib/auth-client.ts.
export async function getSession(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
