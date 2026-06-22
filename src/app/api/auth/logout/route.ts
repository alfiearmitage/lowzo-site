import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACCESS_COOKIE = "lowzo_access_token";
const REFRESH_COOKIE = "lowzo_refresh_token";
const USER_ID_COOKIE = "lowzo_user_id";
const USER_EMAIL_COOKIE = "lowzo_user_email";
const PUBLIC_LOGIN_COOKIE = "lowzo_logged_in";

function getCleanSiteUrl(request: Request) {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

  if (
    envSiteUrl &&
    !envSiteUrl.includes("localhost") &&
    !envSiteUrl.includes("127.0.0.1")
  ) {
    return envSiteUrl;
  }

  const host = request.headers.get("host") || "";
  const protocol =
    request.headers.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  if (
    host &&
    !host.includes("localhost") &&
    !host.includes("127.0.0.1")
  ) {
    return `${protocol}://${host}`;
  }

  return "http://192.168.0.51:3000";
}

function clearAuthCookies(response: NextResponse) {
  const options = {
    path: "/",
    maxAge: 0,
  };

  response.cookies.set(ACCESS_COOKIE, "", options);
  response.cookies.set(REFRESH_COOKIE, "", options);
  response.cookies.set(USER_ID_COOKIE, "", options);
  response.cookies.set(USER_EMAIL_COOKIE, "", options);
  response.cookies.set(PUBLIC_LOGIN_COOKIE, "", options);
}

export async function POST(request: Request) {
  const siteUrl = getCleanSiteUrl(request);

  const response = NextResponse.redirect(`${siteUrl}/login`, {
    status: 303,
  });

  clearAuthCookies(response);

  return response;
}

export async function GET(request: Request) {
  const siteUrl = getCleanSiteUrl(request);

  const response = NextResponse.redirect(`${siteUrl}/login`, {
    status: 303,
  });

  clearAuthCookies(response);

  return response;
}