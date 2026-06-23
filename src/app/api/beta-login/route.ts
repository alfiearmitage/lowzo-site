import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BETA_COOKIE = "lowzo_beta_access";

function getSafeNext(value: string | null) {
  if (!value) {
    return "/";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  if (value.startsWith("/api/")) {
    return "/";
  }

  if (value.startsWith("/beta-login")) {
    return "/";
  }

  return value;
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const enteredPassword = String(formData.get("password") || "");
  const nextPath = getSafeNext(String(formData.get("next") || "/"));
  const correctPassword = process.env.LOWZO_BETA_PASSWORD || "";

  if (!correctPassword) {
    const url = new URL("/beta-login", request.url);

    url.searchParams.set(
      "error",
      "Beta password has not been set on the server."
    );

    return NextResponse.redirect(url, { status: 303 });
  }

  if (enteredPassword !== correctPassword) {
    const url = new URL("/beta-login", request.url);

    url.searchParams.set("error", "Wrong beta password.");
    url.searchParams.set("next", nextPath);

    return NextResponse.redirect(url, { status: 303 });
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), {
    status: 303,
  });

  response.cookies.set(BETA_COOKIE, "granted", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}