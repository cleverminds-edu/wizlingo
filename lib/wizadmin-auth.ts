import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function getWizAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("wizadmin_token")?.value;
  if (!token) return false;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    return payload.role === "wizadmin";
  } catch {
    return false;
  }
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
