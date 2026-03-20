import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STOCKPRO_SESSION_COOKIE } from "@/lib/auth-session";

const PUBLIC_PATHS = new Set(["/login"]);

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.has(pathname)) {
    const session = request.cookies.get(STOCKPRO_SESSION_COOKIE)?.value;
    if (session && pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(STOCKPRO_SESSION_COOKIE)?.value;
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
