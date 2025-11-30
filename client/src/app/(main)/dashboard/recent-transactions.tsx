"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: string;
  account_id: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

function formatAmount(value: number, type: Transaction["type"]) {
  const formatted = value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
  return type === "EXPENSE" ? `- ${formatted}` : `+ ${formatted}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 5);

  if (recentTransactions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Recent Transactions</h3>
        <p className="text-center text-sm text-muted-foreground py-8">
          No recent transactions
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        {recentTransactions.length > 0 && recentTransactions[0]?.account_id && (
          <Link
            href={`/account/${recentTransactions[0].account_id}`}
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        )}
      </div>
      <div className="space-y-3">
        {recentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div
                className={`rounded-full p-2 ${
                  transaction.type === "INCOME"
                    ? "bg-emerald-500/20"
                    : "bg-red-500/20"
                }`}
              >
                {transaction.type === "INCOME" ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium capitalize">
                  {transaction.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(transaction.date)} • {transaction.category}
                </p>
              </div>
            </div>
            <p
              className={`text-sm font-semibold ${
                transaction.type === "INCOME"
                  ? "text-emerald-600 dark:text-emerald-500"
                  : "text-red-600 dark:text-red-500"
              }`}
            >
              {formatAmount(transaction.amount, transaction.type)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

