import { createClient } from "@supabase/supabase-js";

function cleanSupabaseUrl(value: string) {
  return value
    .trim()
    .replace("/rest/v1/", "")
    .replace("/rest/v1", "")
    .replace(/\/$/, "");
}

export function getSupabaseAdmin() {
  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawSupabaseUrl || !rawServiceRoleKey) {
    return null;
  }

  return createClient(cleanSupabaseUrl(rawSupabaseUrl), rawServiceRoleKey.trim(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}