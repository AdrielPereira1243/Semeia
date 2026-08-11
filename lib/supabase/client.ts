import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();
  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
}
