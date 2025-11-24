import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/lib/supabase/client";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session";

const stats = [
  { label: "Total Balance", value: "$128,450", change: "+4.8%" },
  { label: "Monthly Cashflow", value: "$9,320", change: "+2.1%" },
  { label: "Investments", value: "$53,120", change: "-1.3%" },
];

const activity = [
  { title: "Weekly budget review", detail: "5 tasks remaining", status: "In progress" },
  { title: "Upload vendor invoices", detail: "2 new uploads", status: "Waiting" },
  { title: "Approve payroll", detail: "Next run: 25 Nov", status: "Scheduled" },
];

const transactions = [
  { name: "Stripe payout", amount: "+$4,250", time: "Today • 10:42" },
  { name: "Marketing Stack", amount: "-$640", time: "Yesterday • 17:20" },
  { name: "Office Lease", amount: "-$2,400", time: "Yesterday • 09:05" },
  { name: "Angel investment", amount: "+$25,000", time: "Mon • 14:10" },
];

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
  const { data: user, error } = await supabase
    .from("users")
    .select("user_id, name, email")
    .eq("user_id", session.sub)
    .maybeSingle();

  if (error || !user) {
    redirect("/login");
  }

  const displayName = user.name || "there";

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-6xl space-y-10">
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
            <Button variant="outline">Share report</Button>
            <Button>New transfer</Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur"
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
              <p className="mt-2 text-sm text-primary">{stat.change} vs last week</p>
              <div className="mt-6 h-1 rounded-full bg-muted">
                <span className="block h-full w-3/4 rounded-full bg-primary" />
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Latest transactions</h2>
              <Button variant="ghost" className="text-sm">
                View all
              </Button>
            </div>
            <ul className="mt-4 divide-y divide-border/70">
              {transactions.map((transaction) => (
                <li key={transaction.name} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{transaction.name}</p>
                    <p className="text-sm text-muted-foreground">{transaction.time}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      transaction.amount.startsWith("+") ? "text-emerald-500" : "text-destructive"
                    }`}
                  >
                    {transaction.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-6 shadow-sm backdrop-blur">
            <h2 className="text-xl font-semibold">Focus items</h2>
            <p className="text-sm text-muted-foreground">
              A quick stack of the most important workflows for today.
            </p>
            <div className="mt-6 space-y-4">
              {activity.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border/70 bg-background/70 p-4"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                  <span className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-border/70 bg-card/30 p-8 text-center shadow-sm backdrop-blur">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Coming soon
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Goals & Scenario planning</h2>
          <p className="mt-2 text-muted-foreground">
            Compare growth scenarios, plan multi-account transfers, and export a board-ready view.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline">Notify me</Button>
            <Button>Try beta</Button>
          </div>
        </section>
      </div>
    </div>
  );
}

