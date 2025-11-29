import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { createServiceSupabaseClient } from "@/lib/supabase/service-client";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import { CreateTransactionForm } from "./create-transaction-form";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await verifySessionToken(token);
  if (!session?.sub) {
    redirect("/login");
  }

  return session.sub;
}

export default async function CreateTransactionPage() {
  const userId = await getAuthenticatedUserId();
  const supabase = createServiceSupabaseClient();

  // Fetch user's accounts
  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("id, name, type, balance, is_default")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (accountsError) {
    console.error("Error fetching accounts:", accountsError);
  }

  const accountsList = accounts || [];

  if (accountsList.length === 0) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-foreground">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">No Accounts Found</h1>
            <p className="text-muted-foreground mb-6">
              You need to create an account before adding transactions.
            </p>
            <Link href="/dashboard">
              <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
                Go to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Create Transaction</h1>
            <p className="text-muted-foreground mt-1">
              Add a new income or expense transaction
            </p>
          </div>
          <Link href="/dashboard">
            <button className="rounded-lg border border-border bg-background px-4 py-2 hover:bg-accent">
              Back to Dashboard
            </button>
          </Link>
        </div>

        <CreateTransactionForm accounts={accountsList} />
      </div>
    </div>
  );
}
