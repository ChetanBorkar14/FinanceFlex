import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase service role environment variables.");
}

/**
 * Creates a Supabase client with the service role key.
 * Use this only on the server (e.g., API routes) — never expose to the client.
 * @returns SupabaseClient
 */
export function createServiceSupabaseClient(): SupabaseClient {
  return createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
