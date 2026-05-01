import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createClient } from "@/lib/supabase/server";

const PROTECTED_SEGMENTS = new Set([
  "dashboard",
  "pos",
  "produits",
  "stock",
  "clients",
  "fournisseurs",
  "achats",
  "facturation",
  "retours",
  "rapports",
  "parametres",
  "profil",
]);

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/") return true;
  const seg = pathname.replace(/^\//, "").split("/")[0] ?? "";
  return PROTECTED_SEGMENTS.has(seg);
}

export async function middleware(request: NextRequest) {
  // Update session for Supabase
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return response;
  }

  // Get session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (pathname === "/login") {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  if (isProtectedPath(pathname) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
