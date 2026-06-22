import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACCESS_COOKIE = "lowzo_access_token";
const REFRESH_COOKIE = "lowzo_refresh_token";
const USER_ID_COOKIE = "lowzo_user_id";
const USER_EMAIL_COOKIE = "lowzo_user_email";
const PUBLIC_LOGIN_COOKIE = "lowzo_logged_in";

function getSupabaseServerClient() {
  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawSupabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
  }

  if (!rawSupabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  }

  const supabaseUrl = rawSupabaseUrl
    .trim()
    .replace("/rest/v1/", "")
    .replace("/rest/v1", "")
    .replace(/\/$/, "");

  return createClient(supabaseUrl, rawSupabaseKey.trim(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

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

function getSafeNext(value: string | null) {
  if (!value) {
    return "/account";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }

  if (value.includes("localhost") || value.includes("127.0.0.1")) {
    return "/account";
  }

  return value;
}

function setAuthCookies(
  response: NextResponse,
  session: {
    access_token: string;
    refresh_token: string;
  },
  user: {
    id: string;
    email?: string;
  }
) {
  const privateCookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };

  const publicCookieOptions = {
    httpOnly: false,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };

  response.cookies.set(ACCESS_COOKIE, session.access_token, privateCookieOptions);
  response.cookies.set(REFRESH_COOKIE, session.refresh_token, privateCookieOptions);
  response.cookies.set(USER_ID_COOKIE, user.id, privateCookieOptions);
  response.cookies.set(USER_EMAIL_COOKIE, user.email || "", privateCookieOptions);

  response.cookies.set(PUBLIC_LOGIN_COOKIE, "1", publicCookieOptions);
}

function redirectWithError(request: Request, error: string, nextPath: string) {
  const siteUrl = getCleanSiteUrl(request);
  const url = new URL("/login", siteUrl);

  url.searchParams.set("error", error);
  url.searchParams.set("next", getSafeNext(nextPath));

  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let email = "";
    let password = "";
    let nextPath = "/account";

    if (contentType.includes("application/json")) {
      const body = await request.json();

      email = String(body.email || "").trim().toLowerCase();
      password = String(body.password || "");
      nextPath = getSafeNext(String(body.next || "/account"));
    } else {
      const formData = await request.formData();

      email = String(formData.get("email") || "").trim().toLowerCase();
      password = String(formData.get("password") || "");
      nextPath = getSafeNext(String(formData.get("next") || "/account"));
    }

    if (!email) {
      return redirectWithError(request, "Enter your email.", nextPath);
    }

    if (!password) {
      return redirectWithError(request, "Enter your password.", nextPath);
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirectWithError(request, error.message, nextPath);
    }

    if (!data.session || !data.user) {
      return redirectWithError(
        request,
        "Login worked but no session was returned.",
        nextPath
      );
    }

    const siteUrl = getCleanSiteUrl(request);
    const redirectUrl = new URL(nextPath, siteUrl);

    const response = NextResponse.redirect(redirectUrl, {
      status: 303,
    });

    setAuthCookies(response, data.session, data.user);

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown login error.";

    return redirectWithError(request, `Login failed: ${message}`, "/account");
  }
}