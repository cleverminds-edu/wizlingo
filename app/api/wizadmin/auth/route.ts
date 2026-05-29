import jwt from "jsonwebtoken";

const COOKIE = "wizadmin_token";

export async function POST(request: Request) {
  const { secret } = await request.json();
  if (!secret || secret !== process.env.WIZADMIN_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  const token = jwt.sign({ role: "wizadmin" }, process.env.JWT_SECRET!, { expiresIn: "12h" });
  const cookie = `${COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${12 * 3600}; SameSite=Strict`;
  return Response.json({ ok: true }, { headers: { "Set-Cookie": cookie } });
}

export async function DELETE() {
  const cookie = `${COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`;
  return Response.json({ ok: true }, { headers: { "Set-Cookie": cookie } });
}
