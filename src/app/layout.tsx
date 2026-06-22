import type { Metadata } from "next";
import { cookies } from "next/headers";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

export const dynamic = "force-dynamic";

const ACCESS_COOKIE = "lowzo_access_token";
const USER_ID_COOKIE = "lowzo_user_id";

export const metadata: Metadata = {
  title: "Lowzo | Lower Price, Zero Hassle",
  description:
    "Lowzo helps you search for better prices across online marketplaces.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value || "";
  const userId = cookieStore.get(USER_ID_COOKIE)?.value || "";

  const isLoggedIn = Boolean(accessToken && userId);

  return (
    <html lang="en">
      <body>
        <AuthProvider initialLoggedIn={isLoggedIn}>{children}</AuthProvider>
      </body>
    </html>
  );
}