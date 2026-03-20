import { NextResponse } from "next/server";
import { verifyDemoPassword } from "@/server/demo-auth";
import { SESSION_MAX_AGE_SEC, STOCKPRO_SESSION_COOKIE } from "@/lib/auth-session";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const { email, password } = body as { email?: string; password?: string };
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }

  const user = verifyDemoPassword(email, password);
  if (!user) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  const res = NextResponse.json({ user });
  res.cookies.set(STOCKPRO_SESSION_COOKIE, String(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
  return res;
}
