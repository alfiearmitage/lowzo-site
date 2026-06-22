import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACCESS_COOKIE = "lowzo_access_token";
const USER_ID_COOKIE = "lowzo_user_id";
const USER_EMAIL_COOKIE = "lowzo_user_email";

export async function GET() {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value || "";
  const userId = cookieStore.get(USER_ID_COOKIE)?.value || "";
  const userEmail = cookieStore.get(USER_EMAIL_COOKIE)?.value || "";

  const isLoggedIn = Boolean(accessToken && userId);

  const response = NextResponse.json({
    loggedIn: isLoggedIn,
    user: isLoggedIn
      ? {
          id: userId,
          email: userEmail || "Logged in user",
        }
      : null,
  });

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}