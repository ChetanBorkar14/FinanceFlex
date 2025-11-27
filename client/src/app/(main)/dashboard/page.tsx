import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/lib/supabase/client";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import { AccountsList } from "./accounts-list";
import { CreateAccountForm } from "./create-account-form";
import { LogoutButton } from "./logout-button";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await verifySessionToken(token);

  if (!session?.sub) {
    redirect("/login");
  }

  const supabase = createSupabaseClient(token);
  
  // Fetch user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("user_id, name, email")
    .eq("user_id", session.sub)
    .maybeSingle();

  if (userError || !user) {
    redirect("/login");
  }

  // Fetch accounts for this user
  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("id, name, type, balance, is_default, created_at, updated_at")
    .eq("user_id", session.sub)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (accountsError) {
    console.error("Error fetching accounts:", accountsError);
  }

  const accountsList = accounts || [];
  const totalBalance = accountsList.reduce(
    (sum, account) => sum + Number(account.balance || 0),
    0
  );

  const displayName = user.name || "there";

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-6xl space-y-10">
        {/* Header */}
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Overview
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Hey {displayName}, here&apos;s your finance hub
            </h1>
            <p className="text-muted-foreground">
              Signed in as <span className="font-medium">{user.email}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/transaction/create">
              <Button variant="outline">New Transaction</Button>
            </Link>
            <CreateAccountForm />
            <LogoutButton />
          </div>
        </section>

        {/* Total Balance Card */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur md:col-span-3">
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <p className="mt-3 text-4xl font-semibold">
              ₹{totalBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Across {accountsList.length} account{accountsList.length !== 1 ? "s" : ""}
            </p>
          </div>
        </section>

        {/* Accounts List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Your Accounts</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your financial accounts
              </p>
            </div>
          </div>
          <AccountsList accounts={accountsList} />
        </section>
      </div>
    </div>
  );
}
