import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDemoUserById } from "@/server/demo-auth";
import { STOCKPRO_SESSION_COOKIE } from "@/lib/auth-session";

export async function GET() {
  const jar = await cookies();
  const raw = jar.get(STOCKPRO_SESSION_COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ user: null });
  }
  const id = parseInt(raw, 10);
  if (Number.isNaN(id) || id < 1) {
    return NextResponse.json({ user: null });
  }
  const user = getDemoUserById(id);
  return NextResponse.json({ user });
}
