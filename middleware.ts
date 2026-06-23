import { NextResponse, type NextRequest } from "next/server";

const BETA_COOKIE = "lowzo_beta_access";

function isPublicPath(pathname: string) {
  if (pathname === "/beta-login") {
    return true;
  }

  if (pathname.startsWith("/api/beta-login")) {
    return true;
  }

  if (pathname.startsWith("/_next")) {
    return true;
  }

  if (pathname === "/favicon.ico") {
    return true;
  }

  if (pathname === "/robots.txt") {
    return true;
  }

  if (pathname === "/sitemap.xml") {
    return true;
  }

  if (
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".ico")
  ) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const betaPassword = process.env.LOWZO_BETA_PASSWORD;

  if (!betaPassword) {
    return NextResponse.next();
  }

  const hasBetaAccess =
    request.cookies.get(BETA_COOKIE)?.value === "granted";

  if (hasBetaAccess) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();

  loginUrl.pathname = "/beta-login";
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};