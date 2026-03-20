import { NextResponse } from "next/server";
import { getDemoUserById } from "@/server/demo-auth";
import { SESSION_MAX_AGE_SEC, STOCKPRO_SESSION_COOKIE } from "@/lib/auth-session";

/** Connexion rapide démo par id utilisateur (développement / démo uniquement). */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
  const userId = (body as { userId?: number }).userId;
  if (typeof userId !== "number" || !Number.isInteger(userId)) {
    return NextResponse.json({ error: "userId invalide" }, { status: 400 });
  }

  const user = getDemoUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
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
