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

function getSafeNext(value: string | null) {
  if (!value) {
    return "/account";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }

  if (value.includes("localhost")) {
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
  const secureCookieOptions = {
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

  response.cookies.set(ACCESS_COOKIE, session.access_token, secureCookieOptions);
  response.cookies.set(REFRESH_COOKIE, session.refresh_token, secureCookieOptions);
  response.cookies.set(USER_ID_COOKIE, user.id, secureCookieOptions);
  response.cookies.set(USER_EMAIL_COOKIE, user.email || "", secureCookieOptions);

  response.cookies.set(PUBLIC_LOGIN_COOKIE, "1", publicCookieOptions);
}

function signupErrorRedirect(request: Request, error: string, nextPath: string) {
  const url = new URL("/signup", request.url);
  url.searchParams.set("error", error);
  url.searchParams.set("next", nextPath);

  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let email = "";
    let password = "";
    let confirmPassword = "";
    let humanCheck = false;
    let nextPath = "/account";
    let wantsJson = false;

    if (contentType.includes("application/json")) {
      wantsJson = true;
      const body = await request.json();

      email = String(body.email || "").trim().toLowerCase();
      password = String(body.password || "");
      confirmPassword = String(body.confirmPassword || "");
      humanCheck = Boolean(body.humanCheck);
      nextPath = getSafeNext(String(body.next || "/account"));
    } else {
      const formData = await request.formData();

      email = String(formData.get("email") || "").trim().toLowerCase();
      password = String(formData.get("password") || "");
      confirmPassword = String(formData.get("confirmPassword") || "");
      humanCheck = String(formData.get("humanCheck") || "") === "on";
      nextPath = getSafeNext(String(formData.get("next") || "/account"));
    }

    if (!email) {
      if (wantsJson) {
        return NextResponse.json({ error: "Enter your email." }, { status: 400 });
      }

      return signupErrorRedirect(request, "Enter your email.", nextPath);
    }

    if (!email.includes("@")) {
      if (wantsJson) {
        return NextResponse.json(
          { error: "Enter a valid email address." },
          { status: 400 }
        );
      }

      return signupErrorRedirect(request, "Enter a valid email address.", nextPath);
    }

    if (password.length < 8) {
      if (wantsJson) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters." },
          { status: 400 }
        );
      }

      return signupErrorRedirect(
        request,
        "Password must be at least 8 characters.",
        nextPath
      );
    }

    if (password !== confirmPassword) {
      if (wantsJson) {
        return NextResponse.json(
          { error: "Passwords do not match." },
          { status: 400 }
        );
      }

      return signupErrorRedirect(request, "Passwords do not match.", nextPath);
    }

    if (!humanCheck) {
      if (wantsJson) {
        return NextResponse.json(
          { error: "Please confirm you are not a bot." },
          { status: 400 }
        );
      }

      return signupErrorRedirect(
        request,
        "Please confirm you are not a bot.",
        nextPath
      );
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (wantsJson) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return signupErrorRedirect(request, error.message, nextPath);
    }

    if (data.user?.identities?.length === 0) {
      const errorMessage =
        "This email may already be registered. Try logging in instead.";

      if (wantsJson) {
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }

      return signupErrorRedirect(request, errorMessage, nextPath);
    }

    if (data.session && data.user) {
      if (wantsJson) {
        const response = NextResponse.json({
          message: "Account created and logged in.",
          user: {
            id: data.user.id,
            email: data.user.email,
          },
        });

        setAuthCookies(response, data.session, data.user);

        return response;
      }

      const response = NextResponse.redirect(new URL(nextPath, request.url), {
        status: 303,
      });

      setAuthCookies(response, data.session, data.user);

      return response;
    }

    if (wantsJson) {
      return NextResponse.json({
        message: "Account created. Please log in now.",
      });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", nextPath);
    loginUrl.searchParams.set("message", "Account created. Please log in now.");

    return NextResponse.redirect(loginUrl, { status: 303 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown signup error.";

    return NextResponse.json(
      {
        error: `Signup failed: ${message}`,
      },
      { status: 500 }
    );
  }
}