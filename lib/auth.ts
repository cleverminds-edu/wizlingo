import jwt from "jsonwebtoken";
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

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function makeAuthCookie(token: string): string {
  const maxAge = 8 * 60 * 60;
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict`;
}

export function clearAuthCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`;
}
