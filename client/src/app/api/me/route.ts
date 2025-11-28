import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import { createSupabaseClient } from "@/lib/supabase/client";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return Response.json({ user: null });
    }

    const session = await verifySessionToken(token);
    if (!session?.sub) {
      return Response.json({ user: null });
    }

    const supabase = createSupabaseClient(token);
    const { data: user, error } = await supabase
      .from("users")
      .select("user_id, name, email")
      .eq("user_id", session.sub)
      .maybeSingle();

    if (error || !user) {
      return Response.json({ user: null });
    }

    return Response.json({ user });
  } catch (error) {
    console.error("Failed to load user profile", error);
    return Response.json({ user: null });
  }
}

