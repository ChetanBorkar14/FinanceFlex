import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/lib/supabase/client";
import { createServiceSupabaseClient } from "@/lib/supabase/service-client";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import { AccountsList } from "./accounts-list";
import { CreateAccountForm } from "./create-account-form";
import { LogoutButton } from "./logout-button";
import { BudgetCard } from "./budget-card";
import { DashboardStats } from "./dashboard-stats";
import { RecentTransactions } from "./recent-transactions";
import { IncomeExpenseChart } from "./income-expense-chart";
import { CategoryChart } from "./category-chart";
import { MonthlyComparisonChart } from "./monthly-comparison-chart";

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

  // Fetch budget
  const serviceSupabase = createServiceSupabaseClient();
  const { data: budget } = await serviceSupabase
    .from("budgets")
    .select("*")
    .eq("user_id", session.sub)
    .maybeSingle();

  // Fetch transactions for current month to calculate stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  // Fetch last 6 months of transactions for charts
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const { data: monthlyTransactions } = await serviceSupabase
    .from("transactions")
    .select("id, description, category, type, amount, date, account_id")
    .eq("user_id", session.sub)
    .gte("date", startOfMonth.toISOString())
    .lte("date", endOfMonth.toISOString())
    .order("date", { ascending: false })
    .limit(10);

  // Fetch all transactions for last 6 months for charts
  const { data: allTransactions } = await serviceSupabase
    .from("transactions")
    .select("id, description, category, type, amount, date, account_id")
    .eq("user_id", session.sub)
    .gte("date", sixMonthsAgo.toISOString())
    .order("date", { ascending: true });

  const transactions = monthlyTransactions || [];
  const chartTransactions = allTransactions || [];

  // Calculate stats
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const displayName = user.name || "there";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto max-w-6xl ">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
            >
              <img src="/favicon.ico" alt="logo" width={30} height={30} />
              <span className="text-sm font-semibold">FinanceFlex</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground mr-4">
                <div className="h-2 pt-0.5 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>{user.email}</span>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="px-4 py-10">
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
              <p className="text-muted-foreground sm:hidden mt-1">
                Signed in as <span className="font-medium">{user.email}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/transaction/create">
                <Button variant="outline" className="cursor-pointer">
                  New Transaction
                </Button>
              </Link>
              <CreateAccountForm />
            </div>
          </section>

          {/* Stats Cards */}
          <section>
            <DashboardStats
              totalBalance={totalBalance}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              accountsCount={accountsList.length}
            />
          </section>

          {/* Budget and Recent Transactions */}
          <section className="grid gap-6 lg:grid-cols-2">
            <BudgetCard budget={budget} totalExpenses={totalExpenses} />
            <RecentTransactions transactions={transactions} />
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

          {/* Charts Section */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Analytics & Insights</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Visualize your financial data
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <IncomeExpenseChart transactions={chartTransactions} />
              <MonthlyComparisonChart transactions={chartTransactions} />
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <CategoryChart transactions={chartTransactions} type="INCOME" />
              <CategoryChart transactions={chartTransactions} type="EXPENSE" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
